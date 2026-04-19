# Spark

Source for the Spark workshop site. Workshops are authored in Markdown
(Obsidian-flavored: wikilinks, `up:` frontmatter, callouts) and compiled into
a static Astro site.

## Prerequisites

- Node.js ≥ 22.12
- A folder of workshop Markdown files (the path you set in `.env`).

## Setup

```sh
npm install
cp .env.example .env       # or create .env directly
# edit .env so CONTENT_PATH points at your workshop folder
npm run dev
```

`CONTENT_PATH` is an absolute path to a folder structured like this:

```
<CONTENT_PATH>/
  01 Workshop Name.md               # workshop root
  01 Workshop Name/                 # optional child-page directory
    01 Intro.md                     # child pages; need `up: "[[01 Workshop Name]]"`
    02 Setup.md
    images/                         # images referenced by this workshop's pages
      cover.png
      diagram.svg
  02 Another Workshop.md
```

Child pages without an explicit `up:` in frontmatter are auto-parented to the
workshop whose name matches their enclosing folder.

## Authoring

- **Wikilinks:** `[[Other Workshop]]`, `[[Other Workshop|alias]]`,
  `[[Other Workshop#Heading]]`. Broken links render as muted strikethrough.
- **Images:** standard Markdown `![alt](images/foo.png)`. Images in
  `<workshop>/images/` are copied into `public/images/<workshop>/` at build
  time.
- **Callouts:** Obsidian-style. Supported types: `note`, `info`, `tip`,
  `success`, `warning`, `failure`, `danger`, `bug`, `example`, `quote`,
  `abstract`, `todo`, `question`. Fold markers (`+` / `-`) are parsed but
  ignored — callouts always render expanded.

  ```markdown
  > [!warning] Optional title
  > Body text.
  ```

- **Frontmatter** (all fields optional):

  ```yaml
  ---
  title: Workshop Name
  description: One-line homepage tagline
  order: 2                       # controls homepage order
  cover: images/my-workshop/cover.png
  authors: [Vadim, Lina]
  date: 2026-04-12
  up: "[[Parent Workshop]]"      # child pages only
  ---
  ```

## Commands

```sh
npm run dev       # dev server at http://localhost:4321 with hot reload
npm run build     # static build into dist/
npm run preview   # preview the built site locally
npm test          # vitest
```

## Contributing

Fork, branch, PR. Keep PRs small and focused. Site deploys are handled by a
core maintainer — contributors don't need deploy access to be useful.
