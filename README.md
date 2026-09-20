# GNU Network Science Skills

경상국립대(GNU) Network Science Lab 사람들이 연구하면서 쓰려고 만든
[Agent Skill](https://code.claude.com/docs/en/skills) 모음입니다.

AI 에게 네트워크 과학을 물어보면 용어를 영어로 섞어 쓰거나, 교재마다 다른 정의를 뒤섞어
답하는 일이 많습니다. 이 스킬은 **뉴만·바라바시·『네트워크 분석』 한국어 교재의 표준 용어와
장 구성을 기준으로** 답하도록 붙잡아 줍니다.

> **처음 오셨나요?** 아래 [설치](#설치--터미널에-복붙만-macos--linux--windows) 한 블록만 복붙하시면 됩니다.
> 랩 서버·문헌 검색까지 붙이고 싶으시면 [랩 환경 초기 세팅](docs/claude-science-setup.md) 으로 오세요.

`SKILL.md` 기반의 가벼운 형식이라 **Claude Code · Codex CLI · Gemini CLI · Cursor** 어디로든
옮겨 쓸 수 있고, ChatGPT·Gemini 웹앱에 붙여넣어도 그대로 작동합니다.

**들어있는 스킬**
- **`network-science-kr`** — 한국어 친화 네트워크 과학 전문가. 뉴만·바라바시·『네트워크 분석』
  한국어 교재의 표준 용어·장 구성을 기준으로 개념 설명·연구 자문·문헌 리뷰·실제 데이터 분석(코딩).
  한국어 용어집 + 교재 장 지도 + 물리·수학·데이터과학 방법론 툴킷 내장.

관련 레포: [`stem-journal-club-deck`](https://github.com/Gahyoun/stem-journal-club-deck) (논문 → 저널클럽 덱).

---

## 설치 — 터미널에 복붙만 (macOS · Linux · Windows)

먼저 [Git](https://git-scm.com/downloads)이 설치돼 있어야 합니다. 아래 **한 블록**이면 Claude Code·
Codex CLI·Gemini CLI **세 곳 모두**에 설치됩니다(안 쓰는 도구 폴더는 그냥 무시됨). **업데이트도 같은
블록을 다시 붙여넣으면 됩니다.**

### macOS / Linux (Terminal)

```bash
# 1) 레포 받기 (이미 있으면 자동 업데이트)
git clone https://github.com/Gahyoun/gnu-network-science-skills.git ~/gnu-network-science-skills 2>/dev/null || git -C ~/gnu-network-science-skills pull

# 2) 쓰는 도구들 스킬 폴더에 설치
for d in .claude .codex .gemini; do
  mkdir -p ~/$d/skills
  cp -Rf ~/gnu-network-science-skills/skills/network-science-kr ~/$d/skills/
done
echo "설치 완료. 새 세션에서 /network-science-kr 로 확인하세요."
```

### Windows (PowerShell)

```powershell
# 1) 레포 받기 (이미 있으면 자동 업데이트)
if (Test-Path "$HOME\gnu-network-science-skills") { git -C "$HOME\gnu-network-science-skills" pull } else { git clone https://github.com/Gahyoun/gnu-network-science-skills.git "$HOME\gnu-network-science-skills" }

# 2) 쓰는 도구들 스킬 폴더에 설치
foreach ($d in ".claude",".codex",".gemini") {
  New-Item -ItemType Directory -Force "$HOME\$d\skills" | Out-Null
  Copy-Item -Recurse -Force "$HOME\gnu-network-science-skills\skills\network-science-kr" "$HOME\$d\skills\"
}
Write-Host "설치 완료. 새 세션에서 /network-science-kr 로 확인하세요."
```

> Windows에서 Git Bash를 쓴다면 위 **macOS/Linux 블록**을 그대로 쓰면 됩니다.

### 확인

**새 세션(터미널 다시 시작)** 을 연 뒤:
- Claude Code / Codex CLI: `/network-science-kr` 입력, 또는 그냥 네트워크 과학 질문.
- Gemini CLI: 연구 질문을 하면 동의창이 뜨며 활성화. 목록은 `/skills`.
- 그래도 안 잡히면 도구를 완전히 재시작하세요.

### 삭제

```bash
# macOS / Linux
rm -rf ~/.claude/skills/network-science-kr ~/.codex/skills/network-science-kr ~/.gemini/skills/network-science-kr
```
```powershell
# Windows PowerShell
".claude",".codex",".gemini" | % { Remove-Item -Recurse -Force "$HOME\$_\skills\network-science-kr" -ErrorAction SilentlyContinue }
```

---

## 이렇게 물어보시면 됩니다

스킬이 깔리면 `/network-science-kr` 를 굳이 안 쳐도 네트워크 과학 질문이면 알아서 붙습니다.

```
이 edgelist 로 커뮤니티 찾아주고, modularity 가 통계적으로 의미 있는지 null model 로 확인해줘
degree distribution 이 power law 라고 주장하려면 뭘 보여야 해? 내 데이터로 해봐줘
percolation threshold 를 유한 크기 효과 고려해서 추정하려면 어떻게 하지
betweenness 랑 closeness 중에 뭘 써야 하는 상황인지 모르겠어
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

파일 개념이 없으니, `skills/network-science-kr/SKILL.md`에서 맨 위 프런트매터(`--- … ---`)를 **뺀 본문**을
그대로 붙여넣으면 됩니다.

- **ChatGPT** — *Custom GPT 만들기 → Instructions*(또는 프로젝트 지시문)에 본문 붙여넣기.
- **Gemini** — *Gem 만들기 → 지시문*에 본문 붙여넣기.
- **급하면** 새 채팅 첫 메시지에 본문을 붙여넣어도 그 대화 동안 동일하게 작동.
- **Claude.ai** — 설정 → Features에서 스킬 폴더를 zip으로 업로드.

> 웹앱은 검색 도구가 켜져 있어야 레퍼런스 탐색에서 실제 인용을 가져옵니다(없으면 규칙대로 방향만
> 제시하고 지어내지 않음).

---
## License

**GNU General Public License v3** — see `LICENSE`.

This skill, including all instructions, scripts, and templates, is released under GPL v3. Outputs you generate from your own papers belong to you.

> *Not that GNU, but yes, this is from GNU (Gyeongsang National University) and released under the GNU GPL :D*

If GPL doesn't fit your use case (e.g., embedding in proprietary tooling), feel free to open an issue to discuss a dual-license arrangement.


## 고지

이 레포의 스킬은 연구 질문 정리, 방법론 점검, 레퍼런스 탐색을 돕기 위한 비공식 교육용 도구입니다. 특정 개인, 연구실, 기관의 공식 입장이나 발언을 대변하지 않습니다.

출력은 초안과 점검표로 사용하세요. 인용, 수식, 해석, 연구 주장에 대한 최종 책임은 사용자에게 있습니다. 도움을 받되, 생각은 대신 맡기지 마세요.
