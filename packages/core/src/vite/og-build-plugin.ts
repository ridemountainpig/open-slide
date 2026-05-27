import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { OpenSlideConfig } from '../config.ts';
import { findSlides, readSlideMeta, toSlideId } from './open-slide-plugin.ts';

export type OgBuildPluginOptions = {
  userCwd: string;
  config: OpenSlideConfig;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isInside(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

// Resolve an author-supplied `meta.ogImage` path, refusing anything that
// escapes the deck root. Without this check, a slide could set
// `ogImage: '../../../.env'` and the build would copy that file into
// `dist/og/<slideId>.env`, exposing it on the deploy.
function resolveOgImageSource(
  imagePath: string,
  slideDir: string,
  userCwd: string,
  assetsRoot: string,
): string | null {
  let resolved: string;
  if (imagePath.startsWith('@assets/')) {
    resolved = path.resolve(assetsRoot, imagePath.slice('@assets/'.length));
  } else if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
    resolved = path.resolve(slideDir, imagePath);
  } else if (path.isAbsolute(imagePath)) {
    resolved = imagePath;
  } else {
    resolved = path.resolve(userCwd, imagePath);
  }
  if (!isInside(userCwd, resolved) && !isInside(assetsRoot, resolved)) {
    console.warn(
      `[open-slide] refusing to copy OG image outside the deck: ${imagePath} -> ${resolved}`,
    );
    return null;
  }
  return resolved;
}

type OgTagInput = {
  title: string;
  description?: string;
  ogImageUrl?: string;
  url?: string;
};

function renderOgTags({ title, description, ogImageUrl, url }: OgTagInput): string {
  const lines: string[] = [];
  if (description) {
    lines.push(`    <meta name="description" content="${escapeHtml(description)}" />`);
  }
  lines.push(`    <meta property="og:title" content="${escapeHtml(title)}" />`);
  if (description) {
    lines.push(`    <meta property="og:description" content="${escapeHtml(description)}" />`);
  }
  lines.push(`    <meta property="og:type" content="website" />`);
  if (url) {
    lines.push(`    <meta property="og:url" content="${escapeHtml(url)}" />`);
  }
  if (ogImageUrl) {
    lines.push(`    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`);
    lines.push(`    <meta name="twitter:card" content="summary_large_image" />`);
    lines.push(`    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`);
  } else {
    lines.push(`    <meta name="twitter:card" content="summary" />`);
  }
  return lines.join('\n');
}

function injectTags(html: string, title: string, tagsBlock: string): string {
  const escapedTitle = escapeHtml(title);
  const replaced = /<title>[^<]*<\/title>/.test(html)
    ? html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`)
    : html.replace('</head>', `    <title>${escapedTitle}</title>\n</head>`);
  return replaced.replace('</head>', `${tagsBlock}\n  </head>`);
}

export function ogBuildPlugin(opts: OgBuildPluginOptions): Plugin {
  const { userCwd, config } = opts;
  const slidesDir = config.slidesDir ?? 'slides';
  const assetsDir = config.assetsDir ?? 'assets';
  const slidesRoot = path.resolve(userCwd, slidesDir);
  const assetsRoot = path.resolve(userCwd, assetsDir);
  const site = config.site?.replace(/\/+$/, '') ?? '';
  let outDir = '';

  return {
    name: 'open-slide:og-build',
    apply: 'build',
    enforce: 'post',
    configResolved(resolved) {
      outDir = resolved.build.outDir;
    },
    async closeBundle() {
      if (!outDir) return;
      const indexHtmlPath = path.join(outDir, 'index.html');
      if (!existsSync(indexHtmlPath)) return;
      const baseHtml = await fs.readFile(indexHtmlPath, 'utf8');

      const ogOutDir = path.join(outDir, 'og');
      await fs.mkdir(ogOutDir, { recursive: true });

      let deckOgUrl: string | undefined;
      if (config.ogImage) {
        const src = resolveOgImageSource(config.ogImage, slidesRoot, userCwd, assetsRoot);
        if (src && existsSync(src)) {
          const ext = path.extname(src) || '.png';
          const dest = path.join(ogOutDir, `__deck__${ext}`);
          await fs.copyFile(src, dest);
          deckOgUrl = `${site}/og/__deck__${ext}`;
        } else if (src) {
          console.warn(`[open-slide] deck ogImage not found: ${config.ogImage}`);
        }
      }

      if (!site) {
        console.warn(
          '[open-slide] `site` is not set in open-slide.config.ts — og:image and og:url will be relative URLs, which some crawlers (Slack, Twitter) will not fetch.',
        );
      }

      const files = await findSlides(userCwd, slidesDir);
      let written = 0;
      for (const abs of files) {
        const id = toSlideId(abs, slidesRoot);
        const meta = await readSlideMeta(abs);
        const slideDir = path.dirname(abs);

        let ogImageUrl = deckOgUrl;
        if (meta.ogImage) {
          const src = resolveOgImageSource(meta.ogImage, slideDir, userCwd, assetsRoot);
          if (src && existsSync(src)) {
            const ext = path.extname(src) || '.png';
            const dest = path.join(ogOutDir, `${id}${ext}`);
            await fs.copyFile(src, dest);
            ogImageUrl = site ? `${site}/og/${id}${ext}` : `/og/${id}${ext}`;
          } else if (src) {
            console.warn(`[open-slide] og image for slide "${id}" not found: ${meta.ogImage}`);
          }
        }

        const title = meta.title ?? id;
        const url = site ? `${site}/s/${id}` : `/s/${id}`;
        const tags = renderOgTags({
          title,
          description: meta.description ?? undefined,
          ogImageUrl,
          url,
        });
        const html = injectTags(baseHtml, title, tags);

        const outPath = path.join(outDir, 's', id, 'index.html');
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, html, 'utf8');
        written++;
      }

      const indexTags = renderOgTags({
        title: 'open-slide',
        ogImageUrl: deckOgUrl,
        url: site || undefined,
      });
      await fs.writeFile(indexHtmlPath, injectTags(baseHtml, 'open-slide', indexTags), 'utf8');

      console.log(`[open-slide] emitted ${written} per-slide HTML file(s) with OG tags`);
    },
  };
}
