import PriceCalculator from './PriceCalculator.jsx';

function AdsPricing() {
  return (
    <section id="pricing" className="subjects ads-pricing">
            <div className="container">
              <div className="split-head light">
                <div>
                  <p className="eyebrow lime">Simple pricing</p>
                  <h2>Pay for the days you run.</h2>
                </div>
                <p className="side">No contracts. Pick your days, we review your ad, then it goes live.</p>
              </div>
              <PriceCalculator />
            </div>
          </section>
  );
}

export default AdsPricing;
