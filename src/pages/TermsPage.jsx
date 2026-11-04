import { REGISTER_CTA_LABEL } from '../features/auth/paths.js';
import LegalLayout, { LegalSection } from '../components/landing/LegalLayout.jsx';

function TermsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      updated="October 19, 2026"
      intro="These Terms govern your use of TestFlow, an OAU CBT practice platform operated by Eddyrus Media. By creating an account or using TestFlow, you agree to these Terms and our Privacy Policy."
      cta={REGISTER_CTA_LABEL}
    >
    <LegalSection title="Using TestFlow">
      <p>TestFlow provides learning and practice tools. It does not guarantee examination results, admission outcomes, course grades, or the accuracy of every question, explanation, or study recommendation. You are responsible for using the platform as a supplement to your own study and official university information.</p>
    </LegalSection>

    <LegalSection title="Accounts and acceptable use">
      <p>Provide accurate account information, keep your login credentials confidential, and promptly notify us if you believe your account has been compromised. You must not share accounts, attempt to access another person’s account, bypass access controls, scrape or copy question banks, interfere with the service, upload harmful content, or use TestFlow for unlawful purposes.</p>
    </LegalSection>

    <LegalSection title="Content and intellectual property">
      <p>TestFlow, its design, branding, question banks, explanations, and software are protected by applicable intellectual-property laws. You receive a limited, personal, non-transferable right to use the platform for study. You retain ownership of content you submit, while granting us permission to process it solely to operate, secure, and improve the service.</p>
    </LegalSection>

    <LegalSection title="Paid features and payment verification">
      <p>Where TestFlow offers paid features, access may be subject to successful payment and verification. Do not submit altered, misleading, or unauthorised payment receipts. Prices, feature availability, and verification requirements may change with notice. Refunds, where applicable, are handled according to the payment terms presented at the time of purchase and applicable law.</p>
    </LegalSection>

    <LegalSection title="Library reading and downloads">
      <p>The Library is one of the most demanding parts of TestFlow. Every book has to be sourced, checked, and prepared for the app, and every page you open and every file you download is served from our own infrastructure.</p>
      <p>We run on modest, low-compute servers. Free and unlimited reading and downloading would let a small number of heavy users slow the Library down or take it offline for everyone else, so reading full books and downloading them are part of the Student Pass. Browsing the shelf, opening a book’s details, saving bookmarks, and keeping your reading progress stay free.</p>
      <p>Your pass pays for the servers, the storage, and the ongoing work of gathering and maintaining the books, and it keeps the Library fast and available for every student who needs it. Library access is for your personal study. Do not scrape, bulk-download, redistribute, or resell Library content, and do not attempt to bypass the access controls that keep the Library running for everyone.</p>
    </LegalSection>

    <LegalSection title="Availability and changes">
      <p>We may modify, suspend, or discontinue parts of TestFlow to maintain security, improve the service, or comply with legal requirements. We aim to keep TestFlow available, but do not promise uninterrupted or error-free operation.</p>
    </LegalSection>

    <LegalSection title="Disclaimers and liability">
      <p>To the extent permitted by law, TestFlow is provided on an “as available” basis. Eddyrus Media is not liable for indirect, incidental, special, or consequential losses arising from use of, or inability to use, TestFlow. Nothing in these Terms excludes liability that cannot legally be excluded.</p>
    </LegalSection>

    <LegalSection title="Termination and governing law">
      <p>We may suspend or terminate access where these Terms are breached, security is at risk, or required by law. These Terms are governed by the laws of the Federal Republic of Nigeria, subject to any mandatory consumer or data-protection rights that apply to you.</p>
    </LegalSection>

    <LegalSection title="Contact and changes to these Terms">
      <p>Questions about these Terms can be sent to <a href="mailto:hello@testflow.com.ng">hello@testflow.com.ng</a>. We may update these Terms from time to time; continued use after an update means you accept the revised Terms.</p>
    </LegalSection>
    </LegalLayout>
  );
}

export default TermsPage;
