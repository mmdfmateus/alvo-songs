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

test("cookie owner can create and update a Program with a song section songId", async () => {
  const { caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [opening, { type: "song", songId: "song-live-1", payload: {} }],
  });

  const view = await caller.program.byId({ id: created.id });
  expect(view?.sections).toMatchObject([
    { type: "opening" },
    { type: "song", songId: "song-live-1", song: null },
  ]);
  expect(view?.sections[1]).not.toHaveProperty("freeze");
  expect(view?.sections[1]).not.toHaveProperty("pin");

  await caller.program.update({
    id: created.id,
    ownerToken: created.ownerToken,
    name: "Culto 09/08",
    sections: [{ type: "song", songId: null, payload: {} }],
  });

  const updated = await caller.program.byId({ id: created.id });
  expect(updated?.sections).toMatchObject([
    { type: "song", songId: null, song: null },
  ]);
});

test("Program preview reads live Song title and Trechos", async () => {
  const { db, caller } = testCaller({ signedIn: false });
  const song = await db.song.create({
    data: {
      title: "Grande É o Senhor",
      cifra: { type: "chordSheet", lines: [] },
      chunks: {
        create: [
          { position: 0, text: "Grande é o Senhor e mui digno de louvor" },
          { position: 1, text: "Na cidade do nosso Deus" },
        ],
      },
    },
  });

  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [{ type: "song", songId: song.id, payload: {} }],
  });

  const view = await caller.program.byId({ id: created.id });
  expect(view?.slides).toEqual([
    { kind: "titleChip", title: "Grande É o Senhor" },
    { kind: "lyric", text: "Grande é o Senhor e mui digno de louvor" },
    { kind: "lyric", text: "Na cidade do nosso Deus" },
  ]);
  expect(view?.sections).toMatchObject([
    {
      type: "song",
      songId: song.id,
      song: {
        id: song.id,
        title: "Grande É o Senhor",
        chunks: [
          { text: "Grande é o Senhor e mui digno de louvor" },
          { text: "Na cidade do nosso Deus" },
        ],
      },
    },
  ]);

  const editable = await caller.program.forEdit({
    id: created.id,
    ownerToken: created.ownerToken,
  });
  expect(editable?.slides).toEqual(view?.slides);

  await db.song.update({
    where: { id: song.id },
    data: { title: "Grande é o Senhor" },
  });

  const afterTitleChange = await caller.program.byId({ id: created.id });
  expect(afterTitleChange?.slides).toEqual([
    { kind: "titleChip", title: "Grande é o Senhor" },
    { kind: "lyric", text: "Grande é o Senhor e mui digno de louvor" },
    { kind: "lyric", text: "Na cidade do nosso Deus" },
  ]);
});

test("dangling songId contributes no slides and exposes a broken reference", async () => {
  const { caller } = testCaller({ signedIn: false });
  const created = await caller.program.create({
    name: "Culto 09/08",
    sections: [
      { type: "moment", payload: { title: "Oração" } },
      { type: "song", songId: "missing-song", payload: {} },
    ],
  });

  const view = await caller.program.byId({ id: created.id });
  expect(view?.slides).toEqual([{ kind: "titleChip", title: "Oração" }]);
  expect(view?.sections).toMatchObject([
    { type: "moment" },
    { type: "song", songId: "missing-song", song: null },
  ]);
});
