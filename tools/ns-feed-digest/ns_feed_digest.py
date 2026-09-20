#!/usr/bin/env python3
"""OPML 구독 목록에서 network science 관련 신규 논문만 뽑아 주간 digest 를 만든다.

표준 라이브러리만 쓴다 (feedparser 등 설치 불필요). RSS 2.0 · Atom 둘 다 처리.

  python3 ns_feed_digest.py --opml feeds.opml --out out --days 7
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor

ATOM = "{http://www.w3.org/2005/Atom}"
RSS1 = "{http://purl.org/rss/1.0/}"   # APS·Nature 는 RSS 1.0 (RDF) 로 낸다
DC = "{http://purl.org/dc/elements/1.1/}"
UA = "ns-feed-digest/1.1 (GNU NS-lab; python-urllib)"

# JS client challenge·403 으로 RSS 를 막는 학술지는 Crossref API 로 우회한다.
# (봇 차단을 뚫는 게 아니라, 기계 접근용으로 열려 있는 공개 API 를 대신 쓰는 것)
FALLBACK_ISSN = {
    # Springer Nature 계열은 날마다 다른 feed 가 challenge 에 걸려서 전부 등록해 둔다
    "Nature": "0028-0836",
    "Nature Physics": "1745-2473",
    "Nature Communications": "2041-1723",
    "Communications Physics": "2399-3650",
    "Nature Computational Science": "2662-8457",
    "Nature Human Behaviour": "2397-3374",
    "Nature Machine Intelligence": "2522-5839",
    "Scientific Data": "2052-4463",
    "EPJ Data Science": "2193-1127",
    "Applied Network Science": "2364-8228",
    # AAAS 는 RSS 에 403 을 준다
    "Science": "0036-8075",
    "Science Advances": "2375-2548",
}

# 제목·초록에 이 중 하나라도 걸리면 채택
KEYWORDS = [
    "network", "graph", "complex system", "percolation", "epidemic", "contagion",
    "spreading", "diffusion", "community detection", "modularity", "centrality",
    "degree distribution", "scale-free", "small-world", "random walk", "synchroniz",
    "hypergraph", "simplicial", "higher-order", "temporal network", "multilayer",
    "multiplex", "bipartite", "link prediction", "node embedding", "graph neural",
    "mean-field", "phase transition", "critical", "scaling", "renormaliz",
    "core-periphery", "assortativ", "motif", "cascade", "robustness", "resilience",
    "opinion dynamics", "collective", "null model", "science of science",
    "citation", "mobility", "self-organiz", "criticality", "clustering coefficient",
    "shortest path", "navigability", "interdependent", "cooperation", "game theory",
]

# 학술지 자체가 온토픽이라 키워드 필터 없이 전부 담는 곳
ALWAYS_ON = [
    "applied network science", "epj data science", "journal of physics: complexity",
    "plos complex systems",
]


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def parse_opml(path: str) -> list[tuple[str, str]]:
    root = ET.parse(path).getroot()
    feeds = []
    for o in root.iter("outline"):
        url = o.get("xmlUrl")
        if not url:
            continue
        feeds.append(((o.get("title") or o.get("text") or url).strip(), url))
    return feeds


_HOST_LOCKS: dict[str, threading.Lock] = {}
_LOCKS_GUARD = threading.Lock()


def host_lock(url: str) -> threading.Lock:
    host = urllib.parse.urlsplit(url).netloc
    with _LOCKS_GUARD:
        return _HOST_LOCKS.setdefault(host, threading.Lock())


def fetch(url: str, timeout: int = 25, retries: int = 2) -> bytes:
    headers = {"User-Agent": UA,
               "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8"}
    last: Exception = RuntimeError("no attempt")
    for attempt in range(retries + 1):
        with host_lock(url):          # 같은 호스트에는 한 번에 하나씩
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    data = r.read()
                time.sleep(0.5)       # 연속 요청 간격
                return data
            except Exception as e:    # noqa: BLE001 - 어떤 실패든 재시도 후 보고
                last = e
                time.sleep(1.5 * (attempt + 1))
    raise last


def to_dt(raw: str | None) -> dt.datetime | None:
    if not raw:
        return None
    raw = raw.strip()
    try:  # RFC 822 (RSS pubDate)
        from email.utils import parsedate_to_datetime
        d = parsedate_to_datetime(raw)
        return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)
    except Exception:
        pass
    try:  # ISO 8601 (Atom updated/published, dc:date)
        d = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)
    except Exception:
        return None


def clean(text: str | None, limit: int = 240) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[: limit - 1] + "…" if len(text) > limit else text


def text_of(node, *paths) -> str | None:
    for p in paths:
        el = node.find(p)
        if el is not None:
            if el.text and el.text.strip():
                return el.text
            if el.get("href"):
                return el.get("href")
    return None


def entries_from_crossref(issn: str, days: int, mailto: str | None) -> list[dict]:
    since = (dt.date.today() - dt.timedelta(days=days + 3)).isoformat()
    q = (f"https://api.crossref.org/journals/{issn}/works"
         f"?filter=from-pub-date:{since},type:journal-article"
         f"&sort=published&order=desc&rows=100"
         f"&select=title,DOI,published,abstract,container-title")
    if mailto:
        q += f"&mailto={mailto}"
    data = json.loads(fetch(q).decode("utf-8"))["message"]["items"]
    out = []
    for w in data:
        parts = (w.get("published") or {}).get("date-parts", [[]])[0]
        if not parts:
            continue
        parts = list(parts) + [1] * (3 - len(parts))
        out.append({
            "title": clean((w.get("title") or ["(제목 없음)"])[0], 300),
            "link": f"https://doi.org/{w['DOI']}",
            "summary": clean(w.get("abstract")),
            "date": dt.datetime(*parts[:3], tzinfo=dt.timezone.utc),
        })
    return out


def entries(raw: bytes) -> list[dict]:
    head = raw.lstrip()[:400].lower()
    if head.startswith(b"<!doctype html") or b"client challenge" in head:
        raise ValueError("RSS 대신 HTML(봇 차단 페이지)이 돌아옴")
    root = ET.fromstring(raw)
    out = []
    for it in root.iter():
        tag = it.tag
        if tag == f"{RSS1}item":  # RSS 1.0 / RDF (APS, feeds.nature.com)
            out.append({
                "title": clean(text_of(it, f"{RSS1}title", f"{DC}title"), 300),
                "link": (text_of(it, f"{RSS1}link") or it.get("about") or "").strip(),
                "summary": clean(text_of(it, f"{RSS1}description", f"{DC}description")),
                "date": to_dt(text_of(it, f"{DC}date")),
            })
        elif tag == "item":  # RSS 2.0
            link = text_of(it, "link", "guid")
            out.append({
                "title": clean(text_of(it, "title"), 300),
                "link": (link or "").strip(),
                "summary": clean(text_of(it, "description", f"{DC}description")),
                "date": to_dt(text_of(it, "pubDate", f"{DC}date")),
            })
        elif tag == f"{ATOM}entry":  # Atom
            link = None
            for l in it.findall(f"{ATOM}link"):
                if l.get("rel") in (None, "alternate"):
                    link = l.get("href")
                    break
            out.append({
                "title": clean(text_of(it, f"{ATOM}title"), 300),
                "link": (link or "").strip(),
                "summary": clean(text_of(it, f"{ATOM}summary", f"{ATOM}content")),
                "date": to_dt(text_of(it, f"{ATOM}published", f"{ATOM}updated")),
            })
    return out


def on_topic(item: dict, feed_title: str, keywords: list[str]) -> bool:
    if any(v in feed_title.lower() for v in ALWAYS_ON):
        return True
    blob = f"{item['title']} {item['summary']}".lower()
    return any(k in blob for k in keywords)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--opml", default="feeds.opml")
    ap.add_argument("--out", default="out")
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--keywords", help="한 줄에 하나씩 적은 키워드 파일 (기본 목록 대체)")
    ap.add_argument("--state", default="state/seen.json", help="이미 보낸 항목 기록")
    ap.add_argument("--no-state", action="store_true", help="중복 제거 기록을 쓰지 않음")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--mailto", default=os.environ.get("CROSSREF_MAILTO"),
                    help="Crossref polite pool 용 연락 메일 (환경변수 CROSSREF_MAILTO 로도 지정 가능)")
    ap.add_argument("--issn-map", help="{feed 제목: ISSN} JSON — RSS 가 막힌 학술지의 Crossref 대체용")
    a = ap.parse_args()

    keywords = KEYWORDS
    if a.keywords:
        keywords = [l.strip().lower() for l in open(a.keywords, encoding="utf-8") if l.strip()]

    issn_map = dict(FALLBACK_ISSN)
    if a.issn_map:
        issn_map.update(json.load(open(a.issn_map, encoding="utf-8")))

    feeds = parse_opml(a.opml)
    log(f"feed {len(feeds)}개 수집 시작")

    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=a.days)
    seen: set[str] = set()
    if not a.no_state and os.path.exists(a.state):
        try:
            seen = set(json.load(open(a.state, encoding="utf-8")))
        except Exception:
            seen = set()

    def work(feed):
        title, url = feed
        try:
            return title, entries(fetch(url)), None
        except Exception as e:  # noqa: BLE001
            why = f"RSS 실패 ({type(e).__name__}: {e})"
        issn = issn_map.get(title)
        if not issn:
            return title, [], why
        try:
            return title, entries_from_crossref(issn, a.days, a.mailto), f"{why} → Crossref {issn} 로 대체"
        except Exception as e:  # noqa: BLE001
            return title, [], f"{why}; Crossref 도 실패 ({type(e).__name__}: {e})"

    picked: dict[str, list[dict]] = {}
    failed: list[tuple[str, str]] = []
    notes: list[tuple[str, str]] = []
    n_new = 0
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        for title, items, note in ex.map(work, feeds):
            if note:
                (notes if items else failed).append((title, note))
            if not items:
                continue
            keep = []
            for it in items:
                if not it["title"] or not it["link"]:
                    continue
                if it["date"] and it["date"] < cutoff:
                    continue
                if it["link"] in seen:
                    continue
                if not on_topic(it, title, keywords):
                    continue
                keep.append(it)
                seen.add(it["link"])
                n_new += 1
            if keep:
                keep.sort(key=lambda x: x["date"] or dt.datetime.min.replace(tzinfo=dt.timezone.utc),
                          reverse=True)
                picked[title] = keep

    today = dt.datetime.now().strftime("%Y-%m-%d")
    os.makedirs(a.out, exist_ok=True)
    path = os.path.join(a.out, f"{today}.md")

    lines = [
        f"# Network science 주간 digest — {today}",
        "",
        f"최근 {a.days}일 · feed {len(feeds)}개 · 채택 {n_new}건",
        "",
    ]
    if not picked:
        lines += ["_이번 주 조건에 걸린 새 항목이 없습니다._", ""]
    for feed_title in sorted(picked):
        lines.append(f"## {feed_title}")
        lines.append("")
        for it in picked[feed_title]:
            d = it["date"].astimezone().strftime("%m-%d") if it["date"] else "??-??"
            lines.append(f"- **[{it['title']}]({it['link']})** — `{d}`")
            if it["summary"]:
                lines.append(f"  {it['summary']}")
        lines.append("")
    if notes:
        lines += ["---", "", "### 대체 경로로 수집", ""]
        lines += [f"- {t} — {e}" for t, e in notes]
        lines.append("")
    if failed:
        lines += ["---", "", "### 수집 실패", ""]
        lines += [f"- {t} — {e}" for t, e in failed]
        lines.append("")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    if not a.no_state:
        os.makedirs(os.path.dirname(a.state) or ".", exist_ok=True)
        json.dump(sorted(seen)[-8000:], open(a.state, "w", encoding="utf-8"))

    log(f"완료: {path} ({n_new}건 · 대체 {len(notes)}개 · 실패 {len(failed)}개 feed)")
    print(path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
