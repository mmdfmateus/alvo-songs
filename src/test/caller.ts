import type { Session } from "next-auth";

import { createCaller } from "~/server/api/root";
import { createFakeDb, type FakeDb } from "~/test/fake-db";

type Caller = ReturnType<typeof createCaller>;

export function testCaller(opts?: {
  db?: FakeDb;
  isEditor?: boolean;
  isAdmin?: boolean;
  signedIn?: boolean;
  userId?: string;
  name?: string;
  email?: string;
}): { db: FakeDb; caller: Caller } {
  const userId = opts?.userId ?? "user-1";
  const signedIn = opts?.signedIn ?? true;
  const name = opts?.name ?? "Ada";
  const email = opts?.email ?? "ada@example.com";
  const db = opts?.db ?? createFakeDb();
  if (signedIn) {
    db.upsertUser({
      id: userId,
      isEditor: opts?.isEditor ?? false,
      isAdmin: opts?.isAdmin ?? false,
      name,
      email,
    });
    db.linkGoogleAccount(userId);
  }

  const session: Session | null = signedIn
    ? {
        user: {
          id: userId,
          name,
          email,
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      }
    : null;

  return {
    db,
    caller: createCaller({
      db: db as never,
      session,
      headers: new Headers(),
    }),
  };
}
