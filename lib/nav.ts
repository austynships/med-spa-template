import type { SiteConfig } from "@/lib/site-types";

/** Nav links for the sections that are switched on. */
export function navFor(c: SiteConfig): SiteConfig["nav"] {
  const all: [boolean, string, string][] = [
    [c.services.show !== false && c.services.items.length > 0, "Services", "#services"],
    [c.about.show !== false, "About", "#about"],
    [c.team.show !== false && c.team.members.length > 0, "Team", "#team"],
    [c.memberships.show !== false && c.memberships.plans.length > 0, "Memberships", "#memberships"],
    [c.testimonials.show !== false && c.testimonials.items.length > 0, "Reviews", "#reviews"],
    [c.faq.show !== false && c.faq.items.length > 0, "FAQ", "#faq"],
    [c.contactSection.show !== false, "Contact", "#contact"],
  ];
  return all.filter(([on]) => on).map(([, label, link]) => ({ label, link }));
}
