import { useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

import {
  connectionsGameReducer,
  createConnectionsGameState,
  shuffledWordOrder,
} from "@/features/connections/game-state";
import { GameActions } from "@/features/connections/GameActions";
import { ResearchLinks } from "@/features/connections/ResearchLinks";
import { ResultsDialog } from "@/features/connections/ResultsDialog";
import { WordGrid } from "@/features/connections/WordGrid";
import type { ConnectionsPuzzle, LinkSourceId } from "#shared/types.js";

type ConnectionsGameProps = {
  enabledSourceIds: ReadonlySet<LinkSourceId>;
  puzzle: ConnectionsPuzzle;
};

const RESOLUTION_DELAY_MS = 520;
const RESULTS_DELAY_MS = 380;
const SHAKE_DURATION_MS = 450;

export function ConnectionsGame({
  enabledSourceIds,
  puzzle,
}: ConnectionsGameProps) {
  const [game, dispatch] = useReducer(
    connectionsGameReducer,
    puzzle,
    createConnectionsGameState
  );
  const [resultsOpen, setResultsOpen] = useState(false);
  const [shake, setShake] = useState<{
    id: number;
    positions: number[];
  } | null>(null);
  const wordsByPosition = useMemo(
    () =>
      new Map(
        puzzle.categories
          .flatMap((category) => category.words)
          .map((word) => [word.position, word.word] as const)
      ),
    [puzzle]
  );

  useEffect(() => {
    if (
      (game.status !== "resolving" && game.status !== "revealing") ||
      !game.resolvingColor
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: "finish-resolution", puzzle });
    }, RESOLUTION_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [game.resolvingColor, game.status, puzzle]);

  useEffect(() => {
    if (game.status !== "complete") {
      return;
    }

    const timeout = window.setTimeout(
      () => setResultsOpen(true),
      RESULTS_DELAY_MS
    );
    return () => window.clearTimeout(timeout);
  }, [game.status]);

  useEffect(() => {
    if (game.event.type === "duplicate") {
      toast("Already guessed");
    } else if (game.event.type === "incorrect" && game.event.oneAway) {
      toast("One Away");
    }
  }, [game.event]);

  useEffect(() => {
    if (game.event.type !== "incorrect" || !game.event.positions) {
      return;
    }

    setShake({ id: game.event.id, positions: game.event.positions });
    const timeout = window.setTimeout(() => setShake(null), SHAKE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [game.event]);

  const selectedWord =
    game.selectedPositions.length === 1
      ? (wordsByPosition.get(game.selectedPositions[0]) ?? null)
      : null;

  function replay() {
    setResultsOpen(false);
    dispatch({ type: "replay", puzzle });
  }

  return (
    <div className="flex flex-col gap-4">
      <WordGrid
        game={game}
        shake={shake}
        puzzle={puzzle}
        onSelect={(position) => dispatch({ type: "select", position })}
      />

      <GameActions
        game={game}
        onShuffle={() =>
          dispatch({
            type: "shuffle",
            order: shuffledWordOrder(game.wordOrder),
          })
        }
        onDeselectAll={() => dispatch({ type: "deselect-all" })}
        onSubmit={() => dispatch({ type: "submit", puzzle })}
        onReveal={() => dispatch({ type: "reveal", puzzle })}
        onReplay={replay}
        onOpenResults={() => setResultsOpen(true)}
      />

      <ResearchLinks word={selectedWord} enabledSourceIds={enabledSourceIds} />

      <ResultsDialog
        open={resultsOpen}
        guesses={game.guesses}
        puzzle={puzzle}
        onOpenChange={setResultsOpen}
      />
    </div>
  );
}
