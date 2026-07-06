import 'katex/dist/katex.min.css';
import katex from 'katex';

/**
 * Renders text that may contain LaTeX. Supported delimiters (one or two
 * backslashes, to tolerate different import/escaping formats):
 *   inline:  $ ... $     \( ... \)
 *   block:   $$ ... $$    \[ ... \]
 *
 * We call KaTeX directly (rather than react-katex) so the app renders through
 * a single, known KaTeX build. react-katex 3.x pulls in its own mismatched
 * KaTeX copy that failed to parse valid \frac expressions in the browser.
 *
 * Invalid LaTeX renders as its raw source (in danger color) instead of
 * throwing, so a single bad expression can never crash an exam.
 */
const SEGMENT =
  /(\$\$[\s\S]*?\$\$|\$[\s\S]+?\$|\\{1,2}\([\s\S]*?\\{1,2}\)|\\{1,2}\[[\s\S]*?\\{1,2}\])/g;

// Normalize "smart" characters that pasted/imported questions carry but KaTeX
// rejects (e.g. curly quotes inside \frac). Keeps the math renderable.
const normalizeMath = (math) =>
  math
    .replace(/[‘’ʼ]/g, "'") // ‘ ’ ʼ -> '
    .replace(/[“”]/g, '"') // “ ” -> "
    .replace(/[−–—]/g, '-') // − – — -> -
    .replace(/ /g, ' '); // nbsp -> space

/**
 * Render one math segment to KaTeX HTML. On any parse error, fall back to the
 * raw source (in danger color) so a single bad expression never crashes an exam.
 */
function renderMath(source, math, displayMode, key) {
  try {
    const html = katex.renderToString(normalizeMath(math), {
      displayMode,
      throwOnError: true,
    });
    return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return (
      <span key={key} className="text-danger">
        {source}
      </span>
    );
  }
}

function MathText({ children, className }) {
  if (typeof children !== 'string') {
    return <div className={className}>{children}</div>;
  }

  const parts = children.split(SEGMENT);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Block math
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return renderMath(part, part.slice(2, -2), true, index);
        }
        if (/^\\{1,2}\[/.test(part)) {
          const math = part.replace(/^\\{1,2}\[/, '').replace(/\\{1,2}\]$/, '');
          return renderMath(part, math, true, index);
        }

        // Inline math
        if (part.length > 1 && part.startsWith('$') && part.endsWith('$')) {
          return renderMath(part, part.slice(1, -1), false, index);
        }
        if (/^\\{1,2}\(/.test(part)) {
          const math = part.replace(/^\\{1,2}\(/, '').replace(/\\{1,2}\)$/, '');
          return renderMath(part, math, false, index);
        }

        // Plain text
        return (
          <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
            {part}
          </span>
        );
      })}
    </div>
  );
}

export default MathText;
