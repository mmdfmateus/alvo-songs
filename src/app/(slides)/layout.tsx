import { SiteHeader } from "~/app/_components/site-header";

export default function SlidesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader mode="slides" />
      <main className="mx-auto max-w-[920px] px-5 py-6">{children}</main>
    </>
  );
}
