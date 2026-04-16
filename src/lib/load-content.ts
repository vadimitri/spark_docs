import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter";
import { buildHierarchy, type Hierarchy, type RawPage } from "./hierarchy";

export interface LoadedPage extends RawPage {
  absolutePath: string;
  rawContent: string;
}

export interface LoadResult {
  hierarchy: Hierarchy;
  pages: LoadedPage[];
  contentPath: string;
}

export function loadContent(contentPath?: string): LoadResult {
  const root = contentPath ?? process.env.CONTENT_PATH;
  if (!root) {
    throw new Error(
      "CONTENT_PATH env var not set. Add it to .env (see .env.example).",
    );
  }
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`CONTENT_PATH is not a directory: ${root}`);
  }

  const pages: LoadedPage[] = [];
  for (const entry of readdirSync(root)) {
    if (!entry.endsWith(".md")) continue;
    const abs = join(root, entry);
    if (!statSync(abs).isFile()) continue;
    const source = readFileSync(abs, "utf8");
    const { data, content } = parseFrontmatter(source);
    pages.push({
      filename: entry,
      absolutePath: abs,
      rawContent: content,
      upTargets: data.upTargets ?? [],
      title: data.title,
      description: data.description,
      cover: data.cover,
      authors: data.authors,
      date: data.date,
      order: data.order,
    });
  }

  const hierarchy = buildHierarchy(pages);
  return { hierarchy, pages, contentPath: root };
}
