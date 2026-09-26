import type { Session } from "next-auth";

export type ViewerUser = {
  name: string | null;
  image: string | null;
};

export type Viewer = {
  signedIn: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  user: ViewerUser | null;
};

export type ViewerDb = {
  user: {
    findUnique: (args: {
      where: { id: string };
      select: { isEditor?: true; isAdmin?: true };
    }) => Promise<{ isEditor?: boolean; isAdmin?: boolean } | null>;
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

/**
 * Live Admin check. Re-reads `User.isAdmin` from the DB so a demotion applies
 * without waiting for re-login (ADR 0002).
 */
export async function loadIsAdmin(
  db: ViewerDb,
  userId: string,
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return user?.isAdmin ?? false;
}

async function loadUserFlags(
  db: ViewerDb,
  userId: string,
): Promise<{ isEditor: boolean; isAdmin: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isEditor: true, isAdmin: true },
  });
  return {
    isEditor: user?.isEditor ?? false,
    isAdmin: user?.isAdmin ?? false,
  };
}

export async function resolveViewer(
  db: ViewerDb,
  session: Session | null,
): Promise<Viewer> {
  if (!session?.user?.id) {
    return { signedIn: false, isEditor: false, isAdmin: false, user: null };
  }

  const flags = await loadUserFlags(db, session.user.id);
  return {
    signedIn: true,
    ...flags,
    user: {
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  };
}
