import { createTransport } from "nodemailer";
import { z } from "zod";
import { emailServer } from "~/server/auth";
import { protectedProcedure } from "../../trpc";

export default protectedProcedure
  .input(
    z.object({
      email: z.string().email(),
      message: z.string().min(10),
    })
  )
  .mutation(async ({ input }) => {
    const transport = createTransport(emailServer.server);
    await transport.sendMail({
      subject: "Reviewsify Support",
      text: `${input.email} - ${input.message}`,
      to: "support@geenie.ai",
      from: emailServer.from,
    });
    return null;
  });
