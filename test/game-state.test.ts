import { describe, expect, it } from "vitest";

import {
  connectionsGameReducer,
  type ConnectionsGameState,
  createConnectionsGameState,
  displayWordOrder,
  selectedStashIndex,
  shuffledWordOrder,
} from "@/features/connections/game-state";
import type { ConnectionsPuzzle } from "#shared/types.js";

const puzzle: ConnectionsPuzzle = {
  categories: [
    category("yellow", "First", 0),
    category("green", "Second", 4),
    category("blue", "Third", 8),
    category("purple", "Fourth", 12),
  ],
  date: "2026-07-07",
  editor: "Test Editor",
  id: 1001,
};

describe("connectionsGameReducer", () => {
  it("selects at most four remaining words and toggles selections", () => {
    let state = createConnectionsGameState(puzzle);

    for (const position of [0, 1, 2, 3, 4]) {
      state = connectionsGameReducer(state, { type: "select", position });
    }
    expect(state.selectedPositions).toEqual([0, 1, 2, 3]);

    state = connectionsGameReducer(state, { type: "select", position: 2 });
    expect(state.selectedPositions).toEqual([0, 1, 3]);
  });

  it("keeps selections and guesses in board order, not click order", () => {
    let state = select(createConnectionsGameState(puzzle), [9, 2, 14, 0]);
    expect(state.selectedPositions).toEqual([0, 2, 9, 14]);

    state = connectionsGameReducer(state, { type: "submit", puzzle });
    expect(state.guesses).toEqual([{ positions: [0, 2, 9, 14] }]);
  });

  it("records a correct group but leaves the final group for the user", () => {
    let state = solveCategory(createConnectionsGameState(puzzle), [0, 1, 2, 3]);
    state = solveCategory(state, [4, 5, 6, 7]);
    state = solveCategory(state, [8, 9, 10, 11]);

    expect(state.status).toBe("playing");
    expect(state.wordOrder).toEqual([12, 13, 14, 15]);
    expect(state.solvedColors).toEqual(["yellow", "green", "blue"]);

    state = selectAndSubmit(state, [12, 13, 14, 15]);
    expect(state.status).toBe("resolving");
    state = connectionsGameReducer(state, {
      type: "finish-resolution",
      puzzle,
    });
    expect(state.status).toBe("complete");
  });

  it("detects one-away guesses and enters unlimited mode after four mistakes", () => {
    let state = createConnectionsGameState(puzzle);
    const guesses = [
      [0, 1, 2, 4],
      [0, 1, 4, 5],
      [0, 4, 8, 12],
      [1, 5, 9, 13],
    ];

    state = selectAndSubmit(state, guesses[0]);
    expect(state.event).toMatchObject({ type: "incorrect", oneAway: true });
    expect(state.event.positions).toEqual(guesses[0]);
    expect(state.mistakesRemaining).toBe(3);

    for (const guess of guesses.slice(1)) {
      state = connectionsGameReducer(state, { type: "deselect-all" });
      state = selectAndSubmit(state, guess);
    }

    expect(state.mistakesRemaining).toBeNull();
    expect(state.status).toBe("playing");

    state = connectionsGameReducer(state, { type: "deselect-all" });
    state = selectAndSubmit(state, [2, 6, 10, 14]);
    expect(state.guesses).toHaveLength(5);
    expect(state.mistakesRemaining).toBeNull();
  });

  it("does not record or penalize a duplicate guess", () => {
    let state = selectAndSubmit(
      createConnectionsGameState(puzzle),
      [0, 1, 4, 5]
    );
    const mistakes = state.mistakesRemaining;

    state = connectionsGameReducer(state, { type: "submit", puzzle });

    expect(state.event.type).toBe("duplicate");
    expect(state.mistakesRemaining).toBe(mistakes);
    expect(state.guesses).toHaveLength(1);
  });

  it("preserves one-away feedback for a duplicate guess", () => {
    let state = selectAndSubmit(
      createConnectionsGameState(puzzle),
      [0, 1, 2, 4]
    );

    state = connectionsGameReducer(state, { type: "submit", puzzle });

    expect(state.event).toMatchObject({ type: "duplicate", oneAway: true });
  });

  it("reveals every unsolved category without adding user guesses", () => {
    let state = createConnectionsGameState(puzzle);
    state = { ...state, mistakesRemaining: null };
    state = connectionsGameReducer(state, { type: "reveal", puzzle });

    expect(state.status).toBe("revealing");
    for (let index = 0; index < 4; index += 1) {
      state = connectionsGameReducer(state, {
        type: "finish-resolution",
        puzzle,
      });
    }

    expect(state.status).toBe("complete");
    expect(state.solvedColors).toEqual(["yellow", "green", "blue", "purple"]);
    expect(state.guesses).toEqual([]);
    expect(state.wasRevealed).toBe(true);
  });

  it("stashes selected words to the bottom of the board in board order", () => {
    let state = select(createConnectionsGameState(puzzle), [12, 1, 6, 3]);
    state = connectionsGameReducer(state, { type: "stash" });

    expect(state.stashedGroups).toEqual([[1, 3, 6, 12]]);
    expect(state.selectedPositions).toEqual([]);
    expect(state.guesses).toEqual([]);
    expect(state.mistakesRemaining).toBe(4);
    expect(displayWordOrder(state).slice(-4)).toEqual([1, 3, 6, 12]);
    expect(displayWordOrder(state, false)).toEqual(state.wordOrder);
  });

  it("unstashes overlapping groups when stashing a new group", () => {
    let state = stash(createConnectionsGameState(puzzle), [0, 1, 2, 3]);
    state = stash(state, [4, 5, 6, 7]);
    state = stash(state, [8, 9, 10, 0]);

    expect(state.stashedGroups).toEqual([
      [4, 5, 6, 7],
      [8, 9, 10, 0],
    ]);
  });

  it("unstashes a group when exactly that group is selected", () => {
    let state = stash(createConnectionsGameState(puzzle), [0, 1, 2, 3]);
    state = select(state, [3, 2, 1, 0]);
    expect(selectedStashIndex(state)).toBe(0);

    state = connectionsGameReducer(state, { type: "stash" });

    expect(state.stashedGroups).toEqual([]);
    expect(state.selectedPositions).toEqual([]);
  });

  it("drops a stashed group once its words are solved", () => {
    let state = stash(createConnectionsGameState(puzzle), [0, 1, 2, 3]);
    state = stash(state, [4, 5, 6, 8]);
    state = selectAndSubmit(state, [0, 1, 2, 3]);

    expect(state.stashedGroups).toEqual([[4, 5, 6, 8]]);
  });

  it("shuffles without mutating the supplied order", () => {
    const positions = [0, 1, 2, 3];
    const shuffled = shuffledWordOrder(positions, () => 0);

    expect(positions).toEqual([0, 1, 2, 3]);
    expect(shuffled).toEqual([1, 2, 3, 0]);
  });
});

function category(
  color: "yellow" | "green" | "blue" | "purple",
  title: string,
  startPosition: number
) {
  return {
    color,
    title,
    words: Array.from({ length: 4 }, (_, index) => ({
      position: startPosition + index,
      word: `WORD ${startPosition + index}`,
    })),
  };
}

function selectAndSubmit(
  initialState: ReturnType<typeof createConnectionsGameState>,
  positions: number[]
) {
  let state = initialState;
  for (const position of positions) {
    state = connectionsGameReducer(state, { type: "select", position });
  }
  return connectionsGameReducer(state, { type: "submit", puzzle });
}

function solveCategory(
  initialState: ReturnType<typeof createConnectionsGameState>,
  positions: number[]
) {
  const state = selectAndSubmit(initialState, positions);
  return connectionsGameReducer(state, {
    type: "finish-resolution",
    puzzle,
  });
}

function select(state: ConnectionsGameState, positions: number[]) {
  return positions.reduce(
    (current, position) =>
      connectionsGameReducer(current, { type: "select", position }),
    state
  );
}

function stash(state: ConnectionsGameState, positions: number[]) {
  return connectionsGameReducer(select(state, positions), { type: "stash" });
}
