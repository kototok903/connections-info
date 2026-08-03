import { useState } from "react";

import { getFavicon } from "@/lib/favicon";

type FaviconProps = {
  sourceUrl: string;
  size?: number;
};

export function Favicon({ sourceUrl, size = 16 }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const faviconUrl = getFavicon(sourceUrl);

  if (failed || !faviconUrl) {
    return null;
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-sm"
      onError={() => setFailed(true)}
    />
  );
}
