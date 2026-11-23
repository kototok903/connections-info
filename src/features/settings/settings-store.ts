import { DEFAULT_LINK_SOURCE_IDS } from "@/features/connections/links";
import { LINK_SOURCE_IDS, type LinkSourceId } from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

export const STORAGE_KEY = "connections-info:settings:v1";

export const PAST_GUESSES_ORDERS = ["newest-first", "oldest-first"] as const;

export type PastGuessesOrder = (typeof PAST_GUESSES_ORDERS)[number];

export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export type AppSettings = {
  theme: Theme;
  showPastGuesses: boolean;
  pastGuessesOrder: PastGuessesOrder;
  showResearchSources: boolean;
  linkSources: Record<LinkSourceId, boolean>;
};

export function defaultSettings(): AppSettings {
  const defaultEnabledIds = new Set(DEFAULT_LINK_SOURCE_IDS);

  return {
    theme: "system",
    showPastGuesses: true,
    pastGuessesOrder: "newest-first",
    showResearchSources: true,
    linkSources: Object.fromEntries(
      LINK_SOURCE_IDS.map((sourceId) => [
        sourceId,
        defaultEnabledIds.has(sourceId),
      ])
    ) as Record<LinkSourceId, boolean>,
  };
}

export function enabledSourceIds(settings: AppSettings): Set<LinkSourceId> {
  if (!settings.showResearchSources) {
    return new Set();
  }

  return new Set(
    LINK_SOURCE_IDS.filter((sourceId) => settings.linkSources[sourceId])
  );
}

export function enabledSourceCount(settings: AppSettings): number {
  return LINK_SOURCE_IDS.filter((sourceId) => settings.linkSources[sourceId])
    .length;
}

export function loadSettings(): AppSettings {
  const fallback = defaultSettings();
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    return ensureAtLeastOneSource(mergeSettings(parsed, fallback));
  } catch {
    return fallback;
  }
}

export function saveSettings(settings: AppSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function setLinkSourceEnabled(
  settings: AppSettings,
  sourceId: LinkSourceId,
  isEnabled: boolean
): AppSettings {
  if (!settings.linkSources[sourceId]) {
    isEnabled = true;
  }

  if (!isEnabled && enabledSourceCount(settings) <= 1) {
    return settings;
  }

  return {
    ...settings,
    linkSources: {
      ...settings.linkSources,
      [sourceId]: isEnabled,
    },
  };
}

export function setShowResearchSources(
  settings: AppSettings,
  showResearchSources: boolean
): AppSettings {
  return { ...settings, showResearchSources };
}

export function setShowPastGuesses(
  settings: AppSettings,
  showPastGuesses: boolean
): AppSettings {
  return { ...settings, showPastGuesses };
}

export function setTheme(settings: AppSettings, theme: Theme): AppSettings {
  return { ...settings, theme };
}

export function setPastGuessesOrder(
  settings: AppSettings,
  pastGuessesOrder: PastGuessesOrder
): AppSettings {
  return { ...settings, pastGuessesOrder };
}

function mergeSettings(value: unknown, fallback: AppSettings): AppSettings {
  if (!isRecord(value) || !isRecord(value.linkSources)) {
    return fallback;
  }

  const storedLinkSources = value.linkSources;

  return {
    theme: isTheme(value.theme) ? value.theme : fallback.theme,
    showPastGuesses:
      typeof value.showPastGuesses === "boolean"
        ? value.showPastGuesses
        : fallback.showPastGuesses,
    pastGuessesOrder: isPastGuessesOrder(value.pastGuessesOrder)
      ? value.pastGuessesOrder
      : fallback.pastGuessesOrder,
    showResearchSources:
      typeof value.showResearchSources === "boolean"
        ? value.showResearchSources
        : fallback.showResearchSources,
    linkSources: Object.fromEntries(
      LINK_SOURCE_IDS.map((sourceId) => [
        sourceId,
        typeof storedLinkSources[sourceId] === "boolean"
          ? storedLinkSources[sourceId]
          : fallback.linkSources[sourceId],
      ])
    ) as Record<LinkSourceId, boolean>,
  };
}

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

function isPastGuessesOrder(value: unknown): value is PastGuessesOrder {
  return PAST_GUESSES_ORDERS.includes(value as PastGuessesOrder);
}

function ensureAtLeastOneSource(settings: AppSettings): AppSettings {
  if (enabledSourceCount(settings) > 0) {
    return settings;
  }

  return {
    ...settings,
    linkSources: {
      ...settings.linkSources,
      [LINK_SOURCE_IDS[0]]: true,
    },
  };
}
