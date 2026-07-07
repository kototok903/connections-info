import type { LinkSourceId, WordLink } from "../shared/types.js";

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
  "google-meaning": {
    id: "google-meaning",
    label: "Meaning",
    settingsLabel: 'Google "_ meaning"',
    sampleHref: "https://www.google.com/search",
    hrefForWord: (word) => googleSearchUrl(`${word} meaning`),
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
  "translate-ru",
  "translate-uk",
];

export function linksForWord(
  word: string,
  enabledSourceIds: ReadonlySet<LinkSourceId> = new Set(
    DEFAULT_LINK_SOURCE_IDS,
  ),
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

function googleSearchUrl(query: string): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);
  return url.toString();
}

function merriamWebsterUrl(word: string): string {
  return `https://www.merriam-webster.com/dictionary/${encodeURIComponent(
    normalizedTerm(word),
  )}`;
}

function cambridgeUrl(word: string): string {
  return `https://dictionary.cambridge.org/us/dictionary/english/${encodeURIComponent(
    normalizedTerm(word),
  )}`;
}

function dictionaryComUrl(word: string): string {
  return `https://www.dictionary.com/browse/${encodeURIComponent(
    normalizedTerm(word),
  )}`;
}

function urbanDictionaryUrl(word: string): string {
  const url = new URL("https://www.urbandictionary.com/define.php");
  url.searchParams.set("term", word);
  return url.toString();
}

function thesaurusUrl(word: string): string {
  return `https://www.thesaurus.com/browse/${encodeURIComponent(
    normalizedTerm(word),
  )}`;
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
