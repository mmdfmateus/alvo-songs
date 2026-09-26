"use client";

import { useState, type ReactNode } from "react";
import { Guitar, Music2 } from "lucide-react";

import type { CifraTomControls } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import type { CifraViewLine } from "~/lib/cifra";

/**
 * PROTOTYPE — throwaway.
 * Question: what should Tom / Acordes chrome look like, without a wide horizontal pill?
 * Three variants of Cifra reading tools, switchable via ?variant=, on /musicas/[id].
 * Run: pnpm prototype:cifra-reading-tools  then open a Song with ?variant=A
 */

export const CIFRA_TOOL_VARIANT_NAMES = {
  A: "Icon cluster",
  B: "Tools on the tab row",
  C: "Text links, no chrome",
} as const;

export type CifraToolVariant = keyof typeof CIFRA_TOOL_VARIANT_NAMES;

const iconBtn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink hover:bg-[#f0f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

function TomPanel({ tom }: { tom: CifraTomControls }) {
  return (
    <div
      role="group"
      aria-label="Alterar tom"
      className="flex flex-wrap items-center gap-1.5"
    >
      <button
        type="button"
        aria-label="Diminuir tom"
        className={iconBtn}
        onClick={tom.onLower}
      >
        −
      </button>
      <button
        type="button"
        aria-label="Aumentar tom"
        className={iconBtn}
        onClick={tom.onRaise}
      >
        +
      </button>
      <button
        type="button"
        aria-label="Restaurar tom original"
        className="px-2 text-xs font-semibold text-muted-foreground disabled:opacity-40"
        disabled={tom.semitones === 0}
        onClick={tom.onReset}
      >
        Original
      </button>
    </div>
  );
}

function AcordesPanel({ names }: { names: string[] }) {
  return (
    <div className="flex max-w-[16rem] gap-1 overflow-x-auto pb-0.5">
      {names.map((name) => (
        <span
          key={name}
          className="shrink-0 rounded bg-secondary px-2 py-1 text-xs font-semibold text-accent"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

function uniqueNames(lines: CifraViewLine[]) {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    for (const part of line.parts) {
      const name = part.chords.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function VariantA({
  lines,
  tom,
  sheet,
}: {
  lines: CifraViewLine[];
  tom: CifraTomControls;
  sheet: ReactNode;
}) {
  const [open, setOpen] = useState<"tom" | "acordes" | null>(null);
  const names = uniqueNames(lines);
  return (
    <div>
      <div className="mb-3 flex w-fit gap-0.5 rounded-md border border-line bg-paper p-0.5">
        <button
          type="button"
          aria-label="Tom"
          aria-pressed={open === "tom"}
          className={`${iconBtn} ${open === "tom" ? "bg-[#f0f0ec]" : ""}`}
          onClick={() => setOpen(open === "tom" ? null : "tom")}
        >
          <Music2 className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Acordes"
          aria-pressed={open === "acordes"}
          className={`${iconBtn} ${open === "acordes" ? "bg-[#f0f0ec]" : ""}`}
          onClick={() => setOpen(open === "acordes" ? null : "acordes")}
        >
          <Guitar className="size-4" strokeWidth={1.5} />
        </button>
      </div>
      {open === "tom" ? (
        <div className="mb-3 w-fit rounded-md border border-line bg-paper px-2 py-1.5">
          <TomPanel tom={tom} />
        </div>
      ) : null}
      {open === "acordes" ? (
        <div className="mb-3 w-fit rounded-md border border-line bg-paper p-2">
          <AcordesPanel names={names} />
        </div>
      ) : null}
      {sheet}
      <PrototypeState
        variant="A"
        open={open}
        semitones={tom.semitones}
        acordes={names.length}
      />
    </div>
  );
}

export function VariantB({
  tablist,
  lines,
  tom,
  sheet,
}: {
  tablist: ReactNode;
  lines: CifraViewLine[];
  tom: CifraTomControls;
  sheet: ReactNode;
}) {
  const [open, setOpen] = useState<"tom" | "acordes" | null>(null);
  const names = uniqueNames(lines);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        {tablist}
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Tom"
            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setOpen(open === "tom" ? null : "tom")}
          >
            Tom{tom.semitones !== 0 ? ` ${tom.semitones > 0 ? "+" : ""}${tom.semitones}` : ""}
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            aria-label="Acordes"
            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setOpen(open === "acordes" ? null : "acordes")}
          >
            Acordes
          </button>
        </div>
      </div>
      {open === "tom" ? (
        <div className="mb-3 flex justify-end">
          <TomPanel tom={tom} />
        </div>
      ) : null}
      {open === "acordes" ? (
        <div className="mb-3 flex justify-end">
          <AcordesPanel names={names} />
        </div>
      ) : null}
      {sheet}
      <PrototypeState
        variant="B"
        open={open}
        semitones={tom.semitones}
        acordes={names.length}
      />
    </div>
  );
}

export function VariantC({
  lines,
  tom,
  sheet,
}: {
  lines: CifraViewLine[];
  tom: CifraTomControls;
  sheet: ReactNode;
}) {
  const [open, setOpen] = useState<"tom" | "acordes" | null>(null);
  const names = uniqueNames(lines);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Ferramentas da Cifra"
        className="absolute top-0 right-0 z-10 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
        onClick={() => setOpen(open ? null : "tom")}
      >
        {open ? "Fechar" : "Mais"}
      </button>
      {open ? (
        <div className="mb-8 space-y-3 border-b border-line pb-3">
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Tom
            </p>
            <TomPanel tom={tom} />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Acordes
            </p>
            <AcordesPanel names={names} />
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground"
            onClick={() => setOpen(open === "acordes" ? "tom" : "acordes")}
          >
            foco: {open}
          </button>
        </div>
      ) : (
        <div className="h-5" />
      )}
      {sheet}
      <PrototypeState
        variant="C"
        open={open}
        semitones={tom.semitones}
        acordes={names.length}
      />
    </div>
  );
}

function PrototypeState({
  variant,
  open,
  semitones,
  acordes,
}: {
  variant: string;
  open: string | null;
  semitones: number;
  acordes: number;
}) {
  return (
    <pre className="mt-8 max-w-md rounded-md bg-[#f0f0ec] p-3 text-[11px] leading-relaxed text-muted-foreground">
      {JSON.stringify({ variant, open, semitones, uniqueChords: acordes }, null, 2)}
    </pre>
  );
}
