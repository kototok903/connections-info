import {
  categoryForPosition,
  type GameGuess,
} from "@/features/connections/game-state";
import { connectionsPuzzleNumber } from "#shared/date.js";
import type { ConnectionColor, ConnectionsPuzzle } from "#shared/types.js";

const CATEGORY_EMOJI: Record<ConnectionColor, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

type ShareNavigator = Pick<Navigator, "clipboard"> &
  Partial<Pick<Navigator, "maxTouchPoints" | "share" | "userAgent">> & {
    userAgentData?: { mobile: boolean };
  };

export function resultsShareText(
  puzzle: ConnectionsPuzzle,
  guesses: readonly GameGuess[]
): string {
  const puzzleNumber = connectionsPuzzleNumber(puzzle.date);
  if (puzzleNumber === null) {
    throw new Error(`Invalid Connections puzzle date: ${puzzle.date}`);
  }

  const rows = guesses.map((guess) =>
    guess.positions
      .map((position) => categoryForPosition(puzzle, position))
      .filter((category) => category !== undefined)
      .map((category) => CATEGORY_EMOJI[category.color])
      .join("")
  );

  return ["Connections", `Puzzle #${puzzleNumber}`, ...rows].join("\n");
}

export async function shareResultsText(
  text: string,
  shareNavigator: ShareNavigator = navigator
): Promise<"copied" | "shared" | "cancelled"> {
  if (shareNavigator.share && isMobileDevice(shareNavigator)) {
    try {
      await shareNavigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await shareNavigator.clipboard.writeText(text);
  return "copied";
}

function isMobileDevice(shareNavigator: ShareNavigator): boolean {
  if (shareNavigator.userAgentData?.mobile !== undefined) {
    return shareNavigator.userAgentData.mobile;
  }

  const userAgent = shareNavigator.userAgent ?? "";
  return (
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && (shareNavigator.maxTouchPoints ?? 0) > 1)
  );
}
