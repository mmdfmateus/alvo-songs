import { createElement, type ComponentProps, type ReactElement } from "react";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import {
  decodePDFRawStream,
  PDFArray,
  PDFDocument,
  PDFRawStream,
  PDFStream,
} from "pdf-lib";
import { expect, test } from "vitest";

import { ProgramPdf } from "~/lib/slide-pdf";
import type { Slide } from "~/lib/slides";

type PdfRoot = ReactElement<ComponentProps<typeof Document>>;

async function renderSlides(slides: Slide[]) {
  const buffer = await renderToBuffer(
    createElement(ProgramPdf, { slides }) as PdfRoot,
  );
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages().map((page) => {
    const { width, height } = page.getSize();
    return { width, height, text: pageText(page) };
  });
  return { buffer, pages };
}

function pageText(page: ReturnType<PDFDocument["getPages"]>[number]): string {
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
    chunks.push(pdfShownText(Buffer.from(bytes).toString("latin1")));
  }

  return chunks.join("");
}

function pdfShownText(content: string): string {
  const parts: string[] = [];
  for (const match of content.matchAll(/\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f]+)>/g)) {
    if (match[1]) {
      const hex = match[1];
      if (hex.length % 2 !== 0) continue;
      parts.push(Buffer.from(hex, "hex").toString("latin1"));
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
