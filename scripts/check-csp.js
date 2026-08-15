const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const globalHeaders = vercelConfig.headers.find(({ source }) => source === '/(.*)')?.headers || [];
const policy = globalHeaders.find(({ key }) => key.toLowerCase() === 'content-security-policy')?.value;

if (!policy) {
  throw new Error('Global Content-Security-Policy header is missing.');
}

const directives = new Map(policy.split(';').map((part) => {
  const [name, ...values] = part.trim().split(/\s+/);
  return [name, new Set(values)];
}));

const scriptSources = directives.get('script-src');
const styleSources = directives.get('style-src-elem') || directives.get('style-src');
const missing = [];
const violations = [];

if (!scriptSources || scriptSources.has("'unsafe-inline'")) {
  violations.push("script-src must exist without 'unsafe-inline'");
}
if (!directives.get('script-src-attr')?.has("'none'")) {
  violations.push("script-src-attr must be 'none'");
}
if (!directives.get('style-src-attr')?.has("'unsafe-inline'")) {
  violations.push("style-src-attr must explicitly allow the runtime style attributes");
}

function hashSource(content) {
  return `'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

const htmlFiles = walk(output).filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const relativeFile = path.relative(root, file);
  const document = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;

  for (const script of document.querySelectorAll('script:not([src])')) {
    const hash = hashSource(script.textContent);
    if (!scriptSources?.has(hash)) missing.push(`${relativeFile}: script ${hash}`);
  }

  for (const style of document.querySelectorAll('style')) {
    const hash = hashSource(style.textContent);
    if (!styleSources?.has(hash)) missing.push(`${relativeFile}: style ${hash}`);
  }

  for (const element of document.querySelectorAll('*')) {
    for (const attribute of element.attributes) {
      if (/^on/i.test(attribute.name)) {
        violations.push(`${relativeFile}: inline event handler ${attribute.name}`);
      }
    }
  }

  for (const element of document.querySelectorAll('[href],[src]')) {
    const value = element.getAttribute('href') || element.getAttribute('src') || '';
    if (/^(?:javascript|data:text\/html):/i.test(value)) {
      violations.push(`${relativeFile}: scriptable URL ${value.slice(0, 40)}`);
    }
  }
}

if (missing.length || violations.length) {
  throw new Error([...violations, ...missing].join('\n'));
}

console.log(`Validated CSP hashes across ${htmlFiles.length} public HTML files.`);
