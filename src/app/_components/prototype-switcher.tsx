"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** PROTOTYPE switcher — not product UI. Hidden in production builds. */
export function PrototypeSwitcher({
  variants,
  names,
}: {
  variants: string[];
  names?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("variant") ?? variants[0] ?? "A";

  function go(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function cycle(delta: number) {
    const i = Math.max(0, variants.indexOf(current));
    const next = variants[(i + delta + variants.length) % variants.length];
    if (next) go(next);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  const label = names?.[current] ? `${current} (${names[current]})` : current;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-2 py-1.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
        <button
          type="button"
          aria-label="Variant anterior"
          className="size-9 rounded-full text-lg leading-none"
          onClick={() => cycle(-1)}
        >
          ←
        </button>
        <span className="min-w-[13rem] text-center text-xs font-semibold tracking-wide">
          {label}
        </span>
        <button
          type="button"
          aria-label="Próxima variant"
          className="size-9 rounded-full text-lg leading-none"
          onClick={() => cycle(1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
