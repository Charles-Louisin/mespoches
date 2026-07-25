/**
 * Génère icônes launcher + écrans splash Android depuis public/logo.png
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { toCircularBuffer } = require('./logo-circular');

const root = path.join(__dirname, '..');
const logoSource =
  [path.join(root, 'public/logo1.jpeg'), path.join(root, 'public/logo.png')].find((p) =>
    fs.existsSync(p)
  ) || path.join(root, 'public/logo.png');
const logoPath = logoSource;
const resDir = path.join(root, 'android/app/src/main/res');

const BRAND = { r: 37, g: 99, b: 235 }; // #2563EB

const splashSizes = {
  drawable: { w: 1080, h: 1920 },
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

async function solidBg(width, height) {
  return sharp({
    create: { width, height, channels: 3, background: BRAND },
  })
    .png()
    .toBuffer();
}

async function renderLogo(size) {
  return toCircularBuffer(logoPath, size);
}

async function makeSplash(folder, { w, h }) {
  const logoSize = Math.round(Math.min(w, h) * 0.32);
  const bg = await solidBg(w, h);
  const logo = await renderLogo(logoSize);
  const outDir = path.join(resDir, folder);
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(bg)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'splash.png'));
  console.log(`  splash → ${folder}/splash.png (${w}×${h})`);
}

async function makeLauncher(folder, size) {
  const outDir = path.join(resDir, folder);
  fs.mkdirSync(outDir, { recursive: true });
  const fgSize = Math.round(size * 0.88);
  const fg = await renderLogo(fgSize);
  const pad = Math.round((size - fgSize) / 2);

  const composed = await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND },
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

/** Icône barre de statut : silhouette blanche sur fond transparent (exigence Android). */
const notificationIconSizes = {
  'drawable-mdpi': 24,
  'drawable-hdpi': 36,
  'drawable-xhdpi': 48,
  'drawable-xxhdpi': 72,
  'drawable-xxxhdpi': 96,
};

async function makeNotificationIcon(folder, size) {
  const outDir = path.join(resDir, folder);
  fs.mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(logoPath)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 40) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Lettres claires du logo → blanc ; fond coloré → transparent
    if (lum >= 160) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path.join(outDir, 'ic_stat_mes_poches.png'));
  console.log(`  notif icon → ${folder}/ic_stat_mes_poches.png (${size}px)`);
}

async function main() {
  if (!fs.existsSync(logoPath)) {
    console.error('logo.png introuvable');
    process.exit(1);
  }
  console.log('🎨 Brand Android MES POCHES…\n');
  for (const [folder, dim] of Object.entries(splashSizes)) {
    await makeSplash(folder, dim);
  }
  for (const [folder, size] of Object.entries(launcherSizes)) {
    await makeLauncher(folder, size);
  }
  for (const [folder, size] of Object.entries(notificationIconSizes)) {
    await makeNotificationIcon(folder, size);
  }
  console.log('\n✅ Assets Android mis à jour.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
