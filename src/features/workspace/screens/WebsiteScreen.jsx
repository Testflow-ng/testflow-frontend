import { useState } from 'react';
import { Banner, Card, Field, Input, SkeletonCard, StickyActionBar, Switch, Tabs, TabPanel, Textarea, useToast } from '../../../components/ui/index.js';
import BlockList from '../../../components/everybody/BlockList.jsx';
import BlockEditor from '../../../components/everybody/BlockEditor.jsx';
import ColorPicker from '../../../components/everybody/ColorPicker.jsx';
import DevicePreview from '../../../components/everybody/DevicePreview.jsx';
import ImageField from '../../../components/everybody/ImageField.jsx';
import PublishBar from '../../../components/everybody/PublishBar.jsx';
import { SiteRenderer } from '../../../components/everybody/SiteBlocks.jsx';
import TemplatePicker from '../../../components/everybody/TemplatePicker.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { useExams, useSite, useWsMutation } from '../useWorkspace.js';

const TEMPLATES = [{ key: 'classic', name: 'Classic', description: 'Header, hero and a grid' }, { key: 'modern', name: 'Modern', description: 'Bold banner and cards' }, { key: 'minimal', name: 'Minimal', description: 'Quiet and text-led' }];
const TABS = [{ value: 'landing', label: 'Landing page' }, { value: 'portal', label: 'Student side' }, { value: 'pages', label: 'Pages' }, { value: 'brand', label: 'Brand' }];
const PAGES = [
  ['exams', 'Exams', 'Where students find and start their exams.'],
  ['results', 'Results', 'Students see their scores and corrections.'],
  ['library', 'Library', 'Books and notes, free or paid.'],
  ['community', 'Community', 'Announcements and discussion.'],
  ['leaderboard', 'Leaderboard', 'Top scores in your exams.'],
  ['about', 'About', 'Your story.'],
  ['contact', 'Contact', 'How students reach you.'],
];

const move = (list, id, d) => { const i = list.findIndex((b) => b.id === id); const j = i + d; if (j < 0 || j >= list.length) return list; const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; return n; };
const blank = (type) => ({ id: `n${Date.now()}${type}`, type, title: '', text: '', items: [] });

/** The no-code editor: change words and pictures on the landing page and the student side, switch pages on or off, set the brand. */
function WebsiteScreen() {
  const { data, isLoading, error } = useSite();
  if (isLoading || !data) return <Screen width="full"><SkeletonCard className="mt-8 h-96" /></Screen>;
  if (error) return <Screen width="full"><Banner variant="danger">Could not load your site.</Banner></Screen>;
  return <Editor key={data.version ?? 0} site={data} />;
}

function Editor({ site }) {
  const toast = useToast();
  const { org, orgId } = useOrg();
  const exams = useExams().data ?? [];
  const [draft, setDraft] = useState(site);
  const [tab, setTab] = useState('landing');
  const [sel, setSel] = useState({ landing: site.landing?.sections?.[0]?.id, portal: site.portal?.sections?.[0]?.id });
  const dirty = JSON.stringify(draft) !== JSON.stringify(site);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const upload = (file) => wsApi.uploadSiteImage(orgId, file);

  const save = useWsMutation((id, body) => wsApi.saveSite(id, body), { onSuccess: () => toast.success('Draft saved'), onError: (e) => toast.error('Could not save', e.message) });
  const publish = useWsMutation(async (id, body) => { await wsApi.saveSite(id, body); return wsApi.publishSite(id); }, { onSuccess: () => toast.success('Published', 'Your site is live.'), onError: (e) => toast.error('Could not publish', e.message) });

  const surface = tab === 'portal' ? 'portal' : 'landing';
  const sections = draft[surface]?.sections ?? [];
  const setSections = (next) => set({ [surface]: { ...draft[surface], sections: next } });

  const navItems = PAGES.filter(([k]) => draft.pages?.[k]).map(([k, label]) => ({ label, href: `#${k}` }));
  const welcome = draft.portal?.welcome ?? {};
  const previewSections = tab === 'portal'
    ? [{ id: 'welcome', type: 'hero', heading: welcome.heading, subheading: welcome.text, imageUrl: welcome.imageUrl }, ...sections]
    : sections;
  const config = { brand: { ...draft.brand, name: draft.brand?.name ?? org.name }, nav: navItems, sections: previewSections, footer: draft.footer ?? { text: `© ${draft.brand?.name ?? org.name}`, links: [] } };
  const preview = <DevicePreview><SiteRenderer config={config} data={{ exams: exams.filter((e) => e.status === 'published').map((e) => ({ id: e.id, title: e.title, meta: `${e.questionCount ?? 0} questions · ${e.durationMinutes} min` })) }} /></DevicePreview>;

  return (
    <Screen width="full">
      <PageHeader title="Website" subtitle="Change the words, pictures and pages students see. Nothing goes live until you publish." />
      <div className="mt-6 space-y-6 pb-24">
        <PublishBar hasUnpublished={dirty || !site.publishedAt || site.hasUnpublished} publishedAt={site.publishedAt} version={site.version} onPublish={() => publish.mutate(draft)} onPreview={() => setTab(tab === 'pages' || tab === 'brand' ? 'landing' : tab)} />
        <Tabs idPrefix="site" label="Site sections" items={TABS} value={tab} onValueChange={setTab} />

        {['landing', 'portal'].map((t) => (
          <TabPanel key={t} idPrefix="site" value={t} active={tab}>
            {t === 'portal' && (
              <Card padding="lg" className="mb-6 space-y-4">
                <div><h2 className="font-heading text-base font-bold text-foreground-strong">Welcome message</h2><p className="text-sm text-muted">The first thing a student sees after signing in.</p></div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Field label="Heading"><Input value={welcome.heading ?? ''} maxLength={80} onChange={(e) => set({ portal: { ...draft.portal, welcome: { ...welcome, heading: e.target.value } } })} /></Field>
                    <Field label="Message"><Textarea rows={3} value={welcome.text ?? ''} maxLength={300} onChange={(e) => set({ portal: { ...draft.portal, welcome: { ...welcome, text: e.target.value } } })} /></Field>
                  </div>
                  <ImageField label="Picture" value={welcome.imageUrl} upload={upload} onChange={(url) => set({ portal: { ...draft.portal, welcome: { ...welcome, imageUrl: url } } })} />
                </div>
              </Card>
            )}
            <div className="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
              <div className="space-y-6">
                <BlockList blocks={sections} selectedId={sel[surface]} onSelect={(id) => setSel((s) => ({ ...s, [surface]: id }))} onMove={(id, d) => setSections(move(sections, id, d))} onRemove={(id) => setSections(sections.filter((b) => b.id !== id))} onAdd={(type) => { const b = blank(type); setSections([...sections, b]); setSel((s) => ({ ...s, [surface]: b.id })); }} />
                <Card padding="lg"><BlockEditor upload={upload} block={sections.find((b) => b.id === sel[surface])} onChange={(nb) => setSections(sections.map((b) => (b.id === nb.id ? nb : b)))} /></Card>
              </div>
              <div className="min-w-0">{preview}</div>
            </div>
          </TabPanel>
        ))}

        <TabPanel idPrefix="site" value="pages" active={tab}>
          <Card padding="lg" className="max-w-2xl space-y-1">
            <h2 className="font-heading text-base font-bold text-foreground-strong">Pages</h2>
            <p className="pb-3 text-sm text-muted">Turn off any page you do not want. It disappears from the menu and the address stops working.</p>
            <ul className="divide-y divide-border">
              {PAGES.map(([key, label, hint]) => (
                <li key={key} className="flex items-center justify-between gap-4 py-3.5">
                  <div><p className="text-sm font-semibold text-foreground-strong">{label}</p><p className="text-xs text-muted">{hint}</p></div>
                  <Switch checked={Boolean(draft.pages?.[key])} onCheckedChange={(v) => set({ pages: { ...draft.pages, [key]: v } })} aria-label={`Show the ${label} page`} />
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel idPrefix="site" value="brand" active={tab}>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card padding="lg" className="space-y-5">
              <h2 className="font-heading text-base font-bold text-foreground-strong">Your name and logo</h2>
              <Field label="Name" hint="Shown in the header, the browser tab and when your link is shared."><Input value={draft.brand?.name ?? ''} maxLength={60} onChange={(e) => set({ brand: { ...draft.brand, name: e.target.value } })} /></Field>
              <Field label="Tagline"><Input value={draft.brand?.tagline ?? ''} maxLength={100} onChange={(e) => set({ brand: { ...draft.brand, tagline: e.target.value } })} /></Field>
              <ImageField label="Logo" value={draft.brand?.logoUrl} upload={upload} onChange={(url) => set({ brand: { ...draft.brand, logoUrl: url } })} />
            </Card>
            <Card padding="lg" className="space-y-5">
              <h2 className="font-heading text-base font-bold text-foreground-strong">Colours and look</h2>
              <ColorPicker label="Main colour" value={draft.brand?.primaryColor ?? '#163a5f'} onChange={(c) => set({ brand: { ...draft.brand, primaryColor: c } })} />
              <ColorPicker label="Accent colour" checkContrast={false} value={draft.brand?.accentColor ?? '#f5c542'} onChange={(c) => set({ brand: { ...draft.brand, accentColor: c } })} />
              <TemplatePicker templates={TEMPLATES} value={draft.template ?? 'modern'} onValueChange={(v) => set({ template: v })} />
            </Card>
          </div>
        </TabPanel>
      </div>
      <StickyActionBar dirty={dirty} onDiscard={() => setDraft(site)} onSave={() => save.mutate(draft)} />
    </Screen>
  );
}

export default WebsiteScreen;
