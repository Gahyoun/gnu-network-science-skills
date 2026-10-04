---
name: gnu-template
description: 경상국립대학교 학교테마(로고·GNU Blue·Noto Sans KR/SUIT·학과 안내문 양식·지누 캐릭터)로 A4 세로·가로 홍보문·세미나 안내문, A0 학술포스터, 16:9 HTML 발표자료, 대학 홈페이지형 웹페이지를 만들고 HTML·PDF·PNG로 저장한다. "GNU 테마", "학교테마", "경상국립대 양식", "학과 세미나 포스터", "학회 포스터 학교 로고로", "지누 넣어서" 같은 요청이나 이 폴더의 예시 HTML을 고칠 때 사용한다.
---

# GNU template

`DESIGN.md`가 디자인 기준이다. 작업 전에 읽고, 매체에 해당하는 7장과 2장(쓰지 않는 표현)을 지킨다. 표준 Markdown·HTML·CSS·JSON·Python·Node 파일만 쓰며 특정 AI 제품이나 유료 API에 의존하지 않는다.

## 작업 순서

1. **매체 고르기.** 홍보문(`flyer`), 공식 서식형 안내문(`flyer` + `style: "form"`), 세미나 안내(`seminar`), 학술포스터(`poster`), 발표자료(`slides`), 웹페이지(`web`). A4는 방향 지정이 없으면 세로, ‘가로’면 `--orientation landscape`(297×210mm). 웹은 먼저 `references/web-reference.md`를 읽는다.
2. **사실 확인.** 제목·일시·장소·연사·저자·소속·연락처·연구 내용은 사용자가 준 것만 쓴다. 빠진 항목은 `[입력 항목]`으로 남기고 마지막에 목록으로 알린다. 묻지 않고 지어내지 않는다.
3. **내용 파일 만들기.** `data/<매체>.json`을 복사해 내용을 채운다. 굵게는 `**핵심어**`, 줄바꿈은 `\n`, 문단은 `\n\n`. 실제 그림·QR은 `"src": "경로"`로 넣는다.
4. **빌드.** `python3 scripts/build.py <매체> --data <json> --output out/<이름>.html`. 폰트·로고·그림이 들어간 HTML 한 파일이 생긴다. A4에는 FLY WITH G.N.U가 하단 왼쪽에 기본으로 들어간다(`fly_with_gnu: false`로 끔). 지누는 `--character <PNG·SVG>`(인쇄물만, 규칙: DESIGN.md 6장). 학교 이미지·꽃 모티프 장식은 요청받았을 때만 `decoration_image`.
5. **세부 수정.** 표·수식·그림 배치처럼 JSON으로 안 되는 부분만 생성된 HTML을 직접 고친다. `theme.css`의 클래스와 토큰을 재사용하고 새 장식을 만들지 않는다.
6. **출력.** `node scripts/export.mjs out/<이름>.html out/` → HTML·PDF·PNG. 실패 메시지(글자 넘침, 종이 밖, 그림이 글자를 가림, 외부 리소스)를 고친 뒤 다시 실행한다. 실행 도구가 없으면 HTML만 전달하고 그 사실을 알린다.
7. **확인과 보고.** PNG를 직접 열어 본다. 실제 만든 파일 경로, 비워 둔 항목, 대체한 폰트나 실패한 형식을 짧게 보고한다. 만들지 않은 파일을 만들었다고 말하지 않는다.

## 지킬 것

- 로고·모티프·캐릭터는 `assets/` 원본에서 고른다. 늘이기·재채색·필터·생성형 재작화 금지. 견본 시트 전체를 붙이지 않는다. 새 도안이 필요하면 `scripts/derive_svg.py`로 원본 벡터를 잘라 낸다.
- 캐릭터 원본이 `assets/character/official/`에 없으면 `python3 scripts/assets.py --fetch-character`(학교 사이트 접속 필요)를 안내한다. 화면 캡처나 비슷하게 그린 그림으로 대신하지 않는다.
- 작은 글자에 GNU Blue를 쓰지 않는다(대비 3.04:1). 흰 글자 띠는 `--ui-banner`, 링크·선택은 `--ui-action`.
- 외부 CDN 폰트·이미지에 의존하지 않는다. 빌드 결과는 오프라인에서 열려야 한다.

## 자료

| 경로 | 내용 |
|---|---|
| `DESIGN.md` | 디자인 지침 전문. 다른 AI에 단독으로 첨부 가능 |
| `README.md` | 사람용 사용법·설치·요청문 |
| `examples/` | 매체별 예시 7종 HTML·PDF·PNG(가로 세미나 포함, 폰트는 `../assets/fonts` 연결) |
| `data/*.json` | 매체별 내용 틀 |
| `assets/theme.css` | 토큰과 레이아웃 클래스 |
| `assets/derived/` | HTML용 로고 SVG 4종 (웹 머리글은 `assets/official/gnu-web-logo.png`) |
| `assets/official/` | 대학 공개 VI 원본(AI·PDF·PNG·JPG), 출처·SHA-256은 `manifest.json` |
| `assets/character/` | 지누·누누 원본 자리와 사용법 |
| `assets/fonts/` | Noto Sans KR·SUIT·SUITE (OFL) |
| `references/` | 요청문 예시, 웹 기본형(`web-reference.md`), 근거 기록, 자산 사용, 색·꽃 모티프, 검증 기록 |
| `scripts/` | `build.py` 빌드, `export.mjs` 출력·검사, `assets.py` 원본 검증·수집, `derive_svg.py` 도안 추출, `package.py` 배포 ZIP |

로고·캐릭터·교화의 권리는 경상국립대학교에 있다. 이 스킬의 라이선스는 그 이용 허락이 아니다. 대학 명의 공식 홍보물은 담당 부서 확인을 거친다고 안내한다.
