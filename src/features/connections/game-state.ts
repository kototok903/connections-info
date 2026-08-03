import type {
  ConnectionColor,
  ConnectionsCategory,
  ConnectionsPuzzle,
} from "#shared/types.js";

export type GameStatus = "playing" | "resolving" | "revealing" | "complete";

export type GameGuess = {
  positions: number[];
};

export type GameEvent = {
  id: number;
  oneAway?: boolean;
  positions?: number[];
  type: "none" | "duplicate" | "incorrect" | "correct";
};

export type ConnectionsGameState = {
  event: GameEvent;
  guesses: GameGuess[];
  mistakesRemaining: number | null;
  resolvingColor: ConnectionColor | null;
  selectedPositions: number[];
  solvedColors: ConnectionColor[];
  status: GameStatus;
  submittedGuessKeys: string[];
  wasRevealed: boolean;
  wordOrder: number[];
};

export type ConnectionsGameAction =
  | { type: "select"; position: number }
  | { type: "deselect-all" }
  | { type: "shuffle"; order: number[] }
  | { type: "submit"; puzzle: ConnectionsPuzzle }
  | { type: "finish-resolution"; puzzle: ConnectionsPuzzle }
  | { type: "reveal"; puzzle: ConnectionsPuzzle }
  | { type: "replay"; puzzle: ConnectionsPuzzle };

export function createConnectionsGameState(
  puzzle: ConnectionsPuzzle
): ConnectionsGameState {
  return {
    event: { id: 0, type: "none" },
    guesses: [],
    mistakesRemaining: 4,
    resolvingColor: null,
    selectedPositions: [],
    solvedColors: [],
    status: "playing",
    submittedGuessKeys: [],
    wasRevealed: false,
    wordOrder: puzzle.categories
      .flatMap((category) => category.words)
      .sort((left, right) => left.position - right.position)
      .map(({ position }) => position),
  };
}

export function connectionsGameReducer(
  state: ConnectionsGameState,
  action: ConnectionsGameAction
): ConnectionsGameState {
  switch (action.type) {
    case "select":
      return selectWord(state, action.position);
    case "deselect-all":
      return state.status === "playing"
        ? { ...state, selectedPositions: [] }
        : state;
    case "shuffle":
      return state.status === "playing"
        ? { ...state, selectedPositions: [], wordOrder: action.order }
        : state;
    case "submit":
      return submitGuess(state, action.puzzle);
    case "finish-resolution":
      return finishResolution(state, action.puzzle);
    case "reveal":
      return revealAnswers(state, action.puzzle);
    case "replay":
      return createConnectionsGameState(action.puzzle);
  }
}

export function shuffledWordOrder(
  positions: readonly number[],
  random: () => number = Math.random
): number[] {
  const shuffled = [...positions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [
      shuffled[otherIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function categoryForPosition(
  puzzle: ConnectionsPuzzle,
  position: number
): ConnectionsCategory | undefined {
  return puzzle.categories.find((category) =>
    category.words.some((word) => word.position === position)
  );
}

function selectWord(
  state: ConnectionsGameState,
  position: number
): ConnectionsGameState {
  if (state.status !== "playing" || !state.wordOrder.includes(position)) {
    return state;
  }

  if (state.selectedPositions.includes(position)) {
    return {
      ...state,
      selectedPositions: state.selectedPositions.filter(
        (selectedPosition) => selectedPosition !== position
      ),
    };
  }

  if (state.selectedPositions.length === 4) {
    return state;
  }

  return {
    ...state,
    selectedPositions: [...state.selectedPositions, position],
  };
}

function submitGuess(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle
): ConnectionsGameState {
  if (state.status !== "playing" || state.selectedPositions.length !== 4) {
    return state;
  }

  const guessKey = keyForGuess(state.selectedPositions);
  if (state.submittedGuessKeys.includes(guessKey)) {
    return {
      ...state,
      event: { id: state.event.id + 1, type: "duplicate" },
    };
  }

  const correctCategory = puzzle.categories.find((category) =>
    category.words.every(({ position }) =>
      state.selectedPositions.includes(position)
    )
  );
  const guesses = [
    ...state.guesses,
    { positions: [...state.selectedPositions] },
  ];
  const submittedGuessKeys = [...state.submittedGuessKeys, guessKey];

  if (correctCategory) {
    return beginResolution(
      {
        ...state,
        event: { id: state.event.id + 1, type: "correct" },
        guesses,
        submittedGuessKeys,
      },
      correctCategory,
      "resolving"
    );
  }

  const oneAway = puzzle.categories.some(
    (category) =>
      category.words.filter(({ position }) =>
        state.selectedPositions.includes(position)
      ).length === 3
  );

  return {
    ...state,
    event: {
      id: state.event.id + 1,
      oneAway,
      positions: [...state.selectedPositions],
      type: "incorrect",
    },
    guesses,
    mistakesRemaining:
      state.mistakesRemaining === null
        ? null
        : state.mistakesRemaining === 1
          ? null
          : state.mistakesRemaining - 1,
    submittedGuessKeys,
  };
}

function revealAnswers(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle
): ConnectionsGameState {
  if (state.status !== "playing" || state.mistakesRemaining !== null) {
    return state;
  }

  const nextCategory = nextUnsolvedCategory(puzzle, state.solvedColors);
  if (!nextCategory) {
    return { ...state, status: "complete", wasRevealed: true };
  }

  return beginResolution(
    {
      ...state,
      selectedPositions: [],
      wasRevealed: true,
    },
    nextCategory,
    "revealing"
  );
}

function beginResolution(
  state: ConnectionsGameState,
  category: ConnectionsCategory,
  status: "resolving" | "revealing"
): ConnectionsGameState {
  const categoryPositions = category.words.map(({ position }) => position);

  return {
    ...state,
    resolvingColor: category.color,
    selectedPositions: categoryPositions,
    status,
    wordOrder: [
      ...categoryPositions,
      ...state.wordOrder.filter(
        (position) => !categoryPositions.includes(position)
      ),
    ],
  };
}

function finishResolution(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle
): ConnectionsGameState {
  if (
    (state.status !== "resolving" && state.status !== "revealing") ||
    !state.resolvingColor
  ) {
    return state;
  }

  const resolvedCategory = puzzle.categories.find(
    ({ color }) => color === state.resolvingColor
  );
  if (!resolvedCategory) {
    return state;
  }

  const resolvedPositions = resolvedCategory.words.map(
    ({ position }) => position
  );
  const solvedColors = [...state.solvedColors, resolvedCategory.color];
  const nextState: ConnectionsGameState = {
    ...state,
    resolvingColor: null,
    selectedPositions: [],
    solvedColors,
    status:
      solvedColors.length === puzzle.categories.length ? "complete" : "playing",
    wordOrder: state.wordOrder.filter(
      (position) => !resolvedPositions.includes(position)
    ),
  };

  if (state.status !== "revealing" || nextState.status === "complete") {
    return nextState;
  }

  const nextCategory = nextUnsolvedCategory(puzzle, solvedColors);
  return nextCategory
    ? beginResolution(nextState, nextCategory, "revealing")
    : { ...nextState, status: "complete" };
}

function nextUnsolvedCategory(
  puzzle: ConnectionsPuzzle,
  solvedColors: ConnectionColor[]
): ConnectionsCategory | undefined {
  return puzzle.categories.find(
    (category) => !solvedColors.includes(category.color)
  );
}

function keyForGuess(positions: readonly number[]): string {
  return [...positions].sort((left, right) => left - right).join("-");
}
