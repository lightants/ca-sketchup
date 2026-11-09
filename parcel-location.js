import {parseCoordinates} from './coordinates.js';

const MAX_VERTICES = 2048;
const MAX_SPAN_METRES = 5000;
const badAnchors = 'Choose four well-separated matching points around the parcel. Avoid three points on the same line.';

function pixel(point) {
  const [x, y] = Array.isArray(point) ? point : [point?.x, point?.y];
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw Error('A screenshot point is missing.');
  return {x, y};
}

function geographic(point) {
  const {lat, lon} = typeof point === 'string' ? parseCoordinates(point) : point || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat <= 4 || lat >= 11 || lon <= 119 || lon >= 127) {
    throw Error('All parcel coordinates must lie within Mindanao coverage (4–11° N, 119–127° E).');
  }
  return {lat, lon};
}

// Local WGS84 tangent-plane scale at the parcel, matching the DEM's latitude/longitude grid.
function localFrame(points) {
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
  const rad = Math.PI / 180;
  const w = 1 - 0.00669437999014 * Math.sin(lat * rad) ** 2;
  const east = rad * 6378137 * Math.cos(lat * rad) / Math.sqrt(w);
  const north = rad * 6378137 * (1 - 0.00669437999014) / w ** 1.5;
  return {
    project: p => ({x: (p.lon - lon) * east, y: (p.lat - lat) * north}),
    unproject: p => ({lat: lat + p.y / north, lon: lon + p.x / east})
  };
}

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function normalizer(points) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const left = Math.min(...xs), right = Math.max(...xs);
  const top = Math.min(...ys), bottom = Math.max(...ys);
  const scale = Math.max(right - left, bottom - top);
  if (!Number.isFinite(scale) || scale === 0) throw Error('Choose distinct parcel points.');
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  return {
    scale,
    normalize: p => ({x: (p.x - cx) / scale, y: (p.y - cy) / scale}),
    restore: p => ({x: p.x * scale + cx, y: p.y * scale + cy})
  };
}

function homography(source, target) {
  for (const points of [source, target]) {
    for (let i = 0; i < 4; i++) {
      if (Math.abs(cross(points[i], points[(i + 1) % 4], points[(i + 2) % 4])) < 1e-4) throw Error(badAnchors);
    }
  }

  // h[8] is fixed at one. Solve the eight correspondence equations with partial pivoting.
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const {x, y} = source[i], {x: u, y: v} = target[i];
    rows.push([x, y, 1, 0, 0, 0, -u*x, -u*y, u],
              [0, 0, 0, x, y, 1, -v*x, -v*y, v]);
  }
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let r = col + 1; r < 8; r++) {
      if (Math.abs(rows[r][col]) > Math.abs(rows[pivot][col])) pivot = r;
    }
    if (Math.abs(rows[pivot][col]) < 1e-9) throw Error(badAnchors);
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const divisor = rows[col][col];
    for (let j = col; j <= 8; j++) rows[col][j] /= divisor;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const factor = rows[r][col];
      for (let j = col; j <= 8; j++) rows[r][j] -= factor * rows[col][j];
    }
  }
  return rows.map(row => row[8]);
}

function ringSize(ring) {
  if (!Array.isArray(ring) || ring.length < 3 || ring.length > MAX_VERTICES + 1) {
    throw Error('Use a parcel with 3 to ' + MAX_VERTICES + ' boundary vertices.');
  }
}

function intersects(a, b, c, d) {
  if (Math.max(a.x, b.x) < Math.min(c.x, d.x) || Math.max(c.x, d.x) < Math.min(a.x, b.x) ||
      Math.max(a.y, b.y) < Math.min(c.y, d.y) || Math.max(c.y, d.y) < Math.min(a.y, b.y)) return false;
  return cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0;
}

function validateRing(points) {
  if (points.length > 1 && points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon) points.pop();
  if (points.length < 3 || points.length > MAX_VERTICES) throw Error('Use 3 to ' + MAX_VERTICES + ' distinct boundary vertices.');
  const metres = points.map(localFrame(points).project);
  const norm = normalizer(metres);
  if (norm.scale > MAX_SPAN_METRES) throw Error('The parcel must fit within a 5,000 m terrain extent.');
  const ring = metres.map(norm.normalize);
  const n = ring.length;
  let area2 = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n], c = ring[(i + 2) % n];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-9) throw Error('Remove repeated parcel vertices.');
    if (Math.abs(cross(a, b, c)) < 1e-12 && (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y) > 0) {
      throw Error('The parcel outline doubles back. Check the vertex order.');
    }
    area2 += a.x * b.y - b.x * a.y;
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (intersects(a, b, ring[j], ring[(j + 1) % n])) throw Error('The parcel outline crosses itself. Check the vertex order.');
    }
  }
  if (Math.abs(area2) < 1e-9) throw Error('The parcel outline must enclose an area.');
  return points;
}

// Matched screen and ground points may be supplied in any order, provided the pairs agree.
export function georeference(pixelRing, pixelAnchors, geoAnchors) {
  ringSize(pixelRing);
  if (pixelAnchors?.length !== 4 || geoAnchors?.length !== 4) throw Error('Match four screenshot points to four Google Earth coordinates.');
  const anchors = pixelAnchors.map(pixel), coordinates = geoAnchors.map(geographic);
  const frame = localFrame(coordinates);
  const projected = coordinates.map(frame.project);
  const image = normalizer(anchors), ground = normalizer(projected);
  const h = homography(anchors.map(image.normalize), projected.map(ground.normalize));
  const weights = anchors.map(image.normalize).map(({x, y}) => h[6] * x + h[7] * y + 1);
  const sign = Math.sign(weights[0]);
  function transform({x, y}) {
    const w = h[6] * x + h[7] * y + 1;
    if (w * sign <= 1e-5) throw Error('The alignment folds across the parcel. Check the four matched corners.');
    return {x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w};
  }
  if (weights.some(w => w * sign <= 1e-5)) throw Error('The matching points are out of order. Check each corner against its coordinates.');
  const points = pixelRing.map(pixel).map(image.normalize).map(transform).map(ground.restore).map(frame.unproject).map(geographic);
  return validateRing(points);
}

export function parseParcelKml(text) {
  if (typeof text !== 'string' || text.length > 4 * 1024 * 1024) throw Error('Choose a KML file smaller than 4 MB.');
  if (/<!DOCTYPE\b/i.test(text)) throw Error('Export the polygon as plain Google Earth KML.');
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const tags = (el, name) => Array.from(el.getElementsByTagNameNS('*', name));
  if (tags(doc, 'parsererror').length || doc.documentElement?.localName !== 'kml') throw Error('Choose a valid Google Earth .kml file.');
  const polygons = tags(doc, 'Polygon');
  if (polygons.length !== 1) throw Error('Export one parcel Polygon per KML file.');
  const poly = polygons[0];
  if (tags(poly, 'innerBoundaryIs').length) throw Error('Parcels with interior holes are not supported.');
  const outer = tags(poly, 'outerBoundaryIs');
  const rings = outer.length === 1 ? tags(outer[0], 'LinearRing') : [];
  const coordinates = rings.length === 1 ? tags(rings[0], 'coordinates') : [];
  if (coordinates.length !== 1) throw Error('The KML Polygon needs one outer boundary ring.');
  const tuples = coordinates[0].textContent.trim().split(/\s+/);
  ringSize(tuples);
  const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const points = tuples.map(tuple => {
    const parts = tuple.split(',');
    if (parts.length < 2 || parts.length > 3 || !parts.every(s => number.test(s) && Number.isFinite(Number(s)))) throw Error('The KML boundary contains an invalid coordinate.');
    return geographic({lon: Number(parts[0]), lat: Number(parts[1])});
  });
  if (points[0].lat !== points.at(-1).lat || points[0].lon !== points.at(-1).lon) throw Error('Close the KML Polygon by repeating its first vertex at the end.');
  return validateRing(points);
}
