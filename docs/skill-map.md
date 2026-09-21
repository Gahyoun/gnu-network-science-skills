# 물리학·데이터과학 학생을 위한 스킬 지도

논문 찾기, 수식 확인, 데이터 분석, 코드 디버깅 중 **지금 하고 싶은 일**에서 시작하세요.
스킬은 AI의 작업 지침입니다. Python 라이브러리나 논문 검색 서비스 자체는 아니므로,
스킬을 설치해도 필요한 패키지·검색 도구·계정이 함께 생기지는 않습니다.

## 무엇부터 써야 할지 모르겠다면

이 저장소의 **[`research-skill-guide`](../skills/research-skill-guide/SKILL.md)**에 목표를 말하세요.
설치 방법은 [README](../README.md#설치--터미널에-복붙만-macos--linux--windows)에 있습니다.

```text
물리학을 공부하고 Python은 기초 수준이야. 진자 운동 데이터를 분석하려고 해.
추가 유료 API 없이 쓸 스킬 2개와 추천 이유, 원문 링크, 시작할 요청문을 알려줘.
```

길잡이는 현재 설치된 스킬을 확인하고, 적절한 스킬로 같은 대화에서 이어가거나
별도 설치가 필요한 원문을 안내합니다. **링크 안내는 자동 설치·자동 실행이 아닙니다.**
추천만 요청했다면 분석이나 설치를 시작하지 않습니다.

## 목적별 빠른 선택

아래 난이도는 이 가이드의 추천 기준입니다. **입문**은 안내를 따라 시작할 수 있는 수준,
**중급**은 해당 수학·통계·Python 기초, **심화**는 분야 지식과 결과 검증 능력을 뜻합니다.
외부 스킬의 기능·도구·비용 조건과 확인 기록은 [추천 카탈로그](../skills/research-skill-guide/references/catalog.md)에 모았습니다.

| 하고 싶은 일 | 추천 | 수준 | 첫 결과물 |
|---|---|---|---|
| 논문 검색·DOI·서지 확인 | [`paper-lookup`](../skills/research-skill-guide/references/catalog.md#paper-lookup) | 입문 | 검색식, 후보 논문, 원문 링크 |
| 연구 주제 좁히기·반증 가능한 가설 | [`scientific-brainstorming`](../skills/research-skill-guide/references/catalog.md#scientific-brainstorming) | 입문–중급 | 질문과 작은 검증 계획 |
| 논문의 가정·근거·해석 비판 | [`scientific-critical-thinking`](../skills/research-skill-guide/references/catalog.md#scientific-critical-thinking) | 중급 | 주장–근거–한계 정리 |
| 미분·적분·고유값·기호식 확인 | [`sympy`](../skills/research-skill-guide/references/catalog.md#sympy) | 입문–중급 | 가정을 명시한 식과 수치 대조 |
| 실험 단위·오차 전파 | [`uncertainty-and-units`](../skills/research-skill-guide/references/catalog.md#uncertainty-and-units) | 중급 | 단위와 불확도를 포함한 결과 |
| 양자 상태·열린 양자계 시뮬레이션 | [`qutip`](../skills/research-skill-guide/references/catalog.md#qutip) | 심화 | 상태/연산자와 동역학 계산 |
| 네트워크 개념·한국어 교재·모형 검증 | [`network-science-kr`](../skills/network-science-kr/SKILL.md) | 입문–심화 | 개념·가정·null model·분석 |
| 상전이·임계지수·유한 크기 스케일링 | [`statphys-pre`](../skills/statphys-pre/SKILL.md) | 중급–심화 | T_c·지수 추정, data collapse, 오차 |
| 네트워크 위 전염·동기화·집단동역학 | [`statphys-pre`](../skills/statphys-pre/SKILL.md) | 중급–심화 | 임계점 유도, 시뮬레이션, 전이 차수 판정 |
| 투고 전 자기 점검·저널 선택 | [`statphys-pre`](../skills/statphys-pre/SKILL.md) | 중급–심화 | referee 관점 지적, 저널 지형도, 초록 골격 |
| 그래프 데이터 Python 구현 | [`networkx`](../skills/research-skill-guide/references/catalog.md#networkx) | 중급 | 중심도·경로·커뮤니티 코드 |
| 재현 가능한 실습·분석 노트북 | [`jupyter-notebook`](../skills/research-skill-guide/references/catalog.md#jupyter-notebook) | 입문 | 순서대로 실행되는 `.ipynb` |
| 회귀·분류·군집·모델 평가 | [`scikit-learn`](../skills/research-skill-guide/references/catalog.md#scikit-learn) | 중급 | 기준 모형, 데이터 분할, 평가 |
| 가설검정·효과크기 정리 | [`statistical-analysis`](../skills/research-skill-guide/references/catalog.md#statistical-analysis) (보조) | 중급 | 설계·가정·효과크기·구간 추정 |
| 논문 그림·다중 패널·오차막대 | [`scientific-visualization`](../skills/research-skill-guide/references/catalog.md#scientific-visualization) | 중급 | 데이터에서 생성한 과학 그림 |
| 코드 오류 재현·원인 추적 | [`systematic-debugging`](../skills/research-skill-guide/references/catalog.md#systematic-debugging) | 입문–중급 | 최소 재현 예제와 수정 근거 |
| 확인된 결과로 논문 초안 작성 | [`scientific-writing`](../skills/research-skill-guide/references/catalog.md#scientific-writing) | 중급 | 출처·한계가 드러나는 초안 |

## 과제별 추천 순서

### 실험물리: 진자 주기와 측정 오차

`jupyter-notebook` → `uncertainty-and-units` → 필요하면 `scientific-visualization`.

```text
길이와 주기 측정값으로 중력가속도를 추정하고 싶어. 먼저 단위와 반복 측정 구조를
확인해줘. 측정 오차의 상관을 고려하고 피팅 잔차와 불확도를 볼 수 있는 노트북을 만들어줘.
```

### 통계물리·네트워크: 스미기와 유한 크기 효과

네트워크 **구조**를 재는 문제는 `network-science-kr` → 구현이 필요하면 `networkx` +
`jupyter-notebook`. 구조 위의 **과정과 상전이**(스미기 임계값, 전염·동기화, 격자 Ising의
임계지수, 유한 크기 스케일링, Monte Carlo 오차)는 `statphys-pre` 로 갑니다. 두 스킬은
같은 대화에서 함께 쓸 수 있습니다.

```text
여러 크기의 무작위 네트워크에서 스미기 임계값을 비교하려고 해.
관측량과 null model, 유한 크기 효과부터 설명하고 작은 재현 실험을 설계해줘.
```

```text
L = 16, 24, 32, 48 에서 잰 Ising 시계열이 있어. 자기상관 고려해서 오차 내고
Binder 교차로 T_c, 그다음 nu 와 beta/nu 를 data collapse 로 확인해줘.
```

### 데이터과학: 작은 데이터로 예측 모형 만들기

`jupyter-notebook` → `scikit-learn` → 오류가 있으면 `systematic-debugging`.

```text
이 데이터의 타깃을 예측하려고 해. 데이터 누수가 없게 분할하고 단순한 기준 모형부터
비교해줘. 전처리는 훈련 데이터에만 맞추고, 평가의 변동성과 실패 사례를 설명해줘.
```

### 첫 문헌 조사: 질문을 읽을 논문으로 바꾸기

`scientific-brainstorming` → `paper-lookup` → `scientific-critical-thinking`.

```text
복잡계에서 동기화를 공부하려고 해. 범위를 좁힐 질문을 제안하고, 입문 리뷰와 대표
원논문을 찾아줘. DOI/arXiv 링크를 확인하고 각 논문의 가정과 내가 직접 읽을 부분을 알려줘.
```

## 발표·파일·랩 도구로 연결하기

| 요청 | 이동할 곳 | 조건 |
|---|---|---|
| 익숙한 공개 논문으로 저널클럽 덱과 대본 만들기 | [`stem-journal-club-deck`](https://github.com/Gahyoun/stem-journal-club-deck) | 외부 배포. 원 제작자가 숙련자용으로 안내하며 첫 논문 읽기 학습에는 수동 구성을 권장. [상세](../skills/research-skill-guide/references/catalog.md#stem-journal-club-deck) |
| PDF·Word·Excel·PowerPoint 파일 자체 편집 | 현재 환경의 해당 파일 형식 스킬 | 제품·계정마다 이름과 설치 여부가 다름. 목록을 확인한 뒤 사용 |
| 랩 서버에서 계산 | [`tools/nslab-orchestrate`](../tools/nslab-orchestrate) | 이 저장소의 CLI 도구. 서버 접근·설정 필요 |
| 학술지 RSS에서 새 논문 골라 보기 | [`tools/ns-feed-digest`](../tools/ns-feed-digest) | 이 저장소의 Python 도구. 체계적 문헌 검색을 대체하지 않음 |

## 연결이 안 될 때

- `network-science-specialist`, `dataviz`, 개인 어드바이저는 이 저장소의 배포 스킬이 아닙니다.
  이름만 보고 있다고 가정하지 않습니다. 네트워크 코딩은 `network-science-kr`에서도 계속할 수 있습니다.
- 외부 스킬은 **실제 `SKILL.md`뿐 아니라 참조·스크립트를 포함한 폴더**를 확인하세요.
  전체 모음을 한꺼번에 설치하기보다 필요한 스킬부터 고르는 편이 사용 목적을 파악하기 쉽습니다.
- 설치 요청 예: "이 원문 링크의 스킬을 내 도구에 설치해줘. 필요한 의존성과 비용 조건도 확인해줘."
- 목록에 없는 작업은 "이 작업에 맞는 공개 `SKILL.md`를 찾아 원 제작자와 요구사항을 확인해줘"라고
  요청하세요. 없으면 일반 코딩 도구나 라이브러리 공식 문서로 안내합니다.

추천 목록은 완전한 목록이나 성능 순위가 아닙니다. 확인 날짜 이후 원본 내용·서비스 조건이
바뀔 수 있으므로 새로 설치할 때 원문을 다시 확인하세요.
