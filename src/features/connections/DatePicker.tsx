import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  dateFromIsoDate,
  EARLIEST_CONNECTIONS_DATE,
  isoDateFromDate,
} from "#shared/date.js";

const earliestConnectionsDate = dateFromIsoDate(EARLIEST_CONNECTIONS_DATE);

type DatePickerProps = {
  date: string;
  onDateChange: (date: string) => void;
};

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = dateFromIsoDate(date);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id="puzzle-date"
            type="button"
            variant="outline"
            className="min-w-0 justify-start"
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          defaultMonth={selectedDate ?? undefined}
          startMonth={earliestConnectionsDate ?? undefined}
          disabled={
            earliestConnectionsDate
              ? { before: earliestConnectionsDate }
              : undefined
          }
          timeZone={timeZone}
          onSelect={(nextDate) => {
            if (!nextDate) {
              return;
            }

            onDateChange(isoDateFromDate(nextDate));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
