import type { SiteConfig } from "@/lib/site-types";
import { Icon } from "../Icon";
import { Photo, SectionHead } from "../ui";

type P = { site: SiteConfig };

export function Services({ site }: P) {
  const s = site.services;
  if (s.show === false || s.items.length === 0) return null;
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHead {...s} />
        <div className="services__grid">
          {s.items.map((item) => (
            <article className="service reveal" key={item.name}>
              <div className="service__icon"><Icon name={item.icon} size={26} /></div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              {item.price && <div className="service__price">{item.price}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About({ site }: P) {
  const a = site.about;
  if (a.show === false) return null;
  return (
    <section className="section section--soft" id="about">
      <div className="container about__grid">
        <div className="about__img reveal">
          <Photo src={a.image} alt={`About ${site.brand.name}`} label="About photo" sizes="(max-width: 820px) 440px, 480px" />
        </div>
        <div className="about__body reveal">
          <SectionHead {...a} center={false} />
          {a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {a.checklist && a.checklist.length > 0 && (
            <ul className="checklist">
              {a.checklist.map((c) => <li key={c}><Icon name="check" size={18} /><span>{c}</span></li>)}
            </ul>
          )}
          {a.button && a.button.text && <a className="btn btn--primary" href={a.button.link}>{a.button.text}</a>}
        </div>
      </div>
    </section>
  );
}

export function Team({ site }: P) {
  const t = site.team;
  if (t.show === false || t.members.length === 0) return null;
  return (
    <section className="section" id="team">
      <div className="container">
        <SectionHead {...t} />
        <div className="team__grid">
          {t.members.map((m) => (
            <div className="member reveal" key={m.name}>
              <div className="member__photo">
                <Photo src={m.photo} alt={m.name} label="Headshot" sizes="(max-width: 820px) 90vw, 360px" />
              </div>
              <h3>{m.name}</h3>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
