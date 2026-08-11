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

export function ExportPdfHint() {
  return (
    <p className="text-sm text-muted">
      Depois de baixar, envie o PDF no Canva (computador) para colocar imagens
      nos slides em branco de Recados, compartilhar ou guardar.
    </p>
  );
}

export function ExportPdfButton({
  slides,
  programName,
  disabled = false,
  showHint = true,
}: {
  slides: Slide[];
  programName: string;
  disabled?: boolean;
  showHint?: boolean;
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

  const button = (
    <button
      type="button"
      disabled={busy || disabled || slides.length === 0}
      onClick={() => void exportPdf()}
      className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {busy ? "Exportando…" : "Exportar"}
    </button>
  );

  if (!showHint) {
    return (
      <div className="flex flex-col items-end gap-1">
        {button}
        {error ? <p className="text-sm text-accent">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mb-6 flex max-w-xl flex-col gap-2">
      {button}
      <ExportPdfHint />
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
