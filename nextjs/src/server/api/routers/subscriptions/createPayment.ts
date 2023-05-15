/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { protectedProcedure } from "../../trpc";
import { createTransport } from "nodemailer";
import { emailServer } from "~/server/auth";
import { stripe } from "./stripe";

export default protectedProcedure
  .input(z.object({ sub: z.string(), coupon: z.string().optional() }))
  .mutation(async ({ ctx, input }) => {
    const subscription = await ctx.prisma.subscription.findUnique({
      where: {
        id: input.sub,
      },
    });
    if (!subscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No subscription",
      });
    }
    if (!subscription.price && !subscription.sPriceDev) {
      if (subscription.title === "Free") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot subscribe to free plan",
        });
      }
      if (ctx.session?.user?.sentEnterprise) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already applied for enterprise",
        });
      }
      const transport = createTransport(emailServer.server);
      const result = await transport.sendMail({
        to: "support@geenie.ai",
        from: emailServer.from,
        subject: `Reviewsify Apply for Enterprise`,
        text: `${ctx.session.user.email ?? ""}`,
      });
      const failed = result.rejected.concat(result.pending).filter(Boolean);
      if (failed.length) {
        throw new TRPCError({
          message: `Email (${failed.join(", ")}) could not be sent`,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      await ctx.prisma.user.update({
        where: {
          id: ctx.session?.user?.id,
        },
        data: {
          sentEnterprise: true,
        },
      });
      return null;
    }
    if (!subscription.sPrice && !subscription.sPriceDev) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No subscription price",
      });
    }
    const coupon = input.coupon
      ? await stripe.coupons.retrieve(input.coupon)
      : undefined;
    if (coupon && coupon.valid === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid coupon",
      });
    }

    const shouldUseDev = false;
    const getKey = () => {
      if (env.NODE_ENV === "development" || shouldUseDev) {
        return subscription.sPriceDev as string;
      }
      return (
        subscription.sPrice?.length
          ? subscription.sPrice
          : subscription.sPriceDev
      ) as string;
    };

    const url =
      env.NODE_ENV !== "production"
        ? "http://localhost:3000"
        : "http://geenieai.com";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      discounts: coupon
        ? [
            {
              coupon: coupon.id,
            },
          ]
        : undefined,
      line_items: [
        {
          price: getKey(),
          quantity: 1,
        },
      ],
      success_url: `${url}${subscription.title === "Pro" ? "?pro=true" : ""}`,
      cancel_url: url,
      metadata: {
        subscriptionId: subscription.id,
        userId: ctx.session?.user?.id,
      },
      customer_email: ctx.session?.user?.email as string,
    });
    return session.id;
  });
