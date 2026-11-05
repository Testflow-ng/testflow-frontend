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
    blurb: 'Your own branded CBT portal for running unlimited exams. Simple and fast for schools, tutors, and academies.',
    points: [
      'Your own CBT site at yourname.testflow.com.ng',
      'Your name, logo and brand colours',
      'Unlimited exams students take anytime',
      'Question banks & bulk CSV question imports',
      'Automatic marking and instant student results',
      'Student question report & review queue',
    ],
    cta: 'Choose Pro',
  },
  studio: {
    blurb: 'Everything in Pro plus exam monetization, Live CBT synchronized sessions, and 100% ad-free.',
    points: [
      'Everything in Pro',
      'Charge for exams (Paid CBT access via Paystack)',
      'Live CBT: everyone starts together at set time',
      'Strict submission & session retake policies',
      'Custom domain support (cbt.yourschool.com)',
      '100% ad-free for all your students',
    ],
    cta: 'Choose Studio',
    badge: 'Most Popular',
  },
};

export const EVERYBODY_FAQS = [
  ['Do I need technical skills?', 'No. You choose a plan, add your name, logo and colours, create or import your questions, and share your exam link with students. Everything is ready out of the box.'],
  ['How do I charge students for exams?', 'On the Studio plan, you can set a fee for any exam (e.g. ₦1,000). Students pay securely via Paystack before sitting, and earnings are deposited directly into your payout bank account with TestFlow retaining 5%.'],
  ['What is Live CBT?', 'Live CBT lets all your students start an exam at the exact same scheduled date and time with a synchronized countdown timer, just like a real-world national exam.'],
  ['Can I use my own domain?', 'Yes. Every organisation gets a free address at yourname.testflow.com.ng, and you can also connect your own custom domain (like cbt.yourschool.com).'],
  ['Is my students’ data separate from other organisations?', 'Yes. Each organisation’s students, questions, exams, and results are kept completely private and isolated.'],
  ['What happens if my subscription expires?', 'Your data is kept safe. Your workspace becomes read-only until you renew, so nothing is ever deleted.'],
  ['Which devices work for my students?', 'Any smartphone, tablet, laptop, or desktop computer. Students take exams directly in their browser without downloading any apps.'],
];

const NAME = PRODUCT_NAME_PUBLIC;
const PAGE_URL = `${SITE_URL}${PRODUCT_PATH}`;

export const EVERYBODY_SEO = {
  route: PRODUCT_PATH,
  title: `Create Your Own CBT Website | ${NAME}`,
  description:
    'Launch your own branded CBT platform in minutes. Your name, colours, exams and students. Host timed practice, live CBT sessions, and charge for exams. Plans for schools and tutorial centres.',
  keywords:
    'CBT software Nigeria, create CBT website, online exam platform for schools Nigeria, white-label CBT, CBT for tutorial centres, JAMB CBT software, school exam software, online test platform, paid CBT exams, live CBT',
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
    dashboardTo: '/workspace',
    dashboardLabel: 'Workspace',
  },
  sections: [
    {
      type: 'hero',
      eyebrow: 'For schools, centres and educators',
      title: 'Introducing',
      accent: NAME,
      lead: 'Launch your own branded CBT portal in minutes: your name, your colours, your exams, your students. Timed mock tests, Live CBT sessions, and optional exam fee collection.',
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
      side: 'If you test students, trainees or candidates, you can run it on your own branded portal.',
      items: [
        { icon: 'school', title: 'Schools & Colleges', text: 'Termly tests, mock exams, continuous assessments, and revision for your students.' },
        { icon: 'book', title: 'Tutorial & JAMB Centres', text: 'Realistic JAMB, WAEC, and Post-UTME mock CBT sessions with live timers.' },
        { icon: 'creditCard', title: 'Educators & Course Creators', text: 'Monetize your mock exams by charging students per session with instant Paystack payouts.' },
        { icon: 'users', title: 'Communities & Associations', text: 'Host scholarship tests, recruitment challenges, and quizzes for your members.' },
        { icon: 'briefcase', title: 'Corporate Trainers & HR', text: 'Assess trainees, test new hires, and generate automated performance reports.' },
      ],
    },
    {
      type: 'howItWorks',
      id: 'how-it-works',
      eyebrow: 'Four simple steps',
      title: 'From sign-up to',
      accent: 'first exam.',
      steps: [
        { title: 'Register', text: 'Create your organization CBT portal account in under a minute.' },
        { title: 'Pick a plan', text: 'Choose Pro for unlimited exams or Studio for paid exams and Live CBT.' },
        { title: 'Brand your site', text: 'Add your school or centre name, logo, custom theme and colours.' },
        { title: 'Add questions & launch', text: 'Upload questions via CSV or question banks, set timers, and share your exam link.' },
      ],
    },
    {
      type: 'features',
      id: 'features',
      eyebrow: 'What you get',
      title: 'Everything to run professional exams,',
      accent: 'ready from day one.',
      items: [
        { icon: 'globe', title: 'Your own branded portal', text: 'yourname.testflow.com.ng, or connect your school custom domain.' },
        { icon: 'creditCard', title: 'Charge for exams (Paid CBT)', text: 'Collect test fees directly into your Nigerian bank account via Paystack.' },
        { icon: 'clock', title: 'Live CBT sessions', text: 'Synchronized real-time exams with live countdown clocks and scheduled start dates.' },
        { icon: 'list', title: 'Question banks & CSV imports', text: 'Organize subjects, reuse questions across exams, or bulk import from CSV.' },
        { icon: 'check', title: 'Automatic instant marking', text: 'Scores and grade breakdowns are calculated the instant students submit.' },
        { icon: 'chart', title: 'Results & analytics', text: 'Inspect question-by-question performance, pass rates, and CSV exports.' },
        { icon: 'shield', title: 'Anti-cheating & rules', text: 'Shuffle question order, mix answer choices, negative marking, and strict single-attempt modes.' },
        { icon: 'message', title: 'Announcements & reporting', text: 'Broadcast notices to students and manage student feedback on questions.' },
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
      eyebrow: 'Transparent pricing',
      title: 'Two plans.',
      accent: 'One clear choice.',
      side: 'Pro is for unlimited anytime exams. Studio unlocks paid exam monetization, Live CBT sessions, and zero ads.',
      cta: { to: `${PRODUCT_PATH}/register` },
      comparison: {
        rows: [
          ['Your own CBT portal on testflow.com.ng', true, true],
          ['Your name, logo and brand colours', true, true],
          ['Unlimited exams students take anytime', true, true],
          ['Question banks to store & reuse questions', true, true],
          ['CSV and bulk question imports', true, true],
          ['Instant automatic marking & result exports', true, true],
          ['Broadcast announcements to students', true, true],
          ['Student question report & review queue', true, true],
          ['Charge for exams, paid straight to your bank', false, true],
          ['Live CBT: everyone starts together at set time', false, true],
          ['Custom domain support (cbt.yourschool.com)', false, true],
          ['100% ad-free for all your students', false, true],
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
