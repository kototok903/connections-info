export function getFavicon(sourceUrl: string, size = 64): string | null {
  try {
    const url = new URL(sourceUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    const safeSize = Math.min(Math.max(Math.round(size), 16), 256);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=${safeSize}`;
  } catch {
    return null;
  }
}
