import { loadConnectionsPuzzle } from "./api";
import { todayInNewYork } from "./date";
import { linksForWord } from "./links";
import type { ConnectionsPuzzle } from "./types";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app element.");
}

app.innerHTML = `
  <section class="shell" aria-labelledby="page-title">
    <header class="masthead">
      <div>
        <p class="kicker">Connections research helper</p>
        <h1 id="page-title">Connections Info</h1>
      </div>
      <form class="date-form" id="date-form">
        <label for="puzzle-date">Puzzle date</label>
        <div class="date-controls">
          <input id="puzzle-date" name="date" type="date" required />
          <button type="submit">Load</button>
        </div>
      </form>
    </header>

    <div id="status" class="status" role="status" aria-live="polite"></div>
    <section id="word-grid" class="word-grid" aria-label="Puzzle words"></section>
  </section>
`;

const form = document.querySelector<HTMLFormElement>("#date-form");
const dateInput = document.querySelector<HTMLInputElement>("#puzzle-date");
const statusElement = document.querySelector<HTMLDivElement>("#status");
const wordGrid = document.querySelector<HTMLElement>("#word-grid");

if (!form || !dateInput || !statusElement || !wordGrid) {
  throw new Error("App markup did not initialize.");
}

const elements = {
  dateInput,
  status: statusElement,
  wordGrid,
};

dateInput.value = todayInNewYork();
form.addEventListener("submit", (event) => {
  event.preventDefault();
  void loadPuzzle(elements.dateInput.value);
});

void loadPuzzle(elements.dateInput.value);

async function loadPuzzle(date: string): Promise<void> {
  setStatus("Loading puzzle words...");
  elements.wordGrid.replaceChildren();

  try {
    const puzzle = await loadConnectionsPuzzle(date);
    renderPuzzle(puzzle);
    setStatus(`Loaded ${puzzle.words.length} words for ${puzzle.date}.`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load puzzle.";
    setStatus(message, true);
  }
}

function renderPuzzle(puzzle: ConnectionsPuzzle): void {
  const fragment = document.createDocumentFragment();

  for (const word of puzzle.words) {
    const card = document.createElement("article");
    card.className = "word-card";

    const title = document.createElement("h2");
    title.textContent = word;

    const links = document.createElement("div");
    links.className = "links";

    for (const link of linksForWord(word)) {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      const url = getFavicon(link.href);
      const favicon = document.createElement("img");
      favicon.src = url;
      favicon.alt = "";
      favicon.width = 16;
      favicon.height = 16;
      favicon.loading = "lazy";
      favicon.decoding = "async";
      favicon.addEventListener("error", () => favicon.remove());

      anchor.append(favicon, document.createTextNode(link.label));
      links.append(anchor);
    }

    card.append(title, links);
    fragment.append(card);
  }

  elements.wordGrid.replaceChildren(fragment);
}

function setStatus(message: string, isError = false): void {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function getFavicon(domain: string, size: number = 64): string {
  const urlObj = new URL(domain);
  const cleanDomain = urlObj.hostname;
  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
}
