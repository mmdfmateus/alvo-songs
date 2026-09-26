// PROTOTYPE — throwaway. Round 2.
// Question: the Trechos editor stays hidden. How does it appear after Editar trechos?

export const PROTOTYPE_VARIANTS = [
  { id: "inline", name: "Opens in the section" },
  { id: "sheet", name: "Slides in from the side" },
  { id: "dialog", name: "Pops over the page" },
] as const;

export type PrototypeVariant = (typeof PROTOTYPE_VARIANTS)[number]["id"];

export function parsePrototypeVariant(
  value: string | undefined,
): PrototypeVariant {
  if (value === "sheet" || value === "dialog") return value;
  return "inline";
}
