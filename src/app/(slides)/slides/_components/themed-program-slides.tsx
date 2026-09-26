"use client";

import { ExportPdfButton } from "~/app/(slides)/slides/_components/export-pdf-button";
import { SlidePreview } from "~/app/(slides)/slides/_components/slide-preview";
import {
  SlideThemePicker,
  useSlideTheme,
} from "~/app/(slides)/slides/_components/slide-theme-picker";
import type { Slide } from "~/lib/slides";

export function ThemedProgramSlides({
  programId,
  programName,
  slides,
}: {
  programId: string;
  programName: string;
  slides: Slide[];
}) {
  const { themeId, chooseTheme } = useSlideTheme(programId);

  return (
    <>
      <div className="mb-3">
        <SlideThemePicker value={themeId} onChange={chooseTheme} />
      </div>
      <ExportPdfButton
        slides={slides}
        programName={programName}
        themeId={themeId}
      />
      <SlidePreview slides={slides} themeId={themeId} />
    </>
  );
}
