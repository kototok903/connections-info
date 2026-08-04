import { describe, expect, it, vi } from "vitest";

import {
  resultsShareText,
  shareResultsText,
} from "@/features/connections/results-share";
import type { ConnectionsPuzzle } from "#shared/types.js";

const puzzle: ConnectionsPuzzle = {
  categories: [
    category("yellow", 0),
    category("green", 4),
    category("blue", 8),
    category("purple", 12),
  ],
  date: "2026-08-04",
  editor: null,
  id: 1150,
};

describe("results sharing", () => {
  it("builds the puzzle number and ordered guess grid", () => {
    expect(
      resultsShareText(puzzle, [
        { positions: [12, 13, 14, 15] },
        { positions: [0, 1, 2, 3] },
        { positions: [8, 9, 10, 4] },
        { positions: [8, 9, 10, 11] },
        { positions: [4, 5, 6, 7] },
      ])
    ).toBe(
      "Connections\nPuzzle #1150\n🟪🟪🟪🟪\n🟨🟨🟨🟨\n🟦🟦🟦🟩\n🟦🟦🟦🟦\n🟩🟩🟩🟩"
    );
  });

  it("uses the system share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(
      shareResultsText("results", {
        share,
        clipboard: { writeText },
        userAgent: "Mozilla/5.0 (iPhone)",
      } as unknown as Navigator)
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: "results" });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies to the clipboard when system sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(
      shareResultsText("results", {
        clipboard: { writeText },
      } as unknown as Navigator)
    ).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("results");
  });

  it("copies on desktop even when the Web Share API is available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(
      shareResultsText("results", {
        share,
        clipboard: { writeText },
        userAgent: "Mozilla/5.0 (Macintosh)",
      } as unknown as Navigator)
    ).resolves.toBe("copied");
    expect(share).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("results");
  });
});

function category(
  color: "yellow" | "green" | "blue" | "purple",
  startPosition: number
) {
  return {
    color,
    title: color,
    words: Array.from({ length: 4 }, (_, index) => ({
      position: startPosition + index,
      word: `${color}-${index}`,
    })),
  };
}
