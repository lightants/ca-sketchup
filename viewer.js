const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const palette=[[86,124,113],[141,169,119],[201,194,141],[232,219,175]];
function tint(t){const x=clamp(t,0,1)*2.999,i=Math.floor(x);return palette[i].map((v,k)=>v+(palette[i+1][k]-v)*(x-i));}

// Orthographic projection makes the source-to-screen mapping affine on each
// DEM triangle. Fill with a transformed pattern, which reuses the same texture
// in the browser without copying image pixels to JavaScript on each frame.
function drawOverlayFace(ctx, pattern, matrix, uv, points, a, b, c) {
 const [u,v]=uv[a], du1=uv[b][0]-u, dv1=uv[b][1]-v;
 const du2=uv[c][0]-u, dv2=uv[c][1]-v;
 const [x,y]=points[a], dx1=points[b][0]-x, dy1=points[b][1]-y;
 const dx2=points[c][0]-x, dy2=points[c][1]-y;
 const det=du1*dv2-du2*dv1;
 matrix.a=(dx1*dv2-dx2*dv1)/det;
 matrix.b=(dy1*dv2-dy2*dv1)/det;
 matrix.c=(dx2*du1-dx1*du2)/det;
 matrix.d=(dy2*du1-dy1*du2)/det;
 matrix.e=x-matrix.a*u-matrix.c*v;
 matrix.f=y-matrix.b*u-matrix.d*v;
 pattern.setTransform(matrix);
 ctx.fillStyle=pattern;
 ctx.fill();
 ctx.strokeStyle=pattern;
 ctx.stroke();
}
export function modelGeometry(t){
 const {rows,cols,extent,heights}=t, positions=new Float64Array(rows*cols*3), indices=new Uint32Array((rows-1)*(cols-1)*6);
 let n=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const i=r*cols+c;positions.set([(c/(cols-1)-.5)*extent,(.5-r/(rows-1))*extent,heights[i]],3*i);
  if(r+1<rows&&c+1<cols){indices.set([i,i+cols+1,i+1,i,i+cols,i+cols+1],n);n+=6;}
 }
 return {positions,indices};
}
export class Viewer{
 constructor(canvas,onView,onProbe){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onView=onView;this.onProbe=onProbe;this.tool='orbit';this.style='elevation';this.pointers=new Map();
  this.fit(false);this.bind();new ResizeObserver(()=>this.drawSoon()).observe(canvas);
 }
 fit(notify=true){this.yaw=-.55;this.tilt=.64;this.zoom=1;this.dx=0;this.dy=0;this.probed=null;if(notify)this.drawSoon();}
 setModel(t){this.clearOverlay();this.model=t;this.geometry=t.parcel || modelGeometry(t);this.fit();this.prepare();}
 setOverlay(texture) {
  if (!this.model) throw new Error('Generate terrain before adding imagery.');
  this.overlay={texture,matrix:new DOMMatrix()};
  this.prepareOverlayUVs();
  this.drawSoon();
 }
 clearOverlay(){this.overlay=null;this.drawSoon();}
 prepareOverlayUVs(){
  if (!this.overlay || !this.mesh) return;
  const {texture}=this.overlay, size=texture.width, extent=this.model.extent;
  this.overlay.uv=this.mesh.verts.map(([x,y])=>[(.5+x/extent)*size,(.5-y/extent)*size]);
  this.overlay.surface=texture;
  this.overlay.pattern=this.ctx.createPattern(texture,'no-repeat');
 }
 prepare(){
  if(!this.model)return;const t=this.model, {rows,cols,extent,heights,min,max}=t;
  if(t.parcel){
   const {positions,indices}=t.parcel;
   const verts=[],triangles=[];
   for(let i=0;i<positions.length;i+=3)verts.push([positions[i],positions[i+1],positions[i+2]]);
   for(let i=0;i<indices.length;i+=3){
    const a=indices[i],b=indices[i+1],c=indices[i+2];
    const [x,y,z]=verts[a],q=verts[b],r=verts[c];
    const dx=q[0]-x,dy=q[1]-y,dz=q[2]-z;
    const ex=r[0]-x,ey=r[1]-y,ez=r[2]-z;
    const nx=dy*ez-dz*ey,ny=dz*ex-dx*ez,nz=dx*ey-dy*ex;
    const light=clamp(.65+.5*(-nx*.55+ny*.34+nz*.77)/Math.hypot(nx,ny,nz),.50,1.15);
    const shade=this.style==='elevation'?tint(((z+q[2]+r[2])/3-min)/Math.max(.1,max-min)):[160,182,146];
    triangles.push([a,b,c,'rgb('+shade.map(v=>Math.round(v*light)).join(',')+')']);
   }
   this.baseZ=min-extent*.055;this.midZ=(max+this.baseZ)/2;
   this.mesh={verts,triangles,sides:[]};this.prepareOverlayUVs();this.drawSoon();return;
  }
  // Limit on-screen mesh density during orbit. Downloads retain every sampled vertex.
  const stride=Math.max(1,Math.ceil((rows-1)/82)),sample=[];
  for(let a=0;a<rows-1;a+=stride)sample.push(a);sample.push(rows-1);
  const n=sample.length,verts=[],colors=[],triangles=[],sides=[];
  this.baseZ=min-extent*.055;this.midZ=(max+this.baseZ)/2;
  for(const r of sample)for(const c of sample){
   const z=heights[r*cols+c];verts.push([(c/(cols-1)-.5)*extent,(.5-r/(rows-1))*extent,z]);
   const l=Math.max(0,c-1),e=Math.min(cols-1,c+1),u=Math.max(0,r-1),d=Math.min(rows-1,r+1);
   const gx=(heights[r*cols+e]-heights[r*cols+l])/((e-l)*extent/(cols-1));
   const gy=(heights[u*cols+c]-heights[d*cols+c])/((d-u)*extent/(rows-1));
   const intensity=clamp(.61+.54*(.77+gx*.55-gy*.34)/Math.hypot(gx,gy,1),.52,1.14);
   const color=this.style==='elevation'?tint((z-min)/Math.max(max-min,.1)):[160,182,146];
   colors.push(color.map(v=>v*intensity));
  }
  const add=(a,b,c)=>{const col=colors[a].map((v,k)=>Math.round((v+colors[b][k]+colors[c][k])/3));triangles.push([a,b,c,'rgb('+col.join(',')+')']);};
  for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const i=r*n+c;add(i,i+n+1,i+1);add(i,i+n,i+n+1);}
  for(let s=0;s<4;s++){const edge=Array.from({length:n},(_,i)=>[i,i*n+n-1,(n-1)*n+(n-1-i),(n-1-i)*n][s]);sides.push(edge);}
  this.mesh={verts,triangles,sides};this.prepareOverlayUVs();this.drawSoon();
 }
 project(x,y,z){
  const {co,si,ct,st,k,ox,oy}=this.cam;const lateral=x*co-y*si;const north=x*si+y*co;
  return [ox+k*lateral,oy-k*(north*st+(z-this.midZ)*ct),north*ct-(z-this.midZ)*st];
 }
 drawSoon(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.draw();});}
 draw(){
  const cv=this.canvas,ctx=this.ctx,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const dpr=Math.min(2.5,window.devicePixelRatio||1);
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(!this.mesh)return;
  const extent=this.model.extent,k=this.zoom*Math.min(w*.77/extent,h*.79/extent),co=Math.cos(this.yaw),si=Math.sin(this.yaw),ct=Math.cos(this.tilt),st=Math.sin(this.tilt);
  this.cam={co,si,ct,st,k,ox:w*.51+this.dx,oy:h*.50+this.dy};
  const path=(ps,close=false)=>{ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i][0],ps[i][1]);if(close)ctx.closePath();};
  const q=(x,y)=>this.project(x,y,this.baseZ-extent*.025),span=extent*2.5;
  ctx.strokeStyle='rgba(88,113,91,.13)';ctx.lineWidth=.65;
  for(let i=-24;i<=24;i++){const off=i*extent/10;path([q(-span,off),q(span,off)]);ctx.stroke();path([q(off,-span),q(off,span)]);ctx.stroke();}
  const {verts,triangles,sides}=this.mesh;const p=verts.map(v=>this.project(...v));this.projected=p;
  for(const [j,edge] of sides.entries()){
   const a=p[edge[0]],b=p[edge.at(-1)];if(b[0]>=a[0]||this.tilt>1.569)continue;
   const bottoms=edge.map(i=>this.project(verts[i][0],verts[i][1],this.baseZ));
   path([...edge.map(i=>p[i]),...bottoms.reverse()],true);ctx.fillStyle=['#b2b39c','#a1a68f','#a8ac94','#babda5'][j];ctx.fill();
   ctx.strokeStyle='#88967d';ctx.lineWidth=.7;ctx.stroke();
  }
  // An orthographic depth ordering also supports the software canvas on browsers without WebGL.
  ctx.lineJoin='round';
  const overlay=this.overlay, flatDrape=overlay && !this.model.parcel && Math.abs(ct)<1e-8 && this.style!=='wire';
  if(flatDrape){
   const corner=this.project(-extent/2,extent/2,this.midZ), m=k*extent/overlay.texture.width;
   ctx.save();
   ctx.transform(m*co,-m*si,m*si,m*co,corner[0],corner[1]);
   ctx.drawImage(overlay.surface,0,0);
   ctx.restore();
  } else {
   const ordered=triangles.slice().sort((a,b)=>(p[b[0]][2]+p[b[1]][2]+p[b[2]][2])-(p[a[0]][2]+p[a[1]][2]+p[a[2]][2]));
   ctx.lineWidth=.65;
   for(const [a,b,c,color] of ordered){
    path([p[a],p[b],p[c]],true);
    if(overlay) drawOverlayFace(ctx,overlay.pattern,overlay.matrix,overlay.uv,p,a,b,c);
    else {ctx.fillStyle=color;ctx.strokeStyle=color;ctx.fill();ctx.stroke();}
    if(this.style==='wire'){ctx.strokeStyle='#566b57';ctx.stroke();}
   }
  }
  for(const edge of sides){path(edge.map(i=>p[i]));ctx.strokeStyle='#5f745e';ctx.lineWidth=.85;ctx.stroke();}
  if(!this.model.parcel){
  const marker=this.project(0,0,this.model.pinElevation);
  ctx.beginPath();ctx.arc(marker[0],marker[1],4.7,0,2*Math.PI);ctx.fillStyle='#1b5039';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#f5f7e8';ctx.stroke();
  }
  if(this.probed){const pos=this.project(...this.probed);ctx.beginPath();ctx.arc(pos[0],pos[1],6,0,2*Math.PI);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
  this.onView(this);
 }
 plan(){this.yaw=0;this.tilt=Math.PI/2;this.dx=this.dy=0;this.drawSoon();}
 zoomBy(f){this.zoom=clamp(this.zoom*f,.35,5);this.drawSoon();}
 probe(x,y){
  const p=this.projected;if(!p)return;let best=Infinity,hit=null;
  for(const [a,b,c] of this.mesh.triangles){
   const A=p[a],B=p[b],C=p[c],det=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(det)<1e-7)continue;
   const u=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/det,v=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/det,w=1-u-v;
   if(Math.min(u,v,w)<0)continue;
   const depth=A[2]*u+B[2]*v+C[2]*w;if(depth>=best)continue;best=depth;
   hit=this.mesh.verts[a].map((z,i)=>z*u+this.mesh.verts[b][i]*v+this.mesh.verts[c][i]*w);
  }
  this.probed=hit;this.onProbe(hit);this.drawSoon();
 }
 bind(){const c=this.canvas;
  c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);};
  c.onpointermove=e=>{const old=this.pointers.get(e.pointerId);if(!old)return;const x=e.clientX,y=e.clientY;this.pointers.set(e.pointerId,[x,y]);
   if(this.pointers.size===2){const other=[...this.pointers].find(([id])=>id!==e.pointerId)[1],last=Math.hypot(old[0]-other[0],old[1]-other[1]);if(last>1)this.zoomBy(Math.hypot(x-other[0],y-other[1])/last);}
   else if(this.tool==='pan'||e.shiftKey||e.buttons===4){this.dx+=x-old[0];this.dy+=y-old[1];}
   else if(this.tool==='orbit'){this.yaw+=(x-old[0])*.009;this.tilt=clamp(this.tilt+(y-old[1])*.007,.12,Math.PI/2);}
   this.drawSoon();};
  c.onpointerup=e=>{if(this.tool==='probe'&&this.pointers.size===1){const r=c.getBoundingClientRect();this.probe(e.clientX-r.left,e.clientY-r.top);}this.pointers.delete(e.pointerId);};c.onpointercancel=e=>this.pointers.delete(e.pointerId);
  c.onwheel=e=>{e.preventDefault();this.zoomBy(Math.exp(-clamp(e.deltaY,-150,150)*.002));};
  c.onkeydown=e=>{const actions={ArrowLeft:()=>this.yaw-=.1,ArrowRight:()=>this.yaw+=.1,ArrowUp:()=>this.tilt=clamp(this.tilt+.1,.12,Math.PI/2),ArrowDown:()=>this.tilt=clamp(this.tilt-.1,.12,Math.PI/2),'+':()=>this.zoomBy(1.15),'-':()=>this.zoomBy(1/1.15),'0':()=>this.fit()};if(actions[e.key]){e.preventDefault();actions[e.key]();this.drawSoon();}};
 }
}
