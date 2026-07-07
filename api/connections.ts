import { todayInNewYork, validatePuzzleDate } from "#shared/date.js";
import type { ConnectionsPuzzle } from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

type NytConnectionsCard = {
  content?: unknown;
  position?: unknown;
};

type NytConnectionsCategory = {
  cards?: unknown;
};

type NytConnectionsResponse = {
  print_date?: unknown;
  categories?: unknown;
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
      },
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
      },
    );
  }
}

export async function fetchConnectionsPuzzle(
  date: string,
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
  fallbackDate: string,
): ConnectionsPuzzle {
  if (!isRecord(data)) {
    throw new Error("NYT response was not an object.");
  }

  const response = data as NytConnectionsResponse;
  if (!Array.isArray(response.categories)) {
    throw new Error("NYT response did not include categories.");
  }

  const cards = response.categories.flatMap((category) => {
    if (!isRecord(category)) {
      return [];
    }

    const typedCategory = category as NytConnectionsCategory;
    if (!Array.isArray(typedCategory.cards)) {
      return [];
    }

    return typedCategory.cards
      .filter(isRecord)
      .map((card): { word: string; position: number } | null => {
        const typedCard = card as NytConnectionsCard;
        if (typeof typedCard.content !== "string") {
          return null;
        }

        return {
          word: typedCard.content,
          position:
            typeof typedCard.position === "number"
              ? typedCard.position
              : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter(
        (card): card is { word: string; position: number } => card !== null,
      );
  });

  if (cards.length !== 16) {
    throw new Error(`Expected 16 puzzle words, received ${cards.length}.`);
  }

  return {
    date:
      typeof response.print_date === "string"
        ? response.print_date
        : fallbackDate,
    words: cards
      .slice()
      .sort((left, right) => left.position - right.position)
      .map((card) => card.word),
  };
}

function jsonResponse(
  body: unknown,
  options: {
    status: number;
    cache: string;
  },
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
