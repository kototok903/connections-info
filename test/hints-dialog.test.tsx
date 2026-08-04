import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HintsDialog } from "@/features/connections/HintsDialog";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("HintsDialog", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("loads hints only after opening and links to both sources", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        companionUrl:
          "https://www.nytimes.com/2026/08/03/crosswords/connections-companion-1150.html",
        date: "2026-08-04",
        hints: [
          { color: "yellow", text: "Same shape" },
          { color: "green", text: "The Big Apple" },
          { color: "blue", text: "Step on it!" },
          { color: "purple", text: "Same shape" },
        ],
        mashableUrl:
          "https://mashable.com/entertainment/nyt-connections-hint-answer-today-august-4-2026",
      })
    );

    render(<HintsDialog date="2026-08-04" />);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Open hints" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      await within(dialog).findByText("The Big Apple")
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "?date=2026-08-04&schema=1",
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(
      within(dialog).getByRole("link", { name: "Mashable" })
    ).toHaveAttribute("href", expect.stringContaining("mashable.com"));
    expect(
      within(dialog).getByRole("link", { name: /Connections Companion/ })
    ).toHaveAttribute("href", expect.stringContaining("nytimes.com"));
  });

  it("shows an error and retries", async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json({ error: "Hints are unavailable." }, { status: 502 })
      )
      .mockResolvedValueOnce(
        Response.json({
          companionUrl: "https://www.nytimes.com/companion",
          date: "2026-08-04",
          hints: [
            { color: "yellow", text: "One" },
            { color: "green", text: "Two" },
            { color: "blue", text: "Three" },
            { color: "purple", text: "Four" },
          ],
          mashableUrl: "https://mashable.com/hints",
        })
      );

    render(<HintsDialog date="2026-08-04" />);
    fireEvent.click(screen.getByRole("button", { name: "Open hints" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Hints are unavailable."
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Three")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
