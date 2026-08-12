import Link from "next/link";
import { Presentation } from "lucide-react";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function CriarSlidesLink({
  href = "/slides",
  variant = "ghost",
  className,
  current = false,
}: {
  href?: string;
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size: "sm" }),
        "no-underline",
        className,
      )}
      aria-current={current ? "page" : undefined}
    >
      <Presentation data-icon="inline-start" />
      Criar slides
    </Link>
  );
}
