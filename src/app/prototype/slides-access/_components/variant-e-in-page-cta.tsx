import Link from "next/link";

import {
  EditorActions,
  Logo,
  BrowseNav,
  MockAvatar,
  PrototypeHeaderShell,
  type PrototypeSurface,
} from "~/app/prototype/slides-access/_components/mock-chrome";
import { MockPageBody } from "~/app/prototype/slides-access/_components/mock-content";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const variantMeta = {
  key: "E",
  name: "CTA na home — zero no header",
  slidesEntry:
    "Nenhuma menção a Slides no header. Card “Criar slides” só na home da Biblioteca.",
  tradeoff:
    "Biblioteca limpa; Slides só aparece se o usuário rolar a home ou souber a URL.",
};

export function VariantEInPageCta({ surface }: { surface: PrototypeSurface }) {
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
              ← Voltar para a Biblioteca
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
            <MockAvatar />
          </>
        }
      />
      <MockPageBody surface={surface} showSlidesCta={surface === "biblioteca"} />
    </>
  );
}
