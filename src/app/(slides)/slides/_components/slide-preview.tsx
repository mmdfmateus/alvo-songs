import type { Slide } from "~/lib/slides";
import {
  DEFAULT_SLIDE_THEME_ID,
  getSlideTheme,
  type SlideThemeId,
} from "~/lib/slide-theme";
import { cn } from "~/lib/utils";

export function SlidePreview({
  slides,
  themeId = DEFAULT_SLIDE_THEME_ID,
}: {
  slides: Slide[];
  themeId?: SlideThemeId;
}) {
  const theme = getSlideTheme(themeId);

  if (slides.length === 0) {
    return <p className="text-muted-foreground">Nenhum slide ainda.</p>;
  }

  const titleFont =
    theme.id === "cardo"
      ? "var(--font-slide-cardo), Cardo, serif"
      : "var(--font-slide-montserrat), Montserrat, sans-serif";
  const bodyFont =
    theme.id === "cardo"
      ? "var(--font-slide-cardo), Cardo, serif"
      : "var(--font-slide-montserrat), Montserrat, sans-serif";

  return (
    <ul className="grid list-none gap-3 sm:grid-cols-2">
      {slides.map((slide, index) => (
        <li
          key={`${slide.kind}-${index}`}
          className="@container flex aspect-video flex-col items-center justify-center overflow-hidden rounded-[10px] border border-line p-[8cqw] text-center"
          style={{ background: theme.background, color: theme.text }}
        >
          {slide.kind === "opening" ? (
            <>
              <p
                className={cn(
                  "max-w-[90%] text-[7.8cqw] leading-none text-balance",
                  theme.titleTransform === "uppercase" && "uppercase",
                  theme.chip && "rounded-full px-[4cqw] py-[1.6cqw]",
                )}
                style={{
                  fontFamily: titleFont,
                  fontWeight: theme.titleFontWeight,
                  color: theme.chip ? theme.muted : theme.text,
                  background: theme.chip ? theme.chipBackground : undefined,
                }}
              >
                {slide.communityName}
              </p>
              {slide.subtitle ? (
                <p
                  className="mt-[2cqw] text-[2.9cqw] leading-snug"
                  style={{ fontFamily: bodyFont, color: theme.muted }}
                >
                  {slide.subtitle}
                </p>
              ) : null}
            </>
          ) : null}
          {slide.kind === "titleChip" ? (
            <p
              className={cn(
                "max-w-[90%] text-[7.3cqw] leading-none text-balance",
                theme.titleTransform === "uppercase" && "uppercase",
                theme.chip && "rounded-full px-[4cqw] py-[1.6cqw]",
              )}
              style={{
                fontFamily: titleFont,
                fontWeight: theme.titleFontWeight,
                color: theme.chip ? theme.muted : theme.text,
                background: theme.chip ? theme.chipBackground : undefined,
              }}
            >
              {slide.title}
            </p>
          ) : null}
          {slide.kind === "lyric" ? (
            <p
              className="w-full whitespace-pre-wrap text-center text-[5.729cqw] leading-[1.4]"
              style={{ fontFamily: bodyFont }}
            >
              {slide.text}
            </p>
          ) : null}
          {slide.kind === "blank" ? (
            <p
              className="text-[2.6cqw] opacity-70"
              style={{ fontFamily: bodyFont }}
            >
              Reservado para preencher depois
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
