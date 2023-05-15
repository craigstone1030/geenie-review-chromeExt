import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { verifyFree } from "~/server/auth";
import { adminProcedure, createTRPCRouter } from "../../trpc";

const MAX_TABLE_SIZE = 8;

export default createTRPCRouter({
  getSumData: adminProcedure.query(async ({ ctx }) => {
    const freeUserCount = await ctx.prisma.user.count({
      where: {
        subscriptionId: null,
      },
    });
    const searchCount = await ctx.prisma.search.count();
    const payinguserCount = await ctx.prisma.user.count({
      where: {
        subscriptionId: {
          not: null,
        },
      },
    });
    const finalUserCount = freeUserCount + payinguserCount;
    return {
      freeUserCount,
      searchCount,
      payinguserCount,
      finalUserCount,
    };
  }),
  getUser: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: input,
      },
      include: {
        searches: {
          select: {
            search: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    const newUser = {
      ...user,
      isFreeTrial: user.subscriptionId === null,
      paying: user.subscriptionId,
      freeTrialExpired:
        verifyFree(
          user.subscriptionId,
          user.createdAt.toISOString(),
          user.role === "ADMIN"
        ) === "Expired",
      role:
        user.role === "ADMIN"
          ? "ADMIN"
          : user.email?.includes("deqa.io")
          ? "DEQA"
          : "USER",
    };
    const [reportsCount, sub] = await ctx.prisma.$transaction([
      ctx.prisma.search.count({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
      }),
      ctx.prisma.subscription.findUnique({
        where: {
          id: user.id,
        },
      }),
    ]);
    const searchesPerDay = user.searches.reduce((acc, search) => {
      const date = search.createdAt.toISOString().split("T")[0];
      if (!date) return acc;
      if (acc[date]) {
        acc[date] += 1;
      } else {
        acc[date] = 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const sortedSearches = Object.entries(searchesPerDay).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    return {
      ...newUser,
      reportsCount,
      paying: sub?.price ?? null,
      sortedSearches,
    };
  }),
  getUsers: adminProcedure
    .input(
      z.object({
        currentPage: z
          .number()
          .min(1)
          .transform((v) => v - 1),
        seekForRole: z.enum(["ADMIN", "USER", "DEQA", "ALL"]),
        orderBy: z.enum(["createdAt", "paying", "count", "lastLogin"]),
        name: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const innerWhere =
        input.seekForRole === "DEQA"
          ? {
              email: {
                contains: "@deqa.io",
              },
            }
          : input.seekForRole === "ADMIN"
          ? {
              OR: [
                {
                  email: {
                    contains: "@deqa.io",
                  },
                },
                {
                  role: "ADMIN" as const,
                },
              ],
            }
          : {
              role: input.seekForRole === "ALL" ? undefined : input.seekForRole,
            };
      const users = await ctx.prisma.user.findMany({
        skip: input.currentPage * MAX_TABLE_SIZE,
        take: MAX_TABLE_SIZE,
        orderBy:
          input.orderBy === "lastLogin"
            ? {
                lastLogin: "desc",
              }
            : input.orderBy === "count"
            ? {
                searches: {
                  _count: "desc",
                },
              }
            : {
                [input.orderBy === "paying" ? "subscription" : input.orderBy]:
                  input.orderBy === "paying"
                    ? {
                        price: "desc",
                      }
                    : "desc",
              },
        where: {
          ...innerWhere,
          name: {
            contains: input.name,
          },
        },
      });
      const subsToFetch: string[] = [];
      const reportsCountToFecthByUserId: string[] = [];
      const newUser = users.map((user) => {
        if (user.subscriptionId) {
          subsToFetch.push(user.subscriptionId);
        }
        reportsCountToFecthByUserId.push(user.id);
        return {
          ...user,
          isFreeTrial: user.subscriptionId === null,
          paying: user.subscriptionId,
          freeTrialExpired:
            verifyFree(
              user.subscriptionId,
              user.createdAt.toISOString(),
              user.role === "ADMIN"
            ) === "Expired",
          role:
            user.role === "ADMIN"
              ? "ADMIN"
              : user.email?.includes("deqa.io")
              ? "DEQA"
              : "USER",
        };
      });
      const reportsCountByIds = await ctx.prisma.$transaction(
        reportsCountToFecthByUserId.map((userId) =>
          ctx.prisma.search.count({
            where: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          })
        )
      );
      const reportsCountMap = new Map(
        reportsCountToFecthByUserId.map((userId, index) => [
          userId,
          reportsCountByIds[index],
        ])
      );
      const subs = await ctx.prisma.subscription.findMany({
        where: {
          id: {
            in: subsToFetch,
          },
        },
      });
      const subsMap = new Map(subs.map((sub) => [sub.id, sub]));
      return newUser.map((user) => {
        const getInner = () => {
          if (user.subscriptionId) {
            return {
              ...user,
              paying: subsMap.get(user.subscriptionId)?.price,
            };
          }
          return { ...user, paying: "0" };
        };
        return {
          ...getInner(),
          reportsCount: reportsCountMap.get(user.id),
        };
      });
    }),
});
