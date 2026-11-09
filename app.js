import {setupParcelImport,describeEarth} from './parcel-import.js';
import {clipTerrain} from './parcel-mesh.js';
import {loadTerrain,degreeScales} from './data/elevation.js';
import {TerrainLayers} from './layers.js';
import {Viewer} from './viewer.js';
import {parseCoordinates} from './coordinates.js';
import {exportSketchUp} from './export/sketchup.js';
const $=id=>document.getElementById(id);
const icons={download:'M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4',mountain:'m2 19 7-12 4 6 3-5 6 11z',layers:'m2 8 10-5 10 5-10 5zM3 12l9 5 9-5M3 16l9 5 9-5',pin:'M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0z M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',orbit:'M21 8c2 3-1 7-7 10S3 21 2 18s2-6 5-8M8 14a6 6 0 1 1 11-4M17 5l4 2-1-4',hand:'M6 12V7a1.5 1.5 0 0 1 3 0v4-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v6-4a1.5 1.5 0 0 1 3 0v8c0 4-2 6-6 6-3 0-4-1-6-4l-3-4c-1-2 1-3 3-1l2 2',cross:'M12 2v5m0 10v5M2 12h5m10 0h5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',fit:'M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6'};
for(const el of document.querySelectorAll('[data-icon]')){el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+icons[el.dataset.icon]+'"/></svg>';}
const samples=[{name:'Puerto',area:'Cagayan de Oro',photo:'puerto',coords:'8°29\'30.60"N 124°45\'27.67"E',size:1500},{name:'Mantibugao',area:'Manolo Fortich',photo:'mantibugao',coords:'8°28\'18.16"N 124°49\'19.98"E',size:500},{name:'Calinan',area:'Davao City',photo:'calinan',coords:'7.213135, 125.426933',size:500}];
const formatM=n=>Math.round(n).toLocaleString()+' m';
let pending=null, model=null, exportName='',dirty=false, exporting=false;
function controls(){ $('export').disabled=!model||!!pending||dirty||exporting||!!layers?.busy; }
const view=new Viewer($('canvas'),v=>{
 $('zoomVal').textContent=Math.round(v.zoom*100)+'%';
 $('needle').style.transform='rotate('+(Math.atan2(-Math.sin(v.yaw),Math.cos(v.yaw)*Math.sin(v.tilt))*180/Math.PI)+'deg)';
 const isScene=$('stage').classList.contains('earthScene');const isPlan=!isScene&&v.tilt>1.569;$('plan').setAttribute('aria-pressed',isPlan);$('iso').setAttribute('aria-pressed',!isPlan&&!isScene);
},p=>{const info=$('probeInfo');info.hidden=false;info.textContent=p?'Surface elevation · '+formatM(p[2]):'Click a point on the terrain surface.';});
const layers=new TerrainLayers(view,controls);
for(const [i,s] of samples.entries()){
 const b=document.createElement('button');b.type='button';b.className='site';b.dataset.index=i;b.innerHTML='<img alt="" class="siteThumb" src="./thumbs/'+s.photo+'.png"><span><strong>'+s.name+'</strong><small>'+s.area+'</small></span><em aria-hidden="true"></em>';b.onclick=()=>{$('coords').value=s.coords;$('extent').value=s.size;generate();};$('sites').append(b);
}
function report(msg){const el=$('problem');el.textContent=msg;el.hidden=!msg;}
function markDraft(){pending?.abort();pending=null;dirty=true;controls();$('load').hidden=true;$('generate').querySelector('span').textContent='Generate terrain';$('status').textContent='Inputs changed · generate to apply';report('');}
$('coords').oninput=markDraft;$('extent').onchange=markDraft;
async function generate(parcelInput=null){
 pending?.abort();const controller=new AbortController();pending=controller;report('');controls();
 let location,extent=+$('extent').value,ring;
 try{
  if(parcelInput){
   const {geo}=parcelInput;
   const mid=values=>(Math.min(...values)+Math.max(...values))/2;
   location={lat:mid(geo.map(p=>p.lat)),lon:mid(geo.map(p=>p.lon))};
   const scale=degreeScales(location.lat);
   ring=geo.map(p=>[(p.lon-location.lon)*scale.east,(p.lat-location.lat)*scale.north]);
   const width=2*Math.max(...ring.flat().map(Math.abs));
   if(!Number.isFinite(width)||width>5000)throw Error('Choose one parcel within the 5 km terrain limit.');
   extent=Math.min(5000,Math.max(200,Math.ceil(width*1.03)));
  }else location=parseCoordinates($('coords').value);
 }catch(e){pending=null;dirty=true;controls();report(e.message);$('load').hidden=true;$('generate').querySelector('span').textContent='Generate terrain';$('status').textContent='Check coordinates';if(parcelInput)throw e;return;}
 const selected=samples.find(s=>{const a=parseCoordinates(s.coords);return Math.abs(a.lat-location.lat)<.00001&&Math.abs(a.lon-location.lon)<.00001;});
 $('load').hidden=false;$('load').textContent='Loading terrain…';$('status').textContent='Loading elevations';$('generate').querySelector('span').textContent='Generating…';
 try{
  const t=await loadTerrain({...location,extent,signal:controller.signal,onStatus:s=>{if(pending===controller)$('load').textContent=s;}});
  if(pending!==controller)throw new DOMException('Terrain generation cancelled.','AbortError');
  if(parcelInput){
   t.parcel=clipTerrain(t,ring);t.min=t.parcel.min;t.max=t.parcel.max;
   $('coords').value=t.lat.toFixed(7)+', '+t.lon.toFixed(7);
   $('extent').querySelector('[data-parcel]')?.remove();
   const custom=new Option(extent+' m · parcel extent',extent);custom.dataset.parcel='';$('extent').add(custom);$('extent').value=String(extent);
   $('style').value='elevation';
  }
  view.setModel(t);layers.setModel(t);model=t;dirty=false;exportName=parcelInput?'Survey parcel':selected?.name||'Mindanao site';
  $('siteName').replaceChildren(document.createTextNode(exportName+' '));const sub=document.createElement('small');sub.textContent='/ '+(parcelInput?parcelInput.placement:selected?.area||'Custom location');$('siteName').append(sub);
  for(const el of $('sites').children){const active=samples[+el.dataset.index]===selected;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);el.querySelector('em').textContent=active?'•':'↗';}
  $('dataDesc').textContent=t.source+' provides the elevations for this model. Nominal spacing is '+t.spacing+' m. Vertical reference: '+t.datum+'.';$('credit').textContent=t.attribution;
  $('sourceName').textContent=t.source+' · '+t.spacing+' m';
  $('pinValue').textContent=formatM(t.pinElevation);$('relief').textContent=formatM(t.max-t.min);$('area').textContent=Number((extent*extent/1e6).toFixed(2))+' km²';$('lo').textContent=formatM(t.min);$('hi').textContent=formatM(t.max);
  $('parcelResults').hidden=!parcelInput;$('pinLabel').textContent=parcelInput?'MEDIAN ELEVATION':'PIN ELEVATION';
  if(parcelInput){
   const p=t.parcel, m=v=>v.toLocaleString(undefined,{maximumFractionDigits:1});
   $('area').textContent=m(p.area)+' m²';$('pinValue').textContent=m(p.median)+' m';
   $('measureValues').textContent='Area '+m(p.area)+' m² · Perimeter '+m(p.perimeter)+' m · Elevation min '+m(p.min)+' m / median '+m(p.median)+' m / max '+m(p.max)+' m · '+t.source;
   const original=describeEarth(parcelInput.earth);
   $('earthValues').textContent=original?'Google Earth screenshot · '+original:'';
   const reportedArea=parcelInput.earth?.area;
   if(reportedArea&&Math.abs(p.area-reportedArea)/reportedArea>.10)
    $('earthValues').textContent+=' · Area differs by over 10%. Check the matched parcel or corner placement.';
  }
  $('status').textContent=parcelInput?'Parcel terrain ready':'Terrain ready';$('coordRead').textContent=t.lat.toFixed(5)+'° N   '+t.lon.toFixed(5)+'° E';$('probeInfo').hidden=true;
 }catch(e){if(pending!==controller){if(parcelInput)throw e;return;}dirty=true;report(e.message||'Elevation data is unavailable. Please try again.');$('status').textContent='Generation failed';if(parcelInput)throw e;}
 finally{if(pending===controller){pending=null;$('load').hidden=true;$('generate').querySelector('span').textContent='Generate terrain';controls();}}
}
setupParcelImport(generate);
$('siteForm').onsubmit=e=>{e.preventDefault();generate();};
function returnToModel(){if($('style').value==='satellite'){$('style').value='elevation';layers.render();}}
$('iso').onclick=()=>{returnToModel();view.fit();};$('plan').onclick=()=>{returnToModel();view.plan();};
$('satelliteView').onclick=()=>{if(!model)return;$('style').value='satellite';layers.render();};$('fit').onclick=()=>view.fit();$('plus').onclick=()=>view.zoomBy(1.2);$('minus').onclick=()=>view.zoomBy(1/1.2);
document.querySelectorAll('[data-tool]').forEach(el=>el.onclick=()=>{view.tool=el.dataset.tool;for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',b===el);$('canvas').style.cursor=view.tool==='probe'?'crosshair':'grab';$('probeInfo').hidden=view.tool!=='probe';$('probeInfo').textContent='Click a point on the terrain surface.';});
$('about').onclick=()=>$('sourceDialog').showModal();$('sourceDialog').querySelector('.close').onclick=()=>$('sourceDialog').close();
$('export').onclick=async()=>{
 if(!model||dirty||pending||exporting||layers.busy)return;
 const t=model,name=exportName;exporting=true;controls();const label=$('export').querySelector('span');label.textContent='Exporting…';
 try{const geometry=view.geometry;const texture=await layers.exportTexture();
 if(t.parcel&&texture){
  const coords=geometry.positions;
  texture.uvs=new Float32Array(coords.length/3*2);
  for(let i=0;i<coords.length/3;i++){texture.uvs[2*i]=.5+coords[3*i]/t.extent;texture.uvs[2*i+1]=.5-coords[3*i+1]/t.extent;}
 }
 const blob=await exportSketchUp({...geometry,texture,name:name+' terrain',latitude:t.lat,longitude:t.lon,source:t.source+' · '+t.spacing+' m · '+t.datum,attribution:t.attribution});
 const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download=name+' terrain.skp';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);if(model===t&&!dirty&&!pending)$('status').textContent='SketchUp file downloaded';}
 catch(e){report(e.message||'Could not create the SketchUp file.');}finally{exporting=false;label.textContent='Export model';controls();}
};

const homeScreen = $('homeScreen');
const modelScreen = $('modelScreen');
const menu = $('homeSamples');
const menuToggle = $('showSamples');
let firstOpen = true;

function closeSamples() {
 menu.hidden = true;
 menuToggle.setAttribute('aria-expanded', 'false');
}

function showRoute() {
 const editing = location.hash === '#workspace';
 homeScreen.hidden = editing;
 modelScreen.hidden = !editing;
 document.title = editing ? 'Terrain workspace | YCS Sketchup' : 'YCS Sketchup';
 closeSamples();
 if (editing && firstOpen) {
  firstOpen = false;
  generate();
 }
 if (editing) view.drawSoon();
}

function enterWorkspace() {
 location.hash = 'workspace';
 showRoute();
}

$('startModel').onclick = enterWorkspace;
$('newModel').onclick = () => {
 firstOpen = false;
 enterWorkspace();
 $('coords').value = '';
 markDraft();
 model = null;
 $('parcelResults').hidden=true;$('pinLabel').textContent='PIN ELEVATION';
 $('extent').querySelector('[data-parcel]')?.remove();
 layers.reset();
 view.model = null;
 view.mesh = null;
 view.projected = null;
 view.fit();
 $('siteName').textContent = 'New terrain';
 for (const id of ['pinValue','relief','area','lo','hi','sourceName']) $(id).textContent = '—';
 $('coordRead').textContent = 'WGS 84';
 $('dataDesc').textContent = 'Generate a terrain model to see its elevation source and resolution.';
 $('credit').textContent = '';
 $('probeInfo').hidden = true;
 for (const site of $('sites').children) {
  site.classList.remove('active');
  site.setAttribute('aria-pressed','false');
  site.querySelector('em').textContent = '↗';
 }
 $('coords').focus();
 $('status').textContent = 'Paste coordinates to start a new model';
};
menuToggle.onclick = () => {
 menu.hidden = !menu.hidden;
 menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
};
for (const [i, site] of samples.entries()) {
 const option = document.createElement('button');
 option.type = 'button';
 option.textContent = site.name;
 const subtitle = document.createElement('small');
 subtitle.textContent = site.area;
 option.append(subtitle);
 option.onclick = () => {
  firstOpen = false;
  enterWorkspace();
  $('sites').children[i].click();
 };
 menu.append(option);
}
document.addEventListener('click', event => {
 if (!event.target.closest('.sampleMenu')) closeSamples();
});
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && !menu.hidden) {
  closeSamples();
  menuToggle.focus();
 }
});
$('homeAbout').onclick = () => $('homeDialog').showModal();
$('closeHomeAbout').onclick = () => $('homeDialog').close();
window.addEventListener('hashchange', showRoute);
showRoute();
