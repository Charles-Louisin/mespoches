const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    console.log('Génération du favicon.ico...');
    
    // Lire l'icône source
    const inputPath = path.join(__dirname, '../public/icons/icon-192x192.png');
    const outputPath = path.join(__dirname, '../app/favicon.ico');
    
    // Générer plusieurs tailles pour le ICO
    const sizes = [16, 32, 48];
    const buffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      buffers.push(buffer);
    }
    
    // Pour l'instant, utilisons juste le 32x32 comme favicon.ico
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(outputPath);
    
    console.log('✅ Favicon généré avec succès:', outputPath);
  } catch (error) {
    console.error('❌ Erreur lors de la génération du favicon:', error);
  }
}

generateFavicon();
