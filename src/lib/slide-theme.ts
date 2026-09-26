export const SLIDE_THEME_IDS = ["cardo", "comu"] as const;

export type SlideThemeId = (typeof SLIDE_THEME_IDS)[number];

export const DEFAULT_SLIDE_THEME_ID: SlideThemeId = "cardo";

export const SLIDE_THEMES_KEY = "alvo-slide-themes";

export type SlideTheme = {
  id: SlideThemeId;
  label: string;
  background: string;
  text: string;
  muted: string;
  fontFamily: string;
  titleFontFamily: string;
  titleFontWeight: 400 | 800;
  titleTransform: "none" | "uppercase";
  chip: boolean;
  chipBackground: string;
  openingSize: number;
  titleSize: number;
  lyricSize: number;
  subtitleSize: number;
};

export const SLIDE_THEMES: Record<SlideThemeId, SlideTheme> = {
  cardo: {
    id: "cardo",
    label: "Claro",
    background: "#F1F0F0",
    text: "#343434",
    muted: "#343434",
    fontFamily: "Cardo",
    titleFontFamily: "Cardo",
    titleFontWeight: 400,
    titleTransform: "none",
    chip: false,
    chipBackground: "transparent",
    openingSize: 75,
    titleSize: 70,
    lyricSize: 55,
    subtitleSize: 28,
  },
  comu: {
    id: "comu",
    label: "COMU",
    background: "#ED821C",
    text: "#FFFFFF",
    muted: "#FFFEFE",
    fontFamily: "Montserrat",
    titleFontFamily: "Montserrat",
    titleFontWeight: 800,
    titleTransform: "uppercase",
    chip: true,
    chipBackground: "#441F8D",
    openingSize: 60,
    titleSize: 42,
    lyricSize: 50,
    subtitleSize: 22,
  },
};

export function isSlideThemeId(value: unknown): value is SlideThemeId {
  return value === "cardo" || value === "comu";
}

export function getSlideTheme(id: SlideThemeId | undefined): SlideTheme {
  return SLIDE_THEMES[id && isSlideThemeId(id) ? id : DEFAULT_SLIDE_THEME_ID];
}

export function readStoredSlideTheme(programId: string): SlideThemeId {
  if (typeof localStorage === "undefined") return DEFAULT_SLIDE_THEME_ID;
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(SLIDE_THEMES_KEY) ?? "{}",
    );
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_SLIDE_THEME_ID;
    }
    const stored = (parsed as Record<string, unknown>)[programId];
    return isSlideThemeId(stored) ? stored : DEFAULT_SLIDE_THEME_ID;
  } catch {
    return DEFAULT_SLIDE_THEME_ID;
  }
}

export function writeStoredSlideTheme(programId: string, themeId: SlideThemeId) {
  if (typeof localStorage === "undefined") return;
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(SLIDE_THEMES_KEY) ?? "{}",
    );
    const current =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    localStorage.setItem(
      SLIDE_THEMES_KEY,
      JSON.stringify({ ...current, [programId]: themeId }),
    );
  } catch {
    localStorage.setItem(
      SLIDE_THEMES_KEY,
      JSON.stringify({ [programId]: themeId }),
    );
  }
}
