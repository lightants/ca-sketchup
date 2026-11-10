import {googleMapsBrowserKey} from './satellite-config.js';
export const googleSatelliteEnabled = Boolean(googleMapsBrowserKey.trim());

const host = 'https://tile.googleapis.com';
let session;

async function metadata(path, params, signal, body) {
  const query = new URLSearchParams({...params, key: googleMapsBrowserKey});
  const options = {signal, referrerPolicy: 'strict-origin-when-cross-origin'};
  if (body) Object.assign(options, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)});
  const response = await fetch(host + path + '?' + query, options);
  if (!response.ok) throw Error('Google satellite imagery is unavailable.');
  return response.json();
}

export async function googleSiteProvider(bounds, requestedZoom, signal) {
  if (!session || Number(session.expiry) * 1000 < Date.now() + 60000) {
    const data = await metadata('/v1/createSession', {}, signal, {mapType:'satellite', language:'en-US', region:'PH'});
    if (!data.session || data.tileWidth !== 256 || data.tileHeight !== 256) throw Error('Unsupported Google satellite tiles.');
    session = data;
  }
  const token = session.session;
  const viewport = zoom => metadata('/tile/v1/viewport', {...bounds, zoom, session:token}, signal);
  let info = await viewport(requestedZoom);
  // The service lists overlapping availability rectangles. Use the finest single
  // rectangle covering the full site so its edges have imagery at the same level.
  const levels = (info.maxZoomRects || []).filter(rect =>
    rect.west <= bounds.west && rect.east >= bounds.east && rect.south <= bounds.south && rect.north >= bounds.north
  ).map(rect => rect.maxZoom).filter(Number.isInteger);
  if (!levels.length) throw Error('Google satellite coverage is unavailable at this site.');
  const maxZoom = Math.min(requestedZoom, Math.max(...levels));
  if (maxZoom < requestedZoom) info = await viewport(maxZoom);
  if (!info.copyright) throw Error('Google satellite credits are unavailable.');
  const params = new URLSearchParams({session:token, key:googleMapsBrowserKey});
  return {
    name:'Google satellite', maxZoom, attribution:info.copyright, url:'https://www.google.com/permissions/geoguidelines/',
    exportable:false, tile:(z,x,y) => host + '/v1/2dtiles/' + z + '/' + x + '/' + y + '?' + params
  };
}
