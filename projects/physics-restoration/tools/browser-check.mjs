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
const report={pages:[],widths:[320,768,1024,1360],errors:[],externalResources:[],interactionChecks:0};
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
  for(const file of ['index.html',...pages.map(p=>p.file),'about.html','materials.html','search.html','headwords.html','browse.html','lesson.html','network.html','concept.html']){
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
    assert.equal(data.widgets,data.rendered,file);
    assert.equal(await page.locator('.identity img').getAttribute('alt'),'물리의 이해');
    assert.ok(await page.locator('.identity img').evaluate(im=>im.complete&&im.naturalWidth>0),'Wordmark loads');
    assert.ok((await page.locator('.source-credit').innerText()).includes('정기수 경상국립대 명예교수님 작'));
    assert.ok((await page.locator('.site-footer').innerText()).includes('(공식이 될 수 있도록 곧 허락 받아올게요)'));
    assert.ok(!(await page.locator('.site-header').innerText()).includes('정기수 교수님의 웹교재 · 동문 복원'));assert.deepEqual(data.duplicates,[],file);
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
    if(file==='distribution-comparison.html'){
      assert.ok(await page.locator('#distributions .control math msub').count()>0,'Thermal-energy control uses a compiled subscript');
      assert.ok(await page.locator('#distributions svg tspan[baseline-shift="sub"]').count()>0,'Graph marker uses subscript B');
      assert.ok(await page.locator('#scaled-distributions .readouts math msub').count()>0,'Readout thermal-energy unit uses a subscript');

      report.interactionChecks+=3;
    }
    // Reload default state for screenshots and print preview.
    await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
    if(file==='distribution-comparison.html')await page.locator('#distributions').screenshot({path:fileURLToPath(new URL('thermal-subscript.png',output))});
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
    if(['quantum-statistics.html','quantum-distributions.html'].includes(file)){
      for(const id of file==='quantum-statistics.html'?['mb-states']:['be-states','fd-states']){
        const widget=page.locator('#'+id),play=widget.locator('[data-action=play]'),input=widget.locator('[data-key=configuration]');
        await widget.scrollIntoViewIfNeeded();await play.click();const before=await input.inputValue();
        await page.waitForTimeout(1500);assert.notEqual(await input.inputValue(),before,'Occupancy playback advances '+id);
        await play.click();const paused=await input.inputValue();await page.waitForTimeout(1400);
        assert.equal(await input.inputValue(),paused,'Occupancy playback pauses '+id);
        await widget.locator('[data-action=reset]').click();assert.equal(await input.inputValue(),'0');report.interactionChecks+=3;
      }
    }
    if(file==='neutron-stars.html'){
      for(const mass of ['0.5','2.5']){
        await page.locator('#neutron-star [data-key=mass]').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},mass);
        const matched=await page.locator('#neutron-star svg').evaluate(svg=>{
          const circles=[...svg.querySelectorAll('circle')].slice(0,4),swatches=[...svg.querySelectorAll('[data-layer-swatch]')];
          return swatches.length===4&&swatches.every((s,i)=>getComputedStyle(s).fill===getComputedStyle(circles[i]).fill)&&Number(circles[0].getAttribute('cx'))+Number(circles[0].getAttribute('r'))<Number(swatches[0].getAttribute('x'));
        });assert.ok(matched,'Layer legend agrees and stays clear at mass '+mass);report.interactionChecks++;
      }
      await page.locator('#neutron-star').screenshot({path:fileURLToPath(new URL('neutron-star-legend.png',output))});
    }
    if(file==='about.html'){
      assert.equal(await page.locator('.research-station').count(),73);
      assert.equal(await page.locator('.research-links a[href^="https://doi.org/"]').count(),71);
      const dates=await page.locator('.research-meta time').allTextContents();assert.deepEqual(dates,[...dates].sort().reverse());
      await page.locator('[data-research-field=nuclear]').click();assert.equal(await page.locator('.research-station:visible').count(),11);
      assert.equal(await page.locator('.research-station:visible>.diamond').count(),11);
      await page.locator('.research-station:visible details').first().locator('summary').click();
      assert.ok((await page.locator('.research-station:visible details[open]').first().innerText()).includes('Chung'));
      await page.locator('[data-research-field=all]').click();
      await page.locator('[data-research-query]').fill('10.3390/polym14040700');await page.waitForTimeout(200);
      assert.equal(await page.locator('.research-station:visible').count(),1);
      await page.locator('[data-research-year]').selectOption('1994');assert.equal(await page.locator('.research-station:visible').count(),0);
      assert.ok(await page.locator('[data-research-empty]').isVisible());
      await page.locator('[data-research-query]').fill('');await page.waitForTimeout(200);assert.equal(await page.locator('.research-station:visible').count(),9);
      await page.locator('[data-research-year]').selectOption('all');
      await page.locator('#publications').scrollIntoViewIfNeeded();await page.screenshot({path:fileURLToPath(new URL('publications-desktop.png',output))});
      report.interactionChecks+=8;
    }
    report.pages.push({file,...data});
  }
  // Related concepts, directed exploration, analysis, downloads and shared ego links.
  await page.goto(new URL('quantum-statistics.html',base).href,{waitUntil:'networkidle'});
  assert.ok(await page.locator('.concept-term').count()>0);
  assert.ok(await page.locator('.related-group').count()>=2);
  assert.equal(await page.locator('math .concept-term').count(),0);
  assert.equal(await page.locator('.concept-term').first().evaluate(e=>getComputedStyle(e).color),'rgb(45, 121, 83)');
  await page.locator('.ego-link').first().click();
  await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.nodeCount)>0);
  const firstCount=Number(await page.locator('canvas').getAttribute('data-node-count'));
  await page.locator('[data-network-direction]').selectOption('out');
  assert.ok(Number(await page.locator('canvas').getAttribute('data-node-count'))<=firstCount);
  const firstHop=Number(await page.locator('canvas').getAttribute('data-node-count'));
  await page.locator('[data-network-hops]').selectOption('2');
  assert.ok(Number(await page.locator('canvas').getAttribute('data-node-count'))>=firstHop);
  await page.locator('[data-network-mode]').selectOption('all');
  assert.ok(Number(await page.locator('canvas').getAttribute('data-node-count'))>1800);
  assert.ok(await page.locator('[data-network-direction]').isDisabled());
  assert.equal(await page.locator('[data-network-ranking] tr').count(),50);
  await page.locator('[data-network-section]').selectOption('핵물리');
  assert.ok((await page.locator('[data-network-ranking] tr').allInnerTexts()).every(t=>t.includes('핵물리')));
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-network-export]').click();
  const downloaded=await downloadPromise;const exportPath=await downloaded.path();const exported=JSON.parse(await fs.readFile(exportPath,'utf8'));
  assert.ok(exported.nodes.length>0);assert.ok(exported.nodes.every(n=>n.section==='핵물리'));
  await page.locator('[data-network-mode]').selectOption('ego');await page.locator('[data-network-section]').selectOption('all');
  await page.locator('[data-ego-query]').fill('양자통계');await page.getByRole('button',{name:'관계 보기',exact:true}).click();
  await page.locator('[data-network-hops]').selectOption('1');await page.locator('[data-network-direction]').selectOption('both');
  await page.locator('canvas').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);
  await page.screenshot({path:fileURLToPath(new URL('concept-network-desktop.png',output))});
  const shared=page.url();await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.nodeCount)>0);
  assert.equal(await page.locator('[data-ego-query]').inputValue(),'양자통계');assert.equal(page.url(),shared);
  await page.locator('[data-network-detail] a').first().click();assert.ok((await page.locator('h1').innerText()).length>0);
  await page.goto(new URL('headwords.html',base).href,{waitUntil:'networkidle'});
  await page.locator('[data-filter]').fill('양자역학');await page.waitForTimeout(200);
  assert.ok(await page.locator('[data-catalog-row]:visible a[aria-label$="개념 관계"]').count()>0);
  report.interactionChecks+=16;
  // Whole-book structure, local navigation, search and persisted reading themes.
  await page.goto(new URL('index.html',base).href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.toc-chapter').count(),7);
  assert.equal(await page.locator('.toc-pages a').count(),566);
  await page.getByRole('button',{name:'모두 전개하기',exact:true}).click();
  assert.equal(await page.locator('.toc-tree details:not([open])').count(),0);
  await page.getByRole('button',{name:'모두 감추기',exact:true}).click();
  assert.equal(await page.locator('.toc-tree details[open]').count(),0);report.interactionChecks+=2;
  await page.locator('.chapter-links a').first().click();
  await page.waitForFunction(()=>document.querySelector('#chapter-1').open);
  await page.locator('#chapter-1 .toc-section>summary').first().click();
  await page.locator('#chapter-1 .toc-pages a').first().click();
  await page.waitForFunction(()=>document.querySelector('h1').textContent.includes('운동량'));
  assert.equal(await page.locator('h1').innerText(),'운동량 · 1쪽');
  assert.ok((await page.locator('[data-lesson] a').first().getAttribute('href')).endsWith('momentum.html'));report.interactionChecks+=2;
  await page.goto(new URL('headwords.html',base).href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-catalog-row]').count(),1866);
  assert.equal(await page.locator('[data-catalog-row]:visible').count(),50);
  await page.locator('[data-filter]').fill('페르미');
  await page.waitForTimeout(200);assert.ok(await page.locator('[data-catalog-row]:visible').count()>0);
  assert.ok((await page.locator('[data-catalog-row]:visible').allInnerTexts()).every(s=>s.includes('페르미')));
  await page.locator('[data-filter]').fill('존재하지않는검색어');await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-catalog-row]:visible').count(),0);report.interactionChecks+=2;
  await page.goto(new URL('browse.html',base).href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-catalog-row]').count(),2455);
  await page.locator('select[data-type]').selectOption('Canvas');
  assert.ok((await page.locator('[data-catalog-row]:visible').allInnerTexts()).every(s=>s.includes('Canvas')));report.interactionChecks++;
  await page.goto(new URL('materials.html',base).href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('select[data-type]').inputValue(),'시뮬레이션');
  assert.ok((await page.locator('[data-catalog-row]:visible').allInnerTexts()).every(s=>s.includes('시뮬레이션')));
  await page.locator('select[data-type]').selectOption('복원 인터랙션');
  assert.equal(await page.locator('[data-catalog-row]:visible').count(),17);
  assert.ok((await page.locator('[data-catalog-row]:visible >div:first-child>a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))).every(h=>h.includes('#')));report.interactionChecks+=2;
  await page.goto(new URL('search.html?q=질량중심',base).href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('[data-search-results]').children.length>0);
  assert.ok((await page.locator('[data-search-results]').innerText()).includes('질량중심'));
  await page.locator('#query').fill('페르미');await page.getByRole('button',{name:'검색',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-search-count]').textContent.includes('개 결과'));
  await page.locator('[name=restored]').check();
  await page.waitForFunction(()=>document.querySelector('[data-search-results]').children.length>0);
  assert.equal(await page.locator('[data-search-results] .status:not(.restored)').count(),0);
  await page.locator('#query').fill('<img src=x onerror=alert(1)>');await page.getByRole('button',{name:'검색',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-search-count]').textContent.startsWith('0개'));
  assert.equal(await page.locator('[data-search-results] img').count(),0);report.interactionChecks+=4;
  await page.goto(new URL('blackbody.html',base).href,{waitUntil:'networkidle'});
  await page.locator('.header-inner [data-theme-value=dark]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.equal(await page.locator('.header-inner [data-theme-value=dark]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(21, 28, 34)');
  assert.equal(await page.locator('#blackbody svg text').first().evaluate(el=>getComputedStyle(el).fill),'rgb(190, 205, 213)');
  await page.screenshot({path:fileURLToPath(new URL('blackbody-dark.png',output)),fullPage:true});
  await page.goto(new URL('about.html',base).href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.setViewportSize({width:320,height:950});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:fileURLToPath(new URL('about-dark-mobile.png',output)),fullPage:true});
  await page.setViewportSize({width:1360,height:1000});
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  await page.emulateMedia({media:'screen'});
  await page.locator('.header-inner [data-theme-value=light]').click();report.interactionChecks+=6;
  await page.goto(new URL('index.html',base).href,{waitUntil:'networkidle'});
  await page.screenshot({path:fileURLToPath(new URL('index-desktop.png',output)),fullPage:true});
  const tablet=await browser.newContext({viewport:{width:768,height:1024},hasTouch:true,isMobile:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  const tabletPage=await tablet.newPage();
  await tabletPage.goto(new URL('index.html',base).href,{waitUntil:'networkidle'});
  await tabletPage.getByRole('button',{name:'목차',exact:true}).tap();
  assert.equal(await tabletPage.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  await tabletPage.getByRole('button',{name:'목차',exact:true}).tap();
  await tabletPage.getByRole('button',{name:'모두 전개하기',exact:true}).tap();
  assert.equal(await tabletPage.locator('.toc-tree details:not([open])').count(),0);
  await tabletPage.getByRole('button',{name:'모두 감추기',exact:true}).tap();
  await tabletPage.screenshot({path:fileURLToPath(new URL('index-tablet-portrait.png',output)),fullPage:true});
  await tabletPage.goto(new URL('blackbody.html',base).href,{waitUntil:'networkidle'});
  const temp=tabletPage.locator('#blackbody input[data-key=T]');const value=await temp.inputValue();await temp.tap();assert.notEqual(await temp.inputValue(),value);
  await tabletPage.locator('.header-inner [data-theme-value=dark]').tap();
  assert.equal(await tabletPage.locator('html').getAttribute('data-theme'),'dark');
  await tabletPage.screenshot({path:fileURLToPath(new URL('blackbody-tablet-portrait.png',output)),fullPage:true});
  await tabletPage.setViewportSize({width:1024,height:768});
  assert.ok(await tabletPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await tabletPage.screenshot({path:fileURLToPath(new URL('blackbody-tablet-landscape.png',output)),fullPage:true});
  await tablet.close();report.interactionChecks+=5;
  await page.goto(new URL('headwords.html',base).href,{waitUntil:'networkidle'});
  await page.screenshot({path:fileURLToPath(new URL('headwords-desktop.png',output))});
  await page.goto(new URL('materials.html',base).href,{waitUntil:'networkidle'});
  await page.locator('select[data-type]').selectOption('복원 인터랙션');
  await page.screenshot({path:fileURLToPath(new URL('materials-desktop.png',output)),fullPage:true});
  const staticContext=await browser.newContext({javaScriptEnabled:false});
  const staticPage=await staticContext.newPage();await staticPage.goto(new URL('blackbody.html',base).href);
  assert.ok(await staticPage.locator('math').count()>0,'Math remains readable without JavaScript');
  assert.equal(await staticPage.locator('noscript').count(),1);await staticContext.close();
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalResources,[]);
  await fs.writeFile(new URL('../docs/browser-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(`Verified ${report.pages.length} pages at ${report.widths.join('/')}px; ${report.interactionChecks} interaction checks; no external resources or runtime errors.`);
} finally{await browser.close();}
