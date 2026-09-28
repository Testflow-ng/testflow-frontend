import { Link } from 'react-router-dom';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import { buttonClasses } from '../components/ui/buttonClasses.js';

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-muted">{children}</div>
  </section>
);

function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Legal</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-foreground-strong sm:text-5xl">
          Terms and Conditions
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted">Last updated: September 28, 2026</p>
        <p className="mt-7 text-base leading-8 text-muted">
          These Terms govern your use of TestFlow, an OAU CBT practice platform operated by Eddyrus Media. By creating an account or using TestFlow, you agree to these Terms and our Privacy Policy.
        </p>

        <Section title="Using TestFlow">
          <p>TestFlow provides learning and practice tools. It does not guarantee examination results, admission outcomes, course grades, or the accuracy of every question, explanation, or study recommendation. You are responsible for using the platform as a supplement to your own study and official university information.</p>
        </Section>

        <Section title="Accounts and acceptable use">
          <p>Provide accurate account information, keep your login credentials confidential, and promptly notify us if you believe your account has been compromised. You must not share accounts, attempt to access another person’s account, bypass access controls, scrape or copy question banks, interfere with the service, upload harmful content, or use TestFlow for unlawful purposes.</p>
        </Section>

        <Section title="Content and intellectual property">
          <p>TestFlow, its design, branding, question banks, explanations, and software are protected by applicable intellectual-property laws. You receive a limited, personal, non-transferable right to use the platform for study. You retain ownership of content you submit, while granting us permission to process it solely to operate, secure, and improve the service.</p>
        </Section>

        <Section title="Paid features and payment verification">
          <p>Where TestFlow offers paid features, access may be subject to successful payment and verification. Do not submit altered, misleading, or unauthorised payment receipts. Prices, feature availability, and verification requirements may change with notice. Refunds, where applicable, are handled according to the payment terms presented at the time of purchase and applicable law.</p>
        </Section>

        <Section title="Availability and changes">
          <p>We may modify, suspend, or discontinue parts of TestFlow to maintain security, improve the service, or comply with legal requirements. We aim to keep TestFlow available, but do not promise uninterrupted or error-free operation.</p>
        </Section>

        <Section title="Disclaimers and liability">
          <p>To the extent permitted by law, TestFlow is provided on an “as available” basis. Eddyrus Media is not liable for indirect, incidental, special, or consequential losses arising from use of, or inability to use, TestFlow. Nothing in these Terms excludes liability that cannot legally be excluded.</p>
        </Section>

        <Section title="Termination and governing law">
          <p>We may suspend or terminate access where these Terms are breached, security is at risk, or required by law. These Terms are governed by the laws of the Federal Republic of Nigeria, subject to any mandatory consumer or data-protection rights that apply to you.</p>
        </Section>

        <Section title="Contact and changes to these Terms">
          <p>Questions about these Terms can be sent to <a className="font-semibold text-primary hover:underline" href="mailto:hello@testflow.com.ng">hello@testflow.com.ng</a>. We may update these Terms from time to time; continued use after an update means you accept the revised Terms.</p>
        </Section>

        <Link to="/register" className={buttonClasses({ size: 'lg', className: 'mt-12' })}>
          Get started
        </Link>
      </article>
      <LandingFooter />
    </div>
  );
}

export default TermsPage;
