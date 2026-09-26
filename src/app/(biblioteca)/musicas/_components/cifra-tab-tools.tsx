"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "~/lib/utils";

export type CifraTomControls = {
  semitones: number;
  onLower: () => void;
  onRaise: () => void;
  onReset: () => void;
};

const toolBtn =
  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-sm font-semibold text-ink hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

const toolBtnOn = "bg-ink text-white hover:bg-ink hover:text-white";

function TomMark() {
  return (
    <span className="text-base font-semibold leading-none" aria-hidden>
      ♯
    </span>
  );
}

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

function useCloseOnOutside(open: boolean, onClose: () => void) {
  const parts = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (parts.current.some((node) => node?.contains(target))) return;
      onClose();
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return function bind(index: number) {
    return (node: HTMLElement | null) => {
      parts.current[index] = node;
    };
  };
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

/**
 * Top-right Tom / Acordes icons (prototype variant B).
 * Pass `tom` and/or `acordes` so #51 and #53 can land independently.
 */
export function CifraTabTools({
  tablist,
  tom,
  acordes,
  sheet,
}: {
  tablist: ReactNode;
  tom?: CifraTomControls;
  acordes?: ReactNode;
  sheet: ReactNode;
}) {
  const [open, setOpen] = useState<"tom" | "acordes" | null>(null);
  const bind = useCloseOnOutside(open !== null, () => setOpen(null));
  const showTom = Boolean(tom);
  const showAcordes = Boolean(acordes);

  if (!showTom && !showAcordes) {
    return (
      <div>
        <div className="mb-4">{tablist}</div>
        {sheet}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        {tablist}
        <div
          ref={bind(0)}
          className="flex shrink-0 items-center rounded-full border border-line bg-[#f0f0ec] p-0.5"
        >
          {showTom ? (
            <button
              type="button"
              aria-label="Tom"
              aria-pressed={open === "tom"}
              className={cn(toolBtn, open === "tom" && toolBtnOn)}
              onClick={() => setOpen(open === "tom" ? null : "tom")}
            >
              <TomMark />
            </button>
          ) : null}
          {showAcordes ? (
            <button
              type="button"
              aria-label="Acordes"
              aria-pressed={open === "acordes"}
              className={cn(toolBtn, open === "acordes" && toolBtnOn)}
              onClick={() => setOpen(open === "acordes" ? null : "acordes")}
            >
              <AcordesMark />
            </button>
          ) : null}
        </div>
      </div>
      <div className="relative">
        {sheet}
        {showTom ? (
          <div
            ref={bind(1)}
            hidden={open !== "tom"}
            className="absolute top-0 right-0 z-20 w-48 rounded-[10px] border border-line bg-paper p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Tom
            </p>
            {tom ? <TomPanel tom={tom} /> : null}
          </div>
        ) : null}
        {showAcordes ? (
          <div
            ref={bind(2)}
            hidden={open !== "acordes"}
            className="absolute top-0 right-0 z-20 max-w-[min(100%,20rem)] rounded-[10px] border border-line bg-paper p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Acordes
            </p>
            {acordes}
          </div>
        ) : null}
      </div>
    </div>
  );
}
