#!/usr/bin/env python3
"""Cut one finished mark out of an official PDF sheet as a standalone SVG.

The vector paths come from `pdftocairo -svg` unchanged. Only elements whose
bounding box lies inside the crop are kept, so guide text, other variants and
construction lines on the same sheet are dropped. Colors converted by the PDF
colour pipeline are mapped back to the published RGB values of BS13.
"""
import argparse
import copy
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import svgelements
except ImportError as exc:  # pragma: no cover - optional maintainer tool
    raise SystemExit('pip install svgelements 가 필요합니다.') from exc

ROOT = Path(__file__).resolve().parents[1]
SVG = 'http://www.w3.org/2000/svg'
XLINK = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', XLINK)

# name: (source PDF, crop x, y, width, height in PDF points, note)
PRESETS = {
    'fly-with-gnu': ('assets/official/(원형)GNU 엠블럼_서식(안내문).pdf',
                     75, 10, 230, 55, '공식 안내문 서식 상단의 FLY WITH GNU 로고타이프'),
    'gnu-signature': ('assets/official/BS08-signature-sheet.pdf',
                      105, 605, 400, 75, 'BS08 국영문 가로조합 시그니처'),
    'gnu-symbol': ('assets/official/BS08-signature-sheet.pdf',
                   105, 610, 200, 70, 'BS08 국영문 가로조합의 심벌 부분'),
    'emblem-signature-white': ('assets/official/(원형)GNU 엠블럼_서식(안내문).pdf',
                               955, 750, 185, 58, '공식 안내문 서식 하단의 흰색 엠블럼 국영문 조합'),
}

# BS13 published RGB. Keys are the colours pdftocairo produces for those inks.
OFFICIAL_RGB = {
    'blue': '#009EDB',
    'grey': '#43525A',
}


def rgb_of(value):
    m = re.match(r'rgb\(([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)%\)', value or '')
    if not m:
        return None
    return tuple(round(float(v) * 2.55) for v in m.groups())


def official_colour(rgb):
    """Map near-blue / near-grey ink to BS13; leave anything else alone."""
    r, g, b = rgb
    if b > 150 and r < 40 and 120 < g < 175:
        return OFFICIAL_RGB['blue']
    if abs(r - g) < 20 and abs(g - b) < 20 and 50 < r < 100:
        return OFFICIAL_RGB['grey']
    return None


KEEP_STROKES = False  # presets: stroke-only paths on VI sheets are construction guides


def bbox_of(element, defs, ancestors=()):
    """Bounding box of `element` in page coordinates, honouring parent groups."""
    doc = ET.Element('{%s}svg' % SVG)
    doc.append(copy.deepcopy(defs))
    parent = doc
    for shell in ancestors:
        clone = ET.SubElement(parent, shell.tag, dict(shell.attrib))
        parent = clone
    parent.append(copy.deepcopy(element))
    with tempfile.NamedTemporaryFile('w', suffix='.svg', delete=False) as handle:
        handle.write(ET.tostring(doc, encoding='unicode'))
        name = handle.name
    try:
        parsed = svgelements.SVG.parse(name)
        boxes = [e.bbox() for e in parsed.elements()
                 if isinstance(e, svgelements.Shape) and (KEEP_STROKES or painted(e))]
    finally:
        Path(name).unlink()
    boxes = [b for b in boxes if b]
    if not boxes:
        return None
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def painted(shape):
    # Official marks are filled shapes; stroke-only paths on sheets are guides.
    return shape.fill is not None and shape.fill.value is not None and shape.fill.alpha > 0


def is_guide(element):
    return element.get('fill') == 'none' and element.get('stroke') not in (None, 'none')


def select(element, defs, crop, ancestors=()):
    """Return a copy of the parts of `element` that lie fully inside crop."""
    x, y, w, h = crop
    if not KEEP_STROKES and is_guide(element):
        return None
    box = bbox_of(element, defs, ancestors)
    if box is None:
        return None
    if box[0] >= x - .5 and box[1] >= y - .5 and box[2] <= x + w + .5 and box[3] <= y + h + .5:
        return copy.deepcopy(element)
    if element.tag != '{%s}g' % SVG:
        return None
    shell = ET.Element(element.tag, dict(element.attrib))
    for child in list(element):
        kept = select(child, defs, crop, ancestors + (element,))
        if kept is not None:
            shell.append(kept)
    return shell if len(shell) else None


def prune_defs(defs, body):
    """Keep only definitions referenced (directly or indirectly) by body."""
    by_id = {}
    for node in defs.iter():
        if node.get('id'):
            by_id[node.get('id')] = node
    refs = re.compile(r'(?:url\(#|#)([\w.-]+)')
    wanted, queue = set(), refs.findall(body)
    while queue:
        ref = queue.pop()
        if ref in wanted or ref not in by_id:
            continue
        wanted.add(ref)
        queue.extend(refs.findall(ET.tostring(by_id[ref], encoding='unicode')))
    pruned = ET.Element(defs.tag)
    for child in defs:
        ids = {n.get('id') for n in child.iter() if n.get('id')}
        if ids & wanted:
            pruned.append(child)
    return pruned


def derive(pdf, x, y, w, h, map_colours=True):
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / 'page.svg'
        subprocess.run(['pdftocairo', '-svg', str(pdf), str(out)], check=True)
        tree = ET.parse(out)
    root = tree.getroot()
    defs = root.find('{%s}defs' % SVG)
    if defs is None:
        defs = ET.Element('{%s}defs' % SVG)
    keep = []
    for child in list(root):
        if child.tag == '{%s}defs' % SVG:
            continue
        kept = select(child, defs, (x, y, w, h))
        if kept is not None:
            keep.append(kept)
    if not keep:
        raise SystemExit('선택 영역 안에 도안이 없습니다. 좌표를 확인하세요.')
    # Tight viewBox: the crop only selects, the mark's own extent sets the size.
    boxes = [bbox_of(k, defs) for k in keep]
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    w, h = round(x1 - x0, 3), round(y1 - y0, 3)
    result = ET.Element('{%s}svg' % SVG, {
        'width': f'{w}pt', 'height': f'{h}pt',
        'viewBox': f'{round(x0, 3)} {round(y0, 3)} {w} {h}'})
    body = ''.join(ET.tostring(k, encoding='unicode') for k in keep)
    result.append(prune_defs(defs, body))
    result.extend(keep)
    text = ET.tostring(result, encoding='unicode')
    if map_colours:
        def swap(match):
            rgb = rgb_of(match.group(2))
            mapped = official_colour(rgb) if rgb else None
            return f'{match.group(1)}="{mapped}"' if mapped else match.group(0)
        text = re.sub(r'(fill|stroke)="(rgb\([^)]*\))"', swap, text)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + text + '\n'


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='예) 캐릭터 AI에서 한 자세만 SVG로:\n'
               '  python3 scripts/derive_svg.py --source "assets/character/official/지누.ai" --preview out/jinu.png\n'
               '  (PNG의 픽셀 좌표 = PDF pt 좌표. 원하는 도안을 감싸는 영역을 확인한 뒤)\n'
               '  python3 scripts/derive_svg.py --source "assets/character/official/지누.ai" '
               '--crop 40 60 180 220 --output assets/character/derived/jinu-basic.svg')
    parser.add_argument('preset', nargs='?', choices=sorted(PRESETS), help='수록된 학교 로고 출력 사본')
    parser.add_argument('--source', type=Path, help='임의의 AI(PDF 호환)·PDF 파일')
    parser.add_argument('--crop', type=float, nargs=4, metavar=('X', 'Y', 'W', 'H'), help='선택 영역(pt)')
    parser.add_argument('--preview', type=Path, help='--source 첫 쪽을 72dpi PNG로 저장해 좌표 확인')
    parser.add_argument('--output', type=Path)
    parser.add_argument('--keep-pdf-colours', action='store_true', help='프리셋에서도 PDF 변환색 유지')
    args = parser.parse_args()
    if args.source:
        source = args.source if args.source.is_absolute() else Path.cwd() / args.source
        if args.preview:
            args.preview.parent.mkdir(parents=True, exist_ok=True)
            stem = args.preview.with_suffix('')
            subprocess.run(['pdftoppm', '-r', '72', '-png', '-f', '1', '-l', '1', '-singlefile',
                            str(source), str(stem)], check=True)
            print(stem.with_suffix('.png'))
            return
        if not args.crop or not args.output:
            parser.error('--source에는 --preview 또는 --crop과 --output이 필요합니다.')
        # 캐릭터·기타 도안은 선(stroke)도 그림의 일부이고, 색도 원본 그대로 둔다.
        global KEEP_STROKES
        KEEP_STROKES = True
        svg = derive(source, *args.crop, map_colours=False)
        out = args.output
    elif args.preset:
        source, x, y, w, h, _ = PRESETS[args.preset]
        svg = derive(ROOT / source, x, y, w, h, not args.keep_pdf_colours)
        out = args.output or ROOT / 'assets/derived' / f'{args.preset}.svg'
    else:
        parser.error('preset 또는 --source가 필요합니다.')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(svg, encoding='utf-8')
    print(out)


if __name__ == '__main__':
    main()
