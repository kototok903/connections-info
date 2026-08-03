import { addDays } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/features/connections/DatePicker";
import { dateFromIsoDate, isoDateFromDate } from "#shared/date.js";

type DateNavigationProps = {
  date: string;
  onDateChange: (date: string) => void;
};

export function DateNavigation({ date, onDateChange }: DateNavigationProps) {
  function moveBy(days: number) {
    const selectedDate = dateFromIsoDate(date);
    if (selectedDate) {
      onDateChange(isoDateFromDate(addDays(selectedDate, days)));
    }
  }

  return (
    <nav
      aria-label="Puzzle date"
      className="flex items-center justify-center gap-2"
    >
      <Button
        type="button"
        size="icon"
        aria-label="Previous day"
        onClick={() => moveBy(-1)}
      >
        <ChevronLeftIcon />
      </Button>
      <DatePicker date={date} onDateChange={onDateChange} />
      <Button
        type="button"
        size="icon"
        aria-label="Next day"
        onClick={() => moveBy(1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}
