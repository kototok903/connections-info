import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

const words = [
  "ALPHA",
  "BRAVO",
  "CHARLIE",
  "DELTA",
  "ECHO",
  "FOXTROT",
  "GOLF",
  "HOTEL",
  "INDIA",
  "JULIET",
  "KILO",
  "LIMA",
  "MIKE",
  "NOVEMBER",
  "OSCAR",
  "PAPA",
];

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("Connections app", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => puzzleResponse());
    window.localStorage.clear();
    window.history.replaceState(null, "", "/?date=2026-07-07");
  });

  it("loads and renders the puzzle selected in the URL", async () => {
    render(<App />);

    expect(screen.getByText("Loading puzzle words...")).toBeInTheDocument();
    expect(await screen.findByText("ALPHA")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "?date=2026-07-07",
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("loads a calendar date immediately", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    fireEvent.click(screen.getByRole("button", { name: "July 7th, 2026" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Monday, July 6/ })
    );
    await waitFor(() => {
      expect(window.location.search).toBe("?date=2026-07-06");
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "?date=2026-07-06" }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("moves backward and forward by one day", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    await waitFor(() => {
      expect(window.location.search).toBe("?date=2026-07-06");
    });

    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    await waitFor(() => {
      expect(window.location.search).toBe("?date=2026-07-07");
    });
  });

  it("persists source settings and updates word links", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    const alphaCard = screen.getByText("ALPHA").closest("article");
    expect(alphaCard).not.toBeNull();
    expect(
      within(alphaCard!).getByRole("link", { name: "Dictionary" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(
      await screen.findByRole("switch", { name: "Merriam-Webster" })
    );

    expect(
      within(alphaCard!).queryByRole("link", { name: "Dictionary" })
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("connections-info:settings:v1")
    ).toContain('"dictionary-mw":false');
  });

  it("shows API errors without rendering stale cards", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Puzzle unavailable." }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<App />);

    expect(await screen.findByText("Puzzle unavailable.")).toBeInTheDocument();
    expect(screen.queryByText("ALPHA")).not.toBeInTheDocument();
  });
});

function puzzleResponse() {
  return new Response(
    JSON.stringify({
      date: "2026-07-07",
      words,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
