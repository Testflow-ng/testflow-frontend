import { ORG_NAME, ORG_PATH, PRODUCT_NAME_PUBLIC, PRODUCT_PATH } from '../../constants/products.js';
import { WHATSAPP_CHANNEL_URL } from '../../constants/social.js';
import { SITE_URL } from '../../features/ads/adsSeo.js';

const PAGE_URL = `${SITE_URL}${ORG_PATH}`;

// Only people whose public GitHub identity and work are verifiable from the repositories
// (github.com/Testflow-ng/testflow-frontend and testflow-backend). See docs/eddyrus-page-report.md.
export const EDDYRUS_TEAM = [
  {
    name: 'Feranmi Oresajo',
    handle: 'Ferousco-dev',
    role: 'Core lead',
    summary:
      'Leads Testflow. Built the CBT exam runtime, the Flo mascot and the redesigned landing and sign-in experience, and works across backend auth and the Ads Manager.',
    avatar: '/team/feranmi-oresajo.webp',
    github: 'https://github.com/Ferousco-dev',
    links: [{ label: 'Portfolio', href: 'https://feranmi.appmd.dev' }],
  },
  {
    name: 'Owa Edison Eddyrus',
    handle: 'eddyrus',
    role: 'Eddyrus Media',
    summary: 'The name and the person behind Eddyrus Media, the team that operates Testflow.',
    avatar: '/team/default-avatar.svg',
    github: null,
    links: [],
  },
  {
    name: 'Emerald',
    handle: 'Emerald-dev0',
    role: 'Full-stack engineering',
    summary:
      'The most active contributor across both repositories: backend controllers, models and routes, identity verification and uploads, and many of the student-facing features and fixes.',
    avatar: '/team/emerald.webp',
    github: 'https://github.com/Emerald-dev0',
    links: [],
  },
  {
    name: 'Akinrinola Abdulqudus',
    handle: 'abdulqudus',
    role: 'UI/UX designer',
    summary: 'Testflow’s product designer, and the founder of Ecovest.',
    avatar: '/team/default-avatar.svg',
    github: null,
    links: [],
  },
  {
    name: 'XYLARA-TECHS',
    handle: 'XYLARA-TECHS',
    role: 'Core frontend developer',
    summary:
      'Shaped the account-recovery experience, refactoring the verify-email, reset-password and forgot-password screens into cleaner, clearer flows.',
    avatar: '/team/xylara-techs.webp',
    github: 'https://github.com/XYLARA-TECHS',
    links: [],
  },
];

// Add { name, url, logo, description } only for sponsors confirmed by Eddyrus Media. Empty = section hidden.
export const EDDYRUS_SPONSORS = [];

export const EDDYRUS_SEO = {
  route: ORG_PATH,
  title: `${ORG_NAME} | The Team Behind Testflow`,
  description: `${ORG_NAME} operates Testflow, the CBT practice platform for OAU students. Meet the people building it and join the community.`,
  keywords: `${ORG_NAME}, Testflow, Testflow team, OAU CBT practice, CBT practice Nigeria, Testflow community`,
  locale: 'en_NG',
  image: `${SITE_URL}/og-image-eddyrus.png?v=1`,
  imageAlt: `${ORG_NAME}: the team behind Testflow.`,
  noIndex: false,
};

export function buildEddyrusJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${PAGE_URL}#organization`,
        name: ORG_NAME,
        url: PAGE_URL,
        logo: `${SITE_URL}/icons/icon-512.png`,
        brand: { '@type': 'Brand', name: 'TestFlow', url: SITE_URL },
        sameAs: [WHATSAPP_CHANNEL_URL],
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: EDDYRUS_SEO.title,
        description: EDDYRUS_SEO.description,
        inLanguage: 'en-NG',
        isPartOf: { '@type': 'WebSite', name: 'TestFlow', url: SITE_URL },
        about: { '@id': `${PAGE_URL}#organization` },
      },
      { '@type': 'Person', name: 'Feranmi Oresajo', jobTitle: 'Core lead', url: 'https://feranmi.appmd.dev', sameAs: ['https://github.com/Ferousco-dev'] },
      { '@type': 'Person', name: 'Owa Edison Eddyrus' },
      { '@type': 'Person', name: 'Akinrinola Abdulqudus', jobTitle: 'UI/UX designer' },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: ORG_NAME, item: PAGE_URL },
        ],
      },
    ],
  };
}

export const eddyrusConfig = {
  id: 'eddyrus',
  seo: EDDYRUS_SEO,
  jsonLd: buildEddyrusJsonLd,
  nav: {
    links: [
      { to: `${ORG_PATH}#about`, label: 'About' },
      { to: `${ORG_PATH}#builds`, label: 'What we build' },
      { to: `${ORG_PATH}#team`, label: 'Team' },
      { to: `${ORG_PATH}#community`, label: 'Community' },
    ],
    primary: { to: `${ORG_PATH}#team`, label: 'Meet the team' },
  },
  sections: [
    {
      type: 'hero',
      id: 'about',
      eyebrow: ORG_NAME,
      title: 'The people behind',
      accent: 'Testflow.',
      lead: `${ORG_NAME} operates Testflow, the CBT practice platform for OAU students, and builds the products around it.`,
      primary: { label: 'Meet the team', to: `${ORG_PATH}#team` },
      secondary: { label: 'Explore Testflow', to: '/' },
      note: `Testflow is operated by ${ORG_NAME}.`,
      visual: 'org',
      image: null, // set to { src, width, height, alt } when the supplied photo is added
    },
    {
      type: 'linkCards',
      id: 'builds',
      eyebrow: `What ${ORG_NAME} builds`,
      title: 'One team,',
      accent: 'three products.',
      side: 'All three run on the same Testflow platform.',
      items: [
        { icon: 'book', title: 'Testflow CBT', text: 'Timed CBT practice, mock exams and course revision for OAU students.', to: '/', label: 'Explore Testflow' },
        { icon: 'chart', title: 'TestFlow Ads', text: 'Sponsored placements shown to students after a practice session.', to: '/ads', label: 'Advertise with TestFlow' },
        { icon: 'globe', title: PRODUCT_NAME_PUBLIC, text: 'Branded CBT platforms for schools, centres and communities.', to: PRODUCT_PATH, label: `See ${PRODUCT_NAME_PUBLIC}` },
      ],
    },
    {
      type: 'team',
      id: 'team',
      eyebrow: 'Meet the people',
      title: 'Meet the people behind',
      accent: 'Testflow.',
      side: 'The core team and contributors behind Testflow.',
      members: EDDYRUS_TEAM,
    },
    { type: 'sponsors', id: 'sponsors', eyebrow: 'Supporters', title: 'Our sponsors and', accent: 'supporters.', items: EDDYRUS_SPONSORS },
    {
      type: 'finalCta',
      id: 'community',
      eyebrow: 'Stay in the loop',
      title: `Follow ${ORG_NAME} on`,
      accent: 'WhatsApp.',
      text: 'Updates, new features and study tips from the Testflow community.',
      cta: { label: 'Join the WhatsApp channel', href: WHATSAPP_CHANNEL_URL },
      small: 'Opens WhatsApp.',
    },
  ],
};
