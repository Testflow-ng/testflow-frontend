import { BarChart3, ShieldCheck, Target } from 'lucide-react';
import AdPreviewCard from './AdPreviewCard.jsx';
import { ADS_BENEFITS } from '../../features/ads/adsContent.js';

const BENEFIT_ICONS = [Target, ShieldCheck, BarChart3];

function AdsWhy() {
  return (
    <section id="why" className="container section ads-why">
            <div className="split-head">
              <div>
                <p className="eyebrow">Why TestFlow</p>
                <h2>
                  Be seen by students who are <em>actually studying.</em>
                </h2>
              </div>
              <p className="side">Short, honest ads in a place students already trust. Keep your copy brief.</p>
            </div>
            <div className="ads-why-grid">
              <div className="ads-benefits">
                {ADS_BENEFITS.map(({ title, text }, i) => {
                  const Icon = BENEFIT_ICONS[i];
                  return (
                    <article key={title} className={`feature ${i === 1 ? 'sage' : 'lavender'}`}>
                      <div className="feature-head">
                        <h3>{title}</h3>
                        <Icon size={20} aria-hidden="true" className="ads-ic" />
                      </div>
                      <p>{text}</p>
                    </article>
                  );
                })}
              </div>
              <figure className="ads-preview">
                <figcaption>
                  <p className="eyebrow">What students see</p>
                  <p className="side">A title, one line, an image and a WhatsApp button. That’s it.</p>
                </figcaption>
                <AdPreviewCard pinned />
              </figure>
            </div>
          </section>
  );
}

export default AdsWhy;
