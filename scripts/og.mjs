/* Imagen para compartir (1200×630): el sello, la plumeria y el nombre.
   node scripts/og.mjs   (con el servidor de scripts/servir.mjs levantado en el 4290) */
import { chromium } from 'file:///C:/Users/alvar/Desktop/WEBS%20NEGOCIOS/alvarotaiagu.github.io/node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PETALO = 'M0 0C40 -8 92 -52 70 -118C58 -150 14 -150 2 -112C-6 -80 -8 -36 0 0Z';
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@600&family=Zilla+Slab:ital,wght@0,600;1,400&display=swap">
<style>
  body{margin:0;width:1200px;height:630px;background:#0D393C;color:#FCF0CC;font-family:Figtree;display:flex;align-items:center;overflow:hidden;position:relative}
  .flor{position:absolute;right:-60px;top:50%;width:620px;height:620px;transform:translateY(-50%)}
  .flor path{fill:rgba(252,240,204,.05);stroke:#FCF0CC;stroke-width:1.3}
  .flor circle.aro{fill:none;stroke:#FCF0CC;stroke-width:1.2;opacity:.5}
  .flor circle.y{fill:#F2C94C}
  .txt{position:relative;padding-left:84px}
  .sello{width:112px;height:112px}
  h1{font:600 150px/.9 "Zilla Slab";margin:26px 0 0;letter-spacing:-.02em}
  p{font:italic 400 34px/1.2 "Zilla Slab";color:#F2C94C;margin:18px 0 0}
  small{display:block;margin-top:26px;font:600 16px/1 Figtree;letter-spacing:.28em;text-transform:uppercase;color:#C5C5A6}
</style></head><body>
<svg class="flor" viewBox="-250 -250 500 500"><circle class="aro" r="215"/><g transform="scale(1.35) rotate(-14)">${[0, 1, 2, 3, 4].map(i => `<path transform="rotate(${i * 72})" d="${PETALO}"/>`).join('')}</g><circle class="y" r="22"/></svg>
<div class="txt"><img class="sello" src="http://127.0.0.1:4290/assets/logo/raices-sello.svg" alt="">
<h1>Raíces</h1><p>de viernes a domingo, en la Plaza de España</p><small>Café Bar · Zafra</small></div>
</body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(raiz, 'assets/og-raices.jpg'), type: 'jpeg', quality: 86 });
await b.close();
console.log('assets/og-raices.jpg');
