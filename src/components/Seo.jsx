import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://testflow.com.ng';

const PAGES = {
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

    document.title = page.title;
    setMeta('meta[name="description"]', { name: 'description', content: page.description });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description });
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
