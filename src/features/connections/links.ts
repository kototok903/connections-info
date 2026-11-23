import type { LinkSourceId, WordLink } from "#shared/types.js";

export type LinkSource = {
  id: LinkSourceId;
  label: string;
  settingsLabel: string;
  sampleHref: string;
  hrefForWord: (word: string) => string;
};

export const LINK_SOURCES: Record<LinkSourceId, LinkSource> = {
  google: {
    id: "google",
    label: "Google",
    settingsLabel: "Google",
    sampleHref: "https://www.google.com/search",
    hrefForWord: googleSearchUrl,
  },
  "google-no-ai": {
    id: "google-no-ai",
    label: "Google",
    settingsLabel: "Google (no AI)",
    sampleHref: "https://www.google.com/search",
    hrefForWord: (word) => googleSearchUrl(word, { noAi: true }),
  },
  "google-meaning": {
    id: "google-meaning",
    label: "Meaning",
    settingsLabel: 'Google "_ meaning"',
    sampleHref: "https://www.google.com/search",
    hrefForWord: (word) => googleSearchUrl(`${word} meaning`),
  },
  duckduckgo: {
    id: "duckduckgo",
    label: "DuckDuckGo",
    settingsLabel: "DuckDuckGo",
    sampleHref: "https://duckduckgo.com/",
    hrefForWord: duckDuckGoUrl,
  },
  "duckduckgo-no-ai": {
    id: "duckduckgo-no-ai",
    label: "DuckDuckGo",
    settingsLabel: "DuckDuckGo (no AI)",
    sampleHref: "https://duckduckgo.com/",
    hrefForWord: (word) => duckDuckGoUrl(word, { noAi: true }),
  },
  "duckduckgo-meaning": {
    id: "duckduckgo-meaning",
    label: "Meaning",
    settingsLabel: 'DuckDuckGo "_ meaning"',
    sampleHref: "https://duckduckgo.com/",
    hrefForWord: (word) => duckDuckGoUrl(`${word} meaning`),
  },
  "dictionary-mw": {
    id: "dictionary-mw",
    label: "Dictionary",
    settingsLabel: "Merriam-Webster",
    sampleHref: "https://www.merriam-webster.com/",
    hrefForWord: merriamWebsterUrl,
  },
  "dictionary-cambridge": {
    id: "dictionary-cambridge",
    label: "Dictionary",
    settingsLabel: "Cambridge Dictionary",
    sampleHref: "https://dictionary.cambridge.org/",
    hrefForWord: cambridgeUrl,
  },
  "dictionary-dictcom": {
    id: "dictionary-dictcom",
    label: "Dictionary",
    settingsLabel: "Dictionary.com",
    sampleHref: "https://www.dictionary.com/",
    hrefForWord: dictionaryComUrl,
  },
  "dictionary-urban": {
    id: "dictionary-urban",
    label: "Urban",
    settingsLabel: "Urban Dictionary",
    sampleHref: "https://www.urbandictionary.com/",
    hrefForWord: urbanDictionaryUrl,
  },
  thesaurus: {
    id: "thesaurus",
    label: "Thesaurus",
    settingsLabel: "Thesaurus.com",
    sampleHref: "https://www.thesaurus.com/",
    hrefForWord: thesaurusUrl,
  },
  wikipedia: {
    id: "wikipedia",
    label: "Wikipedia",
    settingsLabel: "Wikipedia",
    sampleHref: "https://en.wikipedia.org/",
    hrefForWord: (word) => wikiSearchUrl("en.wikipedia.org", word),
  },
  wiktionary: {
    id: "wiktionary",
    label: "Wiktionary",
    settingsLabel: "Wiktionary",
    sampleHref: "https://en.wiktionary.org/",
    hrefForWord: (word) => wikiSearchUrl("en.wiktionary.org", word),
  },
  rhymezone: {
    id: "rhymezone",
    label: "Rhymes",
    settingsLabel: "RhymeZone",
    sampleHref: "https://www.rhymezone.com/",
    hrefForWord: rhymeZoneUrl,
  },
  "translate-ru": {
    id: "translate-ru",
    label: "RU",
    settingsLabel: "Russian translation",
    sampleHref: "https://translate.google.com/",
    hrefForWord: (word) => googleTranslateUrl(word, "ru"),
  },
  "translate-uk": {
    id: "translate-uk",
    label: "UK",
    settingsLabel: "Ukrainian translation",
    sampleHref: "https://translate.google.com/",
    hrefForWord: (word) => googleTranslateUrl(word, "uk"),
  },
};

export const DEFAULT_LINK_SOURCE_IDS: LinkSourceId[] = [
  "google-meaning",
  "dictionary-mw",
  "dictionary-urban",
  "thesaurus",
];

export function linksForWord(
  word: string,
  enabledSourceIds: ReadonlySet<LinkSourceId> = new Set(DEFAULT_LINK_SOURCE_IDS)
): WordLink[] {
  const lower = word.toLowerCase();
  return Array.from(enabledSourceIds, (sourceId) => {
    const source = LINK_SOURCES[sourceId];
    return {
      sourceId: source.id,
      label: source.label,
      href: source.hrefForWord(lower),
    };
  });
}

function googleSearchUrl(query: string, { noAi = false } = {}): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);
  if (noAi) {
    // "Web" results tab, which skips AI Overviews.
    url.searchParams.set("udm", "14");
  }
  return url.toString();
}

function duckDuckGoUrl(query: string, { noAi = false } = {}): string {
  // noai.duckduckgo.com is DuckDuckGo's official AI-free search endpoint.
  const url = new URL(
    noAi ? "https://noai.duckduckgo.com/" : "https://duckduckgo.com/"
  );
  url.searchParams.set("q", query);
  return url.toString();
}

function merriamWebsterUrl(word: string): string {
  return `https://www.merriam-webster.com/dictionary/${encodeURIComponent(
    normalizedTerm(word)
  )}`;
}

function cambridgeUrl(word: string): string {
  return `https://dictionary.cambridge.org/us/dictionary/english/${encodeURIComponent(
    normalizedTerm(word)
  )}`;
}

function dictionaryComUrl(word: string): string {
  return `https://www.dictionary.com/browse/${encodeURIComponent(
    normalizedTerm(word)
  )}`;
}

function urbanDictionaryUrl(word: string): string {
  const url = new URL("https://www.urbandictionary.com/define.php");
  url.searchParams.set("term", word);
  return url.toString();
}

function thesaurusUrl(word: string): string {
  return `https://www.thesaurus.com/browse/${encodeURIComponent(
    normalizedTerm(word)
  )}`;
}

// Special:Search jumps straight to the page on an exact title match and
// falls back to search results otherwise (e.g. for multi-word items).
function wikiSearchUrl(host: string, query: string): string {
  const url = new URL(`https://${host}/wiki/Special:Search`);
  url.searchParams.set("search", query);
  return url.toString();
}

function rhymeZoneUrl(word: string): string {
  const url = new URL("https://www.rhymezone.com/r/rhyme.cgi");
  url.searchParams.set("Word", word);
  url.searchParams.set("typeofrhyme", "perfect");
  return url.toString();
}

function googleTranslateUrl(word: string, targetLanguage: "ru" | "uk"): string {
  const url = new URL("https://translate.google.com/");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("text", word);
  url.searchParams.set("op", "translate");
  return url.toString();
}

function normalizedTerm(word: string): string {
  return word.trim().toLowerCase().replaceAll(/\s+/g, "-");
}
