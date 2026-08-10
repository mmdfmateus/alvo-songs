import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { testCaller } from "~/test/caller";

test("anyone can browse an empty Artist directory", async () => {
  const { caller } = testCaller({ signedIn: false });

  await expect(caller.artist.list()).resolves.toEqual([]);
});

test("editor can create an Artist that the public directory lists A–Z", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  const anonymous = testCaller({ db, signedIn: false }).caller;

  await editor.artist.create({ name: "Zion", imageUrl: "https://img.example/z.jpg" });
  await editor.artist.create({ name: "alvo" });

  await expect(anonymous.artist.list()).resolves.toEqual([
    { id: expect.any(String), name: "alvo", imageUrl: null },
    {
      id: expect.any(String),
      name: "Zion",
      imageUrl: "https://img.example/z.jpg",
    },
  ]);
});

test("anonymous caller cannot create an Artist", async () => {
  const { caller } = testCaller({ signedIn: false });

  await expect(caller.artist.create({ name: "Alvo" })).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );
});

test("signed-in non-editor cannot create an Artist", async () => {
  const { caller } = testCaller({ isEditor: false });

  await expect(caller.artist.create({ name: "Alvo" })).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("Artist name is unique ignoring case", async () => {
  const { caller } = testCaller({ isEditor: true });
  await caller.artist.create({ name: "Alvo Music" });

  await expect(caller.artist.create({ name: "alvo music" })).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError &&
      error.code === "CONFLICT" &&
      error.message.includes("Artista"),
  );
});

test("Artist detail lists Songs when they exist", async () => {
  const { db, caller } = testCaller({ isEditor: true });
  const artist = await caller.artist.create({ name: "Alvo" });
  await db.song.create({
    data: { title: "Grande É o Senhor", cifra: { type: "chordSheet", lines: [] } , artistId: artist.id },
  });
  await db.song.create({
    data: { title: "Abre os Céus", cifra: { type: "chordSheet", lines: [] }, artistId: artist.id },
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const detail = await anonymous.artist.byId({ id: artist.id });

  expect(detail).toMatchObject({
    id: artist.id,
    name: "Alvo",
    imageUrl: null,
    songs: [
      { title: "Abre os Céus" },
      { title: "Grande É o Senhor" },
    ],
  });
});

test("editor can update an Artist", async () => {
  const { caller } = testCaller({ isEditor: true });
  const artist = await caller.artist.create({ name: "Alvo" });

  const updated = await caller.artist.update({
    id: artist.id,
    name: "Alvo Music",
    imageUrl: "https://img.example/a.jpg",
  });

  expect(updated).toMatchObject({
    id: artist.id,
    name: "Alvo Music",
    imageUrl: "https://img.example/a.jpg",
  });
});

test("deleting an Artist leaves its Songs with no Artist", async () => {
  const { db, caller } = testCaller({ isEditor: true });
  const artist = await caller.artist.create({ name: "Alvo" });
  const song = await db.song.create({
    data: { title: "Grande É o Senhor", cifra: {}, artistId: artist.id },
  });

  await caller.artist.delete({ id: artist.id });

  const remaining = await db.song.findUnique({ where: { id: song.id } });
  expect(remaining?.artistId).toBeNull();
  await expect(caller.artist.byId({ id: artist.id })).resolves.toBeNull();
});

test("anonymous and non-editor cannot delete an Artist", async () => {
  const { db, caller: editor } = testCaller({ isEditor: true });
  const artist = await editor.artist.create({ name: "Alvo" });

  await expect(
    testCaller({ db, signedIn: false }).caller.artist.delete({ id: artist.id }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );

  await expect(
    testCaller({ db, isEditor: false, userId: "user-2" }).caller.artist.delete({
      id: artist.id,
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});
