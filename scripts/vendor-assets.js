const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vendorDirectory = path.join(root, 'js', 'vendor');

const assets = [
  {
    source: 'node_modules/three/build/three.module.min.js',
    destination: 'three-0.185.1.module.min.js',
  },
  {
    source: 'node_modules/three/build/three.core.min.js',
    destination: 'three.core.min.js',
  },
  ...[
    'index.js',
    'gsap-core.js',
    'CSSPlugin.js',
    'Observer.js',
    'ScrollTrigger.js',
  ].map((file) => ({
    source: `node_modules/gsap/${file}`,
    destination: `gsap-3.15.0/${file}`,
  })),
];

fs.mkdirSync(vendorDirectory, { recursive: true });

for (const asset of assets) {
  const source = path.join(root, asset.source);
  const destination = path.join(vendorDirectory, asset.destination);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing vendor source: ${asset.source}. Run npm install first.`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`Prepared ${assets.length} pinned vendor assets.`);