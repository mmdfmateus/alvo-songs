import { afterEach, expect, test, vi } from "vitest";

import {
  createSongAutosave,
  SONG_AUTOSAVE_DELAY_MS,
  type SongAutosaveDraft,
  type SongAutosaveStatus,
} from "~/lib/song-autosave";

afterEach(() => {
  vi.useRealTimers();
});

const VALID_DRAFT = {
  title: "Canção",
  cifraText: "Am\nLetra",
  cifraOk: true,
  chunks: [] as { text: string }[],
};

test("dirty valid draft schedules save after the autosave delay", async () => {
  vi.useFakeTimers();
  const saved: SongAutosaveDraft[] = [];
  const autosave = createSongAutosave({
    save: async (draft) => {
      saved.push(draft);
    },
  });

  autosave.notify(VALID_DRAFT);

  expect(saved).toEqual([]);
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS - 1);
  expect(saved).toEqual([]);
  await vi.advanceTimersByTimeAsync(1);
  expect(saved).toEqual([
    {
      title: "Canção",
      cifraText: "Am\nLetra",
      chunks: [],
    },
  ]);

  autosave.dispose();
});

test("rapid changes collapse to one save of the latest draft", async () => {
  vi.useFakeTimers();
  const saved: SongAutosaveDraft[] = [];
  const autosave = createSongAutosave({
    save: async (draft) => {
      saved.push(draft);
    },
  });

  autosave.notify({ ...VALID_DRAFT, title: "Um" });
  await vi.advanceTimersByTimeAsync(200);
  autosave.notify({ ...VALID_DRAFT, title: "Dois" });
  await vi.advanceTimersByTimeAsync(200);
  autosave.notify({ ...VALID_DRAFT, title: "Três" });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);

  expect(saved).toEqual([
    {
      title: "Três",
      cifraText: "Am\nLetra",
      chunks: [],
    },
  ]);

  autosave.dispose();
});

test("empty title or unparseable Cifra does not save, then resumes when valid", async () => {
  vi.useFakeTimers();
  const savedTitles: string[] = [];
  const autosave = createSongAutosave({
    save: async (draft) => {
      savedTitles.push(draft.title);
    },
  });

  autosave.notify({ ...VALID_DRAFT, title: "" });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(savedTitles).toEqual([]);

  autosave.notify({ ...VALID_DRAFT, title: "   " });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(savedTitles).toEqual([]);

  autosave.notify({ ...VALID_DRAFT, cifraOk: false });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(savedTitles).toEqual([]);

  autosave.notify(VALID_DRAFT);
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(savedTitles).toEqual(["Canção"]);

  autosave.dispose();
});

function deferredSave() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("stale in-flight save does not report saved or error for the current draft", async () => {
  vi.useFakeTimers();
  const first = deferredSave();
  const second = deferredSave();
  let saveCount = 0;
  const statuses: SongAutosaveStatus[] = [];

  const autosave = createSongAutosave({
    save: () => {
      saveCount += 1;
      return saveCount === 1 ? first.promise : second.promise;
    },
    onStatus: (status) => statuses.push(status),
  });

  autosave.notify({ ...VALID_DRAFT, title: "Primeira" });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(autosave.getStatus()).toBe("saving");

  autosave.notify({ ...VALID_DRAFT, title: "Segunda" });
  expect(autosave.getStatus()).toBe("idle");

  first.resolve();
  await Promise.resolve();
  expect(autosave.getStatus()).toBe("idle");
  expect(statuses.includes("saved")).toBe(false);

  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(autosave.getStatus()).toBe("saving");

  second.resolve();
  await Promise.resolve();
  expect(autosave.getStatus()).toBe("saved");

  autosave.dispose();
});

test("stale in-flight error does not report error for the current draft", async () => {
  vi.useFakeTimers();
  const first = deferredSave();
  const second = deferredSave();
  let saveCount = 0;

  const autosave = createSongAutosave({
    save: () => {
      saveCount += 1;
      return saveCount === 1 ? first.promise : second.promise;
    },
  });

  autosave.notify({ ...VALID_DRAFT, title: "Primeira" });
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  autosave.notify({ ...VALID_DRAFT, title: "Segunda" });

  first.reject(new Error("save failed"));
  await Promise.resolve();
  expect(autosave.getStatus()).toBe("idle");

  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(autosave.getStatus()).toBe("saving");

  second.resolve();
  await Promise.resolve();
  expect(autosave.getStatus()).toBe("saved");

  autosave.dispose();
});

test("a failed save of the current draft reports error", async () => {
  vi.useFakeTimers();
  const autosave = createSongAutosave({
    save: async () => {
      throw new Error("save failed");
    },
  });

  autosave.notify(VALID_DRAFT);
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(autosave.getStatus()).toBe("error");

  autosave.dispose();
});

test("after a successful save, a dirty change clears status to idle before the next save", async () => {
  vi.useFakeTimers();
  const autosave = createSongAutosave({
    save: async () => undefined,
  });

  autosave.notify(VALID_DRAFT);
  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(autosave.getStatus()).toBe("saved");

  autosave.notify({ ...VALID_DRAFT, title: "Outro" });
  expect(autosave.getStatus()).toBe("idle");

  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS - 1);
  expect(autosave.getStatus()).toBe("idle");
  await vi.advanceTimersByTimeAsync(1);
  expect(autosave.getStatus()).toBe("saved");

  autosave.dispose();
});

test("flush saves immediately when the draft is savable and cancels the pending debounce", async () => {
  vi.useFakeTimers();
  const saved: SongAutosaveDraft[] = [];
  const autosave = createSongAutosave({
    save: async (draft) => {
      saved.push(draft);
    },
  });

  autosave.notify({ ...VALID_DRAFT, title: "Rascunho" });
  autosave.flush();
  await Promise.resolve();

  expect(saved).toEqual([
    {
      title: "Rascunho",
      cifraText: "Am\nLetra",
      chunks: [],
    },
  ]);
  expect(autosave.getStatus()).toBe("saved");

  await vi.advanceTimersByTimeAsync(SONG_AUTOSAVE_DELAY_MS);
  expect(saved).toEqual([
    {
      title: "Rascunho",
      cifraText: "Am\nLetra",
      chunks: [],
    },
  ]);

  autosave.notify({ ...VALID_DRAFT, title: "", cifraOk: true });
  autosave.flush();
  await Promise.resolve();
  expect(saved).toEqual([
    {
      title: "Rascunho",
      cifraText: "Am\nLetra",
      chunks: [],
    },
  ]);

  autosave.dispose();
});
