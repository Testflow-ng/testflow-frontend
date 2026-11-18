import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Skeleton } from '../../../components/ui/index.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * One page of a PDF, rendered onto a canvas. The parent owns `page`; this component owns fetching
 * the document and rasterising the requested page. `onPages` reports the page count once the file
 * has loaded, so the parent can clamp and persist progress against the real document size.
 *
 * Load or render failures surface through `onError` rather than throwing; the parent renders the
 * error state.
 */
function PdfReader({ url, page, onPages, onError }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  /* Keyed by url so a stale document never paints after the url changes — no reset effect needed. */
  const [loaded, setLoaded] = useState({ url: null, doc: null });
  const [resizeTick, setResizeTick] = useState(0);

  /* Load the document once per url. The task is destroyed on unmount or url change so a 50 MB
     file is never buffered twice. */
  useEffect(() => {
    let cancelled = false;
    const task = pdfjsLib.getDocument({ url, withCredentials: true });
    task.promise.then(
      (loadedDoc) => {
        if (cancelled) return;
        setLoaded({ url, doc: loadedDoc });
        onPages?.(loadedDoc.numPages);
      },
      (err) => {
        if (cancelled) return;
        console.error('Could not load the PDF', err);
        onError?.(err ?? new Error('Could not open this book.'));
      },
    );
    return () => {
      cancelled = true;
      task.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const doc = loaded.url === url ? loaded.doc : null;

  /* Re-rasterise on window resize so the page always fills the column. */
  useEffect(() => {
    const onResize = () => setResizeTick((tick) => tick + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!doc) return undefined;
    let cancelled = false;
    let renderTask = null;

    doc.getPage(Math.min(Math.max(1, page), doc.numPages)).then(
      (pdfPage) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const containerWidth = wrapperRef.current?.clientWidth ?? 800;
        const base = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(Math.max(containerWidth / base.width, 0.5), 2.5);
        const viewport = pdfPage.getViewport({ scale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        renderTask = pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport });
        renderTask.promise.catch((err) => {
          if (err?.name === 'RenderingCancelledException') return;
          console.error('Could not render the PDF page', err);
          onError?.(err);
        });
      },
      (err) => onError?.(err),
    );

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, page, resizeTick]);

  return (
    <div ref={wrapperRef} className="w-full" aria-label="Book page">
      {!doc ? <Skeleton className="aspect-[3/4] w-full rounded-2xl" /> : null}
      <canvas
        ref={canvasRef}
        className={doc ? 'mx-auto block h-auto w-full max-w-full rounded-lg shadow-[0_1px_2px_rgba(27,67,50,0.08)]' : 'hidden'}
      />
    </div>
  );
}

export default PdfReader;
