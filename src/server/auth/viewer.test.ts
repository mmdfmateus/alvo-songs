import { expect, test } from "vitest";

import { resolveViewer } from "~/server/auth/viewer";

function sessionFor(userId: string) {
  return {
    user: {
      id: userId,
      name: "Ada",
      email: "ada@example.com",
      image: null,
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

function dbWith(isEditor: boolean | null) {
  return {
    user: {
      findUnique: async () =>
        isEditor === null ? null : { isEditor },
    },
  };
}

test("anonymous visitor is not signed in and has no editor chrome", async () => {
  const viewer = await resolveViewer(dbWith(false), null);
  expect(viewer).toEqual({ signedIn: false, isEditor: false });
});

test("signed-in non-editor looks like anonymous for editor chrome", async () => {
  const viewer = await resolveViewer(dbWith(false), sessionFor("user-1"));
  expect(viewer).toEqual({ signedIn: true, isEditor: false });
});

test("editor chrome is on only when the DB flag is true", async () => {
  const viewer = await resolveViewer(dbWith(true), sessionFor("user-1"));
  expect(viewer).toEqual({ signedIn: true, isEditor: true });
});

test("demotion in the DB turns editor chrome off without a new session", async () => {
  const viewer = await resolveViewer(dbWith(false), sessionFor("user-1"));
  expect(viewer.isEditor).toBe(false);
});
