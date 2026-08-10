import type { Session } from "next-auth";

export type Viewer = {
  signedIn: boolean;
  isEditor: boolean;
};

export type ViewerDb = {
  user: {
    findUnique: (args: {
      where: { id: string };
      select: { isEditor: true };
    }) => Promise<{ isEditor: boolean } | null>;
  };
};

/**
 * Live Editor check for UI chrome. Re-reads `User.isEditor` from the DB so a
 * demotion applies without waiting for re-login (ADR 0002).
 */
export async function loadIsEditor(
  db: ViewerDb,
  userId: string,
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isEditor: true },
  });
  return user?.isEditor ?? false;
}

export async function resolveViewer(
  db: ViewerDb,
  session: Session | null,
): Promise<Viewer> {
  if (!session?.user?.id) {
    return { signedIn: false, isEditor: false };
  }

  return {
    signedIn: true,
    isEditor: await loadIsEditor(db, session.user.id),
  };
}
