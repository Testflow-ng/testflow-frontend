import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import WaitlistForm from '../features/waitlist/WaitlistForm.jsx';
import './landing.css';

function ComingSoonPage({
  title = 'We’re working on',
  accent = 'something great.',
  lead = 'Accounts aren’t open just yet. Join the waitlist to be notified when we launch.',
  backTo = '/',
  backLabel = '← Back to home',
}) {
  return (
    <>
      <div className="tfl tfl-page-top">
        <LandingNav />
        <main className="container soon">
          <section className="soon-card" aria-labelledby="soon-title">
            <p className="soon-badge">
              <Sparkles size={12} aria-hidden="true" /> Coming soon
            </p>
            <h1 id="soon-title">
              {title} <em>{accent}</em>
            </h1>
            <p className="lead">{lead}</p>
            <WaitlistForm />
            <Link to={backTo} className="soon-back">
              {backLabel}
            </Link>
          </section>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default ComingSoonPage;
