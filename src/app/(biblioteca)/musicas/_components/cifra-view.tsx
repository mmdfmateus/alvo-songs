import type { CifraViewLine } from "~/lib/cifra";

const tomButtonClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-paper px-3 text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-40";

const tomSummaryClassName =
  "flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-paper px-3.5 text-sm font-semibold text-ink marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink [&::-webkit-details-marker]:hidden";

export type CifraTomControls = {
  semitones: number;
  onLower: () => void;
  onRaise: () => void;
  onReset: () => void;
};

function tomOffsetLabel(semitones: number) {
  if (semitones === 0) return null;
  if (semitones > 0) return `+${semitones}`;
  return String(semitones);
}

export function CifraView({
  lines,
  tom,
}: {
  lines: CifraViewLine[];
  tom?: CifraTomControls;
}) {
  return (
    <div>
      {tom ? (
        <details className="mb-3" aria-label="Tom">
          <summary className={tomSummaryClassName}>
            Tom
            {tomOffsetLabel(tom.semitones) ? (
              <span role="status" className="font-medium text-accent">
                {tomOffsetLabel(tom.semitones)}
              </span>
            ) : null}
          </summary>
          <div
            role="group"
            aria-label="Alterar tom"
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              aria-label="Diminuir tom"
              className={tomButtonClassName}
              onClick={tom.onLower}
            >
              −
            </button>
            <button
              type="button"
              aria-label="Aumentar tom"
              className={tomButtonClassName}
              onClick={tom.onRaise}
            >
              +
            </button>
            <button
              type="button"
              aria-label="Restaurar tom original"
              className={tomButtonClassName}
              disabled={tom.semitones === 0}
              onClick={tom.onReset}
            >
              Original
            </button>
          </div>
        </details>
      ) : null}
      <div className="font-mono text-[15px] leading-tight sm:text-base">
        {lines.map((line, lineIndex) =>
          line.parts.length === 0 ? (
            <div key={lineIndex} className="h-4" />
          ) : (
            <div key={lineIndex} className="mb-1 overflow-x-auto">
              <div className="inline-flex flex-nowrap items-end">
                {line.parts.map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className="inline-flex flex-col whitespace-pre"
                  >
                    <span className="min-h-[1.15em] font-semibold text-accent">
                      {part.chords || " "}
                    </span>
                    <span>{part.lyrics || " "}</span>
                  </span>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
