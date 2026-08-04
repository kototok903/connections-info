export const CONNECTION_COLORS = ["yellow", "green", "blue", "purple"] as const;

export type ConnectionColor = (typeof CONNECTION_COLORS)[number];

export type ConnectionsWord = {
  position: number;
  word: string;
};

export type ConnectionsCategory = {
  color: ConnectionColor;
  title: string;
  words: ConnectionsWord[];
};

export type ConnectionsPuzzle = {
  categories: ConnectionsCategory[];
  date: string;
  editor: string | null;
  id: number | null;
};

export type ConnectionsHint = {
  color: ConnectionColor;
  text: string;
};

export type ConnectionsHints = {
  companionUrl: string;
  date: string;
  hints: ConnectionsHint[];
  mashableUrl: string;
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
