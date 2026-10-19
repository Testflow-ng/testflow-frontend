import { Fragment } from 'react';

/*
  A tiny JS/JSX highlighter: enough for readable snippets, no dependency.
  Tokens are matched left to right; the first alternative that matches wins.
*/
const KEYWORDS = 'import|from|export|default|const|let|var|function|return|if|else|new|await|async|true|false|null|undefined|for|of|in|as';
const TOKEN = new RegExp(
  [
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)', // 1 comment
    '(`(?:\\\\.|[^`\\\\])*`|\'(?:\\\\.|[^\'\\\\])*\'|"(?:\\\\.|[^"\\\\])*")', // 2 string
    '(<\\/?[A-Za-z][\\w.]*)', // 3 jsx tag open
    `\\b(${KEYWORDS})\\b`, // 4 keyword
    '\\b(\\d+(?:\\.\\d+)?)\\b', // 5 number
    '([A-Za-z_$][\\w$]*)(?==)', // 6 prop name before =
  ].join('|'),
  'g',
);
// A neutral dark code theme (GitHub-dark inspired), not tied to the brand palette.
const CLASSES = [null, 'text-[#8b949e] italic', 'text-[#a5d6ff]', 'text-[#7ee787]', 'text-[#ff7b72]', 'text-[#d2a8ff]', 'text-[#79c0ff]'];

/** Returns React nodes for a code string. Plain text between tokens is left as is. */
export function highlight(code) {
  const nodes = [];
  let last = 0;
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    if (m.index > last) nodes.push(code.slice(last, m.index));
    const group = m.findIndex((v, i) => i > 0 && v !== undefined);
    nodes.push(
      <span key={m.index} className={CLASSES[group]}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}
