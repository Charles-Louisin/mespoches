const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Génération des icônes PWA...\n');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Généré: icon-${size}x${size}.png`);
  }
  
  // Générer le favicon
  const faviconPath = path.join(__dirname, '../public/favicon.ico');
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));
  
  console.log('✅ Généré: favicon.png');
  
  // Générer apple-touch-icon
  const appleTouchPath = path.join(__dirname, '../public/apple-touch-icon.png');
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  
  console.log('✅ Généré: apple-touch-icon.png');
  
  console.log('\n🎉 Toutes les icônes ont été générées avec succès !');
}

generateIcons().catch(console.error);
