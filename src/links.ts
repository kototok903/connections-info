import type { WordLink } from "./types";

export function linksForWord(word: string): WordLink[] {
  const lower = word.toLowerCase();
  return [
    {
      label: "Google",
      href: googleSearchUrl(`${lower} meaning`),
    },
    {
      label: "Dictionary",
      href: merriamWebsterUrl(lower),
    },
    {
      label: "RU",
      href: googleTranslateUrl(lower, "ru"),
    },
    {
      label: "UK",
      href: googleTranslateUrl(lower, "uk"),
    },
    {
      label: "Urban",
      href: urbanDictionaryUrl(lower),
    },
  ];
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

function googleTranslateUrl(word: string, targetLanguage: "ru" | "uk"): string {
  const url = new URL("https://translate.google.com/");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("text", word);
  url.searchParams.set("op", "translate");
  return url.toString();
}

function urbanDictionaryUrl(word: string): string {
  const url = new URL("https://www.urbandictionary.com/define.php");
  url.searchParams.set("term", word);
  return url.toString();
}

function normalizedTerm(word: string): string {
  return word.trim().toLowerCase().replaceAll(/\s+/g, "-");
}
