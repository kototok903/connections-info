import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORY_BACKGROUND_CLASSES } from "@/features/connections/category-colors";
import {
  categoryForPosition,
  type GameGuess,
} from "@/features/connections/game-state";
import {
  resultsShareText,
  shareResultsText,
} from "@/features/connections/results-share";
import { cn } from "@/lib/utils";
import type { ConnectionsPuzzle } from "#shared/types.js";

type ResultsDialogProps = {
  guesses: GameGuess[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  puzzle: ConnectionsPuzzle;
};

export function ResultsDialog({
  guesses,
  onOpenChange,
  open,
  puzzle,
}: ResultsDialogProps) {
  const wordsByPosition = new Map(
    puzzle.categories
      .flatMap((category) => category.words)
      .map((word) => [word.position, word.word] as const)
  );

  async function shareResults() {
    try {
      const result = await shareResultsText(resultsShareText(puzzle, guesses));

      if (result === "copied") {
        toast.success("Results copied");
      }
    } catch {
      toast.error("Could not share results");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Results</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-3">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} className="grid grid-cols-4 gap-2">
              {guess.positions.map((position) => {
                const category = categoryForPosition(puzzle, position);
                if (!category) {
                  return null;
                }

                return (
                  <span
                    key={position}
                    role="img"
                    aria-label={`${wordsByPosition.get(position) ?? "Word"}: ${category.color}`}
                    className={cn(
                      "size-11 rounded-md sm:size-12",
                      CATEGORY_BACKGROUND_CLASSES[category.color]
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button className="self-end" onClick={shareResults}>
            <Share2Icon data-icon="inline-start" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
