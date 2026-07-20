import Reveal from './Reveal.jsx';
import WhatsAppIcon from '../icons/WhatsAppIcon.jsx';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_GREEN } from '../../constants/social.js';

function WhatsAppBanner() {
  return (
    <section className="bg-background pb-16 sm:pb-24">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-surface p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              <WhatsAppIcon />
            </span>
            <div>
              <h3 className="font-bold text-foreground-strong">
                Follow EDDYRUS MEDIA on WhatsApp
              </h3>
              <p className="mt-1 text-sm text-muted">
                Exam tips, study updates, and launch news, straight to your
                phone.
              </p>
            </div>
          </div>

          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-transform active:scale-95 sm:w-auto"
            style={{ backgroundColor: WHATSAPP_GREEN }}
          >
            <WhatsAppIcon size={18} />
            Follow channel
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export default WhatsAppBanner;
