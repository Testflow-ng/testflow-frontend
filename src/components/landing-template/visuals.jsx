import { BatteryFull, MessageCircle, Signal, Wifi } from 'lucide-react';

/** Hero visual for Testflow for Everyone: a branded-site builder card. Static, illustrative. */
export function BuilderVisual() {
  return (
    <div className="hero-visual builder-visual" aria-hidden="true">
      <div className="builder-card">
        <div className="builder-url">
          <span className="builder-lock" />
          yourname.testflow.com.ng
        </div>
        <div className="builder-brand">
          <span className="builder-logo">Y</span>
          <div>
            <b>Your school name</b>
            <small>Online exams, your way</small>
          </div>
        </div>
        <div className="builder-swatches">
          {['#4a35f0', '#1b4332', '#d6e87c', '#e9e5fb'].map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
        <div className="builder-rows">
          {['Mathematics mock', 'English test', 'Biology quiz'].map((name, i) => (
            <div key={name}>
              <span>{name}</span>
              <i>{[40, 25, 32][i]} Q</i>
            </div>
          ))}
        </div>
        <span className="builder-btn">Start exam</span>
      </div>
      <span className="chip chip-streak">Your name</span>
      <span className="chip chip-better">Your colours</span>
    </div>
  );
}

/** Hero visual for the Eddyrus Media page: brand card until the supplied photo is added. */
export function OrgVisual() {
  return (
    <div className="hero-visual builder-visual org-visual" aria-hidden="true">
      <div className="builder-card">
        <div className="builder-brand">
          <img className="org-logo" src="/brand/logo.webp" alt="" width="46" height="46" />
          <div>
            <b>Eddyrus Media</b>
            <small>Operates Testflow</small>
          </div>
        </div>
        <div className="builder-rows">
          {[
            ['Testflow CBT', 'Practice'],
            ['TestFlow Ads', 'Advertising'],
            ['Testflow for Everyone', 'Platform'],
          ].map(([name, kind]) => (
            <div key={name}>
              <span>{name}</span>
              <i>{kind}</i>
            </div>
          ))}
        </div>
        <span className="builder-btn">Follow on WhatsApp</span>
      </div>
      <span className="chip chip-streak">OAU CBT practice</span>
      <span className="chip chip-better">Built by a small team</span>
    </div>
  );
}

/** Hero visual for TestFlow Ads: a phone showing the sponsored card after a CBT session. */
export function AdsPhoneVisual() {
  return (
    <div className="hero-visual ads-visual" aria-hidden="true">
      <div className="phone">
        <span className="phone-btn phone-btn-a" />
        <span className="phone-btn phone-btn-b" />
        <span className="phone-btn phone-btn-c" />
        <span className="phone-btn phone-btn-d" />
        <div className="phone-bezel">
          <div className="phone-screen">
            <div className="phone-island">
              <span className="phone-lens" />
            </div>
            <div className="phone-status">
              <span>9:41</span>
              <span className="phone-status-icons">
                <Signal size={13} strokeWidth={2.6} />
                <Wifi size={13} strokeWidth={2.6} />
                <BatteryFull size={17} strokeWidth={2.2} />
              </span>
            </div>
            <div className="phone-app">
              <div className="phone-bar">
                <b>Testflow</b>
                <small>MTH101</small>
              </div>
              <div className="phone-result">
                <div className="phone-ring">
                  <span>90%</span>
                </div>
                <div>
                  <small>Practice complete</small>
                  <b>18 / 20 correct</b>
                  <small>Nice work. Keep it going.</small>
                </div>
              </div>
              <p className="phone-label">Sponsored</p>
              <div className="phone-ad">
                <img src="/photos/hero-student.webp" alt="" width="1200" height="800" loading="lazy" />
                <h3>Campus laptop deals</h3>
                <p>Fresh stock, student prices.</p>
                <span className="ad-btn">
                  <MessageCircle size={13} /> Chat on WhatsApp
                </span>
              </div>
            </div>
            <span className="phone-home" />
            <span className="phone-glass" />
          </div>
        </div>
      </div>
      <span className="phone-ground" />
      <div className="stat-card">
        <small>Your campaign today</small>
        <div>
          <span>
            <b>12.4k</b> Impressions
          </span>
          <span>
            <b>4.8%</b> CTR
          </span>
        </div>
      </div>
      <span className="chip chip-streak">
        <MessageCircle size={14} /> +42 WhatsApp clicks
      </span>
    </div>
  );
}

/** Browser-frame mock of a tenant site. Illustrative only. */
export function BrowserFrame({ host }) {
  return (
    <div className="browser" role="img" aria-label={`Illustrative example of a branded exam site at ${host}`}>
      <div className="browser-bar">
        <span className="browser-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-url">
          <span className="builder-lock" />
          {host}
        </span>
      </div>
      <div className="browser-page">
        <div className="site-nav">
          <b>Advance Tutorials</b>
          <span>Courses</span>
          <span>Results</span>
          <span className="site-pill">Sign in</span>
        </div>
        <div className="site-hero">
          <div>
            <small>Online practice exams</small>
            <h3>Prepare with confidence at Advance Tutorials.</h3>
            <span className="site-btn">Start a test</span>
          </div>
          <div className="site-ring">
            <span>82%</span>
          </div>
        </div>
        <div className="site-grid">
          {[
            ['Use of English', '40 questions · 30 min'],
            ['Mathematics', '40 questions · 45 min'],
            ['Chemistry', '40 questions · 30 min'],
          ].map(([name, meta]) => (
            <div key={name}>
              <b>{name}</b>
              <small>{meta}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

