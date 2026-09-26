"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

export function EditorToggle({
  userId,
  name,
  isEditor,
}: {
  userId: string;
  name: string | null;
  isEditor: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(isEditor);
  const [error, setError] = useState<string | null>(null);
  const setEditor = api.user.setEditor.useMutation({
    onSuccess: () => {
      setError(null);
      router.refresh();
    },
  });

  useEffect(() => {
    setChecked(isEditor);
  }, [isEditor]);

  const label = name ? `Editor: ${name}` : "Editor";

  return (
    <span className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        className="size-4 accent-accent"
        checked={checked}
        disabled={setEditor.isPending}
        aria-label={label}
        onChange={(event) => {
          const next = event.currentTarget.checked;
          setChecked(next);
          setError(null);
          setEditor.mutate(
            { id: userId, isEditor: next },
            {
              onError: () => {
                setChecked(!next);
                setError("Não foi possível atualizar.");
              },
            },
          );
        }}
      />
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </span>
  );
}
