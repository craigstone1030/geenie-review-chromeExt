/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { TRPCError } from "@trpc/server";
import { getFileContent, getFileId, getGoogleDrive } from "~/server/google";
import { getReviews, type TProductInfo, type IReview } from "./reviews";
import { openai } from "./openai";
import type { Question } from "@prisma/client";
import { formatContent } from "~/pages/api/a/[asin]";
import { onlyAllowedIds } from "~/utils/examples";
import { latestVersion } from "./constants";

const MAX_REPORTS = 10;

export default createTRPCRouter({
  getAllReports: protectedProcedure
    .input(z.number().transform((n) => (n <= 0 ? n : n - 1)))
    .query(async ({ ctx, input }) => {
      const reports = await ctx.prisma.userSearch.findMany({
        where: {
          userId: ctx?.session?.user.id,
        },
        take: MAX_REPORTS,
        skip: input * MAX_REPORTS,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          search: true,
        },
      });
      const countOfEachAsin = reports.reduce((acc, curr) => {
        if (acc[curr.search.asin]) {
          acc[curr.search.asin] += 1;
        } else {
          acc[curr.search.asin] = 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const addedAsins = new Set<string>();
      const uniqueReportsWithAsin = reports
        .map((report) => {
          if (addedAsins.has(report.search.asin)) {
            return undefined as unknown as (typeof reports)[number] & {
              count: number;
            };
          }
          addedAsins.add(report.search.asin);
          return {
            ...report,
            count: countOfEachAsin[report.search.asin],
          };
        })
        .filter(Boolean);
      return uniqueReportsWithAsin;
    }),
  getReport: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    if (
      (!ctx.session || !ctx.session.user) &&
      !onlyAllowedIds.includes(input)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You have to be logged in to do that",
      });
    }
    return await ctx.prisma.search.findUnique({
      where: {
        id: input,
      },
    });
  }),
  fetch: protectedProcedure
    .input(
      z.object({
        asin: z.string().min(3),
        kind: z
          .enum(["Amazon URL", "Split"])
          .nullish()
          .transform(() => "Split"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx?.session?.user.role !== "ADMIN") {
        const searches = await ctx.prisma.userSearch.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 30,
        });
        if (!ctx.session.user.subscriptionId && searches.length >= 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have reached your search limit",
          });
        }
        const now = new Date();
        const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last30 = searches.slice(0, 30);
        const last30In24 = last30.filter((s) => s.createdAt > last24);
        if (last30In24.length >= 30) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Sorry, daily request limit exceeded. Please try again tomorrow.",
          });
        }
      }
      const asin = input.asin.split("/").pop() ?? input.asin;
      // const info = await getProductInfo(asin);
      // console.log({ info });
      // return {
      //   txtResponse: "",
      //   chatResponse: "",
      // };
      const currentResponse = await ctx.prisma.search.findUnique({
        where: {
          asin,
        },
        include: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });
      if (currentResponse) {
        const res = {
          txtResponse: currentResponse.response,
          ...currentResponse,
        };
        if (currentResponse.users.some((e) => e.id === ctx.session.user.id))
          return res;
        await ctx.prisma.search.update({
          where: {
            id: currentResponse.id,
          },
          data: {
            users: {
              create: {
                userId: ctx.session.user.id,
              },
            },
          },
        });
        return res;
      }

      const questions = await ctx.prisma.question.findMany({
        orderBy: {
          order: "asc",
        },
        where: {
          include: true,
        },
      });
      const temp = await handleSplit(
        questions,
        asin,
        currentResponse ?? undefined
      );
      const start = new Date();
      console.log("fetching - ", input.asin);
      const chatResponse = temp.chat;
      const txtResponse = temp.res;
      try {
        let id: string | undefined;
        if (chatResponse) {
          const data = {
            users: {
              create: {
                userId: ctx?.session?.user.id,
              },
            },
            asin,
            title: temp.product?.title,
            stars: temp.product?.stars,
            response: txtResponse,
            chatResponse,
            ratingCount: temp.product?.ratingCount ?? 0,
            reviewsCount: temp.product?.reviewsCount ?? 0,
            img: temp.product?.img,
            version: latestVersion,
          };
          const tmp = await ctx.prisma.search.create({
            data,
          });
          id = tmp.id;
        }
        const res = {
          txtResponse,
          chatResponse,
          ...(temp?.product ?? {}),
          version: latestVersion,
          id,
        };
        console.log(res);
        console.log(
          "success - fetching took - ",
          new Date().getTime() - start.getTime()
        );
        return res;
      } catch (e: any) {
        if (e.response?.data?.error?.message) {
          console.error(e.response.data.error.message);
        }
        console.log(
          "failed - fetching took - ",
          new Date().getTime() - start.getTime()
        );
        return {
          txtResponse,
          chatResponse,
          version: latestVersion,
          ...({} as TProductInfo),
          id: undefined,
        };
      }
    }),
});

function fixQuestion(
  question: string,
  url: string,
  title?: string,
  reviewsSum?: string
) {
  const base = question.replace("${url}", url).replace("${title}", title ?? "");
  if (reviewsSum) {
    return base.replace("${sum}", reviewsSum);
  }
  return base;
}

async function handleSplit(
  questions: Question[],
  asin: string,
  prevInfo?: TProductInfo
) {
  try {
    const drive = getGoogleDrive();
    let prevFileId = await getFileId(drive, asin);
    let prevReviews: IReview[] = [];
    let prevProdInfo: TProductInfo | undefined = prevInfo;
    if (!prevFileId || !prevProdInfo) {
      const [reviews, prodInfo] = await getReviews(asin);
      const res = await drive.files.create({
        requestBody: {
          name: `${asin}.json`,
          mimeType: "application/json",
          parents: ["13OFCt9ijeowKRwHcRv8yWWvKbTJwm2KE"],
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify(reviews),
        },
      });
      if (!res.data.id) throw new Error("No ID returned from Google Drive");
      prevFileId = res.data.id;
      prevReviews = reviews;
      prevProdInfo = prodInfo;
      console.log("reviews", reviews.length, prodInfo);
    }

    const rev: IReview[] = formatContent(
      prevReviews.length
        ? (prevReviews as any)
        : await getFileContent(drive, prevFileId)
    );
    console.log("rev", rev.length);

    const url = `https://drive.google.com/file/d/${prevFileId}/view?usp=sharing`;
    const question = questions
      .sort((a, b) => a.order - b.order)
      .find((e) => e.isChunks);
    if (!question) {
      throw new Error("No main question found");
    }
    const [firstPrompt, actualQuestion] = question.question
      .split("&|=split")
      .map((e) => e.trim());
    const prompt = firstPrompt?.replace(
      "${reviews}",
      rev
        .map((e) => {
          return e.customer_review?.replace(/(\r\n|\n|\r)/gm, " ").trim();
        })
        .join(" , ")
    );
    if (!prompt || !actualQuestion)
      throw new Error("No prompt / actualQuestion found");

    let chunks = [];
    let currentChunk = "";
    for (const message of prompt.split(" ")) {
      if (currentChunk.length + message.length > 2048) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += message + " ";
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    chunks = chunks.slice(0, 5);
    chunks = chunks.map((e) => {
      const newR = e.trim();
      return newR.length > 2048 ? newR.slice(0, 2048) : newR;
    });
    console.log({
      chunksCount: chunks.length,
      chunks: chunks.map((e) => e.length),
      total: chunks.map((e) => e.length).reduce((a, b) => a + b, 0),
    });
    const chat = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: chunks.map((q) => ({
        role: "assistant",
        content: fixQuestion(q, url, prevProdInfo?.title),
      })),
      temperature: 0.7,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      max_tokens: 1500,
    });
    const txt = chat.data.choices[0]?.message?.content;
    const quest = fixQuestion(actualQuestion, url, prevProdInfo?.title, txt);
    const resp = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: "assistant",
          content: quest,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      max_tokens: 2048,
    });
    const finalRes = resp.data.choices[0]?.message?.content;
    return {
      chat: finalRes,
      res: await unsafeJson(quest, url),
      product: prevProdInfo,
    };
  } catch (e: any) {
    if (e.response?.data?.error?.message) {
      console.error(e.response.data.error.message);
    }
    console.log(e);
    throw e;
  }
}

async function unsafeJson(quest: string, url: string) {
  try {
    const res = await fetch("http://3.14.87.126:8000/fullScript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: quest,
        URL: url,
      }),
    });
    return await res.json();
  } catch {
    return "Server returned nothing";
  }
}
