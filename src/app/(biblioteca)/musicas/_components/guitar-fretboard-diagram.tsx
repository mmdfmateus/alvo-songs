import type { GuitarVoicingStrings } from "~/lib/guitar-voicing";

const STRING_GAP = 18;
const FRET_HEIGHT = 26;
const PAD_X = 24;
const PAD_Y = 22;

export function GuitarFretboardDiagram({
  label,
  strings,
}: {
  label: string;
  strings: GuitarVoicingStrings;
}) {
  const fingered = strings.filter((fret): fret is number => fret !== null && fret > 0);
  const maxFret = fingered.length > 0 ? Math.max(...fingered) : 0;
  const minFret = fingered.length > 0 ? Math.min(...fingered) : 1;
  const startFret = maxFret <= 4 ? 1 : minFret;
  const fretCount = Math.max(4, maxFret - startFret + 1);
  const width = PAD_X * 2 + STRING_GAP * 5;
  const height = PAD_Y + FRET_HEIGHT * fretCount + 10;

  return (
    <svg
      role="img"
      aria-label={`Diagrama de ${label}`}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto w-full max-w-[220px] text-foreground"
    >
      {startFret === 1 ? (
        <line
          x1={PAD_X}
          y1={PAD_Y}
          x2={PAD_X + STRING_GAP * 5}
          y2={PAD_Y}
          stroke="currentColor"
          strokeWidth={4}
        />
      ) : (
        <text
          x={PAD_X - 10}
          y={PAD_Y + FRET_HEIGHT * 0.55}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {startFret}
        </text>
      )}
      {Array.from({ length: fretCount }, (_, index) => (
        <line
          key={`fret-${index}`}
          x1={PAD_X}
          y1={PAD_Y + FRET_HEIGHT * (index + 1)}
          x2={PAD_X + STRING_GAP * 5}
          y2={PAD_Y + FRET_HEIGHT * (index + 1)}
          stroke="currentColor"
          strokeWidth={1}
        />
      ))}
      {strings.map((fret, stringIndex) => {
        const x = PAD_X + stringIndex * STRING_GAP;
        return (
          <g key={`string-${stringIndex}`}>
            <line
              x1={x}
              y1={PAD_Y}
              x2={x}
              y2={PAD_Y + FRET_HEIGHT * fretCount}
              stroke="currentColor"
              strokeWidth={stringIndex === 0 ? 2 : 1}
            />
            {fret === null ? (
              <text
                x={x}
                y={PAD_Y - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                ×
              </text>
            ) : fret === 0 ? (
              <circle
                cx={x}
                cy={PAD_Y - 10}
                r={4}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.25}
              />
            ) : (
              <circle
                cx={x}
                cy={PAD_Y + FRET_HEIGHT * (fret - startFret + 0.5)}
                r={6}
                className="fill-accent"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
