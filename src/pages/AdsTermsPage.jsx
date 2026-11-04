import LegalLayout, { LegalSection } from '../components/landing/LegalLayout.jsx';
import { ADS_PATHS } from '../features/ads/adsContent.js';

function AdsTermsPage() {
  return (
    <LegalLayout
      title="Advertising Terms"
      updated="Draft"
      intro="DRAFT, pending legal review. These terms are a placeholder and are not yet binding. They describe how advertising on TestFlow is intended to work."
      cta="Start advertising"
      ctaTo={ADS_PATHS.register}
    >
      <LegalSection title="Reviews and approval">
        <p>Every ad is reviewed before it goes live. Payment does not guarantee approval, and we may reject or remove an ad that breaks the ad content rules.</p>
      </LegalSection>
      <LegalSection title="Pricing and duration">
        <p>Campaigns are charged per day. An ad runs for the days paid for, then stops. Prices shown on the website are estimates; the final price is confirmed at checkout.</p>
      </LegalSection>
      <LegalSection title="Republishing">
        <p>Expired campaigns stay visible in your dashboard for 7 days so you can republish them.</p>
      </LegalSection>
      <LegalSection title="Data">
        <p>Advertisers receive aggregate analytics only (impressions, clicks, CTR and WhatsApp clicks). No student identities are shared.</p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>Questions? Email <a href="mailto:hello@testflow.com.ng">hello@testflow.com.ng</a>.</p>
      </LegalSection>
    </LegalLayout>
  );
}

export default AdsTermsPage;
