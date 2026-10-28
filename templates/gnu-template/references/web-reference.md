# 웹페이지 기준

웹페이지의 기본형은 **KRDS 하위 페이지 + GNU 색 단계 + 글자로 쓴 운영 주체**다. 구조·토큰·접근성은 `references/krds.md`, 시작 파일은 `examples/web.html`, 내용 틀은 `data/web.json`이다.

## 만들기 전에 정할 것

1. 운영 주체: `site.org`(예: 경상국립대학교 ○○학과)와 `site.name`(사이트 이름). 머리글과 바닥글 식별 문구에 쓰인다.
2. 실제 쪽 구성: 한 쪽이면 섹션(`sections`)과 ‘이 페이지의 구성’만, 여러 쪽이면 `side_nav`에 실제 쪽 주소를 넣는다.
3. 실제 링크: `utility`(머리글 작은 링크), 섹션의 `links`·`buttons`, 바닥글 `policies`·`related`. 주소가 없으면 빌더가 뺀다.
4. 로고: 기본은 넣지 않는다. 학교가 허락한 경우에만 `"logo": true`(홈페이지 헤더 원본 PNG).
5. 서체: 기본 Pretendard GOV(KRDS). 대학 홈페이지와 같은 인상이 필요하면 `"font": "gnu"`(Noto Sans KR + SUITE 제목).

## data/web.json 항목

| 항목 | 내용 |
|---|---|
| `site` | `org`, `name`, `home`(로고 글자를 눌렀을 때 가는 주소) |
| `utility` | `[{label, url, new_window}]` 머리글 오른쪽 위 링크 |
| `menu` | 주 메뉴. 없으면 `sections`의 `menu`로 만든다. `in_menu: false`인 섹션은 빠진다 |
| `location` | 브레드크럼의 상위 단계. 문자열 또는 `{label, url}` |
| `title`, `lead` | 페이지 제목, 제목 아래 설명(원문이 있을 때만) |
| `side_nav` | `{title, items:[{label, url, current}]}` 실제 다른 쪽이 있을 때만 |
| `in_page_nav` | 섹션이 둘 이상일 때 ‘이 페이지의 구성’ 표시(기본 true) |
| `sections[]` | `id`, `menu`, `heading`, `body`, `list`, `table{caption, columns, rows, row_headers, title}`, `links[]`, `buttons[{label, url, variant}]` |
| `footer` | `address`, `contacts[{label, value}]`, `updated`, `links`, `policies[{label, url, point}]`, `copyright`, `related`, `identifier` |

`buttons[].variant`는 `primary`·`secondary`(기본)·`tertiary`. 한 화면의 주 버튼은 하나만 둔다.

## 확인

- 1440·1024·768·375·320px에서 가로 스크롤이 없는지, 1023px 이하에서 ‘전체메뉴’가 열리고 Esc로 닫히는지.
- Tab으로 본문 바로가기 → 본문 → 메뉴·링크·버튼이 순서대로 가고 포커스 링이 보이는지.
- 메뉴를 누르거나 스크롤하면 현재 섹션 표시가 따라오는지.
- 표 머리·선택 메뉴·버튼 글자의 대비(4.5:1 이상).
- 인쇄 미리보기에서 메뉴가 빠지고 본문이 순서대로 나오는지.

## 이전 기본형

2026-10-04의 기본형은 대학 VI 하위 페이지 화면(흰 헤더, 짙은 현재 위치 띠, 직사각형 하위 메뉴, 항목명·본문 두 열)을 본뜬 구성이었다. 2026-10-28 사용자 요청에 따라 KRDS 구성으로 바꿨다. 이전 구현은 저장소 기록(`git log -- templates/gnu-template/references/web-reference.md`)에 있다. 홈페이지의 떠 있는 캐릭터 메뉴(지누·기부·AI 상담)는 어느 쪽이든 넣지 않는다.
