# KRDS 기준 정리 (웹)

웹페이지는 KRDS(대한민국 정부 디자인 시스템) HTML 컴포넌트 키트 **krds-uiux v1.1.0**의 마크업·토큰·간격을 따른다. 색만 경상국립대 공식색에서 만든 단계로 바꾸고, 로고는 기본으로 넣지 않는다. 이 문서의 수치는 키트 원본 파일에서 읽거나, 키트 CSS로 그린 화면에서 잰 값이다.

- 원본: [KRDS-uiux/krds-uiux](https://github.com/KRDS-uiux/krds-uiux) (`resources/css/token/krds_tokens.css` 2024-12-09 생성본, `resources/css/common/common.css`, `resources/css/component/component.css`, `html/code/*.html`)
- 문서: [KRDS 누리집](https://www.krds.go.kr/html/site/index.html) · [컴포넌트](https://www.krds.go.kr/html/site/component/component_summary.html) · [디자인 스타일](https://www.krds.go.kr/html/site/style/style_01.html) · [기본 패턴](https://www.krds.go.kr/html/site/global/global_01.html) · [서비스 패턴](https://www.krds.go.kr/html/site/service/service_summary.html)
- 구현: `assets/krds/krds-gnu.css`(템플릿용, KRDS 클래스 이름 사용), `assets/krds/krds-gnu-tokens.css`(공식 키트용 색 덮어쓰기)

## 1. 색: KRDS 단계에 GNU 색 넣기

KRDS 색 단계 번호는 흰 바탕 대비를 뜻한다. 50은 4.5:1을 처음 넘는 단계(버튼 바탕·링크·아이콘), 60은 글자색, 5·10은 옅은 면이다. `scripts/gnu_palette.py`가 GNU 색의 색상(hue)을 유지한 채 단계마다 KRDS와 같은 휘도가 되도록 명도를 맞췄다. 그래서 KRDS의 대비 규칙이 그대로 성립한다.

| 단계 | KRDS primary | GNU primary (GNU Blue) | 대비 | GNU secondary (GNU Grey) | GNU point (Gold) |
|---|---|---|---|---|---|
| 5 | `#ecf2fe` | `#e3f4ff` | 1.13 | `#e3f4fe` | `#fff1d0` |
| 10 | `#d8e5fd` | `#c6e9ff` | 1.27 | `#d0e2eb` | `#efdcb0` |
| 20 | `#b1cefb` | `#8dd5ff` | 1.60 | `#baccd5` | `#cebb90` |
| 30 | `#86aff9` | `#3ab9f8` | 2.22 | `#9fb0b9` | `#af9d73` |
| 40 | `#4c87f6` | `#0094cd` | 3.43 | `#85959e` | `#938259` |
| 50 | `#256ef4` | `#007eb0` | 4.55 | `#607078` | `#86744c` |
| 60 | `#0b50d0` | `#006189` | 6.84 | `#4b5a62` | `#6b5a32` |
| 70 | `#083891` | `#004360` | 10.65 | `#2e3d44` | `#4f3f16` |
| 80 | `#052561` | `#002c41` | 14.62 | `#1f2d35` | `#372800` |
| 90 | `#03163a` | `#001a28` | 17.82 | `#132128` | `#211700` |
| 95 | `#020f27` | `#00111d` | 19.13 | `#0a171e` | `#170f00` |

gray(`#1e2124` 본문, `#464c53` 보조 글자, `#cdd1d5` 구분선, `#f4f5f6` 면)와 danger·warning·success·information은 KRDS 값을 그대로 쓴다. 공식 GNU Blue `#009EDB`(3.04:1)는 단계에 넣지 않고 `--gnu-brand-blue`로 두어, 머리글의 짧은 선 같은 글자 아닌 그래픽에만 쓴다.

**KRDS가 색 단계를 쓰는 곳** (같은 대응을 유지한다)

| 역할 | 토큰 | 단계 |
|---|---|---|
| 버튼(주) 바탕 / 마우스 올림 / 누름 | `button-primary-fill(-hover/-pressed)` | primary 50 / 60 / 70 |
| 버튼(보조) 바탕·테두리·글자 | `button-secondary-fill`, `-border`, `text-primary` | primary 5 / 50 / 60 |
| 링크 / 마우스 올림 / 방문 | `link-default`, `link-hover`, `link-visited` | primary 50 / 60 / `#5917b8` |
| 포커스 링 | `box-shadow-outline` | primary 50, 0.4rem |
| 탭·사이드 메뉴·페이지 번호·브레드크럼의 마우스 올림 / 선택 면 | `action-secondary-hover/-selected` | secondary 5 |
| 선택 막대·선택 페이지 번호 | `action-secondary-active` | secondary 70 |
| 선택된 메뉴 글자 | `text-secondary` | secondary 80 |
| 표 머리 면 / 머리 아래선 | `surface-secondary-subtler`, `border-secondary-light` | secondary 5 / 10 |
| 강조 글자 | `text-point` | point 60 |

탐색 계열(탭·사이드 메뉴·페이지 번호)이 GNU Grey 단계로, 동작 계열(버튼·링크·포커스)이 GNU Blue 단계로 바뀐다. 두 색 모두 대학 공식 전용색(BS13)이다.

## 2. 글자

| 토큰 | PC | 모바일(767px 이하) | 쓰임 |
|---|---|---|---|
| heading-xlarge | 40px | 28px | 페이지 제목 `h1` |
| heading-large | 32px | 24px | `h2` |
| heading-medium | 24px | 22px | `h3`, 사이드 메뉴 제목 |
| heading-small | 19px | 19px | `h4`, 주 메뉴 |
| body-large / medium / small / xsmall | 19 / 17 / 15 / 13px | 같음 | 본문은 17px |
| line-height | 1.5 | | 전 요소 기본 |

- 서체: Pretendard GOV 400·500·700 (KRDS 기본). `assets/fonts`에 저자 배포 subset을 그대로 넣었고, 없는 글자는 Noto Sans KR로 보인다. `"font": "gnu"`이면 Noto Sans KR(대학 홈페이지 본문 서체)을 쓴다.
- 루트 글자 크기 62.5%(1rem = 10px). 사용자가 브라우저 글자 크기를 키우면 함께 커진다.
- `word-break: keep-all`로 한글은 단어 단위로 줄바꿈한다.

## 3. 간격·크기

| 항목 | PC | 모바일 |
|---|---|---|
| 본문 폭 / 좌우 여백 | 1200px / 24px (감싸는 폭 1248px) | 화면 폭 / 16px |
| 머리글 → 브레드크럼 | 24px | 16px |
| 브레드크럼 → h1 | 40px | 32px |
| h1 → h2 | 48px | 32px |
| h2 → h2 | 80px | 40px |
| h2 → h3 / h3 → h3 | 40px / 64px | 24px / 32px |
| 제목 → 본문 | 20px | 12px |
| 문단 → 문단 | 16px | 12px |
| 사이드 메뉴 ↔ 본문 | 64px (사이드 메뉴 폭 280px) | 숨김 |
| 본문 ↔ ‘이 페이지의 구성’ | 40px (폭 160px) | 제목 아래로 이동 |
| 본문 → 바닥글 | 64px | 40px |
| 반경 | 버튼 대 8px, 중·소 6px, 상자 8px | |
| 높이 | 버튼 대 56px · 중 48px · 소 40px, 주 메뉴 56px | 같음 |
| 분기점 | 1280px · 1024px · 768px | |

## 4. 페이지 구성과 클래스

```text
#krds-skip-link                          본문 바로가기 (초점 받을 때만 보임)
#krds-header
  .header-utility .utility-list          작은 외부 링크(예: 경상국립대학교 ↗)
  .header-branding                       운영 주체 글자 표시 .site-identity  |  .btn-navi.all(전체메뉴, 1023px 이하)
  .krds-main-menu .gnb-menu              1단 메뉴, 선택은 아래 4px secondary-70 막대
  #mobile-nav.krds-mobile-nav            전체메뉴 펼침 (aria-expanded, Esc로 닫힘)
#container .inner .layout
  .krds-side-navigation (선택)           .lnb-tit + .lnb-list, 현재 페이지 aria-current="page"
  main#contents
    .krds-breadcrumb-wrap .breadcrumb    홈 > … > 현재 (현재 항목 aria-current="page")
    h1.page-title                        실제 페이지 이름
    .krds-in-page-navigation-type        ‘이 페이지의 구성’ (섹션 2개 이상일 때)
    section.sec > h2.sec-tit             본문 섹션 (aria-labelledby)
      .krds-info-list / .krds-table-wrap .tbl / .btn-wrap .krds-btn
#krds-footer
  .foot-quick (선택)                     관련 누리집
  .f-name .f-info .f-link .f-btm(.f-menu .f-copy) .krds-identifier
```

키트의 컴포넌트 HTML과 같은 클래스 이름을 쓰므로, 나중에 공식 CSS·스크립트를 붙여도 구조를 다시 짜지 않아도 된다.

## 5. 접근성 (KRDS·KWCAG 2.2)

- 본문 바로가기 → `main#contents`(tabindex -1)로 이동.
- 포커스: 흰 0.2rem 외곽선 + primary-50 0.4rem 그림자. 모든 링크·버튼에 보인다.
- 현재 위치: 브레드크럼·사이드 메뉴는 `aria-current="page"`, 같은 페이지 안 메뉴는 스크롤 위치에 따라 `aria-current="location"`.
- 표: `caption`(KRDS는 시각적으로 숨김), `th scope`, 넓은 표는 표 영역만 가로 스크롤(`role="region"`, 키보드 초점 가능).
- 새 창 링크는 `title="새 창 열림"`과 아이콘을 함께 둔다.
- 대비 4.5:1(본문), 3:1(큰 글자·UI). 320px 폭과 200% 확대에서 가로 스크롤 없음. 고대비 모드(forced-colors)에서도 선택 표시가 밑줄로 남는다.
- 인쇄·PDF: 메뉴·전체메뉴 버튼·사이드 메뉴·‘이 페이지의 구성’을 빼고 제목·본문·표·바닥글 순서로 남긴다.

## 6. 쓰지 않는 것

- **공식 배너(masthead)** “이 누리집은 대한민국 공식 전자정부 누리집입니다.”와 정부 상징·KRDS 로고. 대학 페이지는 정부 누리집이 아니다.
- 키트 머리글 예시의 통합검색·로그인·회원가입·‘나의 GOV’, 글자 크기 조절, 언어 선택. 실제 기능이 있을 때만 넣는다.
- 학교 로고(기본). 필요하면 JSON `"logo": true`로 홈페이지 헤더 원본 `assets/official/gnu-web-logo.png`를 쓴다.
- 기관 식별자(identifier)의 로고 칸. 이 템플릿은 글자만 쓴다: “이 누리집은 [운영 주체] 누리집입니다.”
- 동작하지 않는 버튼·빈 링크. 빌더는 주소 없는 버튼과 `javascript:` 같은 링크를 뺀다.

## 7. 공식 키트를 쓰는 프로젝트에서

```html
<link rel="stylesheet" href="node_modules/krds-uiux/resources/css/common/common.css">   <!-- 토큰 포함 -->
<link rel="stylesheet" href="node_modules/krds-uiux/resources/css/component/component.css">
<link rel="stylesheet" href="assets/krds/krds-gnu-tokens.css">                          <!-- 반드시 마지막 -->
```

`krds-gnu-tokens.css`는 primary·secondary·point 기본 단계만 덮어쓴다. 키트의 의미 토큰이 이 단계를 참조하므로 버튼·탭·표 등 전체가 GNU 색으로 바뀐다(키트 화면으로 확인함). 고대비 모드(`data-krds-mode=high-contrast`)와 다크 모드의 색은 바꾸지 않았다.

## 8. 권리

KRDS 키트는 KRDS 이용약관을 따른다([저작권 안내](https://www.krds.go.kr/html/site/utility/utility_06.html)). 이 폴더에는 키트의 CSS·이미지를 복사하지 않았고 토큰 값과 클래스 이름만 따랐다. Pretendard GOV는 SIL OFL 1.1(저작권 Kil Hyung-jin)이며 라이선스 원문은 `assets/fonts/OFL-PretendardGOV.txt`에 있다.
