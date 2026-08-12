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
  key: "A",
  name: "Pills Biblioteca | Slides (atual)",
  slidesEntry: "Toggle de modo no header, mesmo peso visual que a Biblioteca.",
  tradeoff: "Slides parece um produto irmão, não um extra.",
};

function ModePills({ surface }: { surface: PrototypeSurface }) {
  return (
    <nav
      aria-label="Áreas"
      className="inline-flex rounded-full bg-muted p-0.5"
    >
      <Link
        href="?surface=biblioteca"
        className={cn(
          buttonVariants({
            variant: surface === "biblioteca" ? "default" : "ghost",
            size: "sm",
          }),
          "rounded-full no-underline",
        )}
      >
        Biblioteca
      </Link>
      <Link
        href="?surface=slides"
        className={cn(
          buttonVariants({
            variant: surface === "slides" ? "default" : "ghost",
            size: "sm",
          }),
          "rounded-full no-underline",
        )}
      >
        Slides
      </Link>
    </nav>
  );
}

export function VariantAPills({ surface }: { surface: PrototypeSurface }) {
  return (
    <>
      <PrototypeHeaderShell
        left={
          surface === "biblioteca" ? (
            <>
              <Logo />
              <BrowseNav />
            </>
          ) : (
            <Logo />
          )
        }
        right={
          <>
            <ModePills surface={surface} />
            {surface === "biblioteca" ? <EditorActions /> : null}
            <MockAvatar />
          </>
        }
      />
      <MockPageBody surface={surface} />
    </>
  );
}
