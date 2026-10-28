#!/usr/bin/env python3
"""Build the GNU x KRDS primitive color tokens and check KRDS magic numbers.

KRDS numbers each color step by its contrast with white ("magic number"):
40 >= 3:1, 50 >= 4.5:1, 70 >= 7:1, 90 >= 15:1. This script keeps the hue of each
GNU official color (VI BS13) and solves OKLCH lightness so that every step has the
same relative luminance as the KRDS step it replaces. Standard library only.

    python3 scripts/build_tokens.py          # writes tokens/primitives.css, tokens/tokens.json
    python3 scripts/build_tokens.py --check  # only prints the contrast report
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEPS = (5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95)
MAGIC = {40: 3.0, 50: 4.5, 70: 7.0, 90: 15.0}

# KRDS v1.1.0 krds_tokens.css primitives (luminance targets only).
KRDS_LIGHT = {
    'primary': '#ecf2fe #d8e5fd #b1cefb #86aff9 #4c87f6 #256ef4 #0b50d0 #083891 #052561 #03163a #020f27',
    'secondary': '#eef2f7 #d6e0eb #bacbde #90b0d5 #6b96c7 #346fb2 #1c589c #063a74 #052b57 #031f3f #02162c',
    'point': '#fbeff0 #f5d6d9 #ebadb2 #e0858c #d65c66 #d63d4a #ab2b36 #7a1f26 #521419 #310c0f #21080a',
}
# High-contrast mode: KRDS swaps secondary to a hue that stays distinct on black.
KRDS_HC_SECONDARY = '#edf6f8 #d5ebf1 #abd8e3 #75c0d1 #3d9fb8 #268097 #1f687a #17505e #113b45 #0e3139 #091f25'

# GNU VI BS13 official colors.
GNU = {'blue': '#009edb', 'grey': '#43525a', 'gold': '#b3a177', 'silver': '#bcbec0'}
SEEDS = {'primary': GNU['blue'], 'secondary': GNU['grey'], 'point': GNU['gold']}

# Unchanged KRDS primitives (gray, system, alpha) - KRDS keeps these fixed in adaptive style.
KRDS_FIXED = {
    'gray': {0: '#ffffff', 5: '#f4f5f6', 10: '#e6e8ea', 20: '#cdd1d5', 30: '#b1b8be', 40: '#8a949e', 50: '#6d7882',
             60: '#58616a', 70: '#464c53', 80: '#33363d', 90: '#1e2124', 95: '#131416', 100: '#000000'},
    'danger': '#fdefec #fcdfd9 #f7afa1 #f48771 #f05f42 #de3412 #bd2c0f #8a240f #5c180a #390d05 #260903',
    'warning': '#fff3db #ffe0a3 #ffc95c #ffb114 #c78500 #9e6a00 #8a5c00 #614100 #422c00 #2e1f00 #241800',
    'success': '#eaf6ec #d8eedd #a9dab4 #7ec88e #3fa654 #228738 #267337 #285d33 #1f4727 #122b18 #0e2012',
    'information': '#e7f4fe #d3ebfd #9ed2fa #5fb5f7 #2098f3 #0b78cb #096ab3 #085691 #053961 #03253f #021a2c',
}


# --- color math (sRGB <-> OKLab, WCAG luminance) -------------------------------------------

def hex_to_rgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def rgb_to_hex(rgb):
    return '#' + ''.join(f'{round(min(1, max(0, c)) * 255):02x}' for c in rgb)


def to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def from_linear(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def luminance(h):
    r, g, b = (to_linear(c) for c in hex_to_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b='#ffffff'):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hex_to_oklch(h):
    r, g, b = (to_linear(c) for c in hex_to_rgb(h))
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360


def oklch_to_linear(L, C, H):
    A, B = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]


def oklch_to_hex(L, C, H):
    """Reduce chroma until the color fits in sRGB (keeps hue and lightness)."""
    lo, hi = 0.0, C
    if all(-1e-6 <= c <= 1 + 1e-6 for c in oklch_to_linear(L, C, H)):
        lo = C
    else:
        for _ in range(40):
            mid = (lo + hi) / 2
            if all(-1e-6 <= c <= 1 + 1e-6 for c in oklch_to_linear(L, mid, H)):
                lo = mid
            else:
                hi = mid
    return rgb_to_hex([from_linear(min(1, max(0, c))) for c in oklch_to_linear(L, lo, H)])


def solve(hue, chroma, target_lum):
    lo, hi = 0.0, 1.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if luminance(oklch_to_hex(mid, chroma, hue)) < target_lum:
            lo = mid
        else:
            hi = mid
    return oklch_to_hex((lo + hi) / 2, chroma, hue)


def scale(seed, refs, chroma_from_ref=False):
    _, seed_c, seed_h = hex_to_oklch(seed)
    out = {}
    for step, ref in zip(STEPS, refs.split()):
        chroma = hex_to_oklch(ref)[1] if chroma_from_ref else seed_c
        out[step] = solve(seed_h, chroma, luminance(ref))
    return out


def fixed(name):
    v = KRDS_FIXED[name]
    return v if isinstance(v, dict) else dict(zip(STEPS, v.split()))


# --- build ---------------------------------------------------------------------------------

def build():
    light = {name: scale(SEEDS[name], KRDS_LIGHT[name]) for name in SEEDS}
    hc = dict(light)
    # GNU Grey has almost no chroma, so on black it would look like gray. Keep its hue and
    # borrow the chroma of KRDS's high-contrast secondary so it stays distinguishable.
    hc['secondary'] = scale(GNU['grey'], KRDS_HC_SECONDARY, chroma_from_ref=True)
    for name in ('gray', 'danger', 'warning', 'success', 'information'):
        light[name] = hc[name] = fixed(name)
    # Graphic (charts, banners, illustrations): GNU Blue hue toned down to 40 % chroma,
    # the same move KRDS makes for its own graphic palette.
    _, c, h = hex_to_oklch(GNU['blue'])
    graphic = {}
    for step, ref in zip(STEPS, KRDS_LIGHT['primary'].split()):
        if step in (10, 30, 50, 70, 90):
            graphic[step] = solve(h, c * 0.4, luminance(ref))
    return light, hc, graphic


def report(light, hc):
    rows, ok = [], True
    for mode, pal in (('light', light), ('high-contrast', hc)):
        for name in ('primary', 'secondary', 'point'):
            refs = KRDS_HC_SECONDARY if (mode, name) == ('high-contrast', 'secondary') else KRDS_LIGHT[name]
            refs = dict(zip(STEPS, refs.split()))
            for step, magic in MAGIC.items():
                cr = contrast(pal[name][step])
                # Pass if the magic number holds, or if we match KRDS's own step where KRDS
                # itself falls short (its high-contrast secondary-90 is 13.8:1).
                passed = cr >= min(magic, contrast(refs[step])) - 0.05
                ok &= passed
                rows.append(f'{mode:13s} {name:9s} {step:>2} {pal[name][step]}  {cr:5.2f}:1  '
                            f'(magic {magic:>4}:1) {"ok" if passed else "FAIL"}')
    return ok, rows


def write(light, hc, graphic):
    lines = ['@charset "utf-8";',
             '/* GNU x KRDS primitive tokens. Generated by scripts/build_tokens.py - do not edit.',
             '   Names follow KRDS v1.1.0 (krds_tokens.css), so this file can also be loaded after the',
             '   official kit CSS to recolor it. Step number = contrast with white (KRDS magic number). */',
             ':root {']
    for mode, pal in (('light', light), ('high-contrast', hc)):
        lines.append(f'  /* {mode} */')
        for name in ('primary', 'secondary', 'point', 'gray', 'danger', 'warning', 'success', 'information'):
            for step, value in pal[name].items():
                lines.append(f'  --krds-color-{mode}-{name}-{step}: {value};')
        for step, value in graphic.items():
            lines.append(f'  --krds-color-{mode}-graphic-{step}: {value};')
        for a in (100, 75, 50, 25, 10, 0):
            lines.append(f'  --krds-color-{mode}-alpha-black{a}: #000000{round(a * 2.55):02x};')
            lines.append(f'  --krds-color-{mode}-alpha-white{a}: #ffffff{round(a * 2.55):02x};')
    lines.append('  /* GNU VI BS13 official colors: brand graphics only (GNU Blue on white is 3.04:1) */')
    for key, value in GNU.items():
        lines.append(f'  --gnu-brand-{key}: {value};')
    lines += ['}', '']
    (ROOT / 'tokens/primitives.css').write_text('\n'.join(lines), encoding='utf-8')
    data = {'$description': 'GNU x KRDS primitive color tokens (generated). Step = contrast with white.',
            'brand': GNU,
            'light': {k: {str(s): v for s, v in pal.items()} for k, pal in light.items()},
            'high-contrast': {k: {str(s): v for s, v in pal.items()} for k, pal in hc.items()},
            'graphic': {str(s): v for s, v in graphic.items()}}
    (ROOT / 'tokens/tokens.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    light, hc, graphic = build()
    ok, rows = report(light, hc)
    print('\n'.join(rows))
    if '--check' not in sys.argv:
        write(light, hc, graphic)
        print('wrote tokens/primitives.css, tokens/tokens.json')
    if not ok:
        raise SystemExit('magic number check failed')


if __name__ == '__main__':
    main()
