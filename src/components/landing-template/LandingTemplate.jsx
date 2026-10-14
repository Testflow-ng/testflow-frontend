import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LandingNav from '../landing/LandingNav.jsx';
import LandingFooter from '../landing/LandingFooter.jsx';
import { useLandingPlans } from '../../features/landing/usePlans.js';
import AdsWhy from '../landing-ads/AdsWhy.jsx';
import AdsPricing from '../landing-ads/AdsPricing.jsx';
import { Audience, ComparisonTable, Faq, Features, FinalCta, Hero, HowItWorks, LinkCards, Plans, ProductPreview, Sponsors, Team, TrustStrip } from './sections.jsx';
import '../../pages/landing.css';
import '../../pages/ads.css';
import './template.css';

// Section registry: add a component here to make a new `type` available to every landing page.
const SECTIONS = {
  hero: Hero,
  trust: TrustStrip,
  audience: Audience,
  howItWorks: HowItWorks,
  features: Features,
  preview: ProductPreview,
  plans: Plans,
  faq: Faq,
  finalCta: FinalCta,
  linkCards: LinkCards,
  team: Team,
  sponsors: Sponsors,
};
const CUSTOM = { adsWhy: AdsWhy, adsPricing: AdsPricing };

/** Renders a whole landing page from a plain config object (see src/content/landing/README.md). */
function LandingTemplate({ config }) {
  const { hash } = useLocation();
  const plans = useLandingPlans(config.plans);

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  // Same JSON-LD the prerendered head ships; refreshed here when live plan prices load.
  useEffect(() => {
    if (!config.jsonLd) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.landingJsonld = config.id;
    script.textContent = JSON.stringify(config.jsonLd(plans));
    document.head.appendChild(script);
    return () => script.remove();
  }, [config, plans]);

  return (
    <>
      <div className="tfl tfl-page">
        <LandingNav {...config.nav} />
        <main>
          {config.sections.map((section, i) => {
            if (section.type === 'custom') {
              const Custom = CUSTOM[section.component];
              return Custom ? <Custom key={`${section.component}-${i}`} /> : null;
            }
            const Section = SECTIONS[section.type];
            if (!Section) return null;
            const node = <Section key={`${section.type}-${i}`} section={section} plans={plans} planConfig={config.plans} />;
            return section.type === 'plans' ? [node, <ComparisonTable key={`cmp-${i}`} section={section} plans={plans} />] : node;
          })}
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default LandingTemplate;
