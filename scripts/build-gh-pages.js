const fs = require('fs');
const path = require('path');

// Build the app first
const { execSync } = require('child_process');

console.log('Building for web...');
execSync('npx expo export --platform web --clear', { stdio: 'inherit' });

console.log('Fixing asset paths for GitHub Pages...');

// Function to replace absolute paths with relative paths
function fixAssetPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace absolute paths with relative paths for GitHub Pages
  content = content.replace(
    /\/assets\/assets\//g, 
    './assets/assets/'
  );
  
  content = content.replace(
    /\/_expo\/static\//g, 
    './_expo/static/'
  );
  
  content = content.replace(
    /\/favicon\.ico/g, 
    './favicon.ico'
  );
  
  fs.writeFileSync(filePath, content);
}

// Fix all HTML files
const distPath = path.join(__dirname, '../dist');
const files = fs.readdirSync(distPath);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(distPath, file);
    console.log(`Fixing paths in ${file}`);
    fixAssetPaths(filePath);
  }
});

console.log('GitHub Pages build complete!');
console.log('Assets are now using relative paths.');
