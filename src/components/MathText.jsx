import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Renders text that may contain LaTeX. Supported delimiters (one or two
 * backslashes, to tolerate different import/escaping formats):
 *   inline:  $ ... $     \( ... \)
 *   block:   $$ ... $$    \[ ... \]
 *
 * Invalid LaTeX renders as its raw source (in danger color) instead of
 * throwing, so a single bad expression can never crash an exam.
 */
const SEGMENT =
  /(\$\$[\s\S]*?\$\$|\$[\s\S]+?\$|\\{1,2}\([\s\S]*?\\{1,2}\)|\\{1,2}\[[\s\S]*?\\{1,2}\])/g;

const rawFallback = (source) => () => <span className="text-danger">{source}</span>;

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
          return <BlockMath key={index} math={part.slice(2, -2)} renderError={rawFallback(part)} />;
        }
        if (/^\\{1,2}\[/.test(part)) {
          const math = part.replace(/^\\{1,2}\[/, '').replace(/\\{1,2}\]$/, '');
          return <BlockMath key={index} math={math} renderError={rawFallback(part)} />;
        }

        // Inline math
        if (part.length > 1 && part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={index} math={part.slice(1, -1)} renderError={rawFallback(part)} />;
        }
        if (/^\\{1,2}\(/.test(part)) {
          const math = part.replace(/^\\{1,2}\(/, '').replace(/\\{1,2}\)$/, '');
          return <InlineMath key={index} math={math} renderError={rawFallback(part)} />;
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
