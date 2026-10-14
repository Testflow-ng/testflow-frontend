import { useState } from 'react';
import { Download, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button, Card, useToast } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { downloadEntryZip } from './download.js';
import CodePanel from './CodePanel.jsx';
import Controls from './Controls.jsx';
import { defaultsFor } from './registry.js';
import PreviewBoundary from './PreviewBoundary.jsx';

/** One documented component: optional props playground, live preview on the left, code on the right. Remounted per entry. */
function KitEntry({ entry }) {
  const toast = useToast();
  const [values, setValues] = useState(() => defaultsFor(entry));
  const [showCode, setShowCode] = useState(true);
  const [zipping, setZipping] = useState(false);

  const zip = async () => {
    setZipping(true);
    try {
      await downloadEntryZip(entry, values);
      toast.success('Zip downloaded');
    } catch {
      toast.error('Could not build the zip', 'Try again.');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {entry.controls && <Controls controls={entry.controls} values={values} onChange={setValues} />}
      <div className={showCode ? 'grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_27rem]' : 'grid gap-8'}>
        <section aria-label="Live preview" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Preview</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" loading={zipping} onClick={zip} leadingIcon={<Download {...ICON} />}>Download zip</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCode((v) => !v)} aria-pressed={showCode} leadingIcon={showCode ? <PanelRightClose {...ICON} /> : <PanelRightOpen {...ICON} />}>{showCode ? 'Hide code' : 'Show code'}</Button>
            </div>
          </div>
          <Card padding="lg" className="min-w-0 overflow-x-auto p-6 sm:p-8">
            <PreviewBoundary resetKey={entry.id}>
              <entry.Preview {...values} />
            </PreviewBoundary>
          </Card>
        </section>
        {showCode && (
          <section aria-label="Code" className="min-w-0">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Code</h3>
            <CodePanel entry={entry} values={values} />
          </section>
        )}
      </div>
    </div>
  );
}

export default KitEntry;
