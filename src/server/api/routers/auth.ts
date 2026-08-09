import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { resolveViewer } from "~/server/auth/viewer";

export const authRouter = createTRPCRouter({
  viewer: publicProcedure.query(async ({ ctx }) => {
    return resolveViewer(ctx.db, ctx.session);
  }),
});
