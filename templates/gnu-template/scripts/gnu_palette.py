#!/usr/bin/env python3
"""Generate KRDS color-scale overrides from the GNU official colors.

KRDS v1.1.0 numbers each scale step by its luminance: step 50 is the first step
with 4.5:1 against white, 60 is the text color, and so on. This script keeps the
hue of each GNU color (BS13) and solves the OKLCH lightness so that every step has
the same relative luminance (= the same contrast) as the KRDS step it replaces.

    pip install coloraide
    python3 scripts/gnu_palette.py            # writes assets/krds/krds-gnu-tokens.css

Maintainer tool. The generated CSS is committed, so users do not need coloraide.
"""
from pathlib import Path

try:
    from coloraide import Color
except ImportError as exc:  # pragma: no cover
    raise SystemExit('pip install coloraide 가 필요합니다.') from exc

ROOT = Path(__file__).resolve().parents[1]
STEPS = (5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95)
# KRDS v1.1.0 krds_tokens.css light primitives (luminance targets only).
KRDS = {
    'primary': '#ecf2fe #d8e5fd #b1cefb #86aff9 #4c87f6 #256ef4 #0b50d0 #083891 #052561 #03163a #020f27',
    'secondary': '#eef2f7 #d6e0eb #bacbde #90b0d5 #6b96c7 #346fb2 #1c589c #063a74 #052b57 #031f3f #02162c',
    'point': '#fbeff0 #f5d6d9 #ebadb2 #e0858c #d65c66 #d63d4a #ab2b36 #7a1f26 #521419 #310c0f #21080a',
}
# BS13 전용색상: scale seeds (hue and chroma come from these).
SEEDS = {'primary': '#009edb', 'secondary': '#43525a', 'point': '#b3a177'}


def contrast(a, b='#ffffff'):
    la, lb = Color(a).luminance(), Color(b).luminance()
    return (max(la, lb) + .05) / (min(la, lb) + .05)


def scale(seed, refs):
    base = Color(seed).convert('oklch')
    hue, chroma = base['hue'], base['chroma']
    out = {}
    for step, ref in zip(STEPS, refs.split()):
        target = Color(ref).luminance()
        lo, hi = 0.0, 1.0
        for _ in range(60):  # bisection on OKLCH lightness, chroma clipped into sRGB
            mid = (lo + hi) / 2
            if Color('oklch', [mid, chroma, hue]).fit('srgb').luminance() < target:
                lo = mid
            else:
                hi = mid
        out[step] = Color('oklch', [(lo + hi) / 2, chroma, hue]).fit('srgb').convert('srgb').to_string(hex=True)
    return out


def main():
    lines = ['@charset "utf-8";',
             '/* GNU 색으로 바꾼 KRDS 색 단계. scripts/gnu_palette.py가 만든 파일이다. 직접 고치지 않는다.',
             '   KRDS 공식 키트(krds-uiux)의 krds_tokens.css 다음에 불러오면 primary·secondary·point가 GNU 색으로 바뀐다.',
             '   단계별 명도(흰 바탕 대비)는 KRDS와 같다. gray·danger·warning·success·information은 KRDS 값을 그대로 쓴다. */',
             ':root {']
    report = []
    for name in ('primary', 'secondary', 'point'):
        values = scale(SEEDS[name], KRDS[name])
        lines.append(f'  /* {name}: seed {SEEDS[name]} (BS13) */')
        for step in STEPS:
            lines.append(f'  --krds-color-light-{name}-{step}: {values[step]};')
            report.append(f'{name}-{step} {values[step]} {contrast(values[step]):.2f}:1')
    lines += ['  /* 브랜드 그래픽(글자 아닌 선·도형)에는 공식 GNU Blue를 쓴다. 흰 바탕 3.04:1 */',
              '  --krds-light-color-graphic-brand: #009edb;',
              '  --gnu-brand-blue: #009edb;',
              '  --gnu-brand-grey: #43525a;',
              '}', '']
    out = ROOT / 'assets/krds/krds-gnu-tokens.css'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text('\n'.join(lines), encoding='utf-8')
    print(out)
    print('\n'.join(report))


if __name__ == '__main__':
    main()
