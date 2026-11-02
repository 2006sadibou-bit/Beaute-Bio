const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

async function optimizeImages() {
  const files = fs.readdirSync(publicDir);

  const images = files.filter(
    (file) => /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`Images trouvées : ${images.length}`);

  for (const file of images) {
    const input = path.join(publicDir, file);
    const temp = path.join(publicDir, `temp-${file}`);

    try {
      await sharp(input)
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          mozjpeg: true,
        })
        .toFile(temp);

      fs.renameSync(temp, input);

      console.log(`✓ ${file}`);
    } catch (error) {
      console.error(`✗ ${file} : ${error.message}`);
    }
  }

  console.log("\n✅ Optimisation terminée !");
}

optimizeImages();