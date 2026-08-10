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

test("anonymous can search Songs by title", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  await editor.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });
  await editor.song.create({
    title: "Abre os Céus",
    cifraText: "Yeah, abre os céus\nNa terra como no céu",
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const results = await anonymous.song.search({ q: "let it" });
  expect(results.map((song) => song.title)).toEqual(["Let It Be"]);
});

test("search matches Songs by Artist name", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  const beatles = await editor.artist.create({ name: "The Beatles" });
  await editor.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
    artistId: beatles.id,
  });
  await editor.song.create({
    title: "Abre os Céus",
    cifraText: "Yeah, abre os céus\nNa terra como no céu",
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const results = await anonymous.song.search({ q: "beatles" });
  expect(results.map((song) => song.title)).toEqual(["Let It Be"]);
});

test("search is accent-insensitive on title and Artist name", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  const nana = await editor.artist.create({ name: "Nanã" });
  await editor.song.create({
    title: "Coração do Pai",
    cifraText: LET_IT_BE,
  });
  await editor.song.create({
    title: "Águas",
    cifraText: LET_IT_BE,
    artistId: nana.id,
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  await expect(
    anonymous.song.search({ q: "coracao" }),
  ).resolves.toMatchObject([{ title: "Coração do Pai" }]);
  await expect(anonymous.song.search({ q: "nana" })).resolves.toMatchObject([
    { title: "Águas", artist: { name: "Nanã" } },
  ]);
});

test("search is case-insensitive", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  await editor.song.create({
    title: "Português",
    cifraText: LET_IT_BE,
  });
  await editor.song.create({
    title: "Abre os Céus",
    cifraText: "Yeah, abre os céus\nNa terra como no céu",
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const results = await anonymous.song.search({ q: "PORTUGUES" });
  expect(results.map((song) => song.title)).toEqual(["Português"]);
});

test("editor can set optional videoId on create and update", async () => {
  const { caller } = testCaller({ isEditor: true });
  const created = await caller.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
    videoId: "dQw4w9WgXcQ",
  });

  await expect(caller.song.byId({ id: created.id })).resolves.toMatchObject({
    videoId: "dQw4w9WgXcQ",
  });

  await caller.song.update({
    id: created.id,
    title: "Let It Be",
    cifraText: LET_IT_BE,
    videoId: "oHg5SJYRHA0",
  });
  await expect(caller.song.byId({ id: created.id })).resolves.toMatchObject({
    videoId: "oHg5SJYRHA0",
  });

  await caller.song.update({
    id: created.id,
    title: "Let It Be",
    cifraText: LET_IT_BE,
  });
  await expect(caller.song.byId({ id: created.id })).resolves.toMatchObject({
    videoId: null,
  });
});

test("anonymous can search and read Escutar data without mutating", async () => {
  const { db } = testCaller({ isEditor: true });
  const editor = testCaller({ db, isEditor: true }).caller;
  const song = await editor.song.create({
    title: "Let It Be",
    cifraText: LET_IT_BE,
    videoId: "dQw4w9WgXcQ",
  });

  const anonymous = testCaller({ db, signedIn: false }).caller;
  const results = await anonymous.song.search({ q: "Let It" });
  expect(results.map((found) => found.title)).toEqual(["Let It Be"]);
  await expect(anonymous.song.byId({ id: song.id })).resolves.toMatchObject({
    title: "Let It Be",
    videoId: "dQw4w9WgXcQ",
  });

  await expect(
    anonymous.song.update({
      id: song.id,
      title: "Hacked",
      cifraText: LET_IT_BE,
      videoId: "hacked",
    }),
  ).rejects.toSatisfy(
    (error: unknown) =>
      error instanceof TRPCError && error.code === "UNAUTHORIZED",
  );
});

