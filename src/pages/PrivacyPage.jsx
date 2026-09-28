import { Link } from 'react-router-dom';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import { buttonClasses } from '../components/ui/buttonClasses.js';

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-muted">{children}</div>
  </section>
);

function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Legal</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-foreground-strong sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted">Last updated: September 28, 2026</p>
        <p className="mt-7 text-base leading-8 text-muted">
          TestFlow is operated by Eddyrus Media and provides CBT practice tools for Obafemi Awolowo University students. This policy explains how we handle personal data when you use TestFlow.
        </p>

        <Section title="Information we collect">
          <p>We collect details you provide when creating or managing an account, such as your name, email address, username, department, level, and matric number where you choose to provide it.</p>
          <p>We also process information needed to provide the service, including your selected courses, practice answers, scores, progress, device/browser information, support messages, and payment-verification records when you use paid features.</p>
        </Section>

        <Section title="How we use information">
          <p>We use information to create and secure your account, deliver CBT practice and results, personalise course access, investigate misuse, process payment verification, improve TestFlow, and communicate important service updates.</p>
        </Section>

        <Section title="Legal basis and data protection">
          <p>Where the Nigeria Data Protection Act 2023 applies, we process personal data to provide the service you request, meet legal obligations, protect TestFlow and its users, or where you have given consent. We apply reasonable technical and organisational safeguards, but no online service can guarantee absolute security.</p>
        </Section>

        <Section title="Sharing and service providers">
          <p>We do not sell personal data. We may share only the information necessary with providers that help us host TestFlow, deliver emails, process or verify payments, store user-uploaded receipts, and protect the service. We may also disclose information where required by law or to protect users, TestFlow, or the public.</p>
        </Section>

        <Section title="Retention and your choices">
          <p>We retain information only for as long as needed for the purposes described here, including account administration, academic progress records, security, and legal obligations. You may request access, correction, deletion, or restriction of eligible personal data by contacting us. Some records may need to be retained where required for security, fraud prevention, or legal compliance.</p>
        </Section>

        <Section title="Cookies and similar technologies">
          <p>TestFlow uses essential browser storage and authentication technologies to keep you signed in, remember preferences, and protect the service. Disabling them may prevent some features from working.</p>
        </Section>

        <Section title="Children and updates">
          <p>TestFlow is intended for university students and applicants. If you believe a child has supplied personal data without appropriate permission, contact us so we can review the request. We may update this policy as TestFlow changes; the latest version will always be published on this page.</p>
        </Section>

        <Section title="Contact">
          <p>For privacy questions or requests, email <a className="font-semibold text-primary hover:underline" href="mailto:feranmioresajo@gmail.com">feranmioresajo@gmail.com</a>.</p>
        </Section>

        <Link to="/register" className={buttonClasses({ size: 'lg', className: 'mt-12' })}>
          Create account
        </Link>
      </article>
      <LandingFooter />
    </div>
  );
}

export default PrivacyPage;
