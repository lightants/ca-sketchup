// The DEM grid is linear in latitude and longitude. Both tile services use Web Mercator.
const TILE_SIZE = 256;
const MAX_VIEW_PIXELS = 768;
const cache = new Map();
const satelliteCredit = 'EOxCloudless by EOX IT Services GmbH · Contains modified Copernicus Sentinel data 2016';
const providers = {
  sentinel: {
    name: 'Sentinel-2 · 2016 · 10 m', maxZoom: 14, attribution: satelliteCredit,
    url: 'https://cloudless.eox.at/', exportable: true,
    exportAttribution: satelliteCredit + '. https://cloudless.eox.at/ · CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ · Cropped and reprojected for this model.',
    tile: (z, x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/${z}/${y}/${x}.jpg`
  },
  map: {
    name: 'Street map', maxZoom: 19, attribution: '© OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org/copyright', exportable: false,
    tile: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }
};

function mercatorY(lat) {
  return (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2;
}

function canvas(width, height) {
  const result = document.createElement('canvas');
  result.width = width;
  result.height = height;
  return result;
}

async function drawTile(provider, zoom, x, y, context, left, top, signal) {
  const response = await fetch(provider.tile(zoom, x, y), {
    signal, referrerPolicy: 'strict-origin-when-cross-origin'
  });
  if (response.status === 429) throw Error(provider.name + ' is busy. Try again later.');
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw Error(provider.name + ' is unavailable for this location.');
  }
  // OSM may serve a policy/error image with a 200 and no-cache instead of a tile.
  if (provider === providers.map && /\bno-cache\b/i.test(response.headers.get('cache-control') || '')) {
    throw Error('The street map service declined this request. Try again later.');
  }
  const bitmap = await createImageBitmap(await response.blob());
  try {
    if (bitmap.width !== TILE_SIZE || bitmap.height !== TILE_SIZE) throw Error('Unexpected basemap tile size.');
    context.drawImage(bitmap, left, top);
  } finally {
    bitmap.close();
  }
}

export async function loadBasemap(kind, bounds, {signal} = {}) {
  const source = kind === 'satellite' ? 'sentinel' : kind;
  const provider = providers[source];
  if (!Object.hasOwn(providers, source)) throw Error('Unknown basemap.');
  const {north, south, east, west} = bounds;
  if (![north, south, east, west].every(Number.isFinite) || north <= south || east <= west ||
      south < -85 || north > 85 || west < -180 || east > 180) throw Error('Invalid basemap bounds.');
  signal?.throwIfAborted();
  const key = [source, north, south, east, west].join(',');
  if (cache.has(key)) return cache.get(key);

  const x = (west + 180) / 360, spanX = (east - west) / 360;
  const y = mercatorY(north), spanY = mercatorY(south) - y;
  const zoom = Math.max(0, Math.min(provider.maxZoom,
    Math.floor(Math.log2(MAX_VIEW_PIXELS / (TILE_SIZE * Math.max(spanX, spanY))))));
  const scale = TILE_SIZE * 2 ** zoom;
  const pixelWidth = spanX * scale, pixelHeight = spanY * scale;
  const firstX = Math.floor(x * scale / TILE_SIZE), firstY = Math.floor(y * scale / TILE_SIZE);
  const endX = Math.ceil((x + spanX) * scale / TILE_SIZE), endY = Math.ceil((y + spanY) * scale / TILE_SIZE);
  const mosaic = canvas((endX - firstX) * TILE_SIZE, (endY - firstY) * TILE_SIZE);
  const ctx = mosaic.getContext('2d');

  // Request only tiles intersecting the chosen site, three at a time, with normal HTTP caching.
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', abort, {once: true});
  const timer = setTimeout(() => controller.abort(new DOMException('Basemap timed out. Try again.', 'TimeoutError')), 25000);
  try {
    let next = 0;
    const columns = endX - firstX, count = columns * (endY - firstY);
    async function worker() {
      while (next < count) {
        const n = next++;
        const col = n % columns, row = Math.floor(n / columns);
        await drawTile(provider, zoom, firstX + col, firstY + row, ctx,
          col * TILE_SIZE, row * TILE_SIZE, controller.signal);
      }
    }
    await Promise.all(Array.from({length: Math.min(3, count)}, worker));
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    controller.abort();
    if (error instanceof TypeError) throw Error(provider.name + ' could not load. Check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }

  // Reproject each output row to the same latitude used by the corresponding terrain vertices.
  // The model is square in metres; both geographic edges must reach its edges.
  const side = Math.max(1, Math.round(Math.max(pixelWidth, pixelHeight)));
  const result = canvas(side, side);
  const out = result.getContext('2d');
  const sourceX = x * scale - firstX * TILE_SIZE;
  let top = y * scale - firstY * TILE_SIZE;
  for (let row = 0; row < result.height; row++) {
    const lat = north - (north - south) * (row + 1) / result.height;
    const bottom = mercatorY(lat) * scale - firstY * TILE_SIZE;
    out.drawImage(mosaic, sourceX, top, pixelWidth, bottom - top, 0, row, result.width, 1);
    top = bottom;
  }
  const {name, url, attribution, exportable, exportAttribution} = provider;
  const layer = {canvas: result, name, source, attribution, url, exportable, exportAttribution, bounds: {...bounds}};
  if (cache.size >= 6) cache.delete(cache.keys().next().value);
  cache.set(key, layer);
  return layer;
}
