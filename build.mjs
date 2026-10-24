import { cp, mkdir, rm } from 'node:fs/promises';

const root = new URL('.', import.meta.url);
const out = new URL('./dist/', root);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'game-core.mjs', 'manifest.webmanifest', 'sw.js', 'favicon.svg']) {
  await cp(new URL(`./${file}`, root), new URL(`./dist/${file}`, root));
}
console.log('Built FAMOUS into dist/');
