import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import LandingNav from './LandingNav.jsx';
import LandingFooter from './LandingFooter.jsx';
import { COMING_SOON_PATH } from '../../features/waitlist/waitlist.js';
import '../../pages/landing.css';

export function LegalSection({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function LegalLayout({ title, updated, intro, cta, children }) {
  return (
    <>
      <div className="tfl tfl-page">
        <LandingNav />
        <main className="container legal">
          <p className="eyebrow">Legal</p>
          <h1>{title}</h1>
          <small className="legal-updated">Last updated: {updated}</small>
          <p className="legal-intro">{intro}</p>
          {children}
          <Link to={COMING_SOON_PATH} className="btn btn-primary legal-cta">
            {cta} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default LegalLayout;
