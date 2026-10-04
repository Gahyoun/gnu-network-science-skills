# 로고·공식 도안 사용

`assets/official/`은 대학 공개 다운로드에서 받은 VI 원본이다. `.ai`는 Adobe Illustrator 문서이며 인공지능 생성 이미지라는 뜻이 아니다. 일부 파일명은 찾기 쉽게 바꿨지만 내용은 그대로다. 원래 파일명·URL·출처·SHA-256은 `assets/manifest.json`에 있다.

이 폴더는 학교가 승인한 배포물이 아니다. 로고·모티프·교화·캐릭터의 권리는 원 권리자에게 있고, 저장소의 소프트웨어 라이선스가 그 이용을 허락하지 않는다. 최신 이용 조건은 [공식 VI 페이지](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?cntntsId=1198&mi=1369)에서 확인한다.

## 이미 준비된 HTML용 사본

| `assets/derived/` | 원본 | 쓰는 곳 |
|---|---|---|
| `gnu-signature.svg` | BS08 국영문 가로조합 | 안내문 하단, 포스터·표지 테두리, 웹 머리글 |
| `gnu-symbol.svg` | BS08 심벌 | 슬라이드 바닥글 |
| `fly-with-gnu.svg` | 슬로건 BI 가이드 AI(`design system guidelines_fly with gnu_3.ai`) | A4 홍보문·세미나 하단 왼쪽(기본), 서식형 상단 |
| `emblem-signature-white.svg` | 공식 안내문 서식 | 그라데이션 띠 위 |

웹 머리글에는 홈페이지 헤더 원본 `assets/official/gnu-web-logo.png`를 그대로 쓴다(출처·해시는 manifest.json).

다시 만들기: `python3 scripts/derive_svg.py gnu-signature` (나머지도 같은 방식). Poppler `pdftocairo`와 `pip install svgelements`가 필요하다.

## 장식 이미지

학교 이미지·꽃 모티프는 사용자가 장식을 요청했을 때만 A4 본문 오른쪽 아래 여백에 넣는다. 원본 시트에서 완성 도안 하나를 SVG·PNG로 출력하고 JSON의 `decoration_image`에 경로, `decoration_alt`에 대체텍스트(장식이면 빈 값)를 넣는다. 지누는 이 자리가 아니라 `--character`로 넣는다(DESIGN.md 6장).

## 새 도안이 필요할 때

1. `assets/catalog.md`에서 원본을 고른다.
2. 견본 시트라면 필요한 완성 도안 하나만 쓴다. 시트 전체를 로고로 붙이지 않는다.
3. `python3 scripts/derive_svg.py --source <원본.ai|pdf> --preview out/p.png`로 좌표를 확인하고, `--crop X Y W H --output <파일>.svg`로 잘라 낸다. 72dpi 미리보기의 픽셀 좌표가 pt 좌표다.
4. 결과를 원본과 나란히 열어 비례·색·빠진 부분이 없는지 본다.
5. 학교명을 일반 텍스트로 다시 써서 로고처럼 쓰지 않는다.
6. 최소 크기·보호 공간은 원본 규정을 따른다.

## 검증과 수집

- `python3 scripts/assets.py`: 오프라인으로 파일 헤더와 SHA-256을 검사한다.
- `python3 scripts/assets.py --download`: manifest에 있으나 빠진 파일만 받는다. 기존 파일은 덮어쓰지 않는다.
- `python3 scripts/assets.py --fetch-character`: 공식 캐릭터 페이지의 내려받기 파일을 `assets/character/official/`에 저장하고 manifest에 기록한다.

파일 검증이 Illustrator의 모든 레이어 편집 가능성을 보장하지는 않는다.
