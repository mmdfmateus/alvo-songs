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

function dbWith(flags: { isEditor: boolean; isAdmin: boolean } | null) {
  return {
    user: {
      findUnique: async () => flags,
    },
  };
}

const neither = { isEditor: false, isAdmin: false };

test("anonymous visitor is not signed in and has no editor chrome", async () => {
  const viewer = await resolveViewer(dbWith(neither), null);
  expect(viewer).toEqual({
    signedIn: false,
    isEditor: false,
    isAdmin: false,
    user: null,
  });
});

test("signed-in non-editor looks like anonymous for editor chrome", async () => {
  const viewer = await resolveViewer(dbWith(neither), sessionFor("user-1"));
  expect(viewer).toEqual({
    signedIn: true,
    isEditor: false,
    isAdmin: false,
    user: { name: "Ada", image: null },
  });
});

test("editor chrome is on only when the DB flag is true", async () => {
  const viewer = await resolveViewer(
    dbWith({ isEditor: true, isAdmin: false }),
    sessionFor("user-1"),
  );
  expect(viewer).toEqual({
    signedIn: true,
    isEditor: true,
    isAdmin: false,
    user: { name: "Ada", image: null },
  });
});

test("admin chrome is on only when the DB flag is true, without editor chrome", async () => {
  const viewer = await resolveViewer(
    dbWith({ isEditor: false, isAdmin: true }),
    sessionFor("user-1"),
  );
  expect(viewer).toEqual({
    signedIn: true,
    isEditor: false,
    isAdmin: true,
    user: { name: "Ada", image: null },
  });
});

test("demotion in the DB turns editor chrome off without a new session", async () => {
  const viewer = await resolveViewer(dbWith(neither), sessionFor("user-1"));
  expect(viewer.isEditor).toBe(false);
  expect(viewer.isAdmin).toBe(false);
});
