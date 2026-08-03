import { useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { ConnectionsGame } from "@/features/connections/ConnectionsGame";
import { DateNavigation } from "@/features/connections/DateNavigation";
import { useConnectionsPuzzle } from "@/features/connections/useConnectionsPuzzle";
import { enabledSourceIds } from "@/features/settings/settings-store";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { useSettings } from "@/features/settings/useSettings";
import { todayInLocalTimezone, validatePuzzleDate } from "#shared/date.js";

export function ConnectionsPage() {
  const initialDate = getDateFromUrl() ?? todayInLocalTimezone();
  const [date, setDate] = useState(initialDate);
  const request = useConnectionsPuzzle(date);
  const { settings, updateShowResearchSources, updateSource } = useSettings();

  useEffect(() => {
    function handlePopState() {
      setDate(getDateFromUrl() ?? todayInLocalTimezone());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function changeDate(nextDate: string) {
    if (!validatePuzzleDate(nextDate)) {
      syncUrlDate(nextDate, "push");
      setDate(nextDate);
    }
  }

  return (
    <main className="mx-auto w-[min(calc(100%-1.5rem),61.25rem)] py-5 sm:w-[min(calc(100%-2rem),61.25rem)] sm:py-7">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl leading-none font-bold sm:text-3xl">
          Connections Info
        </h1>
        <SettingsDialog
          settings={settings}
          onShowResearchSourcesChange={updateShowResearchSources}
          onSourceChange={updateSource}
        />
      </header>

      <Separator className="my-4" />

      <DateNavigation date={date} onDateChange={changeDate} />

      <div
        role="status"
        aria-live="polite"
        className="my-4 text-center text-sm"
      >
        {request.status === "loading" ? (
          <span className="text-muted-foreground">Loading puzzle...</span>
        ) : null}
        {request.status === "error" ? (
          <span className="font-semibold text-destructive">
            {request.error}
          </span>
        ) : null}
      </div>

      {request.status === "success" ? (
        <ConnectionsGame
          key={`${request.puzzle.id ?? "puzzle"}-${request.puzzle.date}`}
          puzzle={request.puzzle}
          enabledSourceIds={enabledSourceIds(settings)}
        />
      ) : null}
    </main>
  );
}

function getDateFromUrl(): string | null {
  const date = new URLSearchParams(window.location.search).get("date")?.trim();

  if (!date || validatePuzzleDate(date)) {
    return null;
  }

  return date;
}

function syncUrlDate(date: string, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  url.searchParams.set("date", date);

  if (url.href === window.location.href) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(null, "", url);
    return;
  }

  window.history.replaceState(null, "", url);
}
