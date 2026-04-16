import { describe, it, expect } from "vitest";
import { sortKey, comparePages } from "./sort-key";

describe("sortKey", () => {
  it("uses frontmatter order when present", () => {
    expect(sortKey({ filename: "anything.md", order: 5 })).toBe(5);
  });
  it("falls back to leading numeric prefix in filename", () => {
    expect(sortKey({ filename: "03 First service.md" })).toBe(3);
  });
  it("returns Infinity when no order and no numeric prefix", () => {
    expect(sortKey({ filename: "Old Hardware.md" })).toBe(Infinity);
  });
  it("prefers explicit order over filename prefix", () => {
    expect(sortKey({ filename: "10 First.md", order: 1 })).toBe(1);
  });
});

describe("comparePages", () => {
  it("orders by sortKey ascending then alphabetically by title", () => {
    const pages = [
      { filename: "Old Hardware.md", title: "Old Hardware" },
      { filename: "01 OS.md", title: "OS" },
      { filename: "02 Installing Docker.md", title: "Installing Docker" },
      { filename: "New Hardware.md", title: "New Hardware" },
    ];
    const sorted = [...pages].sort(comparePages);
    expect(sorted.map((p) => p.title)).toEqual([
      "OS",
      "Installing Docker",
      "New Hardware",
      "Old Hardware",
    ]);
  });
});
