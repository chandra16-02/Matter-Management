import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer with filter byte 0 at the start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const chunkData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(chunkData), 0);

    return Buffer.concat([len, chunkData, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6: RGBA
  ihdr[10] = 0; // Compression method 0
  ihdr[11] = 0; // Filter method 0
  ihdr[12] = 0; // Non-interlaced

  const idat = compressedData;
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', iend),
  ]);
}

// Drawing function for standard app icon
function drawStandardIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background gradient from indigo (#4f46e5) to deep violet (#312e81)
  const rBg = Math.round(79 + (49 - 79) * ny);
  const gBg = Math.round(70 + (46 - 70) * ny);
  const bBg = Math.round(229 + (129 - 229) * ny);

  // Rounded squircle check (radius ~ 22%)
  const cornerR = 0.22;
  const dx = Math.abs(nx - 0.5);
  const dy = Math.abs(ny - 0.5);
  const cx = 0.5 - cornerR;
  const cy = 0.5 - cornerR;

  if (dx > cx && dy > cy) {
    const distSq = (dx - cx) ** 2 + (dy - cy) ** 2;
    if (distSq > cornerR ** 2) {
      return [0, 0, 0, 0]; // Transparent outer corner
    }
  }

  // Draw Letter "M" in white inside central 60%
  const isM = checkLetterM(nx, ny);
  if (isM) {
    return [255, 255, 255, 255];
  }

  // HR Accent Dot in top right
  const dotDx = nx - 0.74;
  const dotDy = ny - 0.26;
  if (dotDx * dotDx + dotDy * dotDy < 0.05 * 0.05) {
    return [168, 85, 247, 255]; // Purple accent dot
  }

  return [rBg, gBg, bBg, 255];
}

// Drawing function for maskable icon (full bleed background, padded safe zone)
function drawMaskableIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Solid full-bleed gradient
  const rBg = Math.round(79 + (49 - 79) * ny);
  const gBg = Math.round(70 + (46 - 70) * ny);
  const bBg = Math.round(229 + (129 - 229) * ny);

  // Letter M inside safe central 50%
  const isM = checkLetterM(nx, ny, 0.75); // Scaled down for safe zone
  if (isM) {
    return [255, 255, 255, 255];
  }

  return [rBg, gBg, bBg, 255];
}

function checkLetterM(nx, ny, scale = 1.0) {
  // Center is (0.5, 0.5)
  const mx = (nx - 0.5) / scale + 0.5;
  const my = (ny - 0.5) / scale + 0.5;

  if (my < 0.28 || my > 0.74 || mx < 0.26 || mx > 0.74) return false;

  const barW = 0.09;
  // Left vertical
  if (mx >= 0.26 && mx <= 0.26 + barW) return true;
  // Right vertical
  if (mx >= 0.74 - barW && mx <= 0.74) return true;

  // Diagonals meeting at center bottom (0.5, 0.62)
  const d1 = Math.abs((mx - 0.26) / (0.5 - 0.26) - (my - 0.28) / (0.62 - 0.28));
  if (d1 < 0.18 && mx >= 0.26 && mx <= 0.5 && my >= 0.28 && my <= 0.64) return true;

  const d2 = Math.abs((0.74 - mx) / (0.74 - 0.5) - (my - 0.28) / (0.62 - 0.28));
  if (d2 < 0.18 && mx >= 0.5 && mx <= 0.74 && my >= 0.28 && my <= 0.64) return true;

  return false;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. apple-touch-icon.png (180x180 for iOS Safari)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, drawStandardIcon));

// 2. pwa-192x192.png (192x192 for Android)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, drawStandardIcon));

// 3. pwa-512x512.png (512x512 for Android)
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, drawStandardIcon));

// 4. pwa-maskable-512x512.png (512x512 maskable for Android)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, drawMaskableIcon));

console.log('Successfully generated Apple & Android PWA icons in /public!');
