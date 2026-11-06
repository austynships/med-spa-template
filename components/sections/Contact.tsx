import type { SiteConfig } from "@/lib/site-types";
import { ContactForm } from "../ContactForm";
import { Icon, type IconName } from "../Icon";
import { Logo, SectionHead, tel } from "../ui";

type P = { site: SiteConfig };

export function Contact({ site }: P) {
  const cs = site.contactSection;
  const ct = site.contact;
  if (cs.show === false) return null;
  return (
    <section className="section" id="contact">
      <div className="container contact__grid">
        <div className="contact__info reveal">
          <SectionHead {...cs} center={false} />
          {ct.address && <div className="info-row"><Icon name="pin" /><div><h4>Location</h4><a href={ct.mapLink} target="_blank" rel="noopener">{ct.address}</a></div></div>}
          {ct.phone && <div className="info-row"><Icon name="phone" /><div><h4>Call</h4><a href={tel(ct.phone)}>{ct.phone}</a></div></div>}
          {ct.email && <div className="info-row"><Icon name="mail" /><div><h4>Email</h4><a href={`mailto:${ct.email}`}>{ct.email}</a></div></div>}
          {ct.hours.length > 0 && <div className="info-row"><Icon name="clock" /><div><h4>Hours</h4>
            <div className="hours">{ct.hours.map((h, i) => [<span key={i + "d"}>{h.days}</span>, <span key={i + "t"}>{h.time}</span>])}</div>
          </div></div>}
        </div>
        <ContactForm site={site} />
      </div>
    </section>
  );
}

export function Footer({ site }: P) {
  const ct = site.contact;
  const socials = (Object.entries(ct.social) as [IconName, string | undefined][]).filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo site={site} where="footer" />
            <p className="footer__blurb">{site.footer.blurb}</p>
            {socials.length > 0 && (
              <div className="socials">
                {socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener" aria-label={name}><Icon name={name} size={18} /></a>)}
              </div>
            )}
          </div>
          <div><h4>Explore</h4><ul>{site.nav.map((n) => <li key={n.link}><a href={n.link}>{n.label}</a></li>)}</ul></div>
          <div><h4>Visit</h4><ul>
            {ct.address && <li style={{ whiteSpace: "pre-line" }}>{ct.address}</li>}
            {ct.phone && <li><a href={tel(ct.phone)}>{ct.phone}</a></li>}
            {ct.email && <li><a href={`mailto:${ct.email}`}>{ct.email}</a></li>}
          </ul></div>
          {ct.hours.length > 0 && <div><h4>Hours</h4><ul>{ct.hours.map((h, i) => <li key={i}>{h.days}: {h.time}</li>)}</ul></div>}
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {site.brand.name}. All rights reserved.</span>
          <span>{site.footer.legal}</span>
        </div>
      </div>
    </footer>
  );
}
