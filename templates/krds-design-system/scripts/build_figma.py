#!/usr/bin/env python3
"""Export the GNU x KRDS tokens as Figma Variables (W3C DTCG JSON, Figma native import).

Reads tokens/primitives.css and tokens/semantic.css (the single source of truth) and writes
one JSON file per collection x mode into tokens/figma/:

    1-primitives.light.tokens.json           Primitives   / Light
    1-primitives.high-contrast.tokens.json   Primitives   / High-contrast
    2-color.light.tokens.json                Color        / Light          (aliases -> Primitives)
    2-color.high-contrast.tokens.json        Color        / High-contrast  (aliases -> Primitives)
    3-parameter.pc.tokens.json               Parameter    / PC             (numbers, px)
    3-parameter.mobile.tokens.json           Parameter    / Mobile         (numbers, px)
    4-component.default.tokens.json          Component    / Default        (aliases -> Parameter, Color)

Import in Figma: Variables panel -> Import -> pick the files of one collection (each file becomes
a mode). Import in the numeric order, because later collections alias earlier ones by name.

Standard library only:

    python3 scripts/build_figma.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tokens/figma'
PX_PER_REM = 10  # html { font-size: 62.5% }
MODES = ('light', 'high-contrast')
PRIM_NAMES = ('primary', 'secondary', 'point', 'gray', 'danger', 'warning', 'success', 'information', 'graphic', 'alpha')


def css_vars(path):
    text = re.sub(r'/\*.*?\*/', '', path.read_text(encoding='utf-8'), flags=re.S)
    root = text.split('/* ---- mode-free')[0] if '/* ---- mode-free' in text else text
    return dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);', root))


def color_value(h):
    h = h.strip().lower()
    rgb = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    alpha = int(h[7:9], 16) / 255 if len(h) == 9 else 1
    return {'colorSpace': 'srgb', 'components': [round(c, 6) for c in rgb],
            'alpha': round(alpha, 6), 'hex': h[:7]}


def put(tree, path, leaf):
    node = tree
    for key in path[:-1]:
        node = node.setdefault(key, {})
    node[path[-1]] = leaf


def px(v, table):
    v = v.strip()
    m = re.fullmatch(r'var\(--([\w-]+)\)', v)
    if m:
        return px(table[m.group(1)], table)
    if v.endswith('rem'):
        return round(float(v[:-3]) * PX_PER_REM, 3)
    if v.endswith('px'):
        return float(v[:-2])
    return float(v)


def num(value, desc=None, scopes=None):
    leaf = {'$type': 'number', '$value': value}
    ext = {}
    if scopes:
        ext['scopes'] = scopes
    if ext:
        leaf['$extensions'] = {'com.figma': ext}
    if desc:
        leaf['$description'] = desc
    return leaf


def alias(path, typ):
    return {'$type': typ, '$value': '{' + '.'.join(path) + '}'}


# --- 1. primitives ---------------------------------------------------------------------------

def primitives(p):
    files = {}
    for mode in MODES:
        tree = {}
        for key, val in p.items():
            m = re.fullmatch(rf'krds-color-{mode}-(\w+?)-?(\d+|black\d+|white\d+)', key)
            if not m or m.group(1) not in PRIM_NAMES:
                continue
            put(tree, ['color', m.group(1), m.group(2)], {'$type': 'color', '$value': color_value(val)})
        for key, val in p.items():
            if key.startswith('gnu-brand-'):
                put(tree, ['brand', key[len('gnu-brand-'):]],
                    {'$type': 'color', '$value': color_value(val),
                     '$description': 'GNU VI BS13 official color. Graphics only (blue on white 3.04:1).'})
        files[mode] = tree
    return files


# --- 2. semantic colour roles ----------------------------------------------------------------

def color_roles(s):
    files = {}
    for mode in MODES:
        tree = {}
        prefix = f'krds-{mode}-color-'
        for key, val in s.items():
            if not key.startswith(prefix):
                continue
            group, _, name = key[len(prefix):].partition('-')
            val = val.strip()
            m = re.fullmatch(rf'var\(--krds-color-{mode}-(\w+?)-?(\d+|black\d+|white\d+)\)', val)
            b = re.fullmatch(r'var\(--gnu-brand-(\w+)\)', val)
            if m:
                leaf = alias(['color', m.group(1), m.group(2)], 'color')
            elif b:
                leaf = alias(['brand', b.group(1)], 'color')
            elif val.startswith('#'):
                leaf = {'$type': 'color', '$value': color_value(val)}
            else:
                raise SystemExit(f'unhandled colour role {key}: {val}')
            put(tree, [group, name], leaf)
        files[mode] = tree
    return files


# --- 3. parameters (PC / Mobile) -------------------------------------------------------------

GAP = ['GAP']
WH = ['WIDTH_HEIGHT']
RADIUS = ['CORNER_RADIUS']
FONT = ['FONT_SIZE']
STROKE = ['STROKE_FLOAT']


def parameters(s):
    files = {'pc': {}, 'mobile': {}}

    def both(path, pc, mobile=None, desc=None, scopes=None):
        put(files['pc'], path, num(pc, desc, scopes))
        put(files['mobile'], path, num(pc if mobile is None else mobile, desc, scopes))

    # number scale (mode-free, the base every gap/padding points at)
    for key, val in s.items():
        m = re.fullmatch(r'krds-number-(\d+|max)', key)
        if m:
            both(['number', m.group(1)], px(val, s), scopes=['GAP', 'WIDTH_HEIGHT', 'CORNER_RADIUS'])

    # typography sizes: pc/mobile pairs and shared sizes
    for key, val in s.items():
        m = re.fullmatch(r'krds-pc-typo-([\w-]+)', key)
        if m:
            name = m.group(1)
            both(['font-size'] + name.split('-', 1), px(val, s), px(s[f'krds-mobile-typo-{name}'], s), scopes=FONT)
            continue
        m = re.fullmatch(r'krds-typo-(display|heading|body|navigation|label)-([\w-]+)', key)
        if m:
            both(['font-size', m.group(1), m.group(2)], px(val, s), scopes=FONT)
    for w in ('regular', 'medium', 'bold'):
        both(['font-weight', w], float(s[f'krds-typo-font-weight-{w}']), scopes=['FONT_WEIGHT'])
    both(['line-height', 'base'], 150, desc='percent of font size (1.5)', scopes=['LINE_HEIGHT'])

    # layout gaps and card paddings: pc/mobile pairs
    for key, val in s.items():
        m = re.fullmatch(r'krds-pc-(gap-layout|padding-card)-([\w-]+)', key)
        if m:
            kind, name = m.groups()
            group = 'gap' if kind == 'gap-layout' else 'padding-card'
            both([group, name], px(val, s), px(s[f'krds-mobile-{kind}-{name}'], s), scopes=GAP)
    for name in ('card-list', 'input-row', 'input-parts'):
        both(['gap', name], px(s[f'krds-gap-{name}'], s), scopes=GAP)
    both(['padding', 'input'], px(s['krds-padding-input'], s), scopes=GAP)

    # grid / layout parameters
    both(['grid', 'contents-max'], px(s['krds-contents-size-max'], s), 360, scopes=WH,
         desc='content width; mobile is the 360 frame width')
    both(['grid', 'columns'], 12, 4)
    both(['grid', 'gutter'], px(s['krds-gutter-large'], s), px(s['krds-gutter-small'], s), scopes=GAP)
    both(['grid', 'margin'], px(s['krds-screen-margin-large'], s), px(s['krds-screen-margin-small'], s), scopes=GAP)
    both(['grid', 'frame-width'], 1280, 360, scopes=WH, desc='artboard width for this mode')
    both(['grid', 'side-nav-width'], 232, 0, scopes=WH, desc='in-page navigation column; hidden on mobile')
    for name, value in (('xlarge', 1280), ('large', 1024), ('medium', 768), ('small', 360)):
        both(['breakpoint', name], value, scopes=WH)

    # sizes
    for size in ('xsmall', 'small', 'medium', 'large', 'xlarge'):
        both(['height', size], px(s[f'krds-size-height-{size}'], s), scopes=WH)
        both(['icon', size], px(s[f'krds-icon-size-{size}'], s), scopes=WH)
    both(['icon', 'stroke'], 1.6, desc='at 24px; scale with icon size', scopes=STROKE)
    for size in ('xsmall', 'small', 'medium', 'large', 'xlarge', 'max'):
        both(['radius', size], px(s[f'krds-radius-{size}'], s), scopes=RADIUS)
    both(['border', 'width-input'], 1, desc='2 in high-contrast mode', scopes=STROKE)
    both(['border', 'width-focus'], 4, desc='focus ring (2 px gap + 4 px ring)', scopes=STROKE)
    return files


# --- 4. component parameters (alias Parameter + Color) ---------------------------------------

def components():
    t = {}
    P = lambda *p: alias(list(p), 'number')
    C = lambda *p: alias(list(p), 'color')
    for size, h, pad, fs in (('large', 'large', 'number.10', 'label.large'),
                             ('medium', 'medium', 'number.8', 'label.medium'),
                             ('small', 'small', 'number.7', 'label.small'),
                             ('xsmall', 'xsmall', 'number.5', 'label.xsmall')):
        put(t, ['button', size, 'height'], P('height', h))
        put(t, ['button', size, 'padding-x'], P(*pad.split('.')))
        put(t, ['button', size, 'font-size'], P('font-size', *fs.split('.')))
        put(t, ['button', size, 'radius'], P('radius', 'medium' if size != 'xsmall' else 'small'))
    put(t, ['button', 'gap-icon'], P('number', '4'))
    for kind in ('primary', 'secondary'):
        put(t, ['button', kind, 'fill'], C('button', f'{kind}-fill'))
        put(t, ['button', kind, 'fill-hover'], C('button', f'{kind}-fill-hover'))
        put(t, ['button', kind, 'fill-pressed'], C('button', f'{kind}-fill-pressed'))
    put(t, ['button', 'secondary', 'border'], C('button', 'secondary-border'))
    put(t, ['button', 'tertiary', 'border'], C('button', 'tertiary-border'))

    put(t, ['input', 'height'], P('height', 'large'))
    put(t, ['input', 'padding-x'], P('padding', 'input'))
    put(t, ['input', 'radius'], P('radius', 'medium'))
    put(t, ['input', 'border-width'], P('border', 'width-input'))
    put(t, ['input', 'gap-parts'], P('gap', 'input-parts'))
    put(t, ['input', 'border'], C('border', 'gray-dark'))

    for size in ('large', 'medium', 'small', 'xsmall'):
        put(t, ['card', size, 'padding'], P('padding-card', size))
    put(t, ['card', 'radius'], P('radius', 'large'))
    put(t, ['card', 'gap-list'], P('gap', 'card-list'))
    put(t, ['card', 'border'], C('border', 'gray-light'))
    put(t, ['card', 'fill'], C('surface', 'white'))

    put(t, ['box', 'radius'], P('radius', 'large'))
    put(t, ['box', 'padding'], P('padding-card', 'small'))
    put(t, ['box', 'border-width'], P('number', '1'))
    for tone, surface, border in (('info', 'primary-subtler', 'primary'),
                                  ('neutral', 'gray-subtler', 'gray-light'),
                                  ('secondary', 'secondary-subtler', 'secondary')):
        put(t, ['box', tone, 'fill'], C('surface', surface))
        put(t, ['box', tone, 'border'], C('border', border))

    put(t, ['badge', 'radius'], P('radius', 'small'))
    put(t, ['badge', 'height'], P('number', '10'))
    put(t, ['badge', 'padding-x'], P('number', '5'))
    put(t, ['badge', 'font-size'], P('font-size', 'label', 'xsmall'))

    put(t, ['header', 'height'], P('number', '20'))
    put(t, ['header', 'gap-breadcrumb'], P('gap', 'header-breadcrumb'))
    put(t, ['nav', 'width'], P('grid', 'side-nav-width'))
    put(t, ['nav', 'gap-contents'], P('gap', 'contents-right'))
    put(t, ['nav', 'selected'], C('action', 'secondary-selected'))
    put(t, ['focus', 'ring'], C('border', 'primary'))
    put(t, ['focus', 'width'], P('border', 'width-focus'))
    return t


def write(name, tree):
    (OUT / name).write_text(json.dumps(tree, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def resolve_check(files):
    """Every {a.b.c} alias must point at a leaf of an earlier collection."""
    def leaves(tree, path=()):
        for k, v in tree.items():
            if isinstance(v, dict) and '$value' not in v:
                yield from leaves(v, path + (k,))
            elif isinstance(v, dict):
                yield '.'.join(path + (k,)), v
    known, bad, count = set(), [], 0
    for _, tree in files:
        names = dict(leaves(tree))
        for n, leaf in names.items():
            count += 1
            v = leaf['$value']
            if isinstance(v, str) and v.startswith('{') and v[1:-1] not in known:
                bad.append(f'{n} -> {v}')
        known |= set(names)
    return count, bad


def main():
    p = css_vars(ROOT / 'tokens/primitives.css')
    s = css_vars(ROOT / 'tokens/semantic.css')
    OUT.mkdir(exist_ok=True)
    prim, roles, params = primitives(p), color_roles(s), parameters(s)
    files = [('1-primitives.light.tokens.json', prim['light']),
             ('1-primitives.high-contrast.tokens.json', prim['high-contrast']),
             ('2-color.light.tokens.json', roles['light']),
             ('2-color.high-contrast.tokens.json', roles['high-contrast']),
             ('3-parameter.pc.tokens.json', params['pc']),
             ('3-parameter.mobile.tokens.json', params['mobile']),
             ('4-component.default.tokens.json', components())]
    # alias check per mode chain (light chain and high-contrast chain see the same names)
    chain = [files[0], files[2], files[4], files[6]]
    count, bad = resolve_check(chain)
    if bad:
        raise SystemExit('unresolved aliases:\n  ' + '\n  '.join(bad))
    for name, tree in files:
        write(name, tree)
    print(f'wrote {len(files)} files to tokens/figma/ ({count} variables in one mode chain, all aliases resolve)')


if __name__ == '__main__':
    main()
