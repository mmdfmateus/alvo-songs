import {
  AUTOSAVE_DELAY_MS,
  createDebouncedAutosave,
  type AutosaveStatus,
} from "~/lib/debounced-autosave";

export const PROGRAM_AUTOSAVE_DELAY_MS = AUTOSAVE_DELAY_MS;

export type ProgramAutosaveStatus = AutosaveStatus;

export type ProgramAutosaveSection =
  | {
      type: "opening";
      payload: { communityName: string; subtitle?: string };
    }
  | {
      type: "song";
      songId: string | null;
      payload?: object;
    }
  | {
      type: "announcements" | "game" | "moment";
      payload: { title: string };
    };

export type ProgramAutosaveDraft = {
  name: string;
  sections: ProgramAutosaveSection[];
};

export function isProgramDraftSavable(draft: ProgramAutosaveDraft): boolean {
  if (!draft.name.trim()) return false;
  return draft.sections.every((section) => {
    if (section.type === "opening") {
      return section.payload.communityName.trim().length > 0;
    }
    if (section.type === "song") return true;
    return section.payload.title.trim().length > 0;
  });
}

export function createProgramAutosave(options: {
  save: (draft: ProgramAutosaveDraft) => Promise<void>;
  onStatus?: (status: ProgramAutosaveStatus) => void;
}) {
  return createDebouncedAutosave<ProgramAutosaveDraft>({
    delayMs: PROGRAM_AUTOSAVE_DELAY_MS,
    isSavable: isProgramDraftSavable,
    save: options.save,
    onStatus: options.onStatus,
  });
}
