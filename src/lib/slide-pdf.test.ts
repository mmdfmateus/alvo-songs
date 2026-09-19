import { createElement, type ComponentProps, type ReactElement } from "react";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFStream,
} from "pdf-lib";
import { expect, test } from "vitest";

import { ProgramPdf } from "~/lib/slide-pdf";
import type { SlideThemeId } from "~/lib/slide-theme";
import type { Slide } from "~/lib/slides";

type PdfRoot = ReactElement<ComponentProps<typeof Document>>;

async function renderSlides(slides: Slide[], themeId?: SlideThemeId) {
  const buffer = await renderToBuffer(
    createElement(ProgramPdf, { slides, themeId }) as PdfRoot,
  );
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages().map((page) => {
    const { width, height } = page.getSize();
    const content = pageContent(page);
    return {
      width,
      height,
      content,
      text: pdfShownText(content, pageToUnicode(page)),
    };
  });
  return { buffer, pages };
}

function pageContent(page: ReturnType<PDFDocument["getPages"]>[number]): string {
  const contents = page.node.Contents();
  if (!contents) return "";

  const objects = contents instanceof PDFArray ? contents.asArray() : [contents];
  const chunks: string[] = [];

  for (const object of objects) {
    const stream =
      object instanceof PDFStream ? object : page.doc.context.lookup(object);
    if (!(stream instanceof PDFStream)) continue;
    const bytes =
      stream instanceof PDFRawStream
        ? decodePDFRawStream(stream).decode()
        : stream.getContents();
    chunks.push(Buffer.from(bytes).toString("latin1"));
  }

  return chunks.join("");
}

function utf16Be(hex: string): string {
  let text = "";
  for (let i = 0; i < hex.length; i += 4) {
    text += String.fromCharCode(Number.parseInt(hex.slice(i, i + 4), 16));
  }
  return text;
}

function applyCmap(cmap: string, map: Map<number, string>) {
  for (const block of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of block[1]?.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) ??
      []) {
      if (!pair[1] || !pair[2]) continue;
      map.set(Number.parseInt(pair[1], 16), utf16Be(pair[2]));
    }
  }
  for (const block of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const body = block[1] ?? "";
    for (const range of body.matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g,
    )) {
      if (!range[1] || !range[2] || !range[3]) continue;
      const start = Number.parseInt(range[1], 16);
      const end = Number.parseInt(range[2], 16);
      let code = Number.parseInt(range[3], 16);
      for (let i = start; i <= end; i += 1) {
        map.set(i, String.fromCharCode(code));
        code += 1;
      }
    }
    for (const range of body.matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]+)\]/g,
    )) {
      if (!range[1] || !range[3]) continue;
      const start = Number.parseInt(range[1], 16);
      const dests = [...range[3].matchAll(/<([0-9A-Fa-f]+)>/g)];
      dests.forEach((dest, index) => {
        if (!dest[1]) return;
        map.set(start + index, utf16Be(dest[1]));
      });
    }
  }
}

function pageToUnicode(
  page: ReturnType<PDFDocument["getPages"]>[number],
): Map<number, string> {
  const map = new Map<number, string>();
  const resources = page.node.Resources();
  const fonts = resources?.lookup(PDFName.of("Font"));
  if (!(fonts instanceof PDFDict)) return map;

  for (const key of fonts.keys()) {
    const font = fonts.lookup(key);
    if (!(font instanceof PDFDict)) continue;
    const unicode = font.get(PDFName.of("ToUnicode"));
    if (!unicode) continue;
    const stream =
      unicode instanceof PDFStream ? unicode : page.doc.context.lookup(unicode);
    if (!(stream instanceof PDFStream)) continue;
    const bytes =
      stream instanceof PDFRawStream
        ? decodePDFRawStream(stream).decode()
        : stream.getContents();
    applyCmap(Buffer.from(bytes).toString("latin1"), map);
  }
  return map;
}

function decodePdfHex(hex: string, toUnicode: Map<number, string>): string {
  if (toUnicode.size > 0) {
    const width = hex.length % 4 === 0 ? 4 : 2;
    let text = "";
    for (let i = 0; i < hex.length; i += width) {
      const code = Number.parseInt(hex.slice(i, i + width), 16);
      text += toUnicode.get(code) ?? "";
    }
    return text;
  }
  if (hex.length % 4 === 0 && /^(?:00[0-9A-Fa-f]{2})+$/.test(hex)) {
    return utf16Be(hex);
  }
  return Buffer.from(hex, "hex").toString("latin1");
}

function pdfShownText(content: string, toUnicode: Map<number, string>): string {
  const parts: string[] = [];
  for (const match of content.matchAll(/\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f]+)>/g)) {
    if (match[1]) {
      const hex = match[1];
      if (hex.length % 2 !== 0) continue;
      parts.push(decodePdfHex(hex, toUnicode));
      continue;
    }
    const raw = match[0].slice(1, -1);
    parts.push(
      raw
        .replace(/\\(\d{1,3})/g, (_, oct: string) =>
          String.fromCharCode(Number.parseInt(oct, 8)),
        )
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\(.)/g, "$1"),
    );
  }
  return parts.join("");
}

function pdfScn(hex: string): string {
  const n = hex.replace("#", "");
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(n.slice(offset, offset + 2), 16) / 255,
  );
  return `${channels.join(" ")} scn`;
}

test("default pages use Cardo colors and embed the Cardo font", async () => {
  const { buffer, pages } = await renderSlides([
    { kind: "opening", communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
    { kind: "lyric", text: "Na cidade" },
  ]);

  expect(buffer.toString("latin1")).toContain("Cardo");
  for (const page of pages) {
    expect(page.content).toContain(pdfScn("#F1F0F0"));
    expect(page.content).toContain(pdfScn("#343434"));
  }
});

test("COMU pages use orange, white, and Montserrat", async () => {
  const { buffer, pages } = await renderSlides(
    [
      { kind: "titleChip", title: "Reunidos Aqui" },
      { kind: "lyric", text: "Na cidade" },
    ],
    "comu",
  );

  expect(buffer.toString("latin1")).toContain("Montserrat");
  expect(pages[0]?.content).toContain(pdfScn("#ED821C"));
  expect(pages[0]?.content).toContain(pdfScn("#441F8D"));
  expect(pages[1]?.content).toContain(pdfScn("#FFFFFF"));
});

test("Export PDF is 16:9 with one page per Slide", async () => {
  const slides: Slide[] = [
    { kind: "opening", communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
    { kind: "titleChip", title: "Grande É o Senhor" },
    { kind: "lyric", text: "Na cidade" },
    { kind: "blank" },
  ];

  const { buffer, pages } = await renderSlides(slides);

  expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  expect(pages).toHaveLength(slides.length);
  for (const page of pages) {
    expect(page).toMatchObject({ width: 960, height: 540 });
  }
});

test("opening page includes community name and subtitle", async () => {
  const { pages } = await renderSlides([
    { kind: "opening", communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
  ]);

  expect(pages[0]?.text).toContain("COMU JOVEM");
  expect(pages[0]?.text).toContain("Culto 09/08");
});

test("title-chip page includes the title", async () => {
  const { pages } = await renderSlides([
    { kind: "titleChip", title: "Grande É o Senhor" },
  ]);

  expect(pages[0]?.text).toContain("Grande É o Senhor");
});

test("lyric page includes the Trecho and does not repeat the song title", async () => {
  const { pages } = await renderSlides([
    { kind: "titleChip", title: "Grande É o Senhor" },
    { kind: "lyric", text: "Na cidade" },
  ]);

  expect(pages[0]?.text).toContain("Grande É o Senhor");
  expect(pages[1]?.text).toContain("Na cidade");
  expect(pages[1]?.text).not.toContain("Grande É o Senhor");
});

test("lyric page keeps a long Trecho instead of dropping it", async () => {
  const text =
    "Grande é o Senhor e mui digno de louvor na cidade do nosso Deus no monte da sua santidade";
  const { pages } = await renderSlides([{ kind: "lyric", text }]);

  expect(pages[0]?.text).toContain("Grande é o Senhor");
  expect(pages[0]?.text).toContain("monte da sua santidade");
});

test("blank page has no Recados or song title", async () => {
  const { pages } = await renderSlides([
    { kind: "titleChip", title: "Recados" },
    { kind: "blank" },
  ]);

  expect(pages[0]?.text).toContain("Recados");
  expect(pages[1]?.text).not.toContain("Recados");
  expect(pages[1]?.text.trim()).toBe("");
});
