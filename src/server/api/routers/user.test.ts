import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { testCaller } from "~/test/caller";

test("admin sees name, email, and editor status for every Google account that has signed in", async () => {
  const { db, caller } = testCaller({
    isAdmin: true,
    isEditor: false,
    userId: "admin-1",
    name: "Ada",
    email: "ada@example.com",
  });

  db.upsertUser({
    id: "bea",
    name: "Bea",
    email: "bea@example.com",
    isEditor: true,
    isAdmin: false,
  });
  db.linkGoogleAccount("bea");

  db.upsertUser({
    id: "never",
    name: "Never Signed In",
    email: "never@example.com",
    isEditor: false,
    isAdmin: false,
  });

  await expect(caller.user.list()).resolves.toEqual([
    {
      id: "admin-1",
      name: "Ada",
      email: "ada@example.com",
      isEditor: false,
    },
    {
      id: "bea",
      name: "Bea",
      email: "bea@example.com",
      isEditor: true,
    },
  ]);
});

test("anonymous caller cannot list Users", async () => {
  const { caller } = testCaller({ signedIn: false });

  await expect(caller.user.list()).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );
});

test("signed-in non-admin cannot list Users", async () => {
  const { caller } = testCaller({ isAdmin: false, isEditor: false });

  await expect(caller.user.list()).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("editor who is not an Admin cannot list Users", async () => {
  const { caller } = testCaller({ isAdmin: false, isEditor: true });

  await expect(caller.user.list()).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});
