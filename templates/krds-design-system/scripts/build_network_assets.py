#!/usr/bin/env python3
"""Network motif and network-style QR code in GNU colours.

    pip install segno pillow opencv-python-headless
    python3 scripts/build_network_assets.py [URL]

Writes assets/network/:
    motif.svg, motif-dark.svg     the lab mark (10 nodes, 7 edges) in GNU Blue nodes + black/white edges
    motif.html                    the mark as a standalone HTML asset (light/dark, hover highlights a node's edges)
    qr-network.svg / .png         QR whose dark modules are nodes and whose 4-neighbour contacts are edges
    qr-network-dark.svg / .png    the same on black
and decodes each PNG with OpenCV; exits non-zero if a code does not read back the URL.

The motif geometry is the lab mark from lshlj82.github.io (viewBox 512 x 386), recoloured:
nodes GNU Blue #009EDB (VI BS13), edges black (#131416 = KRDS gray-95) on light, white on dark.
"""
import math
import sys
from pathlib import Path

import segno
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/network'
URL = sys.argv[1] if len(sys.argv) > 1 else 'https://lshlj82.github.io/'

BLUE = '#009edb'      # GNU Blue, graphics only
BLUE_DARK = '#007eb0' # primary-50, used where a module must read as dark (finder eyes)
INK = '#131416'       # gray-95
PAPER = '#ffffff'
NIGHT = '#0a0c0d'

# lab mark: node centres (r = 18.5) and edges as node-index pairs
NODES = [(195.0, 25.3), (297.5, 110.6), (126.8, 144.7), (382.7, 196.0), (160.8, 247.1),
         (41.4, 247.2), (263.5, 247.3), (485.3, 247.3), (195.0, 349.6), (365.7, 366.7)]
EDGES = [(0, 4), (0, 9), (1, 5), (2, 3), (3, 6), (6, 7), (6, 8)]
R_NODE = 18.5

# QR geometry in module units: node radius = BASE + STEP*degree, edge width, finder ring width
Q_BASE, Q_STEP, Q_EDGE, Q_RING, Q_RING_NODE, Q_HUB = 0.40, 0.025, 0.50, 1.0, 0.56, 1.5


# ---------------------------------------------------------------- motif -----------------

def motif_svg(edge=INK, node=BLUE, bg=None, pad=24):
    xs = [x for x, _ in NODES]
    ys = [y for _, y in NODES]
    x0, y0 = min(xs) - R_NODE - pad, min(ys) - R_NODE - pad
    w, h = max(xs) - min(xs) + 2 * (R_NODE + pad), max(ys) - min(ys) + 2 * (R_NODE + pad)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}" '
           f'role="img" aria-label="Network Science Lab mark">']
    if bg:
        out.append(f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>')
    out.append(f'<g stroke="{edge}" stroke-width="4" stroke-linecap="round">')
    for a, b in EDGES:
        (ax, ay), (bx, by) = NODES[a], NODES[b]
        out.append(f'<line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}"/>')
    out.append(f'</g><g fill="{node}">')
    for x, y in NODES:
        out.append(f'<circle cx="{x}" cy="{y}" r="{R_NODE}"/>')
    out.append('</g></svg>')
    return '\n'.join(out)


MOTIF_HTML = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Network Motif</title>
<style>
  :root { --gnu-blue: #009edb; --edge: #131416; --bg: #ffffff; --muted: #6d7882; }
  @media (prefers-color-scheme: dark) { :root { --edge: #f4f5f6; --bg: #0a0c0d; --muted: #8a949e; } }
  html, body { margin: 0; background: var(--bg); color: var(--edge);
    font: 400 15px/1.5 'Pretendard GOV', 'Pretendard', 'Noto Sans KR', -apple-system, sans-serif; }
  main { min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box; }
  figure { margin: 0; width: min(560px, 100%); }
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  .e { stroke: var(--edge); stroke-width: 4; stroke-linecap: round; transition: stroke .2s, stroke-width .2s; }
  .n { fill: var(--gnu-blue); transition: transform .2s; transform-box: fill-box; transform-origin: center; cursor: pointer; }
  .n:hover, .n:focus-visible { transform: scale(1.18); outline: none; }
  .e.on { stroke: var(--gnu-blue); stroke-width: 6; }
  figcaption { margin-top: 12px; color: var(--muted); font-size: 13px; text-align: center; }
  @media (prefers-reduced-motion: no-preference) {
    .n { animation: breathe 4s ease-in-out infinite; animation-delay: calc(var(--i) * -0.4s); }
    @keyframes breathe { 50% { transform: scale(1.06); } }
  }
</style>
</head>
<body>
<main>
<figure>
<svg viewBox="__VIEWBOX__" role="img" aria-label="Network Science Lab mark: 10 nodes, 7 edges">
__EDGES__
__NODES__
</svg>
<figcaption>GNU Blue #009EDB 노드 · 검정 엣지 — 노드에 마우스를 올리면 연결된 엣지가 표시됨</figcaption>
</figure>
</main>
<script>
  const edges = [...document.querySelectorAll('.e')];
  document.querySelectorAll('.n').forEach(n => {
    const on = v => edges.forEach(e => e.classList.toggle('on', v && e.dataset.ends.split(' ').includes(n.dataset.id)));
    ['mouseenter', 'focus'].forEach(t => n.addEventListener(t, () => on(true)));
    ['mouseleave', 'blur'].forEach(t => n.addEventListener(t, () => on(false)));
  });
</script>
</body>
</html>
'''


def motif_html():
    vb = motif_svg().split('viewBox="')[1].split('"')[0]
    edges = '\n'.join(f'<line class="e" data-ends="{a} {b}" x1="{NODES[a][0]}" y1="{NODES[a][1]}" '
                      f'x2="{NODES[b][0]}" y2="{NODES[b][1]}"/>' for a, b in EDGES)
    nodes = '\n'.join(f'<circle class="n" tabindex="0" data-id="{i}" style="--i:{i}" cx="{x}" cy="{y}" r="{R_NODE}"/>'
                      for i, (x, y) in enumerate(NODES))
    return MOTIF_HTML.replace('__VIEWBOX__', vb).replace('__EDGES__', edges).replace('__NODES__', nodes)


# ---------------------------------------------------------------- QR --------------------

def qr_graph(url):
    qr = segno.make(url, error='h', micro=False, boost_error=False)
    m = [[bool(v) for v in row] for row in qr.matrix]
    n = len(m)
    finders = [(0, 0), (0, n - 7), (n - 7, 0)]

    def in_finder(r, c):
        return any(fr <= r < fr + 7 and fc <= c < fc + 7 for fr, fc in finders)

    # clear a centre window for the mark (H level tolerates ~30 %; keep ~9 % of modules)
    k = max(7, (round(n * 0.3) // 2) * 2 + 1)
    c0 = (n - k) // 2
    hole = (c0, c0 + k)

    def in_hole(r, c):
        return hole[0] <= r < hole[1] and hole[0] <= c < hole[1]

    dark = {(r, c) for r in range(n) for c in range(n) if m[r][c] and not in_finder(r, c) and not in_hole(r, c)}
    edges = [((r, c), (r + dr, c + dc)) for r, c in dark for dr, dc in ((0, 1), (1, 0)) if (r + dr, c + dc) in dark]
    deg = {p: 0 for p in dark}
    for a, b in edges:
        deg[a] += 1
        deg[b] += 1
    return qr, n, finders, hole, dark, edges, deg


def qr_svg(url, ink, eye, bg, quiet=4, mod=10):
    qr, n, finders, hole, dark, edges, deg = qr_graph(url)
    size = (n + 2 * quiet) * mod
    o = quiet * mod
    P = lambda rc: (o + (rc[1] + 0.5) * mod, o + (rc[0] + 0.5) * mod)
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}" '
         f'role="img" aria-label="QR code: {url}">', f'<rect width="{size}" height="{size}" fill="{bg}"/>']
    # edges
    s.append(f'<g stroke="{ink}" stroke-width="{Q_EDGE * mod:.2f}" stroke-linecap="round">')
    for a, b in edges:
        (x1, y1), (x2, y2) = P(a), P(b)
        s.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    s.append(f'</g><g fill="{ink}">')
    # nodes: radius grows with degree, like a hub
    for p in dark:
        x, y = P(p)
        r = (Q_BASE + Q_STEP * deg[p]) * mod
        s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}"/>')
    s.append('</g>')
    # finder patterns as ring networks: 24 nodes on the 7x7 border joined in a cycle + a blue hub
    for fr, fc in finders:
        ring = [(fr, fc + i) for i in range(7)] + [(fr + i, fc + 6) for i in range(1, 7)] + \
               [(fr + 6, fc + 5 - i) for i in range(6)] + [(fr + 5 - i, fc) for i in range(5)]
        pts = [P(p) for p in ring]
        d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ' Z'
        s.append(f'<path d="{d}" fill="none" stroke="{ink}" stroke-width="{Q_RING * mod:.2f}" stroke-linejoin="round"/>')
        for x, y in pts:
            s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{Q_RING_NODE * mod:.2f}" fill="{ink}"/>')
        cx, cy = P((fr + 3, fc + 3))
        s.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{Q_HUB * mod:.2f}" fill="{eye}"/>')
    # centre: the lab mark
    a, b = hole
    side = (b - a) * mod
    gx, gy = o + a * mod, o + a * mod
    xs = [x for x, _ in NODES]
    ys = [y for _, y in NODES]
    w, h = max(xs) - min(xs) + 2 * R_NODE, max(ys) - min(ys) + 2 * R_NODE
    sc = (side * 0.84) / max(w, h)
    tx = gx + (side - w * sc) / 2 - (min(xs) - R_NODE) * sc
    ty = gy + (side - h * sc) / 2 - (min(ys) - R_NODE) * sc
    s.append(f'<g transform="translate({tx:.2f} {ty:.2f}) scale({sc:.4f})">')
    s.append(f'<g stroke="{ink}" stroke-width="7" stroke-linecap="round">')
    for i, j in EDGES:
        s.append(f'<line x1="{NODES[i][0]}" y1="{NODES[i][1]}" x2="{NODES[j][0]}" y2="{NODES[j][1]}"/>')
    s.append(f'</g><g fill="{BLUE}">' + ''.join(f'<circle cx="{x}" cy="{y}" r="{R_NODE + 4}"/>' for x, y in NODES))
    s.append('</g></g></svg>')
    return '\n'.join(s), (n, size, url)


def render_png(url, ink, eye, bg, path, quiet=4, mod=10, ss=4):
    """Raster the same geometry with PIL (supersampled) so OpenCV can read it."""
    qr, n, finders, hole, dark, edges, deg = qr_graph(url)
    M = mod * ss
    size = (n + 2 * quiet) * M
    o = quiet * M
    im = Image.new('RGB', (size, size), bg)
    dr = ImageDraw.Draw(im)
    P = lambda rc: (o + (rc[1] + 0.5) * M, o + (rc[0] + 0.5) * M)
    circ = lambda x, y, r, f: dr.ellipse([x - r, y - r, x + r, y + r], fill=f)
    for a, b in edges:
        dr.line([P(a), P(b)], fill=ink, width=round(Q_EDGE * M))
    for p in dark:
        circ(*P(p), (Q_BASE + Q_STEP * deg[p]) * M, ink)
    for fr, fc in finders:
        ring = [(fr, fc + i) for i in range(7)] + [(fr + i, fc + 6) for i in range(1, 7)] + \
               [(fr + 6, fc + 5 - i) for i in range(6)] + [(fr + 5 - i, fc) for i in range(5)]
        pts = [P(p) for p in ring]
        dr.line(pts + [pts[0]], fill=ink, width=round(Q_RING * M), joint='curve')
        for x, y in pts:
            circ(x, y, Q_RING_NODE * M, ink)
        circ(*P((fr + 3, fc + 3)), Q_HUB * M, eye)
    a, b = hole
    side = (b - a) * M
    gx = gy = o + a * M
    xs = [x for x, _ in NODES]
    ys = [y for _, y in NODES]
    w, h = max(xs) - min(xs) + 2 * R_NODE, max(ys) - min(ys) + 2 * R_NODE
    sc = (side * 0.84) / max(w, h)
    T = lambda x, y: (gx + (side - w * sc) / 2 + (x - min(xs) + R_NODE) * sc,
                      gy + (side - h * sc) / 2 + (y - min(ys) + R_NODE) * sc)
    for i, j in EDGES:
        dr.line([T(*NODES[i]), T(*NODES[j])], fill=ink, width=max(1, round(7 * sc)))
    for x, y in NODES:
        circ(*T(x, y), (R_NODE + 4) * sc, BLUE)
    im = im.resize((size // ss, size // ss), Image.LANCZOS)
    im.save(path)
    return path


def decode(path):
    import cv2
    img = cv2.imread(str(path))
    results = []
    for scale in (1.0, 0.5, 0.35):
        im = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale != 1 else img
        text, *_ = cv2.QRCodeDetector().detectAndDecode(im)
        if not text and hasattr(cv2, 'QRCodeDetectorAruco'):
            text, *_ = cv2.QRCodeDetectorAruco().detectAndDecode(im)
        results.append((scale, text))
    return results


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'motif.svg').write_text(motif_svg(), encoding='utf-8')
    (OUT / 'motif-dark.svg').write_text(motif_svg(edge='#f4f5f6', bg=NIGHT), encoding='utf-8')
    (OUT / 'motif.html').write_text(motif_html(), encoding='utf-8')
    ok = True
    for name, ink, eye, bg in (('qr-network', INK, BLUE_DARK, PAPER), ('qr-network-dark', '#f4f5f6', BLUE, NIGHT)):
        svg, (n, size, url) = qr_svg(URL, ink, eye, bg)
        (OUT / f'{name}.svg').write_text(svg, encoding='utf-8')
        png = render_png(URL, ink, eye, bg, OUT / f'{name}.png')
        if bg == NIGHT:  # most phone readers handle inverted codes; check on an inverted copy too
            from PIL import ImageOps
            ImageOps.invert(Image.open(png).convert('RGB')).save(OUT / '_inv.png')
            res = decode(OUT / '_inv.png')
            (OUT / '_inv.png').unlink()
        else:
            res = decode(png)
        good = all(t == URL for _, t in res)
        ok &= good
        print(f'{name}: version {(n - 17) // 4} ({n}x{n}), {size}px  decode ' +
              ', '.join(f'{s}x={"ok" if t == URL else repr(t)}' for s, t in res))
    print('URL:', URL)
    if not ok:
        raise SystemExit('a QR code did not decode')


if __name__ == '__main__':
    main()
