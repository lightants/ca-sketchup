import { create } from './openskp-writer.js';

const inchesPerMetre = 1 / 0.0254;

function surfaceStyle(builder, texture, points, minimum, maximum) {
  if (!texture) {
    const material = builder.addMaterial('Terrain surface', [155, 179, 140]);
    const options = { material, backMaterial: material, smoothEdges: true, softEdges: true };
    return () => options;
  }

  const { bytes, mimeType, uvs, name = 'Site imagery' } = texture;
  const image = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
  if (image.length < 8 || !['image/jpeg', 'image/png'].includes(mimeType)) {
    throw new Error('The SketchUp overlay needs a PNG or JPEG image.');
  }
  if (uvs && uvs.length !== points.length * 2) {
    throw new Error('The SketchUp overlay has a different vertex count than the terrain.');
  }
  const material = builder.addTextureMaterial(name, image, mimeType === 'image/png' ? 'site.png' : 'site.jpg');
  const options = { material, backMaterial: material, smoothEdges: true, softEdges: true };
  const width = maximum[0] - minimum[0];
  const height = maximum[1] - minimum[1];
  const pins = points.map((point, vertex) => {
    // Browser imagery runs from the top-left; SketchUp's V axis starts at the bottom.
    const u = uvs ? uvs[2 * vertex] : (point[0] - minimum[0]) / width;
    const v = uvs ? 1 - uvs[2 * vertex + 1] : (point[1] - minimum[1]) / height;
    if (!Number.isFinite(u) || !Number.isFinite(v)) {
      throw new Error('The SketchUp overlay has invalid image coordinates.');
    }
    return [point, [u, v]];
  });
  return (a, b, c) => {
    const uv = [pins[a], pins[b], pins[c]];
    return { ...options, frontUv: uv, backUv: uv };
  };
}

export function encodeTerrain({ positions, indices, name, latitude, longitude, source, attribution, texture }) {
  if (!positions?.length || positions.length % 3 || !indices?.length || indices.length % 3) {
    throw new Error('The terrain mesh has no valid triangles.');
  }

  const builder = create();
  const points = [];
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    const point = Array.from(positions.slice(i, i + 3), value => value * inchesPerMetre);
    for (let j = 0; j < 3; j++) {
      if (!Number.isFinite(point[j])) throw new Error('Elevation data is missing for part of this site.');
      minimum[j] = Math.min(minimum[j], point[j]);
      maximum[j] = Math.max(maximum[j], point[j]);
    }
    points.push(point);
  }

  const getFaceStyle = surfaceStyle(builder, texture, points, minimum, maximum);
  const attributes = { 'Site': name || 'Mindanao terrain', 'Coordinates': 'Local east, north and height in metres' };
  if (Number.isFinite(latitude)) attributes.Latitude = latitude;
  if (Number.isFinite(longitude)) attributes.Longitude = longitude;
  if (source) attributes['Elevation source'] = source;
  if (attribution) attributes['Data credit'] = attribution;
  if (texture?.attribution) attributes['Imagery credit'] = texture.attribution;
  builder.addGroup(group => {
    for (let i = 0; i < indices.length; i += 3) {
      const a = points[indices[i]], b = points[indices[i + 1]], c = points[indices[i + 2]];
      if (!a || !b || !c) throw new Error('Terrain has an invalid triangle.');
      group.addFace([a, b, c], getFaceStyle(indices[i], indices[i + 1], indices[i + 2]));
    }
  }, { name: name || 'Mindanao terrain', attributeDictName: 'Terrain Studio', attributes });
  const result = builder.toBytes();

  // The 2017 camera in the OpenSKP 1.5.0 scaffold is in inches. Retain the
  // scaffold's orthonormal isometric axes and scale the view to this site.
  const camera = new DataView(result.buffer, result.byteOffset, result.byteLength);
  // Integer UnitsOptions fields in the same version-pinned scaffold. Geometry
  // stays in SketchUp's internal inches; tape measurements display in metres.
  const lengthFormatOffset = 2360;
  const lengthUnitOffset = 2389;
  if (camera.getInt32(lengthFormatOffset, true) !== 1 || camera.getInt32(lengthUnitOffset, true) !== 0) {
    throw new Error('This model writer has an unrecognized unit layout.');
  }
  camera.setInt32(lengthFormatOffset, 0, true); // Decimal
  camera.setInt32(lengthUnitOffset, 4, true); // Metres
  const cameraPosition = 2987;
  if (camera.getFloat64(cameraPosition, true) !== 100 || camera.getFloat64(cameraPosition + 8, true) !== -100) {
    throw new Error('This model writer has an unrecognized camera layout.');
  }
  const center = minimum.map((v, axis) => (v + maximum[axis]) / 2);
  const diameter = Math.hypot(...minimum.map((v, axis) => maximum[axis] - v));
  const axisDistance = Math.max(100, 1.6 * diameter);
  const eye = center.map((v, axis) => v + (axis === 1 ? -axisDistance : axisDistance));
  [...eye, ...center].forEach((value, i) => camera.setFloat64(cameraPosition + i * 8, value, true));
  return result;
}
