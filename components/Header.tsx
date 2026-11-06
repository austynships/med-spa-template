"use client";

import { useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/site-types";
import { Icon } from "./Icon";
import { Logo, tel } from "./ui";

export function Header({ site }: { site: SiteConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}${open ? " menu-open" : ""}`}>
      <div className="container header__inner">
        <Logo site={site} where="header" />
        <nav className="nav" aria-label="Main">
          {site.nav.map((n) => <a key={n.link} href={n.link} onClick={close}>{n.label}</a>)}
          <a className="btn btn--primary nav__book" href={site.contact.bookingUrl} onClick={close}>{site.bookButtonText}</a>
        </nav>
        <div className="header__actions">
          {site.contact.phone && <a className="header__phone" href={tel(site.contact.phone)}>{site.contact.phone}</a>}
          <a className="btn btn--primary" href={site.contact.bookingUrl}>{site.bookButtonText}</a>
          <button className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name={open ? "close" : "menu"} size={26} />
          </button>
        </div>
      </div>
    </header>
  );
}
