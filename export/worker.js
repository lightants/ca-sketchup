import { encodeTerrain } from './encode.js';
self.onmessage = ({ data }) => {
  try {
    const bytes = encodeTerrain(data);
    self.postMessage({ bytes: bytes.buffer }, [bytes.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
