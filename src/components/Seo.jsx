import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EDDYRUS_SEO } from '../content/landing/eddyrus.js';
import { EVERYBODY_EXTRA_PAGES, EVERYBODY_SEO } from '../content/landing/everybody.js';
import { ADS_OG_ALT, ADS_OG_IMAGE, ADS_PAGES } from '../features/ads/adsSeo.js';

const SITE_URL = 'https://www.testflow.com.ng';
const MAIN_OG_IMAGE = `${SITE_URL}/og-image.png?v=1`;
const MAIN_OG_ALT = 'Have you studied today? Testflow.';

const PAGES = {
  [EDDYRUS_SEO.route]: EDDYRUS_SEO,
  [EVERYBODY_SEO.route]: EVERYBODY_SEO,
  ...Object.fromEntries(
    Object.entries(EVERYBODY_EXTRA_PAGES).map(([path, page]) => [path, { ...page, image: EVERYBODY_SEO.image, imageAlt: EVERYBODY_SEO.imageAlt }]),
  ),
  ...Object.fromEntries(
    Object.entries(ADS_PAGES).map(([path, page]) => [path, { ...page, image: ADS_OG_IMAGE, imageAlt: ADS_OG_ALT }]),
  ),
  '/': {
    title: 'TestFlow | OAU CBT Practice for Obafemi Awolowo University Students',
    description:
      'TestFlow is the OAU CBT practice platform for Obafemi Awolowo University students. Practise courses, timed tests, mock exams, and past-question style quizzes.',
  },
  '/privacy': {
    title: 'Privacy Policy | TestFlow OAU CBT Practice',
    description: 'Read how TestFlow collects, uses, protects, and manages personal data for OAU CBT practice.',
  },
  '/terms': {
    title: 'Terms and Conditions | TestFlow OAU CBT Practice',
    description: 'Read the terms for using TestFlow, the OAU CBT practice platform.',
  },
  '/help': {
    title: 'Help Center | TestFlow OAU CBT Practice',
    description:
      'How to practise on TestFlow, where your results and saved questions live, and what to do when something looks wrong.',
  },
  '/coming-soon': {
    title: 'Coming Soon | Join the Testflow Waitlist',
    description: 'Testflow accounts are opening soon. Join the waitlist to be notified when we launch.',
    noIndex: true,
  },
  '/forgot-password': {
    title: 'Reset your password | TestFlow',
    description: 'Manage access to your TestFlow account.',
    noIndex: true,
  },
  '/reset-password': {
    title: 'Set a new password | TestFlow',
    description: 'Manage access to your TestFlow account.',
    noIndex: true,
  },
  '/verify-email': {
    title: 'Verify your email | TestFlow',
    description: 'Manage access to your TestFlow account.',
    noIndex: true,
  },
  '/register': {
    title: 'Create a TestFlow Account | OAU CBT Practice',
    description: 'Create a TestFlow account to begin OAU CBT practice.',
    noIndex: true,
  },
  '/login': {
    title: 'Sign In to TestFlow | OAU CBT Practice',
    description: 'Sign in to your TestFlow account to continue OAU CBT practice.',
    noIndex: true,
  },
};

const DEFAULT_PAGE = {
  title: 'TestFlow | OAU CBT Practice',
  description: 'TestFlow is an OAU CBT practice platform for Obafemi Awolowo University students.',
  noIndex: true,
};

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGES[pathname] || DEFAULT_PAGE;
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    const image = page.image || MAIN_OG_IMAGE;
    const imageAlt = page.imageAlt || MAIN_OG_ALT;

    document.title = page.title;
    setMeta('meta[name="description"]', { name: 'description', content: page.description });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description });
    setMeta('meta[property="og:locale"]', { property: 'og:locale', content: page.locale || 'en_NG' });
    document.documentElement.lang = 'en-NG';
    setMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: page.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalUrl);
  }, [pathname]);

  return null;
}

export default Seo;
