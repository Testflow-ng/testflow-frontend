import { useState } from 'react';
import { useToast } from '../../../components/ui/index.js';
import SponsoredCard from '../../../components/ads/SponsoredCard.jsx';
import AdPreview from '../../../components/ads/AdPreview.jsx';
import CountdownBadge from '../../../components/ads/CountdownBadge.jsx';
import AnalyticsPanel from '../../../components/ads/AnalyticsPanel.jsx';
import AdsReviewQueue from '../../../components/ads/AdsReviewQueue.jsx';
import AdsPaymentsTable from '../../../components/ads/AdsPaymentsTable.jsx';
import { adCampaigns, adPayments, dailyAds, daysOut, hoursOut } from './samples.js';

export default [
  {
    id: 'sponsored-card', name: 'Sponsored card and ad preview', category: 'Ads', source: ['ads/SponsoredCard.jsx', 'ads/AdPreview.jsx', 'ads/CountdownBadge.jsx'],
    description: 'What students see after an exam (always labelled Sponsored), the live preview in the ad form, and a countdown badge.',
    keywords: ['ad', 'advert', 'sponsored', 'campaign', 'preview', 'countdown', 'whatsapp'],
    Preview: function Demo() {
      const toast = useToast();
      return (
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-80"><SponsoredCard ad={{ title: 'Campus laptop deals', description: 'Fresh stock, student prices. Chat with us today.', imageUrl: '/photos/hero-student.webp' }} cta={{ type: 'whatsapp', href: 'https://wa.me/2348012345678' }} onSkip={() => toast.info('Skipped')} onContinue={() => toast.info('Continue')} /></div>
          <div className="w-80"><AdPreview title="Campus laptop deals" description="Live as you type in the form." imageUrl="/photos/hero-student.webp" /></div>
          <div className="grid gap-2"><CountdownBadge until={daysOut(7)} /><CountdownBadge until={daysOut(2)} /><CountdownBadge until={hoursOut(5)} /><CountdownBadge until={daysOut(-1)} /></div>
        </div>
      );
    },
    usage: `import SponsoredCard from '../components/ads/SponsoredCard.jsx';
import CountdownBadge from '../components/ads/CountdownBadge.jsx';

<SponsoredCard
  ad={{ title, description, imageUrl }}
  cta={{ type: 'whatsapp', href: 'https://wa.me/234...' }}
  onSkip={skip}
  onContinue={next}
/>
<CountdownBadge until={campaign.endsAt} />`,
  },
  {
    id: 'ads-analytics', name: 'Ads analytics panel', category: 'Ads', source: 'ads/AnalyticsPanel.jsx',
    description: 'Totals, a funnel and a daily chart. Aggregates only; never student identities.',
    keywords: ['analytics', 'impressions', 'clicks', 'ctr', 'funnel', 'chart', 'report'],
    Preview: function Demo() {
      const [range, setRange] = useState({});
      return <AnalyticsPanel range={range} onRangeChange={setRange} daily={dailyAds} totals={{ eligibleRequests: 2400, impressions: 2140, uniqueViewers: 1310, clicks: 168, whatsappClicks: 74, ctr: 7.9, whatsappCtr: 3.5 }} />;
    },
    usage: `import AnalyticsPanel from '../components/ads/AnalyticsPanel.jsx';

<AnalyticsPanel range={range} onRangeChange={setRange} daily={daily} totals={totals} />`,
  },
  {
    id: 'ads-admin', name: 'Ads review queue and payments', category: 'Ads', source: ['ads/AdsReviewQueue.jsx', 'ads/AdsPaymentsTable.jsx'],
    description: 'Admin tools: approve, reject (with reason and refund), suspend, reinstate and refund.',
    keywords: ['admin', 'review', 'moderation', 'approve', 'reject', 'refund', 'payments', 'queue'],
    Preview: function Demo() {
      const toast = useToast();
      return (
        <div className="space-y-6">
          <AdsReviewQueue campaigns={adCampaigns} onApprove={async (c) => toast.success(`Approved ${c.title}`)} onReject={async (c, v) => toast.success('Rejected', v.refund ? 'With refund' : v.reason)} onSuspend={async (c) => toast.success(`Suspended ${c.title}`)} onReinstate={(c) => toast.success(`Reinstated ${c.title}`)} />
          <AdsPaymentsTable payments={adPayments} onRefund={async (p) => toast.success(`Refunded ${p.reference}`)} />
        </div>
      );
    },
    usage: `import AdsReviewQueue from '../components/ads/AdsReviewQueue.jsx';
import AdsPaymentsTable from '../components/ads/AdsPaymentsTable.jsx';

// Presentational: the callbacks call the Ads API and may return promises.
<AdsReviewQueue campaigns={campaigns} onApprove={approve} onReject={reject} onSuspend={suspend} onReinstate={reinstate} />
<AdsPaymentsTable payments={payments} onRefund={refund} />`,
  },
];
