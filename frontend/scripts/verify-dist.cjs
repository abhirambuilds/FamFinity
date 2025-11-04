#!/usr/bin/env node
// Cross-platform script to verify dist directory contents
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory does not exist!');
  process.exit(1);
}

console.log('\n--- dist root contents ---');
const files = fs.readdirSync(distPath);
const requiredFiles = ['index.html', 'manifest.json', 'logo-mark.svg', 'favicon.png'];
const hasAssetsDir = files.includes('assets');

files.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  const size = stats.isDirectory() ? '<DIR>' : `${(stats.size / 1024).toFixed(2)} KB`;
  console.log(`${stats.isDirectory() ? 'd' : '-'} ${file.padEnd(30)} ${size}`);
});

console.log('\n--- verification ---');
const missing = requiredFiles.filter(f => !files.includes(f));
if (missing.length > 0) {
  console.error(`❌ Missing required files: ${missing.join(', ')}`);
  process.exit(1);
}
if (!hasAssetsDir) {
  console.error('❌ Missing assets directory');
  process.exit(1);
}

console.log('✅ All required files present:');
requiredFiles.forEach(f => console.log(`   ✓ ${f}`));
console.log('   ✓ assets/ directory');
console.log('');
