export const PROGRAM_OWNERS_COOKIE = "alvo-program-owners";
export const PROGRAM_OWNERS_MAX_AGE = 60 * 60 * 24 * 365;

export function parseOwnerTokens(raw: string | undefined): Record<string, string> {
  if (!raw) return {};

  const candidates = [raw];
  try {
    candidates.unshift(decodeURIComponent(raw));
  } catch {
    // cookie may already be decoded
  }

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (typeof parsed !== "object" || parsed === null) continue;
      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
    } catch {
      continue;
    }
  }

  return {};
}

export function serializeOwnerTokens(tokens: Record<string, string>): string {
  return encodeURIComponent(JSON.stringify(tokens));
}

function readDocumentCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.slice(`${name}=`.length);
}

function writeDocumentOwnerTokens(tokens: Record<string, string>) {
  document.cookie = [
    `${PROGRAM_OWNERS_COOKIE}=${serializeOwnerTokens(tokens)}`,
    "Path=/",
    `Max-Age=${PROGRAM_OWNERS_MAX_AGE}`,
    "SameSite=Lax",
  ].join("; ");
}

export function readOwnerTokenFromDocument(programId: string): string | null {
  return parseOwnerTokens(readDocumentCookieValue(PROGRAM_OWNERS_COOKIE))[
    programId
  ] ?? null;
}

export function saveOwnerTokenToDocument(programId: string, token: string) {
  if (typeof document === "undefined") return;
  const current = parseOwnerTokens(readDocumentCookieValue(PROGRAM_OWNERS_COOKIE));
  current[programId] = token;
  writeDocumentOwnerTokens(current);
}

export function clearOwnerTokenFromDocument(programId: string) {
  if (typeof document === "undefined") return;
  const current = parseOwnerTokens(readDocumentCookieValue(PROGRAM_OWNERS_COOKIE));
  delete current[programId];
  writeDocumentOwnerTokens(current);
}
