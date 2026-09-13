# Epic 14 Mockup — Local Development Blog Editor

Reviewing this before building, per the same lesson Epic 13 taught: default to
**field-by-field** for structured data (reusing the `SchemaForm` pattern from
Epic 13 for frontmatter), and a plain large `<textarea>` only for the
Markdown **body**, since prose content isn't something a schema-driven form
can usefully split into fields.

Route: `/dev/blog`, reached via the `/customize` dev-tools hub (same as
Epic 13's JSON editor). Dev-only, same production-safety approach as Epic 13
(`vite-plugin-dev-routes.ts`'s virtual module, not just a runtime check).

---

## 1. List view (`/dev/blog`, nothing selected)

```
+------------------------------------------------------------------+
| Roopesh Tayaloor      Home  Resume  Projects  Blog  Customize   [Dark Tech v] |
+------------------------------------------------------------------+
|
|  <- Back to Developer Tools
|
|  Blog Post Editor
|  Edits save directly to content/blog/. Local-only — this page
|  does nothing on a deployed site.
|
|  Posts                                            [+ New Post]
|  +--------------------------------------------------------+
|  |  2026-01-15-going-from-architect-to-ai-engineer.md      |
|  |  2026-02-02-building-a-learning-tool-people-actually... |
|  +--------------------------------------------------------+
|
+------------------------------------------------------------------+
```

- Same visual language as `/dev/content`: back link, page title, one-line
  local-only disclaimer.
- Post list is a simple list of filenames (button per row), not a dropdown —
  there could be many posts over time, and a plain list scans faster than a
  `<select>` for this.

---

## 2. "+ New Post" — inline title prompt

Clicking **+ New Post** shows a small inline form in place of the button
(no modal component — consistent with Epic 13 using plain `window.confirm()`
rather than a custom dialog):

```
|  Posts
|  +--------------------------------------------------------+
|  |  2026-01-15-going-from-architect-to-ai-engineer.md      |
|  |  2026-02-02-building-a-learning-tool-people-actually... |
|  +--------------------------------------------------------+
|
|  New post title
|  [________________________________]   [Create]  [Cancel]
|
|  Filename preview: 2026-09-14-________________________.md
```

- Filename preview updates live as they type (today's date + slugified
  title), so there's no surprise about what file gets created.
- **Create** derives the filename, writes a new file immediately (frontmatter
  pre-filled: `title` = what they typed, `date` = today, `tags` = `[]`,
  `excerpt` = `""`; body = a one-line placeholder comment), and switches
  straight into the edit view below with that post selected.
- **Cancel** returns to the plain list.

---

## 3. Edit view — frontmatter as fields, body as one big textarea

```
+------------------------------------------------------------------+
| Roopesh Tayaloor      Home  Resume  Projects  Blog  Customize   [Dark Tech v] |
+------------------------------------------------------------------+
|
|  <- Back to Developer Tools
|
|  Blog Post Editor
|  Edits save directly to content/blog/. Local-only — this page
|  does nothing on a deployed site.
|
|  Posts                                            [+ New Post]
|  +--------------------------------------------------------+
|  |  2026-01-15-going-from-architect-to-ai-engineer.md  <- (selected, highlighted)
|  |  2026-02-02-building-a-learning-tool-people-actually... |
|  +--------------------------------------------------------+
|
|  File: 2026-01-15-going-from-architect-to-ai-engineer.md   Unsaved changes
|
|  Title
|  [Going From Architect to AI Engineer_______________________]
|
|  Date
|  [2026-01-15___]
|
|  Tags                                                   [+ Add]
|  +----------------------------------------------------------+
|  |  Item 1  [career________]                       [Remove] |
|  |  Item 2  [ai____________]                        [Remove] |
|  |  Item 3  [engineering___]                        [Remove] |
|  +----------------------------------------------------------+
|
|  Excerpt
|  +----------------------------------------------------------+
|  | Notes on what actually transfers from two decades of      |
|  | software architecture when you move into building         |
|  | AI-driven products — and what doesn't.                     |
|  +----------------------------------------------------------+
|
|  Body (Markdown)
|  +----------------------------------------------------------+
|  | This is a placeholder post. Replace the frontmatter        |
|  | above and this body with your own writing.                |
|  |                                                             |
|  | ## Why this post exists                                    |
|  |                                                             |
|  | Blog posts in this template are plain Markdown files...    |
|  |                                                             |
|  +----------------------------------------------------------+
|  (large, resizable textarea — no live Markdown preview in v1)
|
|  [Save]
|
+------------------------------------------------------------------+
```

- **Title / Date / Excerpt** — reuse `SchemaField`'s existing `string`
  (and `longText` for excerpt, matching the same heuristic that already
  makes `bio`/`description` render as textareas) rendering, driven by the
  frontmatter schema exported from `blog.ts`.
- **Tags** — reuses `SchemaForm`'s existing array-of-strings handling
  (add/remove rows) exactly as-is — no new code needed for this field.
- **Body** — a separate, deliberately large `<textarea>` (12–16 rows,
  monospace, resizable), *not* schema-driven, bound directly to the
  post's raw Markdown content. No live preview in v1 — matches the
  existing "plain Markdown, no syntax highlighting" scope decision from
  Epic 5 (E7/E8 answers) for blog content generally.
- **Save** button disabled when nothing changed, same pattern as Epic 13.

---

## 4. Validation error state (on Save)

```
|  [Save]
|
|  +----------------------------------------------------------+
|  | Invalid data in 2026-01-15-....md:                        |
|  |   - date: Required                                         |
|  +----------------------------------------------------------+
```

Same presentation as Epic 13: a `role="alert"` block below the Save button,
using the same `validateData()` error formatting — frontmatter is validated
against the existing schema from `blog.ts` before save; the body has no
schema to validate against (any Markdown text is valid).

---

## 5. Success / error feedback (ST-110-equivalent, carried over as a pattern)

Same as Epic 13's `role="status"` (green, "Saved to `<filename>`.") and
`role="alert"` (red, save/network failure) — no new pattern to design.

---

## Open questions before I build this

1. **Filename immutability**: once a post is created, should the filename
   (hence its URL slug at `/blog/:slug`) be editable later, or fixed after
   creation? Editing `title` after creation would NOT rename the file in
   this design — same as how editing `personal.json.name` doesn't rename
   `personal.json`. Renaming a post's slug would break any existing links
   to it, so **defaulting to "filename is fixed after creation, edit title
   text separately"** unless you want rename support (bigger scope: rename
   = write new file + delete old one).
2. **Delete a post?** Not in the original ST-112–117 stories. Skipping it
   for now — let me know if you want a "Delete" button too.
