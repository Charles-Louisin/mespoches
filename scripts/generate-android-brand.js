/**
 * Génère icônes launcher + écrans splash Android depuis public/icon.svg
 * Usage: node scripts/generate-android-brand.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const inputSvg = path.join(root, 'public/icon.svg');
const resDir = path.join(root, 'android/app/src/main/res');

const BRAND = { r: 99, g: 91, b: 255 }; // #635bff
const BRAND_DARK = { r: 67, g: 56, b: 202 }; // #4338ca

const splashSizes = {
  'drawable': { w: 1080, h: 1920 },
  'drawable-port-mdpi': { w: 320, h: 480 },
  'drawable-port-hdpi': { w: 480, h: 800 },
  'drawable-port-xhdpi': { w: 720, h: 1280 },
  'drawable-port-xxhdpi': { w: 1080, h: 1920 },
  'drawable-port-xxxhdpi': { w: 1440, h: 2560 },
  'drawable-land-mdpi': { w: 480, h: 320 },
  'drawable-land-hdpi': { w: 800, h: 480 },
  'drawable-land-xhdpi': { w: 1280, h: 720 },
  'drawable-land-xxhdpi': { w: 1920, h: 1080 },
  'drawable-land-xxxhdpi': { w: 2560, h: 1440 },
};

const launcherSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function gradientBg(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b7aff"/>
          <stop offset="50%" style="stop-color:#635bff"/>
          <stop offset="100%" style="stop-color:#4338ca"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function logoPng(size) {
  return sharp(inputSvg).resize(size, size, { fit: 'contain' }).png().toBuffer();
}

async function makeSplash(folder, { w, h }) {
  const logoSize = Math.round(Math.min(w, h) * 0.28);
  const bg = await gradientBg(w, h);
  const logo = await logoPng(logoSize);
  const outDir = path.join(resDir, folder);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'splash.png');
  await sharp(bg)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(outPath);
  console.log(`  splash → ${folder}/splash.png (${w}×${h})`);
}

async function makeLauncher(folder, size) {
  const outDir = path.join(resDir, folder);
  fs.mkdirSync(outDir, { recursive: true });
  const icon = await sharp(inputSvg).resize(size, size).png().toBuffer();
  const fgSize = Math.round(size * 0.72);
  const fg = await logoPng(fgSize);
  const pad = Math.round((size - fgSize) / 2);
  const composed = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND,
    },
  })
    .composite([{ input: fg, top: pad, left: pad }])
    .png()
    .toBuffer();

  await sharp(composed).toFile(path.join(outDir, 'ic_launcher.png'));
  await sharp(composed).toFile(path.join(outDir, 'ic_launcher_round.png'));
  await sharp(fg)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { ...BRAND, alpha: 0 },
    })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, 'ic_launcher_foreground.png'));
  console.log(`  launcher → ${folder} (${size}px)`);
}

async function main() {
  if (!fs.existsSync(inputSvg)) {
    console.error('icon.svg introuvable');
    process.exit(1);
  }
  console.log('🎨 Génération brand Android MES POCHES…\n');
  for (const [folder, dim] of Object.entries(splashSizes)) {
    await makeSplash(folder, dim);
  }
  for (const [folder, size] of Object.entries(launcherSizes)) {
    await makeLauncher(folder, size);
  }
  console.log('\n✅ Assets Android mis à jour.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
