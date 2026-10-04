#!/usr/bin/env node
// Export local self-contained HTML as HTML, vector PDF, and per-page PNG.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let chromium;
try {({chromium}=require('playwright'));}
catch {throw new Error('Playwright가 필요합니다. 템플릿 폴더에서 npm install 후 npx playwright install chromium을 실행하세요.');}
const [inputArg,outputArg,...flags]=process.argv.slice(2);
if (!inputArg || flags.some(f=>!/^--scale=[1-3](?:\.\d+)?$/.test(f))) throw new Error('사용법: node scripts/export.mjs 입력.html 출력폴더 [--scale=1|2|3]');
const input=path.resolve(inputArg),output=path.resolve(outputArg || path.join(path.dirname(input),'export'));
const scale=Number((flags.find(f=>f.startsWith('--scale=')) || '--scale=1').split('=')[1]);
if (scale<1 || scale>3) throw new Error('PNG 배율은 1–3 사이여야 합니다.');
await fs.mkdir(output,{recursive:true});
const stem=path.basename(input,'.html');
const original=await fs.readFile(input,'utf8');
if (!original.includes('<meta name="gnu-template-kind"')) throw new Error('GNU 템플릿 HTML의 매체 정보가 없습니다. meta name="gnu-template-kind"를 유지하세요.');
const browser=await chromium.launch({headless:true,channel:process.env.GNU_BROWSER_CHANNEL || 'chromium'});
try {
 const page=await browser.newPage({viewport:{width:1360,height:1000},deviceScaleFactor:scale});
 const external=[];
 await page.route('**/*',route=>{
  if(/^https?:/.test(route.request().url())){external.push(route.request().url());return route.abort();}
  return route.continue();
 });
 await page.goto(pathToFileURL(input).href,{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));});
 if(external.length) throw new Error('외부 리소스가 있습니다. 폰트·그림을 로컬에 포함하거나 data URI로 넣으세요: '+external.join(', '));
 const broken=await page.locator('img').evaluateAll(ims=>ims.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.alt));
 if(broken.length) throw new Error('이미지 로드 실패: '+broken.join(', '));
 const kind=await page.locator('meta[name="gnu-template-kind"]').getAttribute('content');
 const printed=kind==='web' ? page.locator('.site') : page.locator('[data-export-page]');
 if(!(await printed.count()))throw new Error('출력 페이지가 없습니다.');
 const sizes=[];
 const count=await printed.count();
 for(let i=0;i<await printed.count();i++){
  const node=printed.nth(i);const bounds=await node.boundingBox();
  if(bounds.width*scale>12000 || bounds.height*scale>18000)throw new Error('PNG가 너무 큽니다. 배율을 줄이세요.');
  // Checks use computed geometry, not inferred text-size heuristics.
  const issues=await node.evaluate(el=>{const box=el.getBoundingClientRect();const min=Number.parseFloat(getComputedStyle(el).minHeight);const bad=[...el.querySelectorAll('h1,h2,p,dd,figcaption')].filter(n=>n.scrollWidth>n.clientWidth+2||n.getBoundingClientRect().bottom>box.bottom+2).map(n=>n.textContent.slice(0,70));if(el.classList.contains('paper')&&min>0&&box.height>min+2)bad.push('지정된 종이 높이 초과: 내용을 줄이거나 페이지를 나누세요.');return bad;});
  if(issues.length)throw new Error('페이지·텍스트 넘침: '+issues.join(', '));
  const png=path.join(output,stem+(count>1?'-'+String(i+1).padStart(2,'0'):'')+'.png');
  await node.screenshot({path:png});sizes.push({file:path.basename(png),width:Math.round(bounds.width*scale),height:Math.round(bounds.height*scale)});
 }
 const pdf=path.join(output,stem+'.pdf');
 await page.emulateMedia({media:'print'});
 await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 const html=path.join(output,stem+'.html');
 if(html!==input)await fs.writeFile(html,original,'utf8');
 console.log(JSON.stringify({html,pdf,png:sizes,png_scale:scale,kind},null,2));
} finally {await browser.close();}
