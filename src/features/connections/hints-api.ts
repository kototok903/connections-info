import { CONNECTION_COLORS, type ConnectionsHints } from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

const HINTS_API_SCHEMA_VERSION = "1";

export async function loadConnectionsHints(
  date: string,
  signal?: AbortSignal
): Promise<ConnectionsHints> {
  const url = new URL("/api/hints", window.location.origin);
  url.searchParams.set("date", date);
  url.searchParams.set("schema", HINTS_API_SCHEMA_VERSION);

  const response = await fetch(url, { signal });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string"
        ? data.error
        : "Failed to load hints.";
    throw new Error(message);
  }

  if (!isConnectionsHints(data)) {
    throw new Error("The hints response was not in the expected format.");
  }

  return data;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    const preview = text.trim().slice(0, 160) || response.statusText;
    throw new Error(`Hints API returned ${response.status}: ${preview}`);
  }
}

function isConnectionsHints(value: unknown): value is ConnectionsHints {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    typeof value.companionUrl === "string" &&
    typeof value.mashableUrl === "string" &&
    Array.isArray(value.hints) &&
    value.hints.length === CONNECTION_COLORS.length &&
    value.hints.every(
      (hint, index) =>
        isRecord(hint) &&
        hint.color === CONNECTION_COLORS[index] &&
        typeof hint.text === "string" &&
        Boolean(hint.text.trim())
    )
  );
}
