import { MessageCircle } from 'lucide-react';

function PushPin() {
  return (
    <svg className="pin" viewBox="0 0 56 72" width="56" height="72" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pin-dome" cx="34%" cy="28%" r="78%">
          <stop offset="0" stopColor="#ffb4aa" />
          <stop offset=".22" stopColor="#ef4638" />
          <stop offset=".7" stopColor="#c0190f" />
          <stop offset="1" stopColor="#7d0c06" />
        </radialGradient>
        <linearGradient id="pin-base" x1="0" x2="1">
          <stop offset="0" stopColor="#e23a2d" />
          <stop offset=".55" stopColor="#a8140b" />
          <stop offset="1" stopColor="#650804" />
        </linearGradient>
        <linearGradient id="pin-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#8d949b" />
          <stop offset=".45" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#7b828a" />
        </linearGradient>
        <filter id="pin-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      {/* cast shadow of the pin and its head on the card */}
      <ellipse cx="38" cy="62" rx="15" ry="5" fill="#1a1a1a" opacity=".32" filter="url(#pin-blur)" />
      <path d="M26 44 L45 60 L40 62 Z" fill="#1a1a1a" opacity=".22" filter="url(#pin-blur)" />
      {/* steel needle going into the card */}
      <rect x="26" y="40" width="3.2" height="20" rx="1.4" fill="url(#pin-steel)" />
      <ellipse cx="27.6" cy="60.5" rx="3.4" ry="1.4" fill="#000" opacity=".35" />
      {/* flat base disc */}
      <ellipse cx="28" cy="40" rx="17" ry="6.2" fill="url(#pin-base)" />
      <path d="M11 38 A17 6.2 0 0 0 45 38 L45 41 A17 6.2 0 0 1 11 41 Z" fill="#7d0c06" opacity=".55" />
      {/* neck and dome */}
      <path d="M18 38 C18 30 20 20 28 14 C36 20 38 30 38 38 Z" fill="url(#pin-dome)" />
      <ellipse cx="28" cy="12.5" rx="12" ry="5.2" fill="#f0584a" />
      <ellipse cx="28" cy="12" rx="11.2" ry="4.4" fill="url(#pin-dome)" />
      {/* specular highlights */}
      <ellipse cx="23.5" cy="10.6" rx="4.4" ry="1.7" fill="#fff" opacity=".85" transform="rotate(-18 23.5 10.6)" />
      <path d="M21.5 22 C21.8 27 22.4 31 23.3 35" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".38" fill="none" />
    </svg>
  );
}

/** Static mock (pinned adds a red office push-pin) of the "Sponsored" card students see after a CBT session. */
function AdPreviewCard({ className = '', pinned = false }) {
  return (
    <div className={`ad-card ${className}`}>
      {pinned && <PushPin />}
      <span className="ad-tag">Sponsored</span>
      <img
        src="/photos/hero-student.webp"
        alt=""
        width="1200"
        height="800"
        loading="lazy"
        className="ad-card-img"
      />
      <h3>Campus laptop deals</h3>
      <p>Fresh stock, student prices. Chat with us for today’s offers.</p>
      <span className="ad-btn">
        <MessageCircle size={14} aria-hidden="true" /> Chat on WhatsApp
      </span>
    </div>
  );
}

export default AdPreviewCard;
