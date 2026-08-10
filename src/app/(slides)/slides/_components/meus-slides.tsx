"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { addMyProgram, readMyPrograms, type MyProgram } from "~/lib/my-programs";
import { DEFAULT_COMMUNITY_NAME } from "~/lib/slides";
import { saveOwnerTokenToDocument } from "~/lib/program-owners-cookie";
import { api } from "~/trpc/react";

export function MeusSlides() {
  const router = useRouter();
  const [items, setItems] = useState<MyProgram[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setItems(readMyPrograms());
  }, []);

  const create = api.program.create.useMutation({
    onSuccess: (created) => {
      saveOwnerTokenToDocument(created.id, created.ownerToken);
      addMyProgram({ id: created.id, name: created.name });
      router.push(`/slides/${created.id}/editar`);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex max-w-lg flex-col gap-3 rounded-[10px] border border-line bg-paper p-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate({
            name,
            sections: [
              {
                type: "opening",
                payload: { communityName: DEFAULT_COMMUNITY_NAME },
              },
            ],
          });
        }}
      >
        <h2 className="text-sm font-semibold">Novo</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nome do encontro
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Culto 09/08"
            className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
          />
        </label>
        {create.error ? (
          <p className="text-sm text-accent">{create.error.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={create.isPending}
          className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Criar slides
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-muted">Nenhum slide neste dispositivo ainda.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-medium">{item.name}</span>
              <span className="flex gap-3 text-sm font-semibold">
                <Link href={`/slides/${item.id}`} className="text-muted no-underline hover:text-ink">
                  Ver
                </Link>
                <Link
                  href={`/slides/${item.id}/editar`}
                  className="text-accent no-underline"
                >
                  Editar
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
