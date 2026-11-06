import type { SiteConfig } from "@/lib/site-types";
import { Icon } from "../Icon";
import { SectionHead } from "../ui";

type P = { site: SiteConfig };

export function Memberships({ site }: P) {
  const m = site.memberships;
  if (m.show === false || m.plans.length === 0) return null;
  return (
    <section className="section section--soft" id="memberships">
      <div className="container">
        <SectionHead {...m} />
        <div className="plans">
          {m.plans.map((p) => (
            <div className={`plan reveal${p.featured ? " plan--featured" : ""}`} key={p.name}>
              {p.badge && <span className="plan__badge">{p.badge}</span>}
              <h3>{p.name}</h3>
              <div className="plan__price">{p.price}<small>{p.period}</small></div>
              <ul className="plan__perks">
                {p.perks.map((k) => <li key={k}><Icon name="check" size={16} /><span>{k}</span></li>)}
              </ul>
              <a className={`btn ${p.featured ? "btn--light" : "btn--ghost"}`} href={site.contact.bookingUrl}>{m.buttonText}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ site }: P) {
  const t = site.testimonials;
  if (t.show === false || t.items.length === 0) return null;
  return (
    <section className="section" id="reviews">
      <div className="container">
        <SectionHead {...t} />
        <div className="reviews__grid">
          {t.items.map((r) => (
            <figure className="review reveal" key={r.name + r.quote.slice(0, 20)}>
              <span className="stars">★★★★★</span>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>
                <div className="review__name">{r.name}</div>
                <div className="review__detail">{r.detail}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({ site }: P) {
  const f = site.faq;
  if (f.show === false || f.items.length === 0) return null;
  return (
    <section className="section section--soft" id="faq">
      <div className="container">
        <SectionHead {...f} />
        <div className="faq__list">
          {f.items.map((q, i) => (
            <details className="faq__item" key={q.q} open={i === 0}>
              <summary>{q.q}<span className="faq__plus"><Icon name="plus" size={16} /></span></summary>
              <p>{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta({ site }: P) {
  const c = site.cta;
  if (c.show === false) return null;
  return (
    <section className="cta" id="cta">
      <div className="container reveal">
        <h2>{c.title}</h2>
        <p>{c.text}</p>
        <a className="btn btn--light" href={c.button.link}>{c.button.text}</a>
      </div>
    </section>
  );
}
