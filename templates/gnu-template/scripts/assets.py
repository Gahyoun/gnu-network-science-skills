#!/usr/bin/env python3
"""Verify packaged originals; optionally retrieve missing official files with curl."""
import argparse
import concurrent.futures
import hashlib
import json
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
import subprocess
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'assets/manifest.json'


def signature_ok(path):
    head = path.read_bytes()[:16]
    ext = path.suffix.lower()
    return ((ext in ('.ai', '.pdf') and head.startswith((b'%PDF', b'%!')))
            or (ext == '.png' and head.startswith(b'\x89PNG\r\n\x1a\n'))
            or (ext in ('.jpg', '.jpeg') and head.startswith(b'\xff\xd8\xff')))


def process(item, download):
    path = (ROOT / item['path']).resolve()
    if not path.is_relative_to(ROOT / 'assets/official'):
        raise ValueError('Asset path outside official directory')
    url = item['url']
    parts = urlparse(url)
    if parts.scheme != 'https' or parts.hostname != 'www.gnu.ac.kr':
        raise ValueError('Only the official GNU HTTPS host is supported')
    if not path.exists():
        if not download:
            return item, 'missing'
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + '.part')
        try:
            subprocess.run(['curl', '-sSL', '--fail', '--proto', '=https',
                            '--proto-redir', '=https', '--max-time', '60',
                            quote(url, safe=':/?=&%'), '-o', str(temporary)],
                           check=True, capture_output=True)
            # Validate the downloaded header using its original file extension.
            head = temporary.read_bytes()[:16]
            ext = path.suffix.lower()
            valid = ((ext in ('.ai', '.pdf') and head.startswith((b'%PDF', b'%!')))
                     or (ext == '.png' and head.startswith(b'\x89PNG\r\n\x1a\n'))
                     or (ext in ('.jpg', '.jpeg') and head.startswith(b'\xff\xd8\xff')))
            if not valid:
                raise ValueError('Unexpected file signature, possibly an HTML error page')
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
    if not signature_ok(path):
        return item, 'invalid signature'
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if item.get('sha256') and digest != item['sha256']:
        return item, 'checksum mismatch'
    if not item.get('sha256'):
        if not download:
            return item, 'checksum not recorded'
        item['sha256'] = digest
        item['bytes'] = path.stat().st_size
        item['downloaded_date'] = datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat()
    return item, 'ok'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true',
                        help='Download missing files; preserve existing originals')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    failures = []

    def checked(item):
        try:
            return process(item, args.download)
        except Exception as exc:
            return item, str(exc)

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        for item, status in executor.map(checked, manifest['items']):
            if status != 'ok':
                failures.append((item['path'], status))
                print(status + ': ' + item['path'])
    if args.download:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
                            encoding='utf-8')
    print(f"{len(manifest['items']) - len(failures)}/{len(manifest['items'])} assets verified")
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
