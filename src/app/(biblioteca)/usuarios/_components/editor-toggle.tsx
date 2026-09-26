"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function EditorToggle({
  userId,
  isEditor,
}: {
  userId: string;
  isEditor: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const setEditor = api.user.setEditor.useMutation({
    onSuccess: () => {
      setError(null);
      router.refresh();
    },
    onError: () => {
      setError("Não foi possível atualizar.");
    },
  });

  return (
    <span className="inline-flex items-center gap-3">
      <span>{isEditor ? "Sim" : "Não"}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={setEditor.isPending}
        onClick={() => setEditor.mutate({ id: userId, isEditor: !isEditor })}
      >
        {isEditor ? "Remover editor" : "Tornar editor"}
      </Button>
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </span>
  );
}
