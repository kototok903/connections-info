import { describe, expect, it } from "vitest";
import { linksForWord } from "../src/links";

describe("linksForWord", () => {
  it("builds research links for a word", () => {
    const links = linksForWord("tinderbox");

    expect(links.map((link) => link.label)).toEqual([
      "Google",
      "Dictionary",
      "RU",
      "UK",
      "Urban",
    ]);
    expect(links[0].href).toBe(
      "https://www.google.com/search?q=tinderbox+meaning",
    );
    expect(links[1].href).toBe(
      "https://www.merriam-webster.com/dictionary/tinderbox",
    );
    expect(links[2].href).toContain("tl=ru");
    expect(links[3].href).toContain("tl=uk");
    expect(links[4].href).toBe(
      "https://www.urbandictionary.com/define.php?term=tinderbox",
    );
  });

  it("normalizes multi-word dictionary URLs", () => {
    const dictionary = linksForWord("ice cream")[1];
    expect(dictionary.href).toBe(
      "https://www.merriam-webster.com/dictionary/ice-cream",
    );
  });
});
