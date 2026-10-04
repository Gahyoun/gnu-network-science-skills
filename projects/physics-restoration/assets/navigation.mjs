// Shared navigation needs no backend; only search/preparation fetch their local index.
const themeKey='physica-theme';
const systemTheme=matchMedia('(prefers-color-scheme: dark)');
function storedTheme(){try{return localStorage.getItem(themeKey);}catch{return null;}}
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 document.querySelectorAll('[data-theme-value]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeValue===theme)));
}
applyTheme(['light','dark'].includes(storedTheme())?storedTheme():systemTheme.matches?'dark':'light');
document.querySelectorAll('[data-theme-value]').forEach(b=>b.addEventListener('click',()=>{applyTheme(b.dataset.themeValue);try{localStorage.setItem(themeKey,b.dataset.themeValue);}catch{}}));
systemTheme.addEventListener('change',()=>{if(!['light','dark'].includes(storedTheme()))applyTheme(systemTheme.matches?'dark':'light');});
window.addEventListener('storage',e=>{if(e.key===themeKey)applyTheme(e.newValue==='dark'?'dark':e.newValue==='light'?'light':systemTheme.matches?'dark':'light');});
document.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll('.toc-tree details').forEach(d=>d.open=b.dataset.expand==='true')));
// Direct chapter anchors must expand the corresponding TOC.
function openChapter(){const id=location.hash.slice(1);if(/^chapter-\d+$/.test(id)){const d=document.getElementById(id);if(d)d.open=true;}}
openChapter();window.addEventListener('hashchange',openChapter);
const searchMenu=document.querySelector('.search-menu');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&searchMenu?.open){searchMenu.open=false;searchMenu.querySelector('summary').focus();}});
document.addEventListener('click',e=>{if(searchMenu?.open&&!searchMenu.contains(e.target))searchMenu.open=false;});
const normalize=s=>String(s).normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
const words=s=>normalize(s).split(' ').filter(Boolean);
const includes=(text,query)=>query.every(w=>text.includes(w));
for(const container of document.querySelectorAll('[data-catalog]')){
 const rows=[...container.querySelectorAll('[data-catalog-row]')];
 const texts=rows.map(r=>normalize(r.textContent));
 const input=container.querySelector('[data-filter]'),type=container.querySelector('select[data-type]'),status=container.querySelector('[data-status]');
 const paging=container.querySelector('[data-paging]'),prev=container.querySelector('[data-previous]'),next=container.querySelector('[data-next]');
 let page=0,matches=[],timer;
 if(type&&container.dataset.defaultType)type.value=container.dataset.defaultType;
 function render(){
  const from=page*50,to=from+50,set=new Set(matches.slice(from,to));
  rows.forEach((r,i)=>r.hidden=!set.has(i));
  const count=matches.length;
  container.querySelector('[data-count]').textContent=`${count.toLocaleString('ko-KR')}개 항목${count?` · ${from+1}–${Math.min(to,count)}번째 표시`:''}`;
  container.querySelector('[data-empty]').hidden=count>0;
  paging.hidden=count<=50;prev.disabled=page===0;next.disabled=to>=count;
  container.querySelector('[data-page-count]').textContent=`${page+1} / ${Math.max(1,Math.ceil(count/50))}`;
 }
 function filter(){page=0;const q=words(input.value);matches=rows.flatMap((r,i)=>includes(texts[i],q)&&(!type||type.value==='전체'||r.dataset.type===type.value)&&(status.value==='all'||r.dataset.restored===(status.value==='restored'?'true':'false'))?[i]:[]);render();}
 container.querySelector('form').addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);filter();});
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,120);});type?.addEventListener('change',filter);status.addEventListener('change',filter);
 prev.addEventListener('click',()=>{page--;render();container.querySelector('.catalog-count').scrollIntoView({block:'start'});});
 next.addEventListener('click',()=>{page++;render();container.querySelector('.catalog-count').scrollIntoView({block:'start'});});filter();
}
let catalogPromise;
function catalog(){return catalogPromise??=fetch(new URL('./catalog.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.json();});}
function link(text,href){const a=document.createElement('a');a.textContent=text;a.href=href;if(href.startsWith('http')){a.target='_blank';a.rel='noopener';}return a;}
function resultRow(r){
 const li=document.createElement('li'),body=document.createElement('div'),path=document.createElement('small'),meta=document.createElement('div'),badge=document.createElement('small');
 body.append(link(r.title.replaceAll('$',''),r.href));path.className='catalog-path';path.textContent=[r.section,r.subsection,r.type].filter(Boolean).join(' · ');body.append(path);
 meta.className='catalog-meta';badge.className='status'+(r.restored?' restored':'');badge.textContent=r.restored?'복원됨':'복원 준비 중';meta.append(badge,link('원본 ↗',r.source));li.append(body,meta);return li;
}
const form=document.querySelector('[data-search]');
if(form){
 const input=form.querySelector('[name=q]'),only=form.querySelector('[name=restored]'),count=document.querySelector('[data-search-count]'),results=document.querySelector('[data-search-results]'),more=document.querySelector('[data-search-more]');
 let found=[],shown=0,version=0;
 function append(){const next=found.slice(shown,shown+50);const fragment=document.createDocumentFragment();next.forEach(r=>fragment.append(resultRow(r)));results.append(fragment);shown+=next.length;more.hidden=shown>=found.length;count.textContent=`${found.length.toLocaleString('ko-KR')}개 결과 · ${shown}개 표시`+(found.length?'':' · 다른 검색어를 입력해 보세요.');}
 async function search(){
  const current=++version,q=words(input.value);results.replaceChildren();more.hidden=true;
  const url=new URL(location.href);if(q.length)url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');history.replaceState(null,'',url);
  if(!q.length){count.textContent='검색어를 입력해 주세요.';return;}
  count.textContent='검색 중…';
  try{const data=await catalog();if(current!==version)return;
   found=data.search.filter(r=>(!only.checked||r.restored)&&includes(normalize([r.title,r.section,r.subsection,r.text].join(' ')),q)).sort((a,b)=>Number(b.restored)-Number(a.restored)||a.title.localeCompare(b.title,'ko',{numeric:true}));shown=0;append();
  }catch{count.textContent='검색 목록을 불러오지 못했습니다. 새로고침하거나 표제어 목록을 이용해 주세요.';}
 }
 form.addEventListener('submit',e=>{e.preventDefault();search();});only.addEventListener('change',search);more.addEventListener('click',append);
 input.value=new URLSearchParams(location.search).get('q')||'';if(input.value)search();
}
const lessonContainer=document.querySelector('[data-lesson]');
if(lessonContainer){
 const id=new URLSearchParams(location.search).get('id');
 if(id)catalog().then(data=>{
  const lesson=data.lessons.find(l=>l.id===id);
  if(!lesson){lessonContainer.querySelector('.row-body p').textContent='해당 페이지를 찾을 수 없습니다. 전체 목차에서 다시 선택해 주세요.';return;}
  if(lesson.restored){location.replace(lesson.href);return;}
  const heading=`${lesson.title} · ${lesson.page}쪽`;
  document.querySelector('h1').textContent=heading;document.title=heading+' | 물리의 이해';document.querySelector('.breadcrumb [aria-current]').textContent=heading;
  const body=lessonContainer.querySelector('.row-body');body.replaceChildren();
  const path=document.createElement('p');path.textContent=`${lesson.section} / ${lesson.subsection} / ${heading}`;
  const note=document.createElement('p');note.textContent='목차와 페이지 구조를 먼저 마련했습니다. 본문·수식·실험은 원본을 확인하며 차례로 복원할 예정입니다.';
  body.append(path,note,link('원본의 이 페이지 열기 ↗',lesson.source));
  const siblings=data.lessons.filter(l=>l.section===lesson.section&&l.subsection===lesson.subsection&&l.title===lesson.title);
  const nav=document.createElement('nav');nav.className='section-menu';nav.setAttribute('aria-label',lesson.title+' 페이지');siblings.forEach(l=>{const a=link(l.page+'p',l.href);if(l.id===id)a.setAttribute('aria-current','page');nav.append(a);});body.append(nav,link('전체 목차로 돌아가기 →','index.html'));
 }).catch(()=>{lessonContainer.querySelector('.row-body p').textContent='페이지 안내를 불러오지 못했습니다. 전체 목차에서 다시 선택해 주세요.';});
}

const research=document.querySelector('[data-publications]');
if(research){
 const stations=[...research.querySelectorAll('[data-paper-field]')];
 const texts=stations.map(row=>normalize(row.textContent));
 const input=research.querySelector('[data-research-query]'),year=research.querySelector('[data-research-year]'),buttons=[...research.querySelectorAll('[data-research-field]')];
 let field='all',timer;
 function filter(){
  const query=words(input.value);let shown=0;
  stations.forEach((row,i)=>{row.hidden=!(includes(texts[i],query)&&(field==='all'||row.dataset.paperField===field)&&(year.value==='all'||row.dataset.paperYear===year.value));if(!row.hidden)shown++;});
  research.querySelector('[data-research-count]').textContent=`${shown}편`;
  research.querySelector('[data-research-empty]').hidden=shown>0;
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{field=button.dataset.researchField;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();}));
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,120);});year.addEventListener('change',filter);filter();
}
