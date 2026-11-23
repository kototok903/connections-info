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

  it("builds search engine links, including AI-free variants", () => {
    const links = linksForWord(
      "Tinder Box",
      new Set([
        "google-no-ai",
        "duckduckgo",
        "duckduckgo-no-ai",
        "duckduckgo-meaning",
      ])
    );

    expect(links.map((link) => link.href)).toEqual([
      "https://www.google.com/search?q=tinder+box&udm=14",
      "https://duckduckgo.com/?q=tinder+box",
      "https://noai.duckduckgo.com/?q=tinder+box",
      "https://duckduckgo.com/?q=tinder+box+meaning",
    ]);
  });

  it("builds reference links", () => {
    const links = linksForWord(
      "Tinder Box",
      new Set(["wikipedia", "wiktionary", "rhymezone"])
    );

    expect(links.map((link) => link.label)).toEqual([
      "Wikipedia",
      "Wiktionary",
      "Rhymes",
    ]);
    expect(links.map((link) => link.href)).toEqual([
      "https://en.wikipedia.org/wiki/Special:Search?search=tinder+box",
      "https://en.wiktionary.org/wiki/Special:Search?search=tinder+box",
      "https://www.rhymezone.com/r/rhyme.cgi?Word=tinder+box&typeofrhyme=perfect",
    ]);
  });
});
