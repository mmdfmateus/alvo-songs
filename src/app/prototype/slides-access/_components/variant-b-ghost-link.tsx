import Link from "next/link";

import {
  BrowseNav,
  EditorActions,
  Logo,
  MockAvatar,
  PrototypeHeaderShell,
  type PrototypeSurface,
} from "~/app/prototype/slides-access/_components/mock-chrome";
import { MockPageBody } from "~/app/prototype/slides-access/_components/mock-content";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const variantMeta = {
  key: "B",
  name: "Link discreto",
  slidesEntry:
    "Texto “Slides” no canto direito, mesmo peso que utilitários. Em /slides, link “Biblioteca”.",
  tradeoff: "Visível mas não compete com Músicas/Artistas.",
};

export function VariantBGhostLink({ surface }: { surface: PrototypeSurface }) {
  return (
    <>
      <PrototypeHeaderShell
        left={
          surface === "slides" ? (
            <Link
              href="?surface=biblioteca"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "no-underline",
              )}
            >
              ← Biblioteca
            </Link>
          ) : (
            <>
              <Logo />
              <BrowseNav />
            </>
          )
        }
        right={
          <>
            {surface === "biblioteca" ? (
              <>
                <EditorActions />
                <Link
                  href="?surface=slides"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "no-underline text-muted-foreground",
                  )}
                >
                  Slides
                </Link>
              </>
            ) : (
              <Link
                href="?surface=slides"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "no-underline",
                )}
                aria-current="page"
              >
                Slides
              </Link>
            )}
            <MockAvatar />
          </>
        }
      />
      <MockPageBody surface={surface} />
    </>
  );
}
