/**
 * Charge .env.local puis exécute `npx cap sync` (CAPACITOR_SERVER_URL).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key] || key === 'CAPACITOR_SERVER_URL') process.env[key] = val;
  }
}

if (process.env.CAPACITOR_SERVER_URL) {
  console.log(`[cap-sync] CAPACITOR_SERVER_URL=${process.env.CAPACITOR_SERVER_URL}`);
} else {
  console.warn('[cap-sync] CAPACITOR_SERVER_URL absent — voir .env.local');
}

const result = spawnSync('npx', ['cap', 'sync'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
