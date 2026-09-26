/* Test del horario en vivo con fechas simuladas (DATOS-RAICES.md, «Obligatorio»).
   Las fechas llevan su desfase de Madrid explícito, así que el resultado no depende
   de la zona horaria del ordenador que lo ejecute.

   node scripts/test-horario.mjs
*/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { estado } = require('../js/horario.js');

const casos = [
  /* los cuatro del pliego de datos */
  ['Sábado 01:30 → abierto (turno del viernes)', '2026-10-03T01:30:00+02:00', e => e.abierto && e.turno === 5 && e.cierra === '02:00'],
  ['Domingo 01:30 → abierto (turno del sábado)', '2026-10-04T01:30:00+02:00', e => e.abierto && e.turno === 6 && e.cierra === '02:00'],
  ['Domingo 23:00 → cerrado, «Volvemos el viernes a las 18:00»', '2026-10-04T23:00:00+02:00', e => !e.abierto && e.texto.includes('Volvemos el viernes a las 18:00')],
  ['Lunes 00:30 → cerrado', '2026-10-05T00:30:00+02:00', e => !e.abierto],
  /* bordes y horario de invierno */
  ['Viernes 17:59 → cerrado, vuelve hoy a las 18:00', '2026-10-02T17:59:00+02:00', e => !e.abierto && e.texto.includes('hoy a las 18:00')],
  ['Viernes 18:00 → abierto', '2026-10-02T18:00:00+02:00', e => e.abierto && e.turno === 5],
  ['Sábado 02:00 → cerrado, vuelve hoy a las 12:30', '2026-10-03T02:00:00+02:00', e => !e.abierto && e.texto.includes('hoy a las 12:30')],
  ['Domingo 22:29 → abierto, última hora', '2026-10-04T22:29:00+02:00', e => e.abierto && e.turno === 0 && !!e.corto],
  ['Jueves 20:00 → cerrado, vuelve mañana a las 18:00', '2026-10-01T20:00:00+02:00', e => !e.abierto && e.texto.includes('mañana a las 18:00')],
  ['Domingo 01:30 en horario de invierno (CET) → abierto', '2026-11-08T01:30:00+01:00', e => e.abierto && e.turno === 6],
  ['Domingo 23:00 en invierno, desde un navegador en UTC-6 → cerrado', '2026-11-09T04:00:00-06:00', e => !e.abierto && e.texto.includes('viernes a las 18:00')]
];

let fallos = 0;
for (const [nombre, iso, ok] of casos) {
  const e = estado(new Date(iso));
  const bien = ok(e);
  if (!bien) fallos++;
  console.log((bien ? 'OK    ' : 'FALLA ') + nombre.padEnd(66) + ' → ' + e.texto);
}
console.log(fallos ? '\n' + fallos + ' fallo(s).' : '\nHorario: ' + casos.length + ' casos correctos.');
process.exitCode = fallos ? 1 : 0;
