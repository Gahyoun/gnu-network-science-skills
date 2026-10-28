#!/usr/bin/env node
// Export a GNU template HTML as HTML + vector PDF + PNG, after layout checks.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); }
catch { throw new Error('Playwright가 필요합니다. 템플릿 폴더에서 npm install 후 npx playwright install chromium을 실행하세요.'); }

const [inputArg, outputArg, ...flags] = process.argv.slice(2);
if (!inputArg || flags.some(f => !/^--scale=[1-3](?:\.\d+)?$/.test(f)))
  throw new Error('사용법: node scripts/export.mjs 입력.html 출력폴더 [--scale=1|2|3]');
const input = path.resolve(inputArg);
const output = path.resolve(outputArg || path.join(path.dirname(input), 'export'));
const scale = Number((flags.find(f => f.startsWith('--scale=')) || '--scale=1').split('=')[1]);
await fs.mkdir(output, {recursive: true});
const stem = path.basename(input, '.html');
const original = await fs.readFile(input, 'utf8');
if (!original.includes('<meta name="gnu-template-kind"'))
  throw new Error('GNU 템플릿 HTML의 매체 정보가 없습니다. meta name="gnu-template-kind"를 유지하세요.');

const launch = {headless: true};
if (process.env.GNU_BROWSER_PATH) launch.executablePath = process.env.GNU_BROWSER_PATH;
else if (process.env.GNU_BROWSER_CHANNEL) launch.channel = process.env.GNU_BROWSER_CHANNEL;
const browser = await chromium.launch(launch);
try {
  const page = await browser.newPage({viewport: {width: 1360, height: 1000}, deviceScaleFactor: scale});
  const external = [];
  await page.route('**/*', route => {
    if (/^https?:/.test(route.request().url())) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto(pathToFileURL(input).href, {waitUntil: 'load'});
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { await Promise.all([...document.images].map(im => im.decode().catch(() => {}))); });
  if (external.length) throw new Error('외부 리소스가 있습니다. 폰트·그림을 로컬에 포함하세요: ' + external.join(', '));
  const broken = await page.locator('img').evaluateAll(ims => ims.filter(i => !i.complete || !i.naturalWidth).map(i => i.alt || i.className));
  if (broken.length) throw new Error('이미지 로드 실패: ' + broken.join(', '));
  const fonts = await page.evaluate(() => [...document.fonts].map(f => `${f.family.replace(/"/g, '')}:${f.status}`));
  const failedFonts = fonts.filter(f => f.endsWith(':error'));
  if (failedFonts.length) throw new Error('서체를 불러오지 못했습니다(대체 서체로 출력됨): ' + failedFonts.join(', ') +
    '. --fonts embed로 다시 빌드하거나 HTML을 템플릿 폴더 안에 두세요.');
  const kind = await page.locator('meta[name="gnu-template-kind"]').getAttribute('content');
  const printed = kind === 'web' ? page.locator('body') : page.locator('[data-export-page]');
  const count = await printed.count();
  if (!count) throw new Error('출력 페이지가 없습니다.');

  const sizes = [];
  for (let i = 0; i < count; i++) {
    const node = printed.nth(i);
    const bounds = await node.boundingBox();
    if (bounds.width * scale > 12000 || bounds.height * scale > 18000) throw new Error('PNG가 너무 큽니다. 배율을 줄이세요.');
    // Geometry checks only: text clipped, text past the page, images over text.
    const issues = await node.evaluate((el, isWeb) => {
      const page = el.getBoundingClientRect();
      const bad = [];
      const texts = [...el.querySelectorAll('h1,h2,h3,p,dd,dt,li,td,th,figcaption,.band-meta,.identity .unit')]
        .filter(n => n.offsetParent !== null && n.textContent.trim());
      for (const n of texts) {
        const r = n.getBoundingClientRect();
        if (n.scrollWidth > n.clientWidth + 2) bad.push('가로 넘침: ' + n.textContent.trim().slice(0, 50));
        if (!isWeb && (r.bottom > page.bottom + 1 || r.right > page.right + 1)) bad.push('페이지 밖: ' + n.textContent.trim().slice(0, 50));
      }
      if (!isWeb && el.scrollHeight > el.clientHeight + 2) bad.push('지정된 종이 높이 초과: 내용을 줄이거나 페이지를 나누세요.');
      // A region can overflow into the footer while the page itself still fits.
      if (!isWeb) for (const box of el.querySelectorAll('.sheet-body,.poster-column,.slide .two-column,.cover-body')) {
        if (box.scrollHeight > box.clientHeight + 2) bad.push(`본문 영역 넘침(${box.className}): 내용을 줄이거나 쪽을 나누세요.`);
      }
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const pictures = [...el.querySelectorAll('img.logo,img.slogan,img.decoration-image,img.qr-image,img.figure-image')]
        .filter(im => im.offsetParent !== null);
      for (const im of pictures) {
        const r = im.getBoundingClientRect();
        for (const n of texts) {
          if (im.closest('.identity') && n.closest('.identity')) continue;
          if (im.closest('.qr') && n.closest('.qr')) continue;
          if (n.contains(im)) continue;
          // Compare with the glyph boxes, not the block box: a short line in a full-width <p> leaves the right side free.
          const range = document.createRange(); range.selectNodeContents(n);
          if ([...range.getClientRects()].some(t => t.width > 0 && hit(r, t)))
            bad.push(`그림이 글자를 가림(${im.className}): ` + n.textContent.trim().slice(0, 40));
        }
        for (const other of pictures) {
          if (other !== im && im.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING && hit(r, other.getBoundingClientRect()))
            bad.push(`그림끼리 겹침: ${im.className} / ${other.className}`);
        }
      }
      return [...new Set(bad)];
    }, kind === 'web');
    if (issues.length) throw new Error('배치 확인 실패\n- ' + issues.join('\n- '));
    const png = path.join(output, stem + (count > 1 ? '-' + String(i + 1).padStart(2, '0') : '') + '.png');
    const box = await node.boundingBox();  // after scroll; rounded so 1280×720 stays 1280×720
    const x = Math.round(box.x), y = Math.round(box.y);
    await page.screenshot({path: png, fullPage: true,
      clip: {x, y, width: Math.round(box.x + box.width) - x, height: Math.round(box.y + box.height) - y}});
    const head = await fs.readFile(png);  // report the PNG's real size, not the CSS box
    sizes.push({file: path.basename(png), width: head.readUInt32BE(16), height: head.readUInt32BE(20)});
  }
  const pdf = path.join(output, stem + '.pdf');
  await page.emulateMedia({media: 'print'});
  await page.pdf({path: pdf, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false});
  // The saved HTML must open on another PC: inline fonts and local images referenced by relative path.
  const MIME = {'.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif'};
  const local = new Map();
  for (const m of original.matchAll(/url\((['"]?)([^'")]+)\1\)|<img\b[^>]*?\ssrc=(["'])([^"']+)\3/g)) {
    const ref = m[2] || m[4];
    if (/^(data:|https?:|#|\/\/)/i.test(ref)) continue;
    const type = MIME[path.extname(ref.split(/[?#]/)[0]).toLowerCase()];
    if (!type) continue;
    const file = path.resolve(path.dirname(input), decodeURIComponent(ref.split(/[?#]/)[0]));
    const data = await fs.readFile(file).catch(() => null);
    if (!data) throw new Error('HTML에 넣을 로컬 파일을 읽지 못했습니다: ' + ref);
    local.set(ref, `data:${type};base64,${data.toString('base64')}`);
  }
  let portable = original;
  for (const [ref, uri] of local) {
    portable = portable.split(`url('${ref}')`).join(`url('${uri}')`).split(`url("${ref}")`).join(`url("${uri}")`)
      .split(`url(${ref})`).join(`url(${uri})`).split(`src="${ref}"`).join(`src="${uri}"`).split(`src='${ref}'`).join(`src='${uri}'`);
  }
  const html = path.join(output, stem + '.html');
  // Same folder as the input: replace it with the self-contained version (content unchanged).
  if (html !== input || portable !== original) await fs.writeFile(html, portable, 'utf8');
  console.log(JSON.stringify({html, pdf, png: sizes, png_scale: scale, kind, fonts}, null, 2));
} finally { await browser.close(); }
