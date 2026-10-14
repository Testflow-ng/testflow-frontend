import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import AppSidebar from '../components/AppSidebar.jsx';
import TourProvider from '../features/tour/TourProvider.jsx';
import UsernamePrompt from '../components/UsernamePrompt.jsx';
import { cn } from '../utils/cn.js';
import BottomNav from '../components/BottomNav.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import NightOwlPopup from '../components/NightOwlPopup.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import { ORG_PATH, PRODUCT_PATH } from '../constants/products.js';
import Seo from '../components/Seo.jsx';

const LANDING_PATHS = ['/', '/coming-soon', '/privacy', '/terms', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const isLandingPath = (p) => LANDING_PATHS.includes(p) || p === '/ads' || p.startsWith('/ads/') || p === ORG_PATH || p === PRODUCT_PATH || p.startsWith(`${PRODUCT_PATH}/`);
const EXAM_PATTERN = /^\/exam\/[^/]+$/;

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const isLanding = isLandingPath(location.pathname);
  const isExamPage = EXAM_PATTERN.test(location.pathname);
  // The UI Kit brings its own sidebar (same design) and no site header.
  const isKit = location.pathname.startsWith('/ui-kit');
  // Signed-in desktop gets the sidebar; phones keep the header and bottom bar.
  const showSidebar = isAuthenticated && !isLoading && !isExamPage && !isLanding && !isKit;

  return (
    <TourProvider>
    <div
      className={cn(
        'relative flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary',
        (showSidebar || isKit) && 'lg:pl-[var(--sidebar-w)]',
      )}
    >
      <Seo />
      {showSidebar && <AppSidebar />}
      {!isExamPage && !isLanding && !isKit && (
        <div className={showSidebar ? 'contents lg:hidden' : 'contents'}>
          <Header />
        </div>
      )}
      <OfflineBanner />
      {isAuthenticated && !isExamPage && !isKit && <UsernamePrompt />}

      <main className="flex flex-1 flex-col">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </main>

      {isAuthenticated && !isLoading && !isExamPage && !isKit && <BottomNav />}
      {isAuthenticated && !isLoading && !isExamPage && <NightOwlPopup />}
    </div>
    </TourProvider>
  );
}

export default RootLayout;
