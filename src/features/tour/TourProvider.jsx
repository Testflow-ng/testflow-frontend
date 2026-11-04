import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { TourContext } from './TourContext.js';
import { STUDENT_STEPS } from './steps.js';
import WelcomeModal from './WelcomeModal.jsx';
import TourOverlay from './TourOverlay.jsx';

const keyFor = (user) => `tf_tour_v1_${user?.id ?? 'anon'}`;
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the tour may be offered again next visit */
  }
};

const EXAM = /^\/exam\/[^/]+$/;
// The tour belongs to the signed-in shell. Registration signs the account in
// before the route changes, so without this the offer would be spent on /register.
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

/**
 * Owns the product tour: offers it once to new students, remembers "done" or "skipped", and lets Settings restart it.
 * Completion is stored on this device (there is no server preference for it yet).
 */
function TourProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState('idle'); // idle | welcome | running
  const [gate, setGate] = useState(0);

  // The welcome waits until the username popup has been dealt with.
  useEffect(() => {
    const bump = () => setGate((g) => g + 1);
    window.addEventListener('tf:username-prompt-closed', bump);
    return () => window.removeEventListener('tf:username-prompt-closed', bump);
  }, []);

  const eligible =
    Boolean(isAuthenticated && user && user.role === 'student') &&
    !EXAM.test(location.pathname) &&
    !location.pathname.startsWith('/ui-kit') &&
    !AUTH_PATHS.includes(location.pathname) &&
    // A live join link is time-sensitive; the tour can wait for the dashboard.
    !location.pathname.startsWith('/live');
  const usernameSettled = Boolean(user?.username) || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tf_username_prompt_dismissed') === '1');
  const unseen = eligible && !read(keyFor(user));

  const offerWelcome = mode === 'idle' && unseen && usernameSettled;
  // gate re-renders this component when the username prompt closes
  void gate;

  const finish = useCallback((how) => {
    write(keyFor(user), how);
    setMode('idle');
    // Bump the gate so this re-renders and re-reads the stored answer even
    // when mode was already idle ("Skip for now"), which would otherwise
    // leave the welcome modal open.
    setGate((g) => g + 1);
  }, [user]);

  const start = useCallback(() => setMode('running'), []);
  const value = useMemo(() => ({ start, active: mode === 'running' }), [start, mode]);

  return (
    <TourContext.Provider value={value}>
      {children}
      <WelcomeModal open={offerWelcome || mode === 'welcome'} onStart={start} onSkip={() => finish('skipped')} />
      {mode === 'running' && <TourOverlay steps={STUDENT_STEPS} onEnd={(how) => finish(how)} />}
    </TourContext.Provider>
  );
}

export default TourProvider;
