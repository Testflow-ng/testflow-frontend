import { useEffect, useState } from 'react';

/*
  Real component source, read as text at build time. Only the shared component folders are included
  (no env files, no server code). Each file becomes its own small lazy chunk, fetched when its tab opens.
*/
const files = import.meta.glob('../../components/{ui,data,exam,marketing,ads,everybody,brand,layout}/*.{jsx,js}', {
  query: '?raw',
  import: 'default',
});

const rootFiles = import.meta.glob('../../components/{AccountMenu,ProductSwitcher,SidebarShell}.jsx', { query: '?raw', import: 'default' });
const key = (path) => `../../components/${path}`;

/** Reads source files once, outside React (used by the zip download). Returns [{ path, code }]. */
export async function loadSources(paths) {
  return Promise.all(
    paths.map(async (p) => {
      const load = files[key(p)] ?? rootFiles[key(p)];
      return { path: `src/components/${p}`, code: load ? await load() : '// Source not available.' };
    }),
  );
}

/** Loads the source of `paths` (relative to src/components). Returns `{ items: [{ path, code }], loading }`. */
export function useSource(paths, enabled) {
  const [state, setState] = useState({ for: '', items: [] });
  const id = paths.join('|');

  useEffect(() => {
    if (!enabled || !paths.length) return undefined;
    let live = true;
    Promise.all(
      paths.map(async (p) => {
        const load = files[key(p)] ?? rootFiles[key(p)];
        return { path: `src/components/${p}`, code: load ? await load() : '// Source not available.' };
      }),
    ).then((items) => live && setState({ for: id, items }));
    return () => {
      live = false;
    };
    // `id` is the stable identity of `paths`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled]);

  return { items: state.for === id ? state.items : [], loading: enabled && paths.length > 0 && state.for !== id };
}
