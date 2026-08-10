import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { hashOwnerToken } from "~/lib/program-owner";
import { testCaller } from "~/test/caller";

const opening = {
  type: "opening" as const,
  payload: { communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
};

test("anyone can create a Program without login; secret is not stored", async () => {
  const { db, caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [opening],
  });

  expect(created).toMatchObject({ name: "Culto 09/08" });
  expect(created.ownerToken).toEqual(expect.any(String));
  expect(created.ownerToken.length).toBeGreaterThan(20);

  const stored = await db.program.findUnique({ where: { id: created.id } });
  expect(stored?.ownerTokenHash).toBe(hashOwnerToken(created.ownerToken));
  expect(JSON.stringify(stored)).not.toContain(created.ownerToken);
});

test("public view is read-only and expands sections to slides", async () => {
  const { caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [
      opening,
      { type: "announcements", payload: { title: "Avisos" } },
      { type: "game", payload: { title: "Dinâmica" } },
      { type: "moment", payload: { title: "Oração" } },
    ],
  });

  const view = await caller.program.byId({ id: created.id });
  expect(view).toMatchObject({ id: created.id, name: "Culto 09/08" });
  expect(view).not.toHaveProperty("ownerTokenHash");
  expect(view?.slides).toEqual([
    { kind: "opening", communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
    { kind: "titleChip", title: "Avisos" },
    { kind: "blank" },
    { kind: "titleChip", title: "Dinâmica" },
    { kind: "blank" },
    { kind: "titleChip", title: "Oração" },
  ]);
});

test("only the ownership token can edit or delete", async () => {
  const { caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [opening],
  });

  await expect(
    caller.program.update({
      id: created.id,
      ownerToken: "wrong",
      name: "Outro",
      sections: [opening],
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );

  const updated = await caller.program.update({
    id: created.id,
    ownerToken: created.ownerToken,
    name: "Culto da juventude",
    sections: [{ type: "moment", payload: { title: "Oração" } }],
  });
  expect(updated.name).toBe("Culto da juventude");

  const view = await caller.program.byId({ id: created.id });
  expect(view?.slides).toEqual([{ kind: "titleChip", title: "Oração" }]);

  await expect(
    caller.program.delete({ id: created.id, ownerToken: "wrong" }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );

  await caller.program.delete({
    id: created.id,
    ownerToken: created.ownerToken,
  });
  await expect(caller.program.byId({ id: created.id })).resolves.toBeNull();
});

test("Editors have no special Program powers", async () => {
  const { db, caller: owner } = testCaller({ signedIn: false });
  const created = await owner.program.create({
    name: "Culto 09/08",
    sections: [opening],
  });

  const editor = testCaller({ db, isEditor: true }).caller;
  await expect(
    editor.program.update({
      id: created.id,
      ownerToken: "not-the-owner",
      name: "Hack",
      sections: [opening],
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );

  await expect(
    editor.program.forEdit({ id: created.id, ownerToken: "not-the-owner" }),
  ).resolves.toBeNull();
});

test("forEdit returns the Program only with the ownership token", async () => {
  const { caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [opening],
  });

  await expect(
    caller.program.forEdit({ id: created.id, ownerToken: created.ownerToken }),
  ).resolves.toMatchObject({ id: created.id, name: "Culto 09/08" });
});
