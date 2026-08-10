"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

type ArtistFormProps = {
  artist?: { id: string; name: string; imageUrl: string | null };
};

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const [name, setName] = useState(artist?.name ?? "");
  const [imageUrl, setImageUrl] = useState(artist?.imageUrl ?? "");

  const create = api.artist.create.useMutation({
    onSuccess: (created) => router.push(`/artistas/${created.id}`),
  });
  const update = api.artist.update.useMutation({
    onSuccess: (updated) => router.push(`/artistas/${updated.id}`),
  });
  const remove = api.artist.delete.useMutation({
    onSuccess: () => router.push("/artistas"),
  });

  const pending = create.isPending || update.isPending || remove.isPending;
  const error =
    create.error?.message ?? update.error?.message ?? remove.error?.message;

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (artist) {
          update.mutate({ id: artist.id, name, imageUrl });
        } else {
          create.mutate({ name, imageUrl });
        }
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Nome
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        URL da imagem (opcional)
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://"
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
      </label>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {artist ? "Salvar" : "Criar artista"}
        </button>
        {artist ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
            onClick={() => {
              if (
                window.confirm(
                  "Excluir este Artista? As músicas continuam na Biblioteca sem Artista.",
                )
              ) {
                remove.mutate({ id: artist.id });
              }
            }}
          >
            Excluir
          </button>
        ) : null}
      </div>
    </form>
  );
}
