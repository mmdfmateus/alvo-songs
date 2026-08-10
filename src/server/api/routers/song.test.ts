import { TRPCError } from "@trpc/server";
import { expect, test } from "vitest";

import { testCaller } from "~/test/caller";

const LET_IT_BE = `       Am         C/G        F          C
Let it be, let it be, let it be, let it be

C                G              F  C/E Dm C
Whisper words of wisdom, let it be`;

const LETRA = [
  "Let it be, let it be, let it be, let it be",
  "",
  "Whisper words of wisdom, let it be",
].join("\n");

test("anyone can browse an empty Song list", async () => {
  const { caller } = testCaller({ signedIn: false });
  await expect(caller.song.list()).resolves.toEqual([]);
});

test("editor can create a Song that public A–Z list and detail can read", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  const artist = await editor.artist.create({ name: "The Beatles" });
  await editor.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
    artistId: artist.id,
  });
  await editor.song.create({
    title: "Abre os Céus",
    cifraText: "Yeah, abre os céus\nNa terra como no céu",
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const list = await anonymous.song.list();
  expect(list.map((song) => song.title)).toEqual(["Abre os Céus", "Let It Be"]);
  expect(list[1]).toMatchObject({
    title: "Let It Be",
    artist: { name: "The Beatles" },
  });

  const detail = await anonymous.song.byId({ id: list[1]!.id });
  expect(detail).toMatchObject({
    title: "Let It Be",
    letra: LETRA,
    artist: { name: "The Beatles" },
  });
  expect(detail?.cifra).toMatchObject({ type: "chordSheet" });
  expect(typeof detail?.cifra).toBe("object");
});

test("lyric chunks are seeded from Letra only on create", async () => {
  const { caller } = testCaller({ isEditor: true });
  const created = await caller.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });

  const detail = await caller.song.byId({ id: created.id });
  expect(detail?.chunks.map((chunk) => chunk.text)).toEqual([
    "Let it be, let it be, let it be, let it be",
    "Whisper words of wisdom, let it be",
  ]);
});

test("saving a new Cifra leaves lyric chunks unchanged", async () => {
  const { caller } = testCaller({ isEditor: true });
  const created = await caller.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });
  const original = await caller.song.byId({ id: created.id });

  await caller.song.update({
    id: created.id,
    title: "Let It Be",
    cifraText: "Nova letra só\nSem os acordes antigos",
  });

  const updated = await caller.song.byId({ id: created.id });
  expect(updated?.letra).toBe("Nova letra só\nSem os acordes antigos");
  expect(updated?.chunks.map((chunk) => chunk.text)).toEqual(
    original?.chunks.map((chunk) => chunk.text),
  );
});

test("zero lyric chunks are allowed when Letra is empty", async () => {
  const { caller } = testCaller({ isEditor: true });
  const created = await caller.song.create({
    title: "Instrumental",
    cifraText: "Am   C   G",
  });

  const detail = await caller.song.byId({ id: created.id });
  expect(detail?.chunks).toEqual([]);
});

test("anonymous and non-editor cannot mutate Songs", async () => {
  const { db, caller: editor } = testCaller({ isEditor: true });
  const song = await editor.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });

  await expect(
    testCaller({ db, signedIn: false }).caller.song.create({
      title: "X",
      cifraText: "x",
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );

  await expect(
    testCaller({ db, isEditor: false, userId: "user-2" }).caller.song.delete({
      id: song.id,
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "FORBIDDEN",
  );
});

test("editor can delete a Song", async () => {
  const { caller } = testCaller({ isEditor: true });
  const song = await caller.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });

  await caller.song.delete({ id: song.id });
  await expect(caller.song.byId({ id: song.id })).resolves.toBeNull();
});
