import {degreeScales} from './data/elevation.js';

// Esri's public World Imagery scene provides its own renderer, elevation and credits.
const sceneId='7b4da05394c8464c8c313d5dc951f841';

export function satelliteLinks(model){
 const tilt=49,heading=342;
 const extent=Math.max(220,Math.min(model.extent,650));
 const height=extent*.86;
 const distance=height*Math.tan(tilt*Math.PI/180);
 const scales=degreeScales(model.lat);
 const lat=model.lat-Math.cos(heading*Math.PI/180)*distance/scales.north;
 const lon=model.lon-Math.sin(heading*Math.PI/180)*distance/scales.east;
 const scene=new URL('https://www.arcgis.com/home/webscene/viewer.html');
 scene.searchParams.set('webscene',sceneId);
 scene.searchParams.set('viewpoint','cam:'+lon.toFixed(7)+','+lat.toFixed(7)+','+(height+model.pinElevation).toFixed(1)+';'+heading+','+tilt);
 scene.searchParams.set('ui','min');
 const earth='https://earth.google.com/web/@'+model.lat.toFixed(7)+','+model.lon.toFixed(7)+','+Math.round(model.pinElevation)+'a,'+Math.round(height/Math.cos(tilt*Math.PI/180))+'d,35y,'+heading+'h,'+tilt+'t,0r';
 return {scene:scene.href,earth};
}

export function showSatellite(model){
 const frame=document.createElement('iframe'),links=satelliteLinks(model);
 frame.title='Satellite imagery and 3D terrain around this site';frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=links.scene;
 document.getElementById('sceneLink').href=links.scene;
 document.getElementById('earthLink').href=links.earth;
 document.getElementById('sceneFrame').replaceChildren(frame);
 document.getElementById('stage').classList.add('earthScene');
}
export function closeSatellite(){
 document.getElementById('stage').classList.remove('earthScene');
 document.getElementById('sceneFrame').replaceChildren();
}
