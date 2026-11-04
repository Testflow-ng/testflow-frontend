/** Format an integer amount in minor units (kobo) as currency, e.g. 700000 -> "₦7,000". */
export const formatMoney = (minor, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
