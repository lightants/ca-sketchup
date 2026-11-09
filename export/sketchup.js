// XYZ inputs use metres: +X east, +Y north, +Z up. Indices are CCW triangles.
// Optional texture: {bytes, mimeType, uvs?, name?, attribution?}. UVs use top-left origin.
// Omit UVs for an image covering the XY bounds, north up.
// Optional name, latitude, longitude, source and attribution go into SKP group metadata.
async function encodeOnPage(model) {
  const { encodeTerrain } = await import('./encode.js');
  return encodeTerrain(model);
}

export async function exportSketchUp(model) {
  let worker;
  try {
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  } catch {
    return new Blob([await encodeOnPage(model)], { type: 'application/vnd.sketchup.skp' });
  }
  try {
    const bytes = await new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => data.error ? reject(new Error(data.error)) : resolve(data.bytes);
      worker.onerror = event => {
        event.preventDefault();
        worker.terminate();
        // Some hosted previews disallow module workers. Use the identical local
        // encoder when the worker script could not be loaded.
        encodeOnPage(model).then(resolve, reject);
      };
      worker.postMessage(model);
    });
    return new Blob([bytes], { type: 'application/vnd.sketchup.skp' });
  } finally {
    worker.terminate();
  }
}
