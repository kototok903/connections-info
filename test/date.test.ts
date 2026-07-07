import { describe, expect, it } from "vitest";
import { todayInNewYork, validatePuzzleDate } from "../shared/date.js";

describe("date helpers", () => {
  it("formats today using the New York timezone", () => {
    expect(todayInNewYork(new Date("2026-07-07T03:30:00Z"))).toBe(
      "2026-07-06",
    );
    expect(todayInNewYork(new Date("2026-07-07T05:00:00Z"))).toBe(
      "2026-07-07",
    );
  });

  it("validates ISO calendar dates", () => {
    expect(validatePuzzleDate("2026-07-07")).toBeNull();
    expect(validatePuzzleDate("2026-2-3")).toBe(
      "Date must use YYYY-MM-DD format.",
    );
    expect(validatePuzzleDate("2026-02-31")).toBe("Date is invalid.");
  });
});
