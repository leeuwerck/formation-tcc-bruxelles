Extract all vignettes from the HTML files into separate markdown files, then replace the hardcoded vignette HTML with JS-driven dynamic loading.

## Step 1 — Extract vignettes to markdown files

1. Read all `.html` files in the current directory.
2. For each `<div class="vignette">` block, extract:
   - **Number** from `<span class="vignette-num">` (e.g. "Vignette I")
   - **Title** from `<span class="vignette-title">` (strip HTML entities)
   - **Tag** from `<span class="vignette-tag">`
   - **General context** from the first `<p>` inside `<div class="vignette-body">`
   - **Each `<details>` section**: `<summary>` text becomes a heading; convert inner `<div class="vignette-scenario">` and `<div class="vignette-tips">` to clean markdown (bold, italic, lists, paragraphs)
3. Name files: `vignettes/vignette-{n}.md` (e.g. `vignette-1.md`, `vignette-2.md`)
4. Format each file:

```
# {vignette-num} — {vignette-title}

_{vignette-tag}_

{general context}

---

## {summary of details block 1}

{content}

---

## {summary of details block 2}

{content}

---

## {summary of details block 3}

{content}
```

5. Convert all HTML entities (`&nbsp;` → space, `&amp;` → `&`, `«&nbsp;` / `&nbsp;»` → `« ` / ` »`, etc.) and strip remaining tags.
6. Create `vignettes/` if it doesn't exist.

## Step 2 — Replace hardcoded HTML with placeholders

In each HTML file, replace the inner content of `<section id="sec-vignettes">` (everything after the intro `<p>` and `.callout` div) with placeholder `<div>` elements — one per vignette:

```html
<div class="vignette" data-src="vignettes/vignette-1.md"></div>
<div class="vignette" data-src="vignettes/vignette-2.md"></div>
<div class="vignette" data-src="vignettes/vignette-3.md"></div>
```

## Step 3 — Add markdown loader to scripts.js

Add a `loadVignettes()` function to `scripts.js` that:
1. Selects all `[data-src]` elements inside `#sec-vignettes`
2. For each, `fetch()`es the markdown file
3. Parses the markdown to HTML using the `marked` library (already assumed available via CDN — add `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>` to the `<head>` of each HTML file if not already present)
4. Renders the parsed HTML inside the placeholder `<div>`, wrapped to preserve the `vignette-header` / `vignette-body` structure:
   - The `# Heading` line → `<div class="vignette-header">` with `<span class="vignette-num">`, `<span class="vignette-title">`, `<span class="vignette-tag">`
   - Everything after → `<div class="vignette-body">`
5. Calls `smartquotes()` after all vignettes are rendered
6. Calls `loadVignettes()` on `DOMContentLoaded`
