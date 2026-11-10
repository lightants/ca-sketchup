import {loadBasemap} from './basemap.js?v=satellite2';

const $ = id => document.getElementById(id);

export class TerrainLayers {
 constructor(view, refresh, applySelection) {
  this.view = view;
  this.refresh = refresh;
  this.busy = false;
  $('style').onchange = applySelection;
  $('retryLayer').onclick = () => this.render();
 }

 setModel(model) {
  this.model = model;
  this.render();
 }

 reset() {
  $('style').value = 'satellite';
  this.setModel(null);
 }

 async render() {
  this.request?.abort();
  const job = new AbortController();
  this.request = job;
  const model = this.model;
  const kind = $('style').value;
  const satellite = kind === 'satellite';
  const basemap = satellite || kind === 'map';
  $('satelliteView').setAttribute('aria-pressed', String(satellite && !!model));
  this.layer = null;
  this.busy = false;
  this.view.clearOverlay();
  this.view.style = basemap ? 'clay' : kind;
  this.view.prepare();
  document.querySelector('.legend').style.visibility = kind === 'elevation' ? 'visible' : 'hidden';
  for (const id of ['layerCredit','googleBrand','retryLayer','googlePreview']) $(id).hidden = true;
  $('layerBar').hidden = !basemap || !model;
  if (!basemap || !model) { this.refresh(); return; }
  const status = $('layerStatus');
  const preview = $('googlePreview');
  if (satellite) {
   const zoom = Math.round(Math.log2(800 * 156543.03392 * Math.cos(model.lat * Math.PI / 180) / model.extent));
   preview.href = 'https://www.google.com/maps/@?' + new URLSearchParams({api:'1', map_action:'map',
    basemap:'satellite', center:model.lat+','+model.lon, zoom:String(Math.min(21,zoom))});
   preview.hidden = false;
  }
  this.busy = true;
  this.refresh();
  status.textContent = satellite ? 'Loading satellite imagery…' : 'Loading street map…';
  try {
   const result = await loadBasemap(kind, model.bounds, {signal:job.signal});
   if (this.request !== job) return;
   this.view.setOverlay(result.canvas);
   this.layer = result;
   $('googleBrand').hidden = result.source !== 'google';
   const width = model.extent.toLocaleString() + ' m';
   status.textContent = (result.fallback ? 'Google imagery unavailable · ' : '') + width + ' × ' + width + ' · ' +
    result.name + (result.exportable ? ' · included in export.' : result.source === 'google' ? ' · SketchUp uses Sentinel-2 imagery.' : ' · display only.');
   $('retryLayer').hidden = !result.fallback;
   const credit = $('layerCredit');
   credit.textContent = result.attribution;
   credit.href = result.url;
   credit.hidden = false;
  } catch (error) {
   if (this.request !== job) return;
   status.textContent = (satellite ? 'Satellite imagery' : 'Street map') + ' unavailable. Showing plain terrain.';
   $('retryLayer').hidden = false;
  } finally {
   if (this.request === job) { this.busy = false; this.refresh(); }
  }
 }

 async exportTexture() {
  let info = this.layer;
  if (info?.source === 'google') info = await loadBasemap('sentinel', this.model.bounds);
  if (!info?.exportable) return;
  const blob = await new Promise(resolve => info.canvas.toBlob(resolve, 'image/jpeg', .94));
  if (!blob) throw Error('Could not prepare the terrain image.');
  return {bytes:new Uint8Array(await blob.arrayBuffer()), mimeType:blob.type, name:info.name,
   attribution:info.exportAttribution || info.attribution};
 }
}
