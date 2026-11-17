const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const apiDir = path.join(rootDir, 'app', 'api');
const stashDir = path.join(rootDir, '..', '..', '.api_stash_tmp');
const nextConfigPath = path.join(rootDir, 'next.config.js');
const nextConfigBak = path.join(rootDir, 'next.config.js.bak');

console.log('Preparing the static export for GitHub Pages');

fs.copyFileSync(nextConfigPath, nextConfigBak);

let cfg = fs.readFileSync(nextConfigPath, 'utf8');
cfg = cfg.replace(
  'reactStrictMode: true,',
  `reactStrictMode: true,
  output: 'export',
  basePath: '/ChainProof',
  images: { unoptimized: true },`
);
fs.writeFileSync(nextConfigPath, cfg);

let stashed = false;
if (fs.existsSync(apiDir)) {
  console.log('Stashing server route handlers');
  if (fs.existsSync(stashDir)) fs.rmSync(stashDir, { recursive: true, force: true });
  fs.cpSync(apiDir, stashDir, { recursive: true });
  fs.rmSync(apiDir, { recursive: true, force: true });
  stashed = true;
}

try {
  console.log('Running next build');
  execSync('npx next build --no-lint', { stdio: 'inherit', cwd: rootDir });

  const outDir = path.join(rootDir, 'out');
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    if (fs.existsSync(path.join(outDir, 'index.html')) && !fs.existsSync(path.join(outDir, '404.html'))) {
      fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'));
    }
  }
  console.log('Static export written to out/');
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exitCode = 1;
} finally {
  if (stashed && fs.existsSync(stashDir)) {
    console.log('Restoring server route handlers');
    fs.cpSync(stashDir, apiDir, { recursive: true });
    fs.rmSync(stashDir, { recursive: true, force: true });
  }
  if (fs.existsSync(nextConfigBak)) {
    fs.copyFileSync(nextConfigBak, nextConfigPath);
    fs.rmSync(nextConfigBak);
  }
  console.log('Done');
}
