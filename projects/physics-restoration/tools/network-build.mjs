import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {pages} from '../src/content.mjs';
import {measures,pageRank} from '../assets/network-model.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const label=s=>s.normalize('NFC').replace(/\s+/g,' ').trim();
export function network(root){
 const catalog=JSON.parse(fs.readFileSync(root+'/src/catalog.json'));
 const survey=JSON.parse(fs.readFileSync(root+'/src/related-links.json'));
 const lessons=new Map(catalog.lessons.map(l=>[l.source,l])),nodes=new Map(),edges=new Map();
 const sourceBase='http://physica.gnu.ac.kr/phtml/modern/q_statistics/';
 const restored=new Map(pages.map(p=>[sourceBase+p.source,p]));
 function node(title,source){
  title=label(title);if(!title)return null;
  let n=nodes.get(title);const base=source.split('#')[0],lesson=lessons.get(base),page=restored.get(base);
  if(!n){n={id:'c-'+createHash('sha256').update(title).digest('hex').slice(0,14),label:title,section:lesson?.section||'기타',sources:[]};nodes.set(title,n);}
  if(!n.sources.includes(source))n.sources.push(source);
  if(page){const section=page.sections.find(s=>label(s.title)===title);n.restoredHref=page.file+(section?'#section-'+section.id:'');}
  n.href='concept.html?id='+n.id;return n;
 }
 for(const w of catalog.headwords)node(w.title,w.source);
 for(const p of survey.pages)for(const block of p.relations||[]){
  const from=node(block.concept,block.source);
  for(const link of block.links){const to=node(link.label,link.source);if(from.id===to.id)continue;
   const key=from.id+'|'+to.id;
   if(!edges.has(key))edges.set(key,{source:from.id,target:to.id,mentions:[]});
   const e=edges.get(key);if(!e.mentions.some(m=>m.context===block.source&&m.target===link.source))e.mentions.push({context:block.source,target:link.source});
  }
 }
 const ns=[...nodes.values()],es=[...edges.values()],stats=measures(ns,es),rank=pageRank(ns,es);
 for(const n of ns){n.inDegree=stats.adj.incoming.get(n.id).size;n.outDegree=stats.adj.out.get(n.id).size;n.pageRank=rank.get(n.id);}
 const report={surveyDate:survey.surveyDate,pages:survey.pages.length,failedPages:survey.pages.filter(p=>p.error).map(p=>({source:p.source,error:p.error})),nodes:ns.length,edges:es.length,density:stats.density,reciprocity:stats.reciprocity,weakComponents:stats.components};
 fs.writeFileSync(root+'/assets/network.json',JSON.stringify({report,nodes:ns,edges:es}));
 fs.writeFileSync(root+'/docs/network-report.json',JSON.stringify(report,null,2)+'\n');
 function related(page){
  const original=sourceBase+page.source,blocks=survey.pages.find(p=>p.source===original)?.relations||[];
  return blocks.length?`<section class="related-contents" aria-label="관련내용"><h2>관련내용</h2>${blocks.map(b=>{const n=nodes.get(label(b.concept));return `<div class="related-group"><h3>${esc(b.concept)}</h3><ul>${b.links.map(l=>{const to=nodes.get(label(l.label));return `<li><a href="${esc(to.restoredHref||to.href)}">${esc(l.label)}</a></li>`;}).join('')}</ul><a class="ego-link" href="network.html?ego=${n.id}">${esc(b.concept)} 관계 보기 ↗</a></div>`;}).join('')}</section>`:'';
 }
 const view=`<div class="page-heading"><div><p class="chapter-name">물리의 이해 · 관련내용</p><h1>개념 네트워크</h1></div><a href="headwords.html">표제어 목록</a></div><p class="network-explanation">화살표 A → B는 A의 ‘관련내용’에 B가 언급됨을 나타냅니다. 개념을 선택하면 연결된 내용과 교재를 살펴볼 수 있습니다.</p><div data-network><form class="network-controls"><label>중심 개념<input data-ego-query list="concept-options" type="search" placeholder="예: 양자통계" autocomplete="off"><datalist id="concept-options"></datalist></label><button class="primary" type="submit">관계 보기</button><label>보기<select data-network-mode><option value="ego">중심 개념 관계</option><option value="all">전체 네트워크</option></select></label><label>연결 방향<select data-network-direction><option value="both">들어오는 + 나가는</option><option value="out">나가는 연결</option><option value="in">들어오는 연결</option></select></label><label>거리<select data-network-hops><option value="1">1단계</option><option value="2">2단계</option></select></label><label>대단원<select data-network-section><option value="all">전체 대단원</option>${[...new Set(ns.map(n=>n.section))].map(s=>`<option>${esc(s)}</option>`).join('')}</select></label></form><p data-network-status role="status" aria-live="polite">네트워크를 불러오는 중입니다.</p><div class="network-legend" data-network-legend aria-label="대단원 색상 범례"></div><div class="network-toolbar"><button data-network-fit>화면 맞춤</button><button data-network-zoom="1.25" aria-label="네트워크 확대">＋</button><button data-network-zoom="0.8" aria-label="네트워크 축소">−</button><button data-network-layout>다시 배치</button><label><input type="checkbox" data-network-labels> 모든 이름 표시</label><button data-network-export>현재 관계 JSON 저장</button></div><div class="network-workspace"><div class="network-canvas-wrap"><canvas data-network-canvas tabindex="0" role="img" aria-label="방향성 개념 네트워크. 개념을 클릭하거나 아래 목록에서 선택하세요."></canvas><p class="network-help">개념 끌기 · 빈 곳 끌어 이동 · 휠로 확대/축소 · 두 손가락 확대/축소 · 방향키로 이동</p></div><aside class="network-detail" data-network-detail aria-live="polite"><h2>중심 개념</h2></aside></div><section class="network-analysis"><h2>현재 네트워크 분석</h2><dl data-network-metrics></dl><p>연결 수는 현재 화면 범위에서 계산합니다. PageRank는 전체 네트워크 기준입니다.</p><div class="network-table-wrap"><table><caption>개념별 연결 수와 PageRank · 상위 50개</caption><thead><tr><th>개념</th><th>대단원</th><th>들어옴</th><th>나감</th><th>PageRank</th></tr></thead><tbody data-network-ranking></tbody></table></div></section><p><a href="docs/network.md">네트워크 데이터와 분석 기준</a></p></div><noscript>네트워크 조작에는 JavaScript가 필요합니다. <a href="headwords.html">표제어 목록</a>에서 교재를 읽을 수 있습니다.</noscript>`;
 const concept=`<div class="page-heading"><div><p class="chapter-name">물리의 이해 · 표제어</p><h1 data-concept-title>개념 안내</h1></div><a href="headwords.html">표제어 목록</a></div><section class="content-row" data-concept-detail><h2>관련내용</h2><div class="row-body"><p>개념을 불러오는 중입니다.</p></div></section><noscript><a href="headwords.html">표제어 목록에서 원본 링크를 선택해 주세요.</a></noscript>`;
 function terms(page){const blocks=survey.pages.find(p=>p.source===sourceBase+page.source)?.relations||[];return [...new Map(blocks.flatMap(b=>b.links.map(l=>nodes.get(label(l.label)))).map(n=>[n.id,n])).values()].sort((a,b)=>b.label.length-a.label.length);}
 return {related,terms,extra:{'network.html':view,'concept.html':concept},nodeForTitle:title=>nodes.get(label(title)),report};
}
