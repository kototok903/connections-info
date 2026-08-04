import { describe, expect, it } from "vitest";

import {
  connectionsCompanionUrl,
  mashableHintsUrl,
  parseMashableHints,
} from "#api/hints.js";

describe("Connections hint sources", () => {
  it("builds source URLs for a puzzle date", () => {
    expect(mashableHintsUrl("2026-08-04")).toBe(
      "https://mashable.com/entertainment/nyt-connections-hint-answer-today-august-4-2026"
    );
    expect(connectionsCompanionUrl("2026-08-04")).toBe(
      "https://www.nytimes.com/2026/08/03/crosswords/connections-companion-1150.html"
    );
  });

  it("extracts only the four hints from Mashable HTML", () => {
    const html = `
      <main>
        <h2>Here’s a hint for today’s Connections categories</h2>
        <p>Want a hint without being told the categories?</p>
        <ul>
          <li><p>Yellow: <strong>Same shape</strong></p></li>
          <li><p>Green: <strong>The Big Apple</strong></p></li>
          <li><p>Blue: “<strong>Step on it!</strong>”</p></li>
          <li><p>Purple: <strong>Same shape</strong></p></li>
        </ul>
        <h2>Here are today's Connections categories</h2>
        <ul>
          <li><p>Yellow: <strong>Long cylindrical things</strong></p></li>
          <li><p>Green: <strong>Iconic NYC sights</strong></p></li>
          <li><p>Blue: <strong>Things with pedals</strong></p></li>
          <li><p>Purple: <strong>V-Shaped things</strong></p></li>
        </ul>
      </main>
    `;

    expect(parseMashableHints(html)).toEqual([
      { color: "yellow", text: "Same shape" },
      { color: "green", text: "The Big Apple" },
      { color: "blue", text: "“Step on it!”" },
      { color: "purple", text: "Same shape" },
    ]);
  });

  it("rejects incomplete hint lists", () => {
    expect(() =>
      parseMashableHints(`
        <h2>Here's a hint for today's Connections categories</h2>
        <ul><li>Yellow: A partial hint</li></ul>
      `)
    ).toThrow("all four Connections hints");
  });
});
