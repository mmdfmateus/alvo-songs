import { expect, test } from "vitest";

import {
  parseOwnerTokens,
  serializeOwnerTokens,
} from "~/lib/program-owners-cookie";

test("owner tokens round-trip through the cookie payload", () => {
  const serialized = serializeOwnerTokens({ "prog-1": "secret-token" });
  expect(parseOwnerTokens(serialized)).toEqual({ "prog-1": "secret-token" });
});
