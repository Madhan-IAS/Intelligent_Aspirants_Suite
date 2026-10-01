const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'node_modules', 'pdfjs-dist');
if (fs.existsSync(dir)) {
  console.log('pdfjs-dist files:');
  const files = fs.readdirSync(dir);
  console.log(files);
  const buildDir = path.join(dir, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('build files:');
    console.log(fs.readdirSync(buildDir));
  }
  const legacyDir = path.join(dir, 'legacy');
  if (fs.existsSync(legacyDir)) {
    console.log('legacy files:');
    console.log(fs.readdirSync(legacyDir));
    const legacyBuildDir = path.join(legacyDir, 'build');
    if (fs.existsSync(legacyBuildDir)) {
      console.log('legacy/build files:');
      console.log(fs.readdirSync(legacyBuildDir));
    }
  }
} else {
  console.log('pdfjs-dist does not exist in node_modules');
}
