const sharp = require('sharp');
const path = require('path');

async function generateAllFavicons() {
  try {
    console.log('🎨 Génération de tous les favicons...\n');
    
    const inputPath = path.join(__dirname, '../public/icons/icon-512x512.png');
    
    // 1. favicon.ico (32x32) dans app/
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(__dirname, '../app/favicon.ico'));
    console.log('✅ app/favicon.ico généré (32x32)');
    
    // 2. favicon.png dans public/ (pour fallback)
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(__dirname, '../public/favicon.png'));
    console.log('✅ public/favicon.png généré (192x192)');
    
    // 3. apple-touch-icon.png (180x180)
    await sharp(inputPath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log('✅ public/apple-touch-icon.png généré (180x180)');
    
    console.log('\n🎉 Tous les favicons ont été générés avec succès !');
    console.log('\n📱 Vos icônes sont maintenant :');
    console.log('  - Favicon navigateur : app/favicon.ico');
    console.log('  - Icône iOS : public/apple-touch-icon.png');
    console.log('  - Icônes PWA : public/icons/icon-*.png');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

generateAllFavicons();
