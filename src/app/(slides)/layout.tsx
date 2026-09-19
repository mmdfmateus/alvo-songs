import { Cardo, Montserrat } from "next/font/google";

import { SiteHeader } from "~/app/_components/site-header";
import { cn } from "~/lib/utils";

const cardo = Cardo({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-slide-cardo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "800"],
  variable: "--font-slide-montserrat",
  display: "swap",
});

export default function SlidesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader mode="slides" />
      <main
        className={cn(
          "mx-auto max-w-[920px] px-5 py-6",
          cardo.variable,
          montserrat.variable,
        )}
      >
        {children}
      </main>
    </>
  );
}
