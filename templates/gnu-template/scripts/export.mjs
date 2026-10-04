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
  const kind = await page.locator('meta[name="gnu-template-kind"]').getAttribute('content');
  const printed = kind === 'web' ? page.locator('.site') : page.locator('[data-export-page]');
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
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      for (const im of el.querySelectorAll('img.logo,img.mascot,img.form-mascot,img.cover-mascot,img.slogan')) {
        const r = im.getBoundingClientRect();
        for (const n of texts) {
          if (im.closest('.identity') && n.closest('.identity')) continue;
          if (hit(r, n.getBoundingClientRect())) bad.push(`그림이 글자를 가림(${im.className}): ` + n.textContent.trim().slice(0, 40));
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
    sizes.push({file: path.basename(png), width: Math.round(bounds.width * scale), height: Math.round(bounds.height * scale)});
  }
  const pdf = path.join(output, stem + '.pdf');
  await page.emulateMedia({media: 'print'});
  await page.pdf({path: pdf, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false});
  // The saved HTML must open on another PC: inline fonts referenced by relative path.
  let portable = original;
  for (const [ref, file] of [...original.matchAll(/url\('([^'():]+\.woff2)'\)/g)].map(m => [m[0], m[1]])) {
    const data = await fs.readFile(path.resolve(path.dirname(input), file)).catch(() => null);
    if (data) portable = portable.split(ref).join(`url('data:font/woff2;base64,${data.toString('base64')}')`);
  }
  const html = path.join(output, stem + '.html');
  if (html !== input) await fs.writeFile(html, portable, 'utf8');
  console.log(JSON.stringify({html, pdf, png: sizes, png_scale: scale, kind, fonts}, null, 2));
} finally { await browser.close(); }
