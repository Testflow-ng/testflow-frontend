/** Parses CSV text into rows of cells. Handles quoted cells, commas and line breaks inside quotes, and "" escapes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const LETTERS = 'ABCDEF';

/**
 * CSV text -> question objects. Columns (header row required, any order, case-insensitive):
 * stem, optionA..optionF, correct (A-F) or correctIndex (0-based), topic, difficulty, explanation, stemImageUrl.
 */
export function questionsFromCsv(text) {
  const [head, ...body] = parseCsv(text);
  if (!head) return [];
  const col = Object.fromEntries(head.map((h, i) => [h.trim().toLowerCase().replace(/[\s_-]/g, ''), i]));
  const get = (r, name) => (col[name] != null ? (r[col[name]] ?? '').trim() : '');
  return body.map((r) => {
    const options = LETTERS.split('').map((l) => get(r, `option${l.toLowerCase()}`)).filter((o, i, all) => o || all.slice(i + 1).some(Boolean));
    const letter = get(r, 'correct').toUpperCase();
    const idx = get(r, 'correctindex');
    return {
      stem: get(r, 'stem'),
      options,
      correctIndex: letter ? LETTERS.indexOf(letter) : idx !== '' ? Number(idx) : -1,
      topic: get(r, 'topic') || undefined,
      difficulty: ['easy', 'medium', 'hard'].includes(get(r, 'difficulty').toLowerCase()) ? get(r, 'difficulty').toLowerCase() : 'medium',
      explanation: get(r, 'explanation') || undefined,
      stemImageUrl: get(r, 'stemimageurl') || undefined,
    };
  });
}

export const CSV_TEMPLATE = 'stem,optionA,optionB,optionC,optionD,correct,topic,difficulty,explanation\n"What is 2 + 2?",3,4,5,6,B,Arithmetic,easy,"Add the two numbers."\n';
