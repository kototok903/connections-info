import { beforeEach, describe, expect, it } from "vitest";

import {
  defaultSettings,
  enabledSourceCount,
  enabledSourceIds,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
  setPastGuessesOrder,
  setShowPastGuesses,
  setShowResearchSources,
  setShowStash,
  setTheme,
  STORAGE_KEY,
} from "@/features/settings/settings-store";

describe("settings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads link source preferences", () => {
    let settings = setLinkSourceEnabled(
      defaultSettings(),
      "dictionary-mw",
      false
    );
    settings = setLinkSourceEnabled(settings, "dictionary-cambridge", true);

    saveSettings(settings);

    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("dictionary-mw");
    expect(loadSettings().linkSources["dictionary-mw"]).toBe(false);
    expect(loadSettings().linkSources["dictionary-cambridge"]).toBe(true);
  });

  it("hides all research sources without changing source preferences", () => {
    const settings = setShowResearchSources(defaultSettings(), false);

    expect(enabledSourceCount(settings)).toBe(4);
    expect([...enabledSourceIds(settings)]).toEqual([]);

    saveSettings(settings);
    expect(loadSettings().showResearchSources).toBe(false);
  });

  it("saves the past guesses visibility preference", () => {
    const settings = setShowPastGuesses(defaultSettings(), false);

    saveSettings(settings);

    expect(loadSettings().showPastGuesses).toBe(false);
  });

  it("shows the stash button by default and saves the preference", () => {
    expect(defaultSettings().showStash).toBe(true);

    saveSettings(setShowStash(defaultSettings(), false));

    expect(loadSettings().showStash).toBe(false);
  });

  it("defaults to newest-first past guesses and saves the order", () => {
    expect(defaultSettings().pastGuessesOrder).toBe("newest-first");

    saveSettings(setPastGuessesOrder(defaultSettings(), "oldest-first"));

    expect(loadSettings().pastGuessesOrder).toBe("oldest-first");
  });

  it("defaults to the system theme and saves the choice", () => {
    expect(defaultSettings().theme).toBe("system");

    saveSettings(setTheme(defaultSettings(), "dark"));

    expect(loadSettings().theme).toBe("dark");
  });

  it("falls back to the system theme for unknown stored values", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultSettings(), theme: "sepia" })
    );

    expect(loadSettings().theme).toBe("system");
  });

  it("falls back to the default order for unknown stored values", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultSettings(), pastGuessesOrder: "sideways" })
    );

    expect(loadSettings().pastGuessesOrder).toBe("newest-first");
  });

  it("prevents disabling the last enabled source", () => {
    let settings = defaultSettings();

    for (const sourceId of [
      "google-meaning",
      "dictionary-mw",
      "thesaurus",
    ] as const) {
      settings = setLinkSourceEnabled(settings, sourceId, false);
    }

    const unchanged = setLinkSourceEnabled(settings, "dictionary-urban", false);

    expect(enabledSourceCount(unchanged)).toBe(1);
    expect(unchanged.linkSources["dictionary-urban"]).toBe(true);
  });

  it("falls back safely for invalid localStorage values", () => {
    window.localStorage.setItem(STORAGE_KEY, "{");

    expect(loadSettings()).toEqual(defaultSettings());
  });

  it("repairs stored settings with every source disabled", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        linkSources: {
          google: false,
          "google-meaning": false,
          "dictionary-mw": false,
          "dictionary-cambridge": false,
          "dictionary-dictcom": false,
          thesaurus: false,
          "dictionary-urban": false,
          "translate-ru": false,
          "translate-uk": false,
        },
      })
    );

    expect(enabledSourceCount(loadSettings())).toBe(1);
    expect(loadSettings().linkSources.google).toBe(true);
  });
});
