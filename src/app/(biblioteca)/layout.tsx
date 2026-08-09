import { SiteHeader } from "~/app/_components/site-header";

export default function BibliotecaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader mode="biblioteca" />
      <main className="mx-auto max-w-[920px] px-5 py-6">{children}</main>
    </>
  );
}
