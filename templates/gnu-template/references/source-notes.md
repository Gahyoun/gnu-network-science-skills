# 확인 근거와 적용값

확인일: 2026-10-04. 이 기록은 대학 공식 가이드의 대체 문서가 아니다. 문서·사이트를 다시 확인할 때 아래 파일과 페이지를 기준으로 한다.

## KRDS

[공식 사이트](https://www.krds.go.kr/html/site/index.html)와 [토큰 CSS](https://www.krds.go.kr/resources/css/token/krds_tokens.css)를 확인했다. 사이트의 기본 서체는 Pretendard GOV이고, 본문 medium 토큰은 1.7rem, PC heading xlarge는 4rem이다. 이 패키지는 전체 KRDS 토큰이나 컴포넌트 라이브러리를 복제하지 않는다. 기능별 상세 동작이 필요하면 KRDS의 해당 컴포넌트 가이드를 확인한다.

참고값: `--krds-color-light-primary-50: #256ef4`, `--krds-color-light-gray-90: #1e2124`. 이들은 GNU 공식 브랜드색이 아니다.

## GNU 공식 VI

[기본요소 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?cntntsId=1198&mi=1369)의 BS13 색상, BS16 국문 지정서체, BS17 영문 지정서체 견본을 확인했다.

- 국문 지정서체는 Noto Sans KR, 영문은 SUIT다.
- 전용색상은 GNU Blue / Grey와 금·은 보조 색상이다. 숫자는 DESIGN.md의 공식색 표에 한 번만 정리했다.
- 기본요소 페이지는 로고·모티프의 임의 변경을 제한한다. 출력은 공식 원본 도안을 선택한다.
- 로고의 공식 최소 크기·보호 공간은 선택한 원본의 규정에서 확인한다. 이 도구에서 새 공식 수치를 만들지 않는다.

[슬로건 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=17993&cntntsId=8192)의 FLY WITH G.N.U는 별도 BI다. 사용자의 요청에 따라 A4 홍보문·세미나의 세로·가로형에 공식 청색 도안을 기본으로 넣는다. 대학 로고와 별도 위치에 배치하며 포스터·슬라이드·웹에 자동으로 덧붙이지 않는다. `assets/derived/fly-with-gnu.svg`의 선택 영역과 출력 기록은 `assets/catalog.md`에 있다.

[응용요소 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=1370&cntntsId=1199)의 안내문 서식을 참고 자산으로 수록했다. 이것이 A0 학술포스터의 공식 규격을 정하는 자료는 아니다.

## GNU 웹 CSS 관찰

| 파일·선택자 | 관찰 | 적용 판단 |
|---|---|---|
| `basic.css` / `body` | NotoSans 별칭, 0.8rem, #222 | 글자색은 참고하고 기본 본문은 17px로 제안 |
| `basic.css` / `html` | 20px | 관찰된 rem 값을 px로 해석할 때만 사용 |
| `layout.css` / `.container` | width 1565px, max-width 100% | 웹 기본형에 최대 폭 1565px와 반응형 여백 적용 |
| `layout.css` / `#gnb .depth01 > ul > li > a` | SUITE, 1.1rem, 700 | 메뉴 서체·굵기 참고 |
| `layout.css` / `.title_area .pageTitle` | SUITE, 1.65rem, 800 | 제목 33px 참고 |
| `con_com.css` / `.tab_st1` | 직사각형 테두리 탭, 청색 그라데이션 | 형태 참고, 선택 메뉴는 대비를 보완한 짙은 청색 그라데이션 |
| `con_com.css` / 표 | 상단 3px 선, 회색 행 구분선 | 표 중심의 정보 배치 참고 |

근거: [basic.css](https://www.gnu.ac.kr/css/web/main/basic.css), [layout.css](https://www.gnu.ac.kr/css/web/main/layout.css), [con_com.css](https://www.gnu.ac.kr/css/web/main/con_com.css), [NotoSans 폰트 선언](https://www.gnu.ac.kr/font/NotoSansKR/fonts.css), [SUITE 폰트 선언](https://www.gnu.ac.kr/font/SUITE/SUITE-Variable.css).

CSS 선언을 확인한 값이며 모든 화면·운영체제의 최종 computed style을 측정한 것은 아니다. `SUIT`(VI)와 `SUITE`(웹)를 구분한다. 학교 사이트의 일부 기능·장식은 사용자가 요청한 버블 금지와 접근성 목표에 맞춰 이 도구에서 채택하지 않았다.

## 자체 제안

접근성 보완 UI 색상, 웹 여백·간격·모서리 반경, 포스터의 A0 기본값·단 수·pt 크기·여백·그림 해상도는 이번 도구의 제안이다. 학교나 KRDS가 해당 포스터 수치를 공식 지정했다고 주장하지 않는다. `assets/theme.css`는 위 제안을 구현한 작은 시작점이며 기존 프로젝트에서 범위를 조정해 사용한다.

사용자가 제공한 KRDS 중심 DESIGN.md는 참고 자료였다. 그 안의 마케팅성 서술, 과도한 법적·정책적 단정, 페르소나, 전체 토큰 나열은 이번 제작 지침에 옮기지 않았다. 학교 서체·색상은 대학 공식 자료로 다시 확인했다.

## 사용자 참고 예시

첨부 홍보문·세미나 안내 이미지에서 청색 제목 띠·직사각형 테두리·하단 기관 표기를 참고했다. 첨부 PPTX는 1쪽의 A0 세로(약 841 × 1189mm) 연구 포스터로, 구조와 서체 선언을 읽고 상단·다단 본문 구성을 참고했다. PPTX의 도구 내 렌더링은 일부 수식·텍스트 재현이 달라 원본 화면과 동일하다고 검증하지 않았다. 개인 연구 원문·이름·그림·QR·스크린샷은 배포 패키지에 복사하지 않았다. 공개 예시는 내용 입력용 항목으로 만들었다.

## 최신 웹 참고 화면 적용

사용자가 추가로 제공한 VI 하위 페이지 화면을 웹 모드의 기본 참고로 지정했다. 공식 페이지 HTML의 `sub_visual6`와 layout.css에서 배경 사진 사용을 확인했지만, 사용자의 후속 요청에 따라 새 웹 기본형에서 사진을 제외했다. 흰 헤더 바로 아래에 짙은 현재 위치 행을 두고 큰 왼쪽 제목, 넓은 직사각형 메뉴, 항목명·본문 행을 적용했다. 헤더 원본 `/images/web/main/layout/logo.png`만 웹 참고 자산으로 수록했고 출처·해시는 manifest.json에 기록했다. 로컬 메뉴·모바일 접힘·대비를 보완한 UI 청색은 템플릿의 제안이며 대학 공식 서비스 전체를 복제한 것은 아니다. 첨부 스크린샷은 배포하지 않았다.
