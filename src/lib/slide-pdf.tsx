import { Document, Page, StyleSheet, Text } from "@react-pdf/renderer";

import type { Slide } from "~/lib/slides";

export const PDF_PAGE_WIDTH = 960;
export const PDF_PAGE_HEIGHT = 540;

const PAGE_SIZE = { width: PDF_PAGE_WIDTH, height: PDF_PAGE_HEIGHT } as const;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#1a1028",
    color: "#ffffff",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
  },
  communityName: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    color: "#f97316",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Helvetica",
    color: "#e9d5ff",
    textAlign: "center",
  },
  title: {
    fontSize: 42,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  lyric: {
    width: "100%",
    fontSize: 28,
    fontFamily: "Helvetica",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 1.4,
  },
});

function SlidePage({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "opening":
      return (
        <>
          <Text style={styles.communityName}>{slide.communityName}</Text>
          {slide.subtitle ? (
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          ) : null}
        </>
      );
    case "titleChip":
      return <Text style={styles.title}>{slide.title}</Text>;
    case "lyric":
      return <Text style={styles.lyric}>{slide.text}</Text>;
    case "blank":
      return null;
  }
}

export function ProgramPdf({ slides }: { slides: Slide[] }) {
  return (
    <Document>
      {slides.map((slide, index) => (
        <Page
          key={`${slide.kind}-${index}`}
          size={PAGE_SIZE}
          style={styles.page}
        >
          <SlidePage slide={slide} />
        </Page>
      ))}
    </Document>
  );
}
