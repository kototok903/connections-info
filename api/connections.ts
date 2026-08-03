import { todayInNewYork, validatePuzzleDate } from "#shared/date.js";
import {
  CONNECTION_COLORS,
  type ConnectionsCategory,
  type ConnectionsPuzzle,
} from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

type NytConnectionsCard = {
  content?: unknown;
  position?: unknown;
};

type NytConnectionsCategory = {
  cards?: unknown;
  title?: unknown;
};

type NytConnectionsResponse = {
  categories?: unknown;
  editor?: unknown;
  id?: unknown;
  print_date?: unknown;
};

const NYT_ENDPOINT = "https://www.nytimes.com/svc/connections/v2";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date")?.trim();
  const date = requestedDate || todayInNewYork();
  const dateError = validatePuzzleDate(date);

  if (dateError) {
    return jsonResponse(
      { error: dateError },
      {
        status: 400,
        cache: "no-store",
      }
    );
  }

  try {
    const puzzle = await fetchConnectionsPuzzle(date);

    return jsonResponse(puzzle, {
      status: 200,
      cache: cacheHeaderFor(date),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load puzzle.";
    const status = message.includes("not found") ? 404 : 502;

    return jsonResponse(
      { error: message },
      {
        status,
        cache: "no-store",
      }
    );
  }
}

export async function fetchConnectionsPuzzle(
  date: string
): Promise<ConnectionsPuzzle> {
  const response = await fetch(`${NYT_ENDPOINT}/${date}.json`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "connections-info/0.1",
    },
  });

  if (response.status === 404) {
    throw new Error(`Connections puzzle not found for ${date}.`);
  }

  if (!response.ok) {
    throw new Error(`NYT returned ${response.status} for ${date}.`);
  }

  const data = (await response.json()) as unknown;
  return parseNytConnections(data, date);
}

export function parseNytConnections(
  data: unknown,
  fallbackDate: string
): ConnectionsPuzzle {
  if (!isRecord(data)) {
    throw new Error("NYT response was not an object.");
  }

  const response = data as NytConnectionsResponse;
  if (!Array.isArray(response.categories)) {
    throw new Error("NYT response did not include categories.");
  }

  if (response.categories.length !== CONNECTION_COLORS.length) {
    throw new Error(
      `Expected 4 puzzle categories, received ${response.categories.length}.`
    );
  }

  const categories = response.categories.map((category, categoryIndex) =>
    parseCategory(category, categoryIndex)
  );
  validateUniqueWordsAndPositions(categories);

  return {
    categories,
    date:
      typeof response.print_date === "string"
        ? response.print_date
        : fallbackDate,
    editor: typeof response.editor === "string" ? response.editor : null,
    id: typeof response.id === "number" ? response.id : null,
  };
}

function parseCategory(
  category: unknown,
  categoryIndex: number
): ConnectionsCategory {
  if (!isRecord(category)) {
    throw new Error(`Puzzle category ${categoryIndex + 1} was not an object.`);
  }

  const typedCategory = category as NytConnectionsCategory;
  if (typeof typedCategory.title !== "string" || !typedCategory.title.trim()) {
    throw new Error(`Puzzle category ${categoryIndex + 1} had no title.`);
  }

  if (!Array.isArray(typedCategory.cards) || typedCategory.cards.length !== 4) {
    const cardCount = Array.isArray(typedCategory.cards)
      ? typedCategory.cards.length
      : 0;
    throw new Error(
      `Expected 4 words in category ${categoryIndex + 1}, received ${cardCount}.`
    );
  }

  const words = typedCategory.cards.map((card, wordIndex) => {
    if (!isRecord(card)) {
      throw new Error(
        `Word ${wordIndex + 1} in category ${categoryIndex + 1} was invalid.`
      );
    }

    const typedCard = card as NytConnectionsCard;
    if (typeof typedCard.content !== "string" || !typedCard.content.trim()) {
      throw new Error(
        `Word ${wordIndex + 1} in category ${categoryIndex + 1} was empty.`
      );
    }

    if (
      typeof typedCard.position !== "number" ||
      !Number.isInteger(typedCard.position) ||
      typedCard.position < 0 ||
      typedCard.position > 15
    ) {
      throw new Error(
        `Puzzle word ${typedCard.content} had an invalid position.`
      );
    }

    return {
      position: typedCard.position,
      word: typedCard.content,
    };
  });

  return {
    color: CONNECTION_COLORS[categoryIndex],
    title: typedCategory.title,
    words,
  };
}

function validateUniqueWordsAndPositions(
  categories: ConnectionsCategory[]
): void {
  const words = categories.flatMap((category) => category.words);
  const normalizedWords = new Set(words.map(({ word }) => word.toUpperCase()));
  const positions = new Set(words.map(({ position }) => position));

  if (normalizedWords.size !== 16) {
    throw new Error("Puzzle words were not unique.");
  }

  if (positions.size !== 16) {
    throw new Error("Puzzle word positions were not unique.");
  }
}

function jsonResponse(
  body: unknown,
  options: {
    status: number;
    cache: string;
  }
): Response {
  return Response.json(body, {
    status: options.status,
    headers: {
      "Cache-Control": options.cache,
      "Vercel-CDN-Cache-Control": options.cache,
    },
  });
}

function cacheHeaderFor(date: string): string {
  if (date < todayInNewYork()) {
    return "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
  }

  return "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400";
}
