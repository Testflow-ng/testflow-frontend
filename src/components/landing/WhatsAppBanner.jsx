import Reveal from './Reveal.jsx';

const WHATSAPP_CHANNEL =
  'https://whatsapp.com/channel/0029Vb7RvRGHgZWXspQLPK1u';

const WHATSAPP_GREEN = '#25D366';

function WhatsAppGlyph({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5c-1.62 0-3.21-.44-4.6-1.26l-.33-.2-3.42.9.91-3.33-.21-.34a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43M20.52 3.49A11.8 11.8 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.08 24l6.35-1.66a11.85 11.85 0 0 0 5.66 1.44h.01c6.53 0 11.85-5.32 11.85-11.86 0-3.17-1.23-6.15-3.47-8.39" />
    </svg>
  );
}

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
              <WhatsAppGlyph />
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
            href={WHATSAPP_CHANNEL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-transform active:scale-95 sm:w-auto"
            style={{ backgroundColor: WHATSAPP_GREEN }}
          >
            <WhatsAppGlyph size={18} />
            Follow channel
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export default WhatsAppBanner;
