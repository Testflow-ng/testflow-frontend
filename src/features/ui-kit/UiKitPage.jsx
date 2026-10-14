import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Monitor, Package } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import { ENTRIES, searchEntries } from './registry.js';
import UiKitSidebar from './UiKitSidebar.jsx';
import KitEntry from './KitEntry.jsx';

/** Developer reference for the shared components. Desktop only: phones get a short note instead. */
function UiKitPage() {
  const { id } = useParams();
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const results = useMemo(() => searchEntries(query), [query]);
  const entry = ENTRIES.find((e) => e.id === id);

  // "/" jumps to the search box, like most docs sites.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!entry) return <Navigate to={`/ui-kit/${ENTRIES[0].id}`} replace />;

  return (
    <>
      <div className="lg:hidden">
        <div className="mx-auto flex min-h-svh max-w-[26rem] flex-col items-center justify-center gap-5 px-6 text-center">
          <Mascot mood="thinking" size={96} />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">The UI Kit is made for desktop</h1>
          <p className="text-sm leading-relaxed text-muted">It shows live components next to their code, which needs a wide screen. Open this page on a laptop or desktop.</p>
          <Link to="/"><Button variant="outline" leadingIcon={<Monitor size={16} />}>Back to Testflow</Button></Link>
        </div>
      </div>

      <div className="hidden lg:block">
        <UiKitSidebar results={results} query={query} onQuery={setQuery} searchRef={searchRef} />

        <div className="mx-auto w-full max-w-[100rem] px-8 pb-24 pt-12 2xl:px-12">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Developers</p>
              <h1 className="mt-2 font-heading text-[2rem] font-extrabold leading-tight tracking-tight text-foreground-strong">UI Kit</h1>
              <p className="mt-2 text-[15px] text-muted">Every shared component, live. Pick one in the sidebar, try it, then copy its code.</p>
            </div>
            <Badge variant="outline"><Package size={12} aria-hidden="true" /> {ENTRIES.length} components</Badge>
          </header>

          <main className="mt-10" aria-labelledby="entry-title">
            {results.length === 0 ? (
              <Card padding="lg" className="text-center">
                <p className="font-heading text-lg font-bold text-foreground-strong">No component matches "{query}"</p>
                <p className="mt-1 text-sm text-muted">Try a category such as Forms or Feedback, or a word like toast or table.</p>
                <Button variant="outline" className="mt-5" onClick={() => setQuery('')}>Clear search</Button>
              </Card>
            ) : (
              <>
                <div className="mb-8 max-w-[70ch]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{entry.category}</p>
                  <h2 id="entry-title" className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{entry.name}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{entry.description}</p>
                </div>
                <KitEntry key={entry.id} entry={entry} />
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default UiKitPage;
