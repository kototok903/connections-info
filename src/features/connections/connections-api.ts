import { CONNECTION_COLORS, type ConnectionsPuzzle } from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

const CONNECTIONS_API_SCHEMA_VERSION = "2";

export async function loadConnectionsPuzzle(
  date: string,
  signal?: AbortSignal
): Promise<ConnectionsPuzzle> {
  const url = new URL("/api/connections", window.location.origin);
  url.searchParams.set("date", date);
  url.searchParams.set("schema", CONNECTIONS_API_SCHEMA_VERSION);

  const response = await fetch(url, { signal });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string"
        ? data.error
        : "Failed to load puzzle.";
    throw new Error(message);
  }

  if (!isConnectionsPuzzle(data)) {
    throw new Error("The puzzle response was not in the expected format.");
  }

  return data;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    const preview = text.trim().slice(0, 160) || response.statusText;
    throw new Error(`API returned ${response.status}: ${preview}`);
  }
}

function isConnectionsPuzzle(value: unknown): value is ConnectionsPuzzle {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    (typeof value.id === "number" || value.id === null) &&
    (typeof value.editor === "string" || value.editor === null) &&
    Array.isArray(value.categories) &&
    value.categories.length === CONNECTION_COLORS.length &&
    value.categories.every((category, categoryIndex) => {
      if (!isRecord(category)) {
        return false;
      }

      return (
        category.color === CONNECTION_COLORS[categoryIndex] &&
        typeof category.title === "string" &&
        Array.isArray(category.words) &&
        category.words.length === 4 &&
        category.words.every(
          (word) =>
            isRecord(word) &&
            typeof word.word === "string" &&
            typeof word.position === "number"
        )
      );
    })
  );
}
