import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { formatNaira, priceFor, useAdPricing } from '../../features/ads/useAdPricing.js';

const INCLUDED = [
  'Reviewed before it goes live',
  'Clearly labelled Sponsored',
  'WhatsApp button on your ad',
  'Impressions, clicks, CTR and WhatsApp clicks',
];

function PriceCalculator() {
  const { pricing } = useAdPricing();
  const sliderId = useId();
  const { minDurationDays: min, maxDurationDays: max } = pricing;
  const [picked, setPicked] = useState(7);
  const days = Math.min(Math.max(picked, min), max); // clamp if the server limits differ

  const { gross, percentOff, total } = priceFor(pricing, days);
  const fill = max > min ? ((days - min) / (max - min)) * 100 : 100;

  return (
    <div className="price-grid">
      <div className="price-card price-rate">
        <p className="price-kicker">Per campaign</p>
        <p className="price-big">
          <b>{formatNaira(pricing.dailyFeeKobo)}</b>
          <span>/ day</span>
        </p>
        <ul className="price-list">
          {INCLUDED.map((item) => (
            <li key={item}>
              <Check size={15} aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
        {pricing.tiers.length > 0 && (
          <ul className="price-tiers">
            {pricing.tiers.map((t) => (
              <li key={t.minDays}>
                {t.minDays}+ days: {t.percentOff}% off
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="price-card price-calc">
        <label htmlFor={sliderId} className="price-label">
          How many days?
          <b>
            {days} {days === 1 ? 'day' : 'days'}
          </b>
        </label>
        <input
          id={sliderId}
          className="price-range"
          type="range"
          min={min}
          max={max}
          step={1}
          value={days}
          onChange={(e) => setPicked(Number(e.target.value))}
          style={{ '--fill': `${fill}%` }}
        />
        <div className="price-scale" aria-hidden="true">
          <span>{min} day</span>
          <span>{max} days</span>
        </div>
        <div className="price-total" aria-live="polite">
          <span>Estimated total</span>
          <p>
            <b>{formatNaira(total)}</b>
            {percentOff > 0 && <s>{formatNaira(gross)}</s>}
          </p>
          {percentOff > 0 && <em className="price-off">{percentOff}% off</em>}
        </div>
        <small className="price-note">Estimate only. The final price is confirmed when you check out.</small>
      </div>
    </div>
  );
}

export default PriceCalculator;
