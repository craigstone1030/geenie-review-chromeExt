import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "~/server/api/routers/subscriptions/stripe";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req.body) {
      return res.json({ error: "no body" });
    }
    if (req.body.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        req.body.data.object.id
      );
      if (session.payment_status !== "paid") {
        return res.json({ error: "payment not complete" });
      }
      if (
        !session.metadata ||
        !session.metadata.subscriptionId ||
        !session.metadata.userId
      ) {
        return res.json({ error: "no metadata" });
      }
      const subscription = await prisma.subscription.findUnique({
        where: {
          id: session.metadata.subscriptionId,
        },
      });
      if (!subscription) {
        return res.json({ error: "no subscription" });
      }
      const userSession = await prisma.user.findUnique({
        where: {
          id: session.metadata.userId,
        },
      });
      if (!userSession) {
        return res.json({ error: "no user" });
      }
      if (userSession.subscriptionId) {
        const currentUserSubscription = await prisma.subscription.findUnique({
          where: {
            id: userSession.subscriptionId,
          },
        });
        if (!currentUserSubscription) {
          return res.json({ error: "no subscription" });
        }
        if (currentUserSubscription.level > subscription.level) {
          return res.json({ error: "Cannot downgrade" });
        }
      }
      await prisma.user.update({
        where: {
          id: userSession.id,
        },
        data: {
          subscriptionId: subscription.id,
        },
      });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ error: e });
  }
}
