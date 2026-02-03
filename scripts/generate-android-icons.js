const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Android icon sizes for each density
const ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground sizes (for adaptive icons, foreground is 108dp with 72dp safe zone)
const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const SOURCE_ICON = path.join(__dirname, '../public/waypoint-logo.png');
const ANDROID_RES = path.join(__dirname, '../android/app/src/main/res');

async function generateIcons() {
  console.log('Generating Android app icons...');

  // Get the source image metadata
  const metadata = await sharp(SOURCE_ICON).metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // Generate regular launcher icons (with dark green background)
  for (const [folder, size] of Object.entries(ICON_SIZES)) {
    const outputPath = path.join(ANDROID_RES, folder, 'ic_launcher.png');
    const roundOutputPath = path.join(ANDROID_RES, folder, 'ic_launcher_round.png');

    // Create icon with dark green background (#0d5c4b)
    const iconBuffer = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 13, g: 92, b: 75, alpha: 1 }  // #0d5c4b
      }
    })
    .composite([{
      input: await sharp(SOURCE_ICON)
        .resize(Math.round(size * 0.65), Math.round(size * 0.65), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

    await sharp(iconBuffer).toFile(outputPath);
    console.log(`Created: ${outputPath}`);

    // Round icon - same but will be masked by Android
    await sharp(iconBuffer).toFile(roundOutputPath);
    console.log(`Created: ${roundOutputPath}`);
  }

  // Generate foreground for adaptive icons (transparent background)
  for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
    const outputPath = path.join(ANDROID_RES, folder, 'ic_launcher_foreground.png');

    // Foreground should have logo centered with padding
    const logoSize = Math.round(size * 0.5);  // Logo takes up about 50% of foreground

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: await sharp(SOURCE_ICON)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toFile(outputPath);

    console.log(`Created: ${outputPath}`);
  }

  console.log('\nDone! Android app icons generated successfully.');
  console.log('\nNote: The adaptive icon background color is defined in ic_launcher_background.xml');
}

generateIcons().catch(console.error);
