/* Comprueba contra los archivos que el mando de maqueta ya no está.
   La receta del README no se escribe de memoria: se comprueba.

   node scripts/comprobar-borrado.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const rastros = [
  ['index.html',      /\[MANDO DE MAQUETA\]/,    'comentarios [MANDO DE MAQUETA]'],
  ['index.html',      /id="mando"/,              'el <div class="mando">'],
  ['index.html',      /raices-sac-densidad/,     'la lectura de la densidad en el script del <head>'],
  ['index.html',      /densidad-sacuanjoche/,    'la clase densidad-sacuanjoche del <html>'],
  ['index.html',      /data-solo-sobria/,        'los bloques que solo existen para la sobria (casa en cifras, tira de datos, franjas)'],
  ['index.html',      /construir:cifras -->[\s\S]*?<figure/, 'la carta en cifras (vaciar el marcador y quitar cifras() de construir.mjs)'],
  ['css/estilos.css', /\[MANDO DE MAQUETA\]/,    'el bloque CSS del mando'],
  ['css/estilos.css', /densidad-sobria/,         'las reglas de la densidad sobria'],
  ['js/main.js',      /\[MANDO DE MAQUETA\]/,    'el bloque JS del mando'],
  ['js/main.js',      /mandoMaqueta/,            'la función mandoMaqueta()'],
  ['js/main.js',      /densidad-sobria/,         'la función sobria() y sus usos (tira, polen)'],
  ['scripts/construir.mjs', /data-solo-sobria/,  'la carta en cifras del generador'],
  ['privacidad.html', /raices-sac-densidad/,     'la fila del almacenamiento de la densidad']
];

let quedan = 0;
console.log('Rastros del mando de maqueta');
console.log('-'.repeat(78));
for (const [archivo, patron, que] of rastros) {
  const texto = fs.readFileSync(path.join(raiz, archivo), 'utf8');
  const hay = patron.test(texto);
  if (hay) quedan++;
  console.log((hay ? 'QUEDA ' : 'limpio') + '  ' + archivo.padEnd(22) + que);
}
console.log('-'.repeat(78));
if (quedan) {
  console.log(quedan + ' rastro(s). No entregar todavía.');
  process.exitCode = 1;
} else {
  console.log('Sin rastros del mando. Se puede entregar.');
}
