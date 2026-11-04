import { Check } from 'lucide-react';
import LandingNav from '../../../components/landing/LandingNav.jsx';
import LandingFooter from '../../../components/landing/LandingFooter.jsx';
import { AUTH_PRODUCTS } from '../paths.js';
import { everybodyConfig } from '../../../content/landing/everybody.js';
import '../../../pages/landing.css';
import './auth.css';

const ADS_NAV = [
  { to: '/ads#how-it-works', label: 'How it works' },
  { to: '/ads#why', label: 'Why TestFlow' },
  { to: '/ads#pricing', label: 'Pricing' },
  { to: '/ads#faq', label: 'FAQs' },
];

/**
 * Shared frame for every auth screen (student and advertiser): landing nav,
 * a form card and a product panel. Pass `product="ads"` for TestFlow Ads.
 */
function AuthShell({ product = 'student', title, accent, subtitle, footer, children }) {
  const cfg = AUTH_PRODUCTS[product];
  const isAds = product === 'ads';
  const isEverybody = product === 'everybody';

  return (
    <>
      <div className="tfl tfl-page">
        <LandingNav
          {...(isAds
            ? { links: ADS_NAV, loginTo: cfg.login, primary: { to: cfg.register, label: 'Start advertising' } }
            : isEverybody
              ? { links: everybodyConfig.nav.links, loginTo: cfg.login, primary: { to: cfg.register, label: 'Create your platform' } }
              : {})}
        />
        <main className="container auth-main">
          <section className="auth-card" aria-labelledby="auth-title">
            <div className="auth-head">
              <h1 id="auth-title">
                {title} {accent && <em>{accent}</em>}
              </h1>
              {subtitle && <p className="lead">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="auth-foot">{footer}</div>}
          </section>
          <aside className={`auth-aside${isAds ? ' is-ads' : ''}`} aria-hidden="true">
            <p className="eyebrow">{cfg.asideEyebrow}</p>
            <h2>
              {cfg.asideTitle} <em>{cfg.asideAccent}</em>
            </h2>
            <ul className="auth-points">
              {cfg.asidePoints.map((point) => (
                <li key={point}>
                  <Check aria-hidden="true" /> {point}
                </li>
              ))}
            </ul>
          </aside>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default AuthShell;
