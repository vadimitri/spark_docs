import { describe, it, expect } from "vitest";
import { slugify, stripNumericPrefix } from "./slugify";

describe("stripNumericPrefix", () => {
  it("removes leading 'NN ' prefix", () => {
    expect(stripNumericPrefix("01 OS")).toBe("OS");
  });
  it("removes leading 'NN-' prefix", () => {
    expect(stripNumericPrefix("12-Foo Bar")).toBe("Foo Bar");
  });
  it("removes leading 'NN_' prefix", () => {
    expect(stripNumericPrefix("3_Hardware")).toBe("Hardware");
  });
  it("returns input unchanged when no numeric prefix", () => {
    expect(stripNumericPrefix("How To Homeserver")).toBe("How To Homeserver");
  });
  it("does not strip embedded digits", () => {
    expect(stripNumericPrefix("HTTP 2.0 basics")).toBe("HTTP 2.0 basics");
  });
});

describe("slugify", () => {
  it("lowercases", () => {
    expect(slugify("OS")).toBe("os");
  });
  it("hyphenates spaces", () => {
    expect(slugify("How To Homeserver")).toBe("how-to-homeserver");
  });
  it("strips numeric prefix before slugging", () => {
    expect(slugify("01 OS")).toBe("os");
  });
  it("collapses repeated separators", () => {
    expect(slugify("Foo  Bar -- Baz")).toBe("foo-bar-baz");
  });
  it("strips non-url-safe characters", () => {
    expect(slugify("What's a color space?")).toBe("whats-a-color-space");
  });
});
