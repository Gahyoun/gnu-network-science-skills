// Directed, unweighted concept relations. Repeated source blocks form one edge.
export function adjacency(nodes,edges){
 const out=new Map(nodes.map(n=>[n.id,new Set()])),incoming=new Map(nodes.map(n=>[n.id,new Set()]));
 for(const e of edges){if(out.has(e.source)&&out.has(e.target)&&e.source!==e.target){out.get(e.source).add(e.target);incoming.get(e.target).add(e.source);}}
 return {out,incoming};
}
export function egoNodes(center,hops,direction,adj){
 const found=new Set([center]);let frontier=[center];
 for(let depth=0;depth<hops;depth++){
  const next=[];
  for(const id of frontier){const neighbors=[...(direction!=='in'?adj.out.get(id)||[]:[]),...(direction!=='out'?adj.incoming.get(id)||[]:[])];
   for(const n of neighbors)if(!found.has(n)){found.add(n);next.push(n);}}
  frontier=next;
 }
 return found;
}
export function measures(nodes,edges){
 const adj=adjacency(nodes,edges),n=nodes.length,m=edges.length;
 let paired=0,components=0;const seen=new Set();
 for(const e of edges)if(adj.out.get(e.target)?.has(e.source))paired++;
 for(const node of nodes)if(!seen.has(node.id)){
  components++;const queue=[node.id];seen.add(node.id);
  for(let i=0;i<queue.length;i++)for(const v of [...adj.out.get(queue[i]),...adj.incoming.get(queue[i])])if(!seen.has(v)){seen.add(v);queue.push(v);}
 }
 return {nodes:n,edges:m,density:n>1?m/(n*(n-1)):0,reciprocity:m?paired/m:0,components,adj};
}
export function pageRank(nodes,edges,{damping=.85,iterations=100,tolerance=1e-10}={}){
 const n=nodes.length;if(!n)return new Map();const {out}=adjacency(nodes,edges);let rank=new Map(nodes.map(v=>[v.id,1/n]));
 for(let i=0;i<iterations;i++){
  let dangling=0;for(const v of nodes)if(!out.get(v.id).size)dangling+=rank.get(v.id);
  const next=new Map(nodes.map(v=>[v.id,(1-damping)/n+damping*dangling/n]));
  for(const v of nodes){const links=out.get(v.id);for(const to of links)next.set(to,next.get(to)+damping*rank.get(v.id)/links.size);}
  let diff=0;for(const v of nodes)diff+=Math.abs(next.get(v.id)-rank.get(v.id));rank=next;if(diff<tolerance)break;
 }
 return rank;
}
