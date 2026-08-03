import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { todayInLocalTimezone } from "#shared/date.js";

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

    expect(screen.getByText("Loading puzzle...")).toBeInTheDocument();
    expect(await screen.findByText("ALPHA")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "?date=2026-07-07&schema=2",
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("uses the local date without adding it to an empty URL", async () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(await screen.findByText("ALPHA")).toBeInTheDocument();
    expect(window.location.search).toBe("");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: `?date=${todayInLocalTimezone()}&schema=2`,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("adds an explicit date after navigating back to today", async () => {
    window.history.replaceState(null, "", "/");
    const today = todayInLocalTimezone();

    render(<App />);
    await screen.findByText("ALPHA");

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));

    await waitFor(() => {
      expect(window.location.search).toBe(`?date=${today}`);
    });
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
      expect.objectContaining({ search: "?date=2026-07-06&schema=2" }),
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

  it("prevents navigation before the first Connections puzzle", async () => {
    window.history.replaceState(null, "", "/?date=2023-06-12");
    render(<App />);
    await screen.findByText("ALPHA");

    expect(screen.getByRole("button", { name: "Previous day" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "June 12th, 2023" }));
    expect(
      await screen.findByRole("button", { name: /Sunday, June 11/ })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Monday, June 12/ })
    ).toBeEnabled();
  });

  it("persists source settings and updates word links", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    fireEvent.click(screen.getByRole("button", { name: "ALPHA" }));
    expect(
      within(screen.getByRole("region", { name: "Research ALPHA" })).getByRole(
        "link",
        { name: "Dictionary" }
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(
      await screen.findByRole("switch", { name: "Merriam-Webster" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(
      within(
        screen.getByRole("region", { name: "Research ALPHA" })
      ).queryByRole("link", { name: "Dictionary" })
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("connections-info:settings:v1")
    ).toContain('"dictionary-mw":false');
  });

  it("hides research sources and disables their settings", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    fireEvent.click(screen.getByRole("button", { name: "ALPHA" }));
    expect(
      screen.getByRole("region", { name: "Research ALPHA" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    const masterSwitch = await screen.findByRole("switch", {
      name: "Show Research sources",
    });
    expect(masterSwitch).toBeChecked();

    fireEvent.click(masterSwitch);

    expect(
      screen.getByRole("switch", { name: "Merriam-Webster" })
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByRole("region", { name: "Research ALPHA" })
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("connections-info:settings:v1")
    ).toContain('"showResearchSources":false');
  });

  it("shows research sources only when exactly one word is selected", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    expect(
      screen.queryByRole("region", { name: /Research/ })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ALPHA" }));
    expect(
      screen.getByRole("region", { name: "Research ALPHA" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "BRAVO" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /Research/ })
      ).not.toBeInTheDocument();
    });
  });

  it("keeps the fourth category playable and opens results after it is submitted", async () => {
    render(<App />);
    await screen.findByText("ALPHA");

    await solveWords(["ALPHA", "BRAVO", "CHARLIE", "DELTA"], "First");
    await solveWords(["ECHO", "FOXTROT", "GOLF", "HOTEL"], "Second");
    await solveWords(["INDIA", "JULIET", "KILO", "LIMA"], "Third");

    expect(screen.getByRole("button", { name: "MIKE" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await solveWords(["MIKE", "NOVEMBER", "OSCAR", "PAPA"], "Fourth");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getAllByRole("img")).toHaveLength(
      16
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByRole("button", { name: "Replay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Results" })).toBeInTheDocument();
  }, 8_000);

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
      categories: [
        category("yellow", "First", 0),
        category("green", "Second", 4),
        category("blue", "Third", 8),
        category("purple", "Fourth", 12),
      ],
      date: "2026-07-07",
      editor: "Test Editor",
      id: 1001,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function category(
  color: "yellow" | "green" | "blue" | "purple",
  title: string,
  startPosition: number
) {
  return {
    color,
    title,
    words: words.slice(startPosition, startPosition + 4).map((word, index) => ({
      position: startPosition + index,
      word,
    })),
  };
}

async function solveWords(group: string[], title: string) {
  for (const word of group) {
    fireEvent.click(screen.getByRole("button", { name: word }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(
    await screen.findByRole("heading", { name: title })
  ).toBeInTheDocument();
}
