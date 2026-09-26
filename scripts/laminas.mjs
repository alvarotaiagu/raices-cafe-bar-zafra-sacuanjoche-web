/* Las cinco láminas botánicas del herbario, generadas como SVG de trazo.
   Cada trazo lleva pathLength="1" para dibujarse con stroke-dashoffset al entrar.
   Clases: .tr (trazo principal) · .tr.fino (nervios) · .acento (relleno yema, entra al final)
   Un generador con semilla fija: siempre sale el mismo dibujo.

   Lo usa scripts/construir.mjs; aquí solo se exportan las funciones. */

const VB = '0 0 300 400';

/* ── utilidades ── */
function semilla(s) { return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s ^= s >>> 16) >>> 0) / 4294967296); }
const f = n => (Math.round(n * 10) / 10).toString();
const cubic = (a, b, c, d, t) => {
  const u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
          u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
};
const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];

/* Catmull-Rom → béziers cúbicas: una curva suave que pasa por todos los puntos */
function suave(pts, cerrar = false) {
  if (pts.length < 2) return '';
  const P = cerrar ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  const fin = cerrar ? pts.length + 1 : P.length - 2;
  for (let i = 1; i < fin; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    if (!p2 || !p3) break;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + [c1, c2, p2].map(p => f(p[0]) + ' ' + f(p[1])).join(' ');
  }
  return cerrar ? d + 'Z' : d;
}

/* un eje (lista de puntos) muestreado con tangentes y normales */
function eje(puntos, n = 40) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = puntos.length === 4 ? cubic(...puntos, t) : lineal(puntos, t);
    const q = puntos.length === 4 ? cubic(...puntos, Math.min(1, t + 0.01)) : lineal(puntos, Math.min(1, t + 0.01));
    const r = puntos.length === 4 ? cubic(...puntos, Math.max(0, t - 0.01)) : lineal(puntos, Math.max(0, t - 0.01));
    const tan = norm([q[0] - r[0], q[1] - r[1]]);
    out.push({ t, p, tan, nor: [-tan[1], tan[0]] });
  }
  return out;
}
function lineal(pts, t) {
  const seg = (pts.length - 1) * t, i = Math.min(Math.floor(seg), pts.length - 2), k = seg - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
}

const trazo = (d, clase = 'tr') => `<path class="${clase}" pathLength="1" d="${d}"/>`;

/* hoja genérica: eje + perfil de anchura; devuelve contorno, nervio central y (opcional) nervios */
function hoja({ base, dir, largo, ancho, curva = 0, perfil = t => Math.pow(Math.sin(Math.PI * t), 0.85), dientes = 0, nervios = 0, nervioAng = 0.9, rnd, margen = false }) {
  const d = norm(dir), n = [-d[1], d[0]];
  const tip = add(add(base, d, largo), n, curva * largo);
  const c1 = add(add(base, d, largo * 0.33), n, curva * largo * 0.55);
  const c2 = add(add(base, d, largo * 0.7), n, curva * largo * 0.9);
  const E = eje([base, c1, c2, tip], 30);
  const izq = [], der = [];
  E.forEach(({ t, p, nor }, i) => {
    let w = ancho * perfil(t);
    let wi = w, wd = w;
    if (dientes && i > 2 && i < E.length - 3 && i % 3 === 0) { wi += dientes; wd += dientes * (i % 2 ? 0.6 : 1); }
    izq.push(add(p, nor, wi)); der.push(add(p, nor, -wd));
  });
  const contorno = suave([...izq, ...der.slice(0, -1).reverse()]);
  const out = [trazo(contorno), trazo(suave(E.slice(0, -2).map(e => e.p)))];
  if (margen) out.push(trazo(suave(E.slice(2, -2).map(({ t, p, nor }) => add(p, nor, ancho * perfil(t) * 0.86))), 'tr fino'),
                       trazo(suave(E.slice(2, -2).map(({ t, p, nor }) => add(p, nor, -ancho * perfil(t) * 0.86))), 'tr fino'));
  for (let k = 1; k <= nervios; k++) {
    const i = Math.round(3 + (E.length - 7) * k / (nervios + 1));
    for (const lado of [1, -1]) {
      const { t, p, tan, nor } = E[i];
      const w = ancho * perfil(t) * (margen ? 0.84 : 0.8);
      const a = add(add(p, tan, w * nervioAng), nor, w * lado);
      const m = add(add(p, tan, w * nervioAng * 0.3), nor, w * 0.55 * lado);
      out.push(trazo('M' + f(p[0]) + ' ' + f(p[1]) + 'Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(a[0]) + ' ' + f(a[1]), 'tr fino'));
    }
  }
  return out;
}

/* tallo con grosor: dos bordes paralelos que se afinan */
function tallo(pts, grueso, fino, n = 30) {
  const E = eje(pts, n);
  const w = t => grueso + (fino - grueso) * t;
  return [trazo(suave(E.map(({ t, p, nor }) => add(p, nor, w(t) / 2)))), trazo(suave(E.map(({ t, p, nor }) => add(p, nor, -w(t) / 2))))];
}

/* pétalo de plumeria: el mismo que la flor del hero, en pequeño */
const PETALO = 'M0 0C40 -8 92 -52 70 -118C58 -150 14 -150 2 -112C-6 -80 -8 -36 0 0Z';
function flor(cx, cy, esc, giro, yema = true) {
  const p = [];
  for (let i = 0; i < 5; i++) p.push(`<path class="tr" pathLength="1" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(giro + i * 72)}) scale(${esc})" d="${PETALO}" style="stroke-width:${f(1.3 / esc)}px"/>`);
  if (yema) p.push(`<circle class="acento" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(2.4, 16 * esc))}"/>`);
  return p;
}

/* ── I · hoja de plátano ── */
function platano() {
  const rnd = semilla(11);
  const P = [[74, 394], [98, 300], [150, 168], [236, 38]];
  const E = eje(P, 70);
  const corte = 0.12;
  const perfil = t => t < corte ? 0 : Math.pow(Math.sin(Math.PI * Math.min(1, (t - corte) / (1 - corte))), 0.5);
  const W = 86;
  const izq = E.filter(e => e.t >= corte).map(({ t, p, nor }) => add(p, nor, W * perfil(t)));
  const der = E.filter(e => e.t >= corte).map(({ t, p, nor }) => add(p, nor, -W * 0.8 * perfil(t)));
  const out = [];
  out.push(...tallo(P.map((x, i) => i ? [x[0], x[1]] : x), 6, 1.5, 50).map(s => s)); /* nervio central grueso */
  /* rasgaduras del limbo: el borde se corta y una raja entra siguiendo el nervio */
  const trocear = (borde, rajas) => {
    const cortes = rajas.map(r => Math.round(r * (borde.length - 1)));
    let a = 0; const tramos = [];
    for (const c of cortes) { tramos.push(borde.slice(a, c)); a = c + 1; }
    tramos.push(borde.slice(a));
    return { tramos, cortes };
  };
  const I = trocear(izq, [0.5]), D = trocear(der, [0.36, 0.58, 0.78]);
  I.tramos.concat(D.tramos).forEach(t => t.length > 1 && out.push(trazo(suave(t))));
  const base = E.filter(e => e.t >= corte);
  [[I.cortes, 1], [D.cortes, -0.8]].forEach(([cs, lado]) => cs.forEach(c => {
    const { p, nor, tan, t } = base[c];
    const borde = add(p, nor, W * lado * perfil(t));
    const dentro = add(add(p, nor, W * lado * perfil(t) * 0.35), tan, -6);
    out.push(trazo('M' + f(borde[0]) + ' ' + f(borde[1]) + 'L' + f(dentro[0]) + ' ' + f(dentro[1])));
  }));
  /* nervios laterales paralelos, casi perpendiculares y curvados hacia la punta */
  for (let t = 0.17; t < 0.95; t += 0.034) {
    const e = E[Math.round(t * 70)];
    for (const [lado, k] of [[1, 1], [-1, 0.8]]) {
      const w = W * k * perfil(Math.min(1, e.t + 0.03)) * 0.9;
      if (w < 6) continue;
      const a = add(add(e.p, e.nor, w * lado), e.tan, w * 0.2);
      const m = add(add(e.p, e.nor, w * 0.5 * lado), e.tan, w * 0.05);
      out.push(trazo('M' + f(e.p[0]) + ' ' + f(e.p[1]) + 'Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(a[0]) + ' ' + f(a[1]), 'tr fino'));
    }
  }
  return out;
}

/* ── II · rama de encina, con bellotas ── */
function encina() {
  const rnd = semilla(23);
  const out = [];
  const principal = [[150, 402], [144, 318], [162, 236], [150, 150], [170, 70], [176, 40]];
  const lado1 = [[146, 312], [104, 262], [74, 214], [62, 176]];
  const lado2 = [[158, 226], [200, 190], [228, 150], [240, 112]];
  out.push(...tallo(principal, 7, 2.4), ...tallo(lado1, 4, 1.6), ...tallo(lado2, 4, 1.6));
  const hojas = [
    [principal, 0.36, 1], [principal, 0.5, -1], [principal, 0.66, 1], [principal, 0.8, -1], [principal, 0.93, 1], [principal, 0.99, -0.2],
    [lado1, 0.4, 1], [lado1, 0.7, -1], [lado1, 0.98, 0.3], [lado2, 0.35, -1], [lado2, 0.65, 1], [lado2, 0.98, -0.3]
  ];
  hojas.forEach(([ruta, t, lado], i) => {
    const E = eje(ruta, 40); const e = E[Math.round(t * 40)];
    const dir = rot(e.tan, -lado * (0.95 + rnd() * 0.3));
    out.push(...hoja({ base: e.p, dir, largo: 40 + rnd() * 14, ancho: 10 + rnd() * 3, curva: 0.05 * lado, dientes: 1.6, perfil: t => Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.04)), 0.7), rnd }));
  });
  /* bellotas colgando de la rama lateral */
  const espolon = [[149, 300], [172, 306], [196, 318], [210, 330]];
  out.push(...tallo(espolon, 3.2, 1.6, 12));
  [[196, 330, -10, 1.25], [214, 342, 12, 1.2], [180, 322, -24, 1.1]].forEach(([x, y, g, e]) => {
    const a = (g * Math.PI) / 180;
    const P = (dx, dy) => { const r = rot([dx * e, dy * e], a); return f(x + r[0]) + ' ' + f(y + r[1]); };
    out.push(`<path class="acento" d="M${P(-11, 0)}A${f(11 * e)} ${f(8 * e)} ${g} 0 0 ${P(11, 0)}Z"/>`);
    out.push(trazo(`M${P(-11, 0)}A${f(11 * e)} ${f(8 * e)} ${g} 0 0 ${P(11, 0)}Z`));
    out.push(trazo(`M${P(-9, 4)}Q${P(0, 1)} ${P(9, 4)}M${P(-6, 7)}Q${P(0, 4.5)} ${P(6, 7)}`, 'tr fino'));
    out.push(trazo(`M${P(-8, 7)}C${P(-9, 18)} ${P(-4, 27)} ${P(0, 30)}C${P(4, 27)} ${P(9, 18)} ${P(8, 7)}`));
    out.push(trazo(`M${P(0, 0)}L${P(0, -10)}`));
  });
  return out;
}

/* ── III · rama de limonero, con limón y azahar ── */
function limonero() {
  const rnd = semilla(37);
  const out = [];
  const rama = [[158, 404], [146, 320], [160, 228], [148, 140], [156, 96]];
  out.push(...tallo(rama, 6, 2.2));
  [[0.28, 1], [0.44, -1], [0.6, 1], [0.74, -1], [0.88, 1]].forEach(([t, lado]) => {
    const E = eje(rama, 40); const e = E[Math.round(t * 40)];
    out.push(...hoja({ base: e.p, dir: rot(e.tan, -lado * (0.8 + rnd() * 0.25)), largo: 70 + rnd() * 16, ancho: 17 + rnd() * 4, curva: 0.08 * lado, nervios: 5, nervioAng: 1.2, perfil: t => Math.pow(Math.sin(Math.PI * t), 0.75) * (1 - 0.18 * t), rnd }));
  });
  /* el limón: óvalo con pezón, cuelga del primer nudo */
  const L = [92, 318], g = -0.35;
  const pts = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    let r = [30 * Math.cos(a), 40 * Math.sin(a)];
    if (Math.sin(a) > 0.92) r[1] += 7 * (Math.sin(a) - 0.92) / 0.08;       /* pezón abajo */
    if (Math.sin(a) < -0.94) r[1] -= 4 * (-Math.sin(a) - 0.94) / 0.06;    /* hombro del pedúnculo */
    pts.push(add(L, rot(r, g)));
  }
  const limon = suave(pts, true);
  out.push(`<path class="acento" d="${limon}"/>`, trazo(limon));
  const pie = add(L, rot([0, -44], g));
  out.push(trazo('M' + f(pie[0]) + ' ' + f(pie[1]) + 'Q' + f(pie[0] + 18) + ' ' + f(pie[1] - 16) + ' ' + f(146) + ' ' + f(304)));
  for (let i = 0; i < 16; i++) {                                        /* poros de la piel */
    const r = rot([(rnd() - 0.5) * 38, (rnd() - 0.5) * 56], g);
    out.push(`<circle class="punto" cx="${f(L[0] + r[0])}" cy="${f(L[1] + r[1])}" r=".9"/>`);
  }
  /* azahar arriba y un botón */
  out.push(...flor(156, 90, 0.16, 12, false));
  for (let i = 0; i < 5; i++) { const a = rot([0, -9], i * 1.256); out.push(trazo(`M156 90L${f(156 + a[0])} ${f(90 + a[1])}`, 'tr fino')); }
  out.push(trazo('M149 142Q128 132 124 116'), trazo('M124 116C117 110 118 99 124 96C130 99 131 110 124 116Z'));
  return out;
}

/* ── IV · sacuanjoche (Plumeria rubra) ── */
function sacuanjoche() {
  const rnd = semilla(41);
  const out = [];
  const tronco = [[132, 404], [138, 330], [146, 262], [142, 214]];
  const b1 = [[142, 218], [120, 186], [104, 160], [98, 138]];
  const b2 = [[144, 222], [172, 196], [192, 176], [202, 152]];
  out.push(...tallo(tronco, 20, 15), ...tallo(b1, 14, 10), ...tallo(b2, 13, 9));
  /* cicatrices de hojas caídas: la plumeria las marca en la rama */
  [[136, 360], [142, 300], [141, 250]].forEach(([x, y]) => out.push(trazo(`M${x - 5} ${y}Q${x} ${y + 4} ${x + 5} ${y}`, 'tr fino')));
  /* hojas grandes con nervios paralelos y nervio marginal, saliendo de las puntas */
  [[98, 142, [-1, 0.25], 110], [100, 140, [-0.7, 1], 96], [202, 156, [1, 0.3], 112], [204, 156, [0.55, 1], 98]].forEach(([x, y, d, l], i) => {
    out.push(...hoja({ base: [x, y], dir: d, largo: l, ancho: 20, curva: (i % 2 ? -1 : 1) * 0.05, nervios: 9, nervioAng: 0.5, margen: true, perfil: t => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.8), rnd }));
  });
  /* inflorescencia: pedúnculos y tres flores abiertas con su yema, más dos botones */
  const centro = [148, 118];
  out.push(trazo(`M98 140Q118 128 ${centro[0]} ${centro[1]}`), trazo(`M202 154Q178 132 ${centro[0]} ${centro[1]}`));
  [[104, 64, 10], [168, 52, 40], [206, 98, 66]].forEach(([x, y, g]) => {
    out.push(trazo(`M${centro[0]} ${centro[1]}Q${f((centro[0] + x) / 2 + 6)} ${f((centro[1] + y) / 2 + 10)} ${x} ${y + 6}`, 'tr fino'));
    out.push(...flor(x, y, 0.2, g));
  });
  [[124, 86, -30], [190, 72, 24]].forEach(([x, y, g]) => {
    out.push(trazo(`M${centro[0]} ${centro[1]}L${x} ${y + 14}`, 'tr fino'));
    out.push(`<path class="tr" pathLength="1" transform="translate(${x} ${y}) rotate(${g})" d="M0 14C-6 6 -5 -8 0 -16C5 -8 6 6 0 14ZM-2 8C0 2 1 -6 0 -12"/>`);
  });
  return out;
}

/* ── V · caña de azúcar ── */
function cana() {
  const rnd = semilla(53);
  const out = [];
  const canas = [[[112, 404], [118, 60]], [[154, 404], [150, 34]], [[194, 404], [186, 84]]];
  const anchos = [12, 14, 10];
  canas.forEach(([a, b], i) => {
    out.push(...tallo([a, b], anchos[i], anchos[i] * 0.8, 10));
    const tramos = Math.round((a[1] - b[1]) / 46);
    for (let k = 1; k < tramos; k++) {                      /* nudos: anillo doble y yema lateral */
      const t = k / tramos, p = lineal([a, b], t), w = anchos[i] * (1 - 0.2 * t) / 2 + 1.2;
      out.push(trazo(`M${f(p[0] - w)} ${f(p[1])}Q${f(p[0])} ${f(p[1] + 3)} ${f(p[0] + w)} ${f(p[1])}`, 'tr fino'));
      out.push(trazo(`M${f(p[0] - w)} ${f(p[1] - 4)}Q${f(p[0])} ${f(p[1] - 1)} ${f(p[0] + w)} ${f(p[1] - 4)}`, 'tr fino'));
    }
  });
  /* hojas largas y estrechas que salen de los nudos altos y se doblan hacia fuera */
  [[118, 112, -1, 130], [118, 168, 1, 84], [150, 84, 1, 150], [150, 140, -1, 118], [186, 134, 1, 104], [186, 190, -1, 92], [150, 44, -1, 120], [118, 72, 1, 70], [186, 96, -1, 60]].forEach(([x, y, lado, l]) => {
    const base = [x, y];
    const tip = [x + lado * l * 0.72, y + l * 0.78];
    const c1 = [x + lado * l * 0.12, y - l * 0.42];
    const c2 = [x + lado * l * 0.62, y - l * 0.3];
    const E = eje([base, c1, c2, tip], 30);
    const w = t => 5.4 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.5);
    out.push(trazo(suave([...E.map(({ t, p, nor }) => add(p, nor, w(t))), ...E.slice(0, -1).reverse().map(({ t, p, nor }) => add(p, nor, -w(t)))])));
    out.push(trazo(suave(E.slice(0, -3).map(e => e.p)), 'tr fino'));
  });
  return out;
}

export const LAMINAS = {
  entrantes: { dibujo: platano, especie: 'Musa × paradisiaca', comun: 'hoja de plátano' },
  carnes: { dibujo: encina, especie: 'Quercus ilex', comun: 'encina, con bellotas' },
  pescado: { dibujo: limonero, especie: 'Citrus × limon', comun: 'limonero, con azahar' },
  postres: { dibujo: sacuanjoche, especie: 'Plumeria rubra', comun: 'sacuanjoche' },
  bebidas: { dibujo: cana, especie: 'Saccharum officinarum', comun: 'caña de azúcar' }
};

export function svgLamina(id, titulo) {
  const L = LAMINAS[id];
  return `<svg class="ilus" viewBox="${VB}" role="img" aria-label="Lámina botánica: ${L.comun}">${L.dibujo().join('')}</svg>`;
}

export { PETALO };
