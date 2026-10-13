import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';
import { COMING_SOON_PATH, WAITLIST_EMAIL } from '../../features/waitlist/waitlist.js';
import '../../pages/landing.css';

function LandingFooter() {
  return (
    <div className="tfl">
      <footer className="container footer">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo" aria-label="Testflow home">
              <Logo size={28} withWordmark={false} />
              Testflow
            </Link>
            <p>Focused practice for brighter next chapters. Made for students in OAU.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/#approach">Our approach</Link>
            <Link to="/#subjects">Courses</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#faq">FAQs</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to={COMING_SOON_PATH}>Get started</Link>
            <Link to={COMING_SOON_PATH}>Log in</Link>
            <Link to={COMING_SOON_PATH}>Join the waitlist</Link>
          </div>
          <div>
            <h4>Support</h4>
            <a href={`mailto:${WAITLIST_EMAIL}`}>Contact us</a>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of use</Link>
          </div>
        </div>
        <div className="footer-bar">
          <span>© {new Date().getFullYear()} Testflow. All rights reserved.</span>
          <span>Small steps. Real confidence.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingFooter;
