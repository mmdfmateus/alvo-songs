import type { Session } from "next-auth";

import { createCaller } from "~/server/api/root";
import { createFakeDb, type FakeDb } from "~/test/fake-db";

type Caller = ReturnType<typeof createCaller>;

export function testCaller(opts?: {
  db?: FakeDb;
  isEditor?: boolean;
  signedIn?: boolean;
  userId?: string;
}): { db: FakeDb; caller: Caller } {
  const userId = opts?.userId ?? "user-1";
  const signedIn = opts?.signedIn ?? true;
  const db = opts?.db ?? createFakeDb();
  if (signedIn) {
    db.upsertUser({ id: userId, isEditor: opts?.isEditor ?? false });
  }

  const session: Session | null = signedIn
    ? {
        user: {
          id: userId,
          name: "Ada",
          email: "ada@example.com",
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
