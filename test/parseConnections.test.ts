import { describe, expect, it } from "vitest";

import { parseNytConnections } from "#api/connections";

describe("parseNytConnections", () => {
  it("preserves categories and assigns their semantic colors", () => {
    const result = parseNytConnections(
      {
        status: "OK",
        id: 1001,
        print_date: "2026-07-07",
        editor: "Test Editor",
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
      "2026-07-06"
    );

    expect(result).toEqual({
      categories: [
        {
          color: "yellow",
          title: "spoiler",
          words: [
            { word: "B", position: 1 },
            { word: "D", position: 3 },
            { word: "A", position: 0 },
            { word: "C", position: 2 },
          ],
        },
        {
          color: "green",
          title: "spoiler",
          words: [
            { word: "F", position: 5 },
            { word: "E", position: 4 },
            { word: "G", position: 6 },
            { word: "H", position: 7 },
          ],
        },
        {
          color: "blue",
          title: "spoiler",
          words: [
            { word: "L", position: 11 },
            { word: "I", position: 8 },
            { word: "K", position: 10 },
            { word: "J", position: 9 },
          ],
        },
        {
          color: "purple",
          title: "spoiler",
          words: [
            { word: "N", position: 13 },
            { word: "M", position: 12 },
            { word: "P", position: 15 },
            { word: "O", position: 14 },
          ],
        },
      ],
      date: "2026-07-07",
      editor: "Test Editor",
      id: 1001,
    });
  });

  it("rejects incomplete puzzles", () => {
    expect(() =>
      parseNytConnections({ categories: [{ cards: [] }] }, "2026-07-07")
    ).toThrow("Expected 4 puzzle categories");
  });

  it("rejects repeated board positions", () => {
    const categories = Array.from({ length: 4 }, (_, categoryIndex) => ({
      title: `Category ${categoryIndex}`,
      cards: Array.from({ length: 4 }, (_, wordIndex) => ({
        content: `Word ${categoryIndex}-${wordIndex}`,
        position:
          categoryIndex === 3 && wordIndex === 3
            ? 0
            : categoryIndex * 4 + wordIndex,
      })),
    }));

    expect(() => parseNytConnections({ categories }, "2026-07-07")).toThrow(
      "positions were not unique"
    );
  });
});
