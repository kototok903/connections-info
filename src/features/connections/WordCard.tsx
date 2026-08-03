import { Favicon } from "@/components/Favicon";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linksForWord } from "@/features/connections/links";
import { cn } from "@/lib/utils";
import type { LinkSourceId } from "#shared/types.js";

type WordCardProps = {
  enabledSourceIds: ReadonlySet<LinkSourceId>;
  word: string;
};

export function WordCard({ enabledSourceIds, word }: WordCardProps) {
  return (
    <article>
      <Card size="sm" className="h-full min-h-30 justify-between bg-tile">
        <CardHeader>
          <CardTitle className="text-base font-black wrap-anywhere uppercase">
            {word}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap content-end gap-1.5">
          {linksForWord(word, enabledSourceIds).map((link) => (
            <a
              key={link.sourceId}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "min-w-0"
              )}
            >
              <Favicon sourceUrl={link.href} />
              {link.label}
            </a>
          ))}
        </CardContent>
      </Card>
    </article>
  );
}
