import { existsSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";

export function copyImages(contentPath: string, projectRoot: string): void {
  const src = join(contentPath, "images");
  const dst = join(projectRoot, "public", "images");
  if (existsSync(dst)) rmSync(dst, { recursive: true, force: true });
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });
  cpSync(src, dst, { recursive: true });
}
