import type { ConnectionsPuzzle } from "./types";

export async function loadConnectionsPuzzle(
  date: string,
): Promise<ConnectionsPuzzle> {
  const url = new URL("/api/connections", window.location.origin);
  url.searchParams.set("date", date);

  const response = await fetch(url);
  const data = (await response.json()) as unknown;

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
