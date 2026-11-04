import { PRODUCT_NAME_PUBLIC, PRODUCT_PATH } from '../../constants/products.js';
import { SITE_URL } from '../../features/ads/adsSeo.js';

// Pure data (no JSX) so the build-time prerender can reuse the SEO block and FAQ.
export const EVERYBODY_API_BASE = '/api/everybody'; // may become /api/v1/everybody
export const EVERYBODY_PLANS_PATH = `${EVERYBODY_API_BASE}/plans`;

// Shown only until GET /api/everybody/plans exists (or if it fails).
export const EVERYBODY_FALLBACK_PLANS = [
  { key: 'pro', name: 'Pro', priceMinor: 700000, currency: 'NGN', interval: 'month', adsEnabled: true, available: true },
  { key: 'studio', name: 'Studio', priceMinor: 2000000, currency: 'NGN', interval: 'month', adsEnabled: false, available: true },
];

const PLAN_COPY = {
  pro: {
    blurb: 'Your branded platform and dashboard. Sponsored ads may appear to your students after they finish a session.',
    points: ['Your own site at yourname.testflow.com.ng', 'No-code website builder', 'Question banks and timed exams', 'Automatic marking and results'],
    cta: 'Choose Pro',
  },
  studio: {
    blurb: 'Everything in Pro, completely ad-free. Your students never see third-party ads.',
    points: ['Everything in Pro', 'No ads, ever', 'Best for schools and paid courses', 'Your brand, uninterrupted'],
    cta: 'Choose Studio',
    badge: 'Ad-free',
  },
};

export const EVERYBODY_FAQS = [
  ['Do I need to code?', 'No. You pick a plan, add your name, logo and colours, and build your site with simple blocks. Everything is point and click.'],
  ['Can I use my own domain?', 'Yes. Every organisation gets a site at yourname.testflow.com.ng, and you can connect your own domain when you are ready.'],
  ['Is my students’ data separate from other organisations?', 'Yes. Each organisation’s students, exams and results are kept separate. Other organisations cannot see them.'],
  ['What happens if my subscription expires?', 'Your data is kept. Your workspace becomes read-only until you renew, so nothing is lost.'],
  ['Why does Pro show ads and Studio doesn’t?', 'Pro is priced low because sponsored ads may appear to your students after they finish a session. Studio costs more and is completely ad-free.'],
  ['Can I switch plans?', 'Yes. You can move between Pro and Studio when you need to.'],
  ['Which devices work?', 'Phones, tablets and laptops. Your students use a normal browser, with no app to install.'],
];

const NAME = PRODUCT_NAME_PUBLIC;
const PAGE_URL = `${SITE_URL}${PRODUCT_PATH}`;

export const EVERYBODY_SEO = {
  route: PRODUCT_PATH,
  title: `Create Your Own CBT Website | ${NAME}`,
  description:
    'Launch your own branded CBT platform in minutes. Your name, colours, exams and students. No coding. Plans from ₦7,000 a month for schools and tutorial centres.',
  keywords:
    'CBT software Nigeria, create CBT website, online exam platform for schools Nigeria, white-label CBT, CBT for tutorial centres, JAMB CBT software, school exam software, online test platform, no-code exam website',
  locale: 'en_NG',
  image: `${SITE_URL}/og-image-everybody.png?v=1`,
  imageAlt: `Introducing ${NAME}. Your own branded CBT platform.`,
  noIndex: false,
};

export const EVERYBODY_EXTRA_PAGES = {
  [`${PRODUCT_PATH}/signin`]: {
    title: `Sign in coming soon | ${NAME}`,
    description: `Sign-in for ${NAME} is coming soon.`,
    noIndex: true,
  },
  [`${PRODUCT_PATH}/register`]: {
    title: `Create your platform, coming soon | ${NAME}`,
    description: `Registration for ${NAME} is coming soon.`,
    noIndex: true,
  },
};

const money = (minor) => minor / 100;

export function buildEverybodyJsonLd(plans = EVERYBODY_FALLBACK_PLANS) {
  const offers = plans
    .filter((p) => p.available !== false)
    .map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: String(money(p.priceMinor)),
      priceCurrency: p.currency,
      availability: 'https://schema.org/InStock',
      url: PAGE_URL,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(money(p.priceMinor)),
        priceCurrency: p.currency,
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: 'MON',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      },
    }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'TestFlow', url: SITE_URL, logo: `${SITE_URL}/icons/icon-512.png` },
      {
        '@type': 'SoftwareApplication',
        name: NAME,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description: EVERYBODY_SEO.description,
        url: PAGE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        offers,
      },
      {
        '@type': 'FAQPage',
        mainEntity: EVERYBODY_FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: NAME, item: PAGE_URL },
        ],
      },
    ],
  };
}

export const everybodyConfig = {
  id: 'everybody',
  seo: EVERYBODY_SEO,
  jsonLd: buildEverybodyJsonLd,
  plans: { path: EVERYBODY_PLANS_PATH, fallback: EVERYBODY_FALLBACK_PLANS, copy: PLAN_COPY },
  nav: {
    links: [
      { to: `${PRODUCT_PATH}#audience`, label: 'Who it’s for' },
      { to: `${PRODUCT_PATH}#how-it-works`, label: 'How it works' },
      { to: `${PRODUCT_PATH}#plans`, label: 'Plans' },
      { to: `${PRODUCT_PATH}#faq`, label: 'FAQs' },
    ],
    loginTo: `${PRODUCT_PATH}/signin`,
    primary: { to: `${PRODUCT_PATH}/register`, label: 'Create your platform' },
  },
  sections: [
    {
      type: 'hero',
      eyebrow: 'For schools, centres and communities',
      title: 'Introducing',
      accent: NAME,
      lead: 'Launch your own branded CBT platform in minutes: your name, your colours, your exams, your students. No coding.',
      primary: { label: 'Create your platform', to: `${PRODUCT_PATH}/register` },
      secondary: { label: 'See plans', to: `${PRODUCT_PATH}#plans` },
      note: 'Pro from ₦7,000 a month. Studio is ad-free.',
      visual: 'builder',
    },
    {
      type: 'trust',
      label: `${NAME} highlights`,
      items: [
        ['Minutes', 'to launch'],
        ['Your name', 'your colours'],
        ['Automatic', 'marking'],
        ['Separate', 'data per organisation'],
      ],
    },
    {
      type: 'audience',
      id: 'audience',
      eyebrow: 'Who it’s for',
      title: 'Built for people who',
      accent: 'run exams.',
      side: 'If you test students, trainees or members, you can run it on your own branded site.',
      items: [
        { icon: 'school', title: 'Schools', text: 'Termly tests, mock exams and revision for your students.' },
        { icon: 'book', title: 'Tutorial and training centres', text: 'Practice for JAMB, WAEC and your own courses.' },
        { icon: 'users', title: 'Communities', text: 'Run quizzes and challenges for your members.' },
        { icon: 'clipboard', title: 'CBT managers', text: 'Host computer-based tests without building software.' },
        { icon: 'briefcase', title: 'Corporate trainers', text: 'Check what your team has learned, and keep the records.' },
      ],
    },
    {
      type: 'howItWorks',
      id: 'how-it-works',
      eyebrow: 'Four small steps',
      title: 'From sign-up to',
      accent: 'first exam.',
      steps: [
        { title: 'Register', text: 'Create your organisation account.' },
        { title: 'Pick a plan', text: 'Choose Pro or Studio.' },
        { title: 'Brand your site', text: 'Add your name, logo and colours.' },
        { title: 'Create exams and invite students', text: 'Add questions, set the timer and share the link.' },
      ],
    },
    {
      type: 'features',
      id: 'features',
      eyebrow: 'What you get',
      title: 'Everything to run exams,',
      accent: 'nothing to code.',
      items: [
        { icon: 'globe', title: 'Your own site', text: 'yourname.testflow.com.ng, or connect your own domain.' },
        { icon: 'layout', title: 'No-code website builder', text: 'Build your pages with simple blocks.' },
        { icon: 'list', title: 'Question banks and timed exams', text: 'Organise questions and set the timer.' },
        { icon: 'check', title: 'Automatic marking', text: 'Scores are ready the moment students submit.' },
        { icon: 'chart', title: 'Results and analytics', text: 'See how students and questions are performing.' },
        { icon: 'users', title: 'Student management', text: 'Add, group and manage your students.' },
        { icon: 'message', title: 'Community space', text: 'Give your students a place to talk.' },
        { icon: 'shield', title: 'Separate data', text: 'Each organisation’s data is kept separate.' },
      ],
    },
    {
      type: 'preview',
      id: 'preview',
      eyebrow: 'What your students see',
      title: 'Your platform,',
      accent: 'your brand.',
      side: 'An illustrative example of a branded site. Yours uses your own name, colours and exams.',
      host: 'advance.testflow.com.ng',
    },
    {
      type: 'plans',
      id: 'plans',
      eyebrow: 'Simple plans',
      title: 'Two plans.',
      accent: 'One clear difference.',
      side: 'Pro shows sponsored ads to your students. Studio does not. Everything else is the same.',
      cta: { to: `${PRODUCT_PATH}/register` },
      comparison: {
        rows: [
          ['Your own site (yourname.testflow.com.ng)', true, true],
          ['No-code website builder', true, true],
          ['Question banks and timed exams', true, true],
          ['Automatic marking, results and analytics', true, true],
          ['Student management and community space', true, true],
          ['Data kept separate per organisation', true, true],
          ['Sponsored ads shown to your students', true, false],
        ],
      },
    },
    { type: 'faq', id: 'faq', eyebrow: 'A little clarity first', title: 'Good questions.', accent: 'Clear answers.', side: 'Everything to know before you create your platform.', faqs: EVERYBODY_FAQS },
    {
      type: 'finalCta',
      eyebrow: 'Ready when you are',
      title: 'Launch your own CBT platform',
      accent: 'today.',
      text: 'Your name. Your colours. Your exams.',
      cta: { label: 'Create your platform', to: `${PRODUCT_PATH}/register` },
      small: 'Pro from ₦7,000 a month. Studio is ad-free.',
      crossLink: { before: 'Want to reach students instead?', label: 'Advertise with TestFlow', to: '/ads' },
    },
  ],
};
