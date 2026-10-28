import {adjacency,egoNodes,measures} from './network-model.mjs';
const host=document.querySelector('[data-network]'),conceptHost=document.querySelector('[data-concept-detail]');
const el=(tag,text,attrs={})=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;};
const link=(text,href)=>el('a',text,{href});
const load=()=>fetch(new URL('./network.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('네트워크 자료를 불러오지 못했습니다.');return r.json();});
if(host||conceptHost)load().then(data=>{
 const byId=new Map(data.nodes.map(n=>[n.id,n])),byLabel=new Map(data.nodes.map(n=>[n.label,n]));
 const adj=adjacency(data.nodes,data.edges);
 if(conceptHost){
  const n=byId.get(new URL(location.href).searchParams.get('id'));
  if(!n){conceptHost.querySelector('.row-body').replaceChildren(el('p','개념을 찾지 못했습니다. 표제어 목록에서 다시 선택해 주세요.'));return;}
  document.querySelector('[data-concept-title]').textContent=n.label;document.title=n.label+' | 물리의 이해';
  const body=conceptHost.querySelector('.row-body');body.replaceChildren(el('p',n.section));
  body.append(link('이 개념의 관계 보기 →','network.html?ego='+n.id));
  if(n.restoredHref)body.append(el('p'),link('복원된 교재 읽기 →',n.restoredHref));
  else body.append(el('p','이 개념의 본문은 복원 준비 중입니다. 원본과 관련내용을 먼저 연결합니다.'));
  for(const source of n.sources)body.append(el('p',null),el('a','원본의 해당 개념 ↗',{href:source,target:'_blank',rel:'noopener'}));
  for(const [heading,ids] of [['나가는 관련내용',adj.out.get(n.id)],['들어오는 관련내용',adj.incoming.get(n.id)]]){
   body.append(el('h3',heading));const list=el('ul');for(const id of ids){const item=el('li');item.append(link(byId.get(id).label,byId.get(id).href));list.append(item);}body.append(ids.size?list:el('p','연결된 항목이 없습니다.'));
  }return;
 }
 const query=host.querySelector('[data-ego-query]'),mode=host.querySelector('[data-network-mode]'),direction=host.querySelector('[data-network-direction]'),hops=host.querySelector('[data-network-hops]'),section=host.querySelector('[data-network-section]'),status=host.querySelector('[data-network-status]');
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),labels=host.querySelector('[data-network-labels]');
 const categories=[...new Set(data.nodes.map(n=>n.section))],shapes=['circle','square','diamond','triangle','hexagon','ring','cross','circle'];
 const palette=['#527d9c','#688874','#a96d78','#997d48','#82709f','#487f80','#aa7958','#73808a'];
 const darkPalette=['#98bfdc','#a2c0a7','#df9ba9','#d7bf83','#bdaadc','#9acdcc','#dfb693','#becbd3'];
 const legend=host.querySelector('[data-network-legend]');
 categories.forEach((name,i)=>{const item=el('span'),mark=el('i',null,{class:'network-key '+shapes[i]});mark.style.setProperty('--network-color',palette[i]);mark.style.setProperty('--network-color-dark',darkPalette[i]);item.append(mark,document.createTextNode(name));legend.append(item);});
 const options=host.querySelector('datalist');const fragment=document.createDocumentFragment();data.nodes.forEach(n=>fragment.append(el('option',null,{value:n.label})));options.append(fragment);
 let selected=byId.get(new URL(location.href).searchParams.get('ego'))||byLabel.get('양자통계')||data.nodes[0];
 query.value=selected.label;let visibleNodes=[],visibleEdges=[],positions=new Map(),metrics,zoom=1,pan={x:0,y:0},width=800,height=520,frame=0,layoutFrame=0;
 let colors={},theme='light';
 const color=n=>(theme==='dark'?darkPalette:palette)[categories.indexOf(n.section)]||palette[0];
 const radius=n=>n.id===selected.id?10:4+Math.min(6,Math.sqrt(n.inDegree+n.outDegree)*.5);
 function refreshColors(){const css=getComputedStyle(document.documentElement);theme=document.documentElement.dataset.theme;colors={bg:css.getPropertyValue('--ui-bg').trim(),text:css.getPropertyValue('--ui-text').trim(),line:css.getPropertyValue('--ui-line').trim(),accent:css.getPropertyValue('--ui-action').trim()};schedule();}
 new MutationObserver(refreshColors).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});refreshColors();
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});}
 function drawShape(x,y,r,shape){ctx.beginPath();if(shape==='square')ctx.rect(x-r,y-r,2*r,2*r);else if(shape==='diamond'){ctx.moveTo(x,y-r*1.3);ctx.lineTo(x+r*1.3,y);ctx.lineTo(x,y+r*1.3);ctx.lineTo(x-r*1.3,y);ctx.closePath();}else if(shape==='triangle'){ctx.moveTo(x,y-r*1.3);ctx.lineTo(x+r,y+r);ctx.lineTo(x-r,y+r);ctx.closePath();}else if(shape==='hexagon'){for(let i=0;i<6;i++){const a=i*Math.PI/3;const xx=x+r*Math.cos(a),yy=y+r*Math.sin(a);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();}else if(shape==='cross'){ctx.rect(x-r,y-r/3,2*r,2*r/3);ctx.rect(x-r/3,y-r,2*r/3,2*r);}else ctx.arc(x,y,r,0,Math.PI*2);}
 function draw(){
  const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle=colors.bg;ctx.fillRect(0,0,width,height);
  ctx.save();ctx.translate(width/2+pan.x,height/2+pan.y);ctx.scale(zoom,zoom);
  for(const e of visibleEdges){const a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
   const end={x:b.x-ux*(radius(byId.get(e.target))+3),y:b.y-uy*(radius(byId.get(e.target))+3)},active=e.source===selected.id||e.target===selected.id;
   ctx.strokeStyle=active?colors.accent:colors.line;ctx.globalAlpha=active?.85:(visibleEdges.length>500?.2:.65);ctx.lineWidth=(active?1.8:1)/Math.sqrt(zoom);ctx.beginPath();ctx.moveTo(a.x+ux*radius(byId.get(e.source)),a.y+uy*radius(byId.get(e.source)));ctx.lineTo(end.x,end.y);ctx.stroke();
   if(active||visibleEdges.length<300||zoom>1.5){const arrow=5/Math.sqrt(zoom);ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(end.x,end.y);ctx.lineTo(end.x-ux*arrow-uy*arrow*.6,end.y-uy*arrow+ux*arrow*.6);ctx.lineTo(end.x-ux*arrow+uy*arrow*.6,end.y-uy*arrow-ux*arrow*.6);ctx.closePath();ctx.fill();}
  }
  ctx.globalAlpha=1;
  for(const n of visibleNodes){const p=positions.get(n.id),r=radius(n);ctx.fillStyle=color(n);ctx.strokeStyle=n.id===selected.id?colors.accent:colors.bg;ctx.lineWidth=(n.id===selected.id?3:1)/Math.sqrt(zoom);drawShape(p.x,p.y,r,shapes[categories.indexOf(n.section)]);ctx.fill();ctx.stroke();
   if(n.id===selected.id||labels.checked||visibleNodes.length<65||zoom>2){ctx.font=`${Math.max(10,12/Math.sqrt(zoom))}px PhysicaText, sans-serif`;ctx.fillStyle=colors.text;ctx.textAlign='center';ctx.textBaseline='top';ctx.strokeStyle=colors.bg;ctx.lineWidth=4/zoom;ctx.strokeText(n.label,p.x,p.y+r+5);ctx.fillText(n.label,p.x,p.y+r+5);}
  }ctx.restore();
 }
 function fit(){if(!positions.size)return;const ps=[...positions.values()],xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);const minX=Math.min(...xs)-35,maxX=Math.max(...xs)+35,minY=Math.min(...ys)-35,maxY=Math.max(...ys)+35;zoom=Math.max(.08,Math.min(2.5,(width-50)/(maxX-minX),(height-70)/(maxY-minY)));pan={x:-(minX+maxX)/2*zoom,y:-(minY+maxY)/2*zoom};schedule();}
 function initLayout(){
  cancelAnimationFrame(layoutFrame);positions=new Map();
  const smallEgo=mode.value==='ego'&&visibleNodes.length<=120;
  if(smallEgo){
   const neighbors=visibleNodes.filter(n=>n.id!==selected.id),near=egoNodes(selected.id,1,'both',adj);
   for(const [ring,list] of [[1,neighbors.filter(n=>near.has(n.id))],[2,neighbors.filter(n=>!near.has(n.id))]])list.forEach((n,i)=>{const angle=-Math.PI/2+i*2*Math.PI/Math.max(1,list.length),rad=Math.max(150,list.length*18)*ring;positions.set(n.id,{x:Math.cos(angle)*rad,y:Math.sin(angle)*rad,vx:0,vy:0});});
  }else{
   const groups=new Map(categories.map(c=>[c,[]]));visibleNodes.forEach(n=>groups.get(n.section).push(n));
   categories.forEach((c,g)=>groups.get(c).forEach((n,i)=>{const angle=i*2.399963,rad=20*Math.sqrt(i),a=g*2*Math.PI/categories.length;positions.set(n.id,{x:Math.cos(a)*420+Math.cos(angle)*rad,y:Math.sin(a)*420+Math.sin(angle)*rad,vx:0,vy:0});}));
  }
  if(smallEgo&&visibleNodes.some(n=>n.id===selected.id))positions.set(selected.id,{x:0,y:0,vx:0,vy:0,fixed:true});
  if(mode.value==='ego'&&positions.has(selected.id))positions.set(selected.id,{x:0,y:0,vx:0,vy:0,fixed:true});fit();if(smallEgo)return;let iteration=0;
  function step(){
   if(document.hidden){layoutFrame=0;return;}const cellSize=65,grid=new Map();
   for(const [id,p] of positions){const gx=Math.floor(p.x/cellSize),gy=Math.floor(p.y/cellSize),key=gx+','+gy;const cell=grid.get(key)||[];cell.push([id,p]);grid.set(key,cell);p.vx*=.55;p.vy*=.55;p.vx-=p.x*.0009;p.vy-=p.y*.0009;}
   for(const [id,p] of positions){const gx=Math.floor(p.x/cellSize),gy=Math.floor(p.y/cellSize);for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++)for(const [other,q] of grid.get(x+','+y)||[]){if(other===id)continue;let dx=p.x-q.x,dy=p.y-q.y,ds=dx*dx+dy*dy+.5;if(ds<1){dx=1;dy=.5;ds=1;}const f=Math.min(4,550/ds);p.vx+=dx/Math.sqrt(ds)*f;p.vy+=dy/Math.sqrt(ds)*f;}}
   for(const e of visibleEdges){const a=positions.get(e.source),b=positions.get(e.target);const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,f=(len-100)*.007;a.vx+=dx/len*f;a.vy+=dy/len*f;b.vx-=dx/len*f;b.vy-=dy/len*f;}
   for(const p of positions.values())if(!p.fixed){p.x+=Math.max(-8,Math.min(8,p.vx));p.y+=Math.max(-8,Math.min(8,p.vy));}schedule();
   if(++iteration<100)layoutFrame=requestAnimationFrame(step);else{layoutFrame=0;fit();}
  }layoutFrame=requestAnimationFrame(step);
 }
 const detail=host.querySelector('[data-network-detail]');
 function details(){
  detail.replaceChildren(el('h2',selected.label),el('p',selected.section),link('교재에서 읽기 →',selected.restoredHref||selected.href),el('p',null),link('이 개념 중심으로 보기','network.html?ego='+selected.id));
  const tabs=[['나가는 관련내용',adj.out.get(selected.id)],['들어오는 관련내용',adj.incoming.get(selected.id)]];
  for(const [heading,ids] of tabs){detail.append(el('h3',heading+' · '+ids.size));const list=el('ul');for(const id of [...ids].sort((a,b)=>byId.get(a).label.localeCompare(byId.get(b).label,'ko'))){const row=el('li'),b=el('button',byId.get(id).label,{type:'button'});b.addEventListener('click',()=>choose(byId.get(id)));row.append(b,link('교재',byId.get(id).restoredHref||byId.get(id).href));list.append(row);}detail.append(list);}
 }
 function ranking(){
  const result=host.querySelector('[data-network-ranking]');result.replaceChildren();
  for(const n of [...visibleNodes].sort((a,b)=>b.pageRank-a.pageRank).slice(0,50)){
   const row=el('tr'),td=el('td'),button=el('button',n.label);button.addEventListener('click',()=>choose(n));td.append(button);row.append(td,el('td',n.section),el('td',metrics.adj.incoming.get(n.id).size),el('td',metrics.adj.out.get(n.id).size),el('td',n.pageRank.toFixed(5)));result.append(row);
  }
  const dl=host.querySelector('[data-network-metrics]');dl.replaceChildren();for(const [name,value] of [['개념',metrics.nodes],['방향 연결',metrics.edges],['밀도',metrics.density.toFixed(4)],['상호 연결 비율',(metrics.reciprocity*100).toFixed(1)+'%'],['약연결 성분',metrics.components]]){const pair=el('div');pair.append(el('dt',name),el('dd',value));dl.append(pair);}
 }
 function update(){
  const scope=mode.value==='ego'?egoNodes(selected.id,Number(hops.value),direction.value,adj):new Set(byId.keys());
  visibleNodes=data.nodes.filter(n=>scope.has(n.id)&&(section.value==='all'||n.section===section.value));const ids=new Set(visibleNodes.map(n=>n.id));visibleEdges=data.edges.filter(e=>ids.has(e.source)&&ids.has(e.target));metrics=measures(visibleNodes,visibleEdges);
  status.textContent=`${mode.value==='ego'?selected.label+' 중심 '+hops.value+'단계':'전체 네트워크'} · 개념 ${visibleNodes.length}개 · 방향 연결 ${visibleEdges.length}개`;
  canvas.dataset.nodeCount=visibleNodes.length;canvas.dataset.edgeCount=visibleEdges.length;
  direction.disabled=hops.disabled=mode.value==='all';details();ranking();initLayout();
  const u=new URL(location.href);u.searchParams.set('ego',selected.id);u.searchParams.set('mode',mode.value);u.searchParams.set('direction',direction.value);u.searchParams.set('hops',hops.value);u.searchParams.set('section',section.value);history.replaceState(null,'',u);
 }
 function choose(n){selected=n;query.value=n.label;update();}
 host.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const n=byLabel.get(query.value.trim());if(n)choose(n);else status.textContent='목록에 있는 개념을 선택해 주세요.';});
 for(const control of [mode,direction,hops,section])control.addEventListener('change',update);
 const u=new URL(location.href);for(const [key,control] of [['mode',mode],['direction',direction],['hops',hops],['section',section]])if([...control.options].some(o=>o.value===u.searchParams.get(key)))control.value=u.searchParams.get(key);
 host.querySelector('[data-network-fit]').addEventListener('click',fit);host.querySelector('[data-network-layout]').addEventListener('click',initLayout);labels.addEventListener('change',schedule);
 host.querySelectorAll('[data-network-zoom]').forEach(b=>b.addEventListener('click',()=>{zoom=Math.max(.08,Math.min(8,zoom*Number(b.dataset.networkZoom)));schedule();}));
 host.querySelector('[data-network-export]').addEventListener('click',()=>{const report={...data.report,scope:{mode:mode.value,center:selected.id,direction:direction.value,hops:Number(hops.value),section:section.value},nodes:visibleNodes,edges:visibleEdges};const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=link('',url);a.download='physica-concept-network.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 new ResizeObserver(()=>{const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);fit();}).observe(canvas);
 function world(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-width/2-pan.x)/zoom,y:(e.clientY-r.top-height/2-pan.y)/zoom};}
 function hit(p){let best=null,dist=18/zoom;for(const n of visibleNodes){const q=positions.get(n.id),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<Math.max(radius(n)+4,dist)){best=n;dist=d;}}return best;}
 const pointers=new Map();let drag=null,pinch=null;
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};drag=null;return;}const n=hit(world(e));drag={id:e.pointerId,node:n,startX:e.clientX,startY:e.clientY,pan:{...pan},moved:false};if(n)positions.get(n.id).fixed=true;});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()];zoom=Math.max(.08,Math.min(8,pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance)));schedule();return;}if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.hypot(dx,dy)>4)drag.moved=true;if(drag.node){Object.assign(positions.get(drag.node.id),world(e));}else pan={x:drag.pan.x+dx,y:drag.pan.y+dy};schedule();});
 function release(e){pointers.delete(e.pointerId);if(drag?.id===e.pointerId){if(drag.node&&!drag.moved)choose(drag.node);drag=null;}if(pointers.size<2)pinch=null;}
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('wheel',e=>{e.preventDefault();const before=world(e),factor=Math.exp(-e.deltaY*.001);zoom=Math.max(.08,Math.min(8,zoom*factor));const r=canvas.getBoundingClientRect();pan={x:e.clientX-r.left-width/2-before.x*zoom,y:e.clientY-r.top-height/2-before.y*zoom};schedule();},{passive:false});
 canvas.addEventListener('keydown',e=>{const move={ArrowLeft:[30,0],ArrowRight:[-30,0],ArrowUp:[0,30],ArrowDown:[0,-30]}[e.key];if(move){e.preventDefault();pan.x+=move[0];pan.y+=move[1];schedule();}else if(e.key==='+'||e.key==='='){zoom=Math.min(8,zoom*1.25);schedule();}else if(e.key==='-'){zoom=Math.max(.08,zoom*.8);schedule();}else if(e.key==='0')fit();});
 update();document.fonts.ready.then(schedule);
}).catch(e=>{const area=host?.querySelector('[data-network-status]')||conceptHost?.querySelector('.row-body');if(area)area.textContent=e.message+' 페이지를 새로고침해 주세요.';});
