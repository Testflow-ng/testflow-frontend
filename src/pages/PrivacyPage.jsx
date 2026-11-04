import { REGISTER_CTA_LABEL } from '../features/auth/paths.js';
import LegalLayout, { LegalSection } from '../components/landing/LegalLayout.jsx';

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="October 19, 2026"
      intro="TestFlow is operated by Eddyrus Media and provides CBT practice tools for Obafemi Awolowo University students. This policy explains how we handle personal data when you use TestFlow."
      cta={REGISTER_CTA_LABEL}
    >
    <LegalSection title="Information we collect">
      <p>We collect details you provide when creating or managing an account, such as your name, email address, username, department, level, and matric number where you choose to provide it.</p>
      <p>We also process information needed to provide the service, including your selected courses, practice answers, scores, progress, device/browser information, support messages, and payment-verification records when you use paid features.</p>
    </LegalSection>

    <LegalSection title="How we use information">
      <p>We use information to create and secure your account, deliver CBT practice and results, personalise course access, investigate misuse, process payment verification, improve TestFlow, and communicate important service updates.</p>
    </LegalSection>

    <LegalSection title="Library activity">
      <p>When you use the Library, we record the books you open, the pages you reach, your bookmarks, and your download requests. We use this to keep your place across devices, to apply fair use so a few heavy downloads cannot slow the Library down for everyone, and to understand which titles are worth adding next. Downloads are served through short-lived links that expire on their own.</p>
    </LegalSection>

    <LegalSection title="Legal basis and data protection">
      <p>Where the Nigeria Data Protection Act 2023 applies, we process personal data to provide the service you request, meet legal obligations, protect TestFlow and its users, or where you have given consent. We apply reasonable technical and organisational safeguards, but no online service can guarantee absolute security.</p>
    </LegalSection>

    <LegalSection title="Sharing and service providers">
      <p>We do not sell personal data. We may share only the information necessary with providers that help us host TestFlow, deliver emails, process or verify payments, store user-uploaded receipts, and protect the service. We may also disclose information where required by law or to protect users, TestFlow, or the public.</p>
    </LegalSection>

    <LegalSection title="Retention and your choices">
      <p>We retain information only for as long as needed for the purposes described here, including account administration, academic progress records, security, and legal obligations. You may request access, correction, deletion, or restriction of eligible personal data by contacting us. Some records may need to be retained where required for security, fraud prevention, or legal compliance.</p>
    </LegalSection>

    <LegalSection title="Cookies and similar technologies">
      <p>TestFlow uses essential browser storage and authentication technologies to keep you signed in, remember preferences, and protect the service. Disabling them may prevent some features from working.</p>
    </LegalSection>

    <LegalSection title="Children and updates">
      <p>TestFlow is intended for university students and applicants. If you believe a child has supplied personal data without appropriate permission, contact us so we can review the request. We may update this policy as TestFlow changes; the latest version will always be published on this page.</p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>For privacy questions or requests, email <a href="mailto:hello@testflow.com.ng">hello@testflow.com.ng</a>.</p>
    </LegalSection>
    </LegalLayout>
  );
}

export default PrivacyPage;
