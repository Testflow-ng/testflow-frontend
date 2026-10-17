import { Link } from 'react-router-dom';
import LegalLayout, { LegalSection } from '../components/landing/LegalLayout.jsx';
import { REGISTER_CTA_LABEL, REGISTER_PATH } from '../features/auth/paths.js';
import { useAuth } from '../features/auth/useAuth.js';
import { WHATSAPP_CHANNEL_URL } from '../constants/social.js';

/**
 * The Help center.
 *
 * One page, no search: TestFlow is a small product and every answer here is a step someone
 * takes in a screen that already exists. It is public .a student who cannot sign in needs it
 * most .so it lives with the legal pages, and the call to action changes for a signed-in
 * reader (send feedback) versus a stranger (create an account).
 */
function HelpCenterPage() {
  const { isAuthenticated } = useAuth();

  return (
    <LegalLayout
      eyebrow="Support"
      title="Help center"
      intro="How to practise, where your results live, and what to do when something looks wrong. If the answer is not here, send it to us .it goes straight to the team."
      cta={isAuthenticated ? 'Send us feedback' : REGISTER_CTA_LABEL}
      ctaTo={isAuthenticated ? '/settings/feedback' : REGISTER_PATH}
    >
      <LegalSection title="Getting started">
        <p>
          An account gives you practice papers, saved results, the library, and Live CBT. Once you are in,
          open <Link to="/courses">Courses</Link> and pin the courses you are taking .pinned courses are the
          ones that appear on your dashboard and in the sidebar, so you stop hunting for them.
        </p>
        <p>
          Your dashboard shows what to practise next, your recent scores, and where you left off. It is the
          first thing to check when you are not sure what to do.
        </p>
      </LegalSection>

      <LegalSection title="Sitting a paper">
        <p>
          Pick a course, then start a practice paper. The timer is kept by the server, so it stays honest
          even if your screen locks or your connection drops for a moment .you cannot gain time by
          reloading. Answers save as you go, which means you can leave a paper and come back to exactly
          where you stopped.
        </p>
        <p>
          The <b>flag</b> button marks a question to come back to. It is your own private reminder while you
          sit the paper and it is cleared when you submit .it is not sent to anyone. Use the question
          palette to jump between questions, and the bookmarks list at the end of the paper to see what you
          have left unanswered.
        </p>
        <p>
          A calculator appears on papers that allow one. Where a paper does not, the button is not shown —
          that is the exam setting, not a fault.
        </p>
      </LegalSection>

      <LegalSection title="After the paper">
        <p>
          Submitting takes you to your score and the corrections: every question, what you chose, and what was
          correct, with an explanation. Use the filters to look at only the ones you got wrong or skipped —
          those are the ones worth reading.
        </p>
        <p>
          The performance report is a printable sheet. Open it and use your browser&apos;s <b>Print</b> and
          choose <b>Save as PDF</b> to keep a copy or send it to someone. There is no separate download:
          printing is the download.
        </p>
      </LegalSection>

      <LegalSection title="Saved questions and sharing">
        <p>
          The bookmark button on any question .in a paper, or in your corrections .saves it to{' '}
          <b>Profile → Saved questions</b>, complete with the answer and the explanation. That list is for
          studying later, and each saved question can be shared as a link that opens the question for
          whoever you send it to.
        </p>
        <p>
          A shared result link previews with your score card in WhatsApp, Telegram, or X, because the link is
          served with an image the app itself generates. Anyone who opens it sees the score and the subject,
          and nothing else about your account.
        </p>
      </LegalSection>

      <LegalSection title="The library">
        <p>
          <Link to="/library">Library</Link> holds the reading material for your courses. Open a book to read
          it, and your page is remembered .the Library list will offer to continue where you stopped.
        </p>
      </LegalSection>

      <LegalSection title="Something is broken">
        <p>
          There are two different buttons, and they go to different people. If a <b>question</b> is wrong —
          the answer key, a typo, a formula that did not render .use the report button on that question, in
          the paper or in your corrections. Those land in a review queue and are checked against the question
          bank.
        </p>
        <p>
          If something about <b>TestFlow itself</b> is not right .a screen that failed, a score that looks
          impossible, a page that will not load .send it from{' '}
          <Link to="/settings/feedback">Settings → Feedback</Link>. Tell us what you were doing and what you
          expected instead; that is usually enough to reproduce it. You can rate TestFlow with the stars at
          the same time, and you will see the status of everything you sent, with our reply, on that same
          page.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          <Link to="/settings">Settings</Link> holds your preferences: notifications, dark mode, and the links
          to your profile and password. Your data is handled as described in our{' '}
          <Link to="/privacy">Privacy Policy</Link>, and you can write to us about it at any time.
        </p>
      </LegalSection>

      <LegalSection title="Still stuck">
        <p>
          Email <a href="mailto:hello@testflow.com.ng">hello@testflow.com.ng</a> with your matric number and
          what you were trying to do, or ask in the{' '}
          <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            WhatsApp channel
          </a>
          . We answer both.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

export default HelpCenterPage;
