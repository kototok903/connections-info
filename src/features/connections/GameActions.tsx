import { Button } from "@/components/ui/button";
import {
  type ConnectionsGameState,
  selectedStashIndex,
} from "@/features/connections/game-state";

type GameActionsProps = {
  game: ConnectionsGameState;
  onDeselectAll: () => void;
  onOpenResults: () => void;
  onReplay: () => void;
  onReveal: () => void;
  onShuffle: () => void;
  onStash: () => void;
  onSubmit: () => void;
  showStash: boolean;
};

export function GameActions({
  game,
  onDeselectAll,
  onOpenResults,
  onReplay,
  onReveal,
  onShuffle,
  onStash,
  onSubmit,
  showStash,
}: GameActionsProps) {
  return (
    <section
      aria-label="Game controls"
      className="flex flex-col items-center gap-2"
    >
      <MistakesIndicator mistakesRemaining={game.mistakesRemaining} />

      {game.status === "complete" ? (
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" size="lg" variant="outline" onClick={onReplay}>
            Replay
          </Button>
          <Button type="button" size="lg" onClick={onOpenResults}>
            Results
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={game.status !== "playing"}
            onClick={onShuffle}
          >
            Shuffle
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={
              game.status !== "playing" || game.selectedPositions.length === 0
            }
            onClick={onDeselectAll}
          >
            Deselect All
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={
              game.status !== "playing" || game.selectedPositions.length !== 4
            }
            onClick={onSubmit}
          >
            Submit
          </Button>
          {showStash ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={
                game.status !== "playing" || game.selectedPositions.length !== 4
              }
              onClick={onStash}
            >
              {selectedStashIndex(game) === -1 ? "Stash" : "Unstash"}
            </Button>
          ) : null}
          {game.mistakesRemaining === null ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={game.status !== "playing"}
              onClick={onReveal}
            >
              Reveal Answers
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function MistakesIndicator({
  mistakesRemaining,
}: {
  mistakesRemaining: number | null;
}) {
  const accessibleValue =
    mistakesRemaining === null ? "unlimited" : mistakesRemaining;

  return (
    <div
      role="status"
      aria-label={`Mistakes remaining: ${accessibleValue}`}
      className="flex min-h-5 items-center justify-center gap-1.5 text-sm"
    >
      <span aria-hidden="true">Mistakes remaining:</span>
      {mistakesRemaining === null ? (
        <span aria-hidden="true" className="text-xl leading-none">
          ∞
        </span>
      ) : (
        <span aria-hidden="true" className="flex gap-1.5">
          {Array.from({ length: mistakesRemaining }, (_, index) => (
            <span key={index} className="size-2.5 rounded-full bg-foreground" />
          ))}
        </span>
      )}
    </div>
  );
}
