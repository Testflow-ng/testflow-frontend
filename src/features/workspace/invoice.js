import { formatMoney } from '../../utils/money.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const date = (v) => (v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const STYLE = `
  *{box-sizing:border-box} body{font:14px/1.5 Inter,system-ui,sans-serif;color:#1b4332;margin:0;padding:40px}
  header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;border-bottom:2px solid #1b4332;padding-bottom:20px}
  h1{font-size:26px;margin:0 0 4px} .muted{color:#6f7a73} .brand{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:800}
  .brand img{width:40px;height:40px;object-fit:contain} table{width:100%;border-collapse:collapse;margin-top:24px}
  th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6f7a73;padding:8px 10px;border-bottom:1px solid #e3e1d8}
  td{padding:10px;border-bottom:1px solid #e3e1d8;vertical-align:top} .r{text-align:right} .neg{color:#6f7a73}
  .totals{margin:28px 0 0 auto;width:320px} .totals div{display:flex;justify-content:space-between;padding:6px 0}
  .totals .big{border-top:2px solid #1b4332;margin-top:6px;padding-top:10px;font-size:18px;font-weight:800}
  footer{margin-top:48px;font-size:12px;color:#6f7a73;display:flex;justify-content:space-between}
  @media print{body{padding:0} @page{margin:18mm}}
`;

function open(title, body) {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`);
  w.document.close();
  return true;
}

const head = (org, brand, title, sub) => `
  <header>
    <div class="brand">${brand?.logoUrl ? `<img src="${esc(brand.logoUrl)}" alt="">` : ''}<span>${esc(brand?.name ?? org.name)}</span></div>
    <div style="text-align:right"><h1>${esc(title)}</h1><div class="muted">${esc(sub)}</div></div>
  </header>`;

const sums = (rows) => {
  const paid = rows.filter((r) => r.status === 'paid');
  return {
    gross: paid.reduce((n, r) => n + r.grossKobo, 0),
    fee: paid.reduce((n, r) => n + r.platformFeeKobo, 0),
    net: paid.reduce((n, r) => n + r.orgShareKobo, 0),
    count: paid.length,
  };
};

/** A printable statement of every payment in the list. The browser's print dialog saves it as a PDF. */
export function printStatement({ org, brand, payments, periodLabel }) {
  const t = sums(payments);
  const rows = payments.map((p) => `<tr><td>${esc(date(p.paidAt))}</td><td>${esc(p.item)}${p.reference ? `<div class="muted">${esc(p.reference)}</div>` : ''}</td><td>${esc(p.status)}</td><td class="r">${formatMoney(p.grossKobo)}</td><td class="r neg">-${formatMoney(p.platformFeeKobo)}</td><td class="r"><strong>${formatMoney(p.orgShareKobo)}</strong></td></tr>`).join('');
  return open(`Statement ${periodLabel}`, `${head(org, brand, 'Statement of earnings', periodLabel)}
    <table><thead><tr><th>Date</th><th>For</th><th>Status</th><th class="r">Student paid</th><th class="r">Testflow share</th><th class="r">You receive</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="muted">No payments in this period.</td></tr>'}</tbody></table>
    <div class="totals"><div><span>Payments</span><span>${t.count}</span></div><div><span>Students paid</span><span>${formatMoney(t.gross)}</span></div><div><span>Testflow share</span><span>-${formatMoney(t.fee)}</span></div><div class="big"><span>You received</span><span>${formatMoney(t.net)}</span></div></div>
    <footer><span>Generated ${esc(date(new Date()))}. Refunded and failed payments are listed but not counted.</span><span>Powered by Testflow</span></footer>`);
}

/** A printable receipt for one payment. */
export function printReceipt({ org, brand, payment: p }) {
  return open(`Receipt ${p.reference ?? p.id}`, `${head(org, brand, 'Receipt', p.reference ?? p.id)}
    <table><tbody>
      <tr><td class="muted">Date</td><td>${esc(date(p.paidAt))}</td></tr>
      <tr><td class="muted">For</td><td>${esc(p.item)}</td></tr>
      ${p.studentName ? `<tr><td class="muted">Student</td><td>${esc(p.studentName)}</td></tr>` : ''}
      <tr><td class="muted">Status</td><td>${esc(p.status)}</td></tr>
    </tbody></table>
    <div class="totals"><div><span>Student paid</span><span>${formatMoney(p.grossKobo)}</span></div><div><span>Testflow share</span><span>-${formatMoney(p.platformFeeKobo)}</span></div><div class="big"><span>You receive</span><span>${formatMoney(p.orgShareKobo)}</span></div></div>
    <footer><span>Issued by ${esc(brand?.name ?? org.name)}</span><span>Powered by Testflow</span></footer>`);
}

/** CSV of the same rows, for a spreadsheet. */
export function downloadStatementCsv(payments, periodLabel) {
  const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = ['Date,Reference,For,Student,Status,Student paid (NGN),Testflow share (NGN),You receive (NGN)', ...payments.map((p) => [date(p.paidAt), p.reference, p.item, p.studentName, p.status, p.grossKobo / 100, p.platformFeeKobo / 100, p.orgShareKobo / 100].map(q).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `earnings-${periodLabel.toLowerCase().replace(/\s+/g, '-')}.csv`;
  a.click();
}

export { sums as summarize };
