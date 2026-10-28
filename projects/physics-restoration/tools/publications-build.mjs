import fs from 'node:fs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const researchFields=[
 ['applied','응용·소자','square'],['optics','광학·발광','circle'],['nuclear','핵·입자물리','diamond'],['theory','양자·이론','hexagon'],['education','물리교육','triangle']
];
export function publications(root){
 const data=JSON.parse(fs.readFileSync(root+'/src/publications.json','utf8'));
 const fields=new Map(researchFields.map(([id,label,shape])=>[id,{label,shape}]));
 const unique=new Set();
 for(const paper of data.papers){
  if(paper.doi&&(!/^10\.\d{4,9}\/\S+$/i.test(paper.doi)||unique.has(paper.doi.toLowerCase())))throw Error('Invalid/duplicate publication DOI: '+paper.doi);
  if(!paper.authors?.length||!fields.has(paper.field)||!/^\d{4}(?:-\d{2})?$/.test(paper.date))throw Error('Incomplete publication: '+paper.title);
  if(paper.doi)unique.add(paper.doi.toLowerCase());
 }
 const papers=[...data.papers].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
 const button=(id,label,shape)=>`<button type="button" data-research-field="${id}" aria-pressed="false"><span class="research-marker ${shape}" data-field="${id}" aria-hidden="true"></span>${label}</button>`;
 const authors=paper=>paper.authors.map(a=>(a==='정기수'||/\b(?:Ki[ -]?Soo|K\.?\s?S\.?)\b/i.test(a)&&/Chung/i.test(a))?`<strong>${esc(a)}</strong>`:esc(a)).join(', ');
 return `<section class="content-row research-section" id="publications"><h2>연구 논문</h2><div class="row-body" data-publications><div class="research-filters" role="group" aria-label="논문 분야"><button type="button" data-research-field="all" aria-pressed="true">전체</button>${researchFields.map(([id,label,shape])=>button(id,label,shape)).join('')}</div><div class="research-search"><label>논문 검색<input type="search" data-research-query placeholder="논문 제목, 저자, 저널, DOI" autocomplete="off"></label><label>발표 연도<select data-research-year><option value="all">전체 연도</option>${[...new Set(papers.map(p=>p.date.slice(0,4)))].map(y=>`<option value="${y}">${y}</option>`).join('')}</select></label></div><p class="research-count" role="status" aria-live="polite" data-research-count>${papers.length}편</p><ol class="research-route">${papers.map(paper=>{
 const field=fields.get(paper.field),year=paper.date.slice(0,4),url=paper.doi?'https://doi.org/'+paper.doi:paper.source;
 return `<li class="research-station" data-paper-field="${paper.field}" data-paper-year="${year}"><span class="research-marker ${field.shape}" data-field="${paper.field}" aria-hidden="true"></span><article><div class="research-meta"><time datetime="${paper.date}">${paper.date.replace('-','.')}</time><span class="research-journal">${esc(paper.journal)}</span><span class="research-field" data-field="${paper.field}">${field.label}</span></div><h3><a href="${esc(url)}" target="_blank" rel="noopener">${esc(paper.title)}</a></h3>${paper.authors.length<=10?`<p class="research-authors">${authors(paper)}</p>`:`<details class="research-authors"><summary>${esc(paper.authors.slice(0,3).join(', '))} 외 · 저자 ${paper.authors.length}명</summary><p>${authors(paper)}</p></details>`}<div class="research-links">${paper.doi?`<a href="${esc(url)}" target="_blank" rel="noopener">DOI: ${esc(paper.doi)} ↗</a>`:`<span>DOI 미확인</span><a href="${esc(url)}" target="_blank" rel="noopener">논문 서지정보 ↗</a>`}${paper.volume?`<span>${esc(paper.volume)}${paper.issue?'('+esc(paper.issue)+')':''}${paper.pages?', '+esc(paper.pages):''}</span>`:''}</div></article></li>`;
 }).join('')}</ol><p data-research-empty hidden>조건에 맞는 논문이 없습니다.</p><p class="research-source"><a href="https://www.researchgate.net/profile/Ki-Soo-Chung/research" target="_blank" rel="noopener">논문 목록 출처</a> · <a href="docs/publications.md">서지정보 확인 기록</a></p></div></section>`;
}
