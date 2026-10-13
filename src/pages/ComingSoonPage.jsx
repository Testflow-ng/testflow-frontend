import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import WaitlistForm from '../features/waitlist/WaitlistForm.jsx';
import './landing.css';

function ComingSoonPage() {
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
              We’re working on <em>something great.</em>
            </h1>
            <p className="lead">
              Accounts aren’t open just yet. Join the waitlist to be notified when we launch.
            </p>
            <WaitlistForm />
            <Link to="/" className="soon-back">
              ← Back to home
            </Link>
          </section>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default ComingSoonPage;
