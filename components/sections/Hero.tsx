import { site } from "@/site.config";
import { Icon } from "../Icon";
import { Photo } from "../ui";

export function Announcement() {
  const a = site.announcement;
  if (a.show === false) return null;
  return (
    <div className="announcement">
      {a.text}
      {a.linkText && <a href={a.link}>{a.linkText} →</a>}
    </div>
  );
}

export function Hero() {
  const h = site.hero;
  return (
    <section className="hero" id="hero">
      <div className="container hero__grid">
        <div className="reveal">
          {h.eyebrow && <span className="eyebrow">{h.eyebrow}</span>}
          <h1>{h.headline}</h1>
          <p className="hero__sub">{h.subheadline}</p>
          <div className="hero__buttons">
            {h.primaryButton && <a className="btn btn--primary" href={h.primaryButton.link}>{h.primaryButton.text}</a>}
            {h.secondaryButton && <a className="btn btn--ghost" href={h.secondaryButton.link}>{h.secondaryButton.text}</a>}
          </div>
          {h.rating && (
            <div className="hero__rating">
              <span className="stars">★★★★★</span>
              <span><strong>{h.rating.score}</strong> {h.rating.label}</span>
            </div>
          )}
        </div>
        <div className="hero__media reveal">
          <div className="hero__img">
            <Photo src={h.image} alt={site.brand.name} label="Hero photo" sizes="(max-width: 820px) 440px, 520px" priority />
          </div>
          {h.badge && <div className="hero__badge"><Icon name="shield" /><span>{h.badge}</span></div>}
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  if (site.stats.show === false) return null;
  return (
    <section className="stats" id="stats">
      <div className="container stats__grid">
        {site.stats.items.map((s) => (
          <div className="stat reveal" key={s.label}>
            <div className="stat__num">{s.number}</div>
            <div className="stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
