# GNU Network Science Skills

GNU(경상국립대) 네트워크 사이언스 그룹용 [Agent Skill](https://code.claude.com/docs/en/skills) 모음.
스킬은 `SKILL.md` 하나로 된 공개 표준이라 **Claude Code · Codex CLI · Gemini CLI · Cursor** 등에서
그대로 쓸 수 있고, ChatGPT·Gemini 웹앱에도 붙여넣어 쓸 수 있습니다.

**들어있는 스킬**
- **`ask-to-professor`** — Sang Hoon Lee(SHL)의 물리학자·연구자·교수 스타일 연구 어드바이저.
  레포트 피드백, 결과 분석, 아이디어 논의, 레퍼런스 탐색. 학생에겐 단계까지 풀어 설명하는 상냥 모드가
  기본, 물리 배경이 드러나면 날카로운 심화 모드로 자동 전환.
- **`network-science-rag`** — 네트워크 사이언스 RAG(검색 증강) 레퍼런스. **준비 중**(`drafts/`).

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
  cp -Rf ~/gnu-network-science-skills/skills/ask-to-professor ~/$d/skills/
done
echo "설치 완료. 새 세션에서 /ask-to-professor 로 확인하세요."
```

### Windows (PowerShell)

```powershell
# 1) 레포 받기 (이미 있으면 자동 업데이트)
if (Test-Path "$HOME\gnu-network-science-skills") { git -C "$HOME\gnu-network-science-skills" pull } else { git clone https://github.com/Gahyoun/gnu-network-science-skills.git "$HOME\gnu-network-science-skills" }

# 2) 쓰는 도구들 스킬 폴더에 설치
foreach ($d in ".claude",".codex",".gemini") {
  New-Item -ItemType Directory -Force "$HOME\$d\skills" | Out-Null
  Copy-Item -Recurse -Force "$HOME\gnu-network-science-skills\skills\ask-to-professor" "$HOME\$d\skills\"
}
Write-Host "설치 완료. 새 세션에서 /ask-to-professor 로 확인하세요."
```

> Windows에서 Git Bash를 쓴다면 위 **macOS/Linux 블록**을 그대로 쓰면 됩니다.

### 확인

**새 세션(터미널 다시 시작)** 을 연 뒤:
- Claude Code / Codex CLI: `/ask-to-professor` 입력, 또는 그냥 연구 질문.
- Gemini CLI: 연구 질문을 하면 동의창이 뜨며 활성화. 목록은 `/skills`.
- 그래도 안 잡히면 도구를 완전히 재시작하세요.

### 삭제

```bash
# macOS / Linux
rm -rf ~/.claude/skills/ask-to-professor ~/.codex/skills/ask-to-professor ~/.gemini/skills/ask-to-professor
```
```powershell
# Windows PowerShell
".claude",".codex",".gemini" | % { Remove-Item -Recurse -Force "$HOME\$_\skills\ask-to-professor" -ErrorAction SilentlyContinue }
```

---

## 터미널 없이 — ChatGPT · Gemini 웹앱

파일 개념이 없으니, `skills/ask-to-professor/SKILL.md`에서 맨 위 프런트매터(`--- … ---`)를 **뺀 본문**을
그대로 붙여넣으면 됩니다.

- **ChatGPT** — *Custom GPT 만들기 → Instructions*(또는 프로젝트 지시문)에 본문 붙여넣기.
- **Gemini** — *Gem 만들기 → 지시문*에 본문 붙여넣기.
- **급하면** 새 채팅 첫 메시지에 본문을 붙여넣어도 그 대화 동안 동일하게 작동.
- **Claude.ai** — 설정 → Features에서 스킬 폴더를 zip으로 업로드.

> 웹앱은 검색 도구가 켜져 있어야 레퍼런스 탐색에서 실제 인용을 가져옵니다(없으면 규칙대로 방향만
> 제시하고 지어내지 않음).

---

## 유지보수 / 기여 (그룹 내부)

- 새 스킬: `skills/<이름>/SKILL.md` 생성. 폴더명 = `name:` 필드, 소문자·하이픈, 사람 이니셜 대신
  용도 중심 이름. `description`은 트리거·용도를 구체적으로(도구 호환 위해 ~1024자 이내).
- 작업 중인 스킬은 먼저 `drafts/<이름>/`에 둡니다 — 여기 있는 건 어떤 에이전트도 자동 로드하지 않음.
  동작하면 `skills/`로 옮깁니다.
- 팀 프로젝트에서 공유하려면 Codex·Gemini 공용 경로 `.agents/skills/ask-to-professor/`에 한 번만
  넣어 커밋해도 됩니다.

```
gnu-network-science-skills/
├── README.md
├── skills/                      # 배포되는 스킬
│   └── ask-to-professor/SKILL.md
└── drafts/                      # 준비 중 — 자동 로드 안 됨
    └── network-science-rag/
```

### 배포 (유지보수자용, 최초 1회)

```bash
# 로컬 커밋은 되어 있음. GitHub에 새 repo를 만든 뒤:
cd ~/gnu-network-science-skills
git remote add origin https://github.com/Gahyoun/gnu-network-science-skills.git
git push -u origin main
```
이후 수정 → `git add -A && git commit -m "..." && git push`. 학생은 위 설치 블록을 다시 붙여넣어 갱신.

---

## 라이선스 / 고지

그룹 내 연구·교육용. `ask-to-professor`는 지도 스타일을 **추상적으로 에뮬레이션**한 것으로, 실제 교수
본인의 발언이 아니며 그의 발언으로 인용해선 안 됩니다. 원본 자료는 재배포하지 마세요.
