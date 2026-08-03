import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { CATEGORY_BACKGROUND_CLASSES } from "@/features/connections/category-colors";
import type { ConnectionsGameState } from "@/features/connections/game-state";
import { WordCard } from "@/features/connections/WordCard";
import { cn } from "@/lib/utils";
import type { ConnectionsPuzzle } from "#shared/types.js";

type WordGridProps = {
  game: ConnectionsGameState;
  onSelect: (position: number) => void;
  puzzle: ConnectionsPuzzle;
  shake: { id: number; positions: number[] } | null;
};

export function WordGrid({ game, onSelect, puzzle, shake }: WordGridProps) {
  const wordsByPosition = new Map(
    puzzle.categories
      .flatMap((category) => category.words)
      .map((word) => [word.position, word] as const)
  );

  return (
    <LayoutGroup id={`puzzle-${puzzle.id ?? puzzle.date}`}>
      <motion.section
        layout
        aria-label="Puzzle words"
        className="mx-auto grid w-full max-w-148 grid-cols-4 gap-1.5"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {game.solvedColors.map((color) => {
            const category = puzzle.categories.find(
              (candidate) => candidate.color === color
            );
            if (!category) {
              return null;
            }

            return (
              <motion.article
                layout
                key={category.color}
                initial={{ opacity: 0, scaleY: 0.65 }}
                animate={{ opacity: 1, scaleY: 1 }}
                className={cn(
                  "col-span-4 flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center sm:min-h-24 sm:gap-2 sm:px-4",
                  CATEGORY_BACKGROUND_CLASSES[category.color]
                )}
              >
                <h2 className="text-sm leading-tight font-bold uppercase sm:text-base">
                  {category.title}
                </h2>
                <p className="text-xs leading-tight uppercase sm:text-sm">
                  {category.words.map(({ word }) => word).join(", ")}
                </p>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {game.wordOrder.map((position) => {
          const word = wordsByPosition.get(position);
          if (!word) {
            return null;
          }

          const selected = game.selectedPositions.includes(position);
          return (
            <WordCard
              key={position}
              word={word.word}
              selected={selected}
              disabled={game.status !== "playing"}
              shakeId={shake?.positions.includes(position) ? shake.id : null}
              onSelect={() => onSelect(position)}
            />
          );
        })}
      </motion.section>
    </LayoutGroup>
  );
}
