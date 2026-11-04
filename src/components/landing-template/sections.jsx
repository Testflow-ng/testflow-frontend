import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Minus } from 'lucide-react';
import { ICONS } from './icons.js';
import { BrowserFrame } from './visuals.jsx';
import { VISUALS } from './visualMap.js';
import { formatMoney } from '../../features/landing/format.js';

const Heading = ({ eyebrow, title, accent, side, as: Tag = 'h2' }) => (
  <div className="split-head">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag>
        {title} {accent && <em>{accent}</em>}
      </Tag>
    </div>
    {side && <p className="side">{side}</p>}
  </div>
);

export function Hero({ section }) {
  const Visual = VISUALS[section.visual];
  const img = section.image;
  return (
    <section className="container hero">
      <div className="hero-copy">
        {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
        <h1>
          {section.title} <em>{section.accent}</em>
        </h1>
        <p className="lead">{section.lead}</p>
        <div className="btn-row">
          <Link to={section.primary.to} className="btn btn-primary">
            {section.primary.label} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          {section.secondary && (
            <Link to={section.secondary.to} className="btn btn-ghost">
              {section.secondary.label}
            </Link>
          )}
        </div>
        {section.note && (
          <p className="note">
            <Check size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {section.note}
          </p>
        )}
      </div>
      {img ? (
        <div className="hero-visual hero-photo">
          <img src={img.src} alt={img.alt} width={img.width} height={img.height} fetchPriority="high" />
        </div>
      ) : (
        Visual && <Visual />
      )}
    </section>
  );
}

export function TrustStrip({ section }) {
  return (
    <div className="ticker" role="region" aria-label={section.label}>
      <div className="ticker-track">
        {[0, 1].map((copy) =>
          section.items.map(([value, label]) => (
            <span key={`${copy}-${label}`} aria-hidden={copy === 1 ? 'true' : undefined}>
              <b>{value}</b> {label}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

export function Audience({ section }) {
  return (
    <section id={section.id} className="container section">
      <Heading {...section} />
      <ul className="tpl-grid tpl-audience">
        {section.items.map(({ icon, title, text }) => {
          const Icon = ICONS[icon];
          return (
            <li key={title}>
              {Icon && <Icon size={22} aria-hidden="true" />}
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function HowItWorks({ section }) {
  return (
    <section id={section.id} className="container section">
      <p className="eyebrow">{section.eyebrow}</p>
      <div className="how-head">
        <h2>
          {section.title} <em>{section.accent}</em>
        </h2>
      </div>
      <ol className="steps">
        {section.steps.map(({ title, text }, i) => (
          <li key={title}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Features({ section }) {
  return (
    <section id={section.id} className="container section tpl-features-section">
      <Heading {...section} />
      <ul className="tpl-grid tpl-features">
        {section.items.map(({ icon, title, text }) => {
          const Icon = ICONS[icon];
          return (
            <li key={title}>
              <span className="tpl-ic">{Icon && <Icon size={20} aria-hidden="true" />}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ProductPreview({ section }) {
  return (
    <section id={section.id} className="subjects tpl-preview">
      <div className="container">
        <div className="split-head light">
          <div>
            <p className="eyebrow lime">{section.eyebrow}</p>
            <h2>
              {section.title} {section.accent && <em>{section.accent}</em>}
            </h2>
          </div>
          {section.side && <p className="side">{section.side}</p>}
        </div>
        <BrowserFrame host={section.host} />
      </div>
    </section>
  );
}

export function Plans({ section, plans, planConfig }) {
  const copy = planConfig?.copy ?? {};
  return (
    <section id={section.id} className="container section">
      <Heading {...section} />
      <div className="tpl-plans">
        {plans.map((plan) => {
          const c = copy[plan.key] ?? {};
          const featured = !plan.adsEnabled;
          return (
            <article key={plan.key} className={`tpl-plan${featured ? ' is-featured' : ''}`}>
              {(c.badge || featured) && <span className="tpl-badge">{c.badge ?? 'Ad-free'}</span>}
              <h3>{plan.name}</h3>
              <p className="tpl-price">
                <b>{formatMoney(plan.priceMinor, plan.currency)}</b>
                <span>/ {plan.interval}</span>
              </p>
              <p className="tpl-blurb">{c.blurb}</p>
              <p className={`tpl-ads-note${plan.adsEnabled ? '' : ' is-free'}`}>
                {plan.adsEnabled ? 'Shows sponsored ads to your students' : 'No ads. Ever.'}
              </p>
              <ul>
                {(c.points ?? []).map((point) => (
                  <li key={point}>
                    <Check size={15} aria-hidden="true" /> {point}
                  </li>
                ))}
              </ul>
              <Link to={section.cta?.to ?? '#'} className={`btn ${featured ? 'btn-lime' : 'btn-primary'}`}>
                {c.cta ?? `Choose ${plan.name}`} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ComparisonTable({ section, plans }) {
  if (!section.comparison || plans.length === 0) return null;
  const cell = (ok) =>
    ok ? (
      <span className="tpl-yes">
        <Check size={16} aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="tpl-no">
        <Minus size={16} aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  // Rows are [label, ...values] in plan order of the content file (pro, studio). Align by key.
  const order = ['pro', 'studio'];
  return (
    <section className="container tpl-compare-wrap" aria-label="Plan comparison">
      <div className="tpl-table-scroll">
        <table className="tpl-compare">
          <caption className="sr-only">Compare plans</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {plans.map((p) => (
                <th scope="col" key={p.key}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.comparison.rows.map(([label, ...values]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {plans.map((p) => (
                  <td key={p.key}>{cell(values[Math.max(order.indexOf(p.key), 0)])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Faq({ section }) {
  const [open, setOpen] = useState(() => new Set(section.faqs.map((_, i) => i)));
  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <section id={section.id} className="faq">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">{section.eyebrow}</p>
          <h2>
            {section.title} <em>{section.accent}</em>
          </h2>
          {section.side && <p className="side">{section.side}</p>}
          {section.link && (
            <Link className="link" to={section.link.to}>
              {section.link.label}
            </Link>
          )}
        </div>
        <div className="accordion">
          {section.faqs.map(([q, a], i) => (
            <details
              key={q}
              open={open.has(i)}
              onToggle={(e) => {
                if (e.currentTarget.open !== open.has(i)) toggle(i);
              }}
            >
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ section }) {
  return (
    <section id={section.id} className="container cta-wrap">
      <div className="cta">
        <div>
          <p className="eyebrow lime">{section.eyebrow}</p>
          <h2>
            {section.title} <em>{section.accent}</em>
          </h2>
          {section.text && <p>{section.text}</p>}
        </div>
        <div className="cta-action">
          {section.cta.href ? (
            <a href={section.cta.href} className="btn btn-lime" target="_blank" rel="noopener noreferrer">
              {section.cta.label} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : (
            <Link to={section.cta.to} className="btn btn-lime">
              {section.cta.label} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
          {section.small && <small>{section.small}</small>}
        </div>
      </div>
      {section.crossLink && (
        <p className="tpl-cross">
          {section.crossLink.before} <Link to={section.crossLink.to}>{section.crossLink.label}</Link>
        </p>
      )}
    </section>
  );
}

export function LinkCards({ section }) {
  return (
    <section id={section.id} className="container section">
      <Heading {...section} />
      <ul className="tpl-grid tpl-linkcards">
        {section.items.map(({ icon, title, text, to, label }) => {
          const Icon = ICONS[icon];
          return (
            <li key={title}>
              <span className="tpl-ic">{Icon && <Icon size={20} aria-hidden="true" />}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link to={to} className="tpl-more">
                {label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Team({ section }) {
  return (
    <section id={section.id} className="container section">
      <Heading {...section} />
      <ul className="tpl-team">
        {section.members.map((m) => (
          <li key={m.handle} className="tpl-member">
            {m.avatar ? (
              <img src={m.avatar} alt={`${m.name}, ${m.role}`} width="84" height="84" loading="lazy" decoding="async" />
            ) : (
              <span className="tpl-mono" role="img" aria-label={`${m.name}, ${m.role}`}>
                {m.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </span>
            )}
            <h3>{m.name}</h3>
            <p className="tpl-role">{m.role}</p>
            <p className="tpl-summary">{m.summary}</p>
            <div className="tpl-links">
              {m.github && (
                <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub (opens in a new tab)`}>
                  GitHub <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              )}
              {m.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${m.name}: ${l.label} (opens in a new tab)`}>
                  {l.label} <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Renders nothing until real, confirmed sponsors are added to the content file. */
export function Sponsors({ section }) {
  if (!section.items?.length) return null;
  return (
    <section id={section.id} className="container section">
      <Heading {...section} />
      <ul className="tpl-grid tpl-sponsors">
        {section.items.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.logo ? <img src={s.logo} alt={s.name} loading="lazy" /> : <b>{s.name}</b>}
            </a>
            {s.description && <p>{s.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
