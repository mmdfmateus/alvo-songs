import { api } from "~/trpc/server";

export default async function UsersPage() {
  const viewer = await api.auth.viewer();

  if (!viewer.isAdmin) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Apenas administradores podem ver esta página.
        </p>
      </>
    );
  }

  const users = await api.user.list();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Usuários</h1>
      {users.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma conta entrou ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-line bg-paper">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted-foreground">
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">E-mail</th>
                <th className="px-4 py-2 font-medium">Editor</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{user.name ?? "—"}</td>
                  <td className="px-4 py-3">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">{user.isEditor ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
