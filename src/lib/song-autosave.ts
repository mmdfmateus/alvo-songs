export const SONG_AUTOSAVE_DELAY_MS = 600;

export type SongAutosaveStatus = "idle" | "saving" | "saved" | "error";

export type SongAutosaveDraft = {
  title: string;
  cifraText: string;
  artistId?: string;
  videoId?: string;
  chunks: { text: string }[];
};

export type SongAutosaveNotify = SongAutosaveDraft & {
  cifraOk: boolean;
};

export function createSongAutosave(options: {
  save: (draft: SongAutosaveDraft) => Promise<void>;
  onStatus?: (status: SongAutosaveStatus) => void;
}) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let status: SongAutosaveStatus = "idle";
  let generation = 0;
  let latest: SongAutosaveNotify | null = null;
  let inFlight = false;
  let pending = false;

  function setStatus(next: SongAutosaveStatus) {
    status = next;
    options.onStatus?.(next);
  }

  function isSavable(draft: SongAutosaveNotify) {
    return draft.title.trim().length > 0 && draft.cifraOk;
  }

  function payload(draft: SongAutosaveNotify): SongAutosaveDraft {
    return {
      title: draft.title,
      cifraText: draft.cifraText,
      artistId: draft.artistId,
      videoId: draft.videoId,
      chunks: draft.chunks,
    };
  }

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    clearTimer();
    const gen = generation;
    timer = setTimeout(() => {
      timer = null;
      if (gen !== generation) return;
      void runSave();
    }, SONG_AUTOSAVE_DELAY_MS);
  }

  async function runSave() {
    if (inFlight) {
      pending = true;
      return;
    }
    const draft = latest;
    if (!draft || !isSavable(draft)) return;
    const gen = generation;
    inFlight = true;
    pending = false;
    setStatus("saving");
    try {
      await options.save(payload(draft));
      if (gen === generation) setStatus("saved");
    } catch {
      if (gen === generation) setStatus("error");
    } finally {
      inFlight = false;
    }
    if (pending && latest && isSavable(latest)) {
      pending = false;
      void runSave();
    }
  }

  return {
    notify(draft: SongAutosaveNotify) {
      generation += 1;
      latest = draft;
      if (status !== "idle") setStatus("idle");
      clearTimer();
      if (!isSavable(draft)) return;
      schedule();
    },
    flush() {
      generation += 1;
      clearTimer();
      if (latest && isSavable(latest)) {
        void runSave();
      }
    },
    getStatus(): SongAutosaveStatus {
      return status;
    },
    dispose() {
      generation += 1;
      pending = false;
      clearTimer();
    },
  };
}
