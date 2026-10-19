import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SidebarShell from '../../components/SidebarShell.jsx';
import { SearchField } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { groupByCategory } from './registry.js';

/** The app's own sidebar design, filled with the component list. Search lives in its top slot. */
function UiKitSidebar({ results, query, onQuery, searchRef }) {
  const wrap = useRef(null);

  const entries = useMemo(
    () => groupByCategory(results).flatMap(({ category, items }) => [
      { key: `h-${category}`, heading: category },
      ...items.map((e) => ({ key: e.id, label: e.name, to: `/ui-kit/${e.id}` })),
    ]),
    [results],
  );

  return (
    <SidebarShell
      homeTo="/"
      homeLabel="Testflow home"
      items={[]}
      topSlot={
        <div ref={wrap} className="space-y-1.5">
          <SearchField
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onClear={() => onQuery('')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                document.querySelector('[data-kit-entry]')?.focus();
              }
            }}
            placeholder="Search ( / )"
            aria-label="Search components by name, category or keyword"
          />
          <p className="px-2 text-xs text-[#6f7a73]" role="status" aria-live="polite">
            {query ? `${results.length} match${results.length === 1 ? '' : 'es'}` : `${results.length} components`}
          </p>
        </div>
      }
      list={{ title: 'Components', entries, highlightActive: true, emptyText: query ? `Nothing matches "${query}". Try a category like Forms, or a word like toast.` : undefined }}
      footer={
        <div className="flex h-11 shrink-0 items-center px-2.5">
          <Link to="/" className="flex h-9 items-center gap-2.5 rounded-[10px] px-2 text-[15px] text-[#3d4a43] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft {...ICON} /> Back to Testflow
          </Link>
        </div>
      }
    />
  );
}

export default UiKitSidebar;
