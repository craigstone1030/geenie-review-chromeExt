import { protectedProcedure } from "../../trpc";

export default protectedProcedure.query(async ({ ctx }) => {
  return await ctx.prisma.subscription.findMany({});
});
