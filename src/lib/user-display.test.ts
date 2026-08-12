import { expect, test } from "vitest";

import { userInitials } from "~/lib/user-display";

test("userInitials uses first and last name letters", () => {
  expect(userInitials("Ada Lovelace")).toBe("AL");
});

test("userInitials uses first two letters for a single name", () => {
  expect(userInitials("Ada")).toBe("AD");
});

test("userInitials falls back when name is missing", () => {
  expect(userInitials(null)).toBe("?");
  expect(userInitials("   ")).toBe("?");
});
