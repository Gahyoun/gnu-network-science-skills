# 확인 근거와 적용값

이 기록은 대학 공식 가이드를 대신하지 않는다. 값을 다시 확인할 때 아래 파일과 페이지를 기준으로 한다.

## 확인 시점

- 2026-10-04 1차: 대학 홈페이지·VI 페이지·CSS·KRDS 사이트를 직접 열람하고 VI 원본을 내려받았다(macOS).
- 2026-10-04 2차: 클라우드 환경에서 학교 사이트와 KRDS 사이트에 접속할 수 없었다. 1차에서 받은 원본 파일(SHA-256 일치)과 사용자 제공 자료만으로 작업했다. 캐릭터 페이지는 열람하지 못했고 `--fetch-character`는 가짜 HTML로 구문 분석만 시험했다.
- 2026-10-28 3차: 학교·KRDS 누리집은 계속 접속할 수 없었다. KRDS 공식 GitHub 키트 [KRDS-uiux/krds-uiux](https://github.com/KRDS-uiux/krds-uiux) v1.1.0을 받아 토큰·컴포넌트 HTML·CSS를 읽고, 키트 CSS로 그린 화면에서 계산된 스타일을 쟀다. 웹 기본형을 KRDS 구성으로 바꿨다. 캐릭터(지누)는 원본을 받을 수 없어 사용자 결정으로 지원에서 뺐다.

## KRDS

1차: [KRDS 누리집](https://www.krds.go.kr/html/site/index.html) 열람. 3차: GitHub 키트 v1.1.0(`krds_tokens.css` 2024-12-09 생성본)으로 값 확인.

- 기본 서체 Pretendard GOV, 루트 62.5%, 본문 body-medium 1.7rem, 행간 1.5, h1 heading-xlarge 4rem(모바일 2.8rem).
- 콘텐츠 폭 1200px, 좌우 24px, 감싸는 폭 1248px. 분기점 1280·1024·768px(`@media (max-width: 767px)` 등).
- 색 단계 번호는 흰 바탕 대비를 뜻한다: primary-50 `#256ef4` 4.55:1, 60 `#0b50d0` 6.84:1. 이 구조를 유지하고 값만 GNU 색에서 계산했다(`references/krds.md` 1장, `scripts/gnu_palette.py`).
- 역할 대응: 버튼·링크·포커스·입력은 primary, 탭·사이드 메뉴·페이지 번호·브레드크럼 상태는 secondary, 강조는 point.
- 측정(키트 CSS, 1440px 화면): 주 메뉴 높이 56px·19px 굵게·선택 막대; 사이드 메뉴 폭 280px, 제목 24px; 표 머리 15px 굵게·secondary-5 면, 칸 17px·여백 12×16px; 버튼 56/48/40px·반경 8/6/6px; 페이지 번호 40×40px; 바닥글 gray-5 면, 식별자 흰 상자.
- 가져오지 않은 것: 공식 전자정부 누리집 배너(masthead), 정부·KRDS 로고, 통합검색·로그인 예시, 키트 CSS·이미지 파일 자체. 대학 페이지는 정부 누리집이 아니다.
- KRDS 키트는 KRDS 이용약관을 따른다. 이 패키지는 값과 클래스 이름만 따랐다.

## 대학 VI (공식)

[기본요소](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?cntntsId=1198&mi=1369)의 BS13 전용색상, BS16·BS17 지정서체, BS08 시그니처, BS14 색상활용, BS21 모티프C, BS23 모티프E-교화.

- 국문 지정서체 Noto Sans KR, 영문 SUIT.
- 전용색 GNU Blue `#009EDB`, GNU Grey `#43525A`, Silver `#BCBEC0`, Gold `#B3A177`(DESIGN.md 3장).
- BS08: “크기와 글자의 꼴, 굵기, 비례, 자간, 간격 등의 임의변경은 불가”.
- BS14: 견본에 없는 색상 적용은 관리부서와 협의.
- BS23 응용형: GNU 글자가 사각 테두리 윗선에 걸린 프레임 안에 장미·철쭉을 둔 도안. 발표·포스터 표지의 테두리-심벌 연결은 이 구성을 참고했다.
- [슬로건 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=17993&cntntsId=8192)의 FLY WITH G.N.U는 별도 BI. 사용자 요청에 따라 A4 홍보문·세미나(세로·가로) 하단에 기본으로 넣고, 포스터·슬라이드·웹에는 자동으로 넣지 않는다. 출력 사본은 슬로건 BI 가이드 AI(`design system guidelines_fly with gnu_3.ai`)의 흰 바탕용 청색 로고타입이다.
- [응용요소 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=1370&cntntsId=1199)의 안내문 서식: A3 가로, 왼쪽 위 테두리 틈의 FLY WITH GNU, 테두리·하단 띠 그라데이션 `#0099D9 → #004F93`(PDF 색 관리 후 RGB, 관찰), 하단 오른쪽 흰색 엠블럼 국영문 조합.

## 웹 참고 화면 (main 브랜치 작업, 2026-10-04)

사용자가 추가로 제공한 VI 하위 페이지 화면을 웹 기본형으로 지정했다(`web-reference.md`). 공식 페이지 HTML의 `sub_visual6`와 `layout.css`에서 배경 사진 사용을 확인했지만, 사용자의 후속 요청에 따라 기본형에서 사진을 뺐다. 흰 헤더, 짙은 현재 위치 띠, 왼쪽 큰 제목, 넓은 직사각형 하위 메뉴, 항목명·본문 행을 적용했다. 헤더 원본 `/images/web/main/layout/logo.png`를 `assets/official/gnu-web-logo.png`로 수록했고 출처·해시는 manifest.json에 있다. 모바일 접힘 메뉴와 대비를 보완한 선택 메뉴 색은 이 도구의 제안이다. 첨부 스크린샷은 배포하지 않았다.

## 로고 출력 사본

`scripts/derive_svg.py`가 `pdftocairo -svg`로 원본 PDF를 벡터 변환한 뒤, 지정 영역 안에 완전히 들어가는 도형만 남긴다. 견본의 안내 문구·다른 변형·작도선(채움 없는 선)은 빠진다. 경로 좌표는 바꾸지 않는다.

PDF 색 관리를 거친 화면색(청색 약 0,152,216 / 회색 약 72,81,87)은 BS13에 공개된 RGB(0,158,219 / 67,82,90)로 되돌렸다. FLY WITH G.N.U(공개 RGB 값 없음)와 흰색 엠블럼 조합은 변환된 색을 그대로 두었다. 그라데이션으로 칠한 도형(FLY의 skyline)도 도안에 포함한다.

심벌 비례(측정): BS08 국영문 시그니처 높이를 1로 할 때 심벌 윗변은 0.035–0.128(두께 0.093). 테두리 연결 계산에 쓴다.

## 대학 홈페이지 CSS (관찰, 1차 열람)

| 파일·선택자 | 관찰 | 적용 |
|---|---|---|
| `basic.css` `body` | NotoSans 별칭, 0.8rem, `#222` | 인쇄물 글자색. 웹은 KRDS gray-90 `#1e2124` |
| `basic.css` `html` | 20px | rem 환산 기준 |
| `layout.css` `.container` | 1565px | 참고만. 웹은 KRDS 1200px |
| `layout.css` `#gnb .depth01 > ul > li > a` | SUITE, 1.1rem, 700 | 웹 `"font": "gnu"`일 때 메뉴·제목에 SUITE |
| `layout.css` `.title_area .pageTitle` | SUITE, 1.65rem, 800 | 참고만. 웹 제목은 KRDS 40px |
| `con_com.css` `.tab_st1` | 직사각형 테두리 탭, 청색 그라데이션 | 참고만. 웹은 KRDS 탭·메뉴 |
| `con_com.css` 표 | 윗선 3px, 회색 행 구분선 | 참고만. 웹은 KRDS 표 |

근거 파일: `https://www.gnu.ac.kr/css/web/main/{basic,layout,con_com}.css`, 폰트 선언 `https://www.gnu.ac.kr/font/NotoSansKR/fonts.css`, `https://www.gnu.ac.kr/font/SUITE/SUITE-Variable.css`. 선언값이며 모든 환경의 계산값을 잰 것은 아니다.

## 사용자 참고 자료

- 학과 안내 이미지 3장: 청색 제목 띠(일시·장소 / 세미나 이름 / 제목 / 오른쪽 정렬 연사), 양쪽 정렬 초록, 참고문헌, 문의, 하단 FLY WITH GNU·시그니처+학과명, 오른쪽 아래 캐릭터(이 템플릿에서는 넣지 않음). A4 세미나·홍보문 구성에 반영했다. 강조색으로 쓰인 주황은 학과 개별 선택으로 보고 기본 토큰에 넣지 않았다.
- 발표 표지 이미지: 청색 테두리 윗선에 GNU 심벌, 발표자 이름 청색, 오른쪽 아래 QR·연락처. 발표 표지와 포스터 제목 상자에 반영했다.
- A0 포스터 PPTX(841×1189mm): 상단 시그니처, 2단 본문, 청색 `#019DDA` 계열 강조. 구조만 참고했고 연구 내용·이름·그림·QR은 배포물에 넣지 않았다.

## 이 도구의 제안값

인쇄물의 UI 대비 색(`#007EAE`, `#0069B4` 등), A4·A0·16:9의 여백·글자 크기·단 수, 웹의 GNU 색 단계 값(KRDS 단계 명도에 맞춘 계산값), 로고 대신 쓰는 글자 표시와 짧은 GNU Blue 선. 학교나 KRDS가 정한 값이 아니다.
