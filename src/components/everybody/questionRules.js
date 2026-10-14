/** Problems with a question, as plain messages (empty array = valid). Mirrors the API rules (2-6 distinct options). */
export function questionProblems(q) {
  const out = [];
  if (!q.stem?.trim()) out.push('Write the question.');
  const filled = q.options.map((o) => o.trim()).filter(Boolean);
  if (filled.length < 2) out.push('Add at least two options.');
  if (new Set(filled.map((o) => o.toLowerCase())).size !== filled.length) out.push('Options must be different from each other.');
  if (!q.options[q.correctIndex]?.trim()) out.push('Mark the correct option.');
  return out;
}

/** Row check for question imports (same rules as the question editor). Returns an array of messages. */
export function validateQuestionRow(r) {
  const out = [];
  if (!String(r.stem ?? '').trim()) out.push('Missing question text');
  const opts = Array.isArray(r.options) ? r.options.map((o) => String(o).trim()).filter(Boolean) : [];
  if (opts.length < 2 || opts.length > 6) out.push('Needs 2 to 6 options');
  if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) out.push('Options repeat');
  if (!Number.isInteger(r.correctIndex) || r.correctIndex < 0 || r.correctIndex >= opts.length) out.push('Correct answer is missing or out of range');
  return out;
}
