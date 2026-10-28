#!/usr/bin/env python3
"""Build the GNU x KRDS primitive color tokens and check KRDS magic numbers.

KRDS numbers each color step by its contrast with white ("magic number"):
40 >= 3:1, 50 >= 4.5:1, 70 >= 7:1, 90 >= 15:1. This script keeps the hue of each
GNU official color (VI BS13) and solves OKLCH lightness so that every step has the
same relative luminance as the KRDS step it replaces.

The color math is the same as gnu-template/scripts/gnu_palette.py (coloraide, OKLCH,
default sRGB gamut fit), so both folders get identical hex values; main() checks this.

    pip install coloraide
    python3 scripts/build_tokens.py          # writes tokens/primitives.css, tokens/tokens.json
    python3 scripts/build_tokens.py --check  # only prints the contrast report

Maintainer tool. The generated files are committed, so users do not need coloraide.
"""
import json
import re
import sys
from pathlib import Path

try:
    from coloraide import Color
except ImportError as exc:  # pragma: no cover
    raise SystemExit('pip install coloraide 가 필요합니다.') from exc

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


# --- color math (same calls as gnu-template/scripts/gnu_palette.py) -----------------------

def luminance(h):
    return Color(h).luminance()


def contrast(a, b='#ffffff'):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def oklch(lightness, chroma, hue):
    return Color('oklch', [lightness, chroma, hue]).fit('srgb')


def solve(hue, chroma, target_lum):
    lo, hi = 0.0, 1.0
    for _ in range(60):  # bisection on OKLCH lightness, chroma fitted into sRGB
        mid = (lo + hi) / 2
        if oklch(mid, chroma, hue).luminance() < target_lum:
            lo = mid
        else:
            hi = mid
    return oklch((lo + hi) / 2, chroma, hue).convert('srgb').to_string(hex=True)


def lch(h):
    c = Color(h).convert('oklch')
    return c['chroma'], c['hue']


def scale(seed, refs, chroma_from_ref=False):
    seed_c, seed_h = lch(seed)
    out = {}
    for step, ref in zip(STEPS, refs.split()):
        chroma = lch(ref)[0] if chroma_from_ref else seed_c
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
    c, h = lch(GNU['blue'])
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


def check_gnu_template(light):
    """The sibling gnu-template must carry the same light primary/secondary/point values."""
    path = ROOT.parent / 'gnu-template/assets/krds/krds-gnu-tokens.css'
    if not path.exists():
        return True
    theirs = dict(re.findall(r'--krds-color-light-(\w+-\d+):\s*(#[0-9a-f]{6})', path.read_text(encoding='utf-8')))
    diff = [f'{name}-{step}: {value} != {theirs.get(f"{name}-{step}")}'
            for name in ('primary', 'secondary', 'point') for step, value in light[name].items()
            if theirs.get(f'{name}-{step}') != value]
    print('gnu-template tokens:', 'identical' if not diff else 'DIFFER\n  ' + '\n  '.join(diff))
    return not diff


def main():
    light, hc, graphic = build()
    ok, rows = report(light, hc)
    print('\n'.join(rows))
    ok &= check_gnu_template(light)
    if '--check' not in sys.argv:
        write(light, hc, graphic)
        print('wrote tokens/primitives.css, tokens/tokens.json')
    if not ok:
        raise SystemExit('check failed')


if __name__ == '__main__':
    main()
