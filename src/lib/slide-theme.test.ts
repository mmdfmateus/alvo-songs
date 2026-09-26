import { afterEach, expect, test } from "vitest";

import {
  DEFAULT_SLIDE_THEME_ID,
  getSlideTheme,
  isSlideThemeId,
  readStoredSlideTheme,
  SLIDE_THEMES_KEY,
  writeStoredSlideTheme,
} from "~/lib/slide-theme";

afterEach(() => {
  globalThis.localStorage?.removeItem(SLIDE_THEMES_KEY);
});

test("default theme is the Cardo Canva style", () => {
  const theme = getSlideTheme(DEFAULT_SLIDE_THEME_ID);
  expect(theme.fontFamily).toBe("Cardo");
  expect(theme.background).toBe("#F1F0F0");
  expect(theme.text).toBe("#343434");
  expect(theme.openingSize).toBe(75);
  expect(theme.titleSize).toBe(70);
  expect(theme.lyricSize).toBe(55);
});

test("COMU theme keeps orange, purple chip, and Montserrat sizes", () => {
  const theme = getSlideTheme("comu");
  expect(theme.fontFamily).toBe("Montserrat");
  expect(theme.background).toBe("#ED821C");
  expect(theme.chipBackground).toBe("#441F8D");
  expect(theme.text).toBe("#FFFFFF");
  expect(theme.openingSize).toBe(60);
  expect(theme.titleSize).toBe(42);
  expect(theme.lyricSize).toBe(50);
  expect(theme.titleTransform).toBe("uppercase");
});

test("unknown theme ids fall back to Cardo", () => {
  expect(getSlideTheme(undefined).id).toBe("cardo");
  expect(isSlideThemeId("helvetica")).toBe(false);
});

test("stored theme is remembered per Program", () => {
  const memory = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });

  expect(readStoredSlideTheme("prog-1")).toBe("cardo");
  writeStoredSlideTheme("prog-1", "comu");
  writeStoredSlideTheme("prog-2", "cardo");
  expect(readStoredSlideTheme("prog-1")).toBe("comu");
  expect(readStoredSlideTheme("prog-2")).toBe("cardo");
});
