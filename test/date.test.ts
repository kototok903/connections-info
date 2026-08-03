import { describe, expect, it } from "vitest";

import {
  dateFromIsoDate,
  EARLIEST_CONNECTIONS_DATE,
  isoDateFromDate,
  todayInLocalTimezone,
  todayInNewYork,
  validatePuzzleDate,
} from "#shared/date.js";

describe("date helpers", () => {
  it("formats today using the New York timezone", () => {
    expect(todayInNewYork(new Date("2026-07-07T03:30:00Z"))).toBe("2026-07-06");
    expect(todayInNewYork(new Date("2026-07-07T05:00:00Z"))).toBe("2026-07-07");
  });

  it("validates ISO calendar dates", () => {
    expect(validatePuzzleDate("2026-07-07")).toBeNull();
    expect(validatePuzzleDate("2026-2-3")).toBe(
      "Date must use YYYY-MM-DD format."
    );
    expect(validatePuzzleDate("2026-02-31")).toBe("Date is invalid.");
    expect(validatePuzzleDate(EARLIEST_CONNECTIONS_DATE)).toBeNull();
    expect(validatePuzzleDate("2023-06-11")).toBe(
      "Connections puzzles start on 2023-06-12."
    );
  });

  it("formats today using the runtime local timezone", () => {
    expect(todayInLocalTimezone(new Date(2026, 6, 7, 23, 30))).toBe(
      "2026-07-07"
    );
  });

  it("converts ISO puzzle dates without timezone shifts", () => {
    const date = dateFromIsoDate("2026-07-07");

    expect(date).not.toBeNull();
    expect(isoDateFromDate(date!)).toBe("2026-07-07");
    expect(dateFromIsoDate("not-a-date")).toBeNull();
  });
});
