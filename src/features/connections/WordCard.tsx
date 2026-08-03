import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type WordCardProps = {
  disabled: boolean;
  onSelect: () => void;
  selected: boolean;
  shakeId: number | null;
  word: string;
};

export function WordCard({
  disabled,
  onSelect,
  selected,
  shakeId,
  word,
}: WordCardProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (shakeId === null) {
      return;
    }

    void animate(
      scope.current,
      { x: [0, -8, 8, -6, 6, -3, 3, 0] },
      { duration: 0.42 }
    );
  }, [animate, scope, shakeId]);

  return (
    <motion.div
      ref={scope}
      layout
      transition={{
        layout: { duration: 0.28, ease: "easeInOut" },
      }}
    >
      <Button
        type="button"
        variant="tile"
        size="tile"
        disabled={disabled}
        aria-pressed={selected}
        onClick={onSelect}
        className="w-full disabled:opacity-100"
      >
        <span className="wrap-anywhere">{word}</span>
      </Button>
    </motion.div>
  );
}
