/* Pinta en index.html todo lo que sale de datos: la carta (desde data/carta.json),
   las láminas botánicas, los destacados, la tira, las cifras de la versión sobria y
   la flor del hero con el ramillete del logo (assets/logo/marca.json).

   Rellena los bloques entre <!-- construir:NOMBRE --> y <!-- /construir:NOMBRE -->.
   Es idempotente: se puede ejecutar cuantas veces haga falta.

   node scripts/construir.mjs

   Por qué en el HTML y no con fetch() al cargar: la carta se ve sin JavaScript, sin
   servidor (doble clic en index.html) y la leen los buscadores cuando toque indexar.
   Ningún recuento está escrito a mano: todo se cuenta aquí, desde el JSON. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgLamina, LAMINAS, PETALO } from './laminas.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const carta = JSON.parse(fs.readFileSync(path.join(raiz, 'data/carta.json'), 'utf8'));
const notas = JSON.parse(fs.readFileSync(path.join(raiz, 'data/notas-carta.json'), 'utf8'));
const marca = JSON.parse(fs.readFileSync(path.join(raiz, 'assets/logo/marca.json'), 'utf8'));
const archivo = path.join(raiz, 'index.html');
let html = fs.readFileSync(archivo, 'utf8');

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const romano = n => ROMANOS[n - 1];
const romanoMin = n => {
  const v = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]; let s = '';
  for (const [k, r] of v) while (n >= k) { s += r; n -= k; }
  return s;
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const euros = n => n + '&nbsp;€';
const escribir = (n, palabras) => ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'][n] || String(n);

const secciones = carta.secciones;
const todos = secciones.flatMap(s => s.platos);
const conPrecio = todos.filter(p => typeof p.precio === 'number');
const precios = conPrecio.map(p => p.precio);
const HABITAT = { aqui: 'Dehesa extremeña', alla: 'Nicaragua', compartida: 'Cocina de la casa' };

function precioHTML(p) {
  const racion = p.por === 'racion' ? '<small>ración</small>' : '';
  const aviso = p.verificar ? `<span class="por-confirmar" title="Por confirmar: ${esc(p.verificar)}">*</span>` : '';
  if (typeof p.precio !== 'number') return `<span class="precio precio--nulo" data-precio=""><span aria-hidden="true">—</span><span class="visualmente-oculto">precio sin confirmar</span>${aviso}</span>`;
  return `<span class="precio" data-precio="${p.precio}">${euros(p.precio)}${racion}${aviso}</span>`;
}

/* ── la carta: una lámina por sección ── */
function laminas() {
  return secciones.map((s, i) => {
    const n = i + 1;
    const L = LAMINAS[s.id];
    const lista = s.platos.map((p, k) => {
      const nota = notas[p.nombre];
      return `<li class="especimen"${p.verificar ? ' data-verificar' : ''}>
          <span class="especimen__num">${romanoMin(k + 1)}.</span>
          <span class="especimen__nombre">${esc(p.nombre)}${nota ? `<em class="especimen__nota" data-revisar>${esc(nota)}<sup aria-hidden="true">‡</sup></em>` : ''}</span>
          ${precioHTML(p)}
        </li>`;
    }).join('\n        ');
    const precs = s.platos.filter(p => typeof p.precio === 'number').map(p => p.precio);
    const rango = precs.length ? (Math.min(...precs) === Math.max(...precs) ? euros(Math.min(...precs)) : `${euros(Math.min(...precs))} a ${euros(Math.max(...precs))}`) : 'sin precios confirmados';
    const racion = s.platos.filter(p => p.por === 'racion').length;
    const todosNulos = !precs.length;
    return `<article class="lamina" id="lamina-${s.id}" data-lamina="${n}" aria-labelledby="lamina-${s.id}-titulo">
      <div class="lamina__cabeza">
        <p class="lamina__num">Lámina ${romano(n)}</p>
        <h3 class="lamina__titulo" id="lamina-${s.id}-titulo" data-num="Lámina ${romano(n)}">${esc(s.titulo)}</h3>
        <p class="lamina__especie"><i>${esc(L.especie)}</i> · ${esc(L.comun)}</p>
        <div class="lamina__dibujo" aria-hidden="false">${svgLamina(s.id)}</div>
        <dl class="lamina__datos">
          <div><dt>Especímenes</dt><dd>${s.platos.length}</dd></div>
          <div><dt>Precios</dt><dd>${rango}</dd></div>
          ${racion ? `<div><dt>Por ración</dt><dd>${racion}</dd></div>` : ''}
        </dl>
        <p class="lamina__etiqueta"><span>Herbario Raíces · Zafra</span><span>Lám. ${romano(n)} · ${s.platos.length} esp.</span></p>
      </div>
      <div class="lamina__cuerpo">
        ${s.nota && !/logos|marca/i.test(s.nota) ? `<p class="lamina__nota">${esc(s.nota)}</p>` : ''}
        ${todosNulos ? '<p class="lamina__nota">Precios <span class="pendiente">[PENDIENTE]</span>: por confirmar con la casa.</p>' : ''}
        <ol class="lamina__lista">
        ${lista}
        </ol>
      </div>
    </article>`;
  }).join('\n    ');
}

/* ── los más pedidos: los tres destacados, como especímenes con ficha ── */
function destacados() {
  return carta.destacados.map((nombre, i) => {
    const s = secciones.find(sec => sec.platos.some(p => p.nombre === nombre));
    const p = s.platos.find(x => x.nombre === nombre);
    const n = secciones.indexOf(s) + 1;
    const k = s.platos.indexOf(p) + 1;
    const precio = typeof p.precio === 'number' ? euros(p.precio) + (p.por === 'racion' ? ' · ración' : '') : '<span class="pendiente">[PENDIENTE]</span>';
    return `<li class="ficha" style="--giro:${[-1.6, 1.1, -0.6][i]}deg">
        <p class="ficha__num">Espécimen nº ${String(i + 1).padStart(2, '0')}</p>
        <h3 class="ficha__nombre">${esc(p.nombre)}</h3>
        <dl class="ficha__datos">
          <div><dt>Lámina</dt><dd>${romano(n)} · ${esc(s.titulo)}, ${romanoMin(k)}.</dd></div>
          <div><dt>Hábitat</dt><dd>${HABITAT[p.orilla] || '—'}</dd></div>
          <div><dt>Precio</dt><dd>${precio}</dd></div>
        </dl>
        <svg class="ficha__sello" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="ficha-circulo-${i}" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs>
          <circle cx="60" cy="60" r="56" /><circle cx="60" cy="60" r="33"/>
          <text><textPath href="#ficha-circulo-${i}">HERBARIO RAÍCES · ZAFRA · MÁS PEDIDO ·</textPath></text>
          <text class="ficha__sello-num" x="60" y="70" text-anchor="middle">${String(i + 1).padStart(2, '0')}</text></svg>
      </li>`;
  }).join('\n      ');
}

/* ── tira de nombres entre la casa y la carta ── */
function tira() {
  return todos.map(p => `<span>${esc(p.nombre)}</span><svg class="tira__flor" viewBox="0 0 160 160" aria-hidden="true"><use href="#petalos"/></svg>`).join('');
}

/* ── versión sobria: la carta en cifras (precio de cada plato, por lámina) ── */
function cifras() {
  const W = 640, fila = 46, x0 = 150, x1 = 590, max = 16;
  const X = v => x0 + (x1 - x0) * v / max;
  let g = '';
  for (let v = 0; v <= max; v += 4) g += `<line class="cifras__rejilla" x1="${X(v)}" x2="${X(v)}" y1="18" y2="${18 + fila * secciones.length}"/><text class="cifras__eje" x="${X(v)}" y="${30 + fila * secciones.length}" text-anchor="middle">${v} €</text>`;
  secciones.forEach((s, i) => {
    const y = 18 + fila * i + fila / 2;
    const ps = s.platos.filter(p => typeof p.precio === 'number').map(p => p.precio);
    g += `<text class="cifras__rotulo" x="0" y="${y + 5}">${romano(i + 1)} · ${esc(s.titulo)}</text>`;
    if (!ps.length) { g += `<text class="cifras__vacio" x="${x0}" y="${y + 5}">sin precios confirmados (${s.platos.length})</text>`; return; }
    g += `<line class="cifras__rango" x1="${X(Math.min(...ps))}" x2="${X(Math.max(...ps))}" y1="${y}" y2="${y}"/>`;
    const vistos = {};
    ps.forEach(v => { vistos[v] = (vistos[v] || 0) + 1; const dy = (vistos[v] - 1) * 5 * (vistos[v] % 2 ? 1 : -1); g += `<circle class="cifras__punto" cx="${X(v)}" cy="${y + dy}" r="4"/>`; });
  });
  const tabla = secciones.map((s, i) => {
    const ps = s.platos.filter(p => typeof p.precio === 'number').map(p => p.precio);
    return `<tr><th scope="row">${romano(i + 1)} · ${esc(s.titulo)}</th><td>${s.platos.length}</td><td>${ps.length ? euros(Math.min(...ps)) : '—'}</td><td>${ps.length ? euros(Math.max(...ps)) : '—'}</td></tr>`;
  }).join('');
  return `<figure class="cifras" data-solo-sobria>
      <figcaption class="cifras__titulo">La carta en cifras: el precio de cada plato, lámina a lámina</figcaption>
      <svg viewBox="0 0 ${W} ${fila * secciones.length + 40}" role="img" aria-label="Precios de ${conPrecio.length} de los ${todos.length} platos, de ${euros(Math.min(...precios)).replace('&nbsp;', ' ')} a ${euros(Math.max(...precios)).replace('&nbsp;', ' ')}">${g}</svg>
      <table class="cifras__tabla"><thead><tr><th scope="col">Lámina</th><th scope="col">Platos</th><th scope="col">Desde</th><th scope="col">Hasta</th></tr></thead><tbody>${tabla}</tbody></table>
    </figure>`;
}

/* ── la flor del hero: ramillete del logo + cinco pétalos + aro + yema ── */
function florHero() {
  const [cx, cy] = marca.aroCentro;
  const ramillete = marca.ramillete.map(t => `<path class="rm" pathLength="1" d="${t.d}" data-largo="${t.largo}"/>`).join('');
  const petalos = [0, 1, 2, 3, 4].map(i => `<g transform="rotate(${i * 72})"><path class="pt" pathLength="1" d="${PETALO}"/><path class="pt-pliegue" pathLength="1" d="M5 -10C18 -44 34 -78 46 -112"/></g>`).join('');
  return `<svg class="flor-hero__svg" viewBox="0 0 500 500" aria-hidden="true">
          <path class="aro" pathLength="1" d="${marca.aro}"/>
          <g class="ramillete">${ramillete}</g>
          <g class="petalos" transform="translate(${cx} ${cy}) scale(1.22) rotate(-14)">${petalos}</g>
          <circle class="yema" cx="${cx}" cy="${cy}" r="19"/>
          <circle class="yema-brillo" cx="${cx - 5}" cy="${cy - 6}" r="5"/>
        </svg>`;
}

/* ── sprite del sello, para cabecera y pie ── */
function sprite() {
  const sello = fs.readFileSync(path.join(raiz, 'assets/logo/raices-sello.svg'), 'utf8')
    .replace(/^[\s\S]*?<title>[^<]*<\/title>/, '').replace(/<\/svg>\s*$/, '');
  return `<symbol id="sello" viewBox="0 0 500 500">${sello}</symbol>
  <symbol id="petalos" viewBox="-80 -80 160 160"><g transform="scale(.46) rotate(-14)">${[0, 1, 2, 3, 4].map(i => `<path transform="rotate(${i * 72})" d="${PETALO}"/>`).join('')}</g></symbol>`;
}

const bloques = {
  sprite: sprite(),
  'flor-hero': florHero(),
  tira: tira(),
  laminas: laminas(),
  cifras: cifras(),
  destacados: destacados(),
  'n-platos': String(todos.length),
  'n-laminas': escribir(secciones.length),
  'precio-min': String(Math.min(...precios)),
  'precio-max': String(Math.max(...precios)),
  alergenos: esc(carta.alergenos)
};

let faltan = [];
for (const [nombre, contenido] of Object.entries(bloques)) {
  const re = new RegExp(`(<!-- construir:${nombre} -->)[\\s\\S]*?(<!-- /construir:${nombre} -->)`, 'g');
  if (!re.test(html)) { faltan.push(nombre); continue; }
  html = html.replace(re, (_, a, b) => a + contenido + b);
}
fs.writeFileSync(archivo, html);
console.log('index.html construido:', secciones.length, 'láminas,', todos.length, 'platos,', carta.destacados.length, 'destacados.');
if (faltan.length) { console.log('Sin marcador en index.html:', faltan.join(', ')); process.exitCode = 1; }
