import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {pages} from '../src/content.mjs';
import {navigation} from './navigation-build.mjs';
import {publications} from './publications-build.mjs';
import {network} from './network-build.mjs';
import {aboutGuide,authorFacts} from './about-guide.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const katex = require('../vendor/katex/katex.min.js');
// Compile repeated UI notation once; no KaTeX runtime is downloaded by visitors.
const notation = Object.fromEntries([['kBT', 'k_{B}T'], ['kB', 'k_{B}']].map(([key, tex]) => [key, katex.renderToString(tex, {throwOnError:true, trust:false, output:'htmlAndMathml'})]));
fs.writeFileSync(path.join(root,'assets/math-labels.mjs'),`export const notation = ${JSON.stringify(notation)};\n`);
const esc = s => String(s).replace(/\s+/g,' ').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let mathCount = 0;
let activeTerms=[];
function math(tex, display = false) {
  mathCount++;
  return katex.renderToString(tex, {displayMode: display, throwOnError: true, strict: 'error', trust: false, output: 'htmlAndMathml'});
}
function inline(text) {
  return text.split(/(\\\([\s\S]*?\\\))/g).map(x => x.startsWith('\\(') ? math(x.slice(2,-2)) : highlight(x).replace(/kBT|kB/g,key=>notation[key])).join('');
}
function highlight(text){
 if(!activeTerms.length)return esc(text);
 const regex=new RegExp('('+activeTerms.map(n=>n.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
 const byLabel=new Map(activeTerms.map(n=>[n.label,n]));
 return text.split(regex).map(part=>byLabel.has(part)?`<a class="concept-term" href="${esc(byLabel.get(part).restoredHref||byLabel.get(part).href)}">${esc(part)}</a>`:esc(part)).join('');
}
function block(b) {
  if (b.type === 'p') return `<p>${inline(b.text)}</p>`;
  if (b.type === 'equation') return `<div class="equation" tabindex="0" aria-label="수식" lang="ko">${math(b.tex,true)}</div>`;
  if (b.type === 'note') return `<p class="editor-note">${inline(b.text)}</p>`;
  if (b.type === 'questions') return `<details class="questions"><summary>질문과 탐구</summary><ol>${b.items.map(x=>`<li>${inline(x)}</li>`).join('')}</ol></details>`;
  if (b.type === 'widget') return `<figure class="interactive" id="${b.id}"><header class="figure-heading"><h3>${esc(b.title)}</h3><a href="#${b.id}" aria-label="${esc(b.title)} 위치 링크">#</a></header><div class="widget" data-widget="${b.id}"><noscript>이 도식의 조작 기능은 JavaScript를 켜면 사용할 수 있습니다. 본문의 수식과 설명은 그대로 읽을 수 있습니다.</noscript></div><figcaption>${esc(b.caption)}</figcaption></figure>`;
  throw Error(`Unknown block type ${b.type}`);
}
const graph=network(root);
const nav = navigation(root,inline,graph);
const sidebar = nav.sidebar;
function shell(title, body, page = {file: ''}) {
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="정기수 교수님의 물리의 이해 웹교재 동문 복원 프로젝트 · 전체 목차와 양자통계 인터랙션"><title>${esc(title)} | 물리의 이해</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="vendor/katex/katex.min.css"><link rel="stylesheet" href="assets/style.css"><script>try{const t=localStorage.getItem("physica-theme");document.documentElement.dataset.theme=t==="dark"||t==="light"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}catch{}</script><script type="module" src="assets/navigation.mjs"></script><script type="module" src="assets/app.mjs"></script><script type="module" src="assets/network.mjs"></script></head><body><a class="skip" href="#main">본문 바로가기</a><header class="site-header"><div class="header-inner"><div class="brand"><a class="identity" href="index.html"><img src="assets/logo-pastel.png" width="216" height="130" alt="물리의 이해" decoding="async"></a><p class="source-credit"><a href="http://physica.gnu.ac.kr/" target="_blank" rel="noopener">원본 - 물리의 이해</a> (정기수 경상국립대 명예교수님 작)</p></div><nav class="top-menu" aria-label="상단 메뉴"><a href="index.html">웹교재 목차</a><a href="materials.html">자료종류별</a><details class="search-menu"><summary>검색</summary><div><a href="search.html">내부검색</a><a href="headwords.html">표제어 목록</a><a href="browse.html">찾아보기</a><a href="network.html">개념 네트워크</a></div></details><a href="about.html">사이트 안내</a></nav><div class="theme-switch" role="group" aria-label="화면 테마"><button data-theme-value="light" aria-pressed="false">라이트</button><button data-theme-value="dark" aria-pressed="false">다크</button></div><button class="menu-toggle" aria-expanded="false" aria-controls="book-navigation">목차</button></div></header><nav class="breadcrumb" aria-label="현재 위치"><div><a href="index.html">물리의 이해</a><span aria-hidden="true">/</span>${page.source?'<span>현대물리</span><span aria-hidden="true">/</span>':''}<span aria-current="page">${esc(title)}</span></div></nav><div class="layout"><div id="book-navigation">${sidebar(page)}</div><main id="main" tabindex="-1">${body}</main></div><footer class="site-footer"><div><strong>물리의 이해</strong><p>원저자 정기수 교수님 · 원본 <a href="http://physica.gnu.ac.kr/" target="_blank" rel="noopener">physica.gnu.ac.kr</a></p><p>경상국립대학교 물리학과 졸업생의 &quot;물리의 이해&quot; 2020ver 리폼 및 복원 프로젝트</p><p>경상국립대학교 공식 서비스가 아닙니다. (공식이 될 수 있도록 곧 허락 받아올게요)</p><a href="about.html">출처와 복원 범위</a></div></footer></body></html>`;
}
for (const [i, page] of pages.entries()) {
 activeTerms=graph.terms(page);
 const source = 'http://physica.gnu.ac.kr/phtml/modern/q_statistics/' + page.source;
 const contents = `<div class="page-heading"><div><p class="chapter-name">${page.title}</p><h1>${page.subtitle}</h1></div><button data-print>인쇄</button></div><div class="reading-info"><span>원저자 정기수 교수님</span><span>${i+1} / ${pages.length}쪽</span><a href="${source}" target="_blank" rel="noopener">원본 페이지 ↗</a></div><nav class="section-menu" aria-label="이 페이지의 내용">${page.sections.map(x=>`<a href="#section-${x.id}">${x.title}</a>`).join('')}</nav><article>${page.sections.map(x=>`<section class="content-row" id="section-${x.id}"><h2>${esc(x.title)}</h2><div class="row-body">${x.blocks.map(block).join('')}</div></section>`).join('')}${graph.related(page)}</article><nav class="page-turn" aria-label="교재 페이지 이동">${i?`<a href="${pages[i-1].file}"><span>← 이전</span>${pages[i-1].subtitle}</a>`:'<span></span>'}${i<pages.length-1?`<a href="${pages[i+1].file}"><span>다음 →</span>${pages[i+1].subtitle}</a>`:'<a href="index.html"><span>목차로</span>양자통계 복원본</a>'}</nav>`;
 fs.writeFileSync(path.join(root,page.file),shell(page.subtitle,contents,page));
}
fs.writeFileSync(path.join(root,'index.html'),shell('웹교재 목차',nav.index));
for(const [file,body] of Object.entries({...nav.extra,...graph.extra})) fs.writeFileSync(path.join(root,file),shell({'materials.html':'자료종류별','search.html':'내부검색','headwords.html':'표제어 목록','browse.html':'찾아보기','lesson.html':'복원 준비 중','network.html':'개념 네트워크','concept.html':'개념 안내'}[file],body));
activeTerms=[];
const about = `<div class="page-heading"><div><p class="chapter-name">동문 복원 프로젝트</p><h1>사이트 안내</h1></div><button data-print>인쇄</button></div>${aboutGuide}<section class="content-row" id="author"><h2>원저자</h2><div class="row-body"><p>원본 - 물리의 이해 (정기수 경상국립대 명예교수님 작). 교수님께서 학생들의 물리학 학습을 돕기 위해 제작하신 웹교재입니다. 수식과 그림에 움직임과 조작을 더해, 물리 현상을 직접 살펴보며 배울 수 있는 길을 열어 주셨습니다.</p><p>경상대학교 물리학과에서 이어 온 교수님의 교육적 기여에 감사드립니다. 동문으로서 이 교재가 다시 학생들에게 읽히고 활용될 수 있도록, 원본의 구성과 물리 모형을 존중하며 복원합니다. 교수님의 소개에 담긴 물리교육·멀티미디어 교재·전산물리의 관심은 이 작업에서도 이어 가고자 합니다.</p>${authorFacts}<p><a href="https://sites.google.com/view/gnu-physics-job/유용한-서비스사이트" target="_blank" rel="noopener">학과의 원본 소개 ↗</a></p></div></section>${publications(root)}<section class="content-row" id="restoration"><h2>복원 범위</h2><div class="row-body"><p>전체 목차 566쪽의 탐색 구조를 마련했습니다. 본문과 실험을 복원한 범위는 양자통계 3쪽과 응용 5쪽이며, 나머지는 복원 준비 안내와 원본 링크를 제공합니다. 표제어 목록·찾아보기는 원본의 제목과 출처 링크를 연결합니다. 양자통계 3쪽과 응용 5쪽의 구성·수식·실험 목적을 따릅니다. Flash 9개의 ActionScript와 기존 Canvas 도식 7개를 분석하고 독립적인 웹 코드로 다시 구현했습니다.</p><p>원문 문장·교재 사진·본문 그림·SWF·추출 코드는 공개본에 복제하지 않습니다. 상단 로고는 제공해 주신 원본 로고의 색을 낮춰 사용합니다. 설명과 질문은 새로 서술했고, 원본 전체는 각 쪽의 링크에서 확인할 수 있습니다. 원본 자료를 그대로 재배포하는 것은 별도 허락 여부를 확인한 뒤 진행합니다.</p><p><a href="http://physica.gnu.ac.kr/info/info_cont.html#copyright" target="_blank" rel="noopener">원본 저작권 안내 ↗</a></p></div></section><section class="content-row"><h2>수식과 모형</h2><div class="row-body"><ul><li>LaTeX를 KaTeX 0.19.0으로 미리 컴파일했습니다. 수식 글꼴과 MathML을 함께 제공합니다.</li><li>${notation.kB}와 파수 k를 구별하고, 현대 SI 상수를 사용했습니다.</li><li>FD 분포의 경계 한 점은 T→0⁺ 극한의 1/2입니다.</li><li>BE의 비물리적인 ε≤μ 영역을 제외합니다.</li><li>아인슈타인 에너지의 차원과 저온 지수 부호를 바로잡았습니다.</li><li>자유전자에서 원본의 μ≈εF 근사와 입자수 보존 계산을 구분합니다.</li><li>중성자별은 원본의 균일·비상대론·뉴턴 중력 모형이며 실제 관측용 계산이 아닙니다.</li></ul><p><a href="docs/reconstruction.md">파일별 분석과 변경 근거</a></p></div></section><section class="content-row"><h2>색상과 서체</h2><div class="row-body"><p>이 저장소의 <a href="https://github.com/Gahyoun/gnu-network-science-skills/blob/main/templates/gnu-template/SKILL.md">GNU template</a>에서 학교색 GNU Blue #009EDB와 GNU Grey #43525A를 가져왔습니다. 작은 글자·버튼에는 대비를 확보한 청색 #0069B4를 사용합니다. Noto Sans KR와 SUITE, 수식 글꼴은 로컬에 포함했습니다. 본문 서체는 교재에 사용된 글자로 축소하고 OFL에 따라 내부 이름을 PhysicaText·PhysicaTitle로 바꿨습니다.</p><p><a href="https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?cntntsId=1198&mi=1369" target="_blank" rel="noopener">대학 VI 출처 ↗</a></p></div></section>`;
fs.writeFileSync(path.join(root,'about.html'),shell('사이트 안내',about));
fs.copyFileSync(path.join(root,'src/physics.mjs'),path.join(root,'assets/physics.mjs'));
// New Korean text must be included in both local font subsets.
const coverage = new Set(JSON.parse(fs.readFileSync(path.join(root,'docs/font-report.json'),'utf8')).hangulCodepoints);
const browserText = fs.readdirSync(root).filter(f=>f.endsWith('.html')).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('') + fs.readFileSync(path.join(root,'assets/app.mjs'),'utf8') + fs.readFileSync(path.join(root,'assets/navigation.mjs'),'utf8');
const missing = [...new Set([...browserText].filter(c=>c.codePointAt(0)>=0xAC00&&c.codePointAt(0)<=0xD7A3&&!coverage.has(c.codePointAt(0))))];
if(missing.length) throw Error(`Local fonts lack Korean characters: ${missing.join('')}. Run python3 tools/subset-fonts.py and rebuild.`);
fs.writeFileSync(path.join(root,'docs/build-report.json'),JSON.stringify({katexVersion:katex.version,pages:pages.length,mathExpressions:mathCount,uiNotations:Object.keys(notation).length,navigation:nav.report,network:graph.report,widgets:pages.flatMap(p=>p.sections.flatMap(s=>s.blocks.filter(b=>b.type==='widget'))).length},null,2)+'\n');
console.log(`Built ${pages.length} textbook pages + 9 navigation pages; compiled ${mathCount} LaTeX expressions.`);
