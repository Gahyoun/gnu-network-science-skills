---
name: gnu-template
description: 경상국립대학교 학교테마로 A4 세로·가로 홍보문과 세미나 안내문, 학술포스터, HTML 프레젠테이션, 간단한 웹페이지를 제작한다. GNU 테마·학교테마 요청이나 제공된 HTML 템플릿 수정에 사용하며 기본 결과는 HTML·PDF·PNG다.
---

# GNU template

이 폴더의 `DESIGN.md`를 읽고 사용자의 콘텐츠와 매체에 적용한다. 표준 Markdown·HTML·CSS·JSON으로 구성된 스킬이며 특정 AI 제품의 API나 전용 도구에 의존하지 않는다. 설치·호출 방법은 호스트에 따라 다르다.

## 작업 흐름

1. 사용자 요청에서 홍보문, 세미나 안내, 연구 포스터, 발표자료, 웹페이지를 고른다. A4는 방향이 없으면 세로 210 × 297mm, 가로 요청이면 297 × 210mm로 구성한다. 크기·내용이 충분하면 바로 작업한다. 미정인 필수 정보는 확인하고, 예시 파일의 대괄호 항목을 실제 사실로 채우기 전 외부 공개하지 않는다.
2. `examples/flyer.html`, `seminar.html`, `seminar-landscape.html`, `poster.html`, `slides.html`, `web.html` 중 가장 가까운 파일을 복사해서 편집한다. 가로 세미나에는 `seminar-landscape.html`을 선택하며 JSON 빌더의 `flyer`·`seminar`에는 `--orientation landscape`를 사용할 수 있다. A4 홍보문·세미나 안내의 세로·가로형에는 공식 FLY WITH G.N.U 도안과 학교 로고를 하단에 배치한다. 웹 제작은 먼저 `references/web-reference.md`를 읽고 대학 VI 하위 페이지의 흰 헤더, 짙은 현재 위치 띠, 좌측 제목, 넓은 직사각형 하위 메뉴, 항목명·본문 행 구성을 적용한다. 웹 기본형에는 사진을 넣지 않는다. 실제 원문 콘텐츠만 사용한다. 디자인을 새로 생성하기보다 서체·청색 구분·정렬·표·여백의 연속성을 유지한다.
3. 후크 메시지, 말풍선, 장식 버블, 둥근 카드 반복을 추가하지 않는다. 지누와 다른 캐릭터는 사용하지 않는다. 연구 결론·수치·소속·연락처를 만들어 넣지 않는다.
4. 학교 로고·공식 그래픽 모티프가 필요하면 `assets/catalog.md`와 `references/brand-variants.md`에서 도안을 선택한다. `assets/official/`의 원본 비례·색상·조합을 유지한다. A4 기본 FLY WITH G.N.U 도안은 `assets/derived/fly-with-gnu.svg`를 사용한다. 사용자가 장식을 요청하면 실제 제공되었거나 패키지에 있는 승인된 학교 이미지·공식 모티프를 필요한 여백에만 배치할 수 있다. A4 JSON의 `decoration_image`와 `decoration_alt`를 사용하거나 HTML을 직접 편집한다. 여백을 모두 채우거나 연구 그림을 밀어내지 않는다. 새로운 로고를 그리거나 CSS 필터로 변형하지 않는다.
5. 기본 결과는 수정 가능한 `.html`, 같은 내용을 담은 `.pdf`, `.png`다. 프레젠테이션은 하나의 다쪽 PDF와 슬라이드별 PNG로 저장한다. 웹페이지는 전체 화면 PNG와 읽기용 PDF를 함께 저장한다. PNG는 미리보기 기본값이며 인쇄용 고해상도가 필요하면 실제 규격·해상도를 별도로 정한다.
6. 먼저 HTML을 확인하고 export한다. `node scripts/export.mjs input.html output-dir`를 사용할 수 있다. 실행 도구가 없으면 호스트의 로컬 브라우저·PDF 도구를 이용한다. `python3 scripts/assets.py`로 공식 원본 해시를 확인할 수 있다. 내보내기에 실패했다면 HTML을 보존하고 실패한 형식과 이유를 명확히 알린다. 존재하지 않는 파일을 완성했다고 주장하지 않는다.
7. 본문 넘침·잘림·폰트·로고·이미지, PDF 페이지 수·규격, PNG를 확인한다. 웹은 좁은 화면·키보드·색대비를 추가로 확인한다.

## 자료

- `DESIGN.md`: 다른 AI에도 첨부할 수 있는 독립 디자인 프롬프트.
- `README.md`: 어떻게 사용하는지, 설치·요청문·내보내기.
- `references/prompts.md`: 매체별 복사 가능한 요청문.
- `references/web-reference.md`: 대학 VI 하위 페이지를 기준으로 한 웹 구성·반응형 적용 지침.
- `references/source-notes.md`: 공식 규정·웹 관찰값·자체 제안의 구분.
- `references/brand-variants.md`: 색상활용·모티프C·장미·철쭉 도안의 적용.
- `references/asset-usage.md`: 로고·AI 원본의 선택과 출력.
- `assets/theme.css`: 재사용 가능한 스타일. 학교 공식 CSS 전체를 복제한 파일이 아니다.
- `assets/manifest.json`: 공식 자산의 출처·다운로드 주소·SHA-256.
- `data/*.json`, `scripts/build.py`: 내용만 바꾸어 독립 HTML을 만드는 선택 도구.
- `scripts/export.mjs`: 로컬 Chromium을 이용한 HTML·PDF·PNG 출력.

폰트 파일과 첨부된 개인 연구자료는 배포하지 않는다. 폰트가 없으면 사용 가능한 한글 산세리프로 대체하고 대체 사실을 설명한다. 로고·교화·모티프에 대한 권리는 원 권리자에게 있으며 이 스킬의 라이선스가 자산 이용조건을 변경하지 않는다. 기존 프로젝트·도구·사용자 조건을 유지하고 사용자 요청 범위에서 작업한다.
