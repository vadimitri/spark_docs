import { describe, it, expect } from "vitest";
import { parseFrontmatter, extractWikiTarget } from "./frontmatter";

describe("parseFrontmatter", () => {
  it("returns content and empty data when no frontmatter", () => {
    const { data, content } = parseFrontmatter("# Hello\n\nWorld");
    expect(data).toEqual({});
    expect(content).toBe("# Hello\n\nWorld");
  });

  it("parses YAML frontmatter", () => {
    const md = `---\ntitle: Hello\norder: 2\n---\n# H`;
    const { data, content } = parseFrontmatter(md);
    expect(data.title).toBe("Hello");
    expect(data.order).toBe(2);
    expect(content).toBe("# H");
  });

  it("normalizes up: as string to a single target", () => {
    const md = `---\nup: "[[Parent]]"\n---\nbody`;
    const { data } = parseFrontmatter(md);
    expect(data.upTargets).toEqual(["Parent"]);
  });

  it("normalizes up: as list of strings to multiple targets", () => {
    const md = `---\nup:\n  - "[[A]]"\n  - "[[B]]"\n---\nbody`;
    const { data } = parseFrontmatter(md);
    expect(data.upTargets).toEqual(["A", "B"]);
  });

  it("ignores up: entries that aren't wikilinks", () => {
    const md = `---\nup:\n  - plain string\n  - "[[Valid]]"\n---\nbody`;
    const { data } = parseFrontmatter(md);
    expect(data.upTargets).toEqual(["Valid"]);
  });
});

describe("extractWikiTarget", () => {
  it("returns the inner name", () => {
    expect(extractWikiTarget("[[Foo Bar]]")).toBe("Foo Bar");
  });
  it("returns null for non-wikilinks", () => {
    expect(extractWikiTarget("plain text")).toBeNull();
    expect(extractWikiTarget("[Foo]")).toBeNull();
  });
});
