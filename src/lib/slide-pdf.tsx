import type { ReactNode } from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { registerSlideFonts } from "~/lib/slide-fonts";
import {
  DEFAULT_SLIDE_THEME_ID,
  getSlideTheme,
  type SlideTheme,
  type SlideThemeId,
} from "~/lib/slide-theme";
import type { Slide } from "~/lib/slides";

export const PDF_PAGE_WIDTH = 960;
export const PDF_PAGE_HEIGHT = 540;

const PAGE_SIZE = { width: PDF_PAGE_WIDTH, height: PDF_PAGE_HEIGHT } as const;

registerSlideFonts();

function pdfStyles(theme: SlideTheme) {
  return StyleSheet.create({
    page: {
      backgroundColor: theme.background,
      color: theme.text,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 64,
    },
    communityName: {
      fontSize: theme.openingSize,
      fontFamily: theme.titleFontFamily,
      fontWeight: theme.titleFontWeight,
      color: theme.chip ? theme.muted : theme.text,
      textAlign: "center",
      textTransform: theme.titleTransform,
    },
    subtitle: {
      marginTop: 16,
      fontSize: theme.subtitleSize,
      fontFamily: theme.fontFamily,
      fontWeight: 400,
      color: theme.chip ? theme.muted : theme.text,
      textAlign: "center",
    },
    title: {
      fontSize: theme.titleSize,
      fontFamily: theme.titleFontFamily,
      fontWeight: theme.titleFontWeight,
      color: theme.chip ? theme.muted : theme.text,
      textAlign: "center",
      textTransform: theme.titleTransform,
    },
    lyric: {
      width: "100%",
      fontSize: theme.lyricSize,
      fontFamily: theme.fontFamily,
      fontWeight: 400,
      color: theme.text,
      textAlign: "center",
      lineHeight: 1.4,
    },
    chip: {
      backgroundColor: theme.chipBackground,
      borderRadius: 40,
      paddingHorizontal: 28,
      paddingVertical: 14,
      maxWidth: "90%",
      alignSelf: "center",
      alignItems: "center",
    },
  });
}

function Chip({
  theme,
  styles,
  children,
}: {
  theme: SlideTheme;
  styles: ReturnType<typeof pdfStyles>;
  children: ReactNode;
}) {
  if (!theme.chip) return children;
  return <View style={styles.chip}>{children}</View>;
}

function SlidePage({
  slide,
  theme,
  styles,
}: {
  slide: Slide;
  theme: SlideTheme;
  styles: ReturnType<typeof pdfStyles>;
}) {
  switch (slide.kind) {
    case "opening":
      return (
        <>
          <Chip theme={theme} styles={styles}>
            <Text style={styles.communityName}>{slide.communityName}</Text>
          </Chip>
          {slide.subtitle ? (
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          ) : null}
        </>
      );
    case "titleChip":
      return (
        <Chip theme={theme} styles={styles}>
          <Text style={styles.title}>{slide.title}</Text>
        </Chip>
      );
    case "lyric":
      return <Text style={styles.lyric}>{slide.text}</Text>;
    case "blank":
      return null;
  }
}

export function ProgramPdf({
  slides,
  themeId = DEFAULT_SLIDE_THEME_ID,
}: {
  slides: Slide[];
  themeId?: SlideThemeId;
}) {
  const theme = getSlideTheme(themeId);
  const styles = pdfStyles(theme);

  return (
    <Document>
      {slides.map((slide, index) => (
        <Page
          key={`${slide.kind}-${index}`}
          size={PAGE_SIZE}
          style={styles.page}
        >
          <SlidePage slide={slide} theme={theme} styles={styles} />
        </Page>
      ))}
    </Document>
  );
}
