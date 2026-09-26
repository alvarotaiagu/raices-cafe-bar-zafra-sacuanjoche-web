/* Lee el perfil público de Instagram sin sesión: códigos de posts, bio y alt de la cuadrícula. */
import { chromium } from 'file:///C:/Users/alvar/Desktop/WEBS%20NEGOCIOS/alvarotaiagu.github.io/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const url = 'https://www.instagram.com/raices_cafe_/';
const nav = await chromium.launch();
const ctx = await nav.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', locale: 'es-ES', viewport: { width: 1280, height: 1000 } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'domcontentloaded' });
let botones = 0;
const res = { posts: new Map(), bio: '' };
for (let i = 0; i < 30; i++) {
  await p.waitForTimeout(500);
  for (const t of ['Rechazar cookies opcionales', 'Decline optional cookies']) {
    const b = p.getByRole('button', { name: t });
    if (await b.count().catch(() => 0)) { await b.first().click().catch(() => {}); botones++; }
  }
  const d = await p.evaluate(() => ({
    links: [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map(a => ({ href: a.getAttribute('href'), alt: a.querySelector('img')?.alt || '', src: a.querySelector('img')?.src || '' })),
    txt: document.body.innerText.slice(0, 3000)
  })).catch(() => ({ links: [], txt: '' }));
  for (const l of d.links) if (!res.posts.has(l.href) || l.alt) res.posts.set(l.href, l);
  if (d.txt.length > res.bio.length) res.bio = d.txt;
}
await p.screenshot({ path: process.argv[2] + '/ig-perfil.png' });
const out = { fecha: new Date().toISOString(), bio: res.bio, posts: [...res.posts.values()] };
fs.writeFileSync(process.argv[2] + '/ig-perfil.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2).slice(0, 6000));
await nav.close();
