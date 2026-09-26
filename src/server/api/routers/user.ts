import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  list: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      where: { accounts: { some: { provider: "google" } } },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, isEditor: true },
    });
  }),
});
