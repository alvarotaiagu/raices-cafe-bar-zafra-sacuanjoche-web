/* Quita el mando de maqueta (y la densidad sobria) de una COPIA del sitio, lista para el cliente.
   Nunca toca esta carpeta: exige una carpeta de destino que ya sea una copia.

   node scripts/quitar-mando.mjs <carpeta-copia>
   node <carpeta-copia>/scripts/comprobar-borrado.mjs      ← tiene que decir «Sin rastros»
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origen = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = process.argv[2] && path.resolve(process.argv[2]);
if (!destino || destino === origen || !fs.existsSync(path.join(destino, 'index.html'))) {
  console.log('Uso: node scripts/quitar-mando.mjs <carpeta-copia>  (una copia del sitio, nunca la maqueta)');
  process.exit(1);
}
const leer = f => fs.readFileSync(path.join(destino, f), 'utf8').split('\r\n').join('\n');
const escribir = (f, t) => fs.writeFileSync(path.join(destino, f), t);
const quitar = (t, re, que) => { if (!re.test(t)) throw new Error('No encuentro ' + que); return t.replace(re, ''); };

/* index.html */
let html = leer('index.html');
html = quitar(html, /\n  AVISO 1 — [\s\S]*?«Quitar el mando de maqueta»\.\n/, 'el AVISO 1 del comentario');
html = html.replace('class="sin-js densidad-sacuanjoche"', 'class="sin-js"');
html = quitar(html, /\n  try \{\n    \/\* la densidad guardada solo cuenta en modo revisión \(\?revision\) \*\/\n    var d = [^\n]*raices-sac-densidad[\s\S]*?\} catch \(e\) \{\}/, 'la lectura de la densidad del <head>');
html = html.replace(/\s*· clase js y densidad guardada \(\[MANDO DE MAQUETA\], eliminable, ver README\)/, '\n   · clase js');
html = quitar(html, /\n\s*<!-- \[MANDO DE MAQUETA\] solo en la densidad sobria: la casa en cifras -->\n\s*<dl class="casa__cifras"[\s\S]*?<\/dl>/, 'la casa en cifras');
html = quitar(html, /\n\s*<p class="tira__sobria" data-solo-sobria>[\s\S]*?<\/p>/, 'la tira de datos');
html = quitar(html, /\n\s*<!-- \[MANDO DE MAQUETA\] solo en la densidad sobria: la semana en horas[^>]*-->\n\s*<figure class="franjas"[\s\S]*?<\/figure>/, 'la semana en horas');
html = quitar(html, /\n\s*<!-- construir:cifras -->[\s\S]*?<!-- \/construir:cifras -->/, 'la carta en cifras');
html = quitar(html, /\n<!-- \[MANDO DE MAQUETA\] — SOLO REVISIÓN INTERNA\. NO PUBLICAR\. -->\n<div class="mando"[\s\S]*?\n<\/div>\n/, 'el <div class="mando">');
escribir('index.html', html);

/* css/estilos.css */
let css = leer('css/estilos.css');
css = quitar(css, /\/\* ═+\n   \[MANDO DE MAQUETA\][\s\S]*?\/\* ═+ fin del bloque \[MANDO DE MAQUETA\] ═+ \*\/\n/, 'el bloque CSS del mando');
escribir('css/estilos.css', css);

/* js/main.js */
let js = leer('js/main.js');
js = quitar(js, /\n  \/\* ═+\n     \[MANDO DE MAQUETA\][\s\S]*?\/\* ═+ fin del bloque \[MANDO DE MAQUETA\] ═+ \*\//, 'el bloque JS del mando');
js = quitar(js, /\n  function sobria\(\) \{ return html\.classList\.contains\('densidad-sobria'\); \}/, 'la función sobria()');
js = js.replace(/if \(!sobria\(\)\) \{/g, '{').replace(/ \|\| sobria\(\)/g, '');
escribir('js/main.js', js);

/* scripts/construir.mjs: la carta en cifras solo existía para la sobria */
let gen = leer('scripts/construir.mjs');
gen = quitar(gen, /\/\* ── versión sobria: la carta en cifras[\s\S]*?\n\}\n\n/, 'cifras() del generador');
gen = quitar(gen, /\n  cifras: cifras\(\),/, 'el bloque cifras');
/* los recuentos que solo pintaban la casa en cifras y la tira de datos de la sobria */
gen = quitar(gen, /\n  'n-platos': [^\n]*\n  'n-laminas': [^\n]*\n  'precio-min': [^\n]*\n  'precio-max': [^\n]*/, 'los recuentos de la sobria');
escribir('scripts/construir.mjs', gen);

/* privacidad.html */
let priv = leer('privacidad.html');
priv = quitar(priv, /\n      <tr><td><code>raices-sac-densidad<\/code>[\s\S]*?<\/tr>/, 'la fila de la densidad');
escribir('privacidad.html', priv);

console.log('Mando quitado de ' + destino + '. Ahora: node "' + path.join(destino, 'scripts/comprobar-borrado.mjs') + '"');
