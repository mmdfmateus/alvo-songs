/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

const { mutate, refresh } = vi.hoisted(() => ({
  mutate: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    user: {
      setEditor: {
        useMutation: () => ({ mutate, isPending: false }),
      },
    },
  },
}));

import { EditorToggle } from "~/app/(biblioteca)/usuarios/_components/editor-toggle";

afterEach(() => {
  cleanup();
  mutate.mockReset();
  refresh.mockReset();
});

test("checking Editor saves immediately", async () => {
  render(<EditorToggle userId="bea" name="Bea" isEditor={false} />);

  await userEvent.click(screen.getByRole("checkbox", { name: "Editor: Bea" }));

  expect(mutate).toHaveBeenCalledWith(
    { id: "bea", isEditor: true },
    expect.objectContaining({ onError: expect.any(Function) }),
  );
});

test("unchecking Editor saves immediately", async () => {
  render(<EditorToggle userId="bea" name="Bea" isEditor={true} />);

  await userEvent.click(screen.getByRole("checkbox", { name: "Editor: Bea" }));

  expect(mutate).toHaveBeenCalledWith(
    { id: "bea", isEditor: false },
    expect.objectContaining({ onError: expect.any(Function) }),
  );
});
