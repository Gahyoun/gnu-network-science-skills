# 연구·코딩 스킬 추천 카탈로그

**문서 확인일: 2026-09-20.** 학생에게 필요한 작업을 기준으로 선별했습니다.
난이도·우선순위는 이 가이드의 판단이며, 아래 원문과 요구사항을 확인한 것이지 외부
스킬의 설치·스크립트 실행·과학적 정확성 전체를 검증한 것은 아닙니다.

## 선택과 설치

- 이 저장소에 포함: `research-skill-guide`, `network-science-kr`.
- 아래 외부 스킬은 모두 **공개 배포·별도 설치**입니다. 현재 사용자의 설치 상태는 실행 시 확인합니다.
- "추가 API 키 불필요"는 해당 핵심 작업 기준입니다. AI 호스트 이용료·컴퓨팅 비용을 뜻하지 않습니다.
- 원문 링크에서 `SKILL.md`와 함께 참조·스크립트·라이선스를 확인하고 **필요한 폴더 전체**를 설치합니다.
  라이브러리 패키지 설치는 별개입니다. 설치 방식은 사용 중인 호스트의 안내를 따릅니다.
- Codex에서는 원문 링크를 주고 `$skill-installer`에 설치를 요청할 수 있습니다.
  [공식 스킬 안내](https://learn.chatgpt.com/docs/build-skills).
  Claude Code와 Gemini CLI는 각 [Claude 안내](https://code.claude.com/docs/en/skills),
  [Gemini 안내](https://geminicli.com/docs/cli/skills/)를 확인하세요.
- 참조 대상이 다른 스킬이면 그 스킬도 확인합니다. 존재하지 않는 연결을 만들어 내거나
  카탈로그만 보고 설치·실행됐다고 말하지 않습니다.

## 문헌과 연구 설계

### paper-lookup

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/paper-lookup/SKILL.md) · 입문–중급 · 우선 추천

- **맞는 일:** arXiv 등에서 논문 찾기, DOI·서지 확인, 관련 문헌 추적.
- **준비:** 인터넷·curl, 번들 스크립트는 Python 3.11+. arXiv/Crossref는 별도 키 없이 시작 가능.
  CORE는 키 필요, Semantic Scholar 키는 선택, Unpaywall은 실제 이메일 필요. 서비스별 제한 확인.
- **첫 요청:** "스미기 임계값의 유한 크기 효과에 관한 입문 리뷰와 원논문을 찾아 검색식,
  DOI/arXiv 링크, 읽을 순서를 정리해줘. 초록만 확인한 논문은 구분해줘."
- **선택 이유:** 몇 편의 논문을 찾는 과제에 적합. 검색 결과만으로 논문 내용·연구 신규성을 확정하지 않음.

### scientific-brainstorming

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/scientific-brainstorming/SKILL.md) · 입문–중급 · 우선 추천

- **맞는 일:** 주제 좁히기, 가정·예측·반증 가능성을 가진 연구 질문 비교.
- **준비:** 핵심 안내는 별도 패키지·API 키 불필요. 선택 로컬 CLI는 Python 3.11+.
- **첫 요청:** "동기화와 네트워크 구조를 연결하는 학부 프로젝트 후보 3개를 제안하고,
  각 후보의 관측량, 필요한 데이터, 실패할 조건, 1주일짜리 예비 실험을 비교해줘."
- **선택 이유:** 막연한 흥미를 작은 검증 계획으로 연결. 아이디어와 검증된 결과를 구분.

### scientific-critical-thinking

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/scientific-critical-thinking/SKILL.md) · 중급 · 우선 추천

- **맞는 일:** 주장–근거 대응, 가정, 표집 편향, 교란, 해석의 논리 점검.
- **준비:** 논문 본문 또는 확인 가능한 자료. 핵심 검토에는 추가 API 키 불필요.
  선택 AI 도식 기능은 OpenRouter 키와 외부 전송을 요구할 수 있음.
- **첫 요청:** "이 논문의 핵심 주장 3개를 근거와 대응시키고, 가정이 깨지면 어느 결론이
  달라지는지 설명해줘. 원문 사실과 네 해석을 구분해줘."
- **주의:** 임상 연구의 GRADE/Cochrane 같은 틀을 이론물리 논문에 기계적으로 적용하지 않기.

### scientific-writing

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/scientific-writing/SKILL.md) · 중급 · 결과 확인 후 추천

- **맞는 일:** 검증된 분석을 방법·결과·한계가 일치하는 보고서나 논문 초안으로 정리.
- **준비:** 결과와 확인한 출처. 핵심 안내는 별도 API 키 불필요. 선택 로컬 CLI는 Python 3.11+.
- **첫 요청:** "이 결과와 내가 확인한 문헌만으로 Methods와 Results를 작성해줘.
  수치·주장마다 근거를 대응시키고 출처 확인이 필요한 부분은 표시해줘."
- **주의:** 원문은 사실·수치와 근거 ID의 대응 및 사람의 출처 확인을 요구함. 검증을 마치기
  전 초안을 완성 논문으로 취급하지 않기.

## 물리·수학 계산

### sympy

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/sympy/SKILL.md) · 입문–중급 · 우선 추천

- **맞는 일:** 기호 미적분, ODE, 고유값, 유도식 검산, 기호식에서 수치 함수 만들기.
- **준비:** 원문 기준 Python 3.9+, SymPy 1.14+. NumPy/SciPy/Matplotlib는 선택. 로컬 계산, 추가 API 키 불필요.
- **첫 요청:** "감쇠 진동자의 해를 초기조건과 매개변수 가정까지 명시해 구하고,
  원래 미분방정식에 대입해서 검산한 뒤 수치해와 비교해줘."
- **주의:** 기호 가정·정의역·정확한 유리수와 부동소수점 구분. 대량 수치계산은 NumPy/SciPy 등으로 연결.

### uncertainty-and-units

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/uncertainty-and-units/SKILL.md) · 중급 · 실험물리 우선 추천

- **맞는 일:** 단위·차원, 측정 불확도 전파, 상관, 유효숫자, 규모 타당성 점검.
- **준비:** Python 3.12+. 수치 CLI는 pint·uncertainties·NumPy·SciPy, 정적 감사는 표준 라이브러리.
  핵심 작업은 로컬이며 추가 API 키 불필요.
- **첫 요청:** "이 실험식의 단위를 확인하고 입력 측정값의 공분산을 반영해 오차를
  전파해줘. 독립성을 가정한 결과와 비교하고 유효숫자를 설명해줘."

### qutip

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/qutip/SKILL.md) · 심화 · 양자계에 한정

- **맞는 일:** 닫힌/열린 양자계, Lindblad 방정식, 정상상태·양자 궤적 계산.
- **준비:** 원문 기준 Python 3.11+, uv, `qutip==5.3.0`. 로컬 계산, 추가 API 키 불필요.
- **첫 요청:** "감쇠하는 2준위계의 Lindblad 동역학을 계산하고 trace·양의 준정부호성,
  시간 간격 수렴을 확인해줘. ℏ=1과 주파수 단위의 뜻도 설명해줘."
- **주의:** 양자역학 기초 필요. Hz/rad/s, 텐서 곱 순서와 수치 수렴 확인. 일반 고전역학/PDE나
  양자 하드웨어 실행 요청의 기본 경유지가 아님.

## 네트워크·데이터·코딩

### networkx

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/networkx/SKILL.md) · 중급 · 구현 지원

- **맞는 일:** 중심도·경로·커뮤니티, ER/BA/WS 그래프, 인용·사회 네트워크 구현.
- **준비:** NetworkX 3.x. 원문은 NetworkX 3.6/Python 3.11+ 대상으로 설명. 그림은 Matplotlib.
  로컬 계산, 추가 API 키 불필요.
- **첫 요청:** "이 edgelist의 방향·가중치·자기루프·고립점을 확인하고 중심도와 커뮤니티를
  계산해줘. 지표 정의와 코드, 난수 시드, 작은 예제 검산도 보여줘."
- **함께 사용:** `network-science-kr`가 관측량·귀무모형·한국어 해석을 담당할 수 있음.
  큰 그래프는 메모리·규모를 먼저 확인. 커뮤니티 검출만으로 과학적 실재를 단정하지 않기.

### jupyter-notebook

[원문](https://github.com/openai/skills/blob/main/skills/.curated/jupyter-notebook/SKILL.md) · 입문 · 코딩 시작점

- **맞는 일:** 실험·탐색과 수업용 노트북 생성, 기존 분석의 재현성 개선.
- **준비:** 생성 스크립트는 Python 표준 라이브러리. 실행에는 JupyterLab/ipykernel과 분석
  패키지가 필요할 수 있음. 별도 유료 API 키 요구 없음.
- **첫 요청:** "이 분석을 입력부터 그림까지 새 커널에서 실행되는 노트북으로 정리해줘.
  각 셀의 목적과 의존성, 시드, 실행 확인 결과를 적어줘."
- **주의:** 노트북 파일 생성과 셀 전체 실행 성공은 구분해서 보고.
- **호스트별 경로:** 확인한 원문은 `$CODEX_HOME/skills/jupyter-notebook` 경로를 사용함.
  `~/.agents/skills` 또는 Claude/Gemini에 설치했다면 실제 설치 폴더의
  `scripts/new_notebook.py`를 찾아 경로·셸 명령을 맞춰야 함. 설치 성공만으로 경로 호환을 가정하지 않기.

### scikit-learn

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/scikit-learn/SKILL.md) · 중급 · 예측 분석

- **맞는 일:** 분류·회귀·군집·PCA, 전처리 Pipeline, 교차검증과 모델 비교.
- **준비:** 원문 기준 Python 3.11+, scikit-learn 1.7+, NumPy/SciPy. 그림·표 패키지 선택.
  로컬 학습, 추가 API 키 불필요.
- **첫 요청:** "단순 기준 모형부터 비교하고 전처리를 Pipeline에 넣어 교차검증해줘.
  같은 사람의 반복 관측이 섞이지 않게 분할하고 평가의 변동성을 보여줘."
- **주의:** 시간·집단 구조가 있는 데이터는 무작위 분할을 자동 적용하지 않기. 예측 성능과 인과 설명을 구분.

### scientific-visualization

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/scientific-visualization/SKILL.md) · 중급 · 결과 전달

- **맞는 일:** 데이터 기반 다중 패널, 오차막대, 로그축, 출판용 과학 그림.
- **준비:** Python 3.11+, uv와 사용 경로에 따른 Matplotlib/Seaborn/Plotly/Pillow/pypdf.
  Plotly 정적 출력은 Kaleido 및 Chrome/Chromium 필요. 핵심 도우미는 네트워크 없이 실행.
- **첫 요청:** "이 데이터와 불확도를 다중 패널 그림으로 만들고 축·단위·표본 수·오차막대
  의미를 명시해줘. 색각 다양성과 흑백 출력에서도 구분되게 해줘."
- **주의:** 데이터·불확도를 이미지 생성으로 대체하지 않기. 학술지별 출력 규격은 현재 공식 지침 확인.

### systematic-debugging

[원문](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md) · 입문–중급 · 오류 원인 추적

- **맞는 일:** 오류·테스트 실패·예상과 다른 계산 결과를 재현하고 근본 원인 찾기.
- **준비:** 해당 프로젝트의 실행·테스트 환경. 특정 언어나 유료 API 요구 없음.
- **첫 요청:** "이 에러를 작은 입력으로 재현하고 원인 가설을 하나씩 검증해줘.
  최소 수정 후 같은 문제가 재발하는지 확인해줘."
- **연계:** 같은 저장소의 [`test-driven-development`](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md),
  [`verification-before-completion`](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)를 참조함.
  설치 시 연계 파일·스킬 가용성을 확인. 실행 성공은 물리 모형의 정확성을 증명하지 않음.

## 조건부·특수 목적 추천

### statistical-analysis

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/statistical-analysis/SKILL.md) · 중급 · 검토를 동반하는 보조자료

- **맞는 일:** 집단 비교·회귀·효과크기·검정력·통계 보고의 후보 절차 점검.
- **준비:** 원문 기준 Python 3.10+; 패키지 최신 조합은 더 높은 버전 필요 가능.
  Pingouin/SciPy/statsmodels/pandas 등, Bayesian 경로는 PyMC/ArviZ 추가. 핵심 로컬 분석에 API 키 불필요.
- **첫 요청:** "이 표집·반복 측정 구조에 맞는 모형과 가정을 먼저 설명해줘. 효과크기와
  신뢰구간을 보고하고 p-value만으로 효과의 존재나 인과성을 결론내리지 말아줘."
- **원문 점검 결과:** p-value를 효과의 존재와 연결하는 축약, 정규성 기반 자동 검정 선택은
  그대로 따르지 않기. [ASA 성명](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf)과 대조.
  `pg.ttest(correction='auto')`는 분산 차이가 아닌 **표본 크기 차이**에 따라 Welch를 선택함.
  Welch를 의도하면 `correction=True`를 명시: [Pingouin 공식 문서](https://pingouin-stats.org/generated/pingouin.ttest.html).

### literature-review

[원문](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/literature-review/SKILL.md) · 중급–심화 · 체계적 검토용

- **맞는 일:** 검색식·선정/배제 기준과 기록을 남기는 문헌검토.
- **조건:** 확인한 원문은 `parallel-cli` 설치·인증과 requests, AI 도식 생성을 요구하며
  PDF에는 Pandoc/LaTeX가 필요. 외부 서비스·인증·비용 조건을 따로 확인해야 함.
- **추천 판단:** 학생이 몇 편을 검색할 때는 `paper-lookup` 우선. 이 스킬을 무료·API 불필요
  시작 도구로 소개하지 않기. 체계적 리뷰의 재현 가능한 검색·선정 기록 자체는 별도로 수행 가능.

### gh-fix-ci

[원문](https://github.com/openai/skills/blob/main/skills/.curated/gh-fix-ci/SKILL.md) · 중급 · 공동 연구 저장소용

- **맞는 일:** GitHub PR의 GitHub Actions 실패 로그를 읽고 수정 경로 정리.
- **조건:** Python, 인증된 GitHub CLI `gh`, 저장소·워크플로 접근권한. 별도 유료 AI API 키 요구 없음.
  원문에는 구현 전 승인 단계가 있음. 외부 CI는 링크 안내 범위.
- **첫 요청:** "이 PR의 GitHub Actions 실패 원인을 로그에서 확인하고 수정안을 제시해줘."

### stem-journal-club-deck

[배포·설치 안내](https://github.com/Gahyoun/stem-journal-club-deck) · 심화 · 기존 관련 저장소

- **맞는 일:** 이미 읽고 이해한 공개 논문으로 저널클럽 덱과 대본 공동 제작.
- **준비:** 전체 파이프라인은 Pandoc, Node/npm, Python 및 문서 패키지, Poppler;
  Beamer는 TeX 배포판 추가. 단일 파일 프롬프트와 `.skill` 패키지로 배포됨.
- **학생용 판단:** 원 제작자는 숙련자용으로 안내하며 첫 논문 읽기 학습에는 직접 슬라이드
  구성을 권장. 초심자에게 자동 덱 제작을 기본 경로로 두지 않음.
- **포장 주의:** 확인 당시 저장소 루트에 독립 `SKILL.md`가 없었음. 루트를 그대로 복사하면
  설치된다고 안내하지 말고 실제 `.skill` 패키지와 포함 구조를 확인. 계획·리뷰 단계가 있는 작업 흐름.

## 출처와 확인 기록

최신 원문 링크는 위 각 항목에 있습니다. 아래 커밋은 문서 검토 시점의 참조입니다.
코드가 앞으로도 그대로 작동한다는 보장은 아닙니다. 외부 파일을 복제·재배포하지 않고
이 가이드의 요약과 원문 링크만 제공합니다.

| 공급처 | 확인한 경로·기록 | 라이선스 표기 확인 |
|---|---|---|
| K-Dense-AI/scientific-agent-skills | `skills/<name>/SKILL.md`, [확인 커밋](https://github.com/K-Dense-AI/scientific-agent-skills/tree/330c8e764435a731eff571e3efdda70b363d0792) | 저장소 [MIT](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/LICENSE.md). 개별 스킬의 `license`도 확인: `networkx`·`scikit-learn`은 BSD-3-Clause 표기, `sympy`는 [SymPy 라이선스](https://github.com/sympy/sympy/blob/master/LICENSE) 링크를 참조. 나머지 위 후보는 MIT 표기 |
| openai/skills | `skills/.curated/<name>/SKILL.md`, [확인 커밋](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431) | [jupyter-notebook](https://github.com/openai/skills/blob/main/skills/.curated/jupyter-notebook/LICENSE.txt), [gh-fix-ci](https://github.com/openai/skills/blob/main/skills/.curated/gh-fix-ci/LICENSE.txt): Apache-2.0 |
| obra/superpowers | `skills/systematic-debugging/SKILL.md`, [확인 커밋](https://github.com/obra/superpowers/tree/5bf4e78011075bcfc0dc295f0724994cd123ee71) | 저장소 [MIT](https://github.com/obra/superpowers/blob/main/LICENSE) |
| Gahyoun/stem-journal-club-deck | 2026-09-20에 README와 루트 배포 파일 목록 확인 | [GPL v3](https://github.com/Gahyoun/stem-journal-club-deck/blob/main/LICENSE) |

K-Dense의 이전 저장소 이름은 `claude-scientific-skills`였습니다. 현재 이름은
`scientific-agent-skills`, 폴더는 `skills/`입니다. 옛 `scientific-skills/` 경로를 만들지 마세요.

새 후보를 추가할 때는 목적·난이도·원 제작자·실제 파일 경로·의존성·서비스 조건·라이선스·
확인 날짜를 함께 갱신합니다. 검색에 실패하거나 실행하지 않은 부분은 그대로 표시합니다.
