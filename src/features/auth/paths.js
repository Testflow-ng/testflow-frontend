/**
 * Auth is built but gated. While `VITE_AUTH_ENABLED` is not "true", every
 * sign-in / sign-up entry point resolves to the waitlist page instead, so the
 * redesigned auth screens exist "under the hood" without being reachable.
 */
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';

export const WAITLIST_PATH = '/coming-soon';
export const LOGIN_PATH = AUTH_ENABLED ? '/login' : WAITLIST_PATH;
export const REGISTER_PATH = AUTH_ENABLED ? '/register' : WAITLIST_PATH;
export const REGISTER_CTA_LABEL = AUTH_ENABLED ? 'Create account' : 'Join the waitlist';

// TestFlow Ads has its own entry paths; the router decides what renders there.
export const ADS_AUTH_PATHS = {
  login: '/ads/signin',
  register: '/ads/register',
  dashboard: '/ads/dashboard',
};

export const EVERYBODY_AUTH_PATHS = {
  login: '/everybody/signin',
  register: '/everybody/register',
  dashboard: '/everybody/dashboard',
};

export const AUTH_PRODUCTS = {
  student: {
    key: 'student',
    login: '/login',
    register: '/register',
    forgot: '/forgot-password',
    afterLogin: '/dashboard',
    afterRegister: '/setup',
    asideEyebrow: 'Made for university students',
    asideTitle: 'Small steps.',
    asideAccent: 'Real confidence.',
    asidePoints: ['Practise your courses in short CBT sessions', 'See what is clicking and what needs work', 'Free to join, ready on your phone'],
  },
  ads: {
    key: 'ads',
    login: ADS_AUTH_PATHS.login,
    register: ADS_AUTH_PATHS.register,
    forgot: '/forgot-password',
    afterLogin: ADS_AUTH_PATHS.dashboard,
    afterRegister: ADS_AUTH_PATHS.dashboard,
    asideEyebrow: 'TestFlow Ads',
    asideTitle: 'Reach students',
    asideAccent: 'while they study.',
    asidePoints: ['Pay per day, only for the days you run', 'Every ad is reviewed and labelled Sponsored', 'Impressions, clicks, CTR and WhatsApp clicks'],
  },
  everybody: {
    key: 'everybody',
    label: 'Testflow for Everyone',
    login: EVERYBODY_AUTH_PATHS.login,
    register: EVERYBODY_AUTH_PATHS.register,
    forgot: '/forgot-password',
    afterLogin: EVERYBODY_AUTH_PATHS.dashboard,
    afterRegister: EVERYBODY_AUTH_PATHS.login,
    asideEyebrow: 'Testflow for Everyone',
    asideTitle: 'Your platform,',
    asideAccent: 'your brand.',
    asidePoints: ['Your own site at yourname.testflow.com.ng', 'Create exams and invite your students', 'Pro with ads or Studio ad-free'],
  },
};
