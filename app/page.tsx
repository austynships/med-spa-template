/* Content lives in site.config.ts. Section order lives in components/SiteView.tsx. */
import { SiteView } from "@/components/SiteView";
import { site } from "@/site.config";

export default function Home() {
  return <SiteView site={site} />;
}
