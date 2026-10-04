import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {pages} from '../src/content.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PHYSICA_PLAYWRIGHT || 'playwright');
const base=process.env.PHYSICA_BASE_URL || 'http://127.0.0.1:8774/';
const output=new URL('../preview/',import.meta.url);
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={pages:[],widths:[320,768,1360],errors:[],externalResources:[],interactionChecks:0};
try{
  const page=await browser.newPage({viewport:{width:1360,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()}: ${r.url()}`);});
  await page.route('**/*',route=>{
    if(!route.request().url().startsWith(base)&&!route.request().url().startsWith('data:')){
      report.externalResources.push(route.request().url());return route.abort();
    }
    return route.continue();
  });
  for(const file of ['index.html',...pages.map(p=>p.file),'about.html']){
    await page.goto(new URL(file,base).href,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const data=await page.evaluate(()=>{
      const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
      return {title:document.title,math:document.querySelectorAll('math').length,
        widgets:document.querySelectorAll('[data-widget]').length,
        rendered:document.querySelectorAll('[data-widget] svg').length,
        duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),
        badHashes:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
        brokenMath:document.querySelectorAll('.katex-error').length};
    });
    assert.equal(data.widgets,data.rendered,file);assert.deepEqual(data.duplicates,[],file);
    assert.deepEqual(data.badHashes,[],file);assert.equal(data.brokenMath,0,file);
    for(const width of report.widths){
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Page overflow: ${file} @ ${width}`);
    }
    await page.setViewportSize({width:1360,height:1000});
    for(const input of await page.locator('.widget input[type=range]').all()){
      for(const boundary of ['min','max']){
        await input.evaluate((el,b)=>{el.value=el[b];el.dispatchEvent(new Event('input',{bubbles:true}));},boundary);
        assert.ok(!/NaN|Infinity|undefined/.test((await page.locator('.widget').allInnerTexts()).join(' ')),`${file}: invalid readout`);
        assert.equal(await page.locator('svg [d*="NaN"],svg [d*="Infinity"]').count(),0,file);
        report.interactionChecks++;
      }
    }
    for(const select of await page.locator('.widget select').all()){
      const values=await select.locator('option').evaluateAll(xs=>xs.map(x=>x.value));
      for(const value of values){await select.selectOption(value);report.interactionChecks++;}
    }
    // Reload default state for screenshots and print preview.
    await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
    if(['index.html','blackbody.html','quantum-distributions.html','density-of-states.html'].includes(file))
      await page.screenshot({path:fileURLToPath(new URL(file.replace('.html','-desktop.png'),output)),fullPage:true});
    if(file==='blackbody.html'){
      await page.setViewportSize({width:320,height:950});
      await page.getByRole('button',{name:'목차',exact:true}).click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
      await page.screenshot({path:fileURLToPath(new URL('blackbody-mobile.png',output)),fullPage:true});
      await page.setViewportSize({width:1360,height:1000});
      await page.evaluate(()=>document.body.style.zoom='2');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% zoom page overflow');
      await page.evaluate(()=>document.body.style.zoom='1');
      // Keyboard operation changes the physical calculation.
      const range=page.locator('#blackbody input[data-key="T"]');
      await range.focus();const before=await range.inputValue();await page.keyboard.press('ArrowRight');
      assert.notEqual(await range.inputValue(),before);report.interactionChecks++;
      await page.pdf({path:fileURLToPath(new URL('blackbody-print.pdf',output)),format:'A4',printBackground:true,preferCSSPageSize:true});
    }
    if(file==='density-of-states.html'){
      const play=page.locator('#mode-1d button[data-action="play"]');await play.click();
      const a=await page.locator('#mode-1d svg').innerHTML();await page.waitForTimeout(180);
      assert.notEqual(await page.locator('#mode-1d svg').innerHTML(),a,'Animation advances');
      await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(100);
      const off=await page.locator('#mode-1d svg').innerHTML();await page.waitForTimeout(150);
      assert.equal(await page.locator('#mode-1d svg').innerHTML(),off,'Offscreen animation pauses');report.interactionChecks++;
      await play.click();const b=await page.locator('#mode-1d svg').innerHTML();await page.waitForTimeout(100);
      assert.equal(await page.locator('#mode-1d svg').innerHTML(),b,'Animation pauses');report.interactionChecks+=2;
    }
    report.pages.push({file,...data});
  }
  const staticContext=await browser.newContext({javaScriptEnabled:false});
  const staticPage=await staticContext.newPage();await staticPage.goto(new URL('blackbody.html',base).href);
  assert.ok(await staticPage.locator('math').count()>0,'Math remains readable without JavaScript');
  assert.equal(await staticPage.locator('noscript').count(),1);await staticContext.close();
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalResources,[]);
  await fs.writeFile(new URL('../docs/browser-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(`Verified ${report.pages.length} pages at ${report.widths.join('/')}px; ${report.interactionChecks} interaction checks; no external resources or runtime errors.`);
} finally{await browser.close();}
