import type { ConnectionsPuzzle } from "./types";

export async function loadConnectionsPuzzle(
  date: string,
): Promise<ConnectionsPuzzle> {
  const url = new URL("/api/connections", window.location.origin);
  url.searchParams.set("date", date);

  const response = await fetch(url);
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
    Array.isArray(value.words) &&
    value.words.every((word) => typeof word === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
