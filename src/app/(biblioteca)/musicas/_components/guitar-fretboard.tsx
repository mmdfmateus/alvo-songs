import type { FretMark } from "~/lib/chord-voicings";

const STRING_COUNT = 6;
const FRET_COUNT = 4;

export function GuitarFretboard({
  frets,
  label,
}: {
  frets: readonly FretMark[];
  label: string;
}) {
  const pressed = frets.filter((fret): fret is number => fret !== "x" && fret > 0);
  const maxFret = pressed.length > 0 ? Math.max(...pressed) : 0;
  const minFret = pressed.length > 0 ? Math.min(...pressed) : 1;
  const startFret = maxFret <= FRET_COUNT ? 1 : minFret;
  const showNut = startFret === 1;

  const width = 132;
  const height = 168;
  const padX = 22;
  const padY = 28;
  const gridW = width - padX * 2;
  const gridH = height - padY - 16;
  const stringGap = gridW / (STRING_COUNT - 1);
  const fretGap = gridH / FRET_COUNT;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-40 w-auto text-foreground"
      role="img"
      aria-label={`Diagrama de ${label}`}
    >
      {frets.map((fret, stringIndex) => {
        const x = padX + stringIndex * stringGap;
        if (fret === "x") {
          return (
            <text
              key={`mute-${stringIndex}`}
              x={x}
              y={16}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={`open-${stringIndex}`}
              cx={x}
              cy={12}
              r={4}
              className="fill-none stroke-foreground"
              strokeWidth="1.5"
            />
          );
        }
        return null;
      })}
      {showNut ? (
        <rect
          x={padX - 1}
          y={padY - 3}
          width={gridW + 2}
          height={4}
          className="fill-foreground"
        />
      ) : (
        <text
          x={8}
          y={padY + fretGap / 2 + 4}
          className="fill-muted-foreground text-[10px]"
        >
          {startFret}
        </text>
      )}
      {Array.from({ length: STRING_COUNT }, (_, stringIndex) => (
        <line
          key={`string-${stringIndex}`}
          x1={padX + stringIndex * stringGap}
          y1={padY}
          x2={padX + stringIndex * stringGap}
          y2={padY + gridH}
          className="stroke-foreground"
          strokeWidth={stringIndex === 0 ? 2 : 1}
        />
      ))}
      {Array.from({ length: FRET_COUNT + 1 }, (_, fretIndex) => (
        <line
          key={`fret-${fretIndex}`}
          x1={padX}
          y1={padY + fretIndex * fretGap}
          x2={padX + gridW}
          y2={padY + fretIndex * fretGap}
          className="stroke-foreground"
          strokeWidth="1"
        />
      ))}
      {frets.map((fret, stringIndex) => {
        if (fret === "x" || fret === 0) return null;
        const relative = fret - startFret;
        if (relative < 0 || relative >= FRET_COUNT) return null;
        const x = padX + stringIndex * stringGap;
        const y = padY + relative * fretGap + fretGap / 2;
        return (
          <circle
            key={`dot-${stringIndex}`}
            cx={x}
            cy={y}
            r={7}
            className="fill-foreground"
          />
        );
      })}
    </svg>
  );
}
