"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PrototypeSwitcher } from "~/app/prototype/slides-access/_components/prototype-switcher";
import {
  VariantAPills,
  variantMeta as variantAMeta,
} from "~/app/prototype/slides-access/_components/variant-a-pills";
import {
  VariantBGhostLink,
  variantMeta as variantBMeta,
} from "~/app/prototype/slides-access/_components/variant-b-ghost-link";
import {
  VariantCAccountMenu,
  variantMeta as variantCMeta,
} from "~/app/prototype/slides-access/_components/variant-c-account-menu";
import {
  VariantDIcon,
  variantMeta as variantDMeta,
} from "~/app/prototype/slides-access/_components/variant-d-icon";
import {
  VariantEInPageCta,
  variantMeta as variantEMeta,
} from "~/app/prototype/slides-access/_components/variant-e-in-page-cta";
import type { PrototypeSurface } from "~/app/prototype/slides-access/_components/mock-chrome";

const variants = [
  { ...variantAMeta, render: VariantAPills },
  { ...variantBMeta, render: VariantBGhostLink },
  { ...variantCMeta, render: VariantCAccountMenu },
  { ...variantDMeta, render: VariantDIcon },
  { ...variantEMeta, render: VariantEInPageCta },
] as const;

function SlidesAccessPrototypeInner() {
  const searchParams = useSearchParams();
  const variantKey = searchParams.get("variant") ?? "A";
  const surface = (searchParams.get("surface") ?? "biblioteca") as PrototypeSurface;
  const active =
    variants.find((variant) => variant.key === variantKey) ?? variants[0];

  const ActiveVariant = active.render;

  return (
    <div className="min-h-screen bg-bg pb-28">
      <div className="border-b border-accent/30 bg-accent/5 px-4 py-3 text-sm">
        <p className="font-semibold text-accent">
          PROTOTYPE — Slides access (throwaway, branch{" "}
          <code className="text-xs">prototype/slides-access</code>)
        </p>
        <p className="mt-1 text-muted-foreground">
          Pergunta: como expor Slides sem tratá-lo como modo irmão da Biblioteca?
        </p>
        <dl className="mt-3 grid gap-1 text-xs md:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Entrada de Slides</dt>
            <dd className="text-muted-foreground">{active.slidesEntry}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Trade-off</dt>
            <dd className="text-muted-foreground">{active.tradeoff}</dd>
          </div>
        </dl>
      </div>

      <ActiveVariant surface={surface} />

      <PrototypeSwitcher
        variants={variants.map(({ key, name }) => ({ key, name }))}
        current={active.key}
      />
    </div>
  );
}

export default function SlidesAccessPrototypePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando protótipo…</div>}>
      <SlidesAccessPrototypeInner />
    </Suspense>
  );
}
