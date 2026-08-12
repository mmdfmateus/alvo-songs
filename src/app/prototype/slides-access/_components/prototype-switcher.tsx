"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type PrototypeVariantMeta = {
  key: string;
  name: string;
};

export function PrototypeSwitcher({
  variants,
  current,
}: {
  variants: PrototypeVariantMeta[];
  current: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surface = searchParams.get("surface") ?? "biblioteca";
  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current),
  );
  const meta = variants[index] ?? variants[0]!;

  function replaceParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      params.set(key, value);
    }
    router.replace(`?${params.toString()}`);
  }

  function cycle(delta: number) {
    const nextIndex = (index + delta + variants.length) % variants.length;
    replaceParams({ variant: variants[nextIndex]!.key });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycle(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycle(1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground px-1 py-1 text-background shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-background hover:bg-background/15 hover:text-background"
            aria-label="Variante anterior"
            onClick={() => cycle(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-48 px-2 text-center text-xs font-medium">
            {meta.key} — {meta.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-background hover:bg-background/15 hover:text-background"
            aria-label="Próxima variante"
            onClick={() => cycle(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="flex rounded-full border border-foreground/10 bg-paper p-0.5 shadow-md">
          {(["biblioteca", "slides"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                surface === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
              onClick={() => replaceParams({ surface: value })}
            >
              Simular /{value === "biblioteca" ? "" : "slides"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
