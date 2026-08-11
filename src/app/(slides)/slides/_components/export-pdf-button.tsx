"use client";

import { createElement, useState } from "react";

import type { Slide } from "~/lib/slides";

function pdfFilename(programName: string): string {
  const base = programName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ");
  return `${base || "slides"}.pdf`;
}

export function ExportPdfButton({
  slides,
  programName,
}: {
  slides: Slide[];
  programName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportPdf() {
    setBusy(true);
    setError(null);
    try {
      const [{ pdf }, { ProgramPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("~/lib/slide-pdf"),
      ]);
      const blob = await pdf(
        createElement(ProgramPdf, { slides }) as Parameters<typeof pdf>[0],
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFilename(programName);
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível gerar o PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 flex max-w-xl flex-col gap-2">
      <button
        type="button"
        disabled={busy || slides.length === 0}
        onClick={() => void exportPdf()}
        className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Exportando…" : "Exportar"}
      </button>
      <p className="text-sm text-muted">
        Depois de baixar, envie o PDF no Canva (computador) para colocar imagens
        nos slides em branco de Recados, compartilhar ou guardar.
      </p>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
