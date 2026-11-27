import { useCallback, useState } from "react";

import {
  type AppSettings,
  loadSettings,
  type PastGuessesOrder,
  saveSettings,
  setLinkSourceEnabled,
  setPastGuessesOrder,
  setShowPastGuesses,
  setShowResearchSources,
  setShowStash,
  setTheme,
  type Theme,
} from "@/features/settings/settings-store";
import type { LinkSourceId } from "#shared/types.js";

type UseSettingsResult = {
  settings: AppSettings;
  updatePastGuessesOrder: (order: PastGuessesOrder) => void;
  updateShowPastGuesses: (isEnabled: boolean) => void;
  updateShowResearchSources: (isEnabled: boolean) => void;
  updateShowStash: (isEnabled: boolean) => void;
  updateSource: (sourceId: LinkSourceId, isEnabled: boolean) => void;
  updateTheme: (theme: Theme) => void;
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

  const updateShowStash = useCallback((isEnabled: boolean) => {
    setSettings((current) => {
      const next = setShowStash(current, isEnabled);
      saveSettings(next);
      return next;
    });
  }, []);

  const updatePastGuessesOrder = useCallback((order: PastGuessesOrder) => {
    setSettings((current) => {
      const next = setPastGuessesOrder(current, order);
      saveSettings(next);
      return next;
    });
  }, []);

  const updateTheme = useCallback((theme: Theme) => {
    setSettings((current) => {
      const next = setTheme(current, theme);
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    updatePastGuessesOrder,
    updateShowPastGuesses,
    updateShowResearchSources,
    updateShowStash,
    updateSource,
    updateTheme,
  };
}
