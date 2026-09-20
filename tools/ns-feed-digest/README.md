# ns-feed-digest

학술지 RSS 구독 목록(OPML)에서 **network science 관련 신규 논문만** 골라 주간 digest 를 만든다.
표준 라이브러리만 쓰므로 `pip install` 없이 python3 만 있으면 돌아간다.

```bash
python3 ns_feed_digest.py --opml feeds.opml --out out --days 7
# -> out/2026-09-20.md
```

## 무엇을 거르나

- `feeds.opml` 의 학술지 22개(PRL·PRE·PRX·PRResearch·RMP, Nature 계열, Science/SciAdv,
  PNAS, PLOS, EPJ DS, Applied Network Science, J. Phys. Complexity …)를 훑는다.
- 제목·초록에 network science 키워드(percolation, community detection, centrality,
  hypergraph, mean-field, scaling …)가 걸린 항목만 채택. `--keywords` 로 교체 가능.
- Applied Network Science · EPJ Data Science · J. Phys. Complexity · PLOS Complex Systems 는
  학술지 자체가 온토픽이라 키워드 없이 전부 담는다(`ALWAYS_ON`).
- `state/seen.json` 에 이미 내보낸 link 를 기록해 다음 주에 중복으로 안 나온다(`--no-state` 로 끔).

## 알아둘 것 — feed 가 막히는 학술지

RSS 형식이 셋(RSS 2.0 · **RSS 1.0/RDF** · Atom)이라 셋 다 파싱한다. APS 와 Nature 는 RSS 1.0 이다.

그리고 일부 출판사는 RSS 엔드포인트에 봇 차단을 건다:

| 출판사 | 증상 | 대응 |
|---|---|---|
| Springer Nature (Nature 계열, SpringerOpen) | JS client challenge HTML 반환, 날마다 걸리는 feed 가 다름 | Crossref API 로 대체 |
| AAAS (Science, Science Advances) | HTTP 403 | Crossref API 로 대체 |

차단을 우회하지 않고, **기계 접근용으로 공개된 Crossref API** 를 대신 쓴다.
`FALLBACK_ISSN` 표에 학술지→ISSN 을 넣어두면 RSS 가 실패할 때 자동으로 그 경로를 탄다
(`--issn-map` 으로 추가 가능). Crossref 는 연락처를 주면 polite pool 을 쓰므로
`--mailto` 나 환경변수 `CROSSREF_MAILTO` 를 넣어주면 좋다 — **레포에 커밋하지 말 것**.

결과 md 하단에 `대체 경로로 수집` / `수집 실패` 절이 붙으니 매주 거기만 보면 상태를 알 수 있다.

## 랩 서버에서 주 1회 돌리기

```bash
# 노드에 올리기 (홈이 노드마다 따로라 쓸 노드에 직접 올린다)
scp ns_feed_digest.py feeds.opml node26:~/ns-feed-digest/

# 월요일 08:00 KST
crontab -e
0 8 * * 1 cd ~/ns-feed-digest && python3 ns_feed_digest.py --opml feeds.opml --out out --days 7 >> log/run.log 2>&1
```

내 노트북에서 읽기:

```bash
ssh node26 'cat ~/ns-feed-digest/out/$(ls -t ~/ns-feed-digest/out | head -1)'
```

> `hedgehog` 는 랩 공용 계정이라 crontab 도 공용이다. 항목을 지우거나 고칠 땐 남의 것도 같이 있는지 먼저 확인할 것.
