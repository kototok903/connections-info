import { describe, expect, it } from "vitest";

import { resolveTheme } from "@/features/settings/theme";

describe("resolveTheme", () => {
  it("follows the system preference only for the system theme", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});
