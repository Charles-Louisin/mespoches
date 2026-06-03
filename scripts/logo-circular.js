const sharp = require('sharp');

function circleMaskSvg(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`
  );
}

/** Découpe l'image en cercle (PNG avec transparence sur les coins). */
async function toCircularBuffer(input, size) {
  const resized = await sharp(input).resize(size, size, { fit: 'cover' }).png().toBuffer();
  return sharp(resized)
    .composite([{ input: circleMaskSvg(size), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function toCircularFile(input, size, outPath) {
  const buf = await toCircularBuffer(input, size);
  await sharp(buf).toFile(outPath);
  return buf;
}

module.exports = { toCircularBuffer, toCircularFile, circleMaskSvg };
