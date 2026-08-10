import { expect, test } from "vitest";

import { createOwnerToken, hashOwnerToken } from "~/lib/program-owner";

test("owner token hash is deterministic and does not store the secret", () => {
  const token = createOwnerToken();
  const hash = hashOwnerToken(token);

  expect(token).not.toBe(hash);
  expect(hash).toHaveLength(64);
  expect(hashOwnerToken(token)).toBe(hash);
  expect(hashOwnerToken("other-token")).not.toBe(hash);
});
