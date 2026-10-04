# 확인 근거와 적용값

이 기록은 대학 공식 가이드를 대신하지 않는다. 값을 다시 확인할 때 아래 파일과 페이지를 기준으로 한다.

## 확인 시점

- 2026-10-04 1차: 대학 홈페이지·VI 페이지·CSS·KRDS 사이트를 직접 열람하고 VI 원본을 내려받았다(macOS).
- 2026-10-04 2차: 클라우드 환경에서 학교 사이트와 KRDS 사이트에 접속할 수 없었다. 1차에서 받은 원본 파일(SHA-256 일치)과 사용자 제공 자료만으로 작업했다. 캐릭터 페이지는 열람하지 못했고 `--fetch-character`는 가짜 HTML로 구문 분석만 시험했다.

## KRDS

[KRDS](https://www.krds.go.kr/html/site/index.html)와 [토큰 CSS](https://www.krds.go.kr/resources/css/token/krds_tokens.css)(1차 열람).

- 기본 서체 Pretendard GOV, 본문 medium 토큰 1.7rem(루트 10px 기준 17px), PC heading xlarge 4rem.
- `--krds-color-light-primary-50: #256ef4`, `--krds-color-light-gray-90: #1e2124`. 대학 색이 아니므로 결과물에 쓰지 않는다.
- 웹 구성에 가져온 것: 건너뛰기 링크, 머리글의 기관 식별·주 메뉴, 브레드크럼, 탭, 표, 바닥글의 기관 정보, 포커스·대비·확대·반응형 기준.
- 가져오지 않은 것: 공식 전자정부 누리집 배너, 정부 상징, 전체 컴포넌트 라이브러리. 대학 페이지는 정부 누리집이 아니다.

## 대학 VI (공식)

[기본요소](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?cntntsId=1198&mi=1369)의 BS13 전용색상, BS16·BS17 지정서체, BS08 시그니처, BS14 색상활용, BS21 모티프C, BS23 모티프E-교화.

- 국문 지정서체 Noto Sans KR, 영문 SUIT.
- 전용색 GNU Blue `#009EDB`, GNU Grey `#43525A`, Silver `#BCBEC0`, Gold `#B3A177`(DESIGN.md 3장).
- BS08: “크기와 글자의 꼴, 굵기, 비례, 자간, 간격 등의 임의변경은 불가”.
- BS14: 견본에 없는 색상 적용은 관리부서와 협의.
- BS23 응용형: GNU 글자가 사각 테두리 윗선에 걸린 프레임 안에 장미·철쭉을 둔 도안. 발표·포스터 표지의 테두리-심벌 연결은 이 구성을 참고했다.
- [슬로건 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=17993&cntntsId=8192)의 FLY WITH GNU는 별도 BI. 로고타이프 색 `#024B8F` 계열(관찰: 서식 PDF).
- [응용요소 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=1370&cntntsId=1199)의 안내문 서식: A3 가로, 왼쪽 위 테두리 틈의 FLY WITH GNU, 테두리·하단 띠 그라데이션 `#0099D9 → #004F93`(PDF 색 관리 후 RGB, 관찰), 하단 오른쪽 흰색 엠블럼 국영문 조합.

## 로고 출력 사본

`scripts/derive_svg.py`가 `pdftocairo -svg`로 원본 PDF를 벡터 변환한 뒤, 지정 영역 안에 완전히 들어가는 도형만 남긴다. 견본의 안내 문구·다른 변형·작도선(채움 없는 선)은 빠진다. 경로 좌표는 바꾸지 않는다.

PDF 색 관리를 거친 화면색(청색 약 0,152,216 / 회색 약 72,81,87)은 BS13에 공개된 RGB(0,158,219 / 67,82,90)로 되돌렸다. 서식에서 가져온 FLY WITH GNU와 흰색 엠블럼 조합은 색을 그대로 두었다.

심벌 비례(측정): BS08 국영문 시그니처 높이를 1로 할 때 심벌 윗변은 0.035–0.128(두께 0.093). 테두리 연결 계산에 쓴다.

## 대학 홈페이지 CSS (관찰, 1차 열람)

| 파일·선택자 | 관찰 | 적용 |
|---|---|---|
| `basic.css` `body` | NotoSans 별칭, 0.8rem, `#222` | 글자색 채택, 본문 17px는 KRDS 참고 제안 |
| `basic.css` `html` | 20px | rem 환산 기준 |
| `layout.css` `.container` | 1565px | 참고. 소형 페이지는 1200px 제안 |
| `layout.css` `#gnb .depth01 > ul > li > a` | SUITE, 1.1rem, 700 | 주 메뉴 SUITE 700 18px |
| `layout.css` `.title_area .pageTitle` | SUITE, 1.65rem, 800 | 페이지 제목 33px |
| `con_com.css` `.tab_st1` | 직사각형 테두리 탭, 청색 그라데이션 | 형태 채택, 선택 탭은 대비 확보 단색 |
| `con_com.css` 표 | 윗선 3px, 회색 행 구분선 | 채택 |

근거 파일: `https://www.gnu.ac.kr/css/web/main/{basic,layout,con_com}.css`, 폰트 선언 `https://www.gnu.ac.kr/font/NotoSansKR/fonts.css`, `https://www.gnu.ac.kr/font/SUITE/SUITE-Variable.css`. 선언값이며 모든 환경의 계산값을 잰 것은 아니다.

## 캐릭터

[대학 캐릭터(지누)](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12102&cntntsId=5777), [캐릭터 응용 디자인](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12104&cntntsId=5779) 등. 검색 결과 기준으로 기본형·조합형(2D·3D)·감정표현·방향·단과대학 응용 도안을 AI 형식으로 제공한다. 지누는 진주의 마이크로랍터 발자국 화석에서 따온 공룡, 누누는 지누 머리 위의 아기 공룡이다(대학 보도 기준). 이용 조건은 페이지에서 직접 확인해야 하며, DESIGN.md 6장의 배치·금지 규칙은 이 도구의 제안이다.

## 사용자 참고 자료

- 학과 안내 이미지 3장: 청색 제목 띠(일시·장소 / 세미나 이름 / 제목 / 오른쪽 정렬 연사), 양쪽 정렬 초록, 참고문헌, 문의, 하단 FLY WITH GNU·시그니처+학과명, 오른쪽 아래 지누. A4 세미나·홍보문 구성에 반영했다. 강조색으로 쓰인 주황은 학과 개별 선택으로 보고 기본 토큰에 넣지 않았다.
- 발표 표지 이미지: 청색 테두리 윗선에 GNU 심벌, 발표자 이름 청색, 오른쪽 아래 QR·연락처. 발표 표지와 포스터 제목 상자에 반영했다.
- A0 포스터 PPTX(841×1189mm): 상단 시그니처, 2단 본문, 청색 `#019DDA` 계열 강조. 구조만 참고했고 연구 내용·이름·그림·QR은 배포물에 넣지 않았다.

## 이 도구의 제안값

UI 대비 색(`#007EAE`, `#0069B4` 등), 웹 1200px 폭과 간격, A4·A0·16:9의 여백·글자 크기·단 수, 캐릭터 크기·위치, 웹 섹션 제목의 왼쪽 청색 막대. 학교나 KRDS가 정한 값이 아니다.
