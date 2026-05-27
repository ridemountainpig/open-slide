import fs from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import path from 'node:path';
import type { ViteDevServer } from 'vite';
import {
  resolveSlideEntry,
  SLIDE_ID_RE,
  updateMetaFieldInSource,
} from '../../editing/slide-ops.ts';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { type ApiContext, json, readBody } from './context.ts';

const OG_IMAGE_BASENAME = 'og-image';
const OG_IMAGE_EXTS = ['png', 'jpg', 'webp'] as const;
const OG_IMAGE_MAX_BYTES = 16 * 1024 * 1024;

function readRequestBody(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };
    req.on('data', (c: Buffer) => {
      if (settled) return;
      received += c.length;
      if (received > maxBytes) {
        settle(() => reject(new Error('too large')));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => settle(() => resolve(Buffer.concat(chunks))));
    // 'close' fires for both a clean response and an abort. If 'end' didn't
    // fire first, the upload was truncated — reject so callers don't commit
    // a partial buffer to disk.
    req.on('close', () => settle(() => reject(new Error('aborted'))));
    req.on('error', (err) => settle(() => reject(err)));
  });
}

const CONTENT_TYPE_TO_EXT: Record<string, 'png' | 'jpg' | 'webp'> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

function parseContentType(raw: string | string[] | undefined): string {
  const first = Array.isArray(raw) ? raw[0] : raw;
  return (first ?? '').split(';', 1)[0]?.trim().toLowerCase() ?? '';
}

function contentTypeForExt(ext: string): string {
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function findExistingOgImage(
  slideDir: string,
): Promise<{ filePath: string; ext: string } | null> {
  for (const ext of OG_IMAGE_EXTS) {
    const filePath = path.join(slideDir, `${OG_IMAGE_BASENAME}.${ext}`);
    try {
      await fs.access(filePath);
      return { filePath, ext };
    } catch {}
  }
  return null;
}

export function registerOgRoutes(server: ViteDevServer, ctx: ApiContext): void {
  server.middlewares.use('/__og-image', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';
    const idMatch = url.pathname.match(/^\/([^/]+)$/);
    if (!idMatch) return next();
    const slideId = idMatch[1];
    if (!SLIDE_ID_RE.test(slideId)) return json(res, 400, { error: 'invalid slideId' });

    const entry = resolveSlideEntry(ctx.slidesRoot, slideId);
    if (!entry) return json(res, 400, { error: 'invalid slideId' });
    const slideDir = path.dirname(entry);

    try {
      if (method === 'GET') {
        const existing = await findExistingOgImage(slideDir);
        if (!existing) return json(res, 404, { error: 'og image not found' });
        const buf = await fs.readFile(existing.filePath);
        res.statusCode = 200;
        res.setHeader('content-type', contentTypeForExt(existing.ext));
        res.setHeader('cache-control', 'no-store');
        res.end(buf);
        return;
      }

      if (method === 'POST') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }

        const contentType = parseContentType(req.headers['content-type']);
        const ext = CONTENT_TYPE_TO_EXT[contentType];
        if (!ext) {
          return json(res, 415, {
            error: `unsupported content-type '${contentType || '(missing)'}'; expected image/png, image/jpeg, or image/webp`,
          });
        }

        let buf: Buffer;
        try {
          buf = await readRequestBody(req, OG_IMAGE_MAX_BYTES);
        } catch (err) {
          const message = (err as Error).message;
          if (message === 'aborted') return json(res, 499, { error: 'upload aborted' });
          if (message === 'too large') {
            return json(res, 413, {
              error: `request body exceeds ${OG_IMAGE_MAX_BYTES} bytes`,
            });
          }
          throw err;
        }
        if (buf.length === 0) {
          return json(res, 400, { error: 'empty request body' });
        }

        // Stage all the planned mutations in memory first, so a failing
        // updateMetaFieldInSource never leaves us with a half-applied state
        // (new image on disk + old image deleted + source unchanged).
        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'slide not found' });
        }
        const fileName = `${OG_IMAGE_BASENAME}.${ext}`;
        const patched = updateMetaFieldInSource(source, 'ogImage', `./${fileName}`);
        if (patched === null) {
          return json(res, 422, {
            error: 'could not locate a safe place to write meta.ogImage in index.tsx',
          });
        }

        const imgPath = path.join(slideDir, fileName);
        await fs.writeFile(imgPath, buf);
        if (patched !== source) {
          await fs.writeFile(entry, patched, 'utf8');
        }
        // Cleanup other formats last — even if it fails, the new image and
        // patched source already agree, so the slide stays consistent.
        await Promise.all(
          OG_IMAGE_EXTS.filter((other) => other !== ext).map(async (other) => {
            try {
              await fs.unlink(path.join(slideDir, `${OG_IMAGE_BASENAME}.${other}`));
            } catch {}
          }),
        );

        return json(res, 200, {
          ok: true,
          slideId,
          size: buf.length,
          url: `/__og-image/${slideId}?t=${Date.now()}`,
        });
      }

      return next();
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });

  server.middlewares.use('/__og-meta', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';
    if (method !== 'PATCH') return next();
    const idMatch = url.pathname.match(/^\/([^/]+)$/);
    if (!idMatch) return next();
    const slideId = idMatch[1];
    if (!SLIDE_ID_RE.test(slideId)) return json(res, 400, { error: 'invalid slideId' });

    const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
    if (!requestCheck.ok) return json(res, requestCheck.status, { error: requestCheck.error });

    try {
      const body = (await readBody(req)) as { description?: unknown };
      if (body.description !== undefined && typeof body.description !== 'string') {
        return json(res, 400, { error: 'description must be a string' });
      }
      if (typeof body.description !== 'string') {
        return json(res, 400, { error: 'missing description' });
      }

      const entry = resolveSlideEntry(ctx.slidesRoot, slideId);
      if (!entry) return json(res, 400, { error: 'invalid slideId' });

      let source: string;
      try {
        source = await fs.readFile(entry, 'utf8');
      } catch {
        return json(res, 404, { error: 'slide not found' });
      }

      const patched = updateMetaFieldInSource(source, 'description', body.description);
      if (patched === null) {
        return json(res, 422, {
          error: 'could not locate a safe place to write meta.description in index.tsx',
        });
      }
      if (patched !== source) {
        await fs.writeFile(entry, patched, 'utf8');
      }
      return json(res, 200, { ok: true, slideId, description: body.description });
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });
}
