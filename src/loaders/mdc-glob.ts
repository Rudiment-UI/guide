import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Loader, LoaderContext } from 'astro/loaders';

interface MdcGlobOptions {
  pattern: RegExp;
  base: string;
}

export function mdcGlob({ pattern, base }: MdcGlobOptions): Loader {
  const absBase = path.resolve(base);

  return {
    name: 'mdc-glob',
    async load(ctx) {
      const { store, watcher, logger } = ctx;
      store.clear();

      const entries = await fs.readdir(absBase, { withFileTypes: true });
      const files = entries
        .filter((e) => e.isFile() && pattern.test(e.name))
        .map((e) => path.join(absBase, e.name));

      for (const filePath of files) {
        await processFile(filePath, ctx);
      }

      logger.info(`Loaded ${files.length} guide entries from ${path.relative(process.cwd(), absBase)}`);

      if (watcher) {
        watcher.add(absBase);
        const handler = async (changed: string) => {
          if (!changed.startsWith(absBase)) return;
          if (!pattern.test(path.basename(changed))) return;
          await processFile(changed, ctx);
        };
        watcher.on('change', handler);
        watcher.on('add', handler);
        watcher.on('unlink', (removed) => {
          if (!removed.startsWith(absBase)) return;
          const id = path.basename(removed, path.extname(removed));
          store.delete(id);
        });
      }
    },
  };
}

async function processFile(filePath: string, ctx: LoaderContext) {
  const { store, parseData, generateDigest, renderMarkdown } = ctx;
  const raw = await fs.readFile(filePath, 'utf-8');
  const normalized = normalizeMdcDirectives(raw);
  const { data, content } = matter(normalized);
  const id = path.basename(filePath, path.extname(filePath));

  const parsed = await parseData({ id, data, filePath });
  const digest = generateDigest(normalized);

  let rendered: Awaited<ReturnType<typeof renderMarkdown>> | undefined;
  if (renderMarkdown) {
    rendered = await renderMarkdown(content);
  }

  store.set({
    id,
    data: parsed,
    body: content,
    filePath: path.relative(process.cwd(), filePath),
    digest,
    rendered,
  });
}

function normalizeMdcDirectives(source: string): string {
  const lines = source.split('\n');
  const out: string[] = [];
  for (const line of lines) {
    const openMatch = line.match(/^::([A-Za-z][A-Za-z0-9_-]*)\s*(\{[^}]*\})?\s*$/);
    const closeMatch = line.match(/^::\s*$/);
    if (openMatch) {
      out.push(`:::${openMatch[1]}${openMatch[2] ? openMatch[2] : ''}`);
    } else if (closeMatch) {
      out.push(':::');
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}
