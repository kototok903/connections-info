import {
  CircleHelpIcon,
  EllipsisVerticalIcon,
  LightbulbIcon,
  SettingsIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HintsDialog } from "@/features/connections/HintsDialog";
import { HowToPlayDialog } from "@/features/connections/HowToPlayDialog";
import type { AppSettings } from "@/features/settings/settings-store";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import type { LinkSourceId } from "#shared/types.js";

type HeaderActionsProps = {
  date: string;
  onShowPastGuessesChange: (isEnabled: boolean) => void;
  onShowResearchSourcesChange: (isEnabled: boolean) => void;
  onSourceChange: (sourceId: LinkSourceId, isEnabled: boolean) => void;
  settings: AppSettings;
};

export function HeaderActions({
  date,
  onShowPastGuessesChange,
  onShowResearchSourcesChange,
  onSourceChange,
  settings,
}: HeaderActionsProps) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <HintsDialog
        date={date}
        open={hintsOpen}
        onOpenChange={setHintsOpen}
        triggerClassName="hidden sm:inline-flex"
      />
      <HowToPlayDialog
        open={howToPlayOpen}
        onOpenChange={setHowToPlayOpen}
        triggerClassName="hidden sm:inline-flex"
      />
      <SettingsDialog
        settings={settings}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onShowPastGuessesChange={onShowPastGuessesChange}
        onShowResearchSourcesChange={onShowResearchSourcesChange}
        onSourceChange={onSourceChange}
        triggerClassName="hidden sm:inline-flex"
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon"
              aria-label="Open menu"
              className="sm:hidden"
            />
          }
        >
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 sm:hidden">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setHintsOpen(true)}>
              <LightbulbIcon />
              Hints
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHowToPlayOpen(true)}>
              <CircleHelpIcon />
              How to Play
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
