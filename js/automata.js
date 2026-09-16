// Sparse Conway Life with viewport painting and authentic RLE machines.
(function () {
const canvas = document.getElementById('automata-canvas'), home = document.getElementById('home');
if (!canvas || !home) return;
const ctx = canvas.getContext('2d'), pause = document.getElementById('pause-universe');
const stats = document.getElementById('universe-stats'), source = document.getElementById('life-pattern-source');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const stride = 65536, origin = 32768;
const key = (x,y) => (y+origin)*stride+x+origin;
const xy = k => [k%stride-origin, Math.floor(k/stride)-origin];
const offsets = [-stride-1,-stride,-stride+1,-1,1,stride-1,stride,stride+1];
let cells = new Set(), generation=0, paused=reduced.matches, visible=true, active=false;
let mode='paint', name='', bag=[], width=0, height=0, frame=null, last=0, dragging=false, previous;
let camera={x:0,y:0,scale:8};
const seeds=[[[1,0],[2,1],[0,2],[1,2],[2,2]],[[0,0],[1,0],[0,1],[1,1]],[[1,0],[2,0],[3,0],[0,1],[1,1],[2,1]]];
function plant(points,x,y){for(const [dx,dy] of points) cells.add(key(x+dx,y+dy));}
function step(){
 const counts=new Map();
 for(const k of cells) for(const d of offsets) counts.set(k+d,(counts.get(k+d)||0)+1);
 const next=new Set();
 for(const [k,n] of counts) if(n===3||(n===2&&cells.has(k))) next.add(k);
 cells=next; generation++;
}
function fit(immediate=false){
 if(!cells.size)return;
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const k of cells){const [x,y]=xy(k);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 const s=Math.min(4,(width-32)/(x1-x0+25),(height-100)/(y1-y0+25));
 const f=immediate?1:0.15;
 camera.scale+=(s-camera.scale)*f;
 camera.x+=((x0+x1+1)/2-width/2/camera.scale-camera.x)*f;
 camera.y+=((y0+y1+1)/2-height/2/camera.scale-camera.y)*f;
}
function draw(){
 ctx.clearRect(0,0,width,height);
 ctx.fillStyle=mode==='pattern'?'rgba(35,35,35,0.48)':'rgba(0,0,0,0.08)';
 const s=camera.scale;
 for(const k of cells){const [x,y]=xy(k),px=(x-camera.x)*s,py=(y-camera.y)*s;
 if(px>=-s&&py>=-s&&px<=width&&py<=height)ctx.fillRect(px,py,Math.max(.65,s),Math.max(.65,s));}
 stats.textContent=(name?name+' · ':'')+'generation '+generation.toLocaleString()+' · '+cells.size.toLocaleString()+' alive';
}
function resize(){
 const r=canvas.getBoundingClientRect();width=r.width;height=r.height;
 const d=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);
 if(mode==='pattern')fit(true);draw();
}
function stop(){dragging=false;previous=null;}
function reset(){stop();cells.clear();generation=0;active=false;mode='paint';name='';camera={x:0,y:0,scale:8};source.hidden=true;draw();}
function animate(time){
 frame=null;if(!visible||paused||document.hidden)return;
 if(active&&time-last>=(mode==='pattern'?60:100)){
 const end=performance.now()+18;
 for(let i=0;i<(mode==='pattern'?4:1);i++){step();if(performance.now()>end)break;}
 if(mode==='pattern')fit();draw();last=time;
 }
 frame=requestAnimationFrame(animate);
}
function sync(){
 if(frame!==null)cancelAnimationFrame(frame);frame=null;
 pause.textContent=paused?'let it live':'pause';pause.setAttribute('aria-pressed',String(paused));
 if(visible&&!paused&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate);}
}
function readRLE(text){
 const lines=text.split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith('#'));
 if(!/rule\s*=\s*b3\/s23/i.test(lines.shift()))throw Error('Unsupported Life rule');
 let x=0,y=0,digits='';const points=[];
 for(const t of lines.join('').replace(/\s/g,'')){
 if(/\d/.test(t)){digits+=t;continue;}
 const n=Number(digits)||1;digits='';
 if(t==='o'){for(let i=0;i<n;i++)points.push([x+i,y]);x+=n;}
 else if(t==='b')x+=n;else if(t==='$'){y+=n;x=0;}else if(t==='!')break;
 }return points;
}
function surprise(){
 reset();const patterns=window.LIFE_PATTERNS;
 if(!bag.length){bag=patterns.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
 const p=patterns[bag.pop()];plant(readRLE(p.previewRle || p.rle),0,0);generation=p.previewGeneration || 0;
 mode='pattern';name=p.name;active=true;source.href=p.source;source.hidden=false;
 fit(true);paused=reduced.matches;draw();sync();
}
const at=e=>({x:Math.floor(e.clientX/camera.scale+camera.x),y:Math.floor(e.clientY/camera.scale+camera.y)});
const canPaint=e=>visible&&!e.target.closest('a, button, input, textarea, select');
const seed=(x,y)=>plant(seeds[Math.floor(Math.random()*seeds.length)],x,y);
document.addEventListener('pointerdown',e=>{
 if(e.button!==0||!canPaint(e)||e.isPrimary===false)return;
 dragging=true;previous=at(e);if(e.pointerType==='mouse')e.preventDefault();
 seed(previous.x,previous.y);
 if(!active){for(let i=0;i<5;i++)seed(Math.floor(Math.random()*width/8),Math.floor(Math.random()*height/8));active=true;}draw();
});
document.addEventListener('pointermove',e=>{
 if(!canPaint(e))return;const p=at(e);
 if(!dragging){if(mode==='paint'&&active&&e.pointerType==='mouse'&&Math.random()<.1){seed(p.x,p.y);draw();}return;}
 const distance=Math.max(Math.abs(p.x-previous.x),Math.abs(p.y-previous.y));
 for(let i=1;i<=distance;i++)seed(Math.round(previous.x+(p.x-previous.x)*i/distance),Math.round(previous.y+(p.y-previous.y)*i/distance));
 previous=p;draw();
});
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,stop));window.addEventListener('blur',stop);
pause.addEventListener('click',()=>{paused=!paused;sync();});
document.getElementById('reset-universe').addEventListener('click',reset);
document.getElementById('seed-chaos').addEventListener('click',surprise);
document.addEventListener('visibilitychange',sync);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)reset();sync();}).observe(home);
new ResizeObserver(resize).observe(canvas);
resize();reset();sync();
})();
