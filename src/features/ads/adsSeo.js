import { ADS_FAQS } from './adsContent.js';

export const SITE_URL = 'https://www.testflow.com.ng';
export const ADS_OG_IMAGE = `${SITE_URL}/og-image-ads.png?v=1`;
export const ADS_OG_ALT = 'Are you looking for where to post ads? TestFlow got you covered.';

// Single source of truth for <head> data: used by Seo.jsx at runtime and by the
// build-time prerender (vite.config.js) so crawlers that skip JavaScript see it.
export const ADS_PAGES = {
  '/ads': {
    title: 'Advertise to Nigerian Students | TestFlow Ads',
    description:
      'Post your ad where Nigerian university students study. Pay per day, get reviewed fast and drive WhatsApp clicks from TestFlow CBT practice sessions.',
    keywords:
      'advertise to students Nigeria, student advertising, post ads Nigeria, university ads, OAU students ads, WhatsApp ads, CBT',
    noIndex: false,
  },
  '/ads/terms': {
    title: 'Advertising Terms | TestFlow Ads',
    description: 'Draft advertising terms for TestFlow Ads. Pending legal review.',
    noIndex: false,
  },
  '/ads/rules': {
    title: 'Ad Content Rules | TestFlow Ads',
    description: 'Draft content rules for ads on TestFlow. Pending legal review.',
    noIndex: false,
  },
  '/ads/signin': {
    title: 'Advertiser Sign-in Coming Soon | TestFlow Ads',
    description: 'Advertiser sign-in is coming soon.',
    noIndex: true,
  },
  '/ads/register': {
    title: 'Advertiser Sign-up Coming Soon | TestFlow Ads',
    description: 'Advertiser registration is coming soon.',
    noIndex: true,
  },
};

export function buildAdsJsonLd() {
  const url = `${SITE_URL}/ads`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'TestFlow',
        url: SITE_URL,
        logo: `${SITE_URL}/icons/icon-512.png`,
      },
      {
        '@type': 'Service',
        name: 'TestFlow Ads',
        serviceType: 'Student advertising',
        description: ADS_PAGES['/ads'].description,
        url,
        areaServed: { '@type': 'Country', name: 'Nigeria' },
        provider: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: ADS_FAQS.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Advertise', item: url },
        ],
      },
    ],
  };
}
