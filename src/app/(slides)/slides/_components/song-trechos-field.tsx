"use client";

import { useEffect, useRef, useState } from "react";

import {
  TrechosEditor,
  type TrechoDraft,
} from "~/app/_components/trechos-editor";
import {
  createDebouncedAutosave,
  type AutosaveStatus,
} from "~/lib/debounced-autosave";
import { api } from "~/trpc/react";

function toDrafts(chunks: { id: string; text: string }[]): TrechoDraft[] {
  return chunks.map((chunk) => ({ key: chunk.id, text: chunk.text }));
}

export function SongTrechosField({
  songId,
  chunks: initialChunks,
}: {
  songId: string;
  chunks: { id: string; text: string }[];
}) {
  const utils = api.useUtils();
  const [chunks, setChunks] = useState<TrechoDraft[]>(() =>
    toDrafts(initialChunks),
  );
  const [dirty, setDirty] = useState(false);
  const incoming = initialChunks
    .map((chunk) => `${chunk.id}\u0000${chunk.text}`)
    .join("\u0001");
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const updateChunks = api.song.updateChunks.useMutation();
  const mutateRef = useRef(updateChunks.mutateAsync);
  mutateRef.current = updateChunks.mutateAsync;
  const invalidateRef = useRef(utils.song.byId.invalidate);
  invalidateRef.current = utils.song.byId.invalidate;
  const autosaveRef = useRef<ReturnType<
    typeof createDebouncedAutosave<{ chunks: { text: string }[] }>
  > | null>(null);

  useEffect(() => {
    const autosave = createDebouncedAutosave<{ chunks: { text: string }[] }>({
      isSavable: () => true,
      save: async (draft) => {
        await mutateRef.current({ id: songId, chunks: draft.chunks });
        await invalidateRef.current({ id: songId });
      },
      onStatus: setStatus,
    });
    autosaveRef.current = autosave;
    return () => {
      autosave.flush();
      autosave.dispose();
      autosaveRef.current = null;
    };
  }, [songId]);

  useEffect(() => {
    if (dirty) return;
    setChunks(toDrafts(initialChunks));
  }, [dirty, incoming, initialChunks]);

  useEffect(() => {
    if (!dirty) return;
    autosaveRef.current?.notify({
      chunks: chunks.map(({ text }) => ({ text })),
    });
  }, [dirty, chunks]);

  const saveStatus =
    status === "saving"
      ? "Salvando…"
      : status === "error"
        ? "Erro ao salvar"
        : status === "saved"
          ? "Salvo"
          : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-sm font-medium">Trechos</p>
        {saveStatus ? (
          <p
            className={`text-sm ${
              status === "error" ? "text-accent" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {saveStatus}
          </p>
        ) : null}
      </div>
      {status === "error" && updateChunks.error ? (
        <p className="text-sm text-accent">{updateChunks.error.message}</p>
      ) : null}
      <TrechosEditor
        chunks={chunks}
        onChange={(next) => {
          setDirty(true);
          setChunks(next);
        }}
      />
    </div>
  );
}
