import { CriarSlidesLink } from "~/app/_components/criar-slides-link";

export function SlidesHomeCta() {
  return (
    <section className="mt-4 rounded-[10px] border border-dashed border-line bg-paper p-4">
      <p className="text-sm text-muted-foreground">
        Selecione as músicas, organize a ordem e tenha os slides prontos
        rapidamente.
      </p>
      <CriarSlidesLink variant="outline" className="mt-3 inline-flex" />
    </section>
  );
}
