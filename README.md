# GNU Network Science Skills

GNU(경상국립대) Network Science Lab 구성원들의 높은 작업 효율을 위한 [Agent Skill](https://code.claude.com/docs/en/skills) 모음.
스킬은 `SKILL.md` 기반의 가벼운 프롬프트/스킬 형식이라 **Claude Code · Codex CLI · Gemini CLI · Cursor** 등으로
쉽게 옮겨 쓸 수 있고, ChatGPT·Gemini 웹앱에도 붙여넣어 쓸 수 있습니다.

**들어있는 스킬**
- **`ask-to-professor`** — 물리학자·연구자·교수 스타일 연구 어드바이저.
  레포트 피드백, 결과 분석, 아이디어 논의, 레퍼런스 탐색. 
- **`network-science-kr`** — 한국어 친화 네트워크 과학 전문가. 뉴만·바라바시·『네트워크 분석』
  한국어 교재의 표준 용어·장 구성을 기준으로 개념 설명·연구 자문·문헌 리뷰·실제 데이터 분석(코딩).
  한국어 용어집 + 교재 장 지도 + 물리·수학·데이터과학 방법론 툴킷 내장.
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
  cp -Rf ~/gnu-network-science-skills/skills/ask-to-professor ~/gnu-network-science-skills/skills/network-science-kr ~/$d/skills/
done
echo "설치 완료. 새 세션에서 /ask-to-professor 또는 /network-science-kr 로 확인하세요."
```

### Windows (PowerShell)

```powershell
# 1) 레포 받기 (이미 있으면 자동 업데이트)
if (Test-Path "$HOME\gnu-network-science-skills") { git -C "$HOME\gnu-network-science-skills" pull } else { git clone https://github.com/Gahyoun/gnu-network-science-skills.git "$HOME\gnu-network-science-skills" }

# 2) 쓰는 도구들 스킬 폴더에 설치
foreach ($d in ".claude",".codex",".gemini") {
  New-Item -ItemType Directory -Force "$HOME\$d\skills" | Out-Null
  Copy-Item -Recurse -Force "$HOME\gnu-network-science-skills\skills\ask-to-professor" "$HOME\$d\skills\"
  Copy-Item -Recurse -Force "$HOME\gnu-network-science-skills\skills\network-science-kr" "$HOME\$d\skills\"
}
Write-Host "설치 완료. 새 세션에서 /ask-to-professor 또는 /network-science-kr 로 확인하세요."
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
rm -rf ~/.claude/skills/network-science-kr ~/.codex/skills/network-science-kr ~/.gemini/skills/network-science-kr
```
```powershell
# Windows PowerShell
".claude",".codex",".gemini" | % { Remove-Item -Recurse -Force "$HOME\$_\skills\ask-to-professor" -ErrorAction SilentlyContinue }
".claude",".codex",".gemini" | % { Remove-Item -Recurse -Force "$HOME\$_\skills\network-science-kr" -ErrorAction SilentlyContinue }
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
## License

**GNU General Public License v3** — see `LICENSE`.

This skill, including all instructions, scripts, and templates, is released under GPL v3. Outputs you generate from your own papers belong to you.

> *Not that GNU, but yes, this is from GNU (Gyeongsang National University) and released under the GNU GPL :D*

If GPL doesn't fit your use case (e.g., embedding in proprietary tooling), feel free to open an issue to discuss a dual-license arrangement.


## 고지

이 레포의 스킬은 연구 질문 정리, 방법론 점검, 레퍼런스 탐색을 돕기 위한 비공식 교육용 도구입니다. 특정 개인, 연구실, 기관의 공식 입장이나 발언을 대변하지 않습니다.

출력은 초안과 점검표로 사용하세요. 인용, 수식, 해석, 연구 주장에 대한 최종 책임은 사용자에게 있습니다. 도움을 받되, 생각은 대신 맡기지 마세요.
