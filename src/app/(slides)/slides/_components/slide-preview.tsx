import type { Slide } from "~/lib/slides";

export function SlidePreview({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) {
    return <p className="text-muted">Nenhum slide ainda.</p>;
  }

  return (
    <ul className="grid list-none gap-3 sm:grid-cols-2">
      {slides.map((slide, index) => (
        <li
          key={`${slide.kind}-${index}`}
          className="flex aspect-video flex-col justify-center rounded-[10px] border border-line bg-paper p-4 text-center"
        >
          {slide.kind === "opening" ? (
            <>
              <p className="text-lg font-semibold">{slide.communityName}</p>
              {slide.subtitle ? (
                <p className="text-sm text-muted">{slide.subtitle}</p>
              ) : null}
            </>
          ) : null}
          {slide.kind === "titleChip" ? (
            <p className="text-lg font-semibold">{slide.title}</p>
          ) : null}
          {slide.kind === "lyric" ? (
            <p className="whitespace-pre-wrap text-sm">{slide.text}</p>
          ) : null}
          {slide.kind === "blank" ? (
            <p className="text-sm text-muted">Reservado para preencher depois</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
