// Assembles the full mynichi.app deploy:
//   apps/web/dist        -> site root (marketing)
//   apps/native/dist     -> site root /app (Expo web export, baseUrl /app)
// Output: dist/ at the repo root (what vercel.json serves).
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const web = join(root, 'apps/web/dist');
const app = join(root, 'apps/native/dist');

for (const [name, dir] of [['apps/web', web], ['apps/native', app]]) {
  if (!existsSync(dir)) {
    console.error(`Missing build output: ${name} (${dir}). Run the builds first.`);
    process.exit(1);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(web, out, { recursive: true });
cpSync(app, join(out, 'app'), { recursive: true });
console.log(`Site assembled at ${out} (marketing at /, app at /app)`);
