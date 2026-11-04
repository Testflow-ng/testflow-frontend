import { Globe, ShieldCheck, Trash2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Stepper from '../ui/Stepper.jsx';
import CopyField from '../ui/CopyField.jsx';
import Button from '../ui/Button.jsx';
import Banner from '../ui/Banner.jsx';

const STEP_OF = { pending: 1, verified: 2, active: 3, failed: 1 };

/**
 * One domain. `domain` = { hostname, type: 'subdomain'|'custom', status: 'pending'|'verified'|'active'|'failed',
 * isPrimary, records: [{ type, host, value }], expiresAt? }. Custom domains show the three steps and the DNS records
 * to add (with copy buttons); `onVerify` re-checks DNS and may return a promise. Subdomains are always ready.
 */
function DomainCard({ domain, onVerify, onRemove, verifying = false }) {
  const custom = domain.type === 'custom';
  const step = STEP_OF[domain.status] ?? 0;
  return (
    <article className="space-y-5 rounded-[24px] border border-border bg-surface p-5 sm:p-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Globe size={20} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-bold text-foreground-strong">{domain.hostname}</h3>
          <p className="text-sm text-muted">{custom ? 'Your own domain' : 'Free Testflow address'}{domain.isPrimary ? ' · Primary' : ''}</p>
        </div>
        <StatusBadge status={domain.status} />
        {custom && onRemove && <button type="button" onClick={onRemove} aria-label={`Remove ${domain.hostname}`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Trash2 size={17} aria-hidden="true" /></button>}
      </header>

      {custom && (
        <>
          <Stepper current={Math.max(0, step - 1)} steps={[{ label: 'Add DNS records' }, { label: 'Verify' }, { label: 'Live' }]} />
          {domain.status === 'failed' && <Banner variant="danger" title="We could not find the records.">DNS can take a while to update. Check the values below and try again.</Banner>}
          {domain.status !== 'active' && domain.records?.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Add these records where you manage your domain. {domain.expiresAt ? `The token expires ${domain.expiresAt}.` : ''}</p>
              {domain.records.map((r) => (
                <div key={`${r.type}-${r.host}`} className="rounded-2xl border border-border bg-surface-strong/40 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{r.type} record · <span className="font-mono normal-case">{r.host}</span></p>
                  <CopyField value={r.value} />
                </div>
              ))}
              <Button onClick={onVerify} disabled={verifying} aria-busy={verifying}><ShieldCheck size={16} aria-hidden="true" /> {verifying ? 'Checking…' : 'Verify DNS'}</Button>
            </div>
          )}
        </>
      )}
    </article>
  );
}

export default DomainCard;
