
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAllFiles(dir, exts = ['.ts','.tsx','.js','.jsx'], ignore = ['node_modules', '.expo', 'dist', '.git']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    if (ignore.some(i => full.includes(i))) return;
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts, ignore));
    } else {
      if (exts.includes(path.extname(file))) results.push(full);
    }
  });
  return results;
}

function scanImports(files) {
  const importMap = new Set();
  const importRegex = /from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let m;
      while ((m = importRegex.exec(content)) !== null) {
        const p = m[1] || m[2] || m[3];
        if (p) importMap.add(p);
      }
    } catch {}
  });
  return importMap;
}

function check(root = '.') {
  const absRoot = path.resolve(root);
  const allFiles = getAllFiles(absRoot);
  const imports = scanImports(allFiles);

  const entryPatterns = ['app/', '_layout', 'index', '+html', 'babel.config', 'metro.config', 'app.config'];
  const safePatterns = ['types', 'theme', 'colors', 'constants'];

  const unused = [];

  allFiles.forEach(file => {
    const rel = path.relative(absRoot, file);
    const baseName = path.basename(file, path.extname(file));
    const isEntry = entryPatterns.some(p => rel.includes(p));
    const isSafe = safePatterns.some(p => rel.includes(p));

    if (isEntry || isSafe) return;

    const isImported = [...imports].some(imp => {
      // imp like '../../src/context/AudioContext' or '@/components/X'
      return imp.includes(baseName) || rel.includes(imp) || imp.endsWith(baseName);
    });

    // also check if file is referenced by its path
    const fileNoExt = rel.replace(/\.[^/.]+$/, '');
    const isPathImported = [...imports].some(imp => fileNoExt.endsWith(imp) || imp.endsWith(fileNoExt));

    if (!isImported && !isPathImported) {
      unused.push(rel);
    }
  });

  return { allFiles: allFiles.length, unused, imports: imports.size };
}

module.exports = { check, getAllFiles, scanImports };
