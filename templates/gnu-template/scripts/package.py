#!/usr/bin/env python3
"""Zip this skill folder for upload (e.g. Claude 웹앱 스킬, 다른 사람에게 전달).

    python3 scripts/package.py            # dist/gnu-template.zip (전체)
    python3 scripts/package.py --lite     # Illustrator·캐릭터 원본과 예시 PDF·PNG 제외

ZIP 최상위에 gnu-template/SKILL.md가 오도록 만든다.
"""
import argparse
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {'node_modules', 'out', 'dist', '__pycache__', '.git'}
SKIP_FILES = {'.DS_Store'}


def wanted(path, lite):
    rel = path.relative_to(ROOT)
    if any(part in SKIP_DIRS for part in rel.parts) or path.name in SKIP_FILES:
        return False
    if lite:
        if rel.parts[:2] == ('assets', 'official') and path.suffix.lower() in ('.ai', '.jpg', '.pdf'):
            return False
        if rel.parts[:3] == ('assets', 'character', 'official') and path.name != '.gitkeep':
            return False
        if rel.parts[0] == 'examples' and path.suffix.lower() in ('.pdf', '.png'):
            return False
    return True


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--lite', action='store_true')
    p.add_argument('--output', type=Path)
    a = p.parse_args()
    out = a.output or ROOT / 'dist' / ('gnu-template-lite.zip' if a.lite else 'gnu-template.zip')
    out.parent.mkdir(parents=True, exist_ok=True)
    files = sorted(f for f in ROOT.rglob('*') if f.is_file() and wanted(f, a.lite))
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in files:
            z.write(f, Path('gnu-template') / f.relative_to(ROOT))
    size = out.stat().st_size / 1024 / 1024
    print(f'{out} · 파일 {len(files)}개 · {size:.1f}MB')


if __name__ == '__main__':
    main()
