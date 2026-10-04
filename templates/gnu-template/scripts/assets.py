#!/usr/bin/env python3
"""Verify packaged GNU originals; optionally download missing ones.

    python3 scripts/assets.py                     # 오프라인 검증(헤더·SHA-256)
    python3 scripts/assets.py --download          # manifest에 있으나 빠진 파일만 받기
    python3 scripts/assets.py --fetch-character   # 공식 캐릭터 페이지의 내려받기 파일 수집
    python3 scripts/assets.py --fetch-character --dry-run   # 받을 목록만 보기

Network access uses curl and only https://www.gnu.ac.kr. Existing files are never overwritten.
"""
import argparse
import concurrent.futures
import hashlib
import html
import json
import re
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlparse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'assets/manifest.json'
HOST = 'www.gnu.ac.kr'
ALLOWED_DIRS = (ROOT / 'assets/official', ROOT / 'assets/character/official')
# 대학 캐릭터(지누)·캐릭터 응용 디자인 공개 페이지. 메뉴 번호가 바뀌면 여기에 추가한다.
CHARACTER_PAGES = [
    'https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12102&cntntsId=5777',
    'https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12103&cntntsId=5778',
    'https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12101&cntntsId=5776',
    'https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12104&cntntsId=5779',
]
ASSET_EXT = ('.ai', '.pdf', '.png', '.jpg', '.jpeg', '.svg', '.zip', '.eps')
DOWNLOAD_HINT = re.compile(r'(?:/images/web/main/sub_cnt/|/upload/|[Ff]ile[Dd]own|download)', re.I)


def signature_ok(path):
    head = path.read_bytes()[:16]
    ext = path.suffix.lower()
    return ((ext in ('.ai', '.pdf', '.eps') and head.startswith((b'%PDF', b'%!', b'\xc5\xd0\xd3\xc6')))
            or (ext == '.png' and head.startswith(b'\x89PNG\r\n\x1a\n'))
            or (ext in ('.jpg', '.jpeg') and head.startswith(b'\xff\xd8\xff'))
            or (ext == '.zip' and head.startswith(b'PK\x03\x04'))
            or (ext == '.svg' and b'<svg' in path.read_bytes()[:4096]))


def inside_allowed(path):
    return any(path.is_relative_to(d) for d in ALLOWED_DIRS)


def curl(url, out, headers=None):
    parts = urlparse(url)
    if parts.scheme != 'https' or parts.hostname != HOST:
        raise ValueError('Only the official GNU HTTPS host is supported: ' + url)
    cmd = ['curl', '-sSL', '--fail', '--proto', '=https', '--proto-redir', '=https',
           '--max-time', '120', quote(url, safe=':/?=&%#'), '-o', str(out)]
    if headers:
        cmd[1:1] = ['-D', str(headers)]
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
                    downloaded_date=datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat())
    return item, 'ok'


def page_links(page_url):
    """Download links on an official page: (absolute URL, visible label)."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / 'page.html'
        curl(page_url, out)
        text = out.read_text(encoding='utf-8', errors='replace')
    found = []
    for m in re.finditer(r'<a\b[^>]*?href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', text, re.S | re.I):
        href, label = html.unescape(m.group(1)), re.sub(r'<[^>]+>|\s+', ' ', m.group(2)).strip()
        if href.startswith(('javascript:', '#', 'mailto:')):
            continue
        url = urljoin(page_url, href)
        path = unquote(urlparse(url).path).lower()
        if urlparse(url).hostname == HOST and (path.endswith(ASSET_EXT) or DOWNLOAD_HINT.search(url)) \
                and 'cntntsView.do' not in url:
            found.append((url, html.unescape(label)))
    seen, unique = set(), []
    for url, label in found:
        if url not in seen:
            seen.add(url)
            unique.append((url, label))
    return unique


def filename_for(url, headers_file):
    disposition = ''
    if headers_file.exists():
        for line in headers_file.read_text(errors='replace').splitlines():
            if line.lower().startswith('content-disposition'):
                disposition = line
    m = re.search(r"filename\*=(?:UTF-8|utf-8)''([^;\r\n]+)", disposition) or \
        re.search(r'filename="?([^";\r\n]+)"?', disposition)
    name = unquote(m.group(1)) if m else unquote(Path(urlparse(url).path).name)
    try:  # 일부 서버는 UTF-8 이름을 Latin-1로 보낸다.
        name = name.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    name = re.sub(r'[\\/:*?"<>|\x00-\x1f]', '_', name).strip(' .')
    return name or 'download.bin'


def fetch_character(manifest, dry_run):
    target = ROOT / 'assets/character/official'
    known = {i['url'] for i in manifest['items']}
    added, failures = 0, []
    for page in CHARACTER_PAGES:
        try:
            links = page_links(page)
        except Exception as exc:  # noqa: BLE001 - report and continue
            failures.append((page, f'페이지를 읽지 못함: {exc}'))
            continue
        print(f'{page}\n  내려받기 링크 {len(links)}개')
        for url, label in links:
            print(f'  - {label or "(이름 없음)"}: {url}')
            if dry_run or url in known:
                continue
            with tempfile.TemporaryDirectory() as tmp:
                body, headers = Path(tmp) / 'body', Path(tmp) / 'headers'
                try:
                    curl(url, body, headers)
                except subprocess.CalledProcessError as exc:
                    failures.append((url, 'download failed: ' + exc.stderr.decode(errors='replace').strip()))
                    continue
                name = filename_for(url, headers)
                path = target / name
                if path.suffix.lower() not in ASSET_EXT:
                    failures.append((url, f'허용하지 않는 형식: {name}'))
                    continue
                if path.exists():
                    print(f'    이미 있음: {path.name}')
                    continue
                path.parent.mkdir(parents=True, exist_ok=True)
                body.replace(path)
            if not signature_ok(path):
                path.unlink()
                failures.append((url, 'invalid signature (HTML 오류 페이지일 수 있음)'))
                continue
            manifest['items'].append({
                'path': path.relative_to(ROOT).as_posix(), 'url': url, 'source_page': page,
                'kind': 'character', 'label': label, 'original_filename': name,
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size,
                'downloaded_date': datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat()})
            known.add(url)
            added += 1
            print(f'    저장: {path.relative_to(ROOT)}')
    return added, failures


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--download', action='store_true', help='Download missing manifest files')
    parser.add_argument('--fetch-character', action='store_true', help='Collect official character files')
    parser.add_argument('--dry-run', action='store_true', help='With --fetch-character: list links only')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    failures = []
    if args.fetch_character:
        added, failures = fetch_character(manifest, args.dry_run)
        print(f'캐릭터 파일 {added}개 추가')

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
    if (args.download or args.fetch_character) and not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    total = len(manifest['items'])
    bad = sum(1 for w, _ in failures if not w.startswith('http'))
    print(f'{total - bad}/{total} assets verified')
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
