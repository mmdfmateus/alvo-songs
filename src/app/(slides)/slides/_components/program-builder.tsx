"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SlidePreview } from "~/app/(slides)/slides/_components/slide-preview";
import { removeMyProgram, renameMyProgram } from "~/lib/my-programs";
import { clearOwnerTokenFromDocument } from "~/lib/program-owners-cookie";
import {
  DEFAULT_COMMUNITY_NAME,
  expandSections,
} from "~/lib/slides";
import { api } from "~/trpc/react";

type DraftSection =
  | {
      key: string;
      type: "opening";
      payload: { communityName: string; subtitle: string };
    }
  | {
      key: string;
      type: "announcements" | "game" | "moment";
      payload: { title: string };
    };

const TYPE_LABEL: Record<DraftSection["type"], string> = {
  opening: "Abertura",
  announcements: "Recados",
  game: "Brincadeira",
  moment: "Momento",
};

function newKey() {
  return crypto.randomUUID();
}

function sectionsFromProgram(
  sections: { type: string; payload: unknown }[],
): DraftSection[] {
  return sections.flatMap((section, index): DraftSection[] => {
    const key = `${section.type}-${index}`;
    if (section.type === "opening") {
      const payload = (section.payload ?? {}) as {
        communityName?: string;
        subtitle?: string;
      };
      return [
        {
          key,
          type: "opening",
          payload: {
            communityName: payload.communityName ?? DEFAULT_COMMUNITY_NAME,
            subtitle: payload.subtitle ?? "",
          },
        },
      ];
    }
    if (
      section.type === "announcements" ||
      section.type === "game" ||
      section.type === "moment"
    ) {
      const payload = (section.payload ?? {}) as { title?: string };
      return [
        {
          key,
          type: section.type,
          payload: { title: payload.title ?? "" },
        },
      ];
    }
    return [];
  });
}

function toInput(sections: DraftSection[]) {
  return sections.map((section) => {
    if (section.type === "opening") {
      return {
        type: "opening" as const,
        payload: {
          communityName: section.payload.communityName,
          ...(section.payload.subtitle.trim()
            ? { subtitle: section.payload.subtitle.trim() }
            : {}),
        },
      };
    }
    return {
      type: section.type,
      payload: { title: section.payload.title },
    };
  });
}

export function ProgramBuilder({
  program,
  ownerToken,
}: {
  program: {
    id: string;
    name: string;
    sections: { type: string; payload: unknown }[];
  };
  ownerToken: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(program.name);
  const [sections, setSections] = useState<DraftSection[]>(() =>
    sectionsFromProgram(program.sections),
  );

  const slides = useMemo(() => expandSections(toInput(sections)), [sections]);

  const update = api.program.update.useMutation({
    onSuccess: (saved) => {
      renameMyProgram(saved.id, saved.name);
      router.refresh();
    },
  });
  const remove = api.program.delete.useMutation({
    onSuccess: () => {
      removeMyProgram(program.id);
      clearOwnerTokenFromDocument(program.id);
      router.push("/slides");
    },
  });

  const pending = update.isPending || remove.isPending;
  const error = update.error?.message ?? remove.error?.message;

  function move(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    setSections(copy);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/slides/${program.id}`}
          className="text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          Ver link público
        </Link>
        <button
          type="button"
          disabled={pending}
          className="text-sm font-semibold text-accent disabled:opacity-60"
          onClick={() => {
            if (window.confirm("Excluir estes Slides deste dispositivo?")) {
              remove.mutate({ id: program.id, ownerToken });
            }
          }}
        >
          Excluir
        </button>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate({
            id: program.id,
            ownerToken,
            name,
            sections: toInput(sections),
          });
        }}
      >
        <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
          Nome
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
          />
        </label>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Seções</h2>
          {sections.map((section, index) => (
            <div
              key={section.key}
              className="flex flex-col gap-2 rounded-[10px] border border-line bg-paper p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{TYPE_LABEL[section.type]}</p>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="text-muted hover:text-ink"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="text-muted hover:text-ink"
                  >
                    Descer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSections(sections.filter((_, i) => i !== index))
                    }
                    className="font-semibold text-accent"
                  >
                    Remover
                  </button>
                </div>
              </div>
              {section.type === "opening" ? (
                <>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Comunidade
                    <input
                      required
                      value={section.payload.communityName}
                      onChange={(event) => {
                        const copy = [...sections];
                        copy[index] = {
                          ...section,
                          payload: {
                            ...section.payload,
                            communityName: event.target.value,
                          },
                        };
                        setSections(copy);
                      }}
                      className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Subtítulo (opcional)
                    <input
                      value={section.payload.subtitle}
                      onChange={(event) => {
                        const copy = [...sections];
                        copy[index] = {
                          ...section,
                          payload: {
                            ...section.payload,
                            subtitle: event.target.value,
                          },
                        };
                        setSections(copy);
                      }}
                      className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                    />
                  </label>
                </>
              ) : (
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Título
                  <input
                    required
                    value={section.payload.title}
                    onChange={(event) => {
                      const copy = [...sections];
                      copy[index] = {
                        ...section,
                        payload: { title: event.target.value },
                      };
                      setSections(copy);
                    }}
                    className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                  />
                </label>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["opening", "Abertura"],
                ["announcements", "Recados"],
                ["game", "Brincadeira"],
                ["moment", "Momento"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
                onClick={() => {
                  if (type === "opening") {
                    setSections([
                      ...sections,
                      {
                        key: newKey(),
                        type: "opening",
                        payload: {
                          communityName: DEFAULT_COMMUNITY_NAME,
                          subtitle: "",
                        },
                      },
                    ]);
                    return;
                  }
                  setSections([
                    ...sections,
                    {
                      key: newKey(),
                      type,
                      payload: { title: label },
                    },
                  ]);
                }}
              >
                + {label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Salvar
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Prévia</h2>
        <SlidePreview slides={slides} />
      </section>
    </div>
  );
}
