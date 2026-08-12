import Link from "next/link";
import { Presentation } from "lucide-react";

import {
  BrowseNav,
  EditorActions,
  Logo,
  MockAvatar,
  PrototypeHeaderShell,
  type PrototypeSurface,
} from "~/app/prototype/slides-access/_components/mock-chrome";
import { MockPageBody } from "~/app/prototype/slides-access/_components/mock-content";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const variantMeta = {
  key: "D",
  name: "Ícone sem rótulo",
  slidesEntry:
    "Botão-ícone de apresentação antes do avatar. Tooltip “Slides”. Sem texto no header.",
  tradeoff: "Compacto; ícone pode ser opaco para quem não reconhece.",
};

export function VariantDIcon({ surface }: { surface: PrototypeSurface }) {
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
            <Button
              variant={surface === "slides" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Slides"
              nativeButton={false}
              render={<Link href="?surface=slides" />}
            >
              <Presentation />
            </Button>
            <MockAvatar />
          </>
        }
      />
      <MockPageBody surface={surface} />
    </>
  );
}
