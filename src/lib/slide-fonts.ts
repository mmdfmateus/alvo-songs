import { Font } from "@react-pdf/renderer";

function fontSrc(filename: string) {
  if (typeof window !== "undefined") return `/fonts/${filename}`;
  return `${process.cwd()}/public/fonts/${filename}`;
}

let registered = false;

export function registerSlideFonts() {
  if (registered) return;
  registered = true;

  Font.registerHyphenationCallback((word) => [word]);

  Font.register({
    family: "Cardo",
    src: fontSrc("Cardo-Regular.ttf"),
  });

  Font.register({
    family: "Montserrat",
    fonts: [
      { src: fontSrc("Montserrat-Regular.ttf"), fontWeight: 400 },
      { src: fontSrc("Montserrat-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });
}
