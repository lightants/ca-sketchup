/* OpenSKP 1.5.0 standalone writer. Copyright 2024-2026 Ahsan Mehmood. MIT, see OpenSKP-LICENSE.txt. Source: https://github.com/iamahsanmehmood/openskp */
// src/scaffold.ts
var SCAFFOLD_BASE64 = "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";
function loadScaffold() {
  let binary;
  if (typeof atob === "function") {
    binary = atob(SCAFFOLD_BASE64);
  } else {
    binary = Buffer.from(SCAFFOLD_BASE64, "base64").toString("binary");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
var MATERIAL_INSERT_POS = 3400;
var BASE = 9;
var LAYER_COUNT_POS = 3405;
var ORIG_LAYER_COUNT = 1;
var LAYER_INSERT_POS = 3505;
var DEF_COUNT_POS = 3507;
var ORIG_DEF_COUNT = 0;
var ROOT_COUNT_POS = 3511;
var ORIG_ROOT_COUNT = 0;
var TAIL_POS = 3515;
var SCAFFOLD_NEXT_SLOT = 11;
var LAYER_WRITER_BASE = 11;
var SCAFFOLD_CLASS_SLOT = { CLayer: BASE };

// src/create.ts
var SkpWriteError = class _SkpWriteError extends Error {
  constructor(message) {
    super(message);
    this.name = "SkpWriteError";
    Object.setPrototypeOf(this, _SkpWriteError.prototype);
  }
};
function hexToBytes(hex) {
  const out = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}
var TAIL_REF_POSITIONS = [409, 468, 477, 479, 1383, 1385];
var ISO_CAMERA_PREFIX_OFFSET = 2993;
var ISO_CAMERA_PREFIX_PATCH = hexToBytes(
  "594000000000000059c000000000000059400000000000000000000000000000000000000000000000003f2c0c70bd20dabf3f2c0c70bd20da3f3f2c0c70bd20ea3f000000000000f03f0000000000408f40000000000000003e402adf272c803457"
);
var ISO_CAMERA_TAIL_PATCHES = [
  [509, hexToBytes("d0a869613c442d4799a4667d1adfa836")],
  [1390, hexToBytes("4e53c84477029246bba95827bba7e2")]
];
var ACTIVE_LAYER_ANCHOR_REL = 0;
var PID_COUNTER_POS = 1987;
var MATERIAL_SCHEMA = 12;
var DIB_SCHEMA = 3;
var _TEXTURE_H_SENTINEL = hexToBytes("f0ffffffffffff0f");
var DEFINITION_SCHEMA = 11;
var INSTANCE_SCHEMA = 6;
var GROUP_SCHEMA = 1;
var IMAGE_SCHEMA = 6;
var THUMBNAIL_SCHEMA = 1;
var LAYER_SCHEMA = 3;
var FTC_SCHEMA = 4;
var ARCCURVE_SCHEMA = 3;
var CCURVE_SCHEMA = 4;
var SECTIONPLANE_SCHEMA = 3;
var DIMENSIONLINEAR_SCHEMA = 6;
var SKFONT_SCHEMA = 1;
var TEXT_SCHEMA = 9;
var CONSTRUCTIONLINE_SCHEMA = 1;
var CONSTRUCTIONPOINT_SCHEMA = 0;
var DIM_FONT_PAYLOAD = hexToBytes(
  "000000fffeff065400610068006f006d00610000000800000000ecf57abd5eaf2340"
  // height f64
);
var TEXT_DELIM = hexToBytes("0100000001000300000001");
var CLINE_INFINITE = 1e30;
var CCAMERA_SLOT = 7;
var ATTR_CONTAINER_SLOT = 3;
var ATTRIBUTE_NAMED_SLOT = 5;
var ATTR_TYPE_INT32 = 4;
var ATTR_TYPE_DOUBLE = 6;
var ATTR_TYPE_STRING = 10;
var CAMERA_TEMPLATE = hexToBytes(
  "00000000000000000000000000000000000000000000f03f000000000000000000000000000000000000000000000000004000000000000000000000000000f03f0000000000000000000000000000000000000000000000000100000000003e40000000000000f03f00000000000000000000000000000000000000000000000000000000000000000100fffeff00000000000000000000000000000000f03f00000000000000000000000000000000"
);
var DEFINITION_BASE_BLOCK = [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IDENTITY_UV_MATRIX = [1, 0, 0, 0, 1, 0, 0, 0, 1];
function det3(m) {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}
function solve3x3(a, b) {
  const d = det3(a);
  if (Math.abs(d) < 1e-9) {
    throw new SkpWriteError(
      "the 3 texture-positioning points map to collinear (u, v) coordinates - cannot determine a texture mapping from them"
    );
  }
  const cols = [];
  for (let col = 0; col < 3; col++) {
    const ai = a.map((row) => row.slice());
    for (let r = 0; r < 3; r++) ai[r][col] = b[r];
    cols.push(det3(ai) / d);
  }
  return [cols[0], cols[1], cols[2]];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function normalize3(v) {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length < 1e-9) {
    throw new SkpWriteError("cannot determine a texture-positioning basis: the face's first edge is degenerate");
  }
  return [v[0] / length, v[1] / length, v[2] / length];
}
function rotationMatrix3x3(axis, angleRadians) {
  const length = Math.sqrt(axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2);
  if (length < 1e-9) throw new SkpWriteError("rotation axis must not be the zero vector");
  const x = axis[0] / length;
  const y = axis[1] / length;
  const z = axis[2] / length;
  const c = Math.cos(angleRadians);
  const s = Math.sin(angleRadians);
  const t = 1 - c;
  return [
    t * x * x + c,
    t * x * y - s * z,
    t * x * z + s * y,
    t * x * y + s * z,
    t * y * y + c,
    t * y * z - s * x,
    t * x * z - s * y,
    t * y * z + s * x,
    t * z * z + c
  ];
}
function resolveMatrix3x3(matrix3x3, rotation) {
  if (matrix3x3 !== void 0 && rotation !== void 0) {
    throw new SkpWriteError("pass at most one of matrix3x3/rotation - rotation is just a convenience for matrix3x3");
  }
  if (rotation !== void 0) return rotationMatrix3x3(rotation.axis, rotation.angleRadians);
  return matrix3x3;
}
// Match the SketchUp face projection axes (OpenSKP model.ts faceUvBasis).
// The writer's upstream first-edge basis rotates the image differently on each triangle.
function faceUvBasis2(_points, normal) {
  const [nx, ny, nz] = normal;
  const horizontal = Math.hypot(nx, ny);
  if (horizontal < 1e-9) return [[1, 0, 0], [0, nz >= 0 ? 1 : -1, 0]];
  const xAxis = [-ny / horizontal, nx / horizontal, 0];
  return [xAxis, cross(normal, xAxis)];
}
function circleBasis(normal) {
  const seed = Math.abs(normal[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const dot = seed[0] * normal[0] + seed[1] * normal[1] + seed[2] * normal[2];
  const uRaw = [seed[0] - dot * normal[0], seed[1] - dot * normal[1], seed[2] - dot * normal[2]];
  const u = normalize3(uRaw);
  const w = normalize3(cross(normal, u));
  return [u, w];
}
function circlePoints(center, radius, numSegments, u, w) {
  const pts = [];
  for (let i = 0; i < numSegments; i++) {
    const angle = 2 * Math.PI * i / numSegments;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    pts.push([
      center[0] + radius * (c * u[0] + s * w[0]),
      center[1] + radius * (c * u[1] + s * w[1]),
      center[2] + radius * (c * u[2] + s * w[2])
    ]);
  }
  return pts;
}
function arcPoints(center, radius, numSegments, u, w, startAngle, endAngle) {
  const pts = [];
  for (let i = 0; i <= numSegments; i++) {
    const angle = startAngle + (endAngle - startAngle) * i / numSegments;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    pts.push([
      center[0] + radius * (c * u[0] + s * w[0]),
      center[1] + radius * (c * u[1] + s * w[1]),
      center[2] + radius * (c * u[2] + s * w[2])
    ]);
  }
  return pts;
}
function solveUvMatrix(pairs, basis) {
  if (pairs.length !== 3) throw new SkpWriteError("texture positioning needs exactly 3 (point, uv) pairs");
  const [uAxis, wAxis] = basis;
  const a = pairs.map(([, uv]) => [uv[0], uv[1], 1]);
  const bx = pairs.map(([pt]) => pt[0] * uAxis[0] + pt[1] * uAxis[1] + pt[2] * uAxis[2]);
  const by = pairs.map(([pt]) => pt[0] * wAxis[0] + pt[1] * wAxis[1] + pt[2] * wAxis[2]);
  const [a0, c0, e0] = solve3x3(a, bx);
  const [b0, d0, f0] = solve3x3(a, by);
  return [a0, b0, 0, c0, d0, 0, e0, f0, 1];
}
function uvMatrixForFace(points, pairs, normal) {
  return solveUvMatrix(pairs, faceUvBasis2(points, normal));
}
var GrowableBytes = class {
  constructor(capacity = 1 << 16) {
    this.length = 0;
    this.buf = new Uint8Array(capacity);
  }
  reserve(extra) {
    const needed = this.length + extra;
    if (needed <= this.buf.length) return;
    let capacity = this.buf.length * 2;
    while (capacity < needed) capacity *= 2;
    const next = new Uint8Array(capacity);
    next.set(this.buf.subarray(0, this.length));
    this.buf = next;
  }
  push(...values) {
    this.reserve(values.length);
    const buf = this.buf;
    let n = this.length;
    for (let i = 0; i < values.length; i++) buf[n++] = values[i];
    this.length = n;
  }
  append(src) {
    this.reserve(src.length);
    this.buf.set(src instanceof Uint8Array ? src : Uint8Array.from(src), this.length);
    this.length += src.length;
  }
  /** The bytes written so far, without copying. */
  view() {
    return this.buf.subarray(0, this.length);
  }
};
function f64Bytes(v) {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setFloat64(0, v, true);
  return Array.from(b);
}
function u32Bytes(v) {
  return [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
}
function readU16(buf, pos) {
  return (buf[pos] | buf[pos + 1] << 8) & 65535;
}
function writeU16At(buf, pos, v) {
  buf[pos] = v & 255;
  buf[pos + 1] = v >> 8 & 255;
}
function writeU32At(buf, pos, v) {
  const b = u32Bytes(v);
  buf[pos] = b[0];
  buf[pos + 1] = b[1];
  buf[pos + 2] = b[2];
  buf[pos + 3] = b[3];
}
function shiftRef(buf, pos, shift) {
  const u16 = readU16(buf, pos);
  const tagBit = u16 & 32768;
  const slot = u16 & 32767;
  const newSlot = slot + shift;
  if (newSlot < 32767) {
    writeU16At(buf, pos, tagBit | newSlot);
    return 0;
  }
  const val = tagBit ? (2147483648 | newSlot) >>> 0 : newSlot;
  buf.splice(pos, 2, 255, 127, ...u32Bytes(val));
  return 4;
}
function randomGuidBytes() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  return Array.from(bytes);
}
function detectImageSubtype(imageBytes) {
  if (imageBytes.length >= 8 && imageBytes[0] === 137 && imageBytes[1] === 80 && imageBytes[2] === 78 && imageBytes[3] === 71 && imageBytes[4] === 13 && imageBytes[5] === 10 && imageBytes[6] === 26 && imageBytes[7] === 10) {
    return 4;
  }
  if (imageBytes.length >= 3 && imageBytes[0] === 255 && imageBytes[1] === 216 && imageBytes[2] === 255) {
    return 1;
  }
  throw new SkpWriteError(
    "unrecognized image format - only PNG and JPEG textures are supported for now (detected from the file's own magic bytes, not its extension)"
  );
}
function vertexKey(p) {
  return `${p[0]}|${p[1]}|${p[2]}`;
}
function edgeKey(a, b) {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}
var ArchiveWriter = class {
  constructor(nextSlot, classSlot, nextPid = 1) {
    this.bytes = new GrowableBytes();
    // One CSkFont per file, serialized inline at the first dimension/text's
    // font field (exactly as SketchUp writes it) and re-used by back-ref
    // afterwards - see writeDimension/writeText.
    this.dimFontSlot = null;
    this.nextSlot = nextSlot;
    this.classSlot = { ...classSlot };
    this.nextPid = nextPid;
  }
  get length() {
    return this.bytes.length;
  }
  alloc() {
    const s = this.nextSlot;
    this.nextSlot += 1;
    return s;
  }
  allocPid() {
    const p = this.nextPid;
    this.nextPid += 1;
    return p;
  }
  pushU8(v) {
    this.bytes.push(v & 255);
  }
  pushU16(v) {
    this.bytes.push(v & 255, v >> 8 & 255);
  }
  pushU32(v) {
    this.bytes.push(...u32Bytes(v));
  }
  pushI32(v) {
    this.pushU32(v);
  }
  pushF64(v) {
    this.bytes.push(...f64Bytes(v));
  }
  pushBytes(arr) {
    for (let i = 0; i < arr.length; i++) this.bytes.push(arr[i]);
  }
  pushZeros(n) {
    for (let i = 0; i < n; i++) this.bytes.push(0);
  }
  patchU32(pos, v) {
    writeU32At(this.bytes.buf, pos, v);
  }
  newOfKnownClass(className, schema) {
    if (!(className in this.classSlot)) {
      if (schema === void 0) throw new SkpWriteError(`${className} not yet declared and no schema given`);
      this.pushU16(65535);
      this.pushU16(schema);
      this.pushU16(className.length);
      for (let i = 0; i < className.length; i++) this.bytes.push(className.charCodeAt(i) & 255);
      this.classSlot[className] = this.alloc();
      return this.alloc();
    }
    const slot = this.classSlot[className];
    if (slot < 32767) {
      this.pushU16(32768 | slot);
    } else {
      this.pushU16(32767);
      this.pushU32(2147483648 | slot);
    }
    return this.alloc();
  }
  writeNull() {
    this.pushU16(0);
  }
  writeBackref(slot) {
    if (slot < 32767) {
      this.pushU16(slot);
    } else {
      this.pushU16(32767);
      this.pushU32(slot);
    }
  }
  encodePid(pid) {
    let mask = 0;
    const pidBytes = [];
    let p = pid;
    for (let bit = 0; bit < 8; bit++) {
      const byteVal = p % 256;
      p = Math.floor(p / 256);
      if (byteVal) {
        mask |= 1 << bit;
        pidBytes.push(byteVal);
      }
    }
    return [mask, ...pidBytes];
  }
  preamble(pid, realAttrs = false) {
    if (realAttrs) {
      this.pushU16(32768 | ATTR_CONTAINER_SLOT);
      this.alloc();
      this.pushZeros(3);
      this.pushU16(0);
    } else {
      this.writeNull();
    }
    const realPid = pid === void 0 ? this.allocPid() : pid;
    this.pushBytes(this.encodePid(realPid));
  }
  preambleWithRealAttrs(frontMatrix, backMatrix, attributeDicts = [], pid) {
    this.pushU16(32768 | ATTR_CONTAINER_SLOT);
    this.alloc();
    this.pushZeros(3);
    if (frontMatrix !== void 0 || backMatrix !== void 0) {
      this.writeFaceTextureCoords(frontMatrix, backMatrix);
    }
    for (const [dictName, entries] of attributeDicts) {
      this.writeAttributeDict(dictName, entries);
    }
    this.writeNull();
    const realPid = pid === void 0 ? this.allocPid() : pid;
    this.pushBytes(this.encodePid(realPid));
  }
  /** Shares writeAttributeDict's own exact validation rules so a caller
   * can check every attribute dict a multi-part write will need BEFORE
   * that write starts mutating this.bytes. */
  validateAttributeEntries(entries) {
    for (const [key, value] of Object.entries(entries)) {
      if (typeof value === "boolean") {
        throw new SkpWriteError(`attribute ${JSON.stringify(key)}: bool is not a supported value type - use 0/1 instead`);
      }
      if (typeof value !== "string" && typeof value !== "number") {
        throw new SkpWriteError(`attribute ${JSON.stringify(key)}: unsupported value type (only str and number are supported)`);
      }
    }
  }
  writeAttributeDict(dictName, entries) {
    this.pushU16(32768 | ATTRIBUTE_NAMED_SLOT);
    this.alloc();
    this.pushZeros(3);
    this.pushU32(0);
    this.validateAttributeEntries(entries);
    this.writeStr(dictName);
    for (const [key, value] of Object.entries(entries)) {
      this.writeStr(key);
      if (typeof value === "string") {
        this.pushU8(ATTR_TYPE_STRING);
        this.writeStr(value);
      } else if (Number.isInteger(value) && value >= -(2 ** 31) && value < 2 ** 31) {
        this.pushU8(ATTR_TYPE_INT32);
        this.pushI32(value);
      } else {
        this.pushU8(ATTR_TYPE_DOUBLE);
        this.pushF64(value);
      }
    }
    this.writeStr("");
    this.pushU32(0);
  }
  /** Write one CFaceTextureCoords record. `frontMatrix`/`backMatrix` are
   * the 9-value row-major UV-to-world affine matrices from
   * uvMatrixForFace, or undefined for a side that isn't explicitly
   * positioned (written as identity). */
  writeFaceTextureCoords(frontMatrix, backMatrix) {
    this.newOfKnownClass("CFaceTextureCoords", FTC_SCHEMA);
    this.preamble(0);
    this.pushU32(0);
    const ks = new Array(24).fill(0);
    const front = frontMatrix ?? IDENTITY_UV_MATRIX;
    const back = backMatrix ?? IDENTITY_UV_MATRIX;
    for (let i = 0; i < 9; i++) ks[i] = front[i];
    for (let i = 0; i < 9; i++) ks[12 + i] = back[i];
    for (const v of ks) this.pushF64(v);
    this.pushU32(0);
    this.pushU32(0);
    this.pushU32(frontMatrix !== void 0 ? 1 : 0);
    this.pushU32(backMatrix !== void 0 ? 1 : 0);
  }
  drawbase(mat = 0, layer = 0, hidden = false, soft = false, smooth = false) {
    const b = new Array(10).fill(0);
    b[0] = mat & 255;
    b[1] = mat >> 8 & 255;
    b[2] = hidden ? 1 : 0;
    b[3] = 1;
    b[4] = 1;
    b[5] = soft ? 1 : 0;
    b[6] = smooth ? 1 : 0;
    b[8] = layer & 255;
    b[9] = layer >> 8 & 255;
    this.pushBytes(b);
  }
  writeVertex(point) {
    const slot = this.newOfKnownClass("CVertex", 0);
    this.preamble();
    this.pushF64(point[0]);
    this.pushF64(point[1]);
    this.pushF64(point[2]);
    return slot;
  }
  /** Write one CArcCurve record and return its slot - the shared
   * geometric-parameter object a circle/arc's straight CEdge segments
   * each carry a backref to. `xaxis` is the arc's own fixed 0-angle
   * reference direction (a unit vector times radius, in the plane
   * perpendicular to normal) - startAngle/endAngle are offsets from it. */
  writeArcCurve(p) {
    if (!(p.numSegments >= 0 && p.numSegments <= 255)) {
      throw new SkpWriteError(`num_segments must be between 0 and 255, got ${p.numSegments}`);
    }
    const slot = this.newOfKnownClass("CArcCurve", ARCCURVE_SCHEMA);
    this.preamble();
    this.pushBytes([0, p.numSegments, 0, 0, 0]);
    const values = [...p.center, ...p.normal, ...p.xaxis, p.startAngle, p.endAngle, 0, p.radius, 0];
    for (const v of values) this.pushF64(v);
    return slot;
  }
  /** Write one CCurve record and return its slot - a freeform polyline
   * curve grouping: a labeled set of already-straight CEdge segments,
   * with no geometric data of its own beyond how many edges share it. */
  writeCurve(numEdges) {
    const slot = this.newOfKnownClass("CCurve", CCURVE_SCHEMA);
    this.preamble();
    this.pushU8(1);
    this.pushU32(numEdges);
    return slot;
  }
  writeStr(s) {
    if (s.length >= 255) throw new SkpWriteError("string too long to encode (255 char limit)");
    this.bytes.push(255, 254, 255, s.length);
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      this.bytes.push(c & 255, c >> 8 & 255);
    }
  }
  /** Write the first dimension/text's CSkFont record inline, or back-ref
   * the one already written earlier in this file - shared 1-per-file
   * state, same as create.py's own `_dim_font_slot`. */
  writeDimFontRef() {
    if (this.dimFontSlot === null) {
      this.dimFontSlot = this.newOfKnownClass("CSkFont", SKFONT_SCHEMA);
      this.pushBytes(DIM_FONT_PAYLOAD);
    } else {
      this.writeBackref(this.dimFontSlot);
    }
  }
  /** Add a FREE linear dimension between two explicit points (inches,
   * world space). `offset` is the dimension line's offset from the
   * measured segment, in inches (signed).
   *
   * The record layout is the byte-exact one the real SketchUp SDK writes
   * for free dimensions (generated via SketchUpAPI and harvested - see
   * docs/dimension-record-notes.md): connection type 1 with the point
   * stored inline in each connection block and null object refs. Free
   * dimensions render in any orientation; anchored (type 2) dimensions are
   * a future refinement. */
  writeDimension(p1, p2, offset = 10) {
    if (p1[0] === p2[0] && p1[1] === p2[1] && p1[2] === p2[2]) {
      throw new SkpWriteError("addDimension endpoints coincide");
    }
    this.newOfKnownClass("CDimensionLinear", DIMENSIONLINEAR_SCHEMA);
    this.preamble();
    this.drawbase();
    this.writeStr("");
    this.writeDimFontRef();
    this.pushZeros(5);
    this.pushU32(1);
    this.pushU32(4);
    this.pushF64(p1[0]);
    this.pushF64(p1[1]);
    this.pushF64(p1[2]);
    this.pushU16(0);
    this.pushZeros(10);
    this.pushU32(1);
    this.pushU32(4);
    this.pushF64(p2[0]);
    this.pushF64(p2[1]);
    this.pushF64(p2[2]);
    this.pushU16(0);
    this.pushZeros(2);
    for (const v of [0, 0, 0, 1, 1, 0, 0]) this.pushF64(v);
    this.pushU32(0);
    this.pushF64(offset);
    this.pushF64(0);
    this.pushU32(1);
  }
  /** Add a leader text (SketchUp's Text tool) anchored at `point` (inches,
   * world space), with the label floating at `point + leader` and a
   * leader line joining them.
   *
   * The record mirrors human-drawn leader texts harvested from real files
   * (the SDK's own create only produces SCREEN texts - its two 0.5
   * doubles are screen fractions): screen slot zeroed, the free-connection
   * block dimensions use ([u32 1][u32 4][point3d]), the label's world
   * position in the placement tail, and leader type 2 (pushpin) before the
   * arrow delimiter. */
  writeText(text, point, leader = [15, 15, 15]) {
    const lb = [point[0] + leader[0], point[1] + leader[1], point[2] + leader[2]];
    this.newOfKnownClass("CText", TEXT_SCHEMA);
    this.preamble();
    this.drawbase();
    this.writeDimFontRef();
    this.pushF64(0);
    this.pushF64(0);
    this.pushU32(1);
    this.pushU32(4);
    this.pushF64(point[0]);
    this.pushF64(point[1]);
    this.pushF64(point[2]);
    this.pushZeros(12);
    this.pushF64(lb[0]);
    this.pushF64(lb[1]);
    this.pushF64(lb[2]);
    this.pushZeros(16);
    this.pushF64(1);
    this.pushU32(2);
    this.pushBytes(TEXT_DELIM);
    this.writeStr(text);
    this.pushZeros(5);
  }
  /** Add a construction/guide line (SketchUp's Construction Line tool).
   * Pass exactly one of `point2` (a bounded segment between `point` and
   * `point2`) or `direction` (an unbounded guide line through `point`).
   *
   * Ground truth (real SketchUp 2025, SDK/Ruby cross-checked against both
   * a v2020-downgrade save and a genuinely v17-native save): the record
   * stores a point + normalized direction + two signed distance
   * parameters along that direction marking the visible segment's
   * start/end. An unbounded direction is written as the real ±1e30
   * sentinel SketchUp itself uses. */
  writeConstructionLine(point, point2, direction) {
    if (point2 === void 0 === (direction === void 0)) {
      throw new SkpWriteError("addConstructionLine: pass exactly one of point2 or direction");
    }
    let dir;
    let startParam;
    let endParam;
    if (point2 !== void 0) {
      const dx = point2[0] - point[0];
      const dy = point2[1] - point[1];
      const dz = point2[2] - point[2];
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (length === 0) throw new SkpWriteError("addConstructionLine: point and point2 coincide");
      dir = [dx / length, dy / length, dz / length];
      startParam = 0;
      endParam = length;
    } else {
      const d = direction;
      const dlen = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      if (dlen === 0) throw new SkpWriteError("addConstructionLine: direction must be nonzero");
      dir = [d[0] / dlen, d[1] / dlen, d[2] / dlen];
      startParam = -CLINE_INFINITE;
      endParam = CLINE_INFINITE;
    }
    this.newOfKnownClass("CConstructionLine", CONSTRUCTIONLINE_SCHEMA);
    this.preamble();
    this.drawbase();
    for (const v of [point[0], point[1], point[2], dir[0], dir[1], dir[2], startParam, endParam]) this.pushF64(v);
    this.pushZeros(4);
  }
  /** Add a construction/guide point (SketchUp's Construction Point tool)
   * at `position` (inches, world space).
   *
   * Ground truth (real SketchUp 2025, SDK/Ruby cross-checked): a second,
   * always-zero 3-double block and a trailing zero byte follow the
   * position - reserved/unused, written as zero to match every real-file
   * sample seen. */
  writeConstructionPoint(position) {
    this.newOfKnownClass("CConstructionPoint", CONSTRUCTIONPOINT_SCHEMA);
    this.preamble();
    this.drawbase();
    for (const v of [position[0], position[1], position[2], 0, 0, 0]) this.pushF64(v);
    this.pushZeros(1);
  }
  /** Add a section plane (SketchUp's Section Plane tool) through `point`
   * with the given `normal` (need not be unit length), matching
   * `Entities#add_section_plane([point, normal])`.
   *
   * Ground truth (real SketchUp 2025, SDK/Ruby cross-checked against a
   * genuinely v17-native save): the record is preamble + drawbase + the
   * plane as 4 doubles (a, b, c, d) satisfying a*x + b*y + c*z + d = 0 for
   * every point on the plane - the same implicit form
   * `Sketchup::SectionPlane#get_plane` returns (normal normalized,
   * d = -(normal . point)). A name/short-label pair can follow on v18+
   * saves per the reader (legacy.ts's readSectionPlane) - omitted here
   * since this writer only ever produces v17-tagged files, same scope as
   * writeDimension/writeText/writeConstructionLine. */
  writeSectionPlane(point, normal) {
    const nlen = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    if (nlen === 0) throw new SkpWriteError("addSectionPlane: normal must be nonzero");
    const a = normal[0] / nlen;
    const b = normal[1] / nlen;
    const c = normal[2] / nlen;
    const d = -(a * point[0] + b * point[1] + c * point[2]);
    this.newOfKnownClass("CSectionPlane", SECTIONPLANE_SCHEMA);
    this.preamble();
    this.drawbase();
    this.pushF64(a);
    this.pushF64(b);
    this.pushF64(c);
    this.pushF64(d);
  }
  /** Write one solid-color CMaterial record and return its slot. */
  writeMaterial(name, rgba, opacity) {
    const slot = this.newOfKnownClass("CMaterial", MATERIAL_SCHEMA);
    this.preamble();
    this.writeStr(name);
    this.pushU16(0);
    this.pushBytes(rgba);
    this.writeStr("");
    this.pushZeros(8);
    this.pushF64(opacity === void 0 ? 1 : 1 - opacity);
    this.pushU8(opacity === void 0 ? 0 : 1);
    return slot;
  }
  /** Write one image-textured CMaterial record (embedding `imageBytes`
   * verbatim inside a CDib sub-object) and return its slot. `subtype` is
   * CDib's image format tag (4 for PNG, 1 for JPEG).
   *
   * `appliedWidth`/`appliedHeight` both default to 1.0. Pass the
   * material's real-world tile size for a textured material used with
   * default (unpositioned) projection, to make the texture repeat at a
   * specific size instead of every 1 inch (real SketchUp writes the
   * material's own size here - a file authored in SketchUp Web carries
   * 8.0 x 16.0 for a brick) - the reader's own ground-truth-derived UV
   * formula divides a face's final UV by the material's applied
   * width/height, for a default-projected face exactly as much as a
   * positioned (`frontUv`/`backUv`) one. Until 2026-08-28 this defaulted
   * to a corrupted sentinel byte pattern instead (see
   * _TEXTURE_H_SENTINEL's own comment) - confirmed via real SketchUp
   * screenshots to render as a streaky, vertically-smeared texture
   * regardless of projection mode.
   *
   * `appliedWidth` and `opacity` are appended after `appliedHeight`
   * (rather than sitting next to it, matching Python's ordering) so an
   * existing positional call passing `appliedHeight` as the 5th argument
   * keeps meaning what it always meant. */
  writeTexturedMaterial(name, imageBytes, texturePath, subtype, appliedHeight, appliedWidth, opacity) {
    const slot = this.newOfKnownClass("CMaterial", MATERIAL_SCHEMA);
    this.preamble();
    this.writeStr(name);
    this.pushU16(1);
    this.pushZeros(2);
    this.newOfKnownClass("CDib", DIB_SCHEMA);
    this.pushU32(subtype);
    this.pushU32(imageBytes.length);
    this.pushBytes(imageBytes);
    if (subtype === 1) {
      this.pushU32(90);
    }
    this.pushF64(appliedWidth !== void 0 ? appliedWidth : 1);
    this.pushF64(appliedHeight !== void 0 ? appliedHeight : 1);
    this.writeStr(texturePath);
    this.pushBytes([255, 255, 255, 254, 0, 255, 255, 255, 254]);
    this.writeStr("");
    this.pushU32(1);
    this.pushU32(0);
    this.pushF64(opacity === void 0 ? 1 : 1 - opacity);
    this.pushU8(opacity === void 0 ? 0 : 1);
    return slot;
  }
  /** Write one CLayer record and return its slot. Ground truth shows
   * each top-level layer record contains a second, embedded pid - so
   * each layer consumes 2 pids, not 1. `withPids=false` (used only for
   * the layer a component definition embeds internally) omits both. */
  writeLayer(name, withPids = true, hidden = false, rgba) {
    const slot = this.newOfKnownClass("CLayer", LAYER_SCHEMA);
    this.preamble(withPids ? void 0 : 0);
    this.writeStr(name);
    const pid2 = withPids ? this.allocPid() : 0;
    this.pushBytes([hidden ? 1 : 0, 0, 0]);
    this.pushBytes(this.encodePid(pid2));
    this.writeStr(`Layer_${name}`);
    this.pushU16(256);
    this.pushBytes(rgba ?? [0, 0, 0, 0]);
    this.writeStr("");
    this.pushZeros(8);
    this.pushF64(0.5);
    this.pushZeros(5);
    return slot;
  }
  /** Write a CThumbnail with a default camera and no image - ground
   * truth shows the image itself is optional. */
  writeThumbnail() {
    this.newOfKnownClass("CThumbnail", THUMBNAIL_SCHEMA);
    this.preamble(0);
    this.pushU16(32768 | CCAMERA_SLOT);
    this.alloc();
    this.pushBytes(CAMERA_TEMPLATE);
    this.writeNull();
  }
  /** Begin a CComponentDefinition record - everything up to (not
   * including) its internal entity list. Returns [definitionSlot,
   * countPatchPos]. */
  writeDefinitionHeader(attributeDicts = []) {
    const slot = this.newOfKnownClass("CComponentDefinition", DEFINITION_SCHEMA);
    if (attributeDicts.length > 0) {
      this.preambleWithRealAttrs(void 0, void 0, attributeDicts);
    } else {
      this.preamble(void 0, true);
    }
    this.pushBytes(DEFINITION_BASE_BLOCK);
    this.pushU32(1);
    const embeddedLayerSlot = this.writeLayer("Layer0", false);
    this.writeBackref(embeddedLayerSlot);
    this.pushU32(0);
    const countPatchPos = this.length;
    this.pushU32(0);
    return [slot, countPatchPos];
  }
  /** Close out a CComponentDefinition record: relationship count, GUID,
   * name, timestamp, behavior flags, and a default thumbnail. */
  writeDefinitionTail(name, isGroup = false) {
    this.pushU32(0);
    this.pushU16(0);
    this.pushBytes(randomGuidBytes());
    this.writeStr(name);
    this.writeStr("");
    this.writeStr("");
    this.pushU32(Math.floor(Date.now() / 1e3));
    const groupFlagPos = this.bytes.length + 39;
    this.pushZeros(39);
    this.pushU32(isGroup ? 1 : 0);
    this.writeThumbnail();
    return groupFlagPos;
  }
  writeInstanceLike(className, schema, realAttrs, definitionSlot, name, translation, matrix3x3, mat, layer, attributeDicts = [], hidden = false) {
    this.newOfKnownClass(className, schema);
    if (realAttrs && attributeDicts.length > 0) {
      this.preambleWithRealAttrs(void 0, void 0, attributeDicts);
    } else {
      this.preamble(void 0, realAttrs);
    }
    this.drawbase(mat, layer, hidden);
    this.writeBackref(definitionSlot);
    const m = matrix3x3 ?? [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (const v of [...m, ...translation, 1]) this.pushF64(v);
    this.writeStr(name);
    this.pushBytes(randomGuidBytes());
  }
  /** Write one CComponentInstance placing a copy of `definitionSlot` and
   * return how many new root-entity-list slots it consumed (always 1). */
  writeInstance(definitionSlot, name, translation = [0, 0, 0], matrix3x3, instanceMaterial = 0, instanceLayer = 0, attributeDicts = [], hidden = false) {
    this.writeInstanceLike(
      "CComponentInstance",
      INSTANCE_SCHEMA,
      true,
      definitionSlot,
      name,
      translation,
      matrix3x3,
      instanceMaterial,
      instanceLayer,
      attributeDicts,
      hidden
    );
    return 1;
  }
  /** Write one CGroup placing a copy of `definitionSlot` - structurally
   * almost identical to writeInstance; the real differences are its
   * class name/schema and its attribute pointer: unlike CComponentInstance
   * (which always carries a real, if often empty, CAttributeContainer), a
   * group only gets one when `attributeDicts` is actually given - matching
   * writeFace's conditional pattern instead. A real production Group WITH
   * attributes (SketchUp 2020 export, ground truth) carries a genuine
   * CAttributeContainer at this exact schema; a never-attributed group
   * still correctly gets a null pointer either way (openskp#261). */
  writeGroup(definitionSlot, name, translation = [0, 0, 0], matrix3x3, groupMaterial = 0, groupLayer = 0, attributeDicts = [], hidden = false) {
    this.writeInstanceLike(
      "CGroup",
      GROUP_SCHEMA,
      attributeDicts.length > 0,
      definitionSlot,
      name,
      translation,
      matrix3x3,
      groupMaterial,
      groupLayer,
      attributeDicts,
      hidden
    );
    return 1;
  }
  /** Write one CImage placing `definitionSlot` (the quad + texture
   * material `addImage` built for it) - return contract matches
   * writeInstance/writeGroup (always 1).
   *
   * legacy.ts's image reader treats CImage as "instance-shaped": preamble,
   * drawbase, a definition back-ref, a 3x4 placement, a constant 1.0, a
   * source-path string, and a 16-byte GUID - field-for-field identical in
   * count and order to writeInstance's own
   * matrix3x3(9)+translation(3)+1.0(1)=13 f64s, name string, GUID. The
   * source-path string is always empty - ground truth shows real SketchUp
   * writes it empty too. No material argument - an Image entity isn't
   * painted a material the way a face or instance can be; its appearance
   * comes entirely from the definition's own textured face. */
  writeImage(definitionSlot, translation = [0, 0, 0], matrix3x3, imageLayer = 0, hidden = false) {
    this.writeInstanceLike(
      "CImage",
      IMAGE_SCHEMA,
      false,
      definitionSlot,
      "",
      translation,
      matrix3x3,
      0,
      imageLayer,
      [],
      hidden
    );
    return 1;
  }
  /** Write a chain of straight CEdge records connecting `points` in
   * order, sharing vertices/edges via `vertexSlots`/`edgeRegistry`.
   * `closed=true` also connects the last point back to the first.
   * Returns [edgeSlots, edgeSenses, newEntities]. At most one of
   * `curveParams`/`polylineNumEdges` should be given - ground truth
   * shows the shared curve object is declared inline as the FIRST
   * newly-declared edge's own "curve" field. */
  writeEdgeChain(points, vertexSlots, edgeRegistry, closed, hiddenEdges = false, softEdges = false, smoothEdges = false, curveParams, polylineNumEdges) {
    const n = points.length;
    const pairCount = closed ? n : n - 1;
    const pointSlots = points.map((p) => vertexSlots.get(vertexKey(p)));
    const edgeSlots = [];
    const edgeSenses = [];
    let newEntities = 0;
    let curveSlot;
    for (let i = 0; i < pairCount; i++) {
      const v1Idx = i;
      const v2Idx = (i + 1) % n;
      const v1Known = pointSlots[v1Idx];
      const v2Known = pointSlots[v2Idx];
      const key = v1Known !== void 0 && v2Known !== void 0 ? edgeKey(v1Known, v2Known) : void 0;
      if (key !== void 0 && edgeRegistry.has(key)) {
        const [edgeSlot2, fwdV1] = edgeRegistry.get(key);
        edgeSlots.push(edgeSlot2);
        edgeSenses.push(fwdV1 === v1Known ? 0 : 1);
        continue;
      }
      const edgeSlot = this.newOfKnownClass("CEdge", 2);
      this.preamble();
      this.drawbase(0, 0, hiddenEdges, softEdges, smoothEdges);
      for (const idx of [v1Idx, v2Idx]) {
        if (pointSlots[idx] === void 0) {
          const s = this.writeVertex(points[idx]);
          pointSlots[idx] = s;
          vertexSlots.set(vertexKey(points[idx]), s);
        } else {
          this.writeBackref(pointSlots[idx]);
        }
      }
      if (curveSlot !== void 0) {
        this.writeBackref(curveSlot);
      } else if (curveParams !== void 0) {
        curveSlot = this.writeArcCurve(curveParams);
      } else if (polylineNumEdges !== void 0) {
        curveSlot = this.writeCurve(polylineNumEdges);
      } else {
        this.writeNull();
      }
      edgeSlots.push(edgeSlot);
      edgeSenses.push(0);
      newEntities += 1;
      edgeRegistry.set(edgeKey(pointSlots[v1Idx], pointSlots[v2Idx]), [
        edgeSlot,
        pointSlots[v1Idx]
      ]);
    }
    return [edgeSlots, edgeSenses, newEntities];
  }
  /** Write a partial (open) arc as a chain of straight CEdge records - no
   * face. Returns how many new root-entity-list slots were consumed. */
  writeArc(points, vertexSlots, edgeRegistry, curveParams, hiddenEdges = false, softEdges = false, smoothEdges = false) {
    const [, , newEntities] = this.writeEdgeChain(
      points,
      vertexSlots,
      edgeRegistry,
      false,
      hiddenEdges,
      softEdges,
      smoothEdges,
      curveParams
    );
    return newEntities;
  }
  /** Write a freeform polyline curve - a chain of straight CEdge records
   * connecting `points` in order, all sharing one CCurve grouping, no
   * face. Returns how many new root-entity-list slots were consumed. */
  writePolyline(points, vertexSlots, edgeRegistry, closed = false, hiddenEdges = false, softEdges = false, smoothEdges = false) {
    const n = points.length;
    const pairCount = closed ? n : n - 1;
    const [, , newEntities] = this.writeEdgeChain(
      points,
      vertexSlots,
      edgeRegistry,
      closed,
      hiddenEdges,
      softEdges,
      smoothEdges,
      void 0,
      pairCount
    );
    return newEntities;
  }
  /** Write one planar face and return how many new root-entity-list
   * slots it consumed (edges newly declared, plus the face itself).
   * `points` form a closed polygon in order (do not repeat the first
   * point). `holes`, if given, cuts out independent closed polygons -
   * ground truth (an SDK-authored window-in-a-wall face) shows a hole is
   * just another CLoop, distinguished only by its first flag byte (0
   * instead of 1). */
  writeFace(points, vertexSlots, edgeRegistry, faceMaterial = 0, faceLayer = 0, backMaterial = 0, hidden = false, softEdges = false, smoothEdges = false, hiddenEdges = false, frontUv, backUv, attributeDicts = [], curveParams, holes = []) {
    const [nx, ny, nz, d] = planeFromPolygon(points);
    const frontMatrix = frontUv !== void 0 ? uvMatrixForFace(points, frontUv, [nx, ny, nz]) : void 0;
    const backMatrix = backUv !== void 0 ? uvMatrixForFace(points, backUv, [nx, ny, nz]) : void 0;
    for (const [, entries] of attributeDicts) this.validateAttributeEntries(entries);
    const span = Math.max(
      ...[0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])) - Math.min(...points.map((p) => p[i])))
    );
    const tol = Math.max(span, 1) * 1e-6;
    for (const hole of holes) {
      if (hole.length < 3) throw new SkpWriteError("a hole needs at least 3 points");
      for (const p of hole) {
        const dist = nx * p[0] + ny * p[1] + nz * p[2] - d;
        if (Math.abs(dist) > tol) {
          throw new SkpWriteError(
            `hole point ${JSON.stringify(p)} is ${Math.abs(dist)} units off the face's own plane - a hole must lie on the same plane as the outer boundary`
          );
        }
      }
    }
    const [edgeSlots, edgeSenses, edgeNewEntities] = this.writeEdgeChain(
      points,
      vertexSlots,
      edgeRegistry,
      true,
      hiddenEdges,
      softEdges,
      smoothEdges,
      curveParams
    );
    let newEntities = edgeNewEntities;
    const holeLoops = [];
    for (const hole of holes) {
      const [hEdgeSlots, hEdgeSenses, hNew] = this.writeEdgeChain(
        hole,
        vertexSlots,
        edgeRegistry,
        true,
        hiddenEdges,
        softEdges,
        smoothEdges,
        void 0
      );
      holeLoops.push([hEdgeSlots, hEdgeSenses]);
      newEntities += hNew;
    }
    this.newOfKnownClass("CFace", 3);
    if (frontUv !== void 0 || backUv !== void 0 || attributeDicts.length > 0) {
      this.preambleWithRealAttrs(frontMatrix, backMatrix, attributeDicts);
    } else {
      this.preamble();
    }
    this.drawbase(faceMaterial, faceLayer, hidden);
    this.pushF64(nx);
    this.pushF64(ny);
    this.pushF64(nz);
    this.pushF64(-d);
    this.pushU32(1 + holes.length);
    const loopSlot = this.newOfKnownClass("CLoop", 1);
    this.preamble(0);
    this.pushBytes([1, 1]);
    for (let i = 0; i < edgeSlots.length; i++) {
      this.newOfKnownClass("CEdgeUse", 1);
      this.preamble(0);
      this.writeBackref(edgeSlots[i]);
      this.pushU8(edgeSenses[i]);
      this.writeBackref(loopSlot);
    }
    this.writeNull();
    for (const [hEdgeSlots, hEdgeSenses] of holeLoops) {
      const hLoopSlot = this.newOfKnownClass("CLoop", 1);
      this.preamble(0);
      this.pushBytes([0, 1]);
      for (let i = 0; i < hEdgeSlots.length; i++) {
        this.newOfKnownClass("CEdgeUse", 1);
        this.preamble(0);
        this.writeBackref(hEdgeSlots[i]);
        this.pushU8(hEdgeSenses[i]);
        this.writeBackref(hLoopSlot);
      }
      this.writeNull();
    }
    this.pushU16(backMaterial);
    newEntities += 1;
    return newEntities;
  }
};
function planeFromPolygon(points) {
  const n = points.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0, z0] = points[i];
    const [x1, y1, z1] = points[(i + 1) % n];
    nx += (y0 - y1) * (z0 + z1);
    ny += (z0 - z1) * (x0 + x1);
    nz += (x0 - x1) * (y0 + y1);
  }
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (length < 1e-9) throw new SkpWriteError("face points are collinear or degenerate; cannot compute a plane");
  nx /= length;
  ny /= length;
  nz /= length;
  const cx = points.reduce((s, p) => s + p[0], 0) / n;
  const cy = points.reduce((s, p) => s + p[1], 0) / n;
  const cz = points.reduce((s, p) => s + p[2], 0) / n;
  const d = nx * cx + ny * cy + nz * cz;
  const span = Math.max(
    ...[0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])) - Math.min(...points.map((p) => p[i])))
  );
  const tol = Math.max(span, 1) * 1e-6;
  for (const p of points) {
    const dist = nx * p[0] + ny * p[1] + nz * p[2] - d;
    if (Math.abs(dist) > tol) {
      throw new SkpWriteError(
        `face points are not coplanar (point ${JSON.stringify(p)} is ${Math.abs(dist)} units off the fitted plane) - openskp only supports planar faces`
      );
    }
  }
  return [nx, ny, nz, d];
}
function isCoplanar(points) {
  const n = points.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0, z0] = points[i];
    const [x1, y1, z1] = points[(i + 1) % n];
    nx += (y0 - y1) * (z0 + z1);
    ny += (z0 - z1) * (x0 + x1);
    nz += (x0 - x1) * (y0 + y1);
  }
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (length < 1e-9) throw new SkpWriteError("face points are collinear or degenerate; cannot compute a plane");
  nx /= length;
  ny /= length;
  nz /= length;
  const cx = points.reduce((s, p) => s + p[0], 0) / n;
  const cy = points.reduce((s, p) => s + p[1], 0) / n;
  const cz = points.reduce((s, p) => s + p[2], 0) / n;
  const d = nx * cx + ny * cy + nz * cz;
  const span = Math.max(
    ...[0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])) - Math.min(...points.map((p) => p[i])))
  );
  const tol = Math.max(span, 1) * 1e-6;
  return points.every((p) => Math.abs(nx * p[0] + ny * p[1] + nz * p[2] - d) <= tol);
}
function writeFaceOrTriangulate(args) {
  const { writer, points, vertexSlots, edgeRegistry, material, layer, backMaterial, hidden, softEdges, smoothEdges, hiddenEdges, frontUv, backUv, attributeDicts, autoTriangulate, holes } = args;
  if (holes.length > 0 || !autoTriangulate || points.length === 3 || isCoplanar(points)) {
    return writer.writeFace(
      points,
      vertexSlots,
      edgeRegistry,
      material,
      layer,
      backMaterial,
      hidden,
      softEdges,
      smoothEdges,
      hiddenEdges,
      frontUv,
      backUv,
      attributeDicts,
      void 0,
      holes
    );
  }
  if (frontUv !== void 0 || backUv !== void 0) {
    throw new SkpWriteError("autoTriangulate cannot be combined with frontUv/backUv positioning");
  }
  let total = 0;
  for (let i = 1; i < points.length - 1; i++) {
    total += writer.writeFace(
      [points[0], points[i], points[i + 1]],
      vertexSlots,
      edgeRegistry,
      material,
      layer,
      backMaterial,
      hidden,
      softEdges,
      smoothEdges,
      hiddenEdges,
      void 0,
      void 0,
      attributeDicts
    );
  }
  return total;
}
function toPoint3(p) {
  return [Number(p[0]), Number(p[1]), Number(p[2])];
}
function attributeDictsFrom(attributes, name) {
  return attributes ? [[name, attributes]] : [];
}
var ComponentDefinitionBuilder = class {
  /** @internal */
  constructor(skp, slot, name, countPatchPos, groupPlacement) {
    this.vertexSlots = /* @__PURE__ */ new Map();
    this.edgeRegistry = /* @__PURE__ */ new Map();
    this.newEntityCount = 0;
    this.closed = false;
    this._skp = skp;
    this.slot = slot;
    this.name = name;
    this.countPatchPos = countPatchPos;
    this.groupPlacement = groupPlacement;
  }
  checkWritable(action) {
    if (this.closed) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(this.name)} has already closed - cannot add more ${action} to it`
      );
    }
  }
  addFace(points, options = {}) {
    this.checkWritable("faces");
    this._skp._checkMaterialHandle(options.material, "material");
    this._skp._checkMaterialHandle(options.backMaterial, "backMaterial");
    this._skp._checkLayerHandle(options.layer);
    const pts = points.map(toPoint3);
    if (pts.length < 3) throw new SkpWriteError("a face needs at least 3 points");
    const holes = (options.holes ?? []).map((h) => h.map(toPoint3));
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += writeFaceOrTriangulate({
      writer: this._skp._definitionWriter(),
      points: pts,
      vertexSlots: this.vertexSlots,
      edgeRegistry: this.edgeRegistry,
      material: options.material ?? 0,
      layer: options.layer ?? 0,
      backMaterial: options.backMaterial ?? 0,
      hidden: options.hidden ?? false,
      softEdges: options.softEdges ?? false,
      smoothEdges: options.smoothEdges ?? false,
      hiddenEdges: options.hiddenEdges ?? false,
      frontUv: options.frontUv,
      backUv: options.backUv,
      attributeDicts,
      autoTriangulate: options.autoTriangulate ?? false,
      holes
    });
  }
  addCircle(center, normal, radius, options = {}) {
    this.checkWritable("faces");
    this._skp._checkMaterialHandle(options.material, "material");
    this._skp._checkMaterialHandle(options.backMaterial, "backMaterial");
    this._skp._checkLayerHandle(options.layer);
    const numSegments = options.numSegments ?? 24;
    if (!(numSegments >= 3 && numSegments <= 255)) {
      throw new SkpWriteError(`num_segments must be between 3 and 255, got ${numSegments}`);
    }
    const c = toPoint3(center);
    const n = normalize3(toPoint3(normal));
    const [u, w] = circleBasis(n);
    const xaxis = [radius * u[0], radius * u[1], radius * u[2]];
    const curveParams = { center: c, normal: n, xaxis, startAngle: 0, endAngle: 2 * Math.PI, radius, numSegments };
    const points = circlePoints(c, radius, numSegments, u, w);
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += this._skp._definitionWriter().writeFace(
      points,
      this.vertexSlots,
      this.edgeRegistry,
      options.material ?? 0,
      options.layer ?? 0,
      options.backMaterial ?? 0,
      options.hidden ?? false,
      false,
      false,
      false,
      options.frontUv,
      options.backUv,
      attributeDicts,
      curveParams
    );
  }
  addArc(center, normal, radius, startAngle, endAngle, options = {}) {
    this.checkWritable("arcs");
    const numSegments = options.numSegments ?? 24;
    if (!(numSegments >= 3 && numSegments <= 255)) {
      throw new SkpWriteError(`num_segments must be between 3 and 255, got ${numSegments}`);
    }
    if (endAngle === startAngle) {
      throw new SkpWriteError("start_angle and end_angle must differ - use addCircle for a full circle");
    }
    const c = toPoint3(center);
    const n = normalize3(toPoint3(normal));
    const [u, w] = circleBasis(n);
    const xaxis = [radius * u[0], radius * u[1], radius * u[2]];
    const curveParams = { center: c, normal: n, xaxis, startAngle, endAngle, radius, numSegments };
    const points = arcPoints(c, radius, numSegments, u, w, startAngle, endAngle);
    this.newEntityCount += this._skp._definitionWriter().writeArc(
      points,
      this.vertexSlots,
      this.edgeRegistry,
      curveParams,
      options.hiddenEdges ?? false,
      options.softEdges ?? false,
      options.smoothEdges ?? false
    );
  }
  addPolyline(points, options = {}) {
    this.checkWritable("polylines");
    const pts = points.map(toPoint3);
    if (pts.length < 2) throw new SkpWriteError("a polyline needs at least 2 points");
    this.newEntityCount += this._skp._definitionWriter().writePolyline(
      pts,
      this.vertexSlots,
      this.edgeRegistry,
      options.closed ?? false,
      options.hiddenEdges ?? false,
      options.softEdges ?? false,
      options.smoothEdges ?? false
    );
  }
  /** Place one instance of another, already-closed component definition
   * inside this one - the same nesting real SketchUp supports.
   * `definition` must come from this same builder, and be a different,
   * already-closed definition (never `this`). */
  addInstance(definition, options = {}) {
    this.checkWritable("instances");
    this._skp._checkMaterialHandle(options.material, "material");
    this._skp._checkLayerHandle(options.layer);
    if (definition._skp !== this._skp) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(definition.name)} belongs to a different builder (a different create() call) - its slot number is meaningless here`
      );
    }
    if (definition === this) {
      throw new SkpWriteError(`component definition ${JSON.stringify(this.name)} cannot nest an instance of itself`);
    }
    const matrix3x3 = resolveMatrix3x3(options.matrix3x3, options.rotation);
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += this._skp._definitionWriter().writeInstance(
      definition.slot,
      options.name ?? definition.name,
      options.translation ?? [0, 0, 0],
      matrix3x3,
      options.material ?? 0,
      options.layer ?? 0,
      attributeDicts,
      options.hidden ?? false
    );
  }
  /** Place another, already-closed component definition inside this one
   * as a *group* rather than a component instance. A nested group can't
   * be declared inline - build the group's geometry with a normal
   * `addComponentDefinition` first, then place it here. */
  addGroupInstance(definition, options = {}) {
    this.checkWritable("groups");
    this._skp._checkMaterialHandle(options.material, "material");
    this._skp._checkLayerHandle(options.layer);
    if (definition._skp !== this._skp) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(definition.name)} belongs to a different builder (a different create() call) - its slot number is meaningless here`
      );
    }
    if (definition === this) {
      throw new SkpWriteError(`component definition ${JSON.stringify(this.name)} cannot nest a group instance of itself`);
    }
    const matrix3x3 = resolveMatrix3x3(options.matrix3x3, options.rotation);
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += this._skp._definitionWriter().writeGroup(
      definition.slot,
      options.name ?? definition.name,
      options.translation ?? [0, 0, 0],
      matrix3x3,
      options.material ?? 0,
      options.layer ?? 0,
      attributeDicts,
      options.hidden ?? false
    );
    if (definition.groupFlagPos !== void 0) this._skp._patchDefinitionCount(definition.groupFlagPos, 1);
  }
  /** @internal called automatically once the defining callback (passed
   * to addComponentDefinition/addGroup) returns. */
  _close() {
    if (this.newEntityCount === 0) {
      throw new SkpWriteError(`component definition ${JSON.stringify(this.name)} has no geometry - add at least one face`);
    }
    const writer = this._skp._definitionWriter();
    this._skp._patchDefinitionCount(this.countPatchPos, this.newEntityCount);
    this.groupFlagPos = writer.writeDefinitionTail(this.name, this.groupPlacement !== void 0);
    this.closed = true;
    this._skp._clearOpenDefinition();
    if (this.groupPlacement !== void 0) {
      this._skp._pushPendingGroup(this, this.groupPlacement);
    }
  }
};
var SkpBuilder = class {
  constructor() {
    this.materialInsertPos = MATERIAL_INSERT_POS;
    this.base = BASE;
    this.layerCountPos = LAYER_COUNT_POS;
    this.origLayerCount = ORIG_LAYER_COUNT;
    this.layerInsertPos = LAYER_INSERT_POS;
    this.defCountPos = DEF_COUNT_POS;
    this.origDefCount = ORIG_DEF_COUNT;
    this.rootCountPos = ROOT_COUNT_POS;
    this.origRootCount = ORIG_ROOT_COUNT;
    this.tailPos = TAIL_POS;
    this.scaffoldNextSlot = SCAFFOLD_NEXT_SLOT;
    this.scaffoldClassSlot = { ...SCAFFOLD_CLASS_SLOT };
    /** Every material registered so far, by name - populated by
     * addMaterial/addTextureMaterial as a side effect. */
    this.materialsByName = /* @__PURE__ */ new Map();
    this.materialCount = 0;
    this.layerWriterBase = LAYER_WRITER_BASE;
    this.layerWriter = null;
    this.layerWriterStart = null;
    /** Every layer registered so far, by name - populated by addLayer. */
    this.layersByName = /* @__PURE__ */ new Map();
    this.layerCount = 0;
    this.definitionWriterInstance = null;
    this.definitionWriterStart = null;
    this.definitionCount = 0;
    this.openDefinition = null;
    this.pendingGroups = [];
    this.geometryWriter = null;
    this.vertexSlots = /* @__PURE__ */ new Map();
    this.edgeRegistry = /* @__PURE__ */ new Map();
    this.newEntityCount = 0;
    this.faceCount = 0;
    this.data = loadScaffold();
    this.materialWriter = new ArchiveWriter(this.base, {});
  }
  addMaterial(name, rgba, opacity) {
    if (this.geometryWriter !== null) throw new SkpWriteError("addMaterial must be called before any addFace calls");
    if (this.layerWriter !== null) throw new SkpWriteError("addMaterial must be called before any addLayer calls");
    if (this.definitionWriterInstance !== null) {
      throw new SkpWriteError("addMaterial must be called before any addComponentDefinition calls");
    }
    if (this.materialsByName.has(name)) return this.materialsByName.get(name);
    let full = rgba;
    if (full.length === 3) full = [...full, 255];
    if (full.length !== 4 || !full.every((c) => Number.isInteger(c) && c >= 0 && c <= 255)) {
      throw new SkpWriteError("rgba must be 3 or 4 integers in 0-255");
    }
    const slot = this.materialWriter.writeMaterial(name, full, opacity);
    this.materialsByName.set(name, slot);
    this.materialCount += 1;
    return slot;
  }
  /** Register an image-textured material and return a handle to pass as
   * addFace's `material` option. Unlike Python's `add_texture_material`
   * (which reads a file path), this takes the image bytes directly - a
   * deliberate adaptation since this package targets the browser as well
   * as Node, where there's no universal way to read an arbitrary file
   * path. `texturePath`, if given, is stored as-is in the material
   * record (SketchUp shows it as the texture's original file path); it
   * has no effect on the embedded image bytes themselves.
   *
   * `appliedHeight`/`appliedWidth`, if given, are the applied size in
   * INCHES - how much model space one tile of the image covers. Both
   * default to 1.0. A texture applied without positioning carries no
   * per-face UV record, so this pair IS its mapping - and see
   * writeTexturedMaterial's own comment for why it matters even for
   * addFace's `frontUv`/`backUv` pinning (a positioned mapping still
   * divides by it). `appliedWidth` and `opacity` sit after `appliedHeight`
   * (not alongside it) so an existing positional call passing
   * `appliedHeight` as the 4th argument keeps meaning what it always
   * meant. */
  addTextureMaterial(name, imageBytes, texturePath = "", appliedHeight, appliedWidth, opacity) {
    if (this.geometryWriter !== null) {
      throw new SkpWriteError("addTextureMaterial must be called before any addFace calls");
    }
    if (this.layerWriter !== null) {
      throw new SkpWriteError("addTextureMaterial must be called before any addLayer calls");
    }
    if (this.definitionWriterInstance !== null) {
      throw new SkpWriteError("addTextureMaterial must be called before any addComponentDefinition calls");
    }
    if (this.materialsByName.has(name)) return this.materialsByName.get(name);
    const subtype = detectImageSubtype(imageBytes);
    const slot = this.materialWriter.writeTexturedMaterial(
      name,
      imageBytes,
      texturePath,
      subtype,
      appliedHeight,
      appliedWidth,
      opacity
    );
    this.materialsByName.set(name, slot);
    this.materialCount += 1;
    return slot;
  }
  addLayer(name, options = {}) {
    if (this.geometryWriter !== null) throw new SkpWriteError("addLayer must be called before any addFace calls");
    if (this.definitionWriterInstance !== null) {
      throw new SkpWriteError("addLayer must be called before any addComponentDefinition calls");
    }
    if (this.layersByName.has(name)) return this.layersByName.get(name);
    let rgba;
    if (options.color !== void 0) {
      let c = options.color;
      if (c.length === 3) c = [...c, 255];
      if (c.length !== 4 || !c.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) {
        throw new SkpWriteError("color must be 3 or 4 integers in 0-255");
      }
      rgba = c;
    }
    if (this.layerWriter === null) {
      const materialShift = this.materialWriter.nextSlot - this.base;
      this.layerWriterStart = this.layerWriterBase + materialShift;
      this.layerWriter = new ArchiveWriter(this.layerWriterStart, this.materialShiftedClassSlot());
    }
    const slot = this.layerWriter.writeLayer(name, true, options.hidden ?? false, rgba);
    this.layersByName.set(name, slot);
    this.layerCount += 1;
    return slot;
  }
  /** @internal Reject a material/backMaterial option that isn't a handle
   * this builder's own addMaterial()/addTextureMaterial() actually
   * returned. Without this, a stray value - most commonly a layer handle
   * passed to the wrong option by mistake - gets written straight into
   * the file as a material reference: this project's own reader tolerates
   * the dangling reference silently, but real SketchUp rejects the whole
   * file as corrupt on open, with no indication of which call caused it. */
  _checkMaterialHandle(value, param) {
    if (value && ![...this.materialsByName.values()].includes(value)) {
      throw new SkpWriteError(
        `${param}=${value} is not a handle this builder's addMaterial()/addTextureMaterial() returned - passing an unrelated value (e.g. a layer handle by mistake) would silently write an invalid material reference that real SketchUp rejects on open`
      );
    }
  }
  /** @internal Reject a layer option that isn't a handle this builder's
   * own addLayer() actually returned - see `_checkMaterialHandle` for why
   * this matters. */
  _checkLayerHandle(value, param = "layer") {
    if (value && ![...this.layersByName.values()].includes(value)) {
      throw new SkpWriteError(
        `${param}=${value} is not a handle this builder's addLayer() returned - passing an unrelated value (e.g. a material handle by mistake) would silently write an invalid layer reference that real SketchUp rejects on open`
      );
    }
  }
  materialShiftedClassSlot() {
    const materialShift = this.materialWriter.nextSlot - this.base;
    const out = {};
    for (const [n, s] of Object.entries(this.scaffoldClassSlot)) out[n] = s + materialShift;
    return out;
  }
  layerShift() {
    if (this.layerWriter === null) return 0;
    return this.layerWriter.nextSlot - this.layerWriterStart;
  }
  postLayerClassSlot() {
    if (this.layerWriter !== null) return { ...this.layerWriter.classSlot };
    return this.materialShiftedClassSlot();
  }
  startDefinition(name, caller, groupPlacement, attributeDicts = []) {
    if (this.geometryWriter !== null) {
      throw new SkpWriteError(`${caller} must be called before any addFace/addInstance calls`);
    }
    if (this.openDefinition !== null) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(this.openDefinition.name)} is still open - close it before starting another`
      );
    }
    if (this.definitionWriterInstance === null) {
      this.definitionWriterStart = this.scaffoldNextSlot + (this.materialWriter.nextSlot - this.base) + this.layerShift();
      this.definitionWriterInstance = new ArchiveWriter(this.definitionWriterStart, this.postLayerClassSlot());
    }
    const [slot, countPatchPos] = this.definitionWriterInstance.writeDefinitionHeader(attributeDicts);
    this.definitionCount += 1;
    const comp = new ComponentDefinitionBuilder(this, slot, name, countPatchPos, groupPlacement);
    this.openDefinition = comp;
    return comp;
  }
  /** Start a new reusable component definition. `build` runs
   * synchronously; add geometry to the definition inside it (via
   * `.addFace` etc.) - the returned, already-closed builder can then be
   * passed to `addInstance` to place copies of it in the model.
   *
   * ```ts
   * const chair = builder.addComponentDefinition('Chair', (def) => {
   *   def.addFace([[0, 0, 0], [20, 0, 0], [20, 20, 0], [0, 20, 0]]);
   * });
   * builder.addInstance(chair, { translation: [100, 0, 0] });
   * ```
   *
   * Must be called before any addFace/addInstance call on the builder
   * itself - component definitions splice in after materials and
   * layers, before root-level geometry. */
  addComponentDefinition(name, build, options = {}) {
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    const def = this.startDefinition(name, "addComponentDefinition", void 0, attributeDicts);
    build(def);
    def._close();
    return def;
  }
  /** Start a new group. `build` runs synchronously; add geometry inside
   * it - the group is placed at `translation`/`matrix3x3` automatically
   * once `build` returns, unlike `addComponentDefinition` there is no
   * separate placement call.
   *
   * ```ts
   * builder.addGroup((table) => {
   *   table.addFace([[0, 0, 0], [30, 0, 0], [30, 30, 0], [0, 30, 0]]);
   * }, { name: 'Table', translation: [50, 0, 0] });
   * ``` */
  addGroup(build, options = {}) {
    this._checkMaterialHandle(options.material, "material");
    this._checkLayerHandle(options.layer);
    const matrix3x3 = resolveMatrix3x3(options.matrix3x3, options.rotation);
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    const placement = [
      options.translation ?? [0, 0, 0],
      matrix3x3,
      options.material ?? 0,
      options.layer ?? 0,
      attributeDicts,
      options.hidden ?? false
    ];
    const def = this.startDefinition(options.name ?? "Group", "addGroup", placement);
    build(def);
    def._close();
    return def;
  }
  definitionShift() {
    if (this.definitionWriterInstance === null) return 0;
    return this.definitionWriterInstance.nextSlot - this.definitionWriterStart;
  }
  postDefinitionClassSlot() {
    if (this.definitionWriterInstance !== null) return { ...this.definitionWriterInstance.classSlot };
    return this.postLayerClassSlot();
  }
  /** Place one instance of `definition` (from addComponentDefinition,
   * already closed) in the model. `rotation`, if given, is an
   * alternative to `matrix3x3` for the common case of a pure rotation. */
  addInstance(definition, options = {}) {
    this._checkMaterialHandle(options.material, "material");
    this._checkLayerHandle(options.layer);
    if (definition._skp !== this) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(definition.name)} belongs to a different builder (a different create() call) - its slot number is meaningless here`
      );
    }
    const matrix3x3 = resolveMatrix3x3(options.matrix3x3, options.rotation);
    this.ensureGeometryWriter();
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += this.geometryWriter.writeInstance(
      definition.slot,
      options.name ?? definition.name,
      options.translation ?? [0, 0, 0],
      matrix3x3,
      options.material ?? 0,
      options.layer ?? 0,
      attributeDicts,
      options.hidden ?? false
    );
    this.faceCount += 1;
  }
  /** Place a SketchUp Image entity (File > Import > Image) - a picture
   * placed as its own object, distinct from painting a texture material
   * onto an ordinary face (an Image gets its own Outliner classification
   * and explode behavior a plain textured face doesn't).
   *
   * `width`/`height` size the image's quad in inches; the image covers it
   * edge to edge, undistorted regardless of the source file's own pixel
   * aspect ratio (get the ratio right yourself if that matters). Unlike
   * `addTextureMaterial`, this takes the image bytes directly (browser
   * compatibility - see addTextureMaterial's own note).
   *
   * ```ts
   * builder.addImage(photoBytes, 48, 36, {
   *   translation: [0, 0, 40],
   *   rotation: { axis: [1, 0, 0], angleRadians: Math.PI / 2 },
   * });
   * ```
   *
   * Must be called before any addLayer/addComponentDefinition/addGroup/
   * addFace/addInstance call - like addTextureMaterial (which this calls
   * internally to register the image itself), it needs a material, and
   * this writer's file format requires every material to be registered
   * before any geometry section begins.
   *
   * The image's quad and UV mapping are pinned explicitly (addFace's
   * `frontUv`), not left to the default per-material tile-size projection
   * - the read-side UV formula divides by the material's applied height
   * even for a pinned mapping, and addTextureMaterial's default height
   * (1.0) makes that division a no-op against this method's own 0..1
   * pins.
   *
   * ⚠️ Unlike every other entity this writer produces, CImage's exact
   * binary schema version (see IMAGE_SCHEMA) is a best-effort guess, not
   * calibrated against a real SketchUp-authored Image entity - none was
   * available. This project's own reader round-trips the result
   * correctly, but real SketchUp's acceptance of the file is unverified
   * beyond the Python port's own real-SketchUp test (placement/
   * orientation/texture all confirmed correct there - see CHECKLIST.md). */
  addImage(imageBytes, width, height, options = {}) {
    this._checkLayerHandle(options.layer);
    const mat = this.addTextureMaterial(`__openskp_image_${this.materialCount}`, imageBytes, options.texturePath ?? "");
    const imageDef = this.addComponentDefinition(`Image${this.definitionCount}`, (def) => {
      def.addFace(
        [[0, 0, 0], [width, 0, 0], [width, height, 0], [0, height, 0]],
        {
          material: mat,
          frontUv: [
            [[0, 0, 0], [0, 0]],
            [[width, 0, 0], [1, 0]],
            [[0, height, 0], [0, 1]]
          ]
        }
      );
    });
    const matrix3x3 = resolveMatrix3x3(options.matrix3x3, options.rotation);
    this.ensureGeometryWriter();
    this.newEntityCount += this.geometryWriter.writeImage(
      imageDef.slot,
      options.translation ?? [0, 0, 0],
      matrix3x3,
      options.layer ?? 0,
      options.hidden ?? false
    );
    this.faceCount += 1;
  }
  ensureGeometryWriter() {
    if (this.geometryWriter !== null) return;
    if (this.openDefinition !== null) {
      throw new SkpWriteError(
        `component definition ${JSON.stringify(this.openDefinition.name)} is still open - close it before adding root-level geometry`
      );
    }
    const materialShift = this.materialWriter.nextSlot - this.base;
    this.geometryWriter = new ArchiveWriter(
      this.scaffoldNextSlot + materialShift + this.layerShift() + this.definitionShift(),
      this.postDefinitionClassSlot()
    );
    for (const [comp, [translation, matrix3x3, mat, layer, attributeDicts, hidden]] of this.pendingGroups) {
      this.newEntityCount += this.geometryWriter.writeGroup(comp.slot, comp.name, translation, matrix3x3, mat, layer, attributeDicts, hidden);
      this.faceCount += 1;
    }
    this.pendingGroups = [];
  }
  /** Add one planar face, defined by 3+ coplanar points (inches) forming
   * a closed polygon in order - do not repeat the first point. Vertices
   * and edges are automatically shared with previously-added faces
   * wherever a point's coordinates match exactly. */
  addFace(points, options = {}) {
    this._checkMaterialHandle(options.material, "material");
    this._checkMaterialHandle(options.backMaterial, "backMaterial");
    this._checkLayerHandle(options.layer);
    const pts = points.map(toPoint3);
    if (pts.length < 3) throw new SkpWriteError("a face needs at least 3 points");
    const holes = (options.holes ?? []).map((h) => h.map(toPoint3));
    this.ensureGeometryWriter();
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += writeFaceOrTriangulate({
      writer: this.geometryWriter,
      points: pts,
      vertexSlots: this.vertexSlots,
      edgeRegistry: this.edgeRegistry,
      material: options.material ?? 0,
      layer: options.layer ?? 0,
      backMaterial: options.backMaterial ?? 0,
      hidden: options.hidden ?? false,
      softEdges: options.softEdges ?? false,
      smoothEdges: options.smoothEdges ?? false,
      hiddenEdges: options.hiddenEdges ?? false,
      frontUv: options.frontUv,
      backUv: options.backUv,
      attributeDicts,
      autoTriangulate: options.autoTriangulate ?? false,
      holes
    });
    this.faceCount += 1;
  }
  /** Add one circular face - a true SketchUp circle (editable by radius,
   * re-tessellatable), not `numSegments` disconnected straight edges. */
  addCircle(center, normal, radius, options = {}) {
    this._checkMaterialHandle(options.material, "material");
    this._checkMaterialHandle(options.backMaterial, "backMaterial");
    this._checkLayerHandle(options.layer);
    const numSegments = options.numSegments ?? 24;
    if (!(numSegments >= 3 && numSegments <= 255)) {
      throw new SkpWriteError(`num_segments must be between 3 and 255, got ${numSegments}`);
    }
    const c = toPoint3(center);
    const n = normalize3(toPoint3(normal));
    this.ensureGeometryWriter();
    const [u, w] = circleBasis(n);
    const xaxis = [radius * u[0], radius * u[1], radius * u[2]];
    const curveParams = { center: c, normal: n, xaxis, startAngle: 0, endAngle: 2 * Math.PI, radius, numSegments };
    const points = circlePoints(c, radius, numSegments, u, w);
    const attributeDicts = attributeDictsFrom(options.attributes, options.attributeDictName ?? "attributes");
    this.newEntityCount += this.geometryWriter.writeFace(
      points,
      this.vertexSlots,
      this.edgeRegistry,
      options.material ?? 0,
      options.layer ?? 0,
      options.backMaterial ?? 0,
      options.hidden ?? false,
      false,
      false,
      false,
      options.frontUv,
      options.backUv,
      attributeDicts,
      curveParams
    );
    this.faceCount += 1;
  }
  /** Add one partial (open) arc - a genuine SketchUp arc entity, edges
   * only, no face. `startAngle`/`endAngle` (radians) measure the sweep
   * from an arbitrary but fixed reference direction in the arc's plane. */
  addArc(center, normal, radius, startAngle, endAngle, options = {}) {
    const numSegments = options.numSegments ?? 24;
    if (!(numSegments >= 3 && numSegments <= 255)) {
      throw new SkpWriteError(`num_segments must be between 3 and 255, got ${numSegments}`);
    }
    if (endAngle === startAngle) {
      throw new SkpWriteError("start_angle and end_angle must differ - use addCircle for a full circle");
    }
    const c = toPoint3(center);
    const n = normalize3(toPoint3(normal));
    this.ensureGeometryWriter();
    const [u, w] = circleBasis(n);
    const xaxis = [radius * u[0], radius * u[1], radius * u[2]];
    const curveParams = { center: c, normal: n, xaxis, startAngle, endAngle, radius, numSegments };
    const points = arcPoints(c, radius, numSegments, u, w, startAngle, endAngle);
    this.newEntityCount += this.geometryWriter.writeArc(
      points,
      this.vertexSlots,
      this.edgeRegistry,
      curveParams,
      options.hiddenEdges ?? false,
      options.softEdges ?? false,
      options.smoothEdges ?? false
    );
    this.faceCount += 1;
  }
  /** Add one freeform polyline curve - a chain of straight edges grouped
   * into one genuine SketchUp "Curve" entity, no face. */
  addPolyline(points, options = {}) {
    const pts = points.map(toPoint3);
    if (pts.length < 2) throw new SkpWriteError("a polyline needs at least 2 points");
    this.ensureGeometryWriter();
    this.newEntityCount += this.geometryWriter.writePolyline(
      pts,
      this.vertexSlots,
      this.edgeRegistry,
      options.closed ?? false,
      options.hiddenEdges ?? false,
      options.softEdges ?? false,
      options.smoothEdges ?? false
    );
    this.faceCount += 1;
  }
  /** Add a FREE linear dimension between two explicit points (inches,
   * world space). `offset` is the dimension line's offset from the
   * measured segment, in inches (signed). See ArchiveWriter.writeDimension
   * for the record's ground truth. */
  addDimension(p1, p2, offset = 10) {
    this.ensureGeometryWriter();
    this.geometryWriter.writeDimension(toPoint3(p1), toPoint3(p2), offset);
    this.newEntityCount += 1;
    this.faceCount += 1;
  }
  /** Add a leader text (SketchUp's Text tool) anchored at `point` (inches,
   * world space), with the label floating at `point + leader` and a
   * leader line joining them. See ArchiveWriter.writeText for the
   * record's ground truth. */
  addText(text, point, leader = [15, 15, 15]) {
    this.ensureGeometryWriter();
    this.geometryWriter.writeText(text, toPoint3(point), toPoint3(leader));
    this.newEntityCount += 1;
    this.faceCount += 1;
  }
  /** Add a construction/guide line (SketchUp's Construction Line tool).
   * Pass exactly one of `point2` (a bounded segment between `point` and
   * `point2`, matching `Entities#add_cline(p1, p2)`) or `direction` (an
   * unbounded guide line through `point`, matching
   * `Entities#add_cline(point, vector)`). See
   * ArchiveWriter.writeConstructionLine for the record's ground truth. */
  addConstructionLine(point, options = {}) {
    this.ensureGeometryWriter();
    this.geometryWriter.writeConstructionLine(
      toPoint3(point),
      options.point2 !== void 0 ? toPoint3(options.point2) : void 0,
      options.direction !== void 0 ? toPoint3(options.direction) : void 0
    );
    this.newEntityCount += 1;
    this.faceCount += 1;
  }
  /** Add a construction/guide point (SketchUp's Construction Point tool)
   * at `position` (inches, world space). See
   * ArchiveWriter.writeConstructionPoint for the record's ground truth. */
  addConstructionPoint(position) {
    this.ensureGeometryWriter();
    this.geometryWriter.writeConstructionPoint(toPoint3(position));
    this.newEntityCount += 1;
    this.faceCount += 1;
  }
  /** Add a section plane (SketchUp's Section Plane tool) through `point`
   * with the given `normal` (need not be unit length), matching
   * `Entities#add_section_plane([point, normal])`. See
   * ArchiveWriter.writeSectionPlane for the record's ground truth. */
  addSectionPlane(point, normal) {
    this.ensureGeometryWriter();
    this.geometryWriter.writeSectionPlane(toPoint3(point), toPoint3(normal));
    this.newEntityCount += 1;
    this.faceCount += 1;
  }
  /** Return the finished file's bytes. */
  toBytes() {
    if (this.pendingGroups.length > 0) {
      this.ensureGeometryWriter();
    }
    if (this.faceCount === 0) throw new SkpWriteError("no geometry added - call addFace at least once before saving");
    const materialShift = this.materialWriter.nextSlot - this.base;
    const layerShift = this.layerShift();
    const definitionShift = this.definitionShift();
    const geometryInitialSlot = this.scaffoldNextSlot + materialShift + layerShift + definitionShift;
    const geometryShift = this.geometryWriter.nextSlot - geometryInitialSlot;
    const newRootCount = this.origRootCount + this.newEntityCount;
    const parts = [];
    const out = {
      push: (part) => {
        parts.push(part instanceof Uint8Array ? part : Uint8Array.from(part));
      }
    };
    const layerPids = this.layerWriter ? this.layerWriter.nextPid - 1 : 0;
    const pidDelta = this.materialCount + layerPids;
    const prefix = Array.from(this.data.subarray(0, this.materialInsertPos - 4));
    if (pidDelta) {
      const u16 = readU16(prefix, PID_COUNTER_POS);
      writeU16At(prefix, PID_COUNTER_POS, u16 + pidDelta);
    }
    for (let i = 0; i < ISO_CAMERA_PREFIX_PATCH.length; i++) {
      prefix[ISO_CAMERA_PREFIX_OFFSET + i] = ISO_CAMERA_PREFIX_PATCH[i];
    }
    out.push(prefix);
    out.push(u32Bytes(this.materialCount));
    out.push(this.materialWriter.bytes.view());
    const middle1 = Array.from(this.data.subarray(this.materialInsertPos, this.layerInsertPos));
    const layerCountRel = this.layerCountPos - this.materialInsertPos;
    writeU32At(middle1, layerCountRel, this.origLayerCount + this.layerCount);
    out.push(middle1);
    if (this.layerWriter !== null) out.push(this.layerWriter.bytes.view());
    const middle2a = Array.from(this.data.subarray(this.layerInsertPos, this.defCountPos));
    if (materialShift) shiftRef(middle2a, ACTIVE_LAYER_ANCHOR_REL, materialShift);
    out.push(middle2a);
    out.push(u32Bytes(this.origDefCount + this.definitionCount));
    if (this.definitionWriterInstance !== null) out.push(this.definitionWriterInstance.bytes.view());
    out.push(this.data.subarray(this.defCountPos + 4, this.rootCountPos));
    out.push(u32Bytes(newRootCount));
    out.push(this.data.subarray(this.rootCountPos + 4, this.tailPos));
    out.push(this.geometryWriter.bytes.view());
    const tail = Array.from(this.data.subarray(this.tailPos));
    const totalTailShift = materialShift + layerShift + definitionShift + geometryShift;
    const isoPatches = new Map(ISO_CAMERA_TAIL_PATCHES);
    const actions = [
      ...TAIL_REF_POSITIONS.map((pos) => [pos, "ref"]),
      ...Array.from(isoPatches.keys()).map((pos) => [pos, "patch"])
    ].sort((a, b) => a[0] - b[0]);
    let growth = 0;
    for (const [pos, kind] of actions) {
      const here = pos + growth;
      if (kind === "ref") {
        growth += shiftRef(tail, here, totalTailShift);
      } else {
        const patch = isoPatches.get(pos);
        for (let i = 0; i < patch.length; i++) tail[here + i] = patch[i];
      }
    }
    out.push(tail);
    let total = 0;
    for (const part of parts) total += part.length;
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
  /** Write the finished file to `path` (Node.js only). */
  save(path) {
    if (typeof process === "undefined" || !process.versions || !process.versions.node) {
      throw new Error("SkpBuilder.save is only supported in Node.js environments - use toBytes() elsewhere");
    }
    const fs = __require("fs");
    fs.writeFileSync(path, Buffer.from(this.toBytes()));
  }
  // -- internals used by ComponentDefinitionBuilder --
  /** @internal */
  _definitionWriter() {
    return this.definitionWriterInstance;
  }
  /** @internal */
  _patchDefinitionCount(countPatchPos, count) {
    const writer = this.definitionWriterInstance;
    writeU32At(writer.bytes.buf, countPatchPos, count);
  }
  /** @internal */
  _clearOpenDefinition() {
    this.openDefinition = null;
  }
  /** @internal */
  _pushPendingGroup(comp, placement) {
    this.pendingGroups.push([comp, placement]);
  }
};
function create() {
  return new SkpBuilder();
}


export {create};
