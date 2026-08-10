export const MY_PROGRAMS_KEY = "alvo-my-programs";

export type MyProgram = { id: string; name: string };

export function readMyPrograms(): MyProgram[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MY_PROGRAMS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MyProgram =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string",
    );
  } catch {
    return [];
  }
}

export function writeMyPrograms(items: MyProgram[]) {
  localStorage.setItem(MY_PROGRAMS_KEY, JSON.stringify(items));
}

export function addMyProgram(item: MyProgram) {
  const items = readMyPrograms().filter((existing) => existing.id !== item.id);
  writeMyPrograms([item, ...items]);
}

export function removeMyProgram(id: string) {
  writeMyPrograms(readMyPrograms().filter((item) => item.id !== id));
}

export function renameMyProgram(id: string, name: string) {
  writeMyPrograms(
    readMyPrograms().map((item) => (item.id === id ? { ...item, name } : item)),
  );
}
