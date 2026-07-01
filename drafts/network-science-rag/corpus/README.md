# corpus/ — source documents for network-science-rag

Put curated source material here. Each source = one file + one metadata entry.

## Layout
```
corpus/
├── manifest.jsonl        # one line per source (metadata)
└── docs/                 # the source text/PDF/markdown files
```

## manifest.jsonl (one JSON object per line)
```json
{"id": "newman2010", "title": "Networks: An Introduction", "authors": ["M. E. J. Newman"], "year": 2010, "type": "book", "path": "docs/newman2010.md", "license": "local-only"}
```
Required keys: `id`, `title`, `year`, `path`. Recommended: `authors`, `type`, `venue`, `doi`, `license`.

## Rules
- The `id` is what gets cited downstream — keep it stable and unique.
- **Licensing:** store metadata and locators freely, but keep copyrighted full text `local-only`
  (do not commit it to a shared/public repo). Prefer open-access or your own notes for anything pushed.
- Keep `docs/` as text/markdown where possible so chunking is clean.
