import LegalLayout, { LegalSection } from '../components/landing/LegalLayout.jsx';
import { ADS_PATHS } from '../features/ads/adsContent.js';

function AdsRulesPage() {
  return (
    <LegalLayout
      title="Ad Content Rules"
      updated="Draft"
      intro="DRAFT, pending legal review. These rules are a placeholder and may change before launch."
      cta="Start advertising"
      ctaTo={ADS_PATHS.register}
    >
      <LegalSection title="What we accept">
        <p>Honest, legal and student-appropriate ads. Keep copy short: a clear title and one line of description.</p>
      </LegalSection>
      <LegalSection title="What we reject">
        <p>Misleading claims, illegal products or services, exam malpractice offers, adult content, hate or harassment, and anything that imitates TestFlow itself.</p>
      </LegalSection>
      <LegalSection title="Labelling">
        <p>Every ad is clearly labelled Sponsored. Ads link to your WhatsApp chat only.</p>
      </LegalSection>
      <LegalSection title="Review">
        <p>We review every ad before it runs and may remove an ad at any time if it breaks these rules.</p>
      </LegalSection>
    </LegalLayout>
  );
}

export default AdsRulesPage;
