import { redirect } from "next/navigation";

import { auth, signIn } from "~/server/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Entrar</h1>
      <p className="mb-6 text-muted">
        Qualquer conta Google pode entrar. Só editores (marcados no banco)
        podem criar ou editar músicas e artistas.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-lg bg-ink px-4 py-3 font-semibold text-white"
        >
          Entrar com Google
        </button>
      </form>
    </main>
  );
}
