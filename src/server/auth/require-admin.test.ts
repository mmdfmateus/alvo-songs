import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { requireAdmin } from "~/server/auth/require-admin";

function sessionFor(userId: string) {
  return {
    user: {
      id: userId,
      name: "Ada",
      email: "ada@example.com",
    },
  };
}

function dbWith(isAdmin: boolean | null) {
  return {
    user: {
      findUnique: async () => (isAdmin === null ? null : { isAdmin }),
    },
  };
}

test("anonymous caller cannot open the Admin list", async () => {
  await expect(requireAdmin(dbWith(false), null)).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );
});

test("signed-in non-admin cannot open the Admin list", async () => {
  await expect(
    requireAdmin(dbWith(false), sessionFor("user-1")),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("editor who is not an Admin cannot open the Admin list", async () => {
  const db = {
    user: {
      findUnique: async () => ({ isAdmin: false, isEditor: true }),
    },
  };

  await expect(requireAdmin(db, sessionFor("user-1"))).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("admin can pass the list gate", async () => {
  const session = sessionFor("user-1");
  await expect(requireAdmin(dbWith(true), session)).resolves.toBe(session);
});

test("demotion in the DB forbids the Admin list without a new login", async () => {
  await expect(
    requireAdmin(dbWith(false), sessionFor("user-1")),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});
