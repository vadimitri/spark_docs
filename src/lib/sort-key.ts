const PREFIX_RE = /^(\d+)[\s\-_]/;

export interface SortablePage {
  filename: string;
  title?: string;
  order?: number;
}

export function sortKey(page: { filename: string; order?: number }): number {
  if (typeof page.order === "number") return page.order;
  const m = PREFIX_RE.exec(page.filename);
  if (m) return parseInt(m[1], 10);
  return Infinity;
}

export function comparePages(a: SortablePage, b: SortablePage): number {
  const ka = sortKey(a);
  const kb = sortKey(b);
  if (ka !== kb) return ka - kb;
  const ta = (a.title ?? a.filename).toLowerCase();
  const tb = (b.title ?? b.filename).toLowerCase();
  return ta < tb ? -1 : ta > tb ? 1 : 0;
}
