"use client";

import { useState } from "react";

export type TrechoDraft = { key: string; text: string };

function newChunkKey() {
  return crypto.randomUUID();
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconGrip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}

export function TrechosEditor({
  chunks,
  onChange,
}: {
  chunks: TrechoDraft[];
  onChange: (chunks: TrechoDraft[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= chunks.length) return;
    const copy = [...chunks];
    const [item] = copy.splice(from, 1);
    if (!item) return;
    copy.splice(to, 0, item);
    onChange(copy);
  }

  return (
    <div className="flex flex-col gap-3">
      {chunks.map((chunk, index) => (
        <div
          key={chunk.key}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (dragIndex === null || dragIndex === index) return;
            reorder(dragIndex, index);
            setDragIndex(index);
          }}
          className={`flex flex-col gap-2 rounded-[10px] border border-line bg-paper p-4 ${
            dragIndex === index ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              draggable
              aria-label="Arrastar trecho"
              title="Arrastar"
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
                setDragIndex(index);
              }}
              onDragEnd={() => setDragIndex(null)}
              className="cursor-grab touch-none text-muted-foreground hover:text-ink active:cursor-grabbing"
            >
              <IconGrip className="size-4" />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Subir"
                title="Subir"
                onClick={() => reorder(index, index - 1)}
                disabled={index === 0}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
              >
                <IconArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Descer"
                title="Descer"
                onClick={() => reorder(index, index + 1)}
                disabled={index === chunks.length - 1}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
              >
                <IconArrowDown className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Remover"
                title="Remover"
                onClick={() => {
                  if (window.confirm("Remover este Trecho?")) {
                    onChange(chunks.filter((_, i) => i !== index));
                  }
                }}
                className="rounded-md p-1.5 text-accent hover:bg-[#f0f0ec]"
              >
                <IconTrash className="size-4" />
              </button>
            </div>
          </div>
          <textarea
            value={chunk.text}
            aria-label={`Trecho ${index + 1}`}
            onChange={(event) => {
              const copy = [...chunks];
              const current = copy[index];
              if (!current) return;
              copy[index] = { ...current, text: event.target.value };
              onChange(copy);
            }}
            rows={4}
            className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal leading-relaxed"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...chunks, { key: newChunkKey(), text: "" }])}
        className="self-start rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
      >
        Adicionar trecho
      </button>
    </div>
  );
}
