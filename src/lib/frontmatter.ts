import matter from "gray-matter";

const WIKI_RE = /^\[\[(.+?)(?:\|.+?)?\]\]$/;

export function extractWikiTarget(value: string): string | null {
  const m = WIKI_RE.exec(value.trim());
  return m ? m[1] : null;
}

export interface NormalizedFrontmatter {
  title?: string;
  description?: string;
  order?: number;
  cover?: string;
  authors?: string[];
  date?: string;
  upTargets?: string[];
  raw?: Record<string, unknown>;
}

export function parseFrontmatter(source: string): {
  data: NormalizedFrontmatter;
  content: string;
} {
  const parsed = matter(source);
  const raw = (parsed.data ?? {}) as Record<string, unknown>;
  const hasFrontmatter = Object.keys(raw).length > 0;

  if (!hasFrontmatter) {
    return { data: {}, content: parsed.content };
  }

  const upTargets: string[] = [];
  const up = raw.up;
  if (typeof up === "string") {
    const t = extractWikiTarget(up);
    if (t) upTargets.push(t);
  } else if (Array.isArray(up)) {
    for (const entry of up) {
      if (typeof entry !== "string") continue;
      const t = extractWikiTarget(entry);
      if (t) upTargets.push(t);
    }
  }

  const data: NormalizedFrontmatter = {
    upTargets,
    raw,
  };

  if (typeof raw.title === "string") data.title = raw.title;
  if (typeof raw.description === "string") data.description = raw.description;
  if (typeof raw.order === "number") data.order = raw.order;
  if (typeof raw.cover === "string") data.cover = raw.cover;
  if (Array.isArray(raw.authors)) {
    const authors = raw.authors.filter(
      (a): a is string => typeof a === "string",
    );
    data.authors = authors;
  }
  if (typeof raw.date === "string") {
    data.date = raw.date;
  } else if (raw.date instanceof Date) {
    data.date = raw.date.toISOString().slice(0, 10);
  }

  return {
    data,
    content: parsed.content,
  };
}
