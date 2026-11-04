import { Share2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Alert from '../ui/Alert.jsx';
import Spinner from '../ui/Spinner.jsx';
import CopyField from '../ui/CopyField.jsx';
import { listRowClasses } from '../ui/surfaces.js';
import { cn } from '../../utils/cn.js';
import { SHARE_TARGETS } from './shareTargets.js';

/**
 * The one share dialog: a public link, a copy field, the chat apps and, on a phone, whatever
 * else is installed.
 *
 * The link is always *passed in*, never built here, because a share link is not
 * `window.location` with a suffix .it is a URL the backend serves as a page carrying the
 * Open Graph image. Something that mints a token (a result) and something that is public by
 * id (a question) produce their link differently, and this component does not care which.
 *
 * `caption` rides along in the WhatsApp text and the native sheet; the other targets take the
 * URL alone, since their composers read the preview card anyway.
 */
function ShareDialog({
  open,
  onOpenChange,
  title = 'Share',
  description,
  url,
  caption = '',
  loading = false,
  error = null,
}) {
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);
  const nativeShare = () => {
    navigator
      .share({ title, text: caption, url })
      .catch(() => {
        /* the student dismissed the sheet; there is nothing to report */
      });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <div className="flex flex-col gap-4 py-1">
        {description && <p className="text-[13px] leading-relaxed text-muted">{description}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size={22} />
          </div>
        ) : error ? (
          <Alert variant="danger">{error.message ?? 'The share link could not be created.'}</Alert>
        ) : (
          <>
            <CopyField label="Share link" value={url ?? ''} />

            <div className="flex flex-col gap-2">
              {SHARE_TARGETS.map(({ id, label, hint, href, Icon, iconClass }) => (
                <a
                  key={id}
                  href={href(url, caption)}
                  target="_blank"
                  rel="noreferrer"
                  className={listRowClasses({ className: 'p-3.5' })}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      iconClass,
                    )}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-foreground-strong">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>
                  </span>
                </a>
              ))}

              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className={listRowClasses({ className: 'p-3.5', interactive: true })}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Share2 size={18} className="text-primary" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-foreground-strong">
                      More apps
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      Instagram, email, anything on your phone
                    </span>
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ShareDialog;
