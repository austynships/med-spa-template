/* The shape of site.config.ts. If you break a setting, your editor will underline it. */
import type { IconName } from "@/components/Icon";

export type Link = { text: string; link: string };
type Section = { show?: boolean; eyebrow?: string; title: string; intro?: string };

export type SiteConfig = {
  brand: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    logoHeight: number;
    invertLogoInFooter: boolean;
    favicon: string;
  };
  colors: {
    primary: string; primaryDark: string; accent: string; background: string;
    surface: string; soft: string; text: string; muted: string; dark: string;
  };
  fonts: { heading: string; body: string };
  contact: {
    phone: string;
    email: string;
    address: string;
    mapLink: string;
    bookingUrl: string;
    hours: { days: string; time: string }[];
    social: { instagram?: string; facebook?: string; tiktok?: string };
  };
  announcement: { show?: boolean; text: string; linkText?: string; link?: string };
  nav: { label: string; link: string }[];
  bookButtonText: string;
  hero: {
    eyebrow?: string;
    headline: string;
    subheadline: string;
    primaryButton?: Link;
    secondaryButton?: Link;
    image: string;
    badge?: string;
    rating?: { score: string; label: string };
  };
  stats: { show?: boolean; items: { number: string; label: string }[] };
  services: Section & { items: { icon: IconName; name: string; description: string; price?: string }[] };
  about: Section & { paragraphs: string[]; checklist?: string[]; image: string; button?: Link };
  team: Section & { members: { name: string; role: string; photo: string }[] };
  memberships: Section & {
    buttonText: string;
    plans: { name: string; price: string; period: string; featured?: boolean; badge?: string; perks: string[] }[];
  };
  testimonials: Section & { items: { quote: string; name: string; detail: string }[] };
  faq: Section & { items: { q: string; a: string }[] };
  cta: { show?: boolean; title: string; text: string; button: Link };
  contactSection: Section & { formAction: string; submitText: string };
  footer: { blurb: string; legal: string };
};
