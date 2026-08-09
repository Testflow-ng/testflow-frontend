import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import NightOwlPopup from '../components/NightOwlPopup.jsx';
import { useAuth } from '../features/auth/useAuth.js';

const EXAM_PATTERN = /^\/exam\/[^/]+$/;

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const isExamPage = EXAM_PATTERN.test(location.pathname);

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {!isExamPage && <Header />}
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
