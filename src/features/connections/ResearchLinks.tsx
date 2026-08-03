import { AnimatePresence, motion } from "motion/react";

import { Favicon } from "@/components/Favicon";
import { buttonVariants } from "@/components/ui/button";
import { linksForWord } from "@/features/connections/links";
import { cn } from "@/lib/utils";
import type { LinkSourceId } from "#shared/types.js";

type ResearchLinksProps = {
  enabledSourceIds: ReadonlySet<LinkSourceId>;
  word: string | null;
};

export function ResearchLinks({ enabledSourceIds, word }: ResearchLinksProps) {
  return (
    <AnimatePresence initial={false}>
      {word ? (
        <motion.section
          key={word}
          aria-label={`Research ${word}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {linksForWord(word, enabledSourceIds).map((link) => (
              <a
                key={link.sourceId}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-w-0"
                )}
              >
                <Favicon sourceUrl={link.href} />
                {link.label}
              </a>
            ))}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
