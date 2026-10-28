#!/usr/bin/env python3
"""Verify packaged GNU originals; optionally download missing ones.

    python3 scripts/assets.py                     # 오프라인 검증(헤더·SHA-256)
    python3 scripts/assets.py --download          # manifest에 있으나 빠진 파일만 받기

Network access uses curl and only https://www.gnu.ac.kr. Existing files are never overwritten.
"""
import argparse
import concurrent.futures
import hashlib
import json
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'assets/manifest.json'
HOST = 'www.gnu.ac.kr'
def today_kst():
    # 고정 UTC+9: Windows에서 tzdata 없이도 동작한다.
    return datetime.now(timezone(timedelta(hours=9))).date().isoformat()


OFFICIAL = ROOT / 'assets/official'


def signature_ok(path):
    head = path.read_bytes()[:16]
    ext = path.suffix.lower()
    return ((ext in ('.ai', '.pdf', '.eps') and head.startswith((b'%PDF', b'%!', b'\xc5\xd0\xd3\xc6')))
            or (ext == '.png' and head.startswith(b'\x89PNG\r\n\x1a\n'))
            or (ext in ('.jpg', '.jpeg') and head.startswith(b'\xff\xd8\xff'))
            or (ext == '.zip' and head.startswith(b'PK\x03\x04'))
            or (ext == '.svg' and b'<svg' in path.read_bytes()[:4096]))


def inside_allowed(path):
    return path.is_relative_to(OFFICIAL)


def curl(url, out):
    parts = urlparse(url)
    if parts.scheme != 'https' or parts.hostname != HOST:
        raise ValueError('Only the official GNU HTTPS host is supported: ' + url)
    cmd = ['curl', '-sSL', '--fail', '--proto', '=https', '--proto-redir', '=https',
           '--max-time', '120', quote(url, safe=':/?=&%#'), '-o', str(out)]
    subprocess.run(cmd, check=True, capture_output=True)


def process(item, download):
    path = (ROOT / item['path']).resolve()
    if not inside_allowed(path):
        raise ValueError('Asset path outside official directories')
    if not path.exists():
        if not download:
            return item, 'missing'
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + '.part')
        try:
            curl(item['url'], temporary)
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
    if not signature_ok(path):
        return item, 'invalid signature (HTML 오류 페이지일 수 있음)'
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if item.get('sha256') and digest != item['sha256']:
        return item, 'checksum mismatch'
    if not item.get('sha256'):
        if not download:
            return item, 'checksum not recorded'
        item.update(sha256=digest, bytes=path.stat().st_size,
                    downloaded_date=today_kst())
    return item, 'ok'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--download', action='store_true', help='Download missing manifest files')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    failures = []

    def checked(item):
        try:
            return process(item, args.download)
        except Exception as exc:  # noqa: BLE001
            return item, str(exc)

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        for item, status in executor.map(checked, manifest['items']):
            if status != 'ok':
                failures.append((item['path'], status))
    for where, status in failures:
        print(f'{status}: {where}')
    if args.download:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    total = len(manifest['items'])
    print(f'{total - len(failures)}/{total} assets verified')
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
