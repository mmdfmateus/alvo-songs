import type { Slide } from "~/lib/slides";

function labelFor(slide: Slide): string {
  switch (slide.kind) {
    case "opening":
      return "Abertura";
    case "titleChip":
      return "Título";
    case "lyric":
      return "Trecho";
    case "blank":
      return "Slide em branco";
  }
}

export function SlidePreview({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) {
    return <p className="text-muted">Nenhum slide ainda.</p>;
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {slides.map((slide, index) => (
        <li
          key={`${slide.kind}-${index}`}
          className="flex aspect-video flex-col justify-center rounded-[10px] border border-line bg-paper p-4 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {labelFor(slide)}
          </p>
          {slide.kind === "opening" ? (
            <>
              <p className="mt-2 text-lg font-semibold">{slide.communityName}</p>
              {slide.subtitle ? (
                <p className="text-sm text-muted">{slide.subtitle}</p>
              ) : null}
            </>
          ) : null}
          {slide.kind === "titleChip" ? (
            <p className="mt-2 text-lg font-semibold">{slide.title}</p>
          ) : null}
          {slide.kind === "lyric" ? (
            <p className="mt-2 whitespace-pre-wrap text-sm">{slide.text}</p>
          ) : null}
          {slide.kind === "blank" ? (
            <p className="mt-2 text-sm text-muted">Reservado para preencher depois</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
