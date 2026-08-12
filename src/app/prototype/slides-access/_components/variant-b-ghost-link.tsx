import Link from "next/link";

import {
  BrowseNav,
  EditorActions,
  Logo,
  MockAvatar,
  PrototypeHeaderShell,
  type PrototypeSurface,
} from "~/app/prototype/slides-access/_components/mock-chrome";
import {
  CriarSlidesLink,
  MockPageBody,
} from "~/app/prototype/slides-access/_components/mock-content";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const variantMeta = {
  key: "B",
  name: "Link discreto + CTA na home",
  slidesEntry:
    "“Criar slides” com ícone no canto direito + card na home. Em /slides, volta “← Biblioteca”.",
  tradeoff: "Slides fica secundário no header e reforçado na home.",
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
            {surface === "biblioteca" ? <EditorActions /> : null}
            <CriarSlidesLink
              variant={surface === "slides" ? "secondary" : "ghost"}
              className={
                surface === "biblioteca" ? "text-muted-foreground" : undefined
              }
              current={surface === "slides"}
            />
            <MockAvatar />
          </>
        }
      />
      <MockPageBody
        surface={surface}
        showSlidesCta={surface === "biblioteca"}
      />
    </>
  );
}
