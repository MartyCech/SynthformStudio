const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

// Fail-closed whitelist of everything that may reach production (ADR-0004).
// Adding a new public file or directory REQUIRES adding it here.
const FILES = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
];

const DIRECTORIES = [
  'css/styles.css',
  'js',
  'img',
  'fonts',
  'data',
];

function copyRecursive(source, destination) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

let copied = 0;
const skipped = [];

for (const entry of [...FILES, ...DIRECTORIES]) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) {
    skipped.push(entry);
    continue;
  }
  copyRecursive(source, path.join(output, entry));
  copied += 1;
}

// Every HTML file at the root is a public page; catch ones missing from the whitelist.
const unlisted = fs.readdirSync(root)
  .filter((entry) => entry.endsWith('.html') && !FILES.includes(entry));

if (unlisted.length) {
  throw new Error(
    `HTML files are not whitelisted in scripts/build-public.js: ${unlisted.join(', ')}`
  );
}

console.log(`Built dist/ from ${copied} whitelisted entries.`);
if (skipped.length) {
  console.log(`Skipped (not present yet): ${skipped.join(', ')}`);
}
