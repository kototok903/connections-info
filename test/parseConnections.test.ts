import { describe, expect, it } from "vitest";
import { parseNytConnections } from "../api/connections";

describe("parseNytConnections", () => {
  it("extracts only words sorted by position", () => {
    const result = parseNytConnections(
      {
        status: "OK",
        print_date: "2026-07-07",
        categories: [
          {
            title: "spoiler",
            cards: [
              { content: "B", position: 1 },
              { content: "D", position: 3 },
              { content: "A", position: 0 },
              { content: "C", position: 2 },
            ],
          },
          {
            title: "spoiler",
            cards: [
              { content: "F", position: 5 },
              { content: "E", position: 4 },
              { content: "G", position: 6 },
              { content: "H", position: 7 },
            ],
          },
          {
            title: "spoiler",
            cards: [
              { content: "L", position: 11 },
              { content: "I", position: 8 },
              { content: "K", position: 10 },
              { content: "J", position: 9 },
            ],
          },
          {
            title: "spoiler",
            cards: [
              { content: "N", position: 13 },
              { content: "M", position: 12 },
              { content: "P", position: 15 },
              { content: "O", position: 14 },
            ],
          },
        ],
      },
      "2026-07-06",
    );

    expect(result).toEqual({
      date: "2026-07-07",
      words: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
      ],
    });
  });

  it("rejects incomplete puzzles", () => {
    expect(() =>
      parseNytConnections({ categories: [{ cards: [] }] }, "2026-07-07"),
    ).toThrow("Expected 16 puzzle words");
  });
});
