/* ═══════════════════════════════════════════════════════════════════════════
   Raíces Café Bar · «Sacuanjoche»
   Se entra por una plumeria que se abre (la cortina). En el hero se dibuja el
   ramillete del sello, después los cinco pétalos con su aro y la yema cae con
   un rebote. Al bajar, la flor gira y se va al fondo desenfocada. La carta es
   un herbario: cada lámina dibuja su planta al entrar.

   Banderas separadas a propósito:
     gsapReady  → hay motor de animación (GSAP + ScrollTrigger cargados)
     movimiento → además el usuario NO ha pedido reducir el movimiento
   Con movimiento reducido el CONTENIDO sigue vivo (estado de abierto, día de
   hoy, contadores con su cifra); lo que se apaga es el viaje.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  window.__raicesArranco = true;

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esTactil = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var gsapReady = !!(window.gsap && window.ScrollTrigger);
  var movimiento = gsapReady && !reduce;
  var gsap = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  if (!gsapReady) html.classList.add('sin-gsap');       /* CDN caído: todo se ve ya dibujado */
  if (gsapReady) gsap.registerPlugin(window.ScrollTrigger);
  if (movimiento) html.classList.add('con-movimiento');

  function alturaCabecera() { return parseFloat(getComputedStyle(html).getPropertyValue('--cab')) || 72; }
  function sobria() { return html.classList.contains('densidad-sobria'); }

  function cuandoVisible(nodos, umbral, alEntrar) {
    if (!('IntersectionObserver' in window)) { nodos.forEach(alEntrar); return; }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        alEntrar(en.target);
      });
    }, { threshold: umbral });
    nodos.forEach(function (n) { obs.observe(n); });
  }

  /* trazo que se dibuja: se enciende justo cuando le toca (si no, el remate
     redondeado pinta un punto suelto en su origen antes de empezar) */
  function dibujar(tl, trazos, en, presupuesto) {
    /* cada trazo arranca cuando la «pluma» llega a él y dura lo que mide: el conjunto
       cabe en `presupuesto` segundos, con solape, como una mano que no levanta la pluma */
    var largos = trazos.map(function (t) { return parseFloat(t.dataset.largo) || 40; });
    var total = largos.reduce(function (a, b) { return a + b; }, 0);
    var hecho = 0, fin = en;
    trazos.forEach(function (t, i) {
      var inicio = en + presupuesto * 0.72 * (hecho / total);
      var d = Math.max(0.28, presupuesto * 1.6 * (largos[i] / total));
      tl.set(t, { opacity: 1 }, inicio);
      tl.to(t, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut' }, inicio);
      hecho += largos[i];
      fin = Math.max(fin, inicio + d);
    });
    return fin;
  }

  /* ───────────────────────── Lenis ───────────────────────── */
  var lenis = null;
  if (movimiento && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function irA(destino) {
    var desfase = -alturaCabecera() + 1;
    if (lenis) { lenis.scrollTo(destino, { offset: desfase, duration: 1.5 }); return; }
    var el = typeof destino === 'string' ? $(destino) : destino;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + desfase, behavior: reduce ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || !$(id)) return;
    e.preventDefault();
    cerrarMenu();
    irA(id);
  });

  /* ───────────────────── titulares partidos (char-reveal) ───────────────────── */
  function partir(el) {
    var modo = el.dataset.revelar;
    var texto = el.textContent.trim();
    var palabras = texto.split(/\s+/);
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    var piezas = [];
    palabras.forEach(function (palabra, i) {
      /* la palabra es inline-block y nowrap: si no, el corte de línea cae entre letras */
      var caja = document.createElement('span');
      caja.className = 'palabra';
      caja.setAttribute('aria-hidden', 'true');
      if (modo === 'letras') {
        Array.from(palabra).forEach(function (c) {
          var s = document.createElement('span');
          s.className = 'letra';
          s.textContent = c;
          caja.appendChild(s);
          piezas.push(s);
        });
      } else {
        var s = document.createElement('span');
        s.className = 'palabra-int';
        s.textContent = palabra;
        caja.appendChild(s);
        piezas.push(s);
      }
      el.appendChild(caja);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return piezas;
  }

  var titulares = $$('[data-revelar]').map(function (el) {
    var piezas = partir(el);
    if (movimiento) gsap.set(piezas, { yPercent: 115, rotate: el.dataset.revelar === 'letras' ? 6 : 0 });
    el.style.visibility = 'visible';
    return { el: el, piezas: piezas };
  });

  function revelar(t, retardo) {
    gsap.to(t.piezas, {
      yPercent: 0, rotate: 0, duration: t.el.dataset.revelar === 'letras' ? 1.25 : 1.05, ease: 'expo.out',
      stagger: t.el.dataset.revelar === 'letras' ? 0.055 : 0.07, delay: retardo || 0
    });
  }
  if (movimiento) {
    titulares.forEach(function (t) {
      if (t.el.closest('.hero')) return;              /* el del hero lo lanza su propia secuencia */
      cuandoVisible([t.el], 0.35, function () { revelar(t); });
    });
  }

  /* ───────────────── cortina: la plumeria se abre y deja ver la página ───────────────── */
  var PETALO = 'M0 0C40 -8 92 -52 70 -118C58 -150 14 -150 2 -112C-6 -80 -8 -36 0 0Z';
  var cortinaAbierta = false;
  function avisar(nombre) { document.dispatchEvent(new CustomEvent(nombre)); }
  function abrir() { if (cortinaAbierta) return; cortinaAbierta = true; avisar('cortina-abre'); }

  (function cortina() {
    var cort = $('#cortina');
    var hecho = false;
    function retirar() {
      if (hecho) return;
      hecho = true;
      abrir();
      if (cort) cort.classList.add('fuera');
      try { sessionStorage.setItem('raices-sac-cortina', '1'); } catch (e) {}
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      avisar('cortina-retirada');
    }
    var yaVista = html.classList.contains('sin-cortina');
    if (!cort || !movimiento || yaVista) {
      /* sin GSAP, con movimiento reducido o segunda visita de la sesión: nunca tapa */
      setTimeout(retirar, 30);
      return;
    }

    var svg = $('#cortina-lienzo'), fondo = $('#cortina-fondo'), blanco = $('#cortina-blanco'), mascara = $('#cortina-mascara');
    var hueco = $('#cortina-hueco'), borde = $('#cortina-borde'), flor = $('#cortina-flor'), yema = $('#cortina-yema');
    var nombre = $('.cortina__nombre', cort), pie = $('.cortina__pie', cort);
    var ns = 'http://www.w3.org/2000/svg';
    var petalosFlor = [];
    [hueco, borde, flor].forEach(function (g) {
      for (var i = 0; i < 5; i++) {
        var gr = document.createElementNS(ns, 'g');
        gr.setAttribute('transform', 'rotate(' + (i * 72) + ')');
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', PETALO);
        gr.appendChild(p);
        g.appendChild(gr);
        if (g === flor) petalosFlor.push(p);
      }
    });

    var w = 0, h = 0, cx = 0, cy = 0, estado = { s: 0.001, r: -46 };
    function medir() {
      w = window.innerWidth; h = window.innerHeight; cx = w / 2; cy = h / 2 - Math.min(40, h * 0.04);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      [fondo, blanco].forEach(function (r) { r.setAttribute('width', w); r.setAttribute('height', h); });
      mascara.setAttribute('width', w); mascara.setAttribute('height', h);
      yema.setAttribute('cx', cx); yema.setAttribute('cy', cy);
      pintar();
    }
    function pintar() {
      var t = 'translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ') rotate(' + estado.r.toFixed(2) + ') scale(' + estado.s.toFixed(4) + ')';
      hueco.setAttribute('transform', t); borde.setAttribute('transform', t); flor.setAttribute('transform', t);
    }
    medir();
    window.addEventListener('resize', medir);

    var escalaFlor = Math.min(0.62, Math.min(window.innerWidth, window.innerHeight) / 700);
    var escalaFinal = Math.hypot(window.innerWidth, window.innerHeight) / 2 / 26;
    gsap.set(petalosFlor, { scale: 0, svgOrigin: '0 0' });
    gsap.set(yema, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(nombre, { yPercent: 120 });
    gsap.set(pie, { opacity: 0, letterSpacing: '.7em' });

    var tl = gsap.timeline({ onComplete: retirar });
    tl.to(estado, { s: escalaFlor, r: 0, duration: 1.2, ease: 'expo.out', onUpdate: pintar }, 0)
      .to(petalosFlor, { scale: 1, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.07 }, 0.05)
      .to(yema, { scale: 1, duration: 0.7, ease: 'back.out(3)' }, 0.55)
      .to(nombre, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0.6)
      .to(pie, { opacity: 1, letterSpacing: '.34em', duration: 1, ease: 'expo.out' }, 0.75)
      .addLabel('abre', 1.75)
      .add(abrir, 'abre')
      /* la flor se vacía (queda su borde) y se abre hasta salirse de la pantalla */
      .to([nombre, pie], { yPercent: -60, opacity: 0, duration: 0.45, ease: 'power2.in' }, 'abre')
      .to(yema, { scale: 0, duration: 0.4, ease: 'power2.in' }, 'abre')
      .to(petalosFlor, { fillOpacity: 0, duration: 0.35, ease: 'power1.in' }, 'abre')
      .to($$('path', borde), { opacity: 1, duration: 0.2 }, 'abre')
      .to(estado, { s: escalaFinal, r: 52, duration: 1.3, ease: 'expo.inOut', onUpdate: pintar }, 'abre')
      .to($$('path', borde), { opacity: 0, duration: 0.3 }, 'abre+=1');

    /* al primer gesto no se hace esperar a nadie: salta a la apertura */
    function prisa() {
      if (tl.time() < tl.labels.abre) tl.seek('abre');
      tl.timeScale(1.5);
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, prisa); });
    }
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, prisa, { passive: true }); });

    /* red de seguridad propia (además de la del <head>) */
    setTimeout(retirar, 4800);
  })();

  /* ───────────────── hero: ramillete → pétalos y aro → yema → «Raíces» ───────────────── */
  var flor = $('#flor-hero');
  var florSvg = flor && $('.flor-hero__svg', flor);

  (function hero() {
    if (!flor) return;
    var tituloHero = titulares.filter(function (t) { return t.el.closest('.hero'); })[0];
    var resto = $$('.hero__lema, .hero__entrada, .hero__acciones, .hero__nota, .hero__barra');
    if (!movimiento) { difuminar(); return; }

    gsap.set(resto, { opacity: 0, y: 26 });
    var yema = $('.yema', flor), brillo = $('.yema-brillo', flor);
    gsap.set([yema, brillo], { scale: 0, transformOrigin: '50% 50%' });

    document.addEventListener('cortina-abre', function () {
      var tl = gsap.timeline({ delay: 0.25, onComplete: difuminar });
      var fin = dibujar(tl, $$('.rm', flor), 0, 1.3);                         /* 1 · el ramillete, del tallo a la flor */
      $$('.petalos > g', flor).forEach(function (g, i) {                              /* 2 · los cinco pétalos */
        var pt = $('.pt', g), pl = $('.pt-pliegue', g), t = fin * 0.7 + i * 0.13;
        tl.set(pt, { opacity: 1 }, t)
          .to(pt, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' }, t)
          .to(pt, { fillOpacity: 1, duration: 0.8 }, t + 0.9)
          .set(pl, { opacity: 0.45 }, t + 0.6)
          .to(pl, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.out' }, t + 0.6);
      });
      var aro = $('.aro', flor);
      tl.set(aro, { opacity: 0.55 }, fin * 0.7 + 0.2)
        .to(aro, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, fin * 0.7 + 0.2);
      var tYema = fin * 0.7 + 1.45;
      tl.set([yema, brillo], { opacity: 1 }, tYema)                                    /* 3 · la yema, con rebote */
        .to(yema, { scale: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.45)' }, tYema)
        .to(brillo, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, tYema + 0.15);
      if (tituloHero) tl.add(function () { revelar(tituloHero); }, tYema + 0.25);    /* 4 · «Raíces» */
      tl.to(resto, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, tYema + 0.55);
    }, { once: true });

    /* al bajar, la flor gira despacio y se va al fondo: cruce con su copia desenfocada */
    var difusa = $('#flor-difusa');
    var tlScroll = gsap.timeline({ defaults: { ease: 'none' } });
    tlScroll.to(flor, { rotation: 34, scale: 1.3, duration: 1 }, 0)
      .to(florSvg, { opacity: 0, duration: 0.45 }, 0.12)
      .to(difusa, { opacity: 0.5, duration: 0.45 }, 0.1);
    window.ScrollTrigger.create({
      trigger: '.escena', start: 'top top', end: 'bottom bottom', scrub: 0.8, animation: tlScroll
    });
    gsap.to('.hero__texto', {
      y: -90, ease: 'none',                           /* solo se desplaza: con opacidad el texto quedaría a medio contraste */
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  })();

  /* Desenfoque PRECACHEADO: la flor ya dibujada se rasteriza UNA vez a un lienzo
     pequeño y desenfocado. Al hacer scroll solo cambia su opacidad: ningún filtro
     ni blur corre fotograma a fotograma. */
  function difuminar() {
    var lienzo = $('#flor-difusa');
    if (!lienzo || !florSvg || lienzo.dataset.hecho) return;
    lienzo.dataset.hecho = '1';
    var copia = florSvg.cloneNode(true);
    copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copia.setAttribute('width', '500'); copia.setAttribute('height', '500');
    $$('[style]', copia).forEach(function (n) { n.removeAttribute('style'); });
    $$('.yema, .yema-brillo', copia).forEach(function (n) { n.removeAttribute('transform'); });
    var estilo = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    estilo.textContent = '.aro{fill:none;stroke:#FCF0CC;stroke-width:2.4;opacity:.7}.rm{fill:none;stroke:#FCF0CC;stroke-width:3.4;stroke-linecap:round}' +
      '.pt{fill:rgba(252,240,204,.16);stroke:#FCF0CC;stroke-width:2.6}.pt-pliegue{fill:none;stroke:#FCF0CC;stroke-width:1.4;opacity:.5}' +
      '.yema{fill:#F2C94C}.yema-brillo{fill:#fff;opacity:.3}';
    copia.insertBefore(estilo, copia.firstChild);
    var datos = new XMLSerializer().serializeToString(copia);
    var img = new Image();
    img.onload = function () {
      var lado = 200;
      lienzo.width = lado; lienzo.height = lado;
      var ctx = lienzo.getContext('2d');
      if ('filter' in ctx) {
        ctx.filter = 'blur(5px)';                         /* una sola vez, al preparar el sprite */
        ctx.drawImage(img, 0, 0, lado, lado);
      } else {
        /* sin ctx.filter (Safari): reducir y volver a ampliar ya desenfoca */
        var peq = document.createElement('canvas');
        peq.width = peq.height = 40;
        peq.getContext('2d').drawImage(img, 0, 0, 40, 40);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(peq, 0, 0, lado, lado);
      }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(datos);
  }

  /* ───────────────── tira infinita ───────────────── */
  (function tira() {
    var pista = $('#tira-pista');
    if (!pista) return;
    var grupo = pista.firstElementChild;
    var copias = Math.ceil((window.innerWidth * 2) / Math.max(1, grupo.offsetWidth)) + 1;
    for (var i = 0; i < copias; i++) {
      var c = grupo.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      pista.appendChild(c);
    }
    if (!movimiento) return;
    var x = 0, base = 0.5, extra = 0, direccion = 1;
    if (lenis) lenis.on('scroll', function (e) {
      extra = Math.min(Math.abs(e.velocity || 0) * 0.3, 7);
      if (e.direction) direccion = e.direction;
    });
    /* rAF propio: ningún tween de GSAP toca esta propiedad, el += no pisa nada */
    (function paso() {
      if (!sobria()) {
        var ancho = grupo.offsetWidth;
        x -= (base + extra) * direccion;
        extra *= 0.93;
        if (ancho && x <= -ancho) x += ancho;
        if (x > 0) x -= ancho;
        pista.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(paso);
    })();
  })();

  /* ───────────────── láminas: cada planta se dibuja al entrar ───────────────── */
  (function laminas() {
    var todas = $$('.lamina');
    if (!movimiento) return;
    cuandoVisible(todas, 0.12, function (lam) {
      var ilus = $('.ilus', lam);
      if (!ilus) return;
      var gruesos = $$('.tr:not(.fino)', ilus), finos = $$('.tr.fino', ilus);
      var tl = gsap.timeline({ delay: 0.15 });
      gruesos.forEach(function (t, i) {
        tl.set(t, { opacity: 1 }, i * 0.05).to(t, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, i * 0.05);
      });
      var t2 = Math.min(gruesos.length * 0.05, 1.2) + 0.5;
      finos.forEach(function (t, i) {
        tl.set(t, { opacity: 0.7 }, t2 + i * 0.018).to(t, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.out' }, t2 + i * 0.018);
      });
      tl.to($$('.acento', ilus), { opacity: 0.72, duration: 0.8, stagger: 0.1 }, '-=0.5')
        .to($$('.punto', ilus), { opacity: 0.5, duration: 0.4, stagger: 0.02 }, '<');
    });
  })();

  /* ───────────────── sellos de las fichas: giran con el scroll ───────────────── */
  if (movimiento) {
    $$('.ficha__sello').forEach(function (s, i) {
      gsap.fromTo(s, { rotation: -30 + i * 20 }, {
        rotation: 90 + i * 20, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.pedidos', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
    gsap.from('.ficha', {
      y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.14,
      scrollTrigger: { trigger: '.pedidos__lista', start: 'top 82%', once: true }
    });
  }

  /* ───────────────── contadores ───────────────── */
  (function contadores() {
    var nodos = $$('[data-contador]');
    function formatear(n, el) {
      var dec = parseInt(el.dataset.decimales || '0', 10);
      return dec ? n.toFixed(dec).replace('.', ',') : Math.round(n).toString();
    }
    if (movimiento) nodos.forEach(function (el) { el.textContent = formatear(0, el); });
    cuandoVisible(nodos, 0.5, function (el) {
      var fin = parseFloat(el.dataset.contador);
      if (!movimiento) { el.textContent = formatear(fin, el); return; }   /* reducido: el dato, sin viaje */
      var estado = { v: 0 };
      gsap.to(estado, {
        v: fin, duration: 1.8, ease: 'power2.out',
        onUpdate: function () { el.textContent = formatear(estado.v, el); },
        onComplete: function () { el.textContent = formatear(fin, el); }
      });
    });
  })();

  /* ───────────────── botones magnéticos ───────────────── */
  (function imanes() {
    if (!movimiento || esTactil) return;
    $$('.iman').forEach(function (el) {
      var aX = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
      var aY = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        aX((e.clientX - (c.left + c.width / 2)) * 0.3);
        aY((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { aX(0); aY(0); });
    });
  })();

  /* ───────────────── firma: un rastro de polen detrás del cursor ─────────────────
     Sprites precacheados (un punto con degradado, pintado una vez por tamaño);
     en cada fotograma solo se hace drawImage. El bucle se para cuando no queda polen.
     Ni en táctil ni con movimiento reducido ni en la densidad sobria. */
  (function polen() {
    var lienzo = $('#polen');
    if (!lienzo) return;
    if (!movimiento || esTactil || !lienzo.getContext) { lienzo.remove(); return; }
    var ctx = lienzo.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var sprites = [2.2, 3.2, 4.4].map(function (r) {
      var c = document.createElement('canvas'), lado = Math.ceil(r * 4 * dpr);
      c.width = c.height = lado;
      var g = c.getContext('2d'), m = lado / 2;
      var gr = g.createRadialGradient(m, m, 0, m, m, m);
      gr.addColorStop(0, 'rgba(242,201,76,1)');
      gr.addColorStop(0.35, 'rgba(242,201,76,.75)');
      gr.addColorStop(1, 'rgba(242,201,76,0)');
      g.fillStyle = gr; g.fillRect(0, 0, lado, lado);
      return c;
    });
    function medir() { lienzo.width = Math.round(innerWidth * dpr); lienzo.height = Math.round(innerHeight * dpr); }
    medir();
    window.addEventListener('resize', medir);

    var granos = [], corriendo = false, ultimo = 0, px = null, py = null, acum = 0;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || sobria()) return;
      if (px !== null) acum += Math.hypot(e.clientX - px, e.clientY - py);
      px = e.clientX; py = e.clientY;
      if (acum < 14) return;
      acum = 0;
      if (granos.length > 64) granos.shift();
      granos.push({
        x: e.clientX + (Math.random() - 0.5) * 8, y: e.clientY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.35, vy: -0.08 - Math.random() * 0.28,
        vida: 0, max: 800 + Math.random() * 800, s: sprites[(Math.random() * 3) | 0], fase: Math.random() * 6
      });
      if (!corriendo) { corriendo = true; ultimo = performance.now(); requestAnimationFrame(bucle); }
    }, { passive: true });

    function bucle(ahora) {
      var dt = Math.min(48, ahora - ultimo); ultimo = ahora;
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      for (var i = granos.length - 1; i >= 0; i--) {
        var g = granos[i];
        g.vida += dt;
        var t = g.vida / g.max;
        if (t >= 1) { granos.splice(i, 1); continue; }
        g.x += g.vx * dt / 16 + Math.sin(g.fase + g.vida / 260) * 0.12;
        g.y += g.vy * dt / 16;
        ctx.globalAlpha = Math.pow(1 - t, 1.6) * 0.7;
        var l = g.s.width;
        ctx.drawImage(g.s, g.x * dpr - l / 2, g.y * dpr - l / 2);
      }
      ctx.globalAlpha = 1;
      if (granos.length) requestAnimationFrame(bucle);
      else { corriendo = false; ctx.clearRect(0, 0, lienzo.width, lienzo.height); }
    }
  })();

  /* ───────────────── horario en vivo (también con movimiento reducido) ───────────────── */
  (function horario() {
    var H = window.RaicesHorario;
    if (!H) return;
    var franjas = $('#franjas');
    if (franjas) {
      /* la semana en horas: cada turno se parte en la medianoche y sigue al día siguiente */
      var orden = [1, 2, 3, 4, 5, 6, 0], cortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      var tramos = {}; orden.forEach(function (d) { tramos[d] = []; });
      H.TURNOS.forEach(function (t) {
        tramos[t[0]].push([t[1], Math.min(t[2], 1440), false]);
        if (t[2] > 1440) tramos[(t[0] + 1) % 7].push([0, t[2] - 1440, true]);
      });
      franjas.innerHTML = orden.map(function (d) {
        return '<div class="franja"><span>' + cortos[d] + '</span><span class="franja__pista">' +
          tramos[d].map(function (t) {
            return '<span class="franja__tramo' + (t[2] ? ' franja__tramo--sigue' : '') + '" style="left:' + (t[0] / 14.4).toFixed(2) + '%;width:' + ((t[1] - t[0]) / 14.4).toFixed(2) + '%"></span>';
          }).join('') + '</span></div>';
      }).join('');
      var total = H.TURNOS.reduce(function (a, t) { return a + t[2] - t[1]; }, 0) / 60;
      $$('[data-horas-semana]').forEach(function (n) { n.textContent = String(total).replace('.', ','); });
    }
    function pintar() {
      var e = H.estado(new Date());
      $$('[data-estado]').forEach(function (el) {
        el.classList.toggle('abierto', e.abierto);
        var t = $('[data-estado-texto]', el);
        if (t) t.textContent = e.corto || e.texto;
      });
      $$('.dia').forEach(function (d) { d.classList.toggle('dia--hoy', +d.dataset.dia === e.hoy); });
    }
    pintar();
    setInterval(pintar, 30000);
  })();

  /* ───────────────── cabecera y menú ───────────────── */
  var cabecera = $('#cabecera');
  var boton = $('#hamburguesa');
  (function cabeceraFija() {
    if (!cabecera) return;
    function actualizar() { cabecera.classList.toggle('cabecera--fija', window.scrollY > window.innerHeight * 0.55); }
    window.addEventListener('scroll', actualizar, { passive: true });
    actualizar();
  })();

  function cerrarMenu() {
    if (!cabecera || !boton || !cabecera.classList.contains('menu-abierto')) return;
    cabecera.classList.remove('menu-abierto');
    boton.setAttribute('aria-expanded', 'false');
    $('.visualmente-oculto', boton).textContent = 'Abrir menú';
    if (lenis) lenis.start();
  }
  if (boton) {
    boton.addEventListener('click', function () {
      var abierto = cabecera.classList.toggle('menu-abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      $('.visualmente-oculto', boton).textContent = abierto ? 'Cerrar menú' : 'Abrir menú';
      if (lenis) { if (abierto) lenis.stop(); else lenis.start(); }
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });

  /* ───────────────── mapa, solo al pulsar ───────────────── */
  (function mapa() {
    var btn = $('#mapa-boton'), caja = $('#mapa-consentimiento');
    if (!btn || !caja) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Raíces Café Bar, Pl. España 15a, 06300 Zafra, Badajoz') + '&output=embed';
      marco.loading = 'lazy';
      marco.title = 'Mapa: Raíces Café Bar en la Plaza de España de Zafra';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      caja.parentNode.replaceChild(marco, caja);
    });
  })();

  /* ───────────────── aviso de cookies ───────────────── */
  (function cookies() {
    var caja = $('#cookies'), ok = $('#cookies-aceptar');
    if (!caja || !ok) return;
    var guardado = null;
    try { guardado = localStorage.getItem('raices-sac-cookies'); } catch (e) {}
    if (guardado !== 'ok') { caja.hidden = false; document.body.classList.add('cookies-visibles'); }
    ok.addEventListener('click', function () {
      caja.hidden = true;                                   /* el CSS solo pone display si NO hay [hidden] */
      document.body.classList.remove('cookies-visibles');
      try { localStorage.setItem('raices-sac-cookies', 'ok'); } catch (e) {}
    });
  })();

  var anio = $('#anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* las medidas cambian cuando llega la webfont: recalcular anclajes */
  if (gsapReady && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     [MANDO DE MAQUETA] — SOLO REVISIÓN INTERNA. NO PUBLICAR.
     Borrar este bloque entero, el bloque CSS marcado igual en estilos.css,
     el <div class="mando">, los data-solo-sobria del HTML y la parte del
     script bloqueante del <head> que lee raices-sac-densidad.
     ═══════════════════════════════════════════════════════════════════════ */
  (function mandoMaqueta() {
    var mando = $('#mando');
    if (!mando) return;
    /* solo con ?revision en la URL: el enlace que recibe el cliente sale limpio
       y el mando aparece cuando se le enseña la web en persona */
    if (!/[?&]revision\b/.test(window.location.search)) return;
    mando.hidden = false;                                   /* sin JS no haría nada: lo enseña el JS */
    var botones = $$('[data-densidad]', mando);
    function aplicar(d) {
      html.classList.remove('densidad-sacuanjoche', 'densidad-sobria');
      html.classList.add('densidad-' + d);
      botones.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.densidad === d ? 'true' : 'false'); });
      try { localStorage.setItem('raices-sac-densidad', d); } catch (e) {}
      if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 80);
    }
    var actual = sobria() ? 'sobria' : 'sacuanjoche';
    botones.forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.densidad === actual ? 'true' : 'false');
      b.addEventListener('click', function () { aplicar(b.dataset.densidad); });
    });
  })();
  /* ═══════════ fin del bloque [MANDO DE MAQUETA] ═══════════ */
})();
