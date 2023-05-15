import { z } from "zod";
import { adminProcedure } from "../../trpc";

export default adminProcedure
  .input(
    z.object({
      question: z.string().min(3),
      main: z.boolean(),
      id: z.string().min(3),
      order: z.number(),
      include: z.boolean(),
      isChunks: z.boolean(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (input.main) {
      await ctx.prisma.question.updateMany({
        where: {
          id: {
            not: input.id,
          },
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
    return await ctx.prisma.question.update({
      where: {
        id: input.id,
      },
      data: {
        include: input.include || input.main,
        question: input.question,
        main: input.main,
        order: input.order,
        isChunks: input.isChunks,
      },
    });
  });
