import { CircleHelpIcon, MoveDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORY_BACKGROUND_CLASSES } from "@/features/connections/category-colors";
import { cn } from "@/lib/utils";
import { CONNECTION_COLORS } from "#shared/types.js";

type HowToPlayDialogProps = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  triggerClassName?: string;
};

export function HowToPlayDialog({
  onOpenChange,
  open,
  triggerClassName,
}: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            aria-label="Open How to Play"
            className={triggerClassName}
          />
        }
      >
        <CircleHelpIcon />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
          <DialogDescription className="text-foreground">
            Find groups of four items that share something in common.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-2 -mt-2 flex min-h-0 flex-col gap-5 overflow-y-auto px-2 pt-2">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              Select four items and tap <strong>Submit</strong> to check if your
              guess is correct.
            </li>
            <li>Find the groups without making four mistakes.</li>
          </ul>

          <section className="flex flex-col gap-1">
            <h3 className="font-semibold">Category Examples</h3>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              <li>FISH: Bass, Flounder, Salmon, Trout</li>
              <li>FIRE ___: Ant, Drill, Island, Opal</li>
            </ul>
          </section>

          <p>
            Categories will always be more specific than “5-LETTER-WORDS,”
            “NAMES,” or “VERBS.”
          </p>

          <p>
            Each puzzle has exactly one solution. Watch out for words that seem
            to belong to multiple categories.
          </p>

          <section className="flex flex-col gap-3">
            <h3>
              Each group is assigned a color, which will be revealed as you
              solve:
            </h3>
            <div
              aria-label="Category difficulty increases from yellow to purple"
              className="grid w-fit grid-cols-[auto_1fr] gap-x-3 pl-2"
            >
              <div className="flex flex-col gap-1">
                {CONNECTION_COLORS.map((color) => (
                  <span
                    key={color}
                    aria-hidden="true"
                    className={cn(
                      "size-7 rounded-md",
                      CATEGORY_BACKGROUND_CLASSES[color]
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-col justify-between py-1">
                <span>Straightforward</span>
                <span aria-hidden="true" className="text-2xl">
                  <MoveDownIcon />
                </span>
                <span>Tricky</span>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
