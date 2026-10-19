import foundations from './entries/foundations.jsx';
import forms from './entries/forms.jsx';
import feedback from './entries/feedback.jsx';
import navigation from './entries/navigation.jsx';
import data from './entries/data.jsx';
import library from './entries/library.jsx';
import exam from './entries/exam.jsx';
import marketing from './entries/marketing.jsx';
import ads from './entries/ads.jsx';
import everybody from './entries/everybody.jsx';

/**
 * The UI Kit registry. To add a component: add an entry to the matching file in ./entries (or a new file listed here).
 *
 *   id          unique slug, used in the URL (/ui-kit/:id)
 *   name        shown in the list
 *   category    groups the list; new categories appear automatically
 *   description one line
 *   keywords    extra words the search matches
 *   Preview     a React component rendering the REAL component (own state is fine)
 *   usage       a short written example, with imports
 *   source      optional path(s) under src/components, shown as the real source
 */
export const ENTRIES = [...foundations, ...forms, ...feedback, ...navigation, ...data, ...library, ...exam, ...marketing, ...ads, ...everybody];

export const CATEGORY_ORDER = ['Foundations', 'Forms', 'Feedback', 'Navigation', 'Data', 'Library', 'Exam', 'Marketing', 'Ads', 'Everyone'];

const norm = (s) => String(s).toLowerCase();

/** Entries matching `query` on name, category, description or keywords. Empty query returns everything. */
export function searchEntries(query) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return ENTRIES;
  return ENTRIES.filter((e) => {
    const haystack = norm([e.name, e.category, e.description, ...(e.keywords ?? [])].join(' '));
    return words.every((w) => haystack.includes(w));
  });
}

/** [{ category, items }] in display order. */
export function groupByCategory(entries) {
  const cats = [...new Set(entries.map((e) => e.category))].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
  return cats.map((category) => ({ category, items: entries.filter((e) => e.category === category) }));
}

/** Starting values for an entry's props playground. */
export const defaultsFor = (entry) => Object.fromEntries((entry.controls ?? []).map((c) => [c.key, c.default]));
