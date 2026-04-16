import { describe, it, expect } from "vitest";
import { buildHierarchy, type RawPage } from "./hierarchy";

const pages: RawPage[] = [
  {
    filename: "How To Homeserver.md",
    upTargets: ["Homeserver"], // points outside the folder; treated as root
  },
  { filename: "01 OS.md", upTargets: ["How To Homeserver"] },
  { filename: "02 Installing Docker.md", upTargets: ["How To Homeserver"] },
  { filename: "03 First service.md", upTargets: ["How To Homeserver"] },
  { filename: "Old Hardware.md", upTargets: ["01 OS"] },
  { filename: "New Hardware.md", upTargets: ["01 OS"] },
];

describe("buildHierarchy", () => {
  it("classifies How To Homeserver as workshop (depth 0)", () => {
    const h = buildHierarchy(pages);
    expect(h.byFilename.get("How To Homeserver.md")?.depth).toBe(0);
  });

  it("classifies child pages as depth 1", () => {
    const h = buildHierarchy(pages);
    expect(h.byFilename.get("01 OS.md")?.depth).toBe(1);
    expect(h.byFilename.get("02 Installing Docker.md")?.depth).toBe(1);
  });

  it("classifies sub-pages as depth 2", () => {
    const h = buildHierarchy(pages);
    expect(h.byFilename.get("Old Hardware.md")?.depth).toBe(2);
    expect(h.byFilename.get("New Hardware.md")?.depth).toBe(2);
  });

  it("ascribes the correct workshop slug to sub-pages", () => {
    const h = buildHierarchy(pages);
    const sub = h.byFilename.get("Old Hardware.md")!;
    expect(sub.workshopRootFilename).toBe("How To Homeserver.md");
  });

  it("lists workshops in deterministic order", () => {
    const h = buildHierarchy(pages);
    expect(h.workshops.map((w) => w.filename)).toEqual([
      "How To Homeserver.md",
    ]);
  });

  it("collects child pages of each workshop", () => {
    const h = buildHierarchy(pages);
    const ws = h.workshops[0];
    expect(ws.children.map((c) => c.filename)).toEqual([
      "01 OS.md",
      "02 Installing Docker.md",
      "03 First service.md",
    ]);
  });

  it("collects sub-pages of each child", () => {
    const h = buildHierarchy(pages);
    const os = h.workshops[0].children.find((c) => c.filename === "01 OS.md")!;
    expect(os.children.map((c) => c.filename).sort()).toEqual([
      "New Hardware.md",
      "Old Hardware.md",
    ]);
  });
});
