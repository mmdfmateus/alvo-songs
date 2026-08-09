import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { requireEditor } from "~/server/auth/require-editor";

function sessionFor(userId: string) {
  return {
    user: {
      id: userId,
      name: "Ada",
      email: "ada@example.com",
    },
  };
}

function dbWith(isEditor: boolean | null) {
  return {
    user: {
      findUnique: async () =>
        isEditor === null ? null : { isEditor },
    },
  };
}

test("anonymous caller cannot mutate as editor", async () => {
  await expect(requireEditor(dbWith(false), null)).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );
});

test("signed-in non-editor cannot mutate as editor", async () => {
  await expect(
    requireEditor(dbWith(false), sessionFor("user-1")),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("editor can pass the mutate gate", async () => {
  const session = sessionFor("user-1");
  await expect(requireEditor(dbWith(true), session)).resolves.toBe(session);
});

test("demotion in the DB forbids mutate without a new login", async () => {
  await expect(
    requireEditor(dbWith(false), sessionFor("user-1")),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});
