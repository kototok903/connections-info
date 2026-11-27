import {
  type LucideIcon,
  MonitorIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";

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
  type PastGuessesOrder,
  type Theme,
} from "@/features/settings/settings-store";
import { cn } from "@/lib/utils";
import type { LinkSourceId } from "#shared/types.js";

type SettingsDialogProps = {
  onOpenChange?: (open: boolean) => void;
  settings: AppSettings;
  open?: boolean;
  triggerClassName?: string;
  onPastGuessesOrderChange: (order: PastGuessesOrder) => void;
  onShowPastGuessesChange: (isEnabled: boolean) => void;
  onShowResearchSourcesChange: (isEnabled: boolean) => void;
  onShowStashChange: (isEnabled: boolean) => void;
  onSourceChange: (sourceId: LinkSourceId, isEnabled: boolean) => void;
  onThemeChange: (theme: Theme) => void;
};

const THEME_OPTIONS = [
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
] as const satisfies readonly {
  value: Theme;
  label: string;
  Icon: LucideIcon;
}[];

export function SettingsDialog({
  onOpenChange,
  settings,
  open,
  triggerClassName,
  onPastGuessesOrderChange,
  onShowPastGuessesChange,
  onShowResearchSourcesChange,
  onShowStashChange,
  onSourceChange,
  onThemeChange,
}: SettingsDialogProps) {
  const enabledCount = enabledSourceCount(settings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            aria-label="Open settings"
            className={triggerClassName}
          />
        }
      >
        <SettingsIcon />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="-mx-2 flex min-h-0 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2">
          <div className="flex items-center justify-between gap-2 p-2">
            <span id="theme-label" className="text-sm leading-snug font-medium">
              Theme
            </span>
            <div
              role="radiogroup"
              aria-labelledby="theme-label"
              className="flex gap-0.5 rounded-lg bg-muted p-0.5"
            >
              {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const checked = settings.theme === value;
                return (
                  <Button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    size="sm"
                    variant={checked ? "default" : "ghost"}
                    className={cn(!checked && "hover:bg-background")}
                    onClick={() => onThemeChange(value)}
                  >
                    <Icon data-icon="inline-start" />
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

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
            <FieldLabel htmlFor="show-stash">Show Stash button</FieldLabel>
            <Switch
              id="show-stash"
              checked={settings.showStash}
              onCheckedChange={onShowStashChange}
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

          <Field
            orientation="horizontal"
            data-disabled={!settings.showPastGuesses || undefined}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <FieldLabel htmlFor="past-guesses-newest-first">
              Show recent Past Guesses first
            </FieldLabel>
            <Switch
              id="past-guesses-newest-first"
              checked={settings.pastGuessesOrder === "newest-first"}
              disabled={!settings.showPastGuesses}
              onCheckedChange={(isChecked) =>
                onPastGuessesOrderChange(
                  isChecked ? "newest-first" : "oldest-first"
                )
              }
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
