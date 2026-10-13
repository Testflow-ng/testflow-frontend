import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import NightOwlPopup from '../components/NightOwlPopup.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import Seo from '../components/Seo.jsx';

const LANDING_PATHS = ['/', '/coming-soon', '/privacy', '/terms'];
const EXAM_PATTERN = /^\/exam\/[^/]+$/;

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const isLanding = LANDING_PATHS.includes(location.pathname);
  const isExamPage = EXAM_PATTERN.test(location.pathname);

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Seo />
      {!isExamPage && !isLanding && <Header />}
      <OfflineBanner />

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

      {isAuthenticated && !isLoading && !isExamPage && <BottomNav />}
      {isAuthenticated && !isLoading && !isExamPage && <NightOwlPopup />}
    </div>
  );
}

export default RootLayout;
