import { ClockArrowDownIcon, ClockArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORY_TEXT_CLASSES } from "@/features/connections/category-colors";
import type { GameGuess } from "@/features/connections/game-state";
import type { PastGuessesOrder } from "@/features/settings/settings-store";
import { cn } from "@/lib/utils";
import type { ConnectionColor, ConnectionsPuzzle } from "#shared/types.js";

type PastGuessesProps = {
  guesses: GameGuess[];
  onOrderChange: (order: PastGuessesOrder) => void;
  order: PastGuessesOrder;
  puzzle: ConnectionsPuzzle;
};

type GuessOutcome =
  | { label: "Incorrect" | "One Away"; color: null }
  | { label: Capitalize<ConnectionColor>; color: ConnectionColor };

export function PastGuesses({
  guesses,
  onOrderChange,
  order,
  puzzle,
}: PastGuessesProps) {
  if (guesses.length === 0) {
    return null;
  }

  const wordsByPosition = new Map(
    puzzle.categories
      .flatMap((category) => category.words)
      .map(({ position, word }) => [position, word] as const)
  );
  const isNewestFirst = order === "newest-first";
  const orderedGuesses = isNewestFirst ? guesses.toReversed() : guesses;
  const toggleLabel = isNewestFirst ? "Show oldest first" : "Show newest first";

  return (
    <section
      aria-labelledby="past-guesses-heading"
      className="mt-2 flex max-w-148 flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="past-guesses-heading" className="text-sm font-semibold">
          Past Guesses
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() =>
            onOrderChange(isNewestFirst ? "oldest-first" : "newest-first")
          }
        >
          {isNewestFirst ? <ClockArrowDownIcon /> : <ClockArrowUpIcon />}
        </Button>
      </div>
      <ol className="flex flex-col gap-1 text-sm">
        {orderedGuesses.map((guess) => {
          const outcome = outcomeForGuess(guess, puzzle);
          const words = guess.positions
            .map((position) => wordsByPosition.get(position))
            .filter((word): word is string => Boolean(word));

          return (
            <li key={[...guess.positions].sort((a, b) => a - b).join("-")}>
              {words.join(", ")} -&gt;{" "}
              <span
                className={cn(
                  "font-semibold",
                  outcome.color &&
                    "[text-shadow:0.5px_0.5px_0_#000] dark:[text-shadow:none]",
                  outcome.color && CATEGORY_TEXT_CLASSES[outcome.color]
                )}
              >
                {outcome.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function outcomeForGuess(
  guess: GameGuess,
  puzzle: ConnectionsPuzzle
): GuessOutcome {
  const correctCategory = puzzle.categories.find((category) =>
    category.words.every(({ position }) => guess.positions.includes(position))
  );

  if (correctCategory) {
    return {
      color: correctCategory.color,
      label: capitalize(correctCategory.color),
    };
  }

  const oneAway = puzzle.categories.some(
    (category) =>
      category.words.filter(({ position }) =>
        guess.positions.includes(position)
      ).length === 3
  );

  return { color: null, label: oneAway ? "One Away" : "Incorrect" };
}

function capitalize<T extends string>(value: T): Capitalize<T> {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as Capitalize<T>;
}
