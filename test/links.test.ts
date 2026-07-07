import { describe, expect, it } from "vitest";
import { linksForWord } from "../src/links";

describe("linksForWord", () => {
  it("builds research links for a word", () => {
    const links = linksForWord("tinderbox");

    expect(links.map((link) => link.label)).toEqual([
      "Google",
      "Dictionary",
      "Thesaurus",
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
    expect(links[2].href).toBe("https://www.thesaurus.com/browse/tinderbox");
    expect(links[3].href).toContain("tl=ru");
    expect(links[4].href).toContain("tl=uk");
    expect(links[5].href).toBe(
      "https://www.urbandictionary.com/define.php?term=tinderbox",
    );
  });

  it("normalizes multi-word dictionary URLs", () => {
    const dictionary = linksForWord("ice cream")[1];
    const thesaurus = linksForWord("ice cream")[2];

    expect(dictionary.href).toBe(
      "https://www.merriam-webster.com/dictionary/ice-cream",
    );
    expect(thesaurus.href).toBe("https://www.thesaurus.com/browse/ice-cream");
  });
});
