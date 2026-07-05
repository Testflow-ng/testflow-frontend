import { useEffect, useRef } from 'react';

/**
 * Renders text with LaTeX support.
 * Uses KaTeX for performance.
 *
 * Supports:
 * - Inline math: $E = mc^2$
 * - Block math: $$ \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} $$
 */
function MathText({ children, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!window.katex) {
      // If KaTeX isn't loaded yet, just show plain text as a fallback
      containerRef.current.textContent = String(children || '');
      return;
    }

    const text = String(children || '');
    const container = containerRef.current;

    // Clear container
    container.innerHTML = '';

    // Regex to find $$block$$, $inline$, \(inline\), or \[block\]
    // Use [\s\S] instead of . to match across multiple lines (important for MTH derivations)
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\(.*?\\\)|\\\[[\s\S]*?\\\])/g;
    const parts = text.split(regex);

    parts.forEach(part => {
      if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('\\[') && part.endsWith('\\]'))) {
        // Block math
        const math = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
        const el = document.createElement('div');
        el.className = 'my-4 flex justify-center overflow-x-auto';
        try {
          window.katex.render(math, el, { displayMode: true, throwOnError: false });
        } catch (e) {
          el.textContent = part;
        }
        container.appendChild(el);
      } else if ((part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'))) {
        // Inline math
        const math = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
        const el = document.createElement('span');
        try {
          window.katex.render(math, el, { displayMode: false, throwOnError: false });
        } catch (e) {
          el.textContent = part;
        }
        container.appendChild(el);
      } else {
        // Plain text
        const el = document.createTextNode(part);
        container.appendChild(el);
      }
    });
  }, [children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export default MathText;
