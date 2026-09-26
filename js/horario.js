/* Horario en vivo de Raíces (zona Europe/Madrid), con turnos que cruzan la medianoche.
   Es la lógica del script `estado` del boceto, sacada a una función pura para poder
   probarla con fechas simuladas (scripts/test-horario.mjs). Sirve en el navegador
   (window.RaicesHorario) y en Node (module.exports). */
(function (raiz) {
  'use strict';

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var SEMANA = 7 * 1440;
  /* [día de apertura (0 = domingo), inicio, fin] en minutos desde las 00:00 de ese día.
     Un fin > 1440 cae al día siguiente: 26 * 60 son las 02:00 de la madrugada. */
  var TURNOS = [
    [5, 18 * 60, 26 * 60],             /* viernes 18:00 → sábado 02:00 */
    [6, 12 * 60 + 30, 26 * 60],        /* sábado 12:30 → domingo 02:00 */
    [0, 12 * 60 + 30, 22 * 60 + 30]    /* domingo 12:30 → 22:30 */
  ];

  function hhmm(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  /* minuto de la semana en Madrid (0 = domingo 00:00), sea cual sea la zona del navegador */
  function minutoMadrid(fecha) {
    var p = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(fecha);
    var g = function (t) { return p.find(function (x) { return x.type === t; }).value; };
    var d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
    return d * 1440 + (+g('hour')) * 60 + (+g('minute'));
  }

  function estado(fecha) {
    var t = minutoMadrid(fecha || new Date());
    var hoy = Math.floor(t / 1440);
    for (var i = 0; i < TURNOS.length; i++) {
      var S = TURNOS[i][0] * 1440 + TURNOS[i][1], E = TURNOS[i][0] * 1440 + TURNOS[i][2];
      /* el turno del sábado acaba el domingo 02:00, que en minutos de semana es > SEMANA */
      if ((t >= S && t < E) || (t + SEMANA >= S && t + SEMANA < E)) {
        var queda = (E - t + SEMANA) % SEMANA;
        return {
          abierto: true, hoy: hoy, turno: TURNOS[i][0], cierra: hhmm(TURNOS[i][2]), quedaMin: queda,
          texto: 'Abierto ahora · cerramos a las ' + hhmm(TURNOS[i][2]),
          corto: queda <= 60 ? 'Abierto, última hora · cerramos a las ' + hhmm(TURNOS[i][2]) : null
        };
      }
    }
    var mejor = null;
    TURNOS.forEach(function (tr) {
      var falta = ((tr[0] * 1440 + tr[1] - t) % SEMANA + SEMANA) % SEMANA;
      if (!mejor || falta < mejor.falta) mejor = { falta: falta, dia: tr[0], hora: tr[1] };
    });
    var cuando;
    if (mejor.dia === hoy && mejor.falta < 1440) cuando = 'hoy';
    else if (mejor.dia === (hoy + 1) % 7 && mejor.falta < 2880) cuando = 'mañana';
    else cuando = 'el ' + DIAS[mejor.dia];
    return {
      abierto: false, hoy: hoy, turno: null, faltaMin: mejor.falta, vuelveDia: mejor.dia, vuelveHora: hhmm(mejor.hora),
      texto: 'Cerrado · Volvemos ' + cuando + ' a las ' + hhmm(mejor.hora)
    };
  }

  var api = { estado: estado, minutoMadrid: minutoMadrid, TURNOS: TURNOS, DIAS: DIAS, hhmm: hhmm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.RaicesHorario = api;
})(this);
