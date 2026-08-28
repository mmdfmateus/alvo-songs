import type { CifraViewLine } from "~/lib/cifra";

const tomButtonClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-paper px-3 text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-40";

export type CifraTomControls = {
  semitones: number;
  onLower: () => void;
  onRaise: () => void;
  onReset: () => void;
};

function tomStatusLabel(semitones: number) {
  if (semitones === 0) return "Tom original";
  if (semitones > 0) return `Tom +${semitones}`;
  return `Tom ${semitones}`;
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
        <div
          role="group"
          aria-label="Tom"
          className="mb-3 flex flex-wrap items-center gap-2"
        >
          <span className="text-sm font-semibold">Tom</span>
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
          <span role="status" className="text-sm text-muted-foreground">
            {tomStatusLabel(tom.semitones)}
          </span>
        </div>
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
