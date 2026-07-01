# index/ — built retrieval index for network-science-rag

This directory is **generated** by `scripts/build_index` — do not edit by hand, and generally do
not commit large index blobs (add them to `.gitignore`).

## Expected contents (after build)
```
index/
├── index.manifest.json   # embedding model, dims, chunk params, corpus hash, build date
├── vectors.*             # the vector store (format depends on chosen backend)
└── chunks.jsonl          # chunk_id → {source_id, locator, text} for citation lookup
```

## index.manifest.json (example shape)
```json
{"embedding_model": "TBD", "dim": 0, "chunk_tokens": 512, "chunk_overlap": 64, "corpus_hash": "", "built_at": ""}
```
Rebuild whenever `corpus/` changes; the `corpus_hash` lets `retrieve` detect a stale index.
