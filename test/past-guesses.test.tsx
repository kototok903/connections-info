import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PastGuesses } from "@/features/connections/PastGuesses";
import type { ConnectionsPuzzle } from "#shared/types.js";

const puzzle: ConnectionsPuzzle = {
  categories: [
    category("yellow", ["APPLE", "BANANA", "ORANGE", "PEAR"], 0),
    category("green", ["CAR", "PLANE", "TRUCK", "SHIP"], 4),
    category("blue", ["BLUE 1", "BLUE 2", "BLUE 3", "BLUE 4"], 8),
    category("purple", ["PURPLE 1", "PURPLE 2", "PURPLE 3", "PURPLE 4"], 12),
  ],
  date: "2026-07-07",
  editor: "Test Editor",
  id: 1001,
};

describe("PastGuesses", () => {
  it("labels one-away, incorrect, and correct guesses", () => {
    render(
      <PastGuesses
        puzzle={puzzle}
        guesses={[
          { positions: [0, 1, 2, 4] },
          { positions: [0, 1, 4, 5] },
          { positions: [4, 5, 6, 7] },
        ]}
      />
    );

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(
      "APPLE, BANANA, ORANGE, CAR -> One Away"
    );
    expect(items[1]).toHaveTextContent(
      "APPLE, BANANA, CAR, PLANE -> Incorrect"
    );
    expect(items[2]).toHaveTextContent("CAR, PLANE, TRUCK, SHIP -> Green");
    expect(within(items[2]).getByText("Green")).toHaveClass(
      "text-connection-green"
    );
  });

  it("does not render before the first guess", () => {
    render(<PastGuesses puzzle={puzzle} guesses={[]} />);

    expect(
      screen.queryByRole("heading", { name: "Past Guesses" })
    ).not.toBeInTheDocument();
  });
});

function category(
  color: "yellow" | "green" | "blue" | "purple",
  words: string[],
  startPosition: number
) {
  return {
    color,
    title: color,
    words: words.map((word, index) => ({
      position: startPosition + index,
      word,
    })),
  };
}
