---
name: network-science-rag
description: >-
  [DRAFT — NOT YET FUNCTIONAL] Retrieval-augmented network-science reference assistant. When
  finished, it will retrieve from a curated local corpus (papers, lecture notes, canonical
  results) before answering, ground every network-science factual claim in a retrieved passage
  with a citation, and abstain when nothing relevant is retrieved. Designed to feed the
  `ask-to-professor` persona so its answers become corpus-grounded. This is a placeholder scaffold
  — see the STATUS and TODO sections below.
---

# network-science-rag — retrieval-augmented reference layer (PLACEHOLDER)

> **STATUS: PLACEHOLDER — not yet functional.** This skill is a scaffold. It lives under
> `drafts/` so no agent auto-loads it. Do not install it into a live `skills/` directory until
> the TODOs below are done and the retrieval scripts exist.

## Purpose (intended)

A retrieval layer for network science / statistical physics. Instead of answering from parametric
memory, it retrieves the most relevant passages from a curated corpus, then answers **only** from
what it retrieved — with a citation on every substantive claim, and an explicit "not in corpus"
when retrieval comes back empty. It is meant to compose with `ask-to-professor`: the SHL persona
does the reasoning, this skill supplies grounded, cited source material.

## Intended pipeline

1. **Ingest** — collect sources into `corpus/` (see `corpus/README.md` for the format).
2. **Index** — chunk + embed the corpus into a vector store written to `index/` (see
   `index/README.md`).
3. **Retrieve** — for a query, embed it, pull top-k chunks, and keep only chunks above a
   similarity threshold.
4. **Ground** — answer strictly from retrieved chunks; attach a citation (source id + locator)
   to each claim; quote minimally and paraphrase.
5. **Abstain** — if nothing clears the threshold, say so plainly and do not fabricate. This
   inherits the `ask-to-professor` rule: never invent a title, author, year, venue, or DOI.

## Composition with `ask-to-professor`

- Run retrieval first; hand the retrieved, cited passages to the professor persona as context.
- The persona keeps its two modes (상냥/심화) and its reasoning reflexes; this skill only changes
  *where the facts come from* (corpus, not memory) and *that every claim is cited*.

## Corpus / index layout

```
network-science-rag/
├── SKILL.md          # this file
├── corpus/           # source documents + metadata (see corpus/README.md)
├── index/            # built vector index + manifest (see index/README.md)
└── scripts/          # (TODO) build_index.*, retrieve.*  — not yet written
```

## TODO (to promote out of drafts/)

- [ ] Decide the embedding model + vector store (local vs API); document it here.
- [ ] Write `scripts/build_index` (chunk → embed → write `index/`).
- [ ] Write `scripts/retrieve` (embed query → top-k → threshold filter → return chunks + citations).
- [ ] Define the citation format (source id, page/section locator) and the abstain threshold.
- [ ] Populate `corpus/` with an initial curated set; record licensing/redistribution constraints.
- [ ] Test retrieval quality on a handful of known questions; tune k and threshold.
- [ ] Move the finished folder from `drafts/` to `skills/` and add it to the README catalog.

## Guardrails (carried over)

- Corpus-grounded only: no network-science factual claim without a retrieved citation.
- Never fabricate a citation; abstain instead.
- Respect source licensing — store metadata/locators, keep copyrighted full text local-only, and
  do not redistribute source materials in the repo.
