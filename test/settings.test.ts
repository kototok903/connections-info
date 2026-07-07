import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultSettings,
  enabledSourceCount,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
  STORAGE_KEY,
} from "../src/settings";

const storage = new Map<string, string>();

vi.stubGlobal("window", {
  localStorage: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

describe("settings", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads defaults when localStorage is empty", () => {
    const settings = loadSettings();

    expect(settings.linkSources.google).toBe(false);
    expect(settings.linkSources["dictionary-cambridge"]).toBe(false);
    expect(settings.linkSources["dictionary-dictcom"]).toBe(false);
    expect(settings.linkSources["dictionary-mw"]).toBe(true);
    expect(settings.linkSources["dictionary-urban"]).toBe(true);
    expect(enabledSourceCount(settings)).toBe(6);
  });

  it("saves and loads link source preferences", () => {
    let settings = setLinkSourceEnabled(
      defaultSettings(),
      "translate-ru",
      false,
    );
    settings = setLinkSourceEnabled(settings, "dictionary-cambridge", true);

    saveSettings(settings);

    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("translate-ru");
    expect(loadSettings().linkSources["translate-ru"]).toBe(false);
    expect(loadSettings().linkSources["dictionary-cambridge"]).toBe(true);
  });

  it("prevents disabling the last enabled source", () => {
    let settings = defaultSettings();

    for (const sourceId of [
      "google-meaning",
      "dictionary-mw",
      "thesaurus",
      "dictionary-urban",
      "translate-ru",
    ] as const) {
      settings = setLinkSourceEnabled(settings, sourceId, false);
    }

    const unchanged = setLinkSourceEnabled(settings, "translate-uk", false);

    expect(enabledSourceCount(unchanged)).toBe(1);
    expect(unchanged.linkSources["translate-uk"]).toBe(true);
  });

  it("falls back safely for invalid localStorage values", () => {
    window.localStorage.setItem(STORAGE_KEY, "{");

    expect(enabledSourceCount(loadSettings())).toBe(6);
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
      }),
    );

    expect(enabledSourceCount(loadSettings())).toBe(1);
    expect(loadSettings().linkSources.google).toBe(true);
  });
});
