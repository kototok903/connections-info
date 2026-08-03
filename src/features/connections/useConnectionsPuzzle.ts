import { useEffect, useState } from "react";

import { loadConnectionsPuzzle } from "@/features/connections/connections-api";
import type { ConnectionsPuzzle } from "#shared/types.js";

type RequestState = {
  date: string | null;
  error: string | null;
  puzzle: ConnectionsPuzzle | null;
};

export type ConnectionsPuzzleState =
  | { status: "loading"; puzzle: null; error: null }
  | { status: "success"; puzzle: ConnectionsPuzzle; error: null }
  | { status: "error"; puzzle: null; error: string };

export function useConnectionsPuzzle(date: string): ConnectionsPuzzleState {
  const [request, setRequest] = useState<RequestState>({
    date: null,
    error: null,
    puzzle: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void loadConnectionsPuzzle(date, controller.signal)
      .then((puzzle) => {
        if (active) {
          setRequest({ date, error: null, puzzle });
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) {
          return;
        }

        setRequest({
          date,
          error:
            error instanceof Error ? error.message : "Failed to load puzzle.",
          puzzle: null,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [date]);

  if (request.date !== date) {
    return { status: "loading", puzzle: null, error: null };
  }

  if (request.error) {
    return { status: "error", puzzle: null, error: request.error };
  }

  if (request.puzzle) {
    return { status: "success", puzzle: request.puzzle, error: null };
  }

  return { status: "loading", puzzle: null, error: null };
}
