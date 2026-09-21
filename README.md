# GNU Network Science Skills

물리학·데이터과학을 공부하는 학생과 경상국립대(GNU) Network Science Lab을 위한
[Agent Skill](https://code.claude.com/docs/en/skills) 모음입니다.

AI 에게 네트워크 과학을 물어보면 용어를 영어로 섞어 쓰거나, 교재마다 다른 정의를 뒤섞어
답하는 일이 많습니다. 이 스킬은 **뉴만·바라바시·『네트워크 분석』 한국어 교재의 표준 용어와
장 구성을 기준으로** 답하도록 붙잡아 줍니다.

> **어떤 스킬을 쓸지 찾고 있나요?** [학생용 스킬 지도](docs/skill-map.md)에서 목적별 추천과 원문 링크를 보세요.
> **처음 오셨나요?** 아래 [설치](#설치--터미널에-복붙만-macos--linux--windows) 한 블록만 복붙하시면 됩니다.
> 랩 서버·문헌 검색까지 붙이고 싶으시면 [랩 환경 초기 세팅](docs/claude-science-setup.md) 으로 오세요.

`SKILL.md` 기반의 가벼운 형식이라 **Claude Code · Codex CLI · Gemini CLI · Cursor** 어디로든
옮겨 쓸 수 있습니다. 설치 위치·호출법·실행 도구는 제품마다 다르며, 웹앱에 본문만
붙여넣으면 참조 파일이나 코드 실행 환경은 함께 제공되지 않습니다.

**들어있는 스킬**

- **`research-skill-guide`** — 물리학·데이터과학 학생용 연구·코딩 길잡이. 목표와 수준에 맞는
  스킬을 찾고 추천 이유·필요 도구·비용 조건·원문 링크·첫 요청문을 안내합니다.
- **`network-science-kr`** — 한국어 친화 네트워크 과학 전문가. 뉴만·바라바시·『네트워크 분석』
  한국어 교재의 표준 용어·장 구성을 기준으로 개념 설명·연구 자문·문헌 리뷰·실제 데이터 분석(코딩).
  한국어 용어집 + 교재 장 지도 + 물리·수학·데이터과학 방법론 툴킷 내장.
- **`statphys-pre`** — Physical Review E 기준의 통계물리·복잡계 물리 전문가. 상전이·임계지수·
  유한 크기 스케일링, 비평형 확률과정, 네트워크 위 전염·동기화·percolation·집단동역학을
  이론 유도 → 수치 시뮬레이션 → 오차 산정 → 원고·저널 선택까지 끌고 갑니다.
  Monte Carlo 자기상관·jackknife·data collapse 헬퍼(`kernel.py`)와 저널 지형도 내장.
  구조 측정은 `network-science-kr`, 구조 위의 과정과 상전이는 이 스킬입니다.

관련 레포: [`stem-journal-club-deck`](https://github.com/Gahyoun/stem-journal-club-deck) (논문 → 저널클럽 덱).

---

## 설치 — 터미널에 복붙만 (macOS · Linux · Windows)

먼저 [Git](https://git-scm.com/downloads)이 설치돼 있어야 합니다. 아래 **한 블록**이면 이 저장소의 세 스킬을
Claude Code·Codex·Gemini CLI 사용자 폴더에 복사합니다. 외부 추천 스킬은 포함하지 않습니다.
**업데이트도 같은 블록을 다시 붙여넣으면 됩니다**(복사한 스킬 파일을 로컬에서 수정했다면 먼저 보관하세요).

설치 위치: Claude Code는 `~/.claude/skills`, Codex는 `~/.agents/skills`, Gemini CLI는
`~/.gemini/skills`. [Claude 공식 문서](https://code.claude.com/docs/en/skills),
[Codex 공식 문서](https://learn.chatgpt.com/docs/build-skills),
[Gemini 공식 문서](https://geminicli.com/docs/cli/skills/) 기준입니다.
기존 `~/.codex/skills` 등에 같은 스킬을 두었다면 중복 목록을 확인하세요.

### macOS / Linux (Terminal)

```bash
# 1) 레포 받기 (이미 있으면 자동 업데이트)
if [ -d "$HOME/gnu-network-science-skills/.git" ]; then
  git -C "$HOME/gnu-network-science-skills" pull --ff-only
else
  git clone https://github.com/Gahyoun/gnu-network-science-skills.git "$HOME/gnu-network-science-skills"
fi && (
  set -e

# 2) 쓰는 도구들 스킬 폴더에 설치
  for d in .claude .agents .gemini; do
    mkdir -p "$HOME/$d/skills"
    for skill in network-science-kr statphys-pre research-skill-guide; do
      cp -Rf "$HOME/gnu-network-science-skills/skills/$skill" "$HOME/$d/skills/"
    done
  done
  echo "설치 완료. 아래 도구별 확인 방법을 보세요."
)
```

### Windows (PowerShell)

```powershell
# 1) 레포 받기 (이미 있으면 자동 업데이트)
$ErrorActionPreference = "Stop"
if (Test-Path "$HOME\gnu-network-science-skills\.git") {
  git -C "$HOME\gnu-network-science-skills" pull --ff-only
} else {
  git clone https://github.com/Gahyoun/gnu-network-science-skills.git "$HOME\gnu-network-science-skills"
}
if ($LASTEXITCODE -ne 0) { throw "저장소 다운로드/업데이트 실패" }

# 2) 쓰는 도구들 스킬 폴더에 설치
foreach ($d in ".claude",".agents",".gemini") {
  New-Item -ItemType Directory -Force "$HOME\$d\skills" | Out-Null
  foreach ($skill in "network-science-kr","statphys-pre","research-skill-guide") {
    Copy-Item -Recurse -Force "$HOME\gnu-network-science-skills\skills\$skill" "$HOME\$d\skills\"
  }
}
Write-Host "설치 완료. 아래 도구별 확인 방법을 보세요."
```

> Windows에서 Git Bash를 쓴다면 위 **macOS/Linux 블록**을 그대로 쓰면 됩니다.

### 확인

**새 세션(터미널 다시 시작)** 을 연 뒤:

- Claude Code: `/research-skill-guide` · `/network-science-kr` · `/statphys-pre`.
- Codex: `$research-skill-guide` · `$network-science-kr` · `$statphys-pre`. 목록은 `/skills`.
- Gemini CLI: `/skills list`로 확인한 뒤 목적을 자연어로 요청하세요.
- 예: "물리학 실험 데이터를 분석할 스킬을 추천하고 원문 링크를 알려줘."
- 그래도 안 잡히면 도구를 완전히 재시작하세요.

### 삭제

```bash
# macOS / Linux
for d in .claude .agents .gemini; do
  rm -rf "$HOME/$d/skills/network-science-kr" "$HOME/$d/skills/statphys-pre" "$HOME/$d/skills/research-skill-guide"
done
```
```powershell
# Windows PowerShell
foreach ($d in ".claude",".agents",".gemini") {
  foreach ($skill in "network-science-kr","statphys-pre","research-skill-guide") {
    Remove-Item -Recurse -Force "$HOME\$d\skills\$skill" -ErrorAction SilentlyContinue
  }
}
```

---

## 이렇게 물어보시면 됩니다

설치 후에는 스킬 이름을 몰라도 목적을 말할 수 있습니다. 자동 선택 여부는 호스트 설정에
따라 달라지므로, 원하는 스킬이 선택되지 않으면 위 도구별 호출법을 쓰세요.

```
Python 기초 수준에서 쓸 물리학·데이터과학 연구 스킬 2개와 시작할 요청문을 추천해줘
논문 검색 → 분석 코드 → 과학 그림 순서로 쓸 스킬과 원문 링크를 알려줘
이 edgelist 로 커뮤니티 찾아주고, modularity 가 통계적으로 의미 있는지 null model 로 확인해줘
degree distribution 이 power law 라고 주장하려면 뭘 보여야 해? 내 데이터로 해봐줘
percolation threshold 를 유한 크기 효과 고려해서 추정하려면 어떻게 하지
betweenness 랑 closeness 중에 뭘 써야 하는 상황인지 모르겠어
여러 크기 L 에서 잰 Ising 시계열로 T_c 랑 임계지수 뽑고 data collapse 까지 보여줘
단일 크기에서 hysteresis 만 보고 1차 전이라고 써도 되는지 referee 처럼 반박해줘
이 결과를 PRE 로 낼지 PRL 로 낼지, 초록은 어떻게 쓸지 정리해줘
이 논문에서 쓴 측정량이 내 데이터에도 말이 되는지 봐줘
```

막연한 질문도 괜찮습니다. 어디서부터 좁혀야 할지 같이 정리해 줍니다.

---

## 랩 환경 초기 세팅

문헌 검색, 랩 서버 계산, 주간 논문 digest 까지 붙이는 방법은 따로 정리해 뒀습니다.

**→ [docs/claude-science-setup.md](docs/claude-science-setup.md)**

필요한 것만 골라 하셔도 됩니다:

| 하고 싶은 것 | 어디 |
|---|---|
| Claude 가 arXiv·OpenAlex 에서 문헌을 직접 찾아오게 | [3번](docs/claude-science-setup.md#3-claude-science--문헌-도메인-열기) |
| 네트워크 데이터셋 저장소(Netzschleuder, SNAP …) 열기 | [3-2번](docs/claude-science-setup.md#3-2-추가할-것--네트워크-데이터셋) |
| 무거운 계산을 랩 서버에서 돌리기 | [4번](docs/claude-science-setup.md#4-claude-science--랩-서버-연결-선택) |
| 매주 새 논문 목록 받기 | [5번](docs/claude-science-setup.md#5-주간-논문-digest-선택) |

**어떤 일에 어떤 스킬이 붙는지** 궁금하시면 → [스킬 지도](docs/skill-map.md)

---

## 같이 들어있는 도구

- [`tools/nslab-orchestrate`](tools/nslab-orchestrate) — 공용 랩 노드 중 지금 한가한 곳을 골라,
  정해진 CPU 할당 범위 안에서 공손하게 계산을 돌립니다. `nslab status` / `nslab run`.
- [`tools/ns-feed-digest`](tools/ns-feed-digest) — 학술지 RSS 22개를 훑어 network science 관련
  신규 논문만 골라 주간 markdown 으로 정리합니다. 설치할 것 없이 `python3` 만 있으면 돕니다.

---

## 터미널 없이 — ChatGPT · Gemini 웹앱

스킬 업로드를 지원하면 폴더 전체를 사용하세요. 프롬프트만 입력할 수 있는 환경에서는
선택한 `SKILL.md`의 프런트매터(`--- … ---`)를 뺀 본문과 필요한 참조를 함께 제공합니다.

- 네트워크 과학: [`network-science-kr`](skills/network-science-kr/SKILL.md)와 작업에 관련된 참조 파일.
- 통계물리·복잡계: [`statphys-pre`](skills/statphys-pre/SKILL.md)와 작업에 관련된 참조 파일
  (수치 작업이면 `kernel.py`도 함께 — 자동 로드가 없는 환경에서는 직접 실행해야 합니다).
- 스킬 추천: [`research-skill-guide`](skills/research-skill-guide/SKILL.md)와
  [추천 카탈로그](skills/research-skill-guide/references/catalog.md).

웹앱이 로컬 파일을 읽거나 Python·검색을 실행할 수 있는지는 별도로 확인해야 합니다.
자료 탐색 기능이 없으면 확인 날짜가 있는 추천 링크를 안내하며 최신 정보를 확인했다고 하지 않습니다.

---
## License

**GNU General Public License v3** — see `LICENSE`.

This skill, including all instructions, scripts, and templates, is released under GPL v3. Outputs you generate from your own papers belong to you.

> *Not that GNU, but yes, this is from GNU (Gyeongsang National University) and released under the GNU GPL :D*

If GPL doesn't fit your use case (e.g., embedding in proprietary tooling), feel free to open an issue to discuss a dual-license arrangement.


## 고지

이 레포의 스킬은 연구 질문 정리, 방법론 점검, 레퍼런스 탐색을 돕기 위한 비공식 교육용 도구입니다. 특정 개인, 연구실, 기관의 공식 입장이나 발언을 대변하지 않습니다.

출력은 초안과 점검표로 사용하세요. 인용, 수식, 해석, 연구 주장에 대한 최종 책임은 사용자에게 있습니다. 도움을 받되, 생각은 대신 맡기지 마세요.
