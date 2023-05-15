import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { stripe } from "./stripe";

export default protectedProcedure
  .input(
    z.object({
      checkoutSessionId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const session = await stripe.checkout.sessions.retrieve(
      input.checkoutSessionId
    );
    return {
      success: session.payment_status === "paid",
    };
  });
