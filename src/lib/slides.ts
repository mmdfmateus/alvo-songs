export const BLANK_SLIDE_COUNT = 1;
export const DEFAULT_COMMUNITY_NAME = "COMU JOVEM";

export type SlideKind = "opening" | "titleChip" | "lyric" | "blank";

export type Slide =
  | { kind: "opening"; communityName: string; subtitle?: string }
  | { kind: "titleChip"; title: string }
  | { kind: "lyric"; text: string }
  | { kind: "blank" };

export type ExpandableSection = {
  type: string;
  payload: unknown;
  song?: { title: string; chunks: { text: string }[] } | null;
};

function titled(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "title" in payload &&
    typeof payload.title === "string" &&
    payload.title.trim()
  ) {
    return payload.title.trim();
  }
  return fallback;
}

export function expandSections(sections: ExpandableSection[]): Slide[] {
  const slides: Slide[] = [];

  for (const section of sections) {
    switch (section.type) {
      case "opening": {
        const payload =
          typeof section.payload === "object" && section.payload !== null
            ? (section.payload as { communityName?: unknown; subtitle?: unknown })
            : {};
        const communityName =
          typeof payload.communityName === "string" && payload.communityName.trim()
            ? payload.communityName.trim()
            : DEFAULT_COMMUNITY_NAME;
        const subtitle =
          typeof payload.subtitle === "string" && payload.subtitle.trim()
            ? payload.subtitle.trim()
            : undefined;
        slides.push(
          subtitle
            ? { kind: "opening", communityName, subtitle }
            : { kind: "opening", communityName },
        );
        break;
      }
      case "announcements": {
        slides.push({ kind: "titleChip", title: titled(section.payload, "Recados") });
        for (let i = 0; i < BLANK_SLIDE_COUNT; i += 1) slides.push({ kind: "blank" });
        break;
      }
      case "game": {
        slides.push({
          kind: "titleChip",
          title: titled(section.payload, "Brincadeira"),
        });
        for (let i = 0; i < BLANK_SLIDE_COUNT; i += 1) slides.push({ kind: "blank" });
        break;
      }
      case "moment": {
        slides.push({ kind: "titleChip", title: titled(section.payload, "Momento") });
        break;
      }
      case "song": {
        if (!section.song) break;
        slides.push({ kind: "titleChip", title: section.song.title });
        for (const chunk of section.song.chunks) {
          slides.push({ kind: "lyric", text: chunk.text });
        }
        break;
      }
      default:
        break;
    }
  }

  return slides;
}
