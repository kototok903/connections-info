import { WordCard } from "@/features/connections/WordCard";
import type { ConnectionsPuzzle, LinkSourceId } from "#shared/types.js";

type WordGridProps = {
  enabledSourceIds: ReadonlySet<LinkSourceId>;
  puzzle: ConnectionsPuzzle;
};

export function WordGrid({ enabledSourceIds, puzzle }: WordGridProps) {
  return (
    <section
      aria-label="Puzzle words"
      className="grid grid-cols-1 gap-2.5 min-[460px]:grid-cols-2 md:grid-cols-4"
    >
      {puzzle.words.map((word, index) => (
        <WordCard
          key={`${index}-${word}`}
          word={word}
          enabledSourceIds={enabledSourceIds}
        />
      ))}
    </section>
  );
}
