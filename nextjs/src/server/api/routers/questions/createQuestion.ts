import { z } from "zod";
import { adminProcedure } from "../../trpc";

export default adminProcedure
  .input(
    z.object({
      order: z.number(),
      question: z.string().min(3),
      main: z.boolean(),
      isChunks: z.boolean(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (input.main) {
      await ctx.prisma.question.updateMany({
        where: {
          main: true,
        },
        data: {
          main: false,
          order: {
            increment: 1,
          },
        },
      });
      input.order = 0;
    }
    await ctx.prisma.question.create({
      data: { ...input, include: true },
    });
  });
