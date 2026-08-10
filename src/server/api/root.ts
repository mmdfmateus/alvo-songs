import { artistRouter } from "~/server/api/routers/artist";
import { authRouter } from "~/server/api/routers/auth";
import { programRouter } from "~/server/api/routers/program";
import { songRouter } from "~/server/api/routers/song";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  artist: artistRouter,
  song: songRouter,
  program: programRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.auth.viewer();
 *       ^? Viewer
 */
export const createCaller = createCallerFactory(appRouter);
