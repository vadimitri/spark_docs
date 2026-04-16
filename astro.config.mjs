// @ts-check
import { defineConfig } from "astro/config";
import { copyImages } from "./src/lib/copy-images.ts";
import "dotenv/config";

const CONTENT_PATH = process.env.CONTENT_PATH;
if (CONTENT_PATH) copyImages(CONTENT_PATH, process.cwd());

// https://astro.build/config
export default defineConfig({});
