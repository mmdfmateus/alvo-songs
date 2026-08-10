import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * tRPC request context. Isolated from procedure init so Vitest can import
 * routers without loading NextAuth.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
