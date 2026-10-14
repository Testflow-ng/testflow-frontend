import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import LandingNav from './LandingNav.jsx';
import LandingFooter from './LandingFooter.jsx';
import { REGISTER_PATH } from '../../features/auth/paths.js';
import '../../pages/landing.css';

export function LegalSection({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function LegalLayout({ title, updated, intro, cta, ctaTo = REGISTER_PATH, children }) {
  return (
    <>
      <div className="tfl tfl-page">
        <LandingNav />
        <main className="container legal">
          <p className="eyebrow">Legal</p>
          <h1>{title}</h1>
          <small className="legal-updated">
            {updated === 'Draft' ? 'Draft, pending legal review' : `Last updated: ${updated}`}
          </small>
          <p className="legal-intro">{intro}</p>
          {children}
          <Link to={ctaTo} className="btn btn-primary legal-cta">
            {cta} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default LegalLayout;
