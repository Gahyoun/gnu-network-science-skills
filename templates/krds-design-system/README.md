# KRDS design system (GNU)

KRDS(대한민국 정부 디자인 시스템) [디자인 스타일](https://www.krds.go.kr/html/site/style/style_01.html)의 8개 상세 페이지를 작업 지침으로 역산하고, 경상국립대학교 VI의 공식색·서체·로고 규칙을 KRDS **확장형 스타일** 자리에 넣은 화면용 디자인 시스템이다. 구조·접근성은 KRDS, 정체성은 GNU.

| 파일 | 내용 |
|---|---|
| [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | 지침 본문. 색상(매직넘버)·타이포그래피·형태·레이아웃·아이콘·엘리베이션·선명한 화면 모드·디자인 토큰 + GNU 정체성 + 자체 점검표 |
| [`tokens/primitives.css`](tokens/primitives.css) | 1층 토큰: GNU Blue·Grey·Gold로 만든 primary·secondary·point 단계(기본·선명 모드), KRDS gray·시스템색·alpha, graphic, `--gnu-brand-*` |
| [`tokens/semantic.css`](tokens/semantic.css) | 2층 토큰: 글자 스케일, number·간격, 래디어스, 아이콘, 색 역할(두 모드), 화면에서 쓰는 별칭 `--gk-*` |
| [`tokens/tokens.json`](tokens/tokens.json) | 같은 색 값의 JSON (Figma Tokens 등) |
| [`scripts/build_tokens.py`](scripts/build_tokens.py) | 색 단계 생성·매직넘버 검사. 표준 라이브러리만 사용 |
| [`examples/index.html`](examples/index.html) | 스타일 견본 페이지(색·글자·버튼·입력·형태·엘리베이션·시스템색·아이콘, 모드 전환) |

## 쓰는 법

새 페이지:

```html
<html lang="ko" data-krds-mode="light">  <!-- "high-contrast" 또는 OS 연동 "theme" -->
<link rel="stylesheet" href="tokens/primitives.css">
<link rel="stylesheet" href="tokens/semantic.css">
<style>
  html { font-size: 62.5%; }                       /* 1rem = 10px */
  body { background: var(--gk-bg); color: var(--gk-text);
         font: 400 var(--krds-typo-body-medium)/1.5 var(--krds-typo-font-type); }
  .btn-primary { background: var(--gk-btn-primary); color: #fff;
                 height: var(--krds-size-height-medium); border-radius: var(--krds-radius-medium); }
  .btn-primary:hover { background: var(--gk-btn-primary-hover); }
</style>
```

화면 CSS에는 `--gk-*`(색)와 `--krds-*` 의미 토큰(크기·간격)만 쓴다. hex나 단계 번호(`primary-50`)를 직접 쓰지 않는다.

KRDS 공식 키트([krds-uiux](https://github.com/KRDS-uiux/krds-uiux))를 이미 쓰는 프로젝트: 키트 CSS 다음에 `tokens/primitives.css`만 불러오면 이름이 같아서 색이 GNU로 바뀐다.

색을 다시 만들 때:

```bash
python3 scripts/build_tokens.py
```

매직넘버(40 = 3:1, 50 = 4.5:1, 70 = 7:1, 90 = 15:1)를 못 지키면 실패로 끝난다.

## 관계

- 인쇄물(A4 안내문·A0 포스터·16:9 발표)과 빌드 도구는 [`gnu-template`](../gnu-template/README.md). 그쪽 웹 템플릿도 같은 KRDS 구조를 쓴다.
- 이 폴더는 비공식 자료다. KRDS나 경상국립대학교의 공식 규정이 아니며, KRDS 아이콘·이미지 원본은 포함하지 않는다.
