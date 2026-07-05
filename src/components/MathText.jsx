import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Renders text with LaTeX support using react-katex.
 *
 * Supports:
 * - Inline math: \( ... \) or $ ... $
 * - Block math: \[ ... \] or $$ ... $$
 */
function MathText({ children, className }) {
  // If children is not a string, we might have a mix of elements.
  // We only want to process the string content for LaTeX.
  if (typeof children !== 'string') {
    return <div className={className}>{children}</div>;
  }

  const text = children;

  // Regex to find $$block$$, $inline$, \(inline\), or \[block\]
  // Use [\s\S] to match across multiple lines
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\\\([\s\S]*?\\\\\)|\\\\\[[\s\S]*?\\\\\])/g;
  const parts = text.split(regex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('\\['))) {
          // Block math
          const math = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
          return <BlockMath key={index} math={math} />;
        } else if ((part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\('))) {
          // Inline math
          const math = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
          return <InlineMath key={index} math={math} />;
        } else {
          // Plain text
          return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
        }
      })}
    </div>
  );
}

export default MathText;
