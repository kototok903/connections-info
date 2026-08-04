import { load } from "cheerio";

import {
  connectionsPuzzleNumber,
  todayInNewYork,
  validatePuzzleDate,
} from "#shared/date.js";
import {
  CONNECTION_COLORS,
  type ConnectionColor,
  type ConnectionsHint,
  type ConnectionsHints,
} from "#shared/types.js";

const MASHABLE_HINTS_HEADING =
  "here's a hint for today's connections categories";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date")?.trim();
  const date = requestedDate || todayInNewYork();
  const dateError = validatePuzzleDate(date);

  if (dateError) {
    return jsonResponse({ error: dateError }, 400, "no-store");
  }

  try {
    const result = await fetchConnectionsHints(date);
    return jsonResponse(result, 200, cacheHeaderFor(date));
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to load hints.",
      },
      502,
      "no-store"
    );
  }
}

export async function fetchConnectionsHints(
  date: string
): Promise<ConnectionsHints> {
  const mashableUrl = mashableHintsUrl(date);
  const response = await fetch(mashableUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "connections-info/0.1",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Mashable returned ${response.status} for ${date}.`);
  }

  const hints = parseMashableHints(await response.text());

  return {
    companionUrl: connectionsCompanionUrl(date),
    date,
    hints,
    mashableUrl,
  };
}

export function parseMashableHints(html: string): ConnectionsHint[] {
  const $ = load(html);
  const heading = $("h2")
    .filter(
      (_, element) =>
        normalizeText($(element).text()) === MASHABLE_HINTS_HEADING
    )
    .first();

  if (!heading.length) {
    throw new Error("Mashable did not include its Connections hints section.");
  }

  const list = heading.nextAll("ul").first();
  if (!list.length) {
    throw new Error("Mashable did not include a hints list.");
  }

  const hintsByColor = new Map<ConnectionColor, string>();
  list.children("li").each((_, element) => {
    const match = normalizeWhitespace($(element).text()).match(
      /^(Yellow|Green|Blue|Purple):\s*(.+)$/i
    );

    if (!match) {
      return;
    }

    const color = match[1].toLowerCase() as ConnectionColor;
    const text = match[2].trim();
    if (text) {
      hintsByColor.set(color, text);
    }
  });

  if (hintsByColor.size !== CONNECTION_COLORS.length) {
    throw new Error("Mashable did not include all four Connections hints.");
  }

  return CONNECTION_COLORS.map((color) => ({
    color,
    text: hintsByColor.get(color)!,
  }));
}

export function mashableHintsUrl(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .toLowerCase();

  return `https://mashable.com/entertainment/nyt-connections-hint-answer-today-${monthName}-${day}-${year}`;
}

export function connectionsCompanionUrl(date: string): string {
  const puzzleNumber = connectionsPuzzleNumber(date);
  if (puzzleNumber === null) {
    throw new Error("Could not determine the Connections puzzle number.");
  }

  const publishedDate = previousIsoDate(date);
  const [year, month, day] = publishedDate.split("-");
  return `https://www.nytimes.com/${year}/${month}/${day}/crosswords/connections-companion-${puzzleNumber}.html`;
}

function previousIsoDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return previous.toISOString().slice(0, 10);
}

function normalizeText(value: string): string {
  return normalizeWhitespace(value).toLowerCase().replaceAll("’", "'");
}

function normalizeWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

function jsonResponse(body: unknown, status: number, cache: string): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": cache,
      "Vercel-CDN-Cache-Control": cache,
    },
  });
}

function cacheHeaderFor(date: string): string {
  if (date < todayInNewYork()) {
    return "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
  }

  return "public, max-age=60, s-maxage=1800, stale-while-revalidate=86400";
}
