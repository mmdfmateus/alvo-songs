import Link from "next/link";
import { MenuIcon } from "lucide-react";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

export const variantMeta = {
  key: "C",
  name: "Só no menu da conta",
  slidesEntry:
    "“Meus slides” dentro do avatar (desktop) e do sheet mobile. Header principal sem Slides.",
  tradeoff: "Máximo foco na Biblioteca; descoberta pior para quem não abre o menu.",
};

export function VariantCAccountMenu({ surface }: { surface: PrototypeSurface }) {
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
            <MockAvatar
              menuItems={[{ label: "Meus slides", hint: "secundário" }]}
            />
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Abrir menu"
                  />
                }
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="?surface=slides"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "justify-start no-underline",
                    )}
                  >
                    Meus slides
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </>
        }
      />
      <MockPageBody surface={surface} />
    </>
  );
}