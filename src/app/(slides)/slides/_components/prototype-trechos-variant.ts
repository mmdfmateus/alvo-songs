// PROTOTYPE — throwaway. Shared by the server page and the client switcher.

export const PROTOTYPE_VARIANTS = [
  { id: "section", name: "Inside the section" },
  { id: "pane", name: "Editor takes the preview" },
  { id: "slide", name: "One slide at a time" },
] as const;

export type PrototypeVariant = (typeof PROTOTYPE_VARIANTS)[number]["id"];

export function parsePrototypeVariant(
  value: string | undefined,
): PrototypeVariant {
  if (value === "pane" || value === "slide") return value;
  return "section";
}
