import {decodePhoto} from './layers.js';
import {detectOutline,readMeasurements} from './parcel-image.js';
import {georeference,parseParcelKml} from './parcel-location.js';
import {degreeScales} from './data/elevation.js';
import {parseCoordinates} from './coordinates.js';

const get=id=>document.getElementById(id);
const number=value=>value.toLocaleString(undefined,{maximumFractionDigits:2});
export function describeEarth(data){
 const items=[['area','Area',' m²'],['perimeter','perimeter',' m'],['min','min',' m'],['median','median',' m'],['max','max',' m']];
 return items.filter(([key])=>Number.isFinite(data?.[key])).map(([key,label,unit])=>label+' '+number(data[key])+unit).join(' · ');
}

async function kmlText(file){
 if(file.size>12e6)throw Error('Choose a polygon file smaller than 12 MB.');
 if(!file.name.toLowerCase().endsWith('.kmz'))return file.text();
 const bytes=new Uint8Array(await file.arrayBuffer()), zip=new DataView(bytes.buffer);
 // Find the ZIP directory (handles archives with data descriptors or embedded images).
 let end=bytes.length-22;
 while(end>=Math.max(0,bytes.length-65557)&&zip.getUint32(end,true)!==0x06054b50)end--;
 if(end<0||end<bytes.length-65557)throw Error('Unreadable KMZ. Export the polygon as KML.');
 let offset=zip.getUint32(end+16,true);const files=[];
 for(let i=0;i<zip.getUint16(end+10,true);i++){
  if(offset+46>bytes.length||zip.getUint32(offset,true)!==0x02014b50)throw Error('Invalid KMZ directory.');
  const length=zip.getUint16(offset+28,true), name=new TextDecoder().decode(bytes.subarray(offset+46,offset+46+length));
  if(/\.kml$/i.test(name))files.push({offset,name});
  offset+=46+length+zip.getUint16(offset+30,true)+zip.getUint16(offset+32,true);
 }
 const entry=files.find(f=>f.name.toLowerCase()==='doc.kml')||(files.length===1&&files[0]);
 if(!entry)throw Error('Export one parcel as a KML file and try again.');
 offset=entry.offset;
 const start=zip.getUint32(offset+42,true);
 const size=zip.getUint32(offset+24,true), packed=zip.getUint32(offset+20,true), method=zip.getUint16(offset+10,true);
 if(size>4e6||start+30>bytes.length||zip.getUint32(start,true)!==0x04034b50)throw Error('The polygon document is too large or unreadable.');
 const data=start+30+zip.getUint16(start+26,true)+zip.getUint16(start+28,true);
 if(data+packed>bytes.length)throw Error('Incomplete KMZ.');
 let stream=new Blob([bytes.subarray(data,data+packed)]).stream();
 if(method===8)stream=stream.pipeThrough(new DecompressionStream('deflate-raw'));
 else if(method!==0)throw Error('Unsupported KMZ compression. Try a KML file.');
 const reader=stream.getReader(),decoder=new TextDecoder();let result='',total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>4e6){await reader.cancel();throw Error('The polygon document exceeds 4 MB.');}result+=decoder.decode(value,{stream:true});}
 return result+decoder.decode();
}

function referencePoints(ring){
 // Pick four widely separated vertices, including vertices on both sides of the longest diagonal.
 let a=0,b=1,longest=0;
 for(let i=0;i<ring.length;i++)for(let j=i+1;j<ring.length;j++){
  const length=Math.hypot(ring[i][0]-ring[j][0],ring[i][1]-ring[j][1]);
  if(length>longest){longest=length;a=i;b=j;}
 }
 const [x,y]=ring[a],dx=ring[b][0]-x,dy=ring[b][1]-y;
 const order=ring.map(([u,v],i)=>({i,d:dx*(v-y)-dy*(u-x)})).filter(p=>p.i!==a&&p.i!==b).sort((p,q)=>p.d-q.d);
 return [...new Set([a,b,order[0]?.i,order.at(-1)?.i])].filter(i=>i!=null).sort((p,q)=>p-q);
}
function imageArea(ring){return Math.abs(ring.reduce((sum,[x,y],i)=>{const next=ring[(i+1)%ring.length];return sum+x*next[1]-y*next[0];},0))/2;}
function middle(ring){return [0,1].map(axis=>{const values=ring.map(p=>p[axis]);return (Math.min(...values)+Math.max(...values))/2;});}

export function setupParcelImport(generate){
 const dialog=get('parcelDialog'),canvas=get('outlinePreview'),ctx=canvas.getContext('2d');
 let image=null,ring=[],anchors=[],tracing=false,earth={},kml=null,filename='',revision=0,polygonRevision=0,building=false;
 let reading=Promise.resolve();
 const fields=[];
 for(let i=0;i<4;i++){
  const label=document.createElement('label');label.textContent='Corner '+(i+1);
  const input=document.createElement('input');input.placeholder='Latitude, longitude';label.append(input);get('anchorFields').append(label);fields.push(input);
 }
 function draw(){
  if(!image)return;
  canvas.width=image.width;canvas.height=image.height;ctx.drawImage(image,0,0);
  if(!ring.length)return;
  const factor=Math.max(1,image.width/650);
  ctx.beginPath();ring.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(!tracing)ctx.closePath();
  ctx.strokeStyle='#39ffb2';ctx.lineWidth=2*factor;ctx.stroke();
  const method=get('locateMethod').value;
  if(tracing||method==='anchors')for(const [n,i] of (tracing?ring.map((_,i)=>i):anchors).entries()){
   const [x,y]=ring[i];ctx.fillStyle='#184535';ctx.beginPath();ctx.arc(x,y,8*factor,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+11*factor+'px sans-serif';ctx.fillText(String(n+1),x,y);
  }
  if(method==='overhead'&&!tracing){const [x,y]=middle(ring);ctx.strokeStyle='white';ctx.lineWidth=3*factor;ctx.beginPath();ctx.moveTo(x-9*factor,y);ctx.lineTo(x+9*factor,y);ctx.moveTo(x,y-9*factor);ctx.lineTo(x,y+9*factor);ctx.stroke();}
 }
 function refresh(){
  const method=get('locateMethod').value;
  for(const [id,key] of [['locateKml','kml'],['locateAnchors','anchors'],['locateOverhead','overhead']])get(id).hidden=key!==method;
  get('screenAnalysis').hidden=!image;get('undoCorner').hidden=get('finishTrace').hidden=!tracing;
  get('outlineInfo').textContent=tracing?'Click each boundary corner in order, then finish the trace.':ring.length+' boundary vertices. Check the green outline.';
  get('buildParcel').hidden=!(kml&&method==='kml')&&!(image&&!tracing&&ring.length>=3&&method!=='kml');
  get('buildParcel').disabled=building;
  for(const input of dialog.querySelectorAll('input,select,button:not(#closeParcel):not(#buildParcel)'))input.disabled=building;
  draw();
 }
 get('openParcel').onclick=()=>{dialog.showModal();refresh();};
 get('closeParcel').onclick=()=>dialog.close();
 get('locateMethod').onchange=()=>{get('importNote').textContent='';refresh();};
 get('earthImage').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  const ticket=++revision;reading=Promise.resolve();polygonRevision++;kml=null;image=null;earth={};ring=[];fields.forEach(f=>f.value='');
  get('parcelCenter').value='';get('measuredArea').value='';get('earthReadout').textContent='';
  get('importNote').textContent='Reading screenshot…';get('locateMethod').value='kml';refresh();
  try{
   const decoded=await decodePhoto(file,4096);if(ticket!==revision)return;
   image=decoded;filename=file.name;ring=detectOutline(image);tracing=ring.length<3;anchors=tracing?[]:referencePoints(ring);
   get('importNote').textContent='';refresh();
   get('earthReadout').textContent='Reading the Google Earth measurement panel…';
   reading=readMeasurements(decoded);const values=await reading;if(ticket!==revision)return;
   earth=values||{};const summary=describeEarth(earth);
   get('earthReadout').textContent=summary?'Google Earth screenshot · '+summary:'No readable measurement panel found.';
   if(!get('measuredArea').value&&earth.area)get('measuredArea').value=earth.area;
  }catch(error){if(ticket===revision){if(image)get('earthReadout').textContent='Measurement text unavailable. The outline can still be used.';else get('importNote').textContent='Could not read this image. Choose JPG, PNG or WebP.';}}
 };
 get('earthKml').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;const id=++polygonRevision;
  kml=null;get('locateMethod').value='kml';get('importNote').textContent='Reading Earth polygon…';refresh();
  try{const geo=parseParcelKml(await kmlText(file));if(id!==polygonRevision)return;kml=geo;filename=file.name;get('importNote').textContent=file.name+' · '+geo.length+' geographic vertices. Verify this is the intended parcel.';}
  catch(err){if(id===polygonRevision)get('importNote').textContent=err.message;}
  refresh();
 };
 get('redrawParcel').onclick=()=>{ring=[];anchors=[];tracing=true;fields.forEach(f=>f.value='');refresh();};
 canvas.onclick=e=>{
  if(!tracing||!image)return;const rect=canvas.getBoundingClientRect(),scale=Math.min(rect.width/image.width,rect.height/image.height);
  const x=(e.clientX-rect.left-(rect.width-scale*image.width)/2)/scale,y=(e.clientY-rect.top-(rect.height-scale*image.height)/2)/scale;
  if(x>=0&&x<image.width&&y>=0&&y<image.height&&ring.length<256){ring.push([x,y]);draw();}
 };
 get('undoCorner').onclick=()=>{ring.pop();draw();};
 get('finishTrace').onclick=()=>{if(ring.length<3||imageArea(ring)<16){get('importNote').textContent='Trace at least three distinct corners around the parcel.';return;}tracing=false;anchors=referencePoints(ring);get('importNote').textContent='';refresh();};
 get('buildParcel').onclick=async()=>{
  if(building)return;
  try{
   const method=get('locateMethod').value;let geo,placement;
   if(method==='kml'){if(!kml)throw Error('Open the matching Google Earth polygon.');geo=kml;placement='Google Earth polygon';}
   else if(method==='anchors'){
    if(anchors.length!==4)throw Error('Four distinct corners are needed for a tilted view. Use the Earth polygon for triangular sites.');
    geo=georeference(ring,anchors.map(i=>ring[i]),fields.map(f=>parseCoordinates(f.value)));placement='Four-corner screenshot estimate';
   }else{
    const area=get('measuredArea').valueAsNumber;if(!Number.isFinite(area)||area<=0)throw Error('Enter the ground area shown in Google Earth, in square metres.');
    const center=parseCoordinates(get('parcelCenter').value),scales=degreeScales(center.lat),mpp=Math.sqrt(area/imageArea(ring)),[cx,cy]=middle(ring);
    geo=ring.map(([x,y])=>({lon:center.lon+(x-cx)*mpp/scales.east,lat:center.lat+(cy-y)*mpp/scales.north}));placement='North-up overhead estimate';
   }
   building=true;refresh();get('importNote').textContent='Sampling elevations inside the parcel…';
   await reading.catch(()=>{});
   await generate({geo,placement,earth:{...earth},name:filename.replace(/\.[^.]+$/,'')});
   dialog.close();
  }catch(err){get('importNote').textContent=err.message||'Could not build the parcel.';}
  finally{building=false;refresh();}
 };
}
