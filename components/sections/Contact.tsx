import { site } from "@/site.config";
import { ContactForm } from "../ContactForm";
import { Icon, type IconName } from "../Icon";
import { Logo, SectionHead, tel } from "../ui";

export function Contact() {
  const cs = site.contactSection;
  const ct = site.contact;
  if (cs.show === false) return null;
  return (
    <section className="section" id="contact">
      <div className="container contact__grid">
        <div className="contact__info reveal">
          <SectionHead {...cs} center={false} />
          <div className="info-row"><Icon name="pin" /><div><h4>Location</h4><a href={ct.mapLink} target="_blank" rel="noopener">{ct.address}</a></div></div>
          <div className="info-row"><Icon name="phone" /><div><h4>Call</h4><a href={tel(ct.phone)}>{ct.phone}</a></div></div>
          <div className="info-row"><Icon name="mail" /><div><h4>Email</h4><a href={`mailto:${ct.email}`}>{ct.email}</a></div></div>
          <div className="info-row"><Icon name="clock" /><div><h4>Hours</h4>
            <div className="hours">{ct.hours.map((h) => [<span key={h.days}>{h.days}</span>, <span key={h.days + "t"}>{h.time}</span>])}</div>
          </div></div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export function Footer() {
  const ct = site.contact;
  const socials = (Object.entries(ct.social) as [IconName, string | undefined][]).filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo where="footer" />
            <p className="footer__blurb">{site.footer.blurb}</p>
            {socials.length > 0 && (
              <div className="socials">
                {socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener" aria-label={name}><Icon name={name} size={18} /></a>)}
              </div>
            )}
          </div>
          <div><h4>Explore</h4><ul>{site.nav.map((n) => <li key={n.link}><a href={n.link}>{n.label}</a></li>)}</ul></div>
          <div><h4>Visit</h4><ul>
            <li style={{ whiteSpace: "pre-line" }}>{ct.address}</li>
            <li><a href={tel(ct.phone)}>{ct.phone}</a></li>
            <li><a href={`mailto:${ct.email}`}>{ct.email}</a></li>
          </ul></div>
          <div><h4>Hours</h4><ul>{ct.hours.map((h) => <li key={h.days}>{h.days}: {h.time}</li>)}</ul></div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {site.brand.name}. All rights reserved.</span>
          <span>{site.footer.legal}</span>
        </div>
      </div>
    </footer>
  );
}
