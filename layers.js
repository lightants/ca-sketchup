import {showSatellite,closeSatellite} from './satellite-view.js';
import {loadBasemap} from './basemap.js';

const $=id=>document.getElementById(id);
const defaults={scale:100,rotation:0,east:0,north:0,opacity:100};
const online=k=>k==='sentinel'||k==='satellite'||k==='map';

export async function decodePhoto(file,maxEdge=2048){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG or WebP image.');
 if(file.size>25*1024*1024)throw Error('Choose an image smaller than 25 MB.');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;await img.decode();
  const factor=Math.min(1,maxEdge/Math.max(img.naturalWidth,img.naturalHeight));
  const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(img.naturalWidth*factor));c.height=Math.max(1,Math.round(img.naturalHeight*factor));
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c;
 }finally{URL.revokeObjectURL(url);}
}

export class TerrainLayers{
 constructor(view,refresh){
  this.view=view;this.refresh=refresh;this.photoVersion=0;this.busy=false;
  $('style').onchange=()=>this.render();
  $('retryLayer').onclick=()=>this.render();
  $('photoFile').onchange=async e=>{
   const file=e.target.files[0];e.target.value='';if(!file)return;
   const v=++this.photoVersion;$('photoMessage').textContent='Opening photo…';
   try{
    const image=await decodePhoto(file);if(v!==this.photoVersion)return;
    this.photo={image,name:file.name};this.resetAlignment();
    $('photoOption').disabled=false;$('style').value='photo';$('alignment').open=true;
    $('photoMessage').textContent=file.name;this.render();if(this.model)this.view.plan();
   }catch(err){if(v===this.photoVersion)$('photoMessage').textContent=err.message?.includes('Choose')?err.message:'Could not read that photo. Choose a JPG, PNG or WebP image.';}
  };
  for(const k of Object.keys(defaults))$(k).oninput=()=>{if(this.photo&&$('style').value==='photo'&&this.model)this.applyPhoto();};
  $('resetPhoto').onclick=()=>{this.resetAlignment();this.render();};
  $('removePhoto').onclick=()=>{this.clearPhoto();this.render();};
 }
 clearPhoto(){
  this.photoVersion++;this.photo=null;$('photoFile').value='';$('photoOption').disabled=true;
  if($('style').value==='photo')$('style').value='elevation';
  $('photoMessage').textContent='';$('alignment').hidden=true;
 }
 resetAlignment(){for(const [k,v] of Object.entries(defaults))$(k).value=v;$('opacityVal').textContent='100%';}
 applyPhoto(){
  const p={};
  for(const k of Object.keys(defaults)){
   const el=$(k),v=el.valueAsNumber;
   p[k]=Number.isFinite(v)?Math.min(+el.max,Math.max(+el.min,v)):defaults[k];
  }
  $('opacityVal').textContent=p.opacity+'%';p.scale/=100;p.opacity/=100;
  this.view.setOverlay(this.photo.image,p);
 }
 setModel(model){
  if(this.model&&(Math.abs(this.model.lat-model.lat)>1e-7||Math.abs(this.model.lon-model.lon)>1e-7))this.clearPhoto();
  this.model=model;this.render();
 }
 reset(){
  this.clearPhoto();this.model=null;$('style').value='elevation';this.render();
 }
 async render(){
  this.request?.abort();const job=new AbortController();this.request=job;
  const kind=$('style').value;
  closeSatellite();
  const scene=kind==='satellite'&&!!this.model;
  $('sceneLinks').hidden=!scene;$('satelliteView').setAttribute('aria-pressed',String(scene));
  document.querySelector('.mouseHint').textContent=scene?'Drag to explore · Right-drag to tilt or rotate · Scroll to zoom':'Drag to orbit · Shift + drag to pan · Scroll to zoom';

  this.layer=null;this.busy=false;this.view.clearOverlay();this.view.style=online(kind)||kind==='photo'?'clay':kind;
  this.view.prepare();document.querySelector('.legend').style.visibility=kind==='elevation'?'visible':'hidden';
  $('layerCredit').hidden=true;$('retryLayer').hidden=true;
  $('alignment').hidden=!(kind==='photo'&&this.photo);
  const status=$('layerStatus');$('layerBar').hidden=!online(kind)&&kind!=='photo';
  if(!this.model){status.textContent='Generate terrain to display this layer.';this.refresh();return;}
  if(scene){
   showSatellite(this.model);
   status.textContent='3D satellite imagery · Esri World Imagery. Export uses the terrain model. ';
   this.refresh();return;
  }
  if(kind==='photo'&&this.photo){
   this.applyPhoto();this.layer={name:'Site photo',exportable:true,attribution:'User-supplied image'};status.textContent='Site photo · aligned manually';
  }
  if(!online(kind)){this.refresh();return;}
  this.busy=true;this.refresh();status.textContent='Loading '+(kind==='map'?'street map':'satellite imagery')+'…';
  try{
   const result=await loadBasemap(kind,this.model.bounds,{signal:job.signal});if(this.request!==job)return;
   this.view.setOverlay(result.canvas);this.layer={...result,name:kind==='map'?'Street map':'Satellite imagery'};
   status.textContent=kind==='map'?'Street map · exported model uses plain terrain.':'Satellite · 10 m · included in export. ';
   const credit=$('layerCredit');credit.textContent=result.attribution;credit.href=result.url;credit.hidden=false;
  }catch(err){
   if(this.request!==job)return;
   status.textContent=(kind==='map'?'Street map':'Satellite imagery')+' unavailable. Showing plain terrain.';$('retryLayer').hidden=false;
  }finally{if(this.request===job){this.busy=false;this.refresh();}}
 }
 async exportTexture(){
  const info=this.layer;if(!info?.exportable)return;
  const canvas=this.view.getOverlayCanvas();if(!canvas)throw Error('The image layer is not ready. Try exporting again.');
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));
  if(!blob)throw Error('Could not prepare the terrain image.');
  return {bytes:new Uint8Array(await blob.arrayBuffer()),mimeType:blob.type,name:info.name,attribution:info.exportAttribution||info.attribution};
 }
}
