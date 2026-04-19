import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root as MdastRoot, Heading } from "mdast";
import { remarkWikilinks, type WikiResolver } from "./remark-wikilinks";
import { slugify, stripNumericPrefix, shortName } from "./slugify";
import type { HierNode, Hierarchy } from "./hierarchy";
import { extractToc, type TocItem } from "./extract-toc";

export function buildWikiResolver(hierarchy: Hierarchy): WikiResolver {
  return (name: string) => {
    const node = hierarchy.byBasename.get(name);
    if (!node) return { broken: true, url: "" };
    const root = hierarchy.byFilename.get(node.workshopRootFilename)!;
    const workshopSlug = slugify(
      root.title ?? stripNumericPrefix(shortName(root.filename))
    );
    if (node.depth === 0) return { url: `/${workshopSlug}` };
    if (node.depth === 1) {
      const childSlug = slugify(
        node.title ?? stripNumericPrefix(shortName(node.filename))
      );
      return { url: `/${workshopSlug}#${childSlug}` };
    }
    const subSlug = slugify(
      node.title ?? stripNumericPrefix(shortName(node.filename))
    );
    return { url: `/${workshopSlug}/${subSlug}` };
  };
}

function parseMarkdown(md: string): MdastRoot {
  return unified().use(remarkParse).use(remarkGfm).parse(md) as MdastRoot;
}

function chapterHeading(title: string): Heading {
  return {
    type: "heading",
    depth: 2,
    children: [{ type: "text", value: title }],
    data: {
      hProperties: { className: ["chapter-divider"] },
    },
  };
}

function assembleWorkshopTree(workshop: HierNode): MdastRoot {
  const rootTree = parseMarkdown(workshop.rawContent ?? "");
  for (const child of workshop.children) {
    const title =
      child.title ?? stripNumericPrefix(shortName(child.filename));
    const childTree = parseMarkdown(child.rawContent ?? "");
    rootTree.children.push(chapterHeading(title));
    rootTree.children.push(...childTree.children);
  }
  return rootTree;
}

function countWordsInTree(tree: MdastRoot): number {
  let n = 0;
  const walk = (node: any) => {
    if (node.type === "text" && typeof node.value === "string") {
      n += node.value.split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  walk(tree);
  return n;
}

function wrapTables() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number, parent: any) => {
      if (node.tagName !== "table" || !parent || parent.properties?.className?.includes("table-wrap")) return;
      const wrapper = { type: "element", tagName: "div", properties: { className: ["table-wrap"] }, children: [node] };
      parent.children.splice(index, 1, wrapper);
    });
  };
}

const FILENAME_RE = /^[^\s]+\.(png|jpe?g|gif|webp|avif|svg)$/i;

function transformImages(workshopDir: string | undefined) {
  return (tree: any) => {
    // Pass 1: normalize img nodes (src + width style from title attribute).
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "img") return;
      const src: string = node.properties?.src ?? "";
      if (workshopDir && src.startsWith("images/")) {
        node.properties.src = `/images/${encodeURIComponent(workshopDir)}/${src.slice("images/".length)}`;
      }
      const title: string | undefined = node.properties?.title;
      if (title && /^\d+$/.test(title)) {
        const width = Number(title);
        if (width > 0) node.properties.style = `max-width:${width}px;width:100%`;
        delete node.properties.title;
      }
    });

    // Pass 2: promote paragraphs containing only an image to <figure> with optional caption.
    visit(tree, "element", (node: any, index: any, parent: any) => {
      if (node.tagName !== "p" || !parent || index == null) return;
      const kids = (node.children ?? []).filter((c: any) => !(c.type === "text" && /^\s*$/.test(c.value)));
      if (kids.length !== 1) return;
      const img = kids[0];
      if (img.type !== "element" || img.tagName !== "img") return;

      const alt: string = (img.properties?.alt ?? "").trim();
      const caption = alt && !FILENAME_RE.test(alt) ? alt : "";
      const frame = {
        type: "element",
        tagName: "span",
        properties: { className: ["md-img-frame"] },
        children: [img],
      };
      const children: any[] = [frame];
      if (caption) {
        children.push({
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: caption }],
        });
      }
      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["md-figure"] },
        children,
      };
    });
  };
}

function addHeadingIds() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!node.tagName || !["h1", "h2", "h3"].includes(node.tagName)) return;
      const text = (node.children ?? [])
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.value)
        .join("");
      node.properties = node.properties ?? {};
      if (!node.properties.id) {
        node.properties.id = slugify(text);
      }
    });
  };
}

export interface RenderedWorkshop {
  html: string;
  toc: TocItem[];
  wordCount: number;
  pageCount: number;
}

function workshopDir(filename: string): string | undefined {
  const slash = filename.indexOf("/");
  return slash !== -1 ? filename.slice(0, slash) : undefined;
}

export async function renderWorkshop(
  workshop: HierNode,
  hierarchy: Hierarchy
): Promise<RenderedWorkshop> {
  const resolver = buildWikiResolver(hierarchy);
  const dir = workshopDir(workshop.filename);
  const tree = assembleWorkshopTree(workshop);

  const processor = unified()
    .use(remarkGfm)
    .use(remarkWikilinks, { resolver })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(addHeadingIds)
    .use(wrapTables)
    .use(transformImages, dir)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const hast = await processor.run(tree as any);
  const html = processor.stringify(hast) as string;
  const toc = extractToc(hast as any);
  const wordCount = countWordsInTree(tree);
  const pageCount = 1 + workshop.children.length;
  return { html, toc, wordCount, pageCount };
}

export async function renderSubpage(
  page: HierNode,
  hierarchy: Hierarchy
): Promise<RenderedWorkshop> {
  const resolver = buildWikiResolver(hierarchy);
  const md = page.rawContent ?? "";
  const dir = workshopDir(page.filename);
  const tree = parseMarkdown(md);

  const processor = unified()
    .use(remarkGfm)
    .use(remarkWikilinks, { resolver })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(addHeadingIds)
    .use(wrapTables)
    .use(transformImages, dir)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const hast = await processor.run(tree as any);
  const html = processor.stringify(hast) as string;
  return {
    html,
    toc: extractToc(hast as any),
    wordCount: countWordsInTree(tree),
    pageCount: 1,
  };
}
