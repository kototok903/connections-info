import { beforeEach, describe, expect, it } from "vitest";

import {
  defaultSettings,
  enabledSourceCount,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
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
