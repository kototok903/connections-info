import { describe, expect, it } from "vitest";

import { linksForWord } from "@/features/connections/links";

describe("linksForWord", () => {
  it("builds research links for a word", () => {
    const links = linksForWord(
      "tinderbox",
      new Set([
        "google-meaning",
        "dictionary-mw",
        "dictionary-urban",
        "thesaurus",
      ])
    );

    expect(links.map((link) => link.label)).toEqual([
      "Meaning",
      "Dictionary",
      "Urban",
      "Thesaurus",
    ]);
    expect(links[0].href).toBe(
      "https://www.google.com/search?q=tinderbox+meaning"
    );
    expect(links[1].href).toBe(
      "https://www.merriam-webster.com/dictionary/tinderbox"
    );
    expect(links[2].href).toBe(
      "https://www.urbandictionary.com/define.php?term=tinderbox"
    );
    expect(links[3].href).toBe("https://www.thesaurus.com/browse/tinderbox");
  });

  it("filters links by enabled source ids", () => {
    const links = linksForWord("tinderbox", new Set(["translate-uk"]));

    expect(links).toEqual([
      {
        sourceId: "translate-uk",
        label: "UK",
        href: "https://translate.google.com/?sl=en&tl=uk&text=tinderbox&op=translate",
      },
    ]);
  });

  it("normalizes multi-word dictionary URLs", () => {
    const [dictionary, thesaurus] = linksForWord(
      "ice cream",
      new Set(["dictionary-mw", "thesaurus"])
    );

    expect(dictionary.href).toBe(
      "https://www.merriam-webster.com/dictionary/ice-cream"
    );
    expect(thesaurus.href).toBe("https://www.thesaurus.com/browse/ice-cream");
  });
});
