import type { SiteConfig } from "@/lib/site-types";

export type Block = { tag: "h1" | "h2" | "h3" | "h4" | "p" | "li" | "quote"; text: string };

export type ScrapedPage = {
  url: string;
  title: string;
  description: string;
  blocks: Block[];
};

export type ScrapedImage = {
  url: string;
  alt: string;
  page: string;
  source: "og" | "img" | "background" | "logo";
};

export type ScrapedReview = { quote: string; name: string; rating?: number };

export type ScrapeResult = {
  url: string;
  fetchedAt: string;
  siteName: string;
  description: string;
  pages: ScrapedPage[];
  images: ScrapedImage[];
  logoCandidates: string[];
  favicon: string;
  phones: string[];
  emails: string[];
  addresses: string[];
  hours: { days: string; time: string }[];
  social: Record<string, string>;
  bookingLinks: string[];
  colors: string[];
  rating?: { value: string; count: string };
  reviews: ScrapedReview[];
  errors: string[];
};

export type Project = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  aiFilledAt?: string;
  scrape: ScrapeResult;
  config: SiteConfig;
};

export type ProjectSummary = Pick<Project, "id" | "name" | "url" | "createdAt" | "updatedAt" | "aiFilledAt"> & {
  logo: string;
  primary: string;
};
