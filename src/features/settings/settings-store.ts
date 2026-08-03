import { DEFAULT_LINK_SOURCE_IDS } from "@/features/connections/links";
import { LINK_SOURCE_IDS, type LinkSourceId } from "#shared/types.js";
import { isRecord } from "#shared/utils.js";

export const STORAGE_KEY = "connections-info:settings:v1";

export type AppSettings = {
  showResearchSources: boolean;
  linkSources: Record<LinkSourceId, boolean>;
};

export function defaultSettings(): AppSettings {
  const defaultEnabledIds = new Set(DEFAULT_LINK_SOURCE_IDS);

  return {
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

function mergeSettings(value: unknown, fallback: AppSettings): AppSettings {
  if (!isRecord(value) || !isRecord(value.linkSources)) {
    return fallback;
  }

  const storedLinkSources = value.linkSources;

  return {
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
