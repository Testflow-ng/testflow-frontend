import { ArrowUpRight, CalendarClock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { FeatureCard, FeatureGrid } from '../marketing/FeatureCard.jsx';
import FaqAccordion from '../marketing/FaqAccordion.jsx';
import SectionHeading from '../marketing/SectionHeading.jsx';
import OrgThemeProvider from './OrgThemeProvider.jsx';
import { cn } from '../../utils/cn.js';

const wrap = 'mx-auto w-full max-w-[64rem] px-5 sm:px-8';
const btn = 'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

/** Public-site blocks. Content is plain text from the SiteConfig; nothing here renders HTML. */
export function HeroBlock({ heading, subheading, imageUrl, cta }) {
  return (
    <section className={cn(wrap, 'grid items-center gap-8 py-14 md:grid-cols-2 md:py-20')}>
      <div>
        <h1 className="font-heading text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-foreground-strong">{heading}</h1>
        {subheading && <p className="mt-4 max-w-[34ch] text-lg leading-relaxed text-muted">{subheading}</p>}
        {cta?.label && (
          <a href={cta.url} className={cn(btn, 'mt-7')}>
            {cta.label} <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
      {imageUrl && <img src={imageUrl} alt="" width="640" height="440" className="aspect-[16/11] w-full rounded-[28px] object-cover" />}
    </section>
  );
}

export function AboutBlock({ title = 'About us', text }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <p className="mt-5 max-w-[62ch] whitespace-pre-line text-[1.05rem] leading-relaxed text-foreground">{text}</p>
    </section>
  );
}

export function FeaturesBlock({ title = 'Why choose us', items = [] }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <FeatureGrid className="mt-8">
        {items.map((f, i) => <FeatureCard key={`${f.title}-${i}`} tone={['lavender', 'sage', 'surface'][i % 3]} title={f.title} text={f.text} />)}
      </FeatureGrid>
    </section>
  );
}

/** "Courses / upcoming exams" list. `exams` is [{ id, title, meta, href }]. */
export function CoursesBlock({ title = 'Available exams', exams = [] }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((e) => (
          <li key={e.id}>
            <a href={e.href ?? '#'} className="flex h-full flex-col gap-1 rounded-[20px] border border-border bg-surface p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="font-heading text-base font-bold text-foreground-strong">{e.title}</span>
              <span className="text-sm text-muted">{e.meta}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary">Start <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          </li>
        ))}
        {exams.length === 0 && <li className="text-muted">No exams are open right now.</li>}
      </ul>
    </section>
  );
}

/** `items` is [{ id, title, text, date }] (staff announcements, newest first). */
export function AnnouncementsBlock({ title = 'Announcements', items = [] }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <ul className="mt-8 space-y-3">
        {items.map((a) => (
          <li key={a.id} className="rounded-[20px] border border-border bg-surface p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><CalendarClock size={14} aria-hidden="true" /> {a.date}</p>
            <h3 className="mt-1 font-heading text-lg font-bold text-foreground-strong">{a.title}</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{a.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FaqBlock({ title = 'Questions', items = [] }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <FaqAccordion className="mt-8" items={items.map((f) => [f.q, f.a])} />
    </section>
  );
}

export function ContactBlock({ title = 'Contact', email, phone, address, whatsapp }) {
  const rows = [
    email && { Icon: Mail, label: email, href: `mailto:${email}` },
    phone && { Icon: Phone, label: phone, href: `tel:${phone}` },
    whatsapp && { Icon: MessageCircle, label: 'Chat on WhatsApp', href: `https://wa.me/${String(whatsapp).replace(/\D/g, '')}` },
    address && { Icon: MapPin, label: address },
  ].filter(Boolean);
  return (
    <section className={cn(wrap, 'py-12')}>
      <SectionHeading title={title} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map(({ Icon, label, href }) => (
          <li key={label} className="flex items-center gap-3 rounded-[20px] border border-border bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon size={18} aria-hidden="true" /></span>
            {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="min-w-0 break-words font-medium text-foreground-strong hover:text-primary hover:underline">{label}</a> : <span className="font-medium text-foreground-strong">{label}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CtaBlock({ heading, text, cta }) {
  return (
    <section className={cn(wrap, 'py-12')}>
      <div className="rounded-[28px] bg-primary px-7 py-10 text-primary-foreground sm:px-12">
        <h2 className="font-heading text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold leading-tight">{heading}</h2>
        {text && <p className="mt-2 max-w-[48ch] opacity-85">{text}</p>}
        {cta?.label && <a href={cta.url} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{cta.label} <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </section>
  );
}

export function FooterBlock({ text, links = [], orgName }) {
  return (
    <footer className="mt-8 border-t border-border bg-surface-strong/60">
      <div className={cn(wrap, 'flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between')}>
        <p>{text ?? `© ${new Date().getFullYear()} ${orgName ?? ''}`}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          {links.map((l) => <a key={l.href} href={l.href} className="hover:text-foreground-strong hover:underline">{l.label}</a>)}
        </nav>
      </div>
    </footer>
  );
}

const MAP = { hero: HeroBlock, about: AboutBlock, features: FeaturesBlock, exams: CoursesBlock, announcements: AnnouncementsBlock, faq: FaqBlock, contact: ContactBlock, cta: CtaBlock };

/**
 * Renders a whole SiteConfig ({ brand, nav, sections[], footer }). `data` supplies live content for blocks that
 * need it: { exams, announcements }. Wrapped in the organisation's theme.
 */
export function SiteRenderer({ config, data = {}, className }) {
  const { brand = {}, nav = [], sections = [], footer } = config;
  return (
    <OrgThemeProvider brand={brand} className={cn('bg-background text-foreground', className)}>
      <header className="border-b border-border bg-surface">
        <div className={cn(wrap, 'flex h-16 items-center justify-between gap-4')}>
          <span className="flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight text-foreground-strong">
            {brand.logoUrl ? <img src={brand.logoUrl} alt="" className="size-8 rounded-lg object-cover" /> : <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">{brand.name?.[0]}</span>}
            {brand.name}
          </span>
          <nav aria-label="Main" className="hidden gap-5 text-sm font-medium text-muted sm:flex">
            {nav.map((n) => <a key={n.label} href={n.href} className="hover:text-foreground-strong">{n.label}</a>)}
          </nav>
        </div>
      </header>
      {sections.map((s, i) => {
        const Block = MAP[s.type];
        if (!Block) return null;
        const extra = s.type === 'exams' ? { exams: data.exams } : s.type === 'announcements' ? { items: data.announcements } : {};
        return <Block key={`${s.type}-${i}`} {...s} {...extra} />;
      })}
      {footer && <FooterBlock {...footer} orgName={brand.name} />}
    </OrgThemeProvider>
  );
}
