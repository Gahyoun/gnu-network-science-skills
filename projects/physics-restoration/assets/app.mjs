import * as P from './physics.mjs';
const BLUE='#0069b4', CYAN='#009edb', GREY='#43525a', LIGHT='#e9edf0';
const svgNS='http://www.w3.org/2000/svg';
const fmt=(v,d=3)=>Number.isFinite(v)?Number(v.toPrecision(d)).toLocaleString('ko-KR',{maximumFractionDigits:8}):'—';
const sci=v=>{if(!Number.isFinite(v))return '—';const [m,e]=v.toExponential(3).split('e');return `${m} × 10<sup>${Number(e)}</sup>`;};
const escaped=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function slider(key,label,min,max,step,value,unit='') {
 return `<label class="control"><span class="control-head"><span>${label}</span><output data-for="${key}">${value} ${unit}</output></span><input type="range" data-key="${key}" data-unit="${unit}" aria-label="${label}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}
function select(key,label,options,value) {
 return `<label class="control"><span>${label}</span><select data-key="${key}" aria-label="${label}">${options.map(([v,t])=>`<option value="${v}" ${v==value?'selected':''}>${t}</option>`).join('')}</select></label>`;
}
const legend=`<div class="legend"><span><i></i>BE · 실선</span><span><i class="dashed"></i>MB · 긴 점선</span><span><i class="dotted"></i>FD · 짧은 점선</span></div>`;
const readout=(label,value)=>`<span>${label} <strong>${value}</strong></span>`;
const line=(x1,y1,x2,y2,color=GREY,width=1,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const text=(x,y,s,attrs='')=>`<text x="${x}" y="${y}" ${attrs}>${escaped(s)}</text>`;
const circle=(x,y,r,color=BLUE,attrs='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${attrs}/>`;
function svg(title,body,h=320,desc=title) {
 return `<svg class="plot" xmlns="${svgNS}" viewBox="0 0 740 ${h}" role="img" aria-label="${escaped(title)}"><title>${escaped(title)}</title><desc>${escaped(desc)}</desc>${body}</svg>`;
}
function chart({title,xmin=0,xmax=8,ymin=0,ymax=1.2,xlabel='ε / eV',ylabel='평균 점유수',curves=[],markers=[],areas=[],point,xticks}) {
 const left=64,right=720,top=32,bottom=264;
 const X=x=>left+(x-xmin)/(xmax-xmin)*(right-left),Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let body='';
 for(let i=0;i<=4;i++) {
  const y=ymin+(ymax-ymin)*i/4;
  body+=line(left,Y(y),right,Y(y),'#dce2e6')+text(left-10,Y(y)+5,fmt(y),`text-anchor="end"`);
 }
 const ticks=xticks||Array.from({length:6},(_,i)=>xmin+(xmax-xmin)*i/5);
 for(const x of ticks) body+=line(X(x),top,X(x),bottom,LIGHT)+text(X(x),bottom+23,fmt(x),`text-anchor="middle"`);
 body+=line(left,top,left,bottom)+line(left,bottom,right,bottom)+text(left,18,ylabel,'class="axis-label"')+text((left+right)/2,309,xlabel,'text-anchor="middle" class="axis-label"');
 const paths=[];
 function pathFor(fn,a=xmin,b=xmax,base=false) {
  let d='',active=false;
  for(let i=0;i<=400;i++) {
   const x=a+(b-a)*i/400,y=fn(x);
   if(!Number.isFinite(y)){active=false;continue;}
   const px=X(x),py=Y(Math.min(ymax*5,Math.max(ymin-(ymax-ymin)*5,y)));
   if(!active) {d+=`${base?'M'+X(x)+','+Y(0)+'L':'M'}${px},${py}`;active=true;} else d+=`L${px},${py}`;
  }
  if(base&&active)d+=`L${X(b)},${Y(0)}Z`;
  return d;
 }
 for(const a of areas) paths.push(`<path d="${pathFor(a.fn,a.a,a.b,true)}" fill="${a.color||CYAN}" opacity="${a.opacity||.18}"/>`);
 for(const c of curves)paths.push(`<path d="${pathFor(c.fn)}" fill="none" stroke="${c.color||BLUE}" stroke-width="${c.width||2.6}" ${c.dash?`stroke-dasharray="${c.dash}"`:''}/>`);
 for(const m of markers) if(m.x>=xmin&&m.x<=xmax){paths.push(line(X(m.x),top,X(m.x),bottom,m.color||GREY,1.5,'5 4'));body+=text(X(m.x),top-9,m.label||'',`text-anchor="middle"`);}
 if(point)paths.push(circle(X(point.x),Y(point.y),4,BLUE));
 const clip=`clip-${++chart.counter}`;
 body+=`<defs><clipPath id="${clip}"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/></clipPath></defs><g clip-path="url(#${clip})">${paths.join('')}</g>`;
 return svg(title,body,320,`${xlabel} 가로축, ${ylabel} 세로축. 슬라이더 값과 계산 결과는 그래프 아래에 표시한다.`);
}
chart.counter=0;

function mount(el,state,controls,draw,{animate=false,actions=[]}={}) {
 const buttons=actions.map(([id,label])=>`<button data-action="${id}">${label}</button>`).join('');
 el.innerHTML=`<p class="mobile-figure-hint">그림을 좌우로 밀어 전체를 볼 수 있습니다.</p><div data-view tabindex="0" aria-label="실험 그림"></div><div class="controls">${controls}</div>${animate||buttons?`<div class="button-row">${animate?'<button data-action="play" class="primary" aria-pressed="false">재생</button><button data-action="reset">초기화</button>':''}${buttons}</div>`:''}<div class="readouts" role="status" aria-live="polite" data-readouts></div><p class="figure-note" data-note></p>`;
 let running=false,visible=true,time=0,last=0,lastPaint=0,frame=0;
 function update() {
  const result=draw(state,time);
  el.querySelector('[data-view]').innerHTML=result.svg;
  const r=el.querySelector('[data-readouts]');
  if(r.innerHTML!==result.readouts)r.innerHTML=result.readouts||'';
  el.querySelector('[data-note]').textContent=result.note||'';
  el.querySelectorAll('input[data-key]').forEach(input=>{
   input.value=state[input.dataset.key];
   const out=el.querySelector(`[data-for="${input.dataset.key}"]`);
   if(out)out.textContent=fmt(state[input.dataset.key],5)+' '+input.dataset.unit;
  });
 }
 function tick(now) {
  frame=0;
  if(!running||!visible||document.hidden)return;
  if(last)time+=Math.min((now-last)/1000,.06);
  last=now;if(now-lastPaint>=50){update();lastPaint=now;}frame=requestAnimationFrame(tick);
 }
 function resume(){if(running&&visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick);}}
 el.addEventListener('input',e=>{
  const key=e.target.dataset.key;if(!key)return;
  state[key]=e.target.tagName==='SELECT'?e.target.value:Number(e.target.value);update();
 });
 const initial={...state};
 el.addEventListener('click',e=>{
  const a=e.target.closest('[data-action]')?.dataset.action;
  if(a==='play'){running=!running;e.target.textContent=running?'일시정지':'재생';e.target.setAttribute('aria-pressed',String(running));if(!running){cancelAnimationFrame(frame);frame=0;}resume();}
  if(a==='reset'){Object.assign(state,initial);time=0;el.querySelectorAll('select[data-key]').forEach(x=>x.value=state[x.dataset.key]);update();}
  if(a==='visible'){state.low=400;state.high=700;update();}
  if(a==='sun'){state.T=5800;update();}
 });
 if(animate){new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}resume();},{rootMargin:'100px'}).observe(el);document.addEventListener('visibilitychange',resume);}
 update();return {state,update};
}

function stateWidget(el,kind) {
 const state={N:2,configuration:0};
 const controls=select('N','입자수',[[2,'2개'],[3,'3개']],2)+slider('configuration','점유 배열',0,9,1,0);
 mount(el,state,controls,s=>{
  const N=Number(s.N),configs=P.stateConfigurations(kind,N,4).sort((a,b)=>a.reduce((v,n,i)=>v+n*(i+1),0)-b.reduce((v,n,i)=>v+n*(i+1),0));
  s.configuration=Math.min(s.configuration,configs.length-1);el.querySelector('input[data-key="configuration"]').max=configs.length-1;
  const counts=configs[s.configuration],energy=counts.reduce((v,n,i)=>v+n*(i+1),0);
  let particle=0;
  let body=text(75,26,'단일입자 상태')+text(330,26,`${N}개 입자의 점유 배열`)+text(596,26,'계상태 에너지');
  for(let i=0;i<4;i++){
   const y=220-i*44;
   body+=line(58,y,210,y,GREY,1.5)+text(40,y+5,`ε${i+1}`,'text-anchor="end"');
   body+=line(290,y,500,y,GREY,1.5);
   for(let n=0;n<counts[i];n++,particle++)body+=circle(340+n*46,y-10,10,kind==='MB'?[BLUE,CYAN,GREY][particle]:BLUE)+text(340+n*46,y-6,kind==='MB'?String.fromCharCode(65+particle):'','text-anchor="middle" style="fill:white;font-size:11px"');
   body+=text(523,y+5,`n${i+1}=${counts[i]}`);
  }
  const max=kind==='FD'?9:4*N,min=kind==='FD'?N*(N+1)/2:N;
  for(let E=min;E<=max;E++){
   const y=230-(E-min)/(max-min||1)*165,number=configs.filter(c=>c.reduce((v,n,i)=>v+n*(i+1),0)===E).length;
   body+=line(595,y,712,y,E===energy?BLUE:LIGHT,E===energy?3:1)+text(583,y+4,E,'text-anchor="end"');
   for(let k=0;k<number;k++)body+=circle(606+k*9,y-5,3,E===energy?BLUE:GREY);
  }
  let rows=configs.map((c,i)=>`<tr><td>${i+1}</td><td>(${c.join(', ')})</td><td>${c.reduce((v,n,j)=>v+n*(j+1),0)}</td>${kind==='MB'?`<td>${P.classicalMultiplicity(c)}</td>`:''}</tr>`).join('');
  const total=kind==='MB'?4**N:configs.length;
  const table=`<details class="questions"><summary>가능한 배열 ${configs.length}개 보기</summary><table class="state-table"><caption>εᵢ=i인 예제 · 에너지는 같은 임의 단위</caption><thead><tr><th scope="col">번호</th><th scope="col">(n₁,n₂,n₃,n₄)</th><th scope="col">에너지</th>${kind==='MB'?'<th scope="col">교환 중복도</th>':''}</tr></thead><tbody>${rows}</tbody></table></details>`;
  return {svg:svg(`${kind} 입자의 점유수와 계상태`,body,270)+table,readouts:readout('통계',kind)+readout('입자수',N)+readout('미시상태수',total)+readout('선택 에너지',energy),note:kind==='MB'?'입자는 A·B·C로 구별한다. 하나의 점유 배열에 N!/∏nᵢ!개의 미시상태가 대응한다.':'네 단일입자 상태의 에너지를 1·2·3·4로 둔 도식이다. 동일 입자의 교환은 새 상태로 세지 않는다.'};
 });
}
function distributionWidget(el,scaled=false) {
 const state={alpha:0,kt:5};
 const controls=slider('alpha','α',scaled?-2:-10,scaled?2:10,.1,0)+(scaled?'':slider('kt','kBT',.2,10,.1,5,'eV'));
 mount(el,state,controls,s=>{
  const arg=e=>s.alpha+e/(scaled?1:s.kt);
  const curves=[{kind:'BE',color:BLUE},{kind:'MB',color:GREY,dash:'8 5'},{kind:'FD',color:CYAN,dash:'2 5'}].map(c=>({...c,fn:e=>P.occupancy(arg(e),c.kind)}));
  return {svg:legend+chart({title:'MB·BE·FD의 평균 점유수 비교',xmax:scaled?7:11,ymax:1.25,xlabel:scaled?'ε / (kBT)':'ε / eV',ylabel:'f(ε) · 평균 점유수',curves,markers:scaled?[]:[{x:s.kt,label:'kBT'}]}),readouts:readout('α',fmt(s.alpha))+readout('μ',scaled?fmt(-s.alpha)+' kBT':fmt(-s.alpha*s.kt)+' eV'),note:s.alpha<0?'BE는 ε > μ에서만 표시한다. μ>0인 매개변수는 바닥에너지 0인 보손 기체의 평형을 뜻하지 않는다.':'BE 발산은 유한한 세로축 밖으로 이어진다. 이 그래프는 점유수이며 정규화된 확률밀도가 아니다.'};
 });
}
function fermiWidget(el) {
 mount(el,{T:5000,ef:4},slider('ef','페르미 에너지',0,7,.1,4,'eV')+slider('T','온도',0,10000,100,5000,'K'),s=>{
  const refs=[0,2000,4000,6000,8000,10000].map((T,i)=>({fn:e=>P.fermi(e,s.ef,T),color:'#b6c4cf',width:1,dash:i%2?'3 3':''}));
  const kt=P.C.kEV*s.T;
  return {svg:chart({title:'페르미 분포의 온도 변화',xmax:8,ymax:1.1,ylabel:'fFD(ε)',curves:[...refs,{fn:e=>P.fermi(e,s.ef,s.T),color:BLUE}],markers:[{x:s.ef,label:'εF',color:BLUE},{x:kt,label:'kBT',color:CYAN}],point:{x:s.ef,y:.5}}),readouts:readout('온도',`${s.T} K`)+readout('kBT',fmt(kt)+' eV')+readout('f(εF)',s.T?'0.5':'0.5 (연속 극한)'),note:'μ≈εF를 고정한 원본 근사다. 옅은 기준선은 0, 2000, 4000, 6000, 8000, 10000 K다.'};
 });
}
function densityWidget(el) {
 mount(el,{mu:2,kt:.5,kind:'FD'},select('kind','입자 통계',[['FD','FD · 페르미온'],['BE','BE · 보손'],['MB','MB · 고전입자']],'FD')+slider('kt','kBT',.1,2,.1,.5,'임의 단위')+slider('mu','화학퍼텐셜',-2,3,.1,2,'임의 단위'),s=>{
  const input=el.querySelector('input[data-key="mu"]');input.max=s.kind==='BE'?0:3;if(s.kind==='BE')s.mu=Math.min(s.mu,0);
  const f=e=>P.occupancy((e-s.mu)/s.kt,s.kind),g=e=>Math.sqrt(e);
  return {svg:chart({title:'상태밀도와 점유수의 곱',xmax:6,ymax:3,xlabel:'ε · 임의 단위',ylabel:'g, f, g×f · 상대값',curves:[{fn:g,color:GREY,dash:'8 5'},{fn:f,color:CYAN,dash:'2 5'},{fn:e=>g(e)*f(e),color:BLUE}]}),readouts:readout('통계',s.kind)+readout('g(ε)','√ε')+readout('dN/dε','g(ε)×f(ε)'),note:'g의 비례상수를 1로 둔 상대값이다. BE에서는 μ≤0으로 제한한다. 실선은 입자 분포, 긴 점선은 상태밀도, 짧은 점선은 점유수다.'};
 });
}
function mode1Widget(el) {
 mount(el,{j:10},slider('j','모드수 j',1,30,1,10), (s,t)=>{
  let d='';for(let i=0;i<=400;i++){const x=i/400;d+=`${i?'L':'M'}${65+x*620},${95-54*P.modeWave(x,s.j,t*.65)}`;}
  let body=line(65,95,685,95,LIGHT)+line(65,32,65,158,GREY,3)+line(685,32,685,158,GREY,3)+`<path d="${d}" fill="none" stroke="${BLUE}" stroke-width="3"/>`;
  for(let i=0;i<=s.j;i++)body+=circle(65+620*i/s.j,95,2.5,GREY);
  body+=text(375,185,'고정된 양 끝 · L=1 m','text-anchor="middle"');
  for(let j=1;j<=30;j++)body+=circle(65+(j-1)*620/29,230,j===s.j?7:3,j===s.j?BLUE:(j>=18&&j<=19?CYAN:GREY));
  body+=text(65,264,'j=1')+text(685,264,'j=30','text-anchor="end"');
  return {svg:svg('1차원 정상파와 허용 모드',body,280),readouts:readout('j',s.j)+readout('파수 k',fmt(Math.PI*s.j)+' m⁻¹')+readout('파장 λ',fmt(2/s.j)+' m'),note:'마디는 변위가 0인 점이다. 시간은 관찰하기 편하도록 느리게 표시했다.'};
 },{animate:true});
}
function mode2Widget(el) {
 mount(el,{jx:7,jy:3},slider('jx','가로 모드 jₓ',1,20,1,7)+slider('jy','세로 모드 jᵧ',1,20,1,3),(s,t)=>{
  let body=text(184,22,'모드 격자 (jₓ,jᵧ)','text-anchor="middle"')+text(542,22,'선택한 정상파 · 변위의 부호','text-anchor="middle"');
  const baseX=56,baseY=267,scale=12;
  body+=line(baseX,baseY,baseX+252,baseY)+line(baseX,baseY,baseX,27);
  for(let x=1;x<=20;x++)for(let y=1;y<=20;y++){
   const r=Math.hypot(x,y),selected=x===s.jx&&y===s.jy;
   body+=circle(baseX+x*scale,baseY-y*scale,selected?5:r>=18&&r<=19?3:1.8,selected?BLUE:r>=18&&r<=19?CYAN:'#929ea7');
  }
  for(const r of [18,19])body+=`<path d="M${baseX+r*scale},${baseY}A${r*scale},${r*scale} 0 0 0 ${baseX},${baseY-r*scale}" fill="none" stroke="${CYAN}" stroke-width="1.2"/>`;
  body+=line(baseX,baseY,baseX+s.jx*scale,baseY-s.jy*scale,BLUE,2);
  const x0=390,y0=42,size=228,alpha=Math.cos(t*.9);
  for(let x=0;x<s.jx;x++)for(let y=0;y<s.jy;y++){
   const positive=(x+y)%2===0,color=(positive===(alpha>=0))?BLUE:CYAN;
   body+=`<rect x="${x0+x*size/s.jx}" y="${y0+y*size/s.jy}" width="${size/s.jx+.1}" height="${size/s.jy+.1}" fill="${color}" opacity="${.2+.7*Math.abs(alpha)}"/>`;
   if(s.jx<=8&&s.jy<=8)body+=text(x0+(x+.5)*size/s.jx,y0+(y+.5)*size/s.jy+4,positive?(alpha>=0?'+':'−'):(alpha>=0?'−':'+'),'text-anchor="middle" style="fill:white"');
  }
  body+=text(180,300,'청색 띠 18≤j≤19','text-anchor="middle"');
  const j=Math.hypot(s.jx,s.jy);
  return {svg:svg('2차원 모드 격자와 마디 패턴',body,320),readouts:readout('(jₓ,jᵧ)',`(${s.jx},${s.jy})`)+readout('j',fmt(j))+readout('k',fmt(Math.PI*j)+' m⁻¹')+readout('λ',fmt(2/j)+' m'),note:'선 사이의 경계가 마디다. 청색과 진한 청색, +/− 기호로 변위의 부호를 구별한다. L=1 m.'};
 },{animate:true});
}
function mode3Widget(el) {
 const state={angle:35,tilt:25};
 const mounted=mount(el,state,slider('angle','수평 회전',-180,180,1,35,'°')+slider('tilt','수직 회전',-80,80,1,25,'°'),s=>{
  const yaw=s.angle*Math.PI/180,tilt=s.tilt*Math.PI/180;
  const project=([x,y,z])=>{const a=x*Math.cos(yaw)-z*Math.sin(yaw),b=x*Math.sin(yaw)+z*Math.cos(yaw),c=y*Math.cos(tilt)-b*Math.sin(tilt),depth=y*Math.sin(tilt)+b*Math.cos(tilt);return [360+a*18,263-c*18,depth];};
  let body='';
  for(let axis=0;axis<3;axis++){
   const v=[0,0,0];v[axis]=12;
   const a=project([0,0,0]),b=project(v);body+=line(a[0],a[1],b[0],b[1],GREY,1.5)+text(b[0]+5,b[1],['jₓ','jᵧ','jz'][axis]);
  }
  for(let axis=0;axis<3;axis++)for(const r of [11,11.55]){
   let d='';for(let i=0;i<=40;i++){const a=i*Math.PI/80,v=[0,0,0];v[(axis+1)%3]=r*Math.cos(a);v[(axis+2)%3]=r*Math.sin(a);const p=project(v);d+=`${i?'L':'M'}${p[0]},${p[1]}`;}body+=`<path d="${d}" fill="none" stroke="${CYAN}" stroke-width="1.5"/>`;
  }
  const points=P.modeCount(3,11,11.55,7).map(p=>({...p,screen:project(p.v)})).sort((a,b)=>a.screen[2]-b.screen[2]);
  for(const p of points)body+=circle(p.screen[0],p.screen[1],p.selected?4:2,p.selected?BLUE:'#8e9ba5',`opacity="${p.selected?1:.45}"`);
  return {svg:svg('3차원 양의 정수 모드 격자와 1/8 구껍질',body,340),readouts:readout('격자점','7³ = 343개')+readout('11≤j≤11.55',points.filter(p=>p.selected).length+'개')+readout('근사 상태수','(π/2)j²dj'),note:'구껍질의 양의 팔분공간을 표시한다. 화면을 끌어 회전하거나 아래 슬라이더로 각도를 조절할 수 있다.'};
 });
 let drag=null;
 el.addEventListener('pointerdown',e=>{if(!e.target.closest('svg'))return;drag={x:e.clientX,y:e.clientY,a:state.angle,t:state.tilt};el.setPointerCapture(e.pointerId);e.preventDefault();});
 el.addEventListener('pointermove',e=>{if(!drag)return;state.angle=Math.max(-180,Math.min(180,drag.a+(e.clientX-drag.x)*.5));state.tilt=Math.max(-80,Math.min(80,drag.t+(e.clientY-drag.y)*.5));mounted.update();});
 const end=()=>drag=null;el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.classList.add('drag-plot');
}
function blackbodyWidget(el) {
 const state={T:5000,low:400,high:700,point:500};
 const controls=slider('T','온도',500,10000,50,5000,'K')+slider('point','선택한 파장',10,30000,10,500,'nm')+slider('low','적분 시작',0,30000,10,400,'nm')+slider('high','적분 끝',0,30000,10,700,'nm');
 const mounted=mount(el,state,controls,s=>{
  const peak=P.WIEN/s.T*1e9,xmax=Math.max(3000,3*peak),fn=nm=>P.spectralRadiancy(nm,s.T),ymax=fn(peak)*1.15;
  const [a,b]=[s.low,s.high].sort((a,b)=>a-b),band=P.bandRadiancy(a,b,s.T),total=P.SIGMA*s.T**4;
  return {svg:chart({title:'흑체복사 분광출력과 선택한 적분 영역',xmax,ymax,xlabel:'λ / nm',ylabel:'Rλ / W m⁻² nm⁻¹',curves:[{fn}],areas:[{fn,a:Math.min(xmax,a),b:Math.min(xmax,b)}],markers:[{x:peak,label:'λmax',color:GREY}],point:s.point<=xmax?{x:s.point,y:fn(s.point)}:null}),readouts:readout('λmax',fmt(peak,5)+' nm')+readout('σT⁴',sci(total)+' W/m²')+readout(`${a}–${b} nm`,sci(band)+' W/m²')+readout('선택 구간 비율',fmt(band/total*100,5)+' %')+readout(`${s.point} nm`,sci(fn(s.point))+' W m⁻² nm⁻¹'),note:'세로축과 파장 표시 범위는 자동으로 조절된다. 선택 구간 전체를 수치적분하며, 파장별 최대치와 전체 출력은 서로 다른 양이다.'};
 },{actions:[['visible','가시광선 400–700 nm'],['sun','태양 표면 5800 K']]});
 el.addEventListener('click',e=>{const svg=e.target.closest('svg');if(!svg)return;const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*740,xmax=Math.max(3000,3*P.WIEN/state.T*1e9);state.point=Math.round(Math.max(10,Math.min(30000,(x-64)/(720-64)*xmax))/10)*10;mounted.update();});
}
function spring(a,b,width=2){return line(a[0],a[1],b[0],b[1],'#8496a1',width,'3 3');}
function latticeWidget(el) {
 mount(el,{mode:1,amplitude:8},slider('mode','결합 진동 모드',1,3,1,1)+slider('amplitude','도식 진폭',0,15,1,8),(s,t)=>{
  let body=text(170,25,'아인슈타인 · 동일 진동수','text-anchor="middle"')+text(535,25,'데바이 · 연결된 진동 모드','text-anchor="middle"');
  for(let x=0;x<2;x++)for(let y=0;y<2;y++){
   const cx=96+x*140,cy=92+y*135,dx=s.amplitude*Math.cos(t*2+x+y);
   const a=[cx+dx,cy];body+=`<rect x="${cx-53}" y="${cy-53}" width="106" height="106" fill="none" stroke="${LIGHT}"/>`;
   for(const b of [[cx-53,cy],[cx+53,cy],[cx,cy-53],[cx,cy+53]])body+=spring(a,b);body+=circle(...a,8,BLUE);
  }
  const pts=[];for(let x=0;x<5;x++)for(let y=0;y<4;y++)pts.push([418+x*54+s.amplitude*Math.sin(Math.PI*s.mode*(x+1)/6)*Math.sin(Math.PI*(y+1)/5)*Math.cos(t*2),75+y*55,x,y]);
  for(const p of pts){for(const q of pts)if((q[2]===p[2]+1&&q[3]===p[3])||(q[3]===p[3]+1&&q[2]===p[2]))body+=spring(p,q,1.5);body+=circle(p[0],p[1],6.5,BLUE);}
  return {svg:svg('개별 진동자와 연결된 격자의 진동',body,310),readouts:readout('개별 모형','동일한 ω')+readout('결합 모형',s.mode+'번째 공간 패턴'),note:'원본과 같은 개별/연결 모형의 개념도다. 표시 시간·진폭은 시각화 축척이며 실제 재료의 동역학을 수치적으로 푼 결과가 아니다.'};
 },{animate:true});
}
const debyeCurveCache=new Map();
function cachedDebye(x){if(!debyeCurveCache.has(x))debyeCurveCache.set(x,P.debyeCV(x));return debyeCurveCache.get(x);}
function heatWidget(el) {
 mount(el,{ratio:.3},slider('ratio','T / 특성온도 Θ',.01,3,.01,.3),s=>{
  const a=P.einsteinCV(s.ratio),b=P.debyeCV(s.ratio);
  return {svg:chart({title:'아인슈타인과 데바이의 정규화 비열',xmax:3,ymax:1.1,xlabel:'T / Θ (같은 특성온도)',ylabel:'CV / (3NkB)',curves:[{fn:x=>P.einsteinCV(x),color:GREY,dash:'8 5'},{fn:cachedDebye,color:BLUE},{fn:()=>1,color:CYAN,dash:'2 5'}],markers:[{x:s.ratio,label:'선택 T/Θ'}]}),readouts:readout('아인슈타인',fmt(a,5))+readout('데바이',fmt(b,5))+readout('고전 극한','1'),note:'실선: 데바이, 긴 점선: 아인슈타인, 짧은 점선: 뒬롱–프티. 같은 Θ를 둔 모델 비교이며 특정 재료의 측정 데이터가 아니다.'};
 });
}
function electronWidget(el) {
 mount(el,{T:500,ef:6,conserve:'approx'},slider('ef','페르미 에너지',1,12,.1,6,'eV')+slider('T','온도',0,2000,10,500,'K')+select('conserve','화학퍼텐셜 계산',[['approx','원본 근사 · μ≈εF'],['fixed','입자수 N 보존']],'approx'),s=>{
  const mu=s.conserve==='fixed'?P.chemicalPotential(s.ef,s.T):s.ef,m=P.electronMoments(s.ef,s.T,mu),xmax=s.ef*1.5,g=e=>1.5*Math.sqrt(e)/s.ef**1.5,n=e=>g(e)*P.fermi(e,mu,s.T);
  return {svg:chart({title:'금속 전자의 상태밀도와 에너지 분포',xmax,ymax:g(xmax)*1.1,ylabel:'g/N₀, n/N₀ · eV⁻¹',curves:[{fn:g,color:GREY,dash:'8 5'},{fn:n,color:BLUE}],areas:[{fn:n,a:0,b:xmax}],markers:[{x:s.ef,label:'εF',color:BLUE}]}),readouts:readout('μ',fmt(mu,6)+' eV')+readout('N(T)/N₀',fmt(m.number,7))+readout('평균에너지',fmt(m.energy/m.number,6)+' eV')+readout('0 K 평균',fmt(.6*s.ef)+' eV'),note:s.conserve==='fixed'?'상태밀도로 적분한 입자수가 N₀가 되도록 μ를 수치적으로 구했다. 실선은 분포, 점선은 두 스핀 상태를 포함한 상태밀도다.':'μ≈εF를 고정한 원본 근사다. 이 근사에서는 온도를 올리면 적분한 입자수에 작은 변화가 생긴다. N₀는 0 K의 입자수다.'};
 });
}
function metalWidget(el) {
 mount(el,{T:500,ef:6},slider('T','온도',0,2000,10,500,'K')+slider('ef','페르미 에너지',1,12,.1,6,'eV'),s=>{
  const kt=P.C.kEV*s.T,range=Math.max(.1,kt*8),f=x=>P.fermi(x,0,s.T);
  const delta=Math.PI**2/4*kt**2/s.ef;
  return {svg:chart({title:'페르미면 주변의 전자와 정공',xmin:-range,xmax:range,ymax:1.1,xlabel:'ε − μ / eV',ylabel:'점유수 / 정공수',curves:[{fn:f,color:BLUE}],areas:[{fn:f,a:0,b:range,color:BLUE},{fn:x=>1-f(x),a:-range,b:0,color:CYAN}],markers:[{x:0,label:'μ'}]}),readouts:readout('kBT',fmt(kt)+' eV')+readout('ΔE/N',fmt(delta)+' eV')+readout('CV/(NkB)',fmt(Math.PI**2/2*kt/s.ef)),note:'음영: μ 아래의 정공과 μ 위의 들뜬 전자. 상태밀도를 g(εF)로 일정하게 둔 국소 근사이며 ΔE와 CV는 kBT≪εF에서 유효하다.'};
 });
}
function starWidget(el) {
 mount(el,{mass:1.5},slider('mass','질량 / 태양질량',.5,2.5,.05,1.5),s=>{
  const model=P.neutronStar(s.mass),radius=100*Math.min(1.4,model.R/P.neutronStar(1.5).R);
  let body=text(180,24,'내부 층 · 개념도 (축척 아님)','text-anchor="middle"');
  body+=circle(170,178,radius,'#d5eaf5')+circle(170,178,radius*.9,CYAN)+circle(170,178,radius*.67,BLUE)+circle(170,178,radius*.3,GREY);
  for(const [y,l] of [[70,'바깥층'],[117,'안쪽 껍질'],[167,'핵물질'],[214,'중심부']])body+=text(285,y,l)+line(228,y,275,y,GREY);
  body+=text(565,25,'원본 교육 모형 · R ∝ M⁻¹ᐟ³','text-anchor="middle"');
  let path='';for(let i=0;i<=100;i++){const mass=.5+i*.02,R=P.neutronStar(mass).R/1000;path+=`${i?'L':'M'}${425+i*2.5},${277-(R-8)*23}`;}
  body+=line(425,60,425,277)+line(425,277,690,277)+`<path d="${path}" fill="none" stroke="${BLUE}" stroke-width="3"/>`+circle(425+(s.mass-.5)/2*250,277-(model.R/1000-8)*23,5,BLUE);
  body+=text(425,302,'0.5')+text(680,302,'2.5','text-anchor="end"')+text(557,326,'질량 / 태양질량','text-anchor="middle"')+text(425,44,'반경 / km')+text(412,277,'8','text-anchor="end"')+text(412,70,'17','text-anchor="end"');
  return {svg:svg('중성자별의 층 구조 개념도와 교육 모형의 질량–반경 관계',body,345),readouts:readout('R',fmt(model.R/1000,5)+' km')+readout('밀도',sci(model.rho)+' kg/m³')+readout('축퇴압력',sci(model.pressure)+' Pa')+readout('중성자 εF',fmt(model.efMEV,5)+' MeV'),note:'층 구조는 원본 도식의 개념을 새로 그린 것으로 계산 모형의 균일밀도와 구별한다. 슬라이더 결과는 상대론·핵력·실제 상태방정식을 포함하지 않는다.'};
 });
}
function boltzmannWidget(el) {
 mount(el,{kt:1},slider('kt','열에너지 kBT',.1,3,.1,1,'임의 단위'),s=>{
  const weights=[0,1,2,3].map(e=>Math.exp(-e/s.kt)),Z=weights.reduce((a,b)=>a+b,0);
  let body=`<rect x="48" y="58" width="238" height="196" fill="#f4f5f6" stroke="#aebbc4"/>`+text(167,40,'열저장체 R','text-anchor="middle"')+text(520,40,'입자계 S · 네 에너지 준위','text-anchor="middle"');
  for(let i=0;i<12;i++){const x=70+(i%4)*55,y=88+Math.floor(i/4)*64;body+=circle(x,y,5,CYAN);}
  body+=line(286,155,358,155,BLUE,3)+text(321,139,'열적 접촉','text-anchor="middle"');
  for(let i=0;i<4;i++){const y=245-i*49,prob=weights[i]/Z;body+=line(392,y,682,y,LIGHT)+text(386,y+5,`ε=${i}`,'text-anchor="end"')+`<rect x="430" y="${y-17}" width="${210*prob}" height="17" fill="${BLUE}"/>`+text(683,y-2,`${fmt(prob*100,4)} %`,'text-anchor="end"');}
  return {svg:svg('열저장체와 볼츠만 확률',body,278),readouts:readout('분배함수 Z',fmt(Z,5))+readout('바닥상태 확률',fmt(weights[0]/Z*100,5)+' %'),note:'높은 에너지 준위로 갈수록 확률이 줄어든다. 같은 kBT=1에서 이웃한 준위의 확률비는 e⁻¹이다.'};
 });
}
const renderers={'boltzmann':boltzmannWidget,'mb-states':e=>stateWidget(e,'MB'),'be-states':e=>stateWidget(e,'BE'),'fd-states':e=>stateWidget(e,'FD'),'distributions':e=>distributionWidget(e,false),'scaled-distributions':e=>distributionWidget(e,true),'fermi-edge':fermiWidget,'density-product':densityWidget,'mode-1d':mode1Widget,'mode-2d':mode2Widget,'mode-3d':mode3Widget,'blackbody':blackbodyWidget,'lattice':latticeWidget,'heat-capacity':heatWidget,'free-electrons':electronWidget,'metal-energy':metalWidget,'neutron-star':starWidget};
for(const el of document.querySelectorAll('[data-widget]')){
 const render=renderers[el.dataset.widget];
 if(!render)throw new Error(`Unknown interactive: ${el.dataset.widget}`);
 render(el);
}
document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
const toggle=document.querySelector('.menu-toggle'),navigation=document.getElementById('book-navigation');
if(toggle&&navigation){
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.dataset.open=String(open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.dataset.open==='true'){navigation.dataset.open='false';toggle.setAttribute('aria-expanded','false');toggle.focus();}});
}

let printDetails=[];
window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('details')].map(el=>[el,el.open]);printDetails.forEach(([el])=>el.open=true);});
window.addEventListener('afterprint',()=>printDetails.forEach(([el,open])=>el.open=open));
