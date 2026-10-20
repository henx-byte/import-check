#!/usr/bin/env node
const { check } = require('./index.js');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
importCheck - Dead file scanner for Expo / React Native
Pure JS, works on Termux + Node 26 (no native binding)

Usage:
  importCheck [path]          Scan folder (default: .)
  importCheck --help          Show this help
  importCheck --version       Show version

Examples:
  importCheck .
  importCheck ./src
  npx github:henx-byte/import-check ./src
  import-check .

Install global from GitHub:
  npm install -g github:henx-byte/import-check

GitHub: https://github.com/henx-byte/import-check
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const pkg = require('./package.json');
  console.log(pkg.version);
  process.exit(0);
}

const root = args[0] && !args[0].startsWith('-') ? args[0] : '.';
console.log(`\n🔍 importCheck scanning: ${path.resolve(root)}\n`);

const { allFiles, unused, imports } = check(root);

console.log(`📦 Total files scanned: ${allFiles}`);
console.log(`🔗 Total import statements: ${imports}\n`);

if (unused.length === 0) {
  console.log('✅ Bersih! Gak ada file yang gak ke-import\n');
} else {
  console.log(`⚠️  Ketemu ${unused.length} file yang kemungkinan gak ke-import (dead code):\n`);
  unused.forEach(f => {
    try {
      const stat = fs.statSync(path.join(root, f));
      const kb = (stat.size / 1024).toFixed(1);
      console.log(`  - ${f} (${kb} KB)`);
    } catch {
      console.log(`  - ${f}`);
    }
  });
  console.log(`\nUntuk cek isi file:  head -20 ${unused[0]}`);
  console.log(`Untuk hapus:         rm ${unused[0]}\n`);
}
