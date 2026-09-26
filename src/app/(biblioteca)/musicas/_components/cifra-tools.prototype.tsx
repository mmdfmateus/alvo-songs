"use client";

import { useState, type ReactNode } from "react";

import type { CifraTomControls } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import type { CifraViewLine } from "~/lib/cifra";

/**
 * PROTOTYPE — throwaway.
 * Question: Tom/Acordes as top-right icons that match this site, without layout shift.
 * Variants disagree on how the panel opens (overlay / side overlay / reserved slot).
 * Run: pnpm prototype:cifra-reading-tools  then /musicas/<id>?variant=A
 */

export const CIFRA_TOOL_VARIANT_NAMES = {
  A: "Dropdown overlay",
  B: "Side overlay",
  C: "Reserved slot",
} as const;

export type CifraToolVariant = keyof typeof CIFRA_TOOL_VARIANT_NAMES;

const toolBtn =
  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-sm font-semibold text-muted-foreground hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

const toolBtnOn = "bg-ink text-white hover:text-white";

function TomMark() {
  return (
    <span className="text-base font-semibold leading-none" aria-hidden>
      ♯
    </span>
  );
}

/** Six dots — same language as the Slides grip, not a lucide guitar. */
function AcordesMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-3.5"
      aria-hidden
    >
      <circle cx="3" cy="4" r="1.35" />
      <circle cx="8" cy="4" r="1.35" />
      <circle cx="13" cy="4" r="1.35" />
      <circle cx="3" cy="12" r="1.35" />
      <circle cx="8" cy="12" r="1.35" />
      <circle cx="13" cy="12" r="1.35" />
    </svg>
  );
}

function TomPanel({ tom }: { tom: CifraTomControls }) {
  return (
    <div
      role="group"
      aria-label="Alterar tom"
      className="flex flex-wrap items-center gap-1"
    >
      <button
        type="button"
        aria-label="Diminuir tom"
        className={toolBtn}
        onClick={tom.onLower}
      >
        −
      </button>
      <button
        type="button"
        aria-label="Aumentar tom"
        className={toolBtn}
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
    <div className="flex max-w-[14rem] gap-1 overflow-x-auto">
      {names.map((name) => (
        <span
          key={name}
          className="shrink-0 rounded-full bg-[#f0f0ec] px-2.5 py-1 text-xs font-semibold text-accent"
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

function ToolIcons({
  open,
  onOpen,
  semitones,
}: {
  open: "tom" | "acordes" | null;
  onOpen: (next: "tom" | "acordes" | null) => void;
  semitones: number;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        aria-label="Tom"
        aria-pressed={open === "tom"}
        className={`${toolBtn} ${open === "tom" ? toolBtnOn : ""}`}
        onClick={() => onOpen(open === "tom" ? null : "tom")}
      >
        <TomMark />
      </button>
      <button
        type="button"
        aria-label="Acordes"
        aria-pressed={open === "acordes"}
        className={`${toolBtn} ${open === "acordes" ? toolBtnOn : ""}`}
        onClick={() => onOpen(open === "acordes" ? null : "acordes")}
      >
        <AcordesMark />
      </button>
      {semitones !== 0 ? (
        <span role="status" className="sr-only">
          Tom {semitones > 0 ? `+${semitones}` : semitones}
        </span>
      ) : null}
    </div>
  );
}

function PanelBody({
  open,
  tom,
  names,
}: {
  open: "tom" | "acordes" | null;
  tom: CifraTomControls;
  names: string[];
}) {
  if (open === "tom") return <TomPanel tom={tom} />;
  if (open === "acordes") return <AcordesPanel names={names} />;
  return null;
}

export function VariantA({
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
      <div className="relative mb-4 flex items-center justify-between gap-3">
        {tablist}
        <ToolIcons open={open} onOpen={setOpen} semitones={tom.semitones} />
        {open ? (
          <div className="absolute top-full right-0 z-20 mt-1 rounded-[10px] border border-line bg-paper p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <PanelBody open={open} tom={tom} names={names} />
          </div>
        ) : null}
      </div>
      {sheet}
      <PrototypeState
        variant="A"
        open={open}
        shift="overlay-dropdown"
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
        <ToolIcons open={open} onOpen={setOpen} semitones={tom.semitones} />
      </div>
      <div className="relative">
        {sheet}
        {open ? (
          <div className="absolute top-0 right-0 z-20 w-44 rounded-[10px] border border-line bg-paper/95 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {open === "tom" ? "Tom" : "Acordes"}
            </p>
            <PanelBody open={open} tom={tom} names={names} />
          </div>
        ) : null}
      </div>
      <PrototypeState
        variant="B"
        open={open}
        shift="overlay-on-cifra"
        semitones={tom.semitones}
        acordes={names.length}
      />
    </div>
  );
}

export function VariantC({
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
      <div className="mb-2 flex items-center justify-between gap-3">
        {tablist}
        <ToolIcons open={open} onOpen={setOpen} semitones={tom.semitones} />
      </div>
      <div className="mb-3 flex h-10 items-center justify-end overflow-hidden">
        <PanelBody open={open} tom={tom} names={names} />
      </div>
      {sheet}
      <PrototypeState
        variant="C"
        open={open}
        shift="reserved-row"
        semitones={tom.semitones}
        acordes={names.length}
      />
    </div>
  );
}

function PrototypeState({
  variant,
  open,
  shift,
  semitones,
  acordes,
}: {
  variant: string;
  open: string | null;
  shift: string;
  semitones: number;
  acordes: number;
}) {
  return (
    <pre className="mt-8 max-w-md rounded-md bg-[#f0f0ec] p-3 text-[11px] leading-relaxed text-muted-foreground">
      {JSON.stringify({ variant, open, shift, semitones, uniqueChords: acordes }, null, 2)}
    </pre>
  );
}
