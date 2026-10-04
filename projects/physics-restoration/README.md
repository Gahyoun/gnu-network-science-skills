# 물리의 이해 — 동문 복원

정기수 교수님의 [물리의 이해](http://physica.gnu.ac.kr/) 중 **양자통계 3쪽·양자통계의 응용 5쪽**을 현대 브라우저에서 읽고 조작할 수 있도록 복원한 동문 프로젝트다. 원본의 순서와 물리 모형을 따르며, 설명·질문·그림·프로그램은 독립적으로 작성했다.

경상국립대 홈페이지형 레이아웃과 이 저장소의 [GNU template](../../templates/gnu-template/SKILL.md)을 적용했다. 대학 공식 서비스가 아니며 원저자의 감수·승인을 받은 것으로 표시하지 않는다.

## 읽기와 실행

Node.js 22 이상과 Python 3가 있으면 별도 npm 설치 없이 빌드할 수 있다.

```sh
cd projects/physics-restoration
node tools/build.mjs
node --test tools/physics.test.mjs
python3 -m http.server 8774 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8774/`를 연다. 파일을 더블클릭하는 `file://` 방식은 브라우저의 ES module 보안 제약으로 실험이 실행되지 않을 수 있다. 로컬 서버를 실행한 후에는 인터넷 연결이 필요 없다.

## 교재 탐색

- `index.html`: 원본 7개 대단원·149개 주제·566쪽의 목차. 전체 전개/감추기와 페이지별 연결.
- `lesson.html?id=...`: 아직 복원하지 않은 쪽의 제목·위치·같은 주제의 다른 쪽·원본 링크. 복원된 8쪽은 실제 복원본으로 연결.
- `materials.html`: 원본 자료종류별 목록 1,072개. 시뮬레이션을 기본으로 가나다순 정렬하고, 복원 인터랙션 17개는 정확한 실험 위치로 연결.
- `search.html`: 전체 목차·표제어·자료 제목 및 복원 본문 내부검색. URL의 검색어를 공유할 수 있음.
- `headwords.html`, `browse.html`: 원본 표제어 1,866개와 혼합 색인 2,455개. 목록 내 검색·유형·복원 여부 필터 및 50개씩 표시.
- `about.html`: 정기수 교수님 소개, 복원 기록, 화면 설정 및 출처.

상단 라이트/다크 버튼은 `localStorage`에 선택을 저장한다. 첫 방문은 시스템 테마를 따르며 수식·그래프도 바뀐다. 인쇄는 밝은 바탕이다. 웹·태블릿·모바일을 지원하며 좁은 화면에서는 목차가 버튼 안으로 접힌다.

## 구현

- **정적 프런트엔드:** 생성된 HTML, CSS, SVG, ES modules만 필요하다. API·DB·로그인·운영 서버는 없다.
- **빌드 단계:** 교재 수식 46개와 목록에 포함된 수식 11개를 KaTeX 0.19.0으로 컴파일한다. HTML과 MathML을 함께 생성하고 잘못된 LaTeX는 빌드 오류로 처리한다.
- **목록:** 제목·출처·카테고리 메타데이터를 정적 HTML로 생성하므로 JavaScript 없이도 목록을 읽을 수 있다. 검색 데이터는 검색/준비 안내 화면에서만 읽는다. 검색어는 `textContent`로 처리한다. 원본 본문·프로그램은 목록에 포함하지 않는다.
- **브라우저:** 해당 쪽에 있는 실험만 초기화한다. 애니메이션은 사용자가 재생하며 초당 최대 20회 갱신하고, 화면 밖·숨겨진 탭에서는 멈춘다. 데바이 곡선의 반복 적분값을 캐시한다.
- **자산:** 서체·수식 글꼴을 포함한다. 두 본문 서체는 사용 글자만 포함해 1,633,140→218,596 bytes로 86.6% 줄였다. OFL에 따라 수정 서체의 내부 이름은 PhysicaText·PhysicaTitle로 바꿨다. 외부 CDN·Adobe·CreateJS에 의존하지 않는다.
- **접근성:** 한국어 문서, 건너뛰기 링크, MathML, 키보드 슬라이더, 포커스 표시, 그래프 결과 텍스트, 색과 선 모양의 구분, 인쇄 CSS를 제공한다. 수식은 JavaScript 없이 읽을 수 있다.
- **배포:** `node tools/stage.mjs`가 HTML·런타임·서체·라이선스·기록만 `_site/`에 모은다. 빌드용 KaTeX JS와 원본 조사자료는 배포되지 않는다.

글을 추가할 때 새 한글이 포함되지 않은 서체로 빌드되는 것을 검사한다. 새 글자가 있다면 `python3 -m pip install fonttools brotli` 후 `python3 tools/subset-fonts.py`를 실행하고 다시 빌드한다. 원본 서체는 저장소의 `templates/gnu-template/assets/fonts`에서 읽는다. 일반 빌드에는 이 Python 패키지가 필요 없다.

## GitHub Pages

저장소의 `Restore physics textbook` workflow는 PR에서 빌드·수치 검증만 한다. 실제 게시하려면 PR 병합 후 **Settings → Pages → Source: GitHub Actions**를 선택하고, **Actions → Restore physics textbook → Run workflow → publish: true**로 실행한다. 배포는 수동 실행에서만 이루어진다.

이 workflow는 이 웹교재를 해당 저장소 Pages의 루트에 게시한다. 다른 Pages 사이트를 같은 저장소에서 운영할 때에는 독립 저장소로 옮기거나 배포 경로를 합쳐야 한다.

## 검증과 기록

`tools/physics.test.mjs`는 통계 극한·미시상태 수·흑체복사 적분·비열 극한·정상파·전자 입자수·압력 평형을 검증한다. `tools/browser-check.mjs`는 Playwright가 설치된 환경에서 15페이지, 320/768/1024/1360px, 슬라이더 경계값, 선택 메뉴, 재생·정지, 키보드, 200% 확대와 JavaScript 비활성 상태를 검사한다. 전체 전개·감추기, 검색·목록 필터·페이지 이동, 테마 저장·인쇄 전환, 태블릿 세로/가로와 터치 조작도 확인한다.

```sh
# 별도 개발 환경에 Playwright와 Chromium이 설치되어 있을 때
PHYSICA_BASE_URL=http://127.0.0.1:8774/ node tools/browser-check.mjs
```

검증 결과는 [빌드 기록](docs/build-report.json)과 [브라우저 기록](docs/browser-report.json), 복원 근거는 [reconstruction.md](docs/reconstruction.md), 원본 파일의 주소·SHA-256은 [source-manifest.json](docs/source-manifest.json)에 남긴다.

## 저작물 구분

원저자의 HTML·SWF·교재 사진·본문 그림·Canvas JS·추출 ActionScript는 저장소에 포함하지 않는다. 요청에 따라 제공받은 로고의 색상만 조정한 상단 로고를 포함한다. 로고 편집 근거와 프롬프트는 [logo-edit.md](docs/logo-edit.md)에 기록했다. 원본의 [저작권 안내](http://physica.gnu.ac.kr/info/info_cont.html#copyright)를 존중하며, 원본 문장과 자산을 그대로 공개하는 단계는 허락을 받은 뒤 별도로 진행한다. 현재 공개 코드는 해당 원본의 이용 허락을 뜻하지 않는다.

독립적으로 작성한 코드는 저장소의 GPL-3.0을 따르며, KaTeX는 동봉한 MIT 라이선스, Noto Sans KR·SUITE와 KaTeX 글꼴은 각각의 동봉 라이선스를 따른다.
