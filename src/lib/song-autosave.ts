import {
  AUTOSAVE_DELAY_MS,
  createDebouncedAutosave,
  type AutosaveStatus,
} from "~/lib/debounced-autosave";

export const SONG_AUTOSAVE_DELAY_MS = AUTOSAVE_DELAY_MS;

export type SongAutosaveStatus = AutosaveStatus;

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
  return createDebouncedAutosave<SongAutosaveNotify>({
    delayMs: SONG_AUTOSAVE_DELAY_MS,
    isSavable: (draft) => draft.title.trim().length > 0 && draft.cifraOk,
    save: (draft) =>
      options.save({
        title: draft.title,
        cifraText: draft.cifraText,
        artistId: draft.artistId,
        videoId: draft.videoId,
        chunks: draft.chunks,
      }),
    onStatus: options.onStatus,
  });
}
