"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_SLIDE_THEME_ID,
  getSlideTheme,
  isSlideThemeId,
  readStoredSlideTheme,
  SLIDE_THEMES,
  writeStoredSlideTheme,
  type SlideThemeId,
} from "~/lib/slide-theme";
import { cn } from "~/lib/utils";

export function useSlideTheme(programId: string) {
  const [themeId, setThemeId] = useState<SlideThemeId>(DEFAULT_SLIDE_THEME_ID);

  useEffect(() => {
    setThemeId(readStoredSlideTheme(programId));
  }, [programId]);

  function chooseTheme(next: SlideThemeId) {
    setThemeId(next);
    writeStoredSlideTheme(programId, next);
  }

  return { themeId, theme: getSlideTheme(themeId), chooseTheme };
}

export function SlideThemePicker({
  value,
  onChange,
}: {
  value: SlideThemeId;
  onChange: (themeId: SlideThemeId) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="text-sm font-medium">Estilo</legend>
      {Object.values(SLIDE_THEMES).map((theme) => {
        const selected = theme.id === value;
        return (
          <label
            key={theme.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold focus-within:ring-3 focus-within:ring-ring/50",
              selected
                ? "border-ink bg-ink text-white"
                : "border-line hover:bg-[#fafafa]",
            )}
          >
            <input
              type="radio"
              name="slide-theme"
              value={theme.id}
              checked={selected}
              onChange={(event) => {
                if (isSlideThemeId(event.target.value)) onChange(event.target.value);
              }}
              className="sr-only"
            />
            <span
              aria-hidden
              className="size-3 rounded-full border border-black/10"
              style={{ background: theme.background }}
            />
            {theme.label}
          </label>
        );
      })}
    </fieldset>
  );
}
