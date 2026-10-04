// Navigation metadata is a snapshot of titles, categories and source links only.
import fs from 'node:fs';
import {pages} from '../src/content.mjs';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function navigation(root, inline) {
 const catalog=JSON.parse(fs.readFileSync(new URL('../src/catalog.json',import.meta.url),'utf8'));
 const ids=new Set();
 for(const lesson of catalog.lessons){
  if(!/^\d+(?:-\d+){3}$/.test(lesson.id)||ids.has(lesson.id))throw Error(`Invalid or duplicate lesson ID: ${lesson.id}`);
  ids.add(lesson.id);
 }
 for(const record of [...catalog.lessons,...catalog.headwords,...catalog.browse,...catalog.materials]){
  if(typeof record.title!=='string'||!record.source.startsWith('http://physica.gnu.ac.kr/phtml/'))throw Error('Invalid catalog metadata');
 }
 const restored=new Map(pages.map(p=>['http://physica.gnu.ac.kr/phtml/modern/q_statistics/'+p.source,p]));
 const lessons=new Map(catalog.lessons.map(l=>[l.source,l]));
 for(const source of restored.keys())if(!lessons.has(source))throw Error(`Restored page missing from TOC: ${source}`);
 const lookup=source=>lessons.get(source.split('#')[0]);
 const target=source=>restored.get(source.split('#')[0])?.file || (lookup(source)?`lesson.html?id=${lookup(source).id}`:null);
 const status=source=>restored.has(source.split('#')[0]);
 const categories=[...new Set(catalog.lessons.map(l=>l.section))];
 const badge=source=>`<small class="status ${status(source)?'restored':''}">${status(source)?'복원됨':'복원 준비 중'}</small>`;
 const title=s=>inline(s.replace(/\$([^$]+)\$/g,'\\($1\\)'));
 const heading=(name,description)=>`<div class="page-heading"><div><p class="chapter-name">물리의 이해 · 웹교재</p><h1>${name}</h1></div><button data-print>인쇄</button></div>${description?`<p class="catalog-intro">${description}</p>`:''}`;
 const searchNav=current=>`<nav class="section-menu" aria-label="검색 메뉴">${[['search.html','내부검색'],['headwords.html','표제어 목록'],['browse.html','찾아보기']].map(([url,text])=>`<a href="${url}" ${current===url?'aria-current="page"':''}>${text}</a>`).join('')}</nav>`;
 function sidebar(page){
  const current=lookup('http://physica.gnu.ac.kr/phtml/modern/q_statistics/'+(page.source||''));
  return `<aside class="book-nav" aria-label="웹교재 목차"><p class="nav-title"><a href="index.html">웹교재 목차</a></p><ol class="chapter-links">${categories.map((c,i)=>`<li><a href="index.html#chapter-${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${esc(c)}</a></li>`).join('')}</ol>${current?`<p class="nav-group">양자통계</p><ol>${pages.map((p,i)=>`<li><a href="${p.file}" ${p.file===page.file?'aria-current="page"':''}><span>${i+1}</span>${esc(p.subtitle)}</a></li>`).join('')}</ol>`:''}<nav class="nav-tools" aria-label="탐색 도구"><a href="materials.html">자료종류별</a><a href="search.html">내부검색</a><a href="headwords.html">표제어 목록</a><a href="browse.html">찾아보기</a><a href="about.html">사이트 안내</a></nav><a class="nav-original" href="http://physica.gnu.ac.kr/" target="_blank" rel="noopener">원본 웹교재 ↗</a></aside>`;
 }
 const index=heading('웹교재 목차','')+`<div class="toc-toolbar"><button data-expand="true">모두 전개하기</button><button data-expand="false">모두 감추기</button><a href="quantum-statistics.html">복원한 양자통계 읽기 →</a></div><div class="toc-tree">${categories.map((c,i)=>`<details class="toc-chapter" id="chapter-${i+1}" ${c==='현대물리'?'open':''}><summary><span>${String(i+1).padStart(2,'0')} ${esc(c)}</span><small>${catalog.lessons.filter(l=>l.section===c).length}쪽</small></summary>${[...new Set(catalog.lessons.filter(l=>l.section===c).map(l=>l.subsection))].map((sub,j)=>`<details class="toc-section" ${sub==='양자통계'?'open':''}><summary>${esc(sub)}</summary><ul>${[...new Set(catalog.lessons.filter(l=>l.section===c&&l.subsection===sub).map(l=>l.title))].map(t=>{const ls=catalog.lessons.filter(l=>l.section===c&&l.subsection===sub&&l.title===t);return `<li><div class="toc-topic"><a href="${target(ls[0].source)}">${esc(t)}</a>${badge(ls[0].source)}</div><nav class="toc-pages" aria-label="${esc(t)} 페이지">${ls.map(l=>`<a href="${target(l.source)}" ${status(l.source)?'class="ready"':''}>${l.page}p</a>`).join('')}</nav></li>`;}).join('')}</ul></details>`).join('')}</details>`).join('')}</div>`;
 function item(record){
  const local=record.href||target(record.source);
  return `<li data-catalog-row><div><a href="${esc(local||record.source)}" ${local?'':'target="_blank" rel="noopener"'}>${title(record.title)}</a><small class="catalog-path">${esc(record.section||lookup(record.source)?.section||'원본 목록')} ${record.subsection?' · '+esc(record.subsection):''}</small></div><div class="catalog-meta">${record.type?`<small>${esc(record.type)}</small>`:''}${badge(record.source)}<a href="${esc(record.source)}" target="_blank" rel="noopener" aria-label="${esc(record.title)} 원본">원본 ↗</a></div></li>`;
 }
 const filters=(types=[])=>`<form class="catalog-filters" role="search"><label>목록 내 검색<input type="search" data-filter placeholder="제목 또는 단원 이름" autocomplete="off"></label>${types.length?`<label>자료 종류<select data-type>${types.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label>`:''}<label>표시 범위<select data-status><option value="all">전체</option><option value="restored">복원됨</option><option value="pending">복원 준비 중</option></select></label></form><p class="catalog-count" role="status" aria-live="polite" data-count></p>`;
 const controls=`<div class="catalog-paging" data-paging hidden><button data-previous>← 이전 목록</button><span data-page-count></span><button data-next>다음 목록 →</button></div>`;
 function list(name,records,description,file,types=[]){
  return heading(name,description)+(file==='materials.html'?'':searchNav(file))+`<div data-catalog ${file==='materials.html'?'data-default-type="시뮬레이션"':''}>${filters(types)}<ol class="catalog-list">${records.map(r=>item(r).replace('<li data-catalog-row>',`<li data-catalog-row data-type="${esc(r.type||'')}" data-restored="${status(r.source)}">`)).join('')}</ol><p data-empty hidden>일치하는 항목이 없습니다. 검색어 또는 표시 범위를 바꿔 보세요.</p>${controls}</div><noscript>목록은 모두 표시됩니다. 목록 내 필터는 JavaScript를 켜면 사용할 수 있습니다.</noscript>`;
 }
 const restoredItems=pages.flatMap(p=>p.sections.flatMap(s=>s.blocks.filter(b=>b.type==='widget').map(b=>({title:b.title,type:'복원 인터랙션',section:'현대물리',subsection:p.title,source:'http://physica.gnu.ac.kr/phtml/modern/q_statistics/'+p.source,href:p.file+'#'+b.id}))));
 // The independent restored interactions link to their exact local figure.
 const materials=list('자료종류별',[...catalog.materials,...restoredItems].sort((a,b)=>a.title.localeCompare(b.title,'ko',{numeric:true})), '시뮬레이션을 기본으로 표시합니다. 자료를 선택하면 해당 교재 페이지로 이동합니다. 원본 목록의 유형을 유지하고 복원 인터랙션도 따로 모았습니다.','materials.html',['시뮬레이션','그래프','그래픽','애니메이션','모의실험','복원 인터랙션','전체']);
 // Search data is fetched only on the search and preparation pages.
 const records=[...catalog.lessons,...catalog.browse,...catalog.materials].map(r=>({title:r.title,section:r.section||lookup(r.source)?.section||'',subsection:r.subsection||lookup(r.source)?.subsection||'',source:r.source,href:r.href||target(r.source)||r.source,restored:status(r.source),type:r.type||'교재',text:''}));
 for(const p of pages){records.push({title:p.subtitle,section:'현대물리',subsection:p.title,source:'http://physica.gnu.ac.kr/phtml/modern/q_statistics/'+p.source,href:p.file,restored:true,type:'복원 본문',text:p.sections.map(s=>s.title+' '+s.blocks.map(b=>b.text||b.title||b.items?.join(' ')||'').join(' ')).join(' ')});}
 const unique=[...new Map(records.map(r=>[r.title+'|'+r.source+'|'+r.type,r])).values()];
 fs.writeFileSync(root+'/assets/catalog.json',JSON.stringify({lessons:catalog.lessons.map(l=>({...l,href:target(l.source),restored:status(l.source)})),search:unique}));
 const search=heading('내부검색','전체 교재 목차, 표제어와 자료 제목, 복원된 8쪽의 본문을 검색합니다.')+searchNav('search.html')+`<form class="search-form" data-search role="search"><label for="query">이 웹교재에서 찾을 내용</label><div><input id="query" name="q" type="search" placeholder="예: 페르미, 빛의 간섭, 질량중심" required autocomplete="off"><button class="primary">검색</button></div><label class="search-restored"><input type="checkbox" name="restored"> 복원된 내용만 검색</label></form><p data-search-count role="status" aria-live="polite"></p><ol class="catalog-list" data-search-results></ol><button data-search-more hidden>결과 더 보기</button><noscript>검색에는 JavaScript가 필요합니다. <a href="headwords.html">표제어 목록</a>에서 내용을 찾을 수 있습니다.</noscript>`;
 const lesson=heading('복원 준비 중','이 페이지는 아직 본문과 애니메이션을 복원하지 않았습니다.')+`<section class="content-row" data-lesson><h2>원본 교재</h2><div class="row-body"><p>목차에서 단원과 페이지를 선택하면 제목과 원본 링크를 안내합니다.</p><a href="index.html">전체 목차로 돌아가기 →</a></div></section><noscript><a href="http://physica.gnu.ac.kr/" target="_blank" rel="noopener">원본 웹교재 열기 ↗</a></noscript>`;
 return {sidebar,index,extra:{'materials.html':materials,'search.html':search,'headwords.html':list('표제어 목록',catalog.headwords,'원본 표제어 1,866개를 원래 순서로 연결합니다. 복원된 단원은 복원본에서 읽고, 나머지는 원본의 해당 위치를 확인할 수 있습니다.','headwords.html'),'browse.html':list('찾아보기',catalog.browse,'원본의 표제어와 멀티미디어 2,455개 항목을 함께 찾아봅니다. 플래시·Canvas·애플릿·그림 등 원본의 자료 유형을 표시합니다.','browse.html',['전체','표제어','플래시','Canvas','애플릿','그림','사진','동영상']),'lesson.html':lesson},report:{chapters:categories.length,lessons:catalog.lessons.length,topics:new Set(catalog.lessons.map(l=>l.section+'|'+l.subsection+'|'+l.title)).size,headwords:catalog.headwords.length,browse:catalog.browse.length,materials:catalog.materials.length,restoredInteractions:restoredItems.length,searchRecords:unique.length}};
}
