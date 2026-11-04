import { Link } from 'react-router-dom';
import { ORG_NAME, ORG_PATH, PRODUCT_NAME_PUBLIC, PRODUCT_PATH } from '../../constants/products.js';
import Logo from '../Logo.jsx';
import { COMING_SOON_PATH, WAITLIST_EMAIL } from '../../features/waitlist/waitlist.js';
import { WHATSAPP_CHANNEL_URL } from '../../constants/social.js';
import { LOGIN_PATH, REGISTER_PATH } from '../../features/auth/paths.js';
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
            <p>Focused practice for brighter next chapters. Made for students in OAU. Built by <Link to={ORG_PATH}>{ORG_NAME}</Link>.</p>
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
            <Link to={REGISTER_PATH}>Get started</Link>
            <Link to={LOGIN_PATH}>Log in</Link>
            <Link to={COMING_SOON_PATH}>Join the waitlist</Link>
          </div>
          <div>
            <h4>Products</h4>
            <Link to={PRODUCT_PATH}>{PRODUCT_NAME_PUBLIC}</Link>
            <Link to="/ads">Advertise with TestFlow</Link>
            <Link to="/ads/terms">Advertising terms</Link>
            <Link to="/ads/rules">Ad content rules</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to={ORG_PATH}>{ORG_NAME}</Link>
            <Link to={`${ORG_PATH}#team`}>Meet the team</Link>
            <Link to="/ui-kit">UI Kit</Link>
            <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp channel
            </a>
          </div>
          <div>
            <h4>Support</h4>
            <a href={`mailto:${WAITLIST_EMAIL}`}>Contact us</a>
            <Link to="/help">Help center</Link>
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
