import type { ReactNode } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { SongSearch } from "~/app/_components/song-search";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";

export type PrototypeSurface = "biblioteca" | "slides";

export const mockEditor = {
  signedIn: true,
  user: { name: "Mateus Silva", image: null as string | null },
};

export function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 font-bold tracking-tight no-underline"
    >
      <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
        A
      </span>
      <span className="hidden sm:inline">Alvo Cifras</span>
    </Link>
  );
}

export function BrowseNav() {
  return (
    <NavigationMenu className="hidden flex-none md:flex" aria-label="Biblioteca">
      <NavigationMenuList>
        {[
          { href: "/musicas", label: "Músicas", active: true },
          { href: "/artistas", label: "Artistas", active: false },
        ].map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              render={<Link href={link.href} />}
              className={cn(
                navigationMenuTriggerStyle(),
                link.active && "bg-muted text-foreground",
              )}
            >
              {link.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function EditorActions() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" aria-label="Criar" />}
        >
          <PlusIcon data-icon="inline-start" />
          Novo
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>Nova música</DropdownMenuItem>
            <DropdownMenuItem>Novo artista</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link
        href="/musicas/revisar"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "no-underline",
        )}
      >
        Revisar
      </Link>
    </>
  );
}

export function MockAvatar({
  menuItems,
}: {
  menuItems?: { label: string; hint?: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label="Conta"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>MS</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {menuItems?.map((item) => (
            <DropdownMenuItem key={item.label}>
              {item.label}
              {item.hint ? (
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.hint}
                </span>
              ) : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PrototypeHeaderShell({
  left,
  right,
}: {
  left?: ReactNode;
  right: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b-[3px] border-accent bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 md:grid md:grid-cols-[1fr_min(32rem,100%)_1fr] md:items-center md:gap-4 md:px-5">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          {left ?? (
            <>
              <Logo />
              <BrowseNav />
            </>
          )}
        </div>
        <SongSearch className="min-w-0 flex-1 md:col-start-2 md:w-full md:flex-none md:justify-self-center" />
        <div className="flex shrink-0 items-center gap-1 md:justify-self-end md:gap-2">
          {right}
        </div>
      </div>
    </header>
  );
}
