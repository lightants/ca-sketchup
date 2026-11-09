import {localPatches, regionTiles} from './catalog.js';

const copernicusURL = 'https://registry.opendata.aws/copernicus-dem/';
const mapzenURL = 'https://registry.opendata.aws/terrain-tiles/';
const packedCache = new Map();
const imageCache = new Map();
const radians = Math.PI / 180;

function remember(cache, key, value, capacity) {
  if (cache.size >= capacity) cache.delete(cache.keys().next().value);
  cache.set(key, value);
  return value;
}

function copernicusNotice(product) {
  return `Produced using Copernicus WorldDEM-${product} © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.`;
}

async function packed(path, width, signal) {
  if (packedCache.has(path)) return packedCache.get(path);
  const response = await fetch(new URL(path, import.meta.url), {signal});
  if (!response.ok) throw Error('The packaged elevation data could not be loaded.');
  const stream = response.body.pipeThrough(new DecompressionStream('deflate'));
  const buffer = await new Response(stream).arrayBuffer();
  if (buffer.byteLength !== width * width * 2) throw Error('Incomplete elevation file.');
  const values = new Int16Array(buffer);
  for (let row = 0; row < width; row++) {
    const start = row * width;
    for (let col = 1; col < width; col++) values[start + col] += values[start + col - 1];
  }
  return remember(packedCache, path, values, 8);
}

function degreeScales(lat) {
  const sin = Math.sin(lat * radians);
  const w = 1 - 0.00669437999014 * sin * sin;
  return {
    east: radians * 6378137 * Math.cos(lat * radians) / Math.sqrt(w),
    north: radians * 6378137 * (1 - 0.00669437999014) / Math.pow(w, 1.5)
  };
}

function square(lat, lon, extent) {
  const s = degreeScales(lat);
  return {
    north: lat + extent / (2 * s.north), south: lat - extent / (2 * s.north),
    west: lon - extent / (2 * s.east), east: lon + extent / (2 * s.east)
  };
}

function interpolate(x, y, at) {
  const i = Math.floor(x), j = Math.floor(y), u = x-i, v = y-j;
  return (1-v)*((1-u)*at(i,j) + u*at(i+1,j))
    + v*((1-u)*at(i,j+1) + u*at(i+1,j+1));
}

function localPatch(b) {
  return localPatches.find(p => b.west >= p.west && b.east < p.west + 240/3600
    && b.north <= p.north && b.south > p.north - 240/3600);
}

async function localSampler(p, signal) {
  const w = 241;
  const a = await packed(`local/${p.name}.bin`, w, signal);
  return {
    source: 'Copernicus GLO-30', sourceURL: copernicusURL, spacing: 30,
    datum: 'EGM2008', attribution: copernicusNotice(30),
    value(lat, lon) {
      const x = (lon-p.west)*3600, y = (p.north-lat)*3600;
      // Use the same NW–SE triangle split as the native SketchUp terrain model.
      const i = Math.floor(x), j = Math.floor(y), u = x-i, v = y-j, k=j*w+i;
      return (u >= v ? (1-u)*a[k] + (u-v)*a[k+1] + v*a[k+w+1]
        : (1-v)*a[k] + (v-u)*a[k+w] + u*a[k+w+1]) / 10;
    }
  };
}

const zoom = 13, worldPixels = 256 * 2**zoom;
function mercator(lat, lon) {
  return [(lon+180)/360 * worldPixels - 0.5,
    (1 - Math.asinh(Math.tan(lat*radians)) / Math.PI)/2 * worldPixels - 0.5];
}

async function imageTile(x, y, signal) {
  const key = x+'/'+y;
  if (imageCache.has(key)) return imageCache.get(key);
  const response = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${zoom}/${key}.png`, {signal});
  if (!response.ok) throw Error('Online elevation tiles unavailable.');
  const source = response.headers.get('x-amz-meta-x-imagery-sources') || '';
  const blob = await response.blob();
  const bmp = await createImageBitmap(blob,{colorSpaceConversion:'none'});
  try {
    if (bmp.width !== 256 || bmp.height !== 256) throw Error('Invalid terrain tile.');
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(bmp,0,0);
    const rgba = ctx.getImageData(0,0,256,256).data;
    const values = new Float32Array(256*256);
    for (let i=0;i<values.length;i++) values[i]=256*rgba[4*i]+rgba[4*i+1]+rgba[4*i+2]/256-32768;
    return remember(imageCache, key, {values, source}, 36);
  } finally {
    bmp.close();
  }
}

async function onlineSampler(bounds, signal) {
  const [x0,y0] = mercator(bounds.north,bounds.west);
  const [x1,y1] = mercator(bounds.south,bounds.east);
  const tiles = new Map(), tasks = [];
  for (let ty=Math.floor(y0/256);ty<=Math.floor((Math.floor(y1)+1)/256);ty++) {
    for (let tx=Math.floor(x0/256);tx<=Math.floor((Math.floor(x1)+1)/256);tx++) {
      const key=tx+'/'+ty;
      tasks.push(imageTile(tx,ty,signal).then(t => tiles.set(key,t)));
    }
  }
  await Promise.all(tasks);
  function at(i,j) {
    return tiles.get(Math.floor(i/256)+'/'+Math.floor(j/256)).values[(j%256)*256+i%256];
  }
  const isSrtm = [...tiles.values()].every(t => /^srtm\//i.test(t.source) && !/,(?!\s*srtm\/)/i.test(t.source));
  return {
    source: isSrtm ? 'Mapzen / NASA SRTM' : 'Mapzen Terrain Tiles', sourceURL: mapzenURL,
    spacing: 30, datum: isSrtm ? 'EGM96' : 'Source-dependent MSL',
    attribution: 'Mapzen Terrain Tiles. Includes NASA Shuttle Radar Topography Mission data and additional sources as listed in Tilezen’s terrain attribution.',
    value(lat,lon) { const [x,y]=mercator(lat,lon); return interpolate(x,y,at); }
  };
}

async function regionSampler(b, signal) {
  const resolution = 1200;
  const tiles = new Map(), tasks = [];
  // Global post indices count eastward and southward; this handles exact degree boundaries.
  const westX = Math.floor(b.west*resolution);
  const eastX = Math.floor(b.east*resolution)+1;
  const northY = Math.floor(-b.north*resolution);
  const southY = Math.floor(-b.south*resolution)+1;
  for (let ry=Math.floor(northY/resolution); ry<=Math.floor(southY/resolution); ry++) {
    for (let rx=Math.floor(westX/resolution); rx<=Math.floor(eastX/resolution); rx++) {
      const key=(-ry-1)+'_'+rx;
      // The official Copernicus catalog intentionally excludes ocean-only tiles.
      if (regionTiles.has(key)) tasks.push(packed('region/'+key+'.bin',resolution,signal).then(a=>tiles.set(key,a)));
    }
  }
  await Promise.all(tasks);
  function at(i,j) {
    const rx=Math.floor(i/resolution), ry=Math.floor(j/resolution);
    const tile=tiles.get((-ry-1)+'_'+rx);
    return tile ? tile[(j-ry*resolution)*resolution+i-rx*resolution] : 0;
  }
  return {
    source: 'Copernicus GLO-90', sourceURL: copernicusURL, spacing: 90,
    datum: 'EGM2008', attribution: copernicusNotice(90),
    value(lat,lon) { return interpolate(lon*resolution,-lat*resolution,at); }
  };
}

/** Square 3D patch centred at WGS84 latitude and longitude. Heights are metres, NW row first. */
export async function loadTerrain({lat, lon, extent=1000, signal, onStatus}) {
  if (![lat,lon,extent].every(Number.isFinite) || extent < 200 || extent > 5000) {
    throw Error('Use a site extent between 200 and 5,000 metres.');
  }
  const b=square(lat,lon,extent);
  if (b.south<=4 || b.north>=11 || b.west<=119 || b.east>=127) {
    throw Error('Choose a site within the Mindanao coverage area.');
  }
  if (signal?.aborted) throw signal.reason || new DOMException('Aborted','AbortError');
  const patch=localPatch(b);
  let sampler;
  if (patch) sampler=await localSampler(patch,signal);
  else {
    const online=new AbortController();
    const stop=()=>online.abort();
    const timeout=setTimeout(stop,4500);
    signal?.addEventListener('abort',stop,{once:true});
    try {
      sampler = await onlineSampler(b,online.signal);
    } catch (err) {
      if (signal?.aborted) throw err;
      onStatus?.('Loading regional elevation…');
      sampler = await regionSampler(b,signal);
    } finally {
      clearTimeout(timeout);
      online.abort();
      signal?.removeEventListener('abort',stop);
    }
  }
  if (signal?.aborted) throw signal.reason || new DOMException('Aborted','AbortError');
  // An even cell count ensures the pasted pin is exactly a grid vertex.
  const cells=2*Math.max(2,Math.ceil(extent/(2*sampler.spacing)));
  const rows=cells+1, cols=rows, heights=new Float32Array(rows*cols);
  let min=Infinity,max=-Infinity;
  for (let r=0;r<rows;r++) {
    const y=b.north-(b.north-b.south)*r/cells;
    for (let c=0;c<cols;c++) {
      const x=b.west+(b.east-b.west)*c/cells;
      const z=sampler.value(y,x);
      if (!Number.isFinite(z)) throw Error('Missing elevations within this extent.');
      heights[r*cols+c]=z;min=Math.min(min,z);max=Math.max(max,z);
    }
  }
  const {value,...meta}=sampler;
  return {...meta,lat,lon,extent,rows,cols,heights,min,max,pinElevation:heights[(cells/2)*cols+cells/2],bounds:b};
}
