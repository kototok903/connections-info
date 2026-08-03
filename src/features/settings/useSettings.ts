import { useCallback, useState } from "react";

import {
  type AppSettings,
  loadSettings,
  saveSettings,
  setLinkSourceEnabled,
} from "@/features/settings/settings-store";
import type { LinkSourceId } from "#shared/types.js";

type UseSettingsResult = {
  settings: AppSettings;
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

  return { settings, updateSource };
}
