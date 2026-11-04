import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import KeyValueList from '../ui/KeyValueList.jsx';
import Timeline from '../ui/Timeline.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import SponsoredCard from './SponsoredCard.jsx';
import { formatMoney } from '../../utils/money.js';

/**
 * Everything a reviewer needs on one screen: the ad exactly as students will see it, the facts, and
 * the history. `campaign` = { id, status, title, description, imageUrl, ctaType, advertiser, durationDays,
 * priceKobo, keywords[], destination, history: [{ title, time, detail?, tone? }] }.
 */
function CampaignReviewModal({ campaign, open, onOpenChange, onApprove, onReject }) {
  if (!campaign) return null;
  const reviewable = campaign.status === 'pending_review';
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={campaign.title}
      description={`From ${campaign.advertiser}`}
      footer={
        reviewable ? (
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onReject?.(campaign)}>Reject…</Button>
            <Button onClick={() => onApprove?.(campaign)}>Approve</Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-5 pb-2">
        <StatusBadge status={campaign.status} />
        <SponsoredCard ad={{ title: campaign.title, description: campaign.description, imageUrl: campaign.imageUrl }} cta={{ type: campaign.ctaType ?? 'whatsapp' }} className="mx-auto" />
        <KeyValueList
          items={[
            { label: 'Advertiser', value: campaign.advertiser },
            { label: 'Duration', value: `${campaign.durationDays} days` },
            { label: 'Paid', value: formatMoney(campaign.priceKobo) },
            { label: 'Keywords', value: campaign.keywords?.join(', ') || 'None' },
            { label: 'Destination', value: <span className="break-all">{campaign.destination}</span> },
          ]}
        />
        {campaign.history?.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-base font-bold text-foreground-strong">History</h3>
            <Timeline items={campaign.history} />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CampaignReviewModal;
