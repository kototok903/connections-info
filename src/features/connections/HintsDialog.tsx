import { LightbulbIcon, RotateCwIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_BACKGROUND_CLASSES } from "@/features/connections/category-colors";
import { loadConnectionsHints } from "@/features/connections/hints-api";
import { cn } from "@/lib/utils";
import type { ConnectionsHints } from "#shared/types.js";

type HintsDialogProps = {
  date: string;
};

type RequestState =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: ConnectionsHints; error: null }
  | { status: "error"; data: null; error: string };

export function HintsDialog({ date }: HintsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState<RequestState>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    setRequest({ status: "loading", data: null, error: null });

    void loadConnectionsHints(date, controller.signal)
      .then((data) => {
        if (active) {
          setRequest({ status: "success", data, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) {
          return;
        }

        setRequest({
          status: "error",
          data: null,
          error:
            error instanceof Error ? error.message : "Failed to load hints.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt, date, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="icon" aria-label="Open hints" />}
      >
        <LightbulbIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hints</DialogTitle>
          <DialogDescription>
            A clue for each category without revealing its answer.
          </DialogDescription>
        </DialogHeader>

        {request.status === "loading" || request.status === "idle" ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading hints...
          </p>
        ) : null}

        {request.status === "error" ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-destructive">
              {request.error}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAttempt((value) => value + 1)}
            >
              <RotateCwIcon data-icon="inline-start" />
              Try again
            </Button>
          </div>
        ) : null}

        {request.status === "success" ? (
          <>
            <ul className="flex flex-col gap-3">
              {request.data.hints.map((hint) => (
                <li key={hint.color} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 size-3 shrink-0 rounded-full",
                      CATEGORY_BACKGROUND_CLASSES[hint.color]
                    )}
                  />
                  <p className="text-sm">
                    <span className="font-semibold capitalize">
                      {hint.color}:
                    </span>{" "}
                    {hint.text}
                  </p>
                </li>
              ))}
            </ul>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Hints from{" "}
              <a
                href={request.data.mashableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-auto p-0"
                )}
              >
                Mashable
              </a>
              . More help:{" "}
              <a
                href={request.data.companionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-auto p-0"
                )}
              >
                NYT Connections Companion
              </a>
              .
            </p>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
