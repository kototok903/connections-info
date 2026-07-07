export type ConnectionsPuzzle = {
  date: string;
  words: string[];
};

export const LINK_SOURCE_IDS = [
  "google",
  "google-meaning",
  "dictionary-mw",
  "dictionary-cambridge",
  "dictionary-dictcom",
  "dictionary-urban",
  "thesaurus",
  "translate-ru",
  "translate-uk",
] as const;

export type LinkSourceId = (typeof LINK_SOURCE_IDS)[number];

export type WordLink = {
  sourceId: LinkSourceId;
  label: string;
  href: string;
};
