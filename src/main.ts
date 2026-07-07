import "#src/styles.css";

import {
  formatDate,
  todayInLocalTimezone,
  validatePuzzleDate,
} from "#shared/date.js";
import type { ConnectionsPuzzle, LinkSourceId } from "#shared/types.js";
import { loadConnectionsPuzzle } from "#src/api";
import { LINK_SOURCES, linksForWord } from "#src/links";
import {
  type AppSettings,
  enabledSourceCount,
  enabledSourceIds,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
} from "#src/settings";

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
          <button
            type="button"
            class="icon-button"
            id="settings-button"
            aria-label="Open settings"
          >
            <span aria-hidden="true">Settings</span>
          </button>
        </div>
      </form>
    </header>

    <div id="status" class="status" role="status" aria-live="polite"></div>
    <section id="word-grid" class="word-grid" aria-label="Puzzle words"></section>

    <dialog class="settings-dialog" id="settings-dialog" aria-labelledby="settings-title">
      <form method="dialog" class="settings-panel">
        <header class="settings-header">
          <h2 id="settings-title">Settings</h2>
          <button type="submit" class="icon-button close-button" aria-label="Close settings">
            <span aria-hidden="true">Close</span>
          </button>
        </header>
        <div class="settings-list" id="settings-list"></div>
        <footer class="settings-footer">
          <a
            href="https://github.com/kototok903/connections-info"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </footer>
      </form>
    </dialog>
  </section>
`;

const form = document.querySelector<HTMLFormElement>("#date-form");
const dateInput = document.querySelector<HTMLInputElement>("#puzzle-date");
const statusElement = document.querySelector<HTMLDivElement>("#status");
const wordGrid = document.querySelector<HTMLElement>("#word-grid");
const settingsButton =
  document.querySelector<HTMLButtonElement>("#settings-button");
const settingsDialog =
  document.querySelector<HTMLDialogElement>("#settings-dialog");
const settingsList = document.querySelector<HTMLDivElement>("#settings-list");

if (
  !form ||
  !dateInput ||
  !statusElement ||
  !wordGrid ||
  !settingsButton ||
  !settingsDialog ||
  !settingsList
) {
  throw new Error("App markup did not initialize.");
}

const elements = {
  dateInput,
  status: statusElement,
  wordGrid,
  settingsButton,
  settingsDialog,
  settingsList,
};

let currentPuzzle: ConnectionsPuzzle | null = null;
let settings = loadSettings();

renderSettings(settings);
dateInput.value = dateFromUrl() ?? todayInLocalTimezone();
syncUrlDate(dateInput.value, "replace");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  syncUrlDate(elements.dateInput.value, "push");
  void loadPuzzle(elements.dateInput.value);
});

window.addEventListener("popstate", () => {
  const date = dateFromUrl() ?? todayInLocalTimezone();
  elements.dateInput.value = date;
  void loadPuzzle(date);
});

elements.settingsButton.addEventListener("click", () => {
  elements.settingsDialog.showModal();
});

elements.settingsDialog.addEventListener("click", (event) => {
  if (event.target === elements.settingsDialog) {
    elements.settingsDialog.close();
  }
});

void loadPuzzle(elements.dateInput.value);

async function loadPuzzle(date: string): Promise<void> {
  setStatus("Loading puzzle words...");
  elements.wordGrid.replaceChildren();

  try {
    const puzzle = await loadConnectionsPuzzle(date);
    currentPuzzle = puzzle;
    renderPuzzle(puzzle);
    setStatus(`Loaded words for ${formatDate(puzzle.date)}.`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load puzzle.";
    setStatus(message, true);
  }
}

function renderPuzzle(puzzle: ConnectionsPuzzle): void {
  const fragment = document.createDocumentFragment();
  const sourceIds = enabledSourceIds(settings);

  for (const word of puzzle.words) {
    const card = document.createElement("article");
    card.className = "word-card";

    const title = document.createElement("h2");
    title.textContent = word;

    const links = document.createElement("div");
    links.className = "links";

    for (const link of linksForWord(word, sourceIds)) {
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

function renderSettings(appSettings: AppSettings): void {
  const fragment = document.createDocumentFragment();
  const enabledCount = enabledSourceCount(appSettings);

  for (const source of Object.values(LINK_SOURCES)) {
    const row = document.createElement("label");
    row.className = "settings-row";

    const sourceMeta = document.createElement("span");
    sourceMeta.className = "settings-source";

    const favicon = document.createElement("img");
    favicon.src = getFavicon(source.sampleHref);
    favicon.alt = "";
    favicon.width = 18;
    favicon.height = 18;
    favicon.loading = "lazy";
    favicon.decoding = "async";
    favicon.addEventListener("error", () => favicon.remove());

    const sourceName = document.createElement("span");
    sourceName.textContent = source.settingsLabel;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = appSettings.linkSources[source.id];
    toggle.disabled = toggle.checked && enabledCount === 1;
    toggle.addEventListener("change", () => {
      updateSourceSetting(source.id, toggle.checked);
    });

    const switchTrack = document.createElement("span");
    switchTrack.className = "switch";
    switchTrack.setAttribute("aria-hidden", "true");

    sourceMeta.append(favicon, sourceName);
    row.append(sourceMeta, toggle, switchTrack);
    fragment.append(row);
  }

  elements.settingsList.replaceChildren(fragment);
}

function updateSourceSetting(sourceId: LinkSourceId, isEnabled: boolean): void {
  settings = setLinkSourceEnabled(settings, sourceId, isEnabled);
  saveSettings(settings);
  renderSettings(settings);

  if (currentPuzzle) {
    renderPuzzle(currentPuzzle);
  }
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

function dateFromUrl(): string | null {
  const date = new URLSearchParams(window.location.search).get("date")?.trim();

  if (!date || validatePuzzleDate(date)) {
    return null;
  }

  return date;
}

function syncUrlDate(date: string, mode: "push" | "replace"): void {
  const url = new URL(window.location.href);
  url.searchParams.set("date", date);

  if (url.href === window.location.href) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(null, "", url);
    return;
  }

  window.history.replaceState(null, "", url);
}
