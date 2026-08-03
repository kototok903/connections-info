import type { ConnectionColor } from "#shared/types.js";

export const CATEGORY_BACKGROUND_CLASSES: Record<ConnectionColor, string> = {
  blue: "bg-connection-blue",
  green: "bg-connection-green",
  purple: "bg-connection-purple",
  yellow: "bg-connection-yellow",
};

export const CATEGORY_TEXT_CLASSES: Record<ConnectionColor, string> = {
  blue: "text-connection-blue",
  green: "text-connection-green",
  purple: "text-connection-purple",
  yellow: "text-connection-yellow",
};
