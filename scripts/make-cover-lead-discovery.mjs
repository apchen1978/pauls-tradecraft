// make-cover-lead-discovery.mjs
// Crop the top 16:9 area of the real Lead Discovery demo screenshot as the cover.
// Real screenshot, no fabricated UI.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "C:/Users/grays/Documents/DeepSeek-Test/lead-discovery-demo/shots/lead-demo-1440.png";
const OUT = "C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/public/images/cover-lead-discovery.png";

// Decode PNG (RGBA, no interlace assumption — these screenshots are standard non-interlaced 8-bit RGBA)
const buf = readFileSync(SRC);
if (buf.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("not a PNG");
let off = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0, idat = [];
while (off < buf.length) {
  const len = buf.readUInt32BE(off);
  const type = buf.toString("ascii", off + 4, off + 8);
  const data = buf.subarray(off + 8, off + 8 + len);
  if (type === "IHDR") {
    width = data.readUInt32BE(0); height = data.readUInt32BE(4);
    bitDepth = data[8]; colorType = data[9];
    if (data[12] !== 0) throw new Error("interlaced PNG not supported");
  }
  if (type === "IDAT") idat.push(data);
  off += 12 + len;
}
if (colorType !== 6 && colorType !== 2) throw new Error("expected RGB/RGBA, got " + colorType);
const zlib = await import("node:zlib");
const raw = zlib.inflateSync(Buffer.concat(idat));
const bpp = colorType === 6 ? 4 : 3;
const stride = width * bpp;
// unfilter
const out = Buffer.alloc(stride * height);
let prev = Buffer.alloc(stride);
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)];
  const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  const cur = out.subarray(y * stride, (y + 1) * stride);
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? cur[x - bpp] : 0;
    const b0 = prev[x];
    const c0 = x >= bpp ? prev[x - bpp] : 0;
    let v = row[x];
    if (f === 1) v += a;
    else if (f === 2) v += b0;
    else if (f === 3) v += Math.floor((a + b0) / 2);
    else if (f === 4) {
      const p2 = a + b0 - c0;
      const pa = Math.abs(p2 - a), pb = Math.abs(p2 - b0), pc = Math.abs(p2 - c0);
      v += pa <= pb && pa <= pc ? a : pb <= pc ? b0 : c0;
    }
    cur[x] = v & 0xff;
  }
  prev = Buffer.from(cur);
}

// Crop: top 16:9 (width x height*9/16)
const cropH = Math.round((width * 9) / 16); // 2880 -> 1620
const cropW = width;
const outW = cropW, outH = cropH;
const inChannels = bpp;
const pixels = Buffer.alloc(outW * outH * 4);
for (let y = 0; y < outH; y++) {
  for (let x = 0; x < outW; x++) {
    const si = (y * stride) + (x * inChannels);
    const di = (y * outW + x) * 4;
    pixels[di] = out[si];
    pixels[di + 1] = out[si + 1];
    pixels[di + 2] = out[si + 2];
    pixels[di + 3] = inChannels === 4 ? out[si + 3] : 255;
  }
}

// Encode PNG (zlib deflate, no filter)
const z = zlib.deflateSync(pixels, { level: 9 });
const crcTable = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(outW, 0); ihdr.writeUInt32BE(outH, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", z),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(OUT, png);
console.log("cover written:", OUT, outW + "x" + outH, (png.length / 1024).toFixed(0) + "KB");
