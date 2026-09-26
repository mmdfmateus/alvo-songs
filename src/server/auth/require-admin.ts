import { TRPCError } from "@trpc/server";

import { loadIsAdmin, type ViewerDb } from "~/server/auth/viewer";

/**
 * Live Admin check for the signed-in User list. Re-reads `User.isAdmin` from
 * the DB so a demotion applies without waiting for re-login (ADR 0002).
 * Editor status does not pass this gate.
 */
export async function requireAdmin<T extends { user: { id: string } }>(
  db: ViewerDb,
  session: T | null,
): Promise<T> {
  if (!session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!(await loadIsAdmin(db, session.user.id))) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return session;
}
