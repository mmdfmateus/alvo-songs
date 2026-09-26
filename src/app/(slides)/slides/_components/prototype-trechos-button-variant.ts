// PROTOTYPE — throwaway. Not production.
// Question: how should an Editor open the Trechos sheet?
// Three variants on /slides/[id]/editar?variant= — pill, toolbar, slide.

export const PROTOTYPE_VARIANTS = [
  { id: "pill", name: "Pill under the song" },
  { id: "toolbar", name: "Icon in the section header" },
  { id: "slide", name: "On the song slide" },
] as const;

export type PrototypeVariant = (typeof PROTOTYPE_VARIANTS)[number]["id"];

export function parsePrototypeVariant(
  value: string | undefined,
): PrototypeVariant {
  if (value === "toolbar" || value === "slide") return value;
  return "pill";
}
