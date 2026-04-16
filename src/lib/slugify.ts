const NUMERIC_PREFIX_RE = /^\d+[\s\-_]+/;

export function stripNumericPrefix(input: string): string {
  return input.replace(NUMERIC_PREFIX_RE, "");
}

export function slugify(input: string): string {
  return stripNumericPrefix(input)
    .toLowerCase()
    .replace(/['’]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
