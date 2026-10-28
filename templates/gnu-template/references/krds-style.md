# KRDS 디자인 스타일 — gnu-template 적용 메모

KRDS 디자인 스타일 규칙(색상·타이포그래피·형태·레이아웃·아이콘·엘리베이션·선명한 화면 모드·디자인 토큰)의 정본은 [`krds-design-system/DESIGN-SYSTEM.md`](../../krds-design-system/DESIGN-SYSTEM.md)다. 누리집 상세 페이지 8쪽과 키트 v1.1.0을 함께 읽고 정리한 문서이므로 규칙은 그쪽을 따른다. 이 파일에는 gnu-template 웹 빌더가 그 규칙을 **어떻게 구현했는지**만 남긴다.

저장소를 통째로 받지 않고 이 폴더만 쓰는 경우에도 아래 표와 [krds.md](krds.md)로 웹 작업은 할 수 있다.

## 장별 적용

| DESIGN-SYSTEM.md | gnu-template 웹의 구현 |
|---|---|
| 0장 확장형 | 국립대는 독자 로고를 쓰므로 확장형. 정부 상징·공식 배너(masthead)·KRDS 로고는 넣지 않는다. 학교 로고도 기본 제외(`"logo": true`일 때만) |
| 2장 색상 | `assets/krds/krds-gnu-tokens.css`가 primary·secondary·point 33개 값만 덮어쓴다(`scripts/gnu_palette.py`, coloraide 사용). 값 표는 [krds.md 1장](krds.md#1-색-krds-단계에-gnu-색-넣기). 선택 영역은 secondary-50 바탕 + 흰 글자 |
| 3장 타이포그래피 | 기본 Pretendard GOV, `"font": "gnu"`면 본문 Noto Sans KR + 제목·메뉴 SUITE. 크기 체계는 KRDS 그대로, 한글은 `word-break: keep-all` |
| 4장 형태 | 키트 값(버튼·입력 6·8px)을 그대로 쓴다. 인쇄물(A4·포스터·발표)은 학교 양식대로 각진 테두리 |
| 5장 레이아웃 | `assets/krds/krds-gnu.css`: 1200px(감싸는 폭 1248px), 분기점 1280·1024·768, 간격은 키트 토큰. 수치는 [krds.md 3장](krds.md#3-간격크기) |
| 6장 아이콘 | 새 창·메뉴·꺾쇠만 CSS/인라인 SVG로 그린다. 키트 아이콘 이미지는 이용약관 때문에 복사하지 않는다 |
| 7장 엘리베이션 | 웹 템플릿에는 떠 있는 요소가 없어 그림자를 쓰지 않는다. 모바일 전체메뉴는 면 색과 경계선으로 구분 |
| 8장 선명한 화면 모드 | GNU 고대비 단계는 아직 빌더에 넣지 않았다(고대비에서는 KRDS 기본값). 쓰려면 `krds-design-system/tokens/primitives.css`의 `high-contrast` 값을 불러온다. 운영체제 고대비(`forced-colors`)에서는 선택 표시가 밑줄로 남는다 |
| 9장 디자인 토큰 | 1층(primitive)만 바꾸고 의미·컴포넌트 토큰은 키트 이름 그대로 |
| 12장 점검표 | 웹 결과물도 같은 점검표로 확인한다. 추가로 읽기용 PDF에서는 메뉴류를 뺀다(DESIGN.md 6장) |

## 두 폴더의 색 값

`krds-gnu-tokens.css`와 `krds-design-system/tokens/primitives.css`의 기본 모드 primary·secondary·point 33개 값은 같다(예: primary-50 `#007EB0`). 두 스크립트가 같은 계산을 쓰고, `krds-design-system/scripts/build_tokens.py`가 실행할 때마다 일치 여부를 검사한다. 색을 바꿀 때는 두 스크립트를 함께 고치고 둘 다 다시 실행한다.
