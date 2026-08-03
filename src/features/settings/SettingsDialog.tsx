import { SettingsIcon } from "lucide-react";

import { Favicon } from "@/components/Favicon";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import type { LinkSourceId } from "#shared/types.js";

type SettingsDialogProps = {
  settings: AppSettings;
  onShowResearchSourcesChange: (isEnabled: boolean) => void;
  onSourceChange: (sourceId: LinkSourceId, isEnabled: boolean) => void;
};

export function SettingsDialog({
  settings,
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
      <DialogContent className="max-h-[calc(100svh-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Field
          orientation="horizontal"
          className="rounded-lg px-2 py-2 hover:bg-muted"
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

        <FieldSet
          disabled={!settings.showResearchSources}
          data-disabled={!settings.showResearchSources || undefined}
          className="overflow-y-auto"
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
                  className="rounded-lg px-2 py-2 hover:bg-muted"
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

        <DialogFooter>
          <a
            href="https://github.com/kototok903/connections-info"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm", variant: "link" })}
          >
            GitHub
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
