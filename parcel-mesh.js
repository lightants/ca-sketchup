// All geometry uses local metres, X east, Y north and Z up. Area and
// perimeter are horizontal measurements. The input ring describes one parcel.
const orient = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function bounds(points) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const [x, y] of points) {
    west = Math.min(west, x); east = Math.max(east, x);
    south = Math.min(south, y); north = Math.max(north, y);
  }
  return {west, east, south, north};
}

function signedArea(ring) {
  let twiceArea = 0;
  for (let i = 1; i + 1 < ring.length; i++) twiceArea += orient(ring[0], ring[i], ring[i + 1]);
  return twiceArea / 2;
}

function onSegment(a, b, p, eps) {
  return Math.abs(orient(a, b, p)) <= eps * distance(a, b)
    && p[0] >= Math.min(a[0], b[0]) - eps && p[0] <= Math.max(a[0], b[0]) + eps
    && p[1] >= Math.min(a[1], b[1]) - eps && p[1] <= Math.max(a[1], b[1]) + eps;
}

function segmentsMeet(a, b, c, d, eps) {
  if (onSegment(a, b, c, eps) || onSegment(a, b, d, eps)
    || onSegment(c, d, a, eps) || onSegment(c, d, b, eps)) return true;
  return ((orient(a, b, c) > 0) !== (orient(a, b, d) > 0))
    && ((orient(c, d, a) > 0) !== (orient(c, d, b) > 0));
}

export function validateRing(input) {
  if (!Array.isArray(input) || input.length < 3) throw Error('Mark at least three boundary corners.');
  const points = input.map(point => {
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      throw Error('Each boundary corner needs a finite east and north coordinate.');
    }
    return [point[0], point[1]];
  });
  const {west, east, south, north} = bounds(points);
  const span = Math.max(1, east - west, north - south);
  const eps = span * 1e-11;
  const ring = points.filter((p, i) => !i || distance(points[i - 1], p) > eps);
  if (ring.length > 1 && distance(ring[0], ring.at(-1)) <= eps) ring.pop();
  if (ring.length < 3) throw Error('Mark at least three distinct boundary corners.');

  // Remove only collinear waypoints that lie between their neighbours.
  // A reversal along the same edge is an overlapping boundary.
  let changed = true;
  while (changed && ring.length >= 3) {
    changed = false;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[(i + ring.length - 1) % ring.length], b = ring[i], c = ring[(i + 1) % ring.length];
      if (onSegment(a, c, b, eps)) {
        ring.splice(i, 1); changed = true; break;
      }
      if (onSegment(a, b, c, eps) || onSegment(b, c, a, eps)) throw Error('The boundary doubles back on itself.');
    }
  }
  if (ring.length < 3) throw Error('The boundary needs corners that enclose an area.');
  for (let i = 0; i < ring.length; i++) {
    for (let j = i + 2; j < ring.length; j++) {
      if (i === 0 && j === ring.length - 1) continue;
      if (segmentsMeet(ring[i], ring[(i + 1) % ring.length], ring[j], ring[(j + 1) % ring.length], eps)) {
        throw Error('The boundary crosses or touches itself. Trace its corners in perimeter order.');
      }
    }
  }
  const area = signedArea(ring);
  if (Math.abs(area) <= eps * span) throw Error('The boundary needs corners that enclose an area.');
  return area < 0 ? ring.reverse() : ring;
}

// A convex clip can be applied directly. Decompose a concave ring into
// disjoint ears so the intersection can have multiple pieces in a DEM cell.
function convexPieces(ring) {
  const size = ring.length;
  if (ring.every((p, i) => orient(p, ring[(i + 1) % size], ring[(i + 2) % size]) >= 0)) return [ring];
  const active = ring.slice(), pieces = [];
  while (active.length > 3) {
    const n = active.length;
    let found = false;
    for (let i = 0; i < n; i++) {
      const before = (i + n - 1) % n, after = (i + 1) % n;
      const a = active[before], b = active[i], c = active[after];
      if (orient(a, b, c) <= 0) continue;
      const hasPoint = active.some((p, j) => j !== before && j !== i && j !== after
        && orient(a, b, p) >= 0 && orient(b, c, p) >= 0 && orient(c, a, p) >= 0);
      if (hasPoint) continue;
      pieces.push([a, b, c]); active.splice(i, 1); found = true; break;
    }
    if (!found) throw Error('The boundary could not be triangulated. Check closely spaced or overlapping corners.');
  }
  pieces.push(active);
  return pieces;
}

// Sutherland-Hodgman clipping. Each new point interpolates along an edge of
// a planar terrain triangle, preserving its original piecewise-linear surface.
function clipTriangle(triangle, boundary) {
  let polygon = triangle;
  for (let i = 0; i < boundary.length && polygon.length; i++) {
    const a = boundary[i], b = boundary[(i + 1) % boundary.length];
    const clipped = [];
    let last = polygon.at(-1), sideLast = orient(a, b, last);
    for (const vertex of polygon) {
      const side = orient(a, b, vertex);
      if ((side > 0 && sideLast < 0) || (side < 0 && sideLast > 0)) {
        const fraction = sideLast / (sideLast - side);
        clipped.push(last.map((v, axis) => v + fraction * (vertex[axis] - v)));
      }
      if (side >= 0) clipped.push(vertex);
      last = vertex; sideLast = side;
    }
    polygon = clipped;
  }
  return polygon;
}

// On a planar triangle the sublevel-set boundary is a straight line.
// Similar-triangle areas give the fraction below h without point-sample bias.
function medianByArea(triangles, low, high, total) {
  for (let step = 0; step < 50 && high > low; step++) {
    const h = low + (high - low) / 2;
    let area = 0;
    for (const [lo, mid, hi, weight] of triangles) {
      if (h >= hi) area += weight;
      else if (h > lo) {
        const fraction = h < mid
          ? ((h - lo) / (mid - lo)) * ((h - lo) / (hi - lo))
          : 1 - ((hi - h) / (hi - mid)) * ((hi - h) / (hi - lo));
        area += weight * fraction;
      }
    }
    if (area >= total / 2) high = h;
    else low = h;
  }
  return high;
}

export function clipTerrain(t, input) {
  const ring = validateRing(input);
  const {rows, cols, heights, extent} = t;
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2
    || !Number.isFinite(extent) || extent <= 0 || heights?.length !== rows * cols) {
    throw Error('Generate a valid terrain model before clipping a parcel.');
  }
  const half = extent / 2;
  const snap = Math.max(extent, 1) * 1e-11;
  for (const p of ring) {
    if (Math.abs(p[0]) > half + snap || Math.abs(p[1]) > half + snap) {
      throw Error('The boundary extends beyond this terrain. Generate a larger extent that includes every corner.');
    }
    p[0] = Math.max(-half, Math.min(half, p[0]));
    p[1] = Math.max(-half, Math.min(half, p[1]));
  }
  const dx = extent / (cols - 1), dy = extent / (rows - 1);
  const positions = [], indices = [], triangles = [], vertexIds = new Map();
  const expectedArea = signedArea(ring);
  let min = Infinity, max = -Infinity, area = 0;
  const perimeter = ring.reduce((s, p, i) => s + distance(p, ring[(i + 1) % ring.length]), 0);
  function gridPoint(row, col) {
    const z = heights[row * cols + col];
    return [col * dx - half, half - row * dy, z];
  }
  function vertexId(p) {
    const key = Math.round(p[0] / snap) + ',' + Math.round(p[1] / snap);
    const old = vertexIds.get(key);
    if (old !== undefined) return old;
    const id = positions.length / 3;
    positions.push(...p);
    vertexIds.set(key, id);
    return id;
  }
  function addFace(a, b, c) {
    const weight = orient(a, b, c) / 2;
    if (weight <= snap * snap) return;
    if (![a[2], b[2], c[2]].every(Number.isFinite)) throw Error('Elevation is missing inside this boundary.');
    const ia = vertexId(a), ib = vertexId(b), ic = vertexId(c);
    if (ia === ib || ib === ic || ia === ic) return;
    const z = [positions[ia * 3 + 2], positions[ib * 3 + 2], positions[ic * 3 + 2]].sort((u,v) => u-v);
    indices.push(ia, ib, ic);
    triangles.push([...z, weight]);
    area += weight;
    min = Math.min(min, z[0]); max = Math.max(max, z[2]);
  }
  for (const piece of convexPieces(ring)) {
    const {west, east, south, north} = bounds(piece);
    const firstCol = Math.max(0, Math.floor((west + half) / dx));
    const lastCol = Math.min(cols - 2, Math.ceil((east + half) / dx) - 1);
    const firstRow = Math.max(0, Math.floor((half - north) / dy));
    const lastRow = Math.min(rows - 2, Math.ceil((half - south) / dy) - 1);
    for (let r = firstRow; r <= lastRow; r++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const nw = gridPoint(r, col), ne = gridPoint(r, col + 1);
        const sw = gridPoint(r + 1, col), se = gridPoint(r + 1, col + 1);
        for (const face of [[nw, se, ne], [nw, sw, se]]) {
          const polygon = clipTriangle(face, piece);
          for (let i = 1; i + 1 < polygon.length; i++) addFace(polygon[0], polygon[i], polygon[i + 1]);
        }
      }
    }
  }
  if (!indices.length || Math.abs(area - expectedArea) > 1e-8 * expectedArea) {
    throw Error('The terrain could not cover the entire parcel. Check its corners and model extent.');
  }
  return {positions: Float64Array.from(positions), indices: Uint32Array.from(indices), min, max,
    median: medianByArea(triangles, min, max, area), area: expectedArea, perimeter};
}
