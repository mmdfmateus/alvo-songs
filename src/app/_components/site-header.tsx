import { SiteHeaderNav } from "~/app/_components/site-header-nav";
import { api } from "~/trpc/server";

export async function SiteHeader({
  mode,
}: {
  mode: "biblioteca" | "slides";
}) {
  const viewer = await api.auth.viewer();

  return (
    <SiteHeaderNav
      mode={mode}
      signedIn={viewer.signedIn}
      isEditor={viewer.isEditor}
      user={viewer.user}
    />
  );
}
