/* Verificación de la maqueta Raíces · «Sacuanjoche» (DATOS-RAICES.md, «Verificación común»).
   Levanta un servidor estático, abre el sitio con Playwright (scroll con mouse.wheel, que es lo
   que mueve a Lenis y a ScrollTrigger) y comprueba las trampas conocidas.

   node scripts/verificar.mjs             (todo)
   node scripts/verificar.mjs --capturas  (además guarda screenshots/: 1440 y 390, dos densidades)
*/
import { chromium } from 'file:///C:/Users/alvar/Desktop/WEBS%20NEGOCIOS/alvarotaiagu.github.io/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conCapturas = process.argv.includes('--capturas');
const AXE = path.resolve(raiz, '../subcon-works-web/node_modules/axe-core/axe.min.js');
const carta = JSON.parse(fs.readFileSync(path.join(raiz, 'data/carta.json'), 'utf8'));
if (conCapturas) fs.mkdirSync(path.join(raiz, 'screenshots'), { recursive: true });
const foto = n => path.join(raiz, 'screenshots', n);
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };

const servidor = http.createServer((req, res) => {
  const limpia = decodeURIComponent(req.url.split('?')[0]);
  const destino = path.join(raiz, limpia === '/' ? 'index.html' : limpia);
  if (!destino.startsWith(raiz)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(destino) || fs.statSync(destino).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(raiz, '404.html')));
    return;
  }
  res.writeHead(200, { 'content-type': tipos[path.extname(destino)] || 'application/octet-stream' });
  res.end(fs.readFileSync(destino));
});

const fallos = [], notas = [];
function comprobar(ok, mensaje) { (ok ? notas : fallos).push((ok ? 'OK    ' : 'FALLA ') + '· ' + mensaje); }

async function rueda(page, vueltas, paso = 700, espera = 220) {
  for (let i = 0; i < vueltas; i++) { await page.mouse.wheel(0, paso); await page.waitForTimeout(espera); }
  await page.waitForTimeout(1600);
}
/* baja con la rueda hasta que el elemento asoma arriba; lleva la cuenta de lo despachado */
async function hasta(page, selector, margen = 0) {
  for (let i = 0; i < 90; i++) {
    const top = await page.evaluate(s => document.querySelector(s).getBoundingClientRect().top, selector);
    if (top <= 90 + margen && top > -40) break;
    const paso = top > 0 ? Math.min(700, Math.max(120, top - 60)) : Math.max(-700, top - 80);
    await page.mouse.wheel(0, paso);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1700);
}

async function nuevaPagina(navegador, op = {}) {
  const contexto = await navegador.newContext({
    viewport: op.viewport || { width: 1440, height: 900 },
    reducedMotion: op.reducedMotion || 'no-preference',
    hasTouch: !!op.tactil, isMobile: !!op.tactil, deviceScaleFactor: 1
  });
  if (op.sinCookies) await contexto.addInitScript(() => { try { localStorage.setItem('raices-sac-cookies', 'ok'); } catch (e) {} });
  if (op.densidad) await contexto.addInitScript(d => { try { localStorage.setItem('raices-sac-densidad', d); } catch (e) {} }, op.densidad);
  if (op.hora) await contexto.clock.install({ time: new Date(op.hora) });
  const page = await contexto.newPage();
  const errores = [], caidas = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('requestfailed', r => caidas.push(r.url() + ' → ' + (r.failure()?.errorText || '')));
  page.on('response', r => { if (r.status() >= 400) caidas.push(r.status() + ' ' + r.url()); });
  return { contexto, page, errores, caidas };
}

const SECCIONES = [['#inicio', 'hero'], ['#casa', 'casa'], ['.tira', 'tira'], ['#carta', 'carta'], ['#lamina-entrantes', 'lamina-1'], ['#lamina-carnes', 'lamina-2'],
  ['#lamina-pescado', 'lamina-3'], ['#lamina-postres', 'lamina-4'], ['#lamina-bebidas', 'lamina-5'], ['#pedidos', 'pedidos'], ['#resenas', 'resenas'], ['#donde', 'donde'], ['.pie', 'pie']];

async function capturarSecciones(page, prefijo) {
  if (!conCapturas) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: foto(prefijo + '-01-hero.png') });
  let n = 1;
  for (const [sel, nombre] of SECCIONES.slice(1)) {
    await hasta(page, sel, sel.startsWith('#lamina') ? 60 : 0);
    if (sel.startsWith('#lamina')) await rueda(page, 1, 260, 200);
    await page.screenshot({ path: foto(`${prefijo}-${String(++n).padStart(2, '0')}-${nombre}.png`) });
  }
}

async function axeContraste(page) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
    return r.violations.flatMap(v => v.nodes.map(n => n.target.join(' ') + ' → ' + (n.any[0]?.message || '')));
  });
}

const base = 'http://127.0.0.1:4291';
await new Promise(r => servidor.listen(4291, '127.0.0.1', r));
const navegador = await chromium.launch();

try {
  /* ───── 1. escritorio, pasada normal ───── */
  {
    const { contexto, page, errores, caidas } = await nuevaPagina(navegador);
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    const tapa = await page.evaluate(() => getComputedStyle(document.getElementById('cortina')).display);
    comprobar(tapa === 'block', 'la cortina tapa al cargar → ' + tapa);
    await page.waitForTimeout(700);
    if (conCapturas) await page.screenshot({ path: foto('00a-cortina-flor.png') });
    /* fotograma intermedio: la única forma de ver que la flor se abre de verdad */
    let abierta = false;
    for (let i = 0; i < 40 && !abierta; i++) {
      const s = await page.evaluate(() => {
        const t = document.getElementById('cortina-hueco').getAttribute('transform') || '';
        const m = t.match(/scale\(([\d.]+)\)/);
        return { esc: m ? +m[1] : 0, display: getComputedStyle(document.getElementById('cortina')).display };
      });
      if (s.display !== 'none' && s.esc > 2.5) { abierta = true; if (conCapturas) await page.screenshot({ path: foto('00b-cortina-abriendose.png') }); }
      else await page.waitForTimeout(90);
    }
    comprobar(abierta, 'la cortina se ve abrirse en flor (el hueco crece) antes de irse');
    await page.waitForTimeout(2600);
    comprobar(await page.evaluate(() => getComputedStyle(document.getElementById('cortina')).display) === 'none', 'la cortina acaba en display:none (pasada normal)');
    comprobar(await page.evaluate(() => sessionStorage.getItem('raices-sac-cortina')) === '1', 'la cortina queda marcada como vista en la sesión');

    await page.waitForTimeout(2600);
    const hero = await page.evaluate(() => {
      const f = document.getElementById('flor-hero');
      const offs = [...f.querySelectorAll('.rm, .pt, .aro')].map(p => parseFloat(getComputedStyle(p).strokeDashoffset) || 0);
      const yema = document.querySelector('.flor-hero .yema').getBoundingClientRect().width;
      const letras = [...document.querySelectorAll('.hero__titulo .letra')].map(l => getComputedStyle(l).transform);
      return { sinDibujar: offs.filter(o => Math.abs(o) > 0.01).length, trazos: offs.length, yema, letras: letras.length, quietas: letras.every(t => t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t)), titulo: document.querySelector('.hero__titulo').getAttribute('aria-label') };
    });
    comprobar(hero.trazos > 15 && hero.sinDibujar === 0, `hero: ramillete, pétalos y aro dibujados enteros (${hero.trazos} trazos, ${hero.sinDibujar} sin acabar)`);
    comprobar(hero.yema > 20, 'hero: la yema ha caído (' + hero.yema.toFixed(1) + ' px)');
    comprobar(hero.letras === 6 && hero.quietas && hero.titulo === 'Raíces', 'hero: «Raíces» entra letra a letra y queda en su sitio');
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    comprobar(desborda <= 1, 'sin desbordamiento horizontal en escritorio (' + desborda + ' px)');
    const estadoTexto = await page.evaluate(() => ({ dom: document.querySelector('.estado--grande [data-estado-texto]').textContent, calc: window.RaicesHorario.estado(new Date()).texto }));
    comprobar(estadoTexto.dom.startsWith(estadoTexto.calc.split(' · ')[0]), 'estado en vivo pintado → «' + estadoTexto.dom + '»');

    /* polen: al mover el ratón quedan granos en el lienzo; los sprites son 3 y fijos */
    await page.mouse.move(300, 400);
    for (let i = 0; i < 12; i++) { await page.mouse.move(300 + i * 30, 400 + i * 8); await page.waitForTimeout(16); }
    const polen = await page.evaluate(() => {
      const c = document.getElementById('polen');
      if (!c) return -1;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      return n;
    });
    comprobar(polen > 50, 'firma: el cursor deja polen en el lienzo (' + polen + ' px con alfa)');
    await page.waitForTimeout(1900);
    const polenIdo = await page.evaluate(() => {
      const c = document.getElementById('polen');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      return n;
    });
    comprobar(polenIdo === 0, 'firma: el polen se desvanece y el bucle se para (' + polenIdo + ' px)');

    /* tareas largas: huecos entre fotogramas, medidos desde fonts.ready, durante el scroll */
    await page.evaluate(() => document.fonts.ready.then(() => {
      window.__huecos = []; let ant = performance.now();
      (function f(t) { window.__huecos.push(t - ant); ant = t; if (window.__huecos.length < 100000) requestAnimationFrame(f); })(ant);
    }));
    await page.mouse.move(720, 450);
    await rueda(page, 3, 500, 160);
    const flor = await page.evaluate(() => ({
      svg: +getComputedStyle(document.querySelector('.flor-hero__svg')).opacity,
      difusa: +getComputedStyle(document.getElementById('flor-difusa')).opacity,
      lado: document.getElementById('flor-difusa').width,
      giro: (() => { const m = getComputedStyle(document.getElementById('flor-hero')).transform.match(/matrix\(([-\d.e]+), ([-\d.e]+)/); return m ? Math.round(Math.atan2(+m[2], +m[1]) * 180 / Math.PI) : 0; })()
    }));
    comprobar(flor.lado === 200 && flor.difusa > 0.25 && flor.svg < 0.5 && flor.giro > 8, 'al bajar, la flor gira y se va al fondo desenfocada (sprite precacheado de ' + flor.lado + ' px) → ' + JSON.stringify(flor));
    if (conCapturas) await page.screenshot({ path: foto('02b-flor-al-fondo.png') });

    await rueda(page, 8, 500, 140);
    await page.waitForTimeout(800);
    const huecos = await page.evaluate(() => { const h = window.__huecos.slice(2); return { n: h.length, largos: h.filter(x => x > 50).length, peor: Math.round(Math.max(...h)) }; });
    comprobar(huecos.largos <= 3, `rendimiento desde fonts.ready: ${huecos.largos} huecos > 50 ms en ${huecos.n} fotogramas (peor ${huecos.peor} ms)`);

    for (const [sel] of SECCIONES.slice(4, 9)) await hasta(page, sel, 60);
    await page.waitForTimeout(2500);
    const laminas = await page.evaluate(() => [...document.querySelectorAll('.lamina')].map(l => {
      const tr = [...l.querySelectorAll('.ilus .tr')];
      return tr.filter(p => Math.abs(parseFloat(getComputedStyle(p).strokeDashoffset) || 0) > 0.01 || +getComputedStyle(p).opacity < 0.5).length + '/' + tr.length;
    }));
    comprobar(laminas.every(x => x.startsWith('0/')), 'las cinco láminas han dibujado su planta al entrar (sin acabar/total: ' + laminas.join(', ') + ')');

    /* la carta, contra el JSON: ni un plato de más ni un precio inventado */
    const dom = await page.evaluate(() => [...document.querySelectorAll('.lamina')].map(l => ({
      titulo: l.querySelector('.lamina__titulo').textContent.trim(),
      platos: [...l.querySelectorAll('.especimen')].map(e => ({ nombre: e.querySelector('.especimen__nombre').childNodes[0].textContent.trim(), precio: e.querySelector('.precio').dataset.precio, racion: !!e.querySelector('.precio small'), verificar: e.hasAttribute('data-verificar') }))
    })));
    let malos = [];
    carta.secciones.forEach((s, i) => {
      if (!dom[i] || dom[i].titulo !== s.titulo) malos.push('lámina ' + (i + 1));
      s.platos.forEach((p, k) => {
        const d = dom[i]?.platos[k];
        const precio = typeof p.precio === 'number' ? String(p.precio) : '';
        if (!d || d.nombre !== p.nombre || d.precio !== precio || d.racion !== (p.por === 'racion') || d.verificar !== !!p.verificar) malos.push(p.nombre + ' ' + JSON.stringify(d));
      });
      if (dom[i] && dom[i].platos.length !== s.platos.length) malos.push('recuento de ' + s.titulo);
    });
    comprobar(malos.length === 0, 'carta = data/carta.json: ' + carta.secciones.reduce((a, s) => a + s.platos.length, 0) + ' platos con su nombre, precio, ración y aviso' + (malos.length ? ' → ' + malos.join(' | ') : ''));
    const dest = await page.$$eval('.ficha__nombre', ns => ns.map(n => n.textContent.trim()));
    comprobar(JSON.stringify(dest) === JSON.stringify(carta.destacados), 'los más pedidos son los destacados del JSON → ' + dest.join(', '));

    await hasta(page, '#resenas');
    await page.waitForTimeout(2200);
    const cifras = await page.$$eval('[data-contador]', ns => ns.map(n => n.textContent.trim()));
    comprobar(cifras.join('/') === '4,8/49', 'reseñas: 4,8 y 49 con su valor final → ' + cifras.join('/'));
    const enlaceGoogle = await page.$eval('.resenas .boton', a => a.href);
    comprobar(/google\.com\/maps/.test(enlaceGoogle), 'reseñas: enlace a Google');

    const cookies = await page.evaluate(() => ({ oculto: document.getElementById('cookies').hidden, display: getComputedStyle(document.getElementById('cookies')).display }));
    comprobar(!cookies.oculto && cookies.display === 'flex', 'el aviso de cookies se ve al entrar');
    await page.click('#cookies-aceptar');
    await page.waitForTimeout(300);
    comprobar(await page.evaluate(() => getComputedStyle(document.getElementById('cookies')).display) === 'none', 'el botón de cookies lo cierra de verdad ([hidden] gana a display:flex)');

    await hasta(page, '#donde');
    const iframesAntes = await page.$$eval('iframe', n => n.length);
    await page.click('#mapa-boton');
    await page.waitForTimeout(700);
    const iframesDespues = await page.$$eval('iframe', n => n.length);
    comprobar(iframesAntes === 0 && iframesDespues === 1, 'el iframe del mapa no existe hasta el clic (' + iframesAntes + ' → ' + iframesDespues + ')');
    const src = await page.$eval('iframe', f => f.src);
    comprobar(/google\.com\/maps\?q=.*output=embed/.test(src) && !/key=/.test(src), 'mapa sin clave de API (maps?q=…&output=embed)');

    const contraste = await axeContraste(page);
    comprobar(contraste.length === 0, 'axe (Sacuanjoche, 1440): sin fallos de contraste' + (contraste.length ? ' → ' + contraste.join(' | ') : ''));
    comprobar(errores.length === 0, 'consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    const caidasReales = caidas.filter(c => !/google\.com\/maps|gstatic|googleapis\.com\/maps|maps\.google|favicon\.ico/.test(c));
    comprobar(caidasReales.length === 0, 'sin peticiones caídas' + (caidasReales.length ? ' → ' + caidasReales.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 2. las dos densidades, en escritorio, con capturas por sección ───── */
  for (const densidad of ['sacuanjoche', 'sobria']) {
    const { contexto, page, errores } = await nuevaPagina(navegador, { sinCookies: true, densidad });
    await page.goto(base + '/index.html?revision', { waitUntil: 'networkidle' });
    await page.waitForTimeout(densidad === 'sacuanjoche' ? 5200 : 4600);
    await page.mouse.move(720, 450);
    if (densidad === 'sobria') {
      const s = await page.evaluate(() => ({
        clase: document.documentElement.className.includes('densidad-sobria'),
        dibujo: getComputedStyle(document.querySelector('.lamina__dibujo')).display,
        datos: getComputedStyle(document.querySelector('.lamina__datos')).display,
        cifras: getComputedStyle(document.querySelector('.cifras')).display,
        casa: getComputedStyle(document.querySelector('.casa__cifras')).display,
        franjas: document.querySelectorAll('#franjas .franja').length,
        franjasVis: getComputedStyle(document.querySelector('.franjas')).display,
        pista: getComputedStyle(document.querySelector('.tira__pista')).display,
        horas: document.querySelector('[data-horas-semana]').textContent,
        pulsado: document.querySelector('[data-densidad="sobria"]').getAttribute('aria-pressed'),
        hero: getComputedStyle(document.querySelector('.flor-hero__svg')).display
      }));
      comprobar(s.clase && s.pulsado === 'true', 'sobria: la densidad elegida se aplica al cargar, sin parpadeo, y el botón queda pulsado');
      comprobar(s.dibujo === 'none' && s.datos === 'grid', 'sobria: cada lámina cambia el dibujo por sus datos (especímenes, precios)');
      comprobar(s.cifras === 'block' && s.casa === 'grid' && s.franjasVis === 'block' && s.franjas === 7, 'sobria: añade lo que la cargada no tiene (carta en cifras, casa en cifras, semana en horas)');
      comprobar(s.horas === '31,5', 'sobria: las horas de la semana salen de los turnos (' + s.horas + ' h)');
      comprobar(s.pista === 'none' && s.hero !== 'none', 'sobria: la flor se queda solo en el hero; la tira pasa a una línea de datos');
      for (let i = 0; i < 12; i++) { await page.mouse.move(300 + i * 30, 400 + i * 8); await page.waitForTimeout(16); }
      const polen = await page.evaluate(() => { const c = document.getElementById('polen'); if (!c) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; return n; });
      comprobar(polen === 0, 'sobria: sin rastro de polen');
    }
    await capturarSecciones(page, '1440-' + densidad);
    for (const [sel] of SECCIONES) await hasta(page, sel);
    const contraste = await axeContraste(page);
    comprobar(contraste.length === 0, `axe (${densidad}, 1440): sin fallos de contraste` + (contraste.length ? ' → ' + contraste.join(' | ') : ''));
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    comprobar(desborda <= 1, `${densidad}: sin desbordamiento horizontal (${desborda} px)`);
    comprobar(errores.length === 0, `${densidad}: consola sin errores` + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }
  {
    /* el mando cambia en vivo y se puede volver */
    const { contexto, page } = await nuevaPagina(navegador, { sinCookies: true });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    /* el enlace que recibe el cliente sale limpio: sin ?revision no hay mando */
    const sinRevision = await page.evaluate(() => ({ oculto: document.getElementById('mando').hidden, display: getComputedStyle(document.getElementById('mando')).display }));
    comprobar(sinRevision.oculto && sinRevision.display === 'none', 'sin ?revision el mando no se ve → ' + JSON.stringify(sinRevision));
    await page.goto(base + '/index.html?revision', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    comprobar(await page.evaluate(() => !document.getElementById('mando').hidden), 'el mando de maqueta aparece (lo enseña el JS)');
    await page.click('[data-densidad="sobria"]');
    await page.waitForTimeout(500);
    const ida = await page.evaluate(() => getComputedStyle(document.querySelector('.lamina__dibujo')).display);
    await page.click('[data-densidad="sacuanjoche"]');
    await page.waitForTimeout(500);
    const vuelta = await page.evaluate(() => getComputedStyle(document.querySelector('.lamina__dibujo')).display);
    comprobar(ida === 'none' && vuelta === 'block', 'el mando cambia en vivo entre Sacuanjoche y Sobria, ida y vuelta');
    await contexto.close();
  }

  /* ───── 3. móvil (táctil) ───── */
  for (const densidad of ['sacuanjoche', 'sobria']) {
    const { contexto, page, errores } = await nuevaPagina(navegador, { viewport: { width: 390, height: 844 }, tactil: true, densidad });
    await page.goto(base + '/index.html?revision', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    const ancho = await page.evaluate(() => ({ w: window.innerWidth, s: document.documentElement.scrollWidth }));
    comprobar(ancho.w === 390 && ancho.s - ancho.w <= 1, `móvil ${densidad}: el viewport no se ensancha (${JSON.stringify(ancho)})`);
    if (densidad === 'sacuanjoche') {
      comprobar(await page.evaluate(() => !document.getElementById('polen')), 'móvil: en táctil no hay lienzo de polen');
      const apartado = await page.evaluate(() => getComputedStyle(document.getElementById('mando')).visibility === 'hidden');
      comprobar(apartado, 'móvil: el mando se aparta mientras el aviso de cookies está en pantalla');
      await page.click('#cookies-aceptar');
      await page.waitForTimeout(500);
      comprobar(await page.evaluate(() => getComputedStyle(document.getElementById('mando')).visibility !== 'hidden'), 'móvil: el mando vuelve al cerrar el aviso');
      await page.click('#hamburguesa');
      await page.waitForTimeout(900);
      const menu = await page.evaluate(() => ({ exp: document.getElementById('hamburguesa').getAttribute('aria-expanded'), alto: Math.round(document.getElementById('menu').getBoundingClientRect().height), top: Math.round(document.getElementById('menu').getBoundingClientRect().top) }));
      comprobar(menu.exp === 'true' && menu.alto >= 800 && menu.top === 0, 'móvil: el menú abre a pantalla completa → ' + JSON.stringify(menu));
      if (conCapturas) await page.screenshot({ path: foto('390-menu.png') });
      await page.click('#hamburguesa');
      await page.waitForTimeout(900);
      comprobar(await page.evaluate(() => document.getElementById('hamburguesa').getAttribute('aria-expanded')) === 'false', 'móvil: el mismo botón cierra el menú');
      await hasta(page, '#lamina-carnes', 40);
      await rueda(page, 2, 300, 200);
      const pega = await page.evaluate(() => { const t = document.querySelector('#lamina-carnes .lamina__titulo'); return { top: Math.round(t.getBoundingClientRect().top), cab: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cab')), antes: getComputedStyle(t, '::before').content }; });
      comprobar(Math.abs(pega.top - pega.cab) <= 2 && /Lámina II/.test(pega.antes), 'móvil: el título de la lámina va pegado bajo la cabecera, con su número → ' + JSON.stringify(pega));
    } else {
      await page.click('#cookies-aceptar').catch(() => {});
    }
    await capturarSecciones(page, '390-' + densidad);
    await page.waitForTimeout(700);
    const contraste = await axeContraste(page);
    comprobar(contraste.length === 0, `axe (${densidad}, 390): sin fallos de contraste` + (contraste.length ? ' → ' + contraste.join(' | ') : ''));
    comprobar(errores.length === 0, `móvil ${densidad}: consola sin errores` + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 4. sin GSAP (CDN caído) ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador);
    await page.route('**/cdn.jsdelivr.net/**', r => r.abort());
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);
    const e = await page.evaluate(() => ({
      cortina: getComputedStyle(document.getElementById('cortina')).display,
      mov: document.documentElement.classList.contains('con-movimiento'),
      sinGsap: document.documentElement.classList.contains('sin-gsap'),
      trazos: [...document.querySelectorAll('.flor-hero .rm, .ilus .tr')].filter(p => +getComputedStyle(p).opacity < 0.5).length,
      titulo: getComputedStyle(document.querySelector('.hero__titulo')).visibility,
      estado: document.querySelector('.estado--grande [data-estado-texto]').textContent
    }));
    comprobar(e.cortina === 'none', 'sin GSAP: la cortina se retira igual → ' + e.cortina);
    comprobar(!e.mov && e.sinGsap, 'sin GSAP: no se activa con-movimiento y se marca sin-gsap');
    comprobar(e.trazos === 0 && e.titulo === 'visible', 'sin GSAP: la flor, las láminas y los titulares se ven ya dibujados (' + e.trazos + ' trazos apagados)');
    comprobar(/Abierto|Cerrado/.test(e.estado), 'sin GSAP: el estado en vivo sigue funcionando → ' + e.estado);
    const apagados = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, p, li')].filter(n => parseFloat(getComputedStyle(n).opacity) < 0.15 && n.getBoundingClientRect().height > 0).map(n => n.className || n.tagName));
    comprobar(apagados.length === 0, 'sin GSAP: ningún texto queda apagado' + (apagados.length ? ' → ' + apagados.join(',') : ''));
    if (conCapturas) await page.screenshot({ path: foto('40-sin-gsap.png') });
    const propios = errores.filter(x => !/Failed to load resource|ERR_FAILED/.test(x));
    comprobar(propios.length === 0, 'sin GSAP: consola sin errores propios' + (propios.length ? ' → ' + propios.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 5. movimiento reducido ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador, { reducedMotion: 'reduce' });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const e = await page.evaluate(() => ({
      cortina: getComputedStyle(document.getElementById('cortina')).display,
      polen: !!document.getElementById('polen'),
      trazos: [...document.querySelectorAll('.flor-hero .rm, .ilus .tr')].filter(p => +getComputedStyle(p).opacity < 0.5).length,
      estado: document.querySelector('.hero__barra [data-estado-texto]').textContent,
      hoy: document.querySelectorAll('.dia--hoy').length
    }));
    comprobar(e.cortina === 'none', 'movimiento reducido: la cortina no llega a verse');
    comprobar(!e.polen, 'movimiento reducido: sin polen');
    comprobar(e.trazos === 0, 'movimiento reducido: todo se ve ya dibujado');
    comprobar(/Abierto|Cerrado/.test(e.estado) && e.hoy === 1, 'movimiento reducido: el estado y el día de hoy siguen vivos → ' + e.estado);
    /* sticky de las láminas, medido sin Lenis: px durante los que el título sigue pegado */
    const recorridos = await page.evaluate(async () => {
      const out = {};
      for (const l of document.querySelectorAll('.lamina')) {
        const cab = l.querySelector('.lamina__cabeza');
        const tope = parseFloat(getComputedStyle(cab).top);
        const y0 = l.getBoundingClientRect().top + scrollY - 400, y1 = y0 + l.offsetHeight + 400;
        let pegada = 0;
        for (let y = y0; y < y1; y += 10) {
          window.scrollTo(0, y);
          await new Promise(r => requestAnimationFrame(() => r()));
          if (Math.abs(cab.getBoundingClientRect().top - tope) <= 1) pegada += 10;
        }
        const lista = l.querySelector('.lamina__lista');
        out[l.id.replace('lamina-', '')] = { pegada, lista: lista.offsetHeight, cabeza: cab.offsetHeight };
      }
      return out;
    });
    const largas = ['entrantes', 'carnes', 'bebidas'];
    comprobar(largas.every(k => recorridos[k].pegada >= 300) && Object.values(recorridos).every(r => r.pegada >= 0),
      'láminas: el título va pegado mientras pasa la lista (px pegado por lámina) → ' + Object.entries(recorridos).map(([k, r]) => k + ' ' + r.pegada).join(', '));
    await page.evaluate(() => document.getElementById('resenas').scrollIntoView());
    await page.waitForTimeout(700);
    const cifras = await page.$$eval('[data-contador]', ns => ns.map(n => n.textContent.trim()));
    comprobar(cifras.join('/') === '4,8/49', 'movimiento reducido: los contadores dan el dato → ' + cifras.join('/'));
    if (conCapturas) await page.screenshot({ path: foto('41-movimiento-reducido.png') });
    comprobar(errores.length === 0, 'movimiento reducido: consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 6. horario en vivo con el reloj simulado (Europe/Madrid) ───── */
  for (const [hora, esperado, nombre] of [
    ['2026-10-03T01:30:00+02:00', /^Abierto/, 'sábado 01:30 → abierto (turno del viernes)'],
    ['2026-10-04T01:30:00+02:00', /^Abierto/, 'domingo 01:30 → abierto (turno del sábado)'],
    ['2026-10-04T23:00:00+02:00', /Volvemos el viernes a las 18:00/, 'domingo 23:00 → «Volvemos el viernes a las 18:00»'],
    ['2026-10-05T00:30:00+02:00', /^Cerrado/, 'lunes 00:30 → cerrado']
  ]) {
    const { contexto, page } = await nuevaPagina(navegador, { hora, reducedMotion: 'reduce' });
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const t = await page.evaluate(() => ({ texto: document.querySelector('.estado--grande [data-estado-texto]').textContent, hoy: document.querySelector('.dia--hoy .dia__nombre')?.textContent }));
    comprobar(esperado.test(t.texto), 'reloj simulado, ' + nombre + ' → «' + t.texto + '» (hoy: ' + t.hoy + ')');
    await contexto.close();
  }

  /* ───── 7. 404, noindex y CDN ───── */
  {
    const { contexto, page } = await nuevaPagina(navegador);
    const resp = await page.goto(base + '/no-existe.html', { waitUntil: 'domcontentloaded' });
    const h1 = await page.textContent('h1');
    comprobar(resp.status() === 404 && /pétalo/.test(h1), '404 propio con el lenguaje del sitio → «' + h1 + '»');
    await contexto.close();
    const paginas = fs.readdirSync(raiz).filter(f => f.endsWith('.html'));
    const sinNoindex = paginas.filter(f => !/<meta charset="utf-8">\s*<meta name="robots" content="noindex, nofollow">/.test(fs.readFileSync(path.join(raiz, f), 'utf8')));
    comprobar(sinNoindex.length === 0, 'noindex, justo tras el charset, en las ' + paginas.length + ' páginas' + (sinNoindex.length ? ' → faltan: ' + sinNoindex.join(', ') : ''));
    const todo = paginas.map(f => fs.readFileSync(path.join(raiz, f), 'utf8')).join('');
    comprobar(!/cdnjs\.cloudflare\.com/.test(todo) && /cdn\.jsdelivr\.net\/npm\/lenis@/.test(todo), 'Lenis (y todo lo demás) desde jsDelivr, nada de cdnjs');
    comprobar(!/instagram\.com/.test(fs.readFileSync(path.join(raiz, 'index.html'), 'utf8')), 'no se enlaza el Instagram @raices_cafe_ (es de otro negocio, ver README)');
  }
} finally {
  await navegador.close();
  servidor.close();
}

console.log('\n' + notas.join('\n'));
if (fallos.length) {
  console.log('\n──────── FALLOS ────────\n' + fallos.join('\n'));
  process.exitCode = 1;
} else {
  console.log('\nTodo en orden: ' + notas.length + ' comprobaciones.');
}
