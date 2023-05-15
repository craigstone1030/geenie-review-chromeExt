import { adminProcedure } from "../../trpc";

export default adminProcedure.query(async ({ ctx }) => {
  return await ctx.prisma.question.findMany({
    orderBy: {
      order: "asc",
    },
  });
});
