# 포함 서체

| 파일 | 서체 | 출처 | 변경 |
|---|---|---|---|
| `NotoSansKR-Variable.subset.woff2` | Noto Sans KR 2.004 가변(100–900) | [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosanskr) `NotoSansKR[wght].ttf` | 라틴, 그리스 문자, 일반 구두점·기호, 화살표·수학 기호, 원문자, CJK 기호, 호환 자모, 완성형 한글 11,172자로 줄여 WOFF2로 저장 |
| `SUIT-Variable.woff2` | SUIT 2.040 가변(100–900) | [sun-typeface/SUIT](https://github.com/sun-typeface/SUIT) | 원본 그대로 |
| `SUITE-Variable.woff2` | SUITE 2.040 가변(300–900) | [sun-typeface/SUITE](https://github.com/sun-typeface/SUITE) | 원본 그대로 |

모두 SIL Open Font License 1.1이며 라이선스 원문을 같은 폴더에 두었다. SUIT와 SUITE는 예약 서체명(Reserved Font Name)이 있어 줄이거나 고치지 않고 원본 파일을 그대로 넣었다. SUIT·SUITE에 없는 한글 글자는 Noto Sans KR로 표시된다.

Noto Sans KR 사본을 다시 만들 때:

```bash
pip install fonttools brotli
pyftsubset 'NotoSansKR[wght].ttf' --flavor=woff2 --layout-features='*' \
  --unicodes='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+0370-03FF,U+2000-206F,U+2070-209F,U+20A9,U+20AC,U+2100-218F,U+2190-21FF,U+2200-22FF,U+2460-24FF,U+25A0-25FF,U+3000-303F,U+3131-318E,U+AC00-D7A3,U+FF01-FF5E' \
  --output-file=NotoSansKR-Variable.subset.woff2
```
