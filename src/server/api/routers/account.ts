import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const accountRouter = createTRPCRouter({
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    

    return await db.accounts.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
