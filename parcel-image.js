// Work at a bounded resolution, but return coordinates in original image pixels.
function preview(canvas, limit) {
 const scale=Math.min(1,limit/Math.max(canvas.width,canvas.height));
 const result=document.createElement('canvas');
 result.width=Math.max(1,Math.round(canvas.width*scale));
 result.height=Math.max(1,Math.round(canvas.height*scale));
 const ctx=result.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(canvas,0,0,result.width,result.height);
 return ctx.getImageData(0,0,result.width,result.height);
}

function yellowRegions(image, bridge) {
 const {data,width:w,height:h}=image;
 const labels=new Int32Array(w*h), queue=new Int32Array(w*h);
 // Expand the amber stroke to bridge anti-aliasing and translucent midpoint handles.
 for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){
  const i=y*w+x, r=data[4*i],g=data[4*i+1],b=data[4*i+2];
  if(r<162 || g<118 || r-g< -10 || r-g>97 || g-b<46 || r-b<77) continue;
  for(let yy=Math.max(0,y-bridge);yy<=Math.min(h-1,y+bridge);yy++)
   labels.fill(-1,yy*w+Math.max(0,x-bridge),yy*w+Math.min(w,x+bridge+1));
 }
 let largest=null, label=0;
 const handles=[];
 for(let start=0;start<labels.length;start++){
  if(labels[start]!==0) continue;
  let size=1, minX=w,maxX=-1,minY=h,maxY=-1,sumX=0,sumY=0,white=0;
  queue[0]=start; labels[start]=++label;
  for(let head=0;head<size;head++){
   const i=queue[head], x=i%w,y=Math.floor(i/w), k=4*i;
   minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   sumX+=x;sumY+=y;
   if(Math.min(data[k],data[k+1],data[k+2])>220 && Math.max(data[k],data[k+1],data[k+2])-Math.min(data[k],data[k+1],data[k+2])<22)white++;
   if(x>0 && labels[i-1]===0) {labels[i-1]=label;queue[size++]=i-1;}
   if(x+1<w && labels[i+1]===0) {labels[i+1]=label;queue[size++]=i+1;}
   if(y>0 && labels[i-w]===0) {labels[i-w]=label;queue[size++]=i-w;}
   if(y+1<h && labels[i+w]===0) {labels[i+w]=label;queue[size++]=i+w;}
  }
  if(minX===0 || maxX===w-1 || minY===0 || maxY===h-1) continue;
  const bw=maxX-minX+1,bh=maxY-minY+1;
  if(size>=5 && size<=600 && bw/bh>.65 && bw/bh<1.52 && size/(bw*bh)>.54 && white/size>.82)
   handles.push({x:sumX/size+.5,y:sumY/size+.5,radius:Math.max(bw,bh)/2+2});
  if(size>Math.max(48,w*h*.0002) && bw>=13 && bh>=13 && size>(largest?.size || 0))
   largest={label,size,start,width:bw,height:bh};
 }
 return {labels,largest,handles};
}

// Follow the grid edges with the enclosed parcel interior on the right. Holes
// caused by yellow roofs, text, or vegetation inside the parcel are ignored.
function traceBoundary(labels,w,h,region) {
 const belongs=(x,y)=>x>=0 && x<w && y>=0 && y<h && labels[y*w+x]===region.label;
 const dirX=[1,0,-1,0], dirY=[0,1,0,-1];
 const rightX=[0,-1,-1,0], rightY=[0,0,-1,-1];
 const leftX=[0,0,-1,-1], leftY=[-1,0,0,-1];
 const firstX=region.start%w,firstY=Math.floor(region.start/w);
 let x=firstX,y=firstY,dir=0;
 const contour=[];
 do {
  contour.push([x,y]); x+=dirX[dir];y+=dirY[dir];
  const choices=[(dir+1)%4,dir,(dir+3)%4,(dir+2)%4];
  dir=choices.find(d=>belongs(x+rightX[d],y+rightY[d])&&!belongs(x+leftX[d],y+leftY[d]));
  if(dir===undefined || contour.length>region.size*4) return [];
 } while(x!==firstX || y!==firstY || dir!==0);
 return contour;
}

function segmentDistance(p,a,b) {
 const x=b[0]-a[0],y=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y || 1)));
 return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);
}

function simplify(path,tolerance) {
 const retain=new Set([0,path.length-1]), ranges=[[0,path.length-1]];
 while(ranges.length){
  const [start,end]=ranges.pop();
  let max=tolerance,split=-1;
  for(let i=start+1;i<end;i++){
   const d=segmentDistance(path[i],path[start],path[end]);
   if(d>max){max=d;split=i;}
  }
  if(split>=0){retain.add(split);ranges.push([start,split],[split,end]);}
 }
 return [...retain].sort((a,b)=>a-b).map(i=>path[i]);
}

export function detectOutline(canvas) {
 const image=preview(canvas,1400);
 let regions=yellowRegions(image,1);
 // Some midpoint handles interrupt the stroke on both sides for several pixels.
 if(!regions.largest || regions.largest.size<image.width*image.height*.002){
  const bridged=yellowRegions(image,3);
  if(bridged.largest && bridged.largest.size>(regions.largest?.size || 0)){
   // Read the white centers before dilation shrinks their interiors.
   if(regions.handles.length)bridged.handles=regions.handles;
   regions=bridged;
  }
 }
 const {labels,largest,handles}=regions;
 if(!largest) return [];
 const ring=traceBoundary(labels,image.width,image.height,largest);
 if(ring.length<12) return [];
 const anchors=[];
 for(const h of handles){
  let distance=Infinity,index=0;
  for(let i=0;i<ring.length;i++){
   const d=Math.hypot(ring[i][0]-h.x,ring[i][1]-h.y);
   if(d<distance){distance=d;index=i;}
  }
  if(distance<=h.radius+9) anchors.push({index,point:[h.x,h.y],radius:h.radius+10});
 }
 if(anchors.length<2){
  const first=ring[0];let far=1;
  for(let i=2;i<ring.length;i++)if(segmentDistance(ring[i],first,first)>segmentDistance(ring[far],first,first))far=i;
  anchors.length=0;
  for(const i of [0,far]) anchors.push({index:i,point:ring[i],radius:0});
 }
 anchors.sort((a,b)=>a.index-b.index);
 const points=[], tolerance=Math.max(2.3,Math.max(largest.width,largest.height)*.006);
 for(let i=0;i<anchors.length;i++){
  const a=anchors[i],b=anchors[(i+1)%anchors.length];
  if(a.index===b.index)continue;
  const path=[a.point];
  for(let j=(a.index+1)%ring.length;j!==b.index;j=(j+1)%ring.length){
   const p=ring[j];
   if(Math.hypot(p[0]-a.point[0],p[1]-a.point[1])>a.radius && Math.hypot(p[0]-b.point[0],p[1]-b.point[1])>b.radius)path.push(p);
  }
  path.push(b.point);
  points.push(...simplify(path,Math.max(tolerance,a.radius*1.35,b.radius*1.35)).slice(0,-1));
 }
 if(points.length<3 || points.length>256) return [];
 return points.map(([x,y])=>[x*canvas.width/image.width,y*canvas.height/image.height]);
}

function intervals(n,test,minSize){
 const ranges=[];
 for(let i=0;i<n;){
  while(i<n && !test(i))i++;
  const start=i;
  while(i<n && test(i))i++;
  if(i-start>=minSize)ranges.push([start,i]);
 }
 return ranges;
}

// Locate the solid dark or light measurements card without assuming a side,
// screen resolution, or a particular floating-panel position.
function measurementCard(canvas) {
 const {data,width:w,height:h}=preview(canvas,380);
 const buckets=new Uint8Array(w*h).fill(255), counts=new Uint32Array(32);
 for(let i=0;i<buckets.length;i++){
  const r=data[4*i],g=data[4*i+1],b=data[4*i+2];
  if(Math.max(r,g,b)-Math.min(r,g,b)>6 || (g>84 && g<208) || data[4*i+3]<220)continue;
  buckets[i]=g>>3;counts[buckets[i]]++;
 }
 const ranking=Array.from(counts.keys()).sort((a,b)=>counts[b]-counts[a]).slice(0,3);
 let best=null;
 for(const bin of ranking){
  if(counts[bin]<w*h*.027)continue;
  const columns=new Uint32Array(w);
  for(let i=0;i<buckets.length;i++)if(buckets[i]===bin)columns[i%w]++;
  for(const [left,right] of intervals(w,x=>columns[x]>=h*.16,Math.max(14,w*.095))){
   const rows=new Uint32Array(h);
   for(let y=0;y<h;y++)for(let x=left;x<right;x++)if(buckets[y*w+x]===bin)rows[y]++;
   let top=0,bottom=h;
   while(top<h && rows[top]<(right-left)*.45)top++;
   while(bottom>top && rows[bottom-1]<(right-left)*.45)bottom--;
   const pixels=rows.slice(top,bottom).reduce((a,b)=>a+b,0);
   if(bottom-top<h*.17 || pixels<(right-left)*(bottom-top)*.4 || pixels<=(best?.pixels || 0))continue;
   best={x:left*canvas.width/w,y:top*canvas.height/h,w:(right-left)*canvas.width/w,h:(bottom-top)*canvas.height/h,dark:bin<16,pixels};
  }
 }
 return best;
}

function parseMeasurements(text){
 const values={};
 const input=text.replace(/(?<=\d)[’'\u2009](?=\d{3}\b)/g,',');
 const number='(-?\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|-?\\d+(?:\\.\\d+)?)';
 function read(label,units){
  const labelMatch=new RegExp('\\b'+label+'\\b','i').exec(input);
  if(!labelMatch) return null;
  // Dropdown arrows sometimes appear as tiny standalone words in OCR. Limit
  // each search by the next measurement label to avoid stealing another value.
  const block=input.slice(labelMatch.index+labelMatch[0].length).split(/\b(?:Area|Perimeter|Min(?:imum)?|Median|Max(?:imum)?)\b/i)[0].slice(0,70);
  const match=new RegExp('(?:^|[^\\d.,])'+number+'\\s*('+units+')(?=[^a-z]|$)','i').exec(block);
  if(!match) return null;
  return {value:Number(match[1].replace(/,/g,'')),unit:match[2].toLowerCase()};
 }
 const area=read('Area','km[²2?*]?|m[²2?*]?|ha|acres?|ft[²2?*]?');
 if(area && area.value>0)values.area=area.value*({km:1e6,m:1,ha:1e4,acre:4046.8564224,acres:4046.8564224,ft:.09290304}[area.unit.replace(/[²2?*]/g,'')]);
 for(const [key,label] of [['perimeter','Perimeter'],['min','Min(?:imum)?'],['median','Median'],['max','Max(?:imum)?']]){
  const field=read(label,'km|m|ft|mi');
  if(field && (key!=='perimeter' || field.value>0))values[key]=field.value*({km:1000,m:1,ft:.3048,mi:1609.344}[field.unit]);
 }
 return values;
}

export async function readMeasurements(canvas){
 const box=measurementCard(canvas);
 if(!box)return {};
 const copy=document.createElement('canvas');
 const scale=Math.min(2,1000/box.w,1900/box.h);
 copy.width=Math.max(1,Math.round(box.w*scale));copy.height=Math.max(1,Math.round(box.h*scale));
 const ctx=copy.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(canvas,box.x,box.y,box.w,box.h,0,0,copy.width,copy.height);
 const pixels=ctx.getImageData(0,0,copy.width,copy.height);
 for(let i=0;i<pixels.data.length;i+=4){
  const luminance=pixels.data[i]*.3+pixels.data[i+1]*.59+pixels.data[i+2]*.11;
  const gray=Math.max(0,Math.min(255,((box.dark?255-luminance:luminance)-60)*2));
  pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray;
 }
 ctx.putImageData(pixels,0,0);
 const {default:Tesseract}=await import('./ocr/tesseract.esm.min.js');
 const asset=file=>new URL('./ocr/'+file,import.meta.url).href;
 const worker=await Tesseract.createWorker('eng',1,{
  workerPath:asset('worker.min.js'),corePath:asset('tesseract-core-lstm.wasm.js'),
  langPath:asset(''),workerBlobURL:false
 });
 try{
  await worker.setParameters({tessedit_pageseg_mode:'6'});
  const result=await worker.recognize(copy);
  return parseMeasurements(result.data.text);
 }finally{await worker.terminate();}
}
