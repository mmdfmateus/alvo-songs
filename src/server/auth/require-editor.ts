import { TRPCError } from "@trpc/server";

import { loadIsEditor, type ViewerDb } from "~/server/auth/viewer";

/**
 * Live Editor check for mutate procedures. Re-reads `User.isEditor` from the
 * DB so a demotion applies without waiting for re-login (ADR 0002).
 */
export async function requireEditor<T extends { user: { id: string } }>(
  db: ViewerDb,
  session: T | null,
): Promise<T> {
  if (!session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!(await loadIsEditor(db, session.user.id))) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return session;
}
