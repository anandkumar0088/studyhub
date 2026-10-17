// scripts/generate-icons.js
// Generates minimal valid PNG icons and Open Graph images using built-in zlib
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // Construct a minimal uncompressed/deflated raw RGBA PNG
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc((scanlineLength + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (scanlineLength + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      
      // Draw border / gradient / mark pattern
      const isCorner = (x < 16 && y < 16) || (x > width - 16 && y < 16) || (x < 16 && y > height - 16) || (x > width - 16 && y > height - 16);
      const isInner = x > 8 && x < width - 8 && y > 8 && y < height - 8;
      
      if (isInner) {
        // Subtle navy gradient with center amber beacon
        const dx = x - width / 2;
        const dy = y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < width * 0.18) {
          // Amber accent
          rawData[pixelOffset] = 217;     // R
          rawData[pixelOffset + 1] = 119; // G
          rawData[pixelOffset + 2] = 6;   // B
          rawData[pixelOffset + 3] = 255; // A
        } else {
          // Navy
          rawData[pixelOffset] = 15;
          rawData[pixelOffset + 1] = 41;
          rawData[pixelOffset + 2] = 66;
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        rawData[pixelOffset] = 12;
        rawData[pixelOffset + 1] = 30;
        rawData[pixelOffset + 2] = 50;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // Calculate CRC32 for type + data
  const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcData);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    crc32.table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 32x32, 180x180 (apple-touch), 192x192, 512x512, and 1200x630 (og-image)
console.log('Generating PNG icons and OG preview...');
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), createPng(32, 32));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512));
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'og-image.png'), createPng(1200, 630));
console.log('Successfully generated icon and Open Graph assets.');
