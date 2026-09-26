import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  list: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      where: { accounts: { some: { provider: "google" } } },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, isEditor: true },
    });
  }),

  setEditor: adminProcedure
    .input(z.object({ id: z.string().min(1), isEditor: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const signedIn = await ctx.db.user.findFirst({
        where: {
          id: input.id,
          accounts: { some: { provider: "google" } },
        },
        select: { id: true },
      });
      if (!signedIn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Essa conta ainda não entrou.",
        });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { isEditor: input.isEditor },
        select: { id: true, isEditor: true, isAdmin: true },
      });
    }),
});
