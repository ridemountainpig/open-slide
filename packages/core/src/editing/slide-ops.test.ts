import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  duplicatePageInDefaultExportInSource,
  duplicateSlideDir,
  removePageFromDefaultExportInSource,
  reorderDefaultExportPagesInSource,
  reorderNotesArrayInSource,
  updateMetaFieldInSource,
  updateMetaTitleInSource,
  validateSlideName,
} from './slide-ops.ts';

async function withSlidesRoot<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'open-slide-test-'));
  try {
    return await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function writeSlide(root: string, id: string, title = id): Promise<void> {
  await fs.mkdir(path.join(root, id, 'assets'), { recursive: true });
  await fs.writeFile(
    path.join(root, id, 'index.tsx'),
    `export const meta = { title: '${title}' };\nexport default [];\n`,
    'utf8',
  );
  await fs.writeFile(path.join(root, id, 'assets', 'hero.txt'), 'hero', 'utf8');
}

describe('duplicateSlideDir', () => {
  it('duplicates a slide directory with an automatic copy id', async () => {
    await withSlidesRoot(async (root) => {
      await writeSlide(root, 'cover', 'Cover');

      const result = await duplicateSlideDir(root, 'cover');

      expect(result).toEqual({ ok: true, slideId: 'cover-copy' });
      await expect(fs.readFile(path.join(root, 'cover-copy', 'index.tsx'), 'utf8')).resolves.toBe(
        `export const meta = { title: 'Cover (copy)' };\nexport default [];\n`,
      );
      await expect(
        fs.readFile(path.join(root, 'cover-copy', 'assets', 'hero.txt'), 'utf8'),
      ).resolves.toBe('hero');
    });
  });

  it('increments the automatic copy id when a copy already exists', async () => {
    await withSlidesRoot(async (root) => {
      await writeSlide(root, 'cover');

      expect(await duplicateSlideDir(root, 'cover')).toEqual({ ok: true, slideId: 'cover-copy' });
      expect(await duplicateSlideDir(root, 'cover')).toEqual({
        ok: true,
        slideId: 'cover-copy-2',
      });
    });
  });

  it('rejects source slide ids with bad characters', async () => {
    await withSlidesRoot(async (root) => {
      expect(await duplicateSlideDir(root, 'bad id')).toMatchObject({ ok: false, status: 400 });
    });
  });

  it('rejects an existing desired id', async () => {
    await withSlidesRoot(async (root) => {
      await writeSlide(root, 'cover');
      await writeSlide(root, 'target');

      expect(await duplicateSlideDir(root, 'cover', 'target')).toMatchObject({
        ok: false,
        status: 409,
      });
    });
  });

  it('rejects path traversal in the source slide id', async () => {
    await withSlidesRoot(async (root) => {
      expect(await duplicateSlideDir(root, '..')).toMatchObject({ ok: false, status: 400 });
    });
  });

  it('returns not found when the source slide does not exist', async () => {
    await withSlidesRoot(async (root) => {
      expect(await duplicateSlideDir(root, 'missing')).toMatchObject({ ok: false, status: 404 });
    });
  });
});

describe('validateSlideName', () => {
  it('accepts longer slide names than folder names', () => {
    expect(validateSlideName('x'.repeat(80))).toBe('x'.repeat(80));
    expect(validateSlideName('x'.repeat(81))).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateSlideName('')).toBeNull();
    expect(validateSlideName('   ')).toBeNull();
  });
});

describe('updateMetaTitleInSource', () => {
  it('replaces an existing single-quoted title literal', () => {
    const source = `export const meta: SlideMeta = { title: 'old' };\nexport default [];\n`;
    const out = updateMetaTitleInSource(source, 'new');
    expect(out).toContain("title: 'new'");
    expect(out).not.toContain("'old'");
  });

  it('replaces an existing double-quoted title literal', () => {
    const source = `export const meta = { title: "old" };\nexport default [];\n`;
    const out = updateMetaTitleInSource(source, 'new');
    expect(out).toContain("title: 'new'");
  });

  it('replaces an existing static template-literal title', () => {
    const source = 'export const meta = { title: `old` };\nexport default [];\n';
    const out = updateMetaTitleInSource(source, 'new');
    expect(out).toContain("title: 'new'");
  });

  it('escapes single quotes inside the new title', () => {
    const source = `export const meta = { title: 'old' };\nexport default [];\n`;
    const out = updateMetaTitleInSource(source, "it's new");
    expect(out).toContain("title: 'it\\'s new'");
  });

  it('escapes backslashes inside the new title', () => {
    const source = `export const meta = { title: 'old' };\nexport default [];\n`;
    const out = updateMetaTitleInSource(source, 'a\\b');
    expect(out).toContain("title: 'a\\\\b'");
  });

  it('injects a title into a meta object that lacks one', () => {
    const source = `export const meta = {\n  notes: 'x',\n};\nexport default [];\n`;
    const out = updateMetaTitleInSource(source, 'first');
    expect(out).toMatch(/title:\s*'first'/);
    expect(out).toContain("notes: 'x'");
  });

  it('injects a fresh meta export when none exists', () => {
    const source = `export default [];\n`;
    const out = updateMetaTitleInSource(source, 'fresh');
    expect(out).toContain("export const meta: SlideMeta = { title: 'fresh' };");
    expect(out).toContain('export default []');
  });

  it('returns null if there is no meta and no default export', () => {
    expect(updateMetaTitleInSource('// nothing here', 'x')).toBeNull();
  });
});

describe('updateMetaFieldInSource', () => {
  it('replaces an existing description literal', () => {
    const source = `export const meta = { title: 't', description: 'old' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, 'description', 'new');
    expect(out).toContain("description: 'new'");
    expect(out).not.toContain("'old'");
    expect(out).toContain("title: 't'");
  });

  it('replaces an existing static template-literal description', () => {
    const source = "export const meta = { title: 't', description: `old` };\nexport default [];\n";
    const out = updateMetaFieldInSource(source, 'description', 'new');
    expect(out).toContain("description: 'new'");
  });

  it('injects ogImage into an existing meta object', () => {
    const source = `export const meta = { title: 't' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, 'ogImage', './og-image.png');
    expect(out).toMatch(/ogImage:\s*'\.\/og-image\.png'/);
    expect(out).toContain("title: 't'");
  });

  it('injects a fresh meta export when none exists', () => {
    const source = `export default [];\n`;
    const out = updateMetaFieldInSource(source, 'description', 'hello');
    expect(out).toContain("export const meta: SlideMeta = { description: 'hello' };");
  });

  it('rejects unsafe keys', () => {
    const source = `export const meta = { title: 't' };\nexport default [];\n`;
    expect(updateMetaFieldInSource(source, '"; rm -rf /', 'x')).toBeNull();
    expect(updateMetaFieldInSource(source, 'foo bar', 'x')).toBeNull();
    expect(updateMetaFieldInSource(source, '', 'x')).toBeNull();
  });

  it('escapes single quotes in the value', () => {
    const source = `export const meta = { title: 't' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, 'description', "it's cool");
    expect(out).toContain("description: 'it\\'s cool'");
  });

  it('escapes newlines so multi-line values stay in a single-quoted literal', () => {
    const source = `export const meta = { title: 't' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, 'description', 'line one\nline two\rline three');
    expect(out).toContain("description: 'line one\\nline two\\rline three'");
    expect(out).not.toMatch(/description: 'line one\n/);
  });

  it('refuses to inject when the key already exists in a non-string-literal form', () => {
    const source = `const DESC = 'x';\nexport const meta = { title: 't', description: DESC };\nexport default [];\n`;
    expect(updateMetaFieldInSource(source, 'description', 'new')).toBeNull();
  });

  it('handles $-prefixed keys without insert-loop duplication', () => {
    // SAFE_META_KEY_RE allows `$`; without regex-escaping it the dynamic
    // regex's `$` would anchor to end-of-input and never match the existing
    // entry, causing a duplicate key on every call.
    const source = `export const meta = { $custom: 'old' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, '$custom', 'new');
    expect(out).toContain("$custom: 'new'");
    expect(out).not.toContain("'old'");
    expect(out?.match(/\$custom\s*:/g)?.length).toBe(1);
  });
});

describe('updateMetaFieldInSource <-> extractMeta round-trip', () => {
  it('preserves apostrophes, newlines, and unicode line separators', async () => {
    const { extractMeta } = await import('../vite/open-slide-plugin.ts');
    const tricky = "It's cool\nline two line three";
    const base = `export const meta = { title: 't' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(base, 'description', tricky);
    expect(out).not.toBeNull();
    const parsed = extractMeta(out as string);
    expect(parsed.description).toBe(tricky);
    expect(parsed.title).toBe('t');
  });

  it('preserves backslashes and quotes', async () => {
    const { extractMeta } = await import('../vite/open-slide-plugin.ts');
    const tricky = `a \\ b 'c' "d"`;
    const base = `export const meta = { title: 't' };\nexport default [];\n`;
    const out = updateMetaFieldInSource(base, 'description', tricky);
    const parsed = extractMeta(out as string);
    expect(parsed.description).toBe(tricky);
  });

  it('ignores nested-object same-name keys when reading', async () => {
    // A nested `description:` should never be picked up as if it were the
    // top-level meta description. Flat-regex extractors got this wrong and
    // emitted the inner string as og:description at build.
    const { extractMeta } = await import('../vite/open-slide-plugin.ts');
    const source = `export const meta = { title: 'real', extras: { description: 'inner' } };\nexport default [];\n`;
    const parsed = extractMeta(source);
    expect(parsed.title).toBe('real');
    expect(parsed.description).toBeNull();
  });

  it('injects a missing top-level field when the same name exists nested', async () => {
    // Flat-regex `keyPresentRe` matched a nested `description:` and refused
    // to inject, producing a permanent 422 for the OG panel on that slide.
    const { extractMeta } = await import('../vite/open-slide-plugin.ts');
    const source = `export const meta = { title: 't', custom: { description: 'inner' } };\nexport default [];\n`;
    const out = updateMetaFieldInSource(source, 'description', 'top-level');
    expect(out).not.toBeNull();
    const parsed = extractMeta(out as string);
    expect(parsed.description).toBe('top-level');
    // Nested literal should be untouched.
    expect(out).toContain("description: 'inner'");
  });

  it('refuses to overwrite a dynamic top-level template-literal value', async () => {
    // Template literals can contain interpolations; silently replacing them
    // with a single-quoted literal would destroy author intent. Caller gets
    // null and surfaces the failure rather than corrupting the source.
    const source = `export const meta = { description: \`Year \${YEAR}\` };\nexport default [];\n`;
    expect(updateMetaFieldInSource(source, 'description', 'new')).toBeNull();
  });

  it('survives a stray `}` inside a string value', async () => {
    // Brace-matching that treated `}` inside string literals as a real close
    // would truncate the meta object scan here, then drop later fields and
    // break the next PATCH. Description text is author-controlled free text,
    // so this needs to be safe.
    const { extractMeta } = await import('../vite/open-slide-plugin.ts');
    const tricky = 'has a } brace and { brace';
    const base = `export const meta = { title: 't', theme: 'dark' };\nexport default [];\n`;
    const written = updateMetaFieldInSource(base, 'description', tricky);
    expect(written).not.toBeNull();
    const parsed = extractMeta(written as string);
    expect(parsed.description).toBe(tricky);
    expect(parsed.title).toBe('t');
    expect(parsed.theme).toBe('dark');
    const reWritten = updateMetaFieldInSource(written as string, 'title', 'new');
    expect(reWritten).not.toBeNull();
    const reParsed = extractMeta(reWritten as string);
    expect(reParsed.title).toBe('new');
    expect(reParsed.description).toBe(tricky);
  });
});

describe('reorderDefaultExportPagesInSource', () => {
  const withSatisfies = `import type { Page } from '@open-slide/core';
const A = () => null;
const B = () => null;
const C = () => null;
export const meta = { title: 't' };
export default [
  A,
  B,
  C,
] satisfies Page[];
`;

  const withoutSatisfies = `const A = () => null;
const B = () => null;
const C = () => null;
export default [A, B, C];
`;

  it('reorders a 3-element multi-line array', () => {
    const out = reorderDefaultExportPagesInSource(withSatisfies, [2, 0, 1]);
    expect(out).not.toBeNull();
    expect(out).toContain('export default [\n  C,\n  A,\n  B,\n] satisfies Page[];');
    // surrounding source untouched
    expect(out).toContain("import type { Page } from '@open-slide/core';");
    expect(out).toContain("export const meta = { title: 't' };");
  });

  it('reorders an inline array without satisfies', () => {
    const out = reorderDefaultExportPagesInSource(withoutSatisfies, [1, 2, 0]);
    expect(out).toContain('export default [B, C, A];');
  });

  it('is a no-op for the identity permutation (returns input unchanged)', () => {
    expect(reorderDefaultExportPagesInSource(withSatisfies, [0, 1, 2])).toBe(withSatisfies);
  });

  it('returns null on length mismatch', () => {
    expect(reorderDefaultExportPagesInSource(withSatisfies, [0, 1])).toBeNull();
    expect(reorderDefaultExportPagesInSource(withSatisfies, [0, 1, 2, 3])).toBeNull();
  });

  it('returns null on duplicate indices', () => {
    expect(reorderDefaultExportPagesInSource(withSatisfies, [0, 0, 2])).toBeNull();
  });

  it('returns null on out-of-range indices', () => {
    expect(reorderDefaultExportPagesInSource(withSatisfies, [0, 1, 5])).toBeNull();
    expect(reorderDefaultExportPagesInSource(withSatisfies, [-1, 1, 2])).toBeNull();
  });

  it('returns null when the default export is not an array', () => {
    const source = `const A = () => null;\nexport default A;\n`;
    expect(reorderDefaultExportPagesInSource(source, [0])).toBeNull();
  });

  it('returns null when there is no default export', () => {
    expect(reorderDefaultExportPagesInSource('// nothing\n', [])).toBeNull();
  });

  it('returns the input unchanged for an empty array (zero-length identity)', () => {
    const empty = `export default [];\n`;
    expect(reorderDefaultExportPagesInSource(empty, [])).toBe(empty);
  });

  it('preserves the rest of the file (component bodies, imports, meta)', () => {
    const out = reorderDefaultExportPagesInSource(withSatisfies, [2, 1, 0]);
    expect(out).not.toBeNull();
    expect(out).toContain('const A = () => null;');
    expect(out).toContain('const B = () => null;');
    expect(out).toContain('const C = () => null;');
  });
});

describe('reorderNotesArrayInSource', () => {
  it('returns the source unchanged when there is no notes export', () => {
    const source = `export default [];\n`;
    expect(reorderNotesArrayInSource(source, [])).toBe(source);
  });

  it('reorders notes alongside pages', () => {
    const source = [
      'export const notes: (string | undefined)[] = [',
      '  "first",',
      '  "second",',
      '  "third",',
      '];',
      'export default [A, B, C];',
      '',
    ].join('\n');
    const out = reorderNotesArrayInSource(source, [2, 0, 1]);
    expect(out).not.toBeNull();
    expect(out).toContain(
      'export const notes: (string | undefined)[] = [\n  "third",\n  "first",\n  "second",\n];',
    );
  });

  it('preserves template-literal notes verbatim', () => {
    const source = [
      'export const notes = [',
      '  `multi',
      'line`,',
      '  "second",',
      '];',
      'export default [A, B];',
      '',
    ].join('\n');
    const out = reorderNotesArrayInSource(source, [1, 0]);
    expect(out).not.toBeNull();
    expect(out).toContain('export const notes = [\n  "second",\n  `multi\nline`,\n];');
  });

  it('pads with undefined when notes is shorter than pages', () => {
    const source = ['export const notes = ["only"];', 'export default [A, B, C];', ''].join('\n');
    const out = reorderNotesArrayInSource(source, [2, 0, 1]);
    expect(out).not.toBeNull();
    expect(out).toContain('export const notes = [\n  undefined,\n  "only",\n];');
  });

  it('trims trailing undefined entries', () => {
    const source = [
      'export const notes = [',
      '  undefined,',
      '  "kept",',
      '  undefined,',
      '];',
      'export default [A, B, C];',
      '',
    ].join('\n');
    const out = reorderNotesArrayInSource(source, [2, 0, 1]);
    expect(out).not.toBeNull();
    expect(out).toContain('export const notes = [\n  undefined,\n  undefined,\n  "kept",\n];');
  });

  it('collapses to [] when reorder leaves only undefineds', () => {
    const source = ['export const notes = [', '  "x",', '];', 'export default [A, B];', ''].join(
      '\n',
    );
    const out = reorderNotesArrayInSource(source, [1, 1]);
    expect(out).not.toBeNull();
    expect(out).toContain('export const notes = [];');
  });

  it('returns the source unchanged for an identity-like reorder of an empty notes array', () => {
    const source = `export const notes = [];\nexport default [A, B];\n`;
    expect(reorderNotesArrayInSource(source, [0, 1])).toBe(source);
  });

  it('returns null on out-of-range indices', () => {
    const source = `export const notes = ["a", "b"];\nexport default [A, B];\n`;
    expect(reorderNotesArrayInSource(source, [-1, 0])).toBeNull();
  });

  it('returns null when notes is not an array literal', () => {
    const source = `export const notes = "oops";\nexport default [A];\n`;
    expect(reorderNotesArrayInSource(source, [0])).toBeNull();
  });
});

describe('removePageFromDefaultExportInSource', () => {
  const multiline = `import type { Page } from '@open-slide/core';
const A = () => null;
const B = () => null;
const C = () => null;
export default [
  A,
  B,
  C,
] satisfies Page[];
`;

  const inline = `const A = () => null;
const B = () => null;
const C = () => null;
export default [A, B, C];
`;

  it('removes the first element', () => {
    const out = removePageFromDefaultExportInSource(multiline, 0);
    expect(out).not.toBeNull();
    expect(out).toContain('export default [\n  B,\n  C,\n] satisfies Page[];');
  });

  it('removes a middle element', () => {
    const out = removePageFromDefaultExportInSource(multiline, 1);
    expect(out).not.toBeNull();
    expect(out).toContain('export default [\n  A,\n  C,\n] satisfies Page[];');
  });

  it('removes the last element', () => {
    const out = removePageFromDefaultExportInSource(multiline, 2);
    expect(out).not.toBeNull();
    expect(out).toContain('export default [\n  A,\n  B,\n] satisfies Page[];');
  });

  it('handles inline arrays', () => {
    expect(removePageFromDefaultExportInSource(inline, 1)).toContain('export default [A, C];');
  });

  it('collapses to an empty array when removing the only element', () => {
    const single = `const A = () => null;\nexport default [A];\n`;
    const out = removePageFromDefaultExportInSource(single, 0);
    expect(out).toContain('export default [];');
  });

  it('returns null on out-of-range indices', () => {
    expect(removePageFromDefaultExportInSource(multiline, -1)).toBeNull();
    expect(removePageFromDefaultExportInSource(multiline, 3)).toBeNull();
  });

  it('returns null when the default export is not an array', () => {
    expect(removePageFromDefaultExportInSource(`export default A;\n`, 0)).toBeNull();
  });
});

describe('duplicatePageInDefaultExportInSource', () => {
  const multiline = `import type { Page } from '@open-slide/core';
const A = () => null;
const B = () => null;
const C = () => null;
export default [
  A,
  B,
  C,
] satisfies Page[];
`;

  const inline = `const A = () => null;\nconst B = () => null;\nexport default [A, B];\n`;

  it('duplicates a middle element after itself', () => {
    const out = duplicatePageInDefaultExportInSource(multiline, 1);
    expect(out).not.toBeNull();
    expect(out).toContain('export default [\n  A,\n  B,\n  B,\n  C,\n] satisfies Page[];');
  });

  it('duplicates the first element', () => {
    const out = duplicatePageInDefaultExportInSource(multiline, 0);
    expect(out).toContain('export default [\n  A,\n  A,\n  B,\n  C,\n] satisfies Page[];');
  });

  it('duplicates the last element', () => {
    const out = duplicatePageInDefaultExportInSource(multiline, 2);
    expect(out).toContain('export default [\n  A,\n  B,\n  C,\n  C,\n] satisfies Page[];');
  });

  it('handles inline arrays', () => {
    expect(duplicatePageInDefaultExportInSource(inline, 0)).toContain('export default [A, A, B];');
  });

  it('duplicates the only element in a single-element array', () => {
    const single = `const A = () => null;\nexport default [A];\n`;
    const out = duplicatePageInDefaultExportInSource(single, 0);
    expect(out).toContain('export default [A, A];');
  });

  it('returns null on out-of-range indices', () => {
    expect(duplicatePageInDefaultExportInSource(multiline, -1)).toBeNull();
    expect(duplicatePageInDefaultExportInSource(multiline, 3)).toBeNull();
  });

  it('returns null when the default export is not an array', () => {
    expect(duplicatePageInDefaultExportInSource(`export default A;\n`, 0)).toBeNull();
  });
});
