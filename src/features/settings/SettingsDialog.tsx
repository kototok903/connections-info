import { SettingsIcon } from "lucide-react";

import { Favicon } from "@/components/Favicon";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { LINK_SOURCES } from "@/features/connections/links";
import {
  type AppSettings,
  enabledSourceCount,
} from "@/features/settings/settings-store";
import { cn } from "@/lib/utils";
import type { LinkSourceId } from "#shared/types.js";

type SettingsDialogProps = {
  settings: AppSettings;
  onShowPastGuessesChange: (isEnabled: boolean) => void;
  onShowResearchSourcesChange: (isEnabled: boolean) => void;
  onSourceChange: (sourceId: LinkSourceId, isEnabled: boolean) => void;
};

export function SettingsDialog({
  settings,
  onShowPastGuessesChange,
  onShowResearchSourcesChange,
  onSourceChange,
}: SettingsDialogProps) {
  const enabledCount = enabledSourceCount(settings);

  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" size="icon" aria-label="Open settings" />}
      >
        <SettingsIcon />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="-mx-2 flex min-h-0 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2">
          <Field
            orientation="horizontal"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <FieldLabel htmlFor="show-research-sources">
              Show Research sources
            </FieldLabel>
            <Switch
              id="show-research-sources"
              checked={settings.showResearchSources}
              onCheckedChange={onShowResearchSourcesChange}
            />
          </Field>

          <Field
            orientation="horizontal"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <FieldLabel htmlFor="show-past-guesses">
              Show Past Guesses
            </FieldLabel>
            <Switch
              id="show-past-guesses"
              checked={settings.showPastGuesses}
              onCheckedChange={onShowPastGuessesChange}
            />
          </Field>

          <FieldSet
            disabled={!settings.showResearchSources}
            data-disabled={!settings.showResearchSources || undefined}
            className="mt-3"
          >
            <FieldLegend variant="label">Research sources</FieldLegend>
            <FieldGroup className="gap-1 overflow-x-hidden">
              {Object.values(LINK_SOURCES).map((source) => {
                const checked = settings.linkSources[source.id];
                const disabled =
                  !settings.showResearchSources ||
                  (checked && enabledCount === 1);
                const inputId = `source-${source.id}`;

                return (
                  <Field
                    key={source.id}
                    orientation="horizontal"
                    data-disabled={disabled || undefined}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <FieldLabel htmlFor={inputId} className="min-w-0">
                      <Favicon sourceUrl={source.sampleHref} size={18} />
                      <span className="truncate">{source.settingsLabel}</span>
                    </FieldLabel>
                    <Switch
                      id={inputId}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(isChecked) =>
                        onSourceChange(source.id, isChecked)
                      }
                    />
                  </Field>
                );
              })}
            </FieldGroup>
          </FieldSet>
          <a
            href="https://github.com/kototok903/connections-info"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 self-end",
              buttonVariants({ size: "sm", variant: "link" })
            )}
          >
            GitHub
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
