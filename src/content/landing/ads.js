import { ADS_BENEFITS, ADS_FAQS, ADS_PATHS, ADS_STEPS } from '../../features/ads/adsContent.js';
import { ADS_OG_ALT, ADS_OG_IMAGE, ADS_PAGES, buildAdsJsonLd } from '../../features/ads/adsSeo.js';
import { PRODUCT_NAME_PUBLIC, PRODUCT_PATH } from '../../constants/products.js';

void ADS_BENEFITS; // consumed by the AdsWhy custom section

export const adsConfig = {
  id: 'ads',
  seo: { route: '/ads', ...ADS_PAGES['/ads'], image: ADS_OG_IMAGE, imageAlt: ADS_OG_ALT },
  jsonLd: () => buildAdsJsonLd(),
  nav: {
    links: [
      { to: '/ads#how-it-works', label: 'How it works' },
      { to: '/ads#why', label: 'Why TestFlow' },
      { to: '/ads#pricing', label: 'Pricing' },
      { to: '/ads#faq', label: 'FAQs' },
    ],
    loginTo: ADS_PATHS.signin,
    primary: { to: ADS_PATHS.register, label: 'Start advertising' },
  },
  sections: [
    {
      type: 'hero',
      eyebrow: 'TestFlow Ads',
      title: 'Are you looking for where to post ads?',
      accent: 'TestFlow got you covered.',
      lead: 'Reach thousands of Nigerian university students right after they finish a CBT practice session.',
      primary: { label: 'Start advertising', to: ADS_PATHS.register },
      secondary: { label: 'See how it works', to: '/ads#how-it-works' },
      note: 'Every ad is reviewed and clearly labelled Sponsored.',
      visual: 'adsPhone',
    },
    {
      type: 'trust',
      label: 'TestFlow audience',
      items: [
        ['1,300+', 'Students practicing'],
        ['500+', 'Tests completed'],
        ['50+', 'Courses covered'],
        ['1,500+', 'Questions in the bank'],
      ],
    },
    { type: 'howItWorks', id: 'how-it-works', eyebrow: 'Four small steps', title: 'From idea to', accent: 'in front of students.', steps: ADS_STEPS },
    { type: 'custom', component: 'adsWhy' },
    { type: 'custom', component: 'adsPricing' },
    {
      type: 'faq',
      id: 'faq',
      eyebrow: 'A little clarity first',
      title: 'Good questions.',
      accent: 'Clear answers.',
      side: 'Everything you need to know before you post your first ad.',
      link: { to: ADS_PATHS.rules, label: 'Read the ad content rules ↗' },
      faqs: ADS_FAQS,
    },
    {
      type: 'finalCta',
      eyebrow: 'Ready when you are',
      title: 'Put your ad in front of students',
      accent: 'today.',
      text: 'Short copy. Clear button. Real students.',
      cta: { label: 'Start advertising', to: ADS_PATHS.register },
      small: 'Reviewed before it goes live.',
      crossLink: { before: 'Running your own exams?', label: `See ${PRODUCT_NAME_PUBLIC}`, to: PRODUCT_PATH },
    },
  ],
};
