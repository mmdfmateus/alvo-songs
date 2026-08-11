export const AUTOSAVE_DELAY_MS = 600;

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function createDebouncedAutosave<T>(options: {
  delayMs?: number;
  isSavable: (draft: T) => boolean;
  save: (draft: T) => Promise<void>;
  onStatus?: (status: AutosaveStatus) => void;
}) {
  const delayMs = options.delayMs ?? AUTOSAVE_DELAY_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let status: AutosaveStatus = "idle";
  let generation = 0;
  let latest: T | null = null;
  let inFlight = false;
  let pending = false;

  function setStatus(next: AutosaveStatus) {
    status = next;
    options.onStatus?.(next);
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
    }, delayMs);
  }

  async function runSave() {
    if (inFlight) {
      pending = true;
      return;
    }
    const draft = latest;
    if (!draft || !options.isSavable(draft)) return;
    const gen = generation;
    inFlight = true;
    pending = false;
    setStatus("saving");
    try {
      await options.save(draft);
      if (gen === generation) setStatus("saved");
    } catch {
      if (gen === generation) setStatus("error");
    } finally {
      inFlight = false;
    }
    if (pending && latest && options.isSavable(latest)) {
      pending = false;
      void runSave();
    }
  }

  return {
    notify(draft: T) {
      generation += 1;
      latest = draft;
      if (status !== "idle") setStatus("idle");
      clearTimer();
      if (!options.isSavable(draft)) return;
      schedule();
    },
    flush() {
      generation += 1;
      clearTimer();
      if (latest && options.isSavable(latest)) {
        void runSave();
      }
    },
    getStatus(): AutosaveStatus {
      return status;
    },
    dispose() {
      generation += 1;
      pending = false;
      clearTimer();
    },
  };
}
