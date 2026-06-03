/**
 * Génère logo.svg depuis logo.png + toutes les tailles (PWA, favicon, Android).
 * Usage: node scripts/generate-logo-assets.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { toCircularFile } = require('./logo-circular');

const root = path.join(__dirname, '..');
const logoSource =
  [path.join(root, 'public/logo1.jpeg'), path.join(root, 'public/logo.png')].find((p) =>
    fs.existsSync(p)
  ) || path.join(root, 'public/logo.png');
const logoPng = path.join(root, 'public/logo.png');
const iconsDir = path.join(root, 'public/icons');

const BRAND_BLUE = '#2563EB';

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function writeLogoSvg() {
  const buf = fs.readFileSync(logoSource);
  const meta = await sharp(buf).metadata();
  const b64 = buf.toString('base64');
  const w = meta.width || 512;
  const h = meta.height || 512;

  const r = Math.min(w, h) / 2;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="MES POCHES">
  <title>MES POCHES</title>
  <defs><clipPath id="round"><circle cx="${w / 2}" cy="${h / 2}" r="${r}"/></clipPath></defs>
  <image width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" clip-path="url(#round)"
    href="data:image/png;base64,${b64}"/>
</svg>`;

  fs.writeFileSync(path.join(root, 'public/logo.svg'), svg);
  console.log('✅ public/logo.svg');

  // Compatibilité scripts existants
  fs.writeFileSync(path.join(root, 'public/icon.svg'), svg);
  console.log('✅ public/icon.svg (alias logo)');
}

async function generatePwaIcons() {
  fs.mkdirSync(iconsDir, { recursive: true });
  for (const size of iconSizes) {
    await toCircularFile(logoSource, size, path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✅ icons/icon-${size}x${size}.png (rond)`);
  }

  await toCircularFile(logoSource, 32, path.join(root, 'public/favicon.png'));
  console.log('✅ public/favicon.png (rond)');

  await toCircularFile(logoSource, 180, path.join(root, 'public/apple-touch-icon.png'));
  console.log('✅ public/apple-touch-icon.png (rond)');

  await toCircularFile(logoSource, 32, path.join(root, 'app/favicon.ico'));
  console.log('✅ app/favicon.ico (rond)');

  await toCircularFile(logoSource, 512, logoPng);
  console.log('✅ public/logo.png (rond, remplacé pour affichage UI)');
}

async function main() {
  if (!fs.existsSync(logoSource)) {
    console.error('❌ public/logo.png ou logo1.jpeg introuvable');
    process.exit(1);
  }

  console.log('🎨 Génération des assets logo MES POCHES…\n');
  await writeLogoSvg();
  console.log('');
  await generatePwaIcons();
  console.log('\n📱 Génération Android…\n');

  const android = spawnSync('node', [path.join(__dirname, 'generate-android-brand.js')], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });

  if (android.status !== 0) process.exit(android.status ?? 1);
  console.log(`\n🎉 Terminé. Couleur brand : ${BRAND_BLUE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
