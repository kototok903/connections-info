import { Button } from "@/components/ui/button";
import type { ConnectionsGameState } from "@/features/connections/game-state";

type GameActionsProps = {
  game: ConnectionsGameState;
  onDeselectAll: () => void;
  onOpenResults: () => void;
  onReplay: () => void;
  onReveal: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
};

export function GameActions({
  game,
  onDeselectAll,
  onOpenResults,
  onReplay,
  onReveal,
  onShuffle,
  onSubmit,
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
