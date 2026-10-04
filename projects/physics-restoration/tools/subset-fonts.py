"""Optional authoring step: pip install fonttools brotli, then run this script.

The normal build uses committed WOFF2 files and needs no Python packages.
Modified font family names differ from the original reserved names (SIL OFL).
"""
import json
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
template = root.parent.parent / 'templates/gnu-template/assets/fonts'
text = ''.join(p.read_text() for p in [*root.glob('*.html'), root/'src/content.mjs', root/'assets/app.mjs', root/'tools/build.mjs'])
chars = set(map(ord, text)) | set(range(32, 127))
report = {'tool': 'fontTools 4.50.0 + Brotli 1.1.0', 'fonts': [],
          'hangulCodepoints': sorted(c for c in chars if 0xAC00 <= c <= 0xD7A3)}
for original, family in [('NotoSansKR-Variable.subset.woff2', 'PhysicaText'), ('SUITE-Variable.woff2', 'PhysicaTitle')]:
    source = template/original
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.flavor = 'woff2'
    options.hinting = False
    options.recalc_timestamp = False
    options.name_IDs = ['*']
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=chars)
    subsetter.subset(font)
    # Preserve copyright, attribution and license name records unchanged.
    names = {1: family, 2: 'Regular', 3: family+';2026;LessonSubset',
             4: family+' Regular', 6: family+'-Regular', 16: family, 17: 'Regular'}
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    destination = root/'assets/fonts'/f'{family}.woff2'
    font.flavor = 'woff2'
    font.save(destination)
    report['fonts'].append({'source': original, 'family': family,
        'sourceBytes': source.stat().st_size, 'subsetBytes': destination.stat().st_size})
(root/'docs/font-report.json').write_text(json.dumps(report, indent=2)+'\n')
before = sum(f['sourceBytes'] for f in report['fonts'])
after = sum(f['subsetBytes'] for f in report['fonts'])
print(f'Local text fonts: {before:,} → {after:,} bytes ({1-after/before:.1%} smaller).')
