import { MeusSlides } from "~/app/(slides)/slides/_components/meus-slides";

export default function MySlidesPage() {
  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Meus slides</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Lista deste dispositivo. Não há galeria pública de Slides.
      </p>
      <MeusSlides />
    </>
  );
}
