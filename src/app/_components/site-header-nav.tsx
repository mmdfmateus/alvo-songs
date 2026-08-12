"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, PlusIcon, Presentation } from "lucide-react";

import {
  bibliotecaBrowseLinks,
  bibliotecaCreateLinks,
  bibliotecaReviewLink,
  isNavActive,
  type NavLink,
} from "~/app/_components/biblioteca-subnav";
import { CriarSlidesLink } from "~/app/_components/criar-slides-link";
import { signOutAction } from "~/app/_components/sign-out-action";
import { SongSearch } from "~/app/_components/song-search";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { userInitials } from "~/lib/user-display";
import { cn } from "~/lib/utils";

type HeaderUser = {
  name: string | null;
  image: string | null;
};

export function SiteHeaderNav({
  mode,
  signedIn,
  isEditor,
  user,
}: {
  mode: "biblioteca" | "slides";
  signedIn: boolean;
  isEditor: boolean;
  user: HeaderUser | null;
}) {
  const pathname = usePathname();
  const onSlides = mode === "slides";
  const desktopBrowseLinks = onSlides ? [] : bibliotecaBrowseLinks;
  const mobileBrowseLinks = onSlides
    ? []
    : isEditor
      ? [...bibliotecaBrowseLinks, bibliotecaReviewLink]
      : bibliotecaBrowseLinks;
  const createLinks = !onSlides && isEditor ? bibliotecaCreateLinks : [];
  const showReview = !onSlides && isEditor;
  const activeHrefs = [
    ...desktopBrowseLinks,
    ...(showReview ? [bibliotecaReviewLink] : []),
    ...createLinks,
  ].map((link) => link.href);

  return (
    <header className="sticky top-0 z-10 border-b-[3px] border-accent bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 md:grid md:grid-cols-[1fr_min(32rem,100%)_1fr] md:items-center md:gap-4 md:px-5">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          {onSlides ? (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "no-underline",
              )}
            >
              ← Biblioteca
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 font-bold tracking-tight no-underline"
              >
                <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
                  A
                </span>
                <span className="hidden sm:inline">Alvo Cifras</span>
              </Link>

              {desktopBrowseLinks.length > 0 ? (
                <NavigationMenu
                  className="hidden flex-none md:flex"
                  aria-label="Biblioteca"
                >
                  <NavigationMenuList>
                    {desktopBrowseLinks.map((link) => (
                      <DesktopNavLink
                        key={link.href}
                        link={link}
                        active={isNavActive(pathname, link.href, activeHrefs)}
                      />
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              ) : null}
            </>
          )}
        </div>

        <SongSearch className="min-w-0 flex-1 md:col-start-2 md:w-full md:flex-none md:justify-self-center" />

        <div className="flex shrink-0 items-center gap-1 md:justify-self-end md:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {createLinks.length > 0 ? <NovoMenu createLinks={createLinks} /> : null}
            {showReview ? (
              <ReviewLink
                active={isNavActive(
                  pathname,
                  bibliotecaReviewLink.href,
                  activeHrefs,
                )}
              />
            ) : null}
            {!onSlides ? (
              <CriarSlidesLink className="text-muted-foreground" />
            ) : null}
            <UserMenu signedIn={signedIn} user={user} />
          </div>

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
              <div className="flex flex-col gap-4 px-4 pb-4">
                {signedIn && user ? (
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.name ?? "Conta"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {onSlides ? (
                  <MobilePlainLink href="/" label="← Biblioteca" />
                ) : (
                  <MobileCriarSlidesLink />
                )}

                {mobileBrowseLinks.length > 0 ? (
                  <nav aria-label="Biblioteca" className="flex flex-col gap-1">
                    {mobileBrowseLinks.map((link) => (
                      <MobileNavLink
                        key={link.href}
                        link={link}
                        active={isNavActive(pathname, link.href, activeHrefs)}
                      />
                    ))}
                  </nav>
                ) : null}

                {createLinks.length > 0 ? (
                  <>
                    <Separator />
                    <nav aria-label="Criar" className="flex flex-col gap-1">
                      {createLinks.map((link) => (
                        <MobileNavLink
                          key={link.href}
                          link={link}
                          active={isNavActive(pathname, link.href, activeHrefs)}
                        />
                      ))}
                    </nav>
                  </>
                ) : null}

                <Separator />
                <UserMenu
                  signedIn={signedIn}
                  user={user}
                  className="w-full"
                  variant="mobile"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function DesktopNavLink({
  link,
  active,
}: {
  link: NavLink;
  active: boolean;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        render={<Link href={link.href} />}
        className={cn(
          navigationMenuTriggerStyle(),
          active && "bg-muted text-foreground",
        )}
        aria-current={active ? "page" : undefined}
      >
        {link.label}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function ReviewLink({ active }: { active: boolean }) {
  return (
    <Link
      href={bibliotecaReviewLink.href}
      className={cn(
        buttonVariants({
          variant: active ? "secondary" : "ghost",
          size: "sm",
        }),
        "no-underline",
      )}
      aria-current={active ? "page" : undefined}
    >
      {bibliotecaReviewLink.label}
    </Link>
  );
}

function NovoMenu({ createLinks }: { createLinks: NavLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label="Criar" />}
      >
        <PlusIcon data-icon="inline-start" />
        Novo
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {createLinks.map((link) => (
            <DropdownMenuItem
              key={link.href}
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar({
  user,
  size = "default",
}: {
  user: HeaderUser;
  size?: "default" | "sm" | "lg";
}) {
  const label = user.name ?? "Conta";

  return (
    <Avatar size={size}>
      {user.image ? <AvatarImage src={user.image} alt={label} /> : null}
      <AvatarFallback>{userInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

function UserMenu({
  signedIn,
  user,
  className,
  variant = "desktop",
}: {
  signedIn: boolean;
  user: HeaderUser | null;
  className?: string;
  variant?: "desktop" | "mobile";
}) {
  if (!signedIn || !user) {
    return (
      <Link
        href="/entrar"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "no-underline",
          className,
        )}
      >
        Entrar
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <form action={signOutAction} className={className}>
        <Button type="submit" variant="ghost" size="sm" className="w-full">
          Sair
        </Button>
      </form>
    );
  }

  return (
    <>
      <form action={signOutAction} id="header-sign-out" className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label={user.name ?? "Conta"}
            />
          }
        >
          <UserAvatar user={user} size="sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <button type="submit" form="header-sign-out" className="w-full" />
              }
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function MobileNavLink({
  link,
  active,
}: {
  link: NavLink;
  active: boolean;
}) {
  return (
    <SheetClose
      nativeButton={false}
      render={
        <Link
          href={link.href}
          className={cn(
            buttonVariants({ variant: active ? "secondary" : "ghost" }),
            "justify-start",
          )}
          aria-current={active ? "page" : undefined}
        />
      }
    >
      {link.label}
    </SheetClose>
  );
}

function MobilePlainLink({ href, label }: { href: string; label: string }) {
  return (
    <SheetClose
      nativeButton={false}
      render={
        <Link
          href={href}
          className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}
        />
      }
    >
      {label}
    </SheetClose>
  );
}

function MobileCriarSlidesLink() {
  return (
    <SheetClose
      nativeButton={false}
      render={
        <Link
          href="/slides"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "justify-start no-underline",
          )}
        />
      }
    >
      <Presentation data-icon="inline-start" />
      Criar slides
    </SheetClose>
  );
}
