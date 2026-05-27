import { toPng } from 'html-to-image';
import { ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Section } from '@/components/panel/panel-fields';
import { PanelShell, usePanelMount } from '@/components/panel/panel-shell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SlideMeta } from '@/lib/sdk';
import { format, useLocale } from '@/lib/use-locale';

const DESCRIPTION_DEBOUNCE_MS = 600;

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === 'string' && body.error.length > 0) return body.error;
  } catch {}
  return `HTTP ${res.status}`;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

type OgPanelProps = {
  open: boolean;
  onClose: () => void;
  slideId: string;
  meta: SlideMeta | undefined;
};

export function OgPanel({ open, onClose, slideId, meta }: OgPanelProps) {
  const { mounted, animVisible } = usePanelMount(open);
  const t = useLocale();
  const [description, setDescription] = useState(meta?.description ?? '');
  const composingRef = useRef(false);
  const [capturing, setCapturing] = useState(false);
  const [previewToken, setPreviewToken] = useState(() => Date.now());
  const [sessionHasImage, setSessionHasImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewSlideIdRef = useRef(slideId);

  useEffect(() => {
    if (!composingRef.current) setDescription(meta?.description ?? '');
  }, [meta?.description]);

  useEffect(() => {
    if (previewSlideIdRef.current === slideId) return;
    previewSlideIdRef.current = slideId;
    setSessionHasImage(false);
  }, [slideId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh the cache-busting token when the source-level ogImage changes (e.g. another tool patched the file)
  useEffect(() => {
    setPreviewToken(Date.now());
  }, [meta?.ogImage]);

  const saveDescription = useCallback(
    async (value: string) => {
      try {
        const res = await fetch(`/__og-meta/${slideId}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ description: value }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        toast.error(t.ogPanel.toastDescriptionSaveFailed);
      }
    },
    [slideId, t.ogPanel.toastDescriptionSaveFailed],
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueSave = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveDescription(value), DESCRIPTION_DEBOUNCE_MS);
    },
    [saveDescription],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCapture = useCallback(async () => {
    const el = document.querySelector<HTMLElement>('[data-osd-canvas-primary]');
    if (!el) {
      toast.error(t.ogPanel.toastCaptureFailed);
      return;
    }
    setCapturing(true);
    try {
      const dataUrl = await toPng(el, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: false,
        style: { transform: 'none', transformOrigin: 'top left' },
      });
      const blob = await (await fetch(dataUrl)).blob();
      const res = await fetch(`/__og-image/${slideId}`, {
        method: 'POST',
        headers: { 'content-type': 'image/png' },
        body: blob,
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setSessionHasImage(true);
      setPreviewToken(Date.now());
      toast.success(format(t.ogPanel.toastCaptured, { size: Math.round(blob.size / 1024) }));
    } catch (err) {
      toast.error(errorMessage(err, t.ogPanel.toastCaptureFailed));
    } finally {
      setCapturing(false);
    }
  }, [slideId, t.ogPanel.toastCaptured, t.ogPanel.toastCaptureFailed]);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const res = await fetch(`/__og-image/${slideId}`, {
          method: 'POST',
          headers: { 'content-type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!res.ok) throw new Error(await readErrorMessage(res));
        setSessionHasImage(true);
        setPreviewToken(Date.now());
        toast.success(format(t.ogPanel.toastCaptured, { size: Math.round(file.size / 1024) }));
      } catch (err) {
        toast.error(errorMessage(err, t.ogPanel.toastCaptureFailed));
      }
    },
    [slideId, t.ogPanel.toastCaptured, t.ogPanel.toastCaptureFailed],
  );

  if (!mounted) return null;

  const localPreviewUrl = `/__og-image/${slideId}?t=${previewToken}`;
  const metadataPreviewUrl = meta?.ogImage?.startsWith('@assets/')
    ? `/__assets/@global/${encodeURIComponent(meta.ogImage.slice('@assets/'.length))}?t=${previewToken}`
    : meta?.ogImage
      ? localPreviewUrl
      : null;
  const previewUrl = sessionHasImage ? localPreviewUrl : metadataPreviewUrl;
  const title = meta?.title ?? slideId;

  return (
    <PanelShell
      uiAttr="design"
      animVisible={animVisible}
      header={
        <>
          <div className="flex min-w-0 items-center gap-2">
            <ImageIcon className="size-3.5 text-muted-foreground" />
            <span className="font-heading text-[12px] font-semibold tracking-tight">
              {t.ogPanel.title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label={t.ogPanel.closePanelAria}
          >
            <X className="size-3.5" />
          </Button>
        </>
      }
    >
      <Section title={t.ogPanel.titleSection}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground"
            title={title}
          >
            {title}
          </span>
        </div>
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground/80">
          {t.ogPanel.titleHint}
        </p>
      </Section>

      <Separator />

      <Section title={t.ogPanel.descriptionSection}>
        <Textarea
          value={description}
          placeholder={t.ogPanel.descriptionPlaceholder}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            const v = e.currentTarget.value;
            setDescription(v);
            queueSave(v);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setDescription(v);
            if (!composingRef.current) queueSave(v);
          }}
          rows={3}
          maxLength={300}
          className="field-sizing-content min-h-16 w-full resize-none text-xs leading-relaxed"
        />
      </Section>

      <Separator />

      <Section title={t.ogPanel.imageSection}>
        <div className="flex flex-col gap-2">
          {previewUrl ? (
            <div className="overflow-hidden rounded-md border border-hairline bg-muted/40">
              <img
                src={previewUrl}
                alt=""
                className="block h-auto w-full"
                style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-md border border-dashed border-hairline bg-muted/30 px-3 py-6 text-center text-[11px] leading-relaxed text-muted-foreground"
              style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
            >
              <span className="flex max-w-[200px] flex-col items-center gap-1.5">
                <ImageIcon className="size-4 opacity-60" />
                {t.ogPanel.noImage}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleCapture}
              disabled={capturing}
              className="flex-1"
            >
              {capturing ? t.ogPanel.capturingLabel : t.ogPanel.captureButton}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={capturing}
              title={t.ogPanel.uploadButton}
              aria-label={t.ogPanel.uploadButton}
            >
              <Upload className="size-3.5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </Section>
    </PanelShell>
  );
}
