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

test("admin can grant and revoke Editor without changing Admin", async () => {
  const { db, caller: admin } = testCaller({
    isAdmin: true,
    isEditor: true,
    userId: "admin-1",
  });
  db.upsertUser({
    id: "bea",
    name: "Bea",
    email: "bea@example.com",
    isEditor: false,
    isAdmin: false,
  });
  db.linkGoogleAccount("bea");

  await expect(
    admin.user.setEditor({ id: "bea", isEditor: true }),
  ).resolves.toEqual({ id: "bea", isEditor: true, isAdmin: false });

  const bea = testCaller({
    db,
    userId: "bea",
    keepStoredFlags: true,
  }).caller;
  await expect(
    bea.song.create({
      title: "Nova",
      cifraText: "Yeah, abre os céus\nNa terra como no céu",
    }),
  ).resolves.toMatchObject({ title: "Nova" });

  await expect(
    admin.user.setEditor({ id: "bea", isEditor: false }),
  ).resolves.toEqual({ id: "bea", isEditor: false, isAdmin: false });

  await expect(
    bea.song.create({ title: "Outra", cifraText: "x" }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("admin cannot grant Editor to an account that never signed in", async () => {
  const { db, caller } = testCaller({ isAdmin: true, userId: "admin-1" });
  db.upsertUser({
    id: "never",
    name: "Never",
    email: "never@example.com",
    isEditor: false,
    isAdmin: false,
  });

  await expect(
    caller.user.setEditor({ id: "never", isEditor: true }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError &&
      error.code === "NOT_FOUND" &&
      error.message === "Essa conta ainda não entrou.",
  );
});

test("editor who is not an Admin cannot grant Editor", async () => {
  const { db, caller } = testCaller({
    isAdmin: false,
    isEditor: true,
    userId: "editor-1",
  });
  db.upsertUser({
    id: "bea",
    name: "Bea",
    email: "bea@example.com",
    isEditor: false,
  });
  db.linkGoogleAccount("bea");

  await expect(
    caller.user.setEditor({ id: "bea", isEditor: true }),
  ).rejects.toSatisfy(
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
