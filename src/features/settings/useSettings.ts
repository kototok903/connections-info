import { useCallback, useState } from "react";

import {
  type AppSettings,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
  setShowPastGuesses,
  setShowResearchSources,
} from "@/features/settings/settings-store";
import type { LinkSourceId } from "#shared/types.js";

type UseSettingsResult = {
  settings: AppSettings;
  updateShowPastGuesses: (isEnabled: boolean) => void;
  updateShowResearchSources: (isEnabled: boolean) => void;
  updateSource: (sourceId: LinkSourceId, isEnabled: boolean) => void;
};

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState(loadSettings);

  const updateSource = useCallback(
    (sourceId: LinkSourceId, isEnabled: boolean) => {
      setSettings((current) => {
        const next = setLinkSourceEnabled(current, sourceId, isEnabled);
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const updateShowResearchSources = useCallback((isEnabled: boolean) => {
    setSettings((current) => {
      const next = setShowResearchSources(current, isEnabled);
      saveSettings(next);
      return next;
    });
  }, []);

  const updateShowPastGuesses = useCallback((isEnabled: boolean) => {
    setSettings((current) => {
      const next = setShowPastGuesses(current, isEnabled);
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    updateShowPastGuesses,
    updateShowResearchSources,
    updateSource,
  };
}
