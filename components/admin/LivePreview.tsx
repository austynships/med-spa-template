"use client";

import { useEffect, useState } from "react";
import { SiteView } from "@/components/SiteView";
import type { SiteConfig } from "@/lib/site-types";

/** Renders a draft site and re-renders whenever the editor sends new settings. */
export function LivePreview({ initial }: { initial: SiteConfig }) {
  const [site, setSite] = useState(initial);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "site-config") setSite(e.data.config as SiteConfig);
      if (e.data?.type === "scroll-to") document.getElementById(e.data.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Sections can appear after load, so skip the fade-in animation in the preview.
  return <div className="no-reveal"><SiteView site={site} /></div>;
}
