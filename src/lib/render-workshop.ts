import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { remarkWikilinks, type WikiResolver } from "./remark-wikilinks";
import { slugify, stripNumericPrefix } from "./slugify";
import type { HierNode, Hierarchy } from "./hierarchy";
import type { TocItem } from "../components/TocRail.astro";

export function buildWikiResolver(hierarchy: Hierarchy): WikiResolver {
  return (name: string) => {
    const node = hierarchy.byBasename.get(name);
    if (!node) return { broken: true, url: "" };
    const root = hierarchy.byFilename.get(node.workshopRootFilename)!;
    const workshopSlug = slugify(
      root.title ?? stripNumericPrefix(root.filename.replace(/\.md$/, ""))
    );
    if (node.depth === 0) return { url: `/${workshopSlug}` };
    if (node.depth === 1) {
      const childSlug = slugify(
        node.title ?? stripNumericPrefix(node.filename.replace(/\.md$/, ""))
      );
      return { url: `/${workshopSlug}#${childSlug}` };
    }
    const subSlug = slugify(
      node.title ?? stripNumericPrefix(node.filename.replace(/\.md$/, ""))
    );
    return { url: `/${workshopSlug}/${subSlug}` };
  };
}

function assembleMarkdown(workshop: HierNode): string {
  const parts: string[] = [workshop.rawContent ?? ""];
  for (const child of workshop.children) {
    const title =
      child.title ?? stripNumericPrefix(child.filename.replace(/\.md$/, ""));
    parts.push(`\n\n## ${title}\n\n${child.rawContent ?? ""}`);
  }
  return parts.join("");
}

function extractToc(html: string): TocItem[] {
  const out: TocItem[] = [];
  const re = /<h([23])\s+id="([^"]+)">([^<]+)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({
      depth: Number(m[1]) as 2 | 3,
      id: m[2],
      text: decodeEntities(m[3]),
    });
  }
  return out;
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function addHeadingIds() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!node.tagName || (node.tagName !== "h2" && node.tagName !== "h3")) return;
      const text = (node.children ?? [])
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.value)
        .join("");
      node.properties = node.properties ?? {};
      node.properties.id = slugify(text);
    });
  };
}

export interface RenderedWorkshop {
  html: string;
  toc: TocItem[];
  wordCount: number;
  pageCount: number;
}

export async function renderWorkshop(
  workshop: HierNode,
  hierarchy: Hierarchy
): Promise<RenderedWorkshop> {
  const md = assembleMarkdown(workshop);
  const resolver = buildWikiResolver(hierarchy);
  const file = await unified()
    .use(remarkParse)
    .use(remarkWikilinks, { resolver })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(addHeadingIds)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  const html = String(file);
  const toc = extractToc(html);
  const wordCount = md.split(/\s+/).filter(Boolean).length;
  const pageCount = 1 + workshop.children.length;
  return { html, toc, wordCount, pageCount };
}

export async function renderSubpage(
  page: HierNode,
  hierarchy: Hierarchy
): Promise<RenderedWorkshop> {
  const resolver = buildWikiResolver(hierarchy);
  const md = page.rawContent ?? "";
  const file = await unified()
    .use(remarkParse)
    .use(remarkWikilinks, { resolver })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(addHeadingIds)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  const html = String(file);
  return {
    html,
    toc: extractToc(html),
    wordCount: md.split(/\s+/).filter(Boolean).length,
    pageCount: 1,
  };
}
