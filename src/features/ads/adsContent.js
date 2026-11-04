// Pure data (no JSX) so the build-time prerender in vite.config.js can reuse it
// for the static FAQPage JSON-LD and keep it identical to the on-page FAQ.

export const ADS_PATHS = {
  home: '/ads',
  terms: '/ads/terms',
  rules: '/ads/rules',
  signin: '/ads/signin',
  register: '/ads/register',
};

export const ADS_FALLBACK_PRICING = {
  dailyFeeKobo: 100000,
  minDurationDays: 1,
  maxDurationDays: 30,
  pricingPolicy: 'flat',
  tiers: [],
};

export const ADS_STEPS = [
  { title: 'Create your ad', text: 'Add a short title, a one-line description, an image and your WhatsApp link.' },
  { title: 'Pay per day', text: 'Choose how many days to run. You only pay for the days you pick.' },
  { title: 'We review it', text: 'Every ad is checked against our content rules before it goes live.' },
  { title: 'Students see it', text: 'Your ad shows up, clearly labelled Sponsored, after a CBT practice session.' },
];

export const ADS_BENEFITS = [
  {
    title: 'A focused, captive audience',
    text: 'Students see your ad right after finishing a CBT practice session, when they are already in study mode.',
  },
  {
    title: 'Honest and clearly labelled',
    text: 'Every ad is marked Sponsored. Students tap one button and chat with you on WhatsApp.',
  },
  {
    title: 'Numbers you can act on',
    text: 'Per-campaign analytics: impressions, clicks, CTR and WhatsApp clicks, all in one place.',
  },
];

export const ADS_FAQS = [
  [
    'Is my ad approved automatically?',
    'No. Every ad is reviewed before it goes live. Payment does not guarantee approval, so keep your ad within the content rules.',
  ],
  [
    'How long will my ad run?',
    'For the days you pay for. When the campaign ends, the ad stops showing to students.',
  ],
  [
    'What happens when my campaign expires?',
    'Expired campaigns stay visible in your dashboard for 7 days, so you can republish them in a few taps.',
  ],
  [
    'What data do I get about students?',
    'Aggregate numbers only: impressions, clicks, CTR and WhatsApp clicks. No student identities are ever shared with advertisers.',
  ],
  [
    'Who sees my ad?',
    'Nigerian university students using TestFlow to practise for their exams, right after a CBT practice session.',
  ],
  [
    'How long should my ad copy be?',
    'Short wins. A clear title and one line of description get more taps than a paragraph.',
  ],
];
