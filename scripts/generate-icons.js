import fs from 'fs';
import zlib from 'zlib';

// Simple CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  // Create RGBA image buffer
  // Maskable icons should keep logo within safe zone (80% center circle)
  const rows = [];
  const cx = width / 2;
  const cy = height / 2;
  const rCorner = isMaskable ? 0 : width * 0.22;

  // Pulse line points normalized (0 to 1)
  const pulsePoints = [
    [0.18, 0.50],
    [0.34, 0.50],
    [0.42, 0.32],
    [0.52, 0.68],
    [0.60, 0.42],
    [0.67, 0.55],
    [0.72, 0.50],
    [0.82, 0.50]
  ];

  function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;

      // Rounded rect mask for standard icon
      let inShape = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (cx - rCorner);
        const dy = Math.abs(y - cy) - (cy - rCorner);
        if (dx > 0 && dy > 0) {
          if (dx * dx + dy * dy > rCorner * rCorner) {
            inShape = false;
          }
        }
      }

      if (!inShape) {
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
        continue;
      }

      // Base gradient: Deep Indigo (#4338ca) to Vibrant Purple (#7e22ce)
      const tY = y / height;
      const tX = x / width;
      const diag = (tX + tY) / 2;

      let r = Math.round(67 + diag * 59);  // 67 -> 126
      let g = Math.round(56 + (1 - diag) * 46); // 102 -> 56
      let b = Math.round(202 + diag * 20); // 202 -> 222
      let a = 255;

      // Check distance to pulse line
      const lineWidth = Math.max(3, width * 0.045);
      let minDist = 9999;
      for (let i = 0; i < pulsePoints.length - 1; i++) {
        const p1 = pulsePoints[i];
        const p2 = pulsePoints[i + 1];
        const d = distToSegment(x, y, p1[0] * width, p1[1] * height, p2[0] * width, p2[1] * height);
        if (d < minDist) minDist = d;
      }

      // Check distance to node dots
      let isNode = false;
      const nodeRadius = width * 0.032;
      for (const p of [pulsePoints[2], pulsePoints[3], pulsePoints[4]]) {
        const d = Math.hypot(x - p[0] * width, y - p[1] * height);
        if (d <= nodeRadius) {
          isNode = true;
          break;
        }
      }

      if (isNode) {
        r = 255; g = 255; b = 255;
      } else if (minDist < lineWidth / 2) {
        // Core white/cyan glow
        const glow = 1 - minDist / (lineWidth / 2);
        r = Math.round(r * (1 - glow) + 255 * glow);
        g = Math.round(g * (1 - glow) + 255 * glow);
        b = Math.round(b * (1 - glow) + 255 * glow);
      } else if (minDist < lineWidth) {
        // Outer cyan edge
        const edge = 1 - (minDist - lineWidth / 2) / (lineWidth / 2);
        r = Math.round(r * (1 - edge) + 56 * edge);
        g = Math.round(g * (1 - edge) + 189 * edge);
        b = Math.round(b * (1 - edge) + 248 * edge);
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = writeChunk('IDAT', compressed);

  // IEND
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all target icon files
console.log('Generating PWA icons...');
fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, false));
fs.writeFileSync('public/favicon.ico', createPng(32, 32, false));
console.log('Icons generated successfully in public/');
