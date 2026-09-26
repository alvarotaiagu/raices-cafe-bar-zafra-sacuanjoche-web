"""Páginas secundarias: aviso legal, privacidad, 404 y la hoja del logo (marca.html).
    python scripts/paginas.py
"""
import os
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def cabeza(titulo, extra=''):
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Zilla+Slab:ital,wght@0,500;0,600;1,400&display=swap">
<style>
  :root {{ --verde:#0D393C; --crema:#FCF0CC; --yema:#F2C94C; --yema-texto:#656A3B; --tinta-suave:#41625F; }}
  body {{ margin:0; background:var(--crema); color:var(--verde); font:400 1.02rem/1.7 Figtree, system-ui, sans-serif; }}
  main {{ max-width:44rem; margin:0 auto; padding:4rem 1.4rem 5rem; }}
  h1 {{ font:600 clamp(2.2rem,6vw,3.2rem)/1.05 "Zilla Slab", Georgia, serif; margin:0 0 1.4rem; }}
  h2 {{ font:600 1.45rem/1.2 "Zilla Slab", Georgia, serif; margin:2.4rem 0 .7rem; }}
  a {{ color:var(--verde); font-weight:600; }}
  .volver {{ display:inline-flex; gap:.5rem; margin-bottom:2rem; text-decoration:none; }}
  .pendiente {{ font:600 .72rem/1 Figtree, sans-serif; letter-spacing:.08em; text-transform:uppercase; color:var(--yema-texto); background:rgba(242,201,76,.3); padding:.25em .5em; border-radius:3px; }}
  .aviso {{ background:#F4E4B6; border-radius:12px; padding:1rem 1.2rem; }}
  table {{ border-collapse:collapse; width:100%; font-size:.95rem; }}
  th, td {{ text-align:left; padding:.55rem .6rem .55rem 0; border-bottom:1px solid rgba(13,57,60,.18); vertical-align:top; }}
  code {{ font-size:.88em; }}
  {extra}
</style>
</head>
<body>
<main>
  <a class="volver" href="./">← Volver a Raíces</a>
'''


PIE = '''</main>
</body>
</html>
'''

LEGAL = cabeza('Aviso legal · Raíces Café Bar') + '''  <h1>Aviso legal</h1>
  <p class="aviso">Borrador de trabajo para la maqueta. Lo tiene que revisar el titular del negocio y completar los datos marcados como pendientes antes de publicar.</p>

  <h2>Titular del sitio</h2>
  <p>
    Nombre o razón social: <span class="pendiente">[PENDIENTE]</span><br>
    NIF/CIF: <span class="pendiente">[PENDIENTE]</span><br>
    Domicilio: Pl. España, 15a · 06300 Zafra (Badajoz)<br>
    Teléfono: 625 11 35 54<br>
    Correo electrónico: <span class="pendiente">[PENDIENTE]</span>
  </p>

  <h2>Objeto</h2>
  <p>Este sitio informa sobre Raíces Café Bar: su carta, su horario y dónde está. No vende nada en línea ni toma reservas.</p>

  <h2>Propiedad intelectual</h2>
  <p>Los textos, el diseño y las ilustraciones del sitio pertenecen a su titular. El logotipo es un redibujo del sello del negocio y está pendiente de validación por su titular. Los nombres de marcas de bebidas de la carta (por ejemplo, Toña, Flor de Caña, Corona o Smirnoff) pertenecen a sus propietarios y se citan solo como texto, para informar de lo que se sirve.</p>

  <h2>Enlaces externos</h2>
  <p>El sitio enlaza a Facebook y a Google Maps. El titular no responde del contenido de esas páginas.</p>

  <h2>Legislación aplicable</h2>
  <p>Este aviso se rige por la legislación española.</p>
''' + PIE

PRIVACIDAD = cabeza('Privacidad y cookies · Raíces Café Bar') + '''  <h1>Privacidad y cookies</h1>
  <p class="aviso">Borrador de trabajo para la maqueta. Lo tiene que revisar el titular del negocio antes de publicar.</p>

  <h2>Datos personales</h2>
  <p>Este sitio no tiene formularios, no pide datos y no usa analítica ni publicidad. Si llamas por teléfono, esos datos los trata el negocio fuera de esta web.</p>
  <p>Responsable: <span class="pendiente">[PENDIENTE]</span> · Contacto para ejercer tus derechos: <span class="pendiente">[PENDIENTE]</span></p>

  <h2>Qué guarda tu navegador</h2>
  <p>La web no instala cookies propias. Usa el almacenamiento local de tu navegador para lo mínimo:</p>
  <table>
    <thead><tr><th>Clave</th><th>Dónde</th><th>Para qué</th><th>Duración</th></tr></thead>
    <tbody>
      <tr><td><code>raices-sac-cookies</code></td><td>localStorage</td><td>Recordar que ya has visto el aviso de cookies.</td><td>Hasta que la borres</td></tr>
      <tr><td><code>raices-sac-cortina</code></td><td>sessionStorage</td><td>No repetir la animación de entrada en la misma visita.</td><td>Hasta cerrar la pestaña</td></tr>
      <tr><td><code>raices-sac-densidad</code></td><td>localStorage</td><td>Solo en la maqueta: recordar la densidad elegida en el mando de demostración. No existe en la web publicada.</td><td>Hasta que la borres</td></tr>
    </tbody>
  </table>

  <h2>Terceros</h2>
  <p>Las fuentes se sirven desde Google Fonts y las librerías de animación desde jsDelivr: tu navegador se conecta a esos servidores para descargarlas. El mapa de Google Maps solo se carga si pulsas «Ver el mapa»; desde ese momento, Google puede poner sus propias cookies según su política.</p>
''' + PIE

PETALO = 'M0 0C40 -8 92 -52 70 -118C58 -150 14 -150 2 -112C-6 -80 -8 -36 0 0Z'
E404 = cabeza('Página no encontrada · Raíces Café Bar',
              '.flor { width:120px; height:120px; margin-bottom:1.6rem; } .flor path { fill:none; stroke:var(--verde); stroke-width:3; } .flor circle { fill:var(--yema); }') + \
    '  <svg class="flor" viewBox="-160 -160 320 320" aria-hidden="true"><g transform="rotate(-14)">' + \
    ''.join(f'<path transform="rotate({i * 72})" d="{PETALO}"/>' for i in range(4)) + '''</g><circle r="18"/></svg>
  <h1>A esta flor le falta un pétalo</h1>
  <p>Esta lámina no está en el herbario: la dirección no existe o ha cambiado.</p>
  <p><a href="./">Volver a Raíces</a> · <a href="./#carta">Ver la carta</a> · <a href="tel:+34625113554">625 11 35 54</a></p>
''' + PIE

MARCA = cabeza('Logo · propuesta · Raíces Café Bar', '''
  main { max-width:64rem; }
  .rejilla { display:grid; grid-template-columns:repeat(auto-fit,minmax(15rem,1fr)); gap:1.4rem; margin-top:2rem; }
  figure { margin:0; background:#fff8e4; border:1px solid rgba(13,57,60,.18); border-radius:14px; padding:1.4rem; display:grid; gap:.9rem; justify-items:center; }
  figure img { max-width:100%; height:auto; }
  figcaption { font-size:.9rem; color:var(--tinta-suave); text-align:center; }
  .oscuro { background:var(--verde); } .oscuro figcaption { color:#C5C5A6; }
  .fav { display:flex; gap:1rem; align-items:flex-end; }
  .sello-propuesta { display:inline-block; margin-top:.4rem; font:600 .75rem/1 Figtree; letter-spacing:.14em; text-transform:uppercase; border:1.5px solid var(--yema-texto); color:var(--yema-texto); padding:.5rem .7rem; border-radius:4px; transform:rotate(-2deg); }''') + '''  <h1>Logo de Raíces</h1>
  <span class="sello-propuesta">Propuesta · a validar por el cliente</span>
  <p style="margin-top:1.4rem">Redibujo a mano del sello «RC», sin calcarlo: el disco y el aro fino se han medido sobre el original, las letras son Zilla Slab Medium (el mismo grosor de asta que el original), el perfil negro es ahora un desplazamiento constante y el ramillete se ha sacado como trazo central, para que en la web se dibuje solo.</p>
  <div class="rejilla">
    <figure><img src="scripts/fuentes/logo-original.jpg" alt="Sello original" width="220" height="220"><figcaption>Original (JPG, 487 px)</figcaption></figure>
    <figure><img src="assets/logo/raices-sello.svg" alt="Sello circular redibujado" width="220" height="220"><figcaption>1 · Sello circular · <code>raices-sello.svg</code></figcaption></figure>
    <figure><img src="assets/logo/raices-mono.svg" alt="Versión mono a una tinta" width="220" height="220"><figcaption>3 · Mono, una tinta · <code>raices-mono.svg</code> (toma el color del texto: <code>currentColor</code>)</figcaption></figure>
    <figure style="grid-column:1/-1"><img src="assets/logo/raices-lockup.svg" alt="Lockup horizontal" width="560" height="218"><figcaption>2 · Lockup horizontal · <code>raices-lockup.svg</code></figcaption></figure>
    <figure class="oscuro"><div class="fav"><img src="assets/favicon.svg" alt="Favicon a 16 px" width="16" height="16"><img src="assets/favicon.svg" alt="Favicon a 32 px" width="32" height="32"><img src="assets/favicon.svg" alt="Favicon a 64 px" width="64" height="64"></div><figcaption>4 · Favicon a 16, 32 y 64 px · <code>favicon.svg</code>. A 32 px se quitan el aro y el ramillete, y las letras engordan.</figcaption></figure>
  </div>
  <h2>Pendiente de confirmar</h2>
  <p><span class="pendiente">[VERIFICAR]</span> Este mismo sello «RC» es el que usaba la cafetería Raíces de Palma de Mallorca (Instagram <code>@raices_cafe_</code>, hoy cerrada), que lo estrenó en marzo de 2025. Antes de usarlo, el cliente tiene que confirmar que el sello es suyo.</p>
''' + PIE

# el 404 se sirve en cualquier ruta del repo: sus enlaces tienen que ser absolutos
PREFIJO = '/raices-cafe-bar-zafra-sacuanjoche-web/'
E404 = E404.replace('href="assets/', 'href="' + PREFIJO + 'assets/').replace('href="./"', 'href="' + PREFIJO + '"').replace('href="./#', 'href="' + PREFIJO + '#')

for nombre, texto in [('aviso-legal.html', LEGAL), ('privacidad.html', PRIVACIDAD), ('404.html', E404), ('marca.html', MARCA)]:
    open(os.path.join(RAIZ, nombre), 'w', encoding='utf8').write(texto)
print('páginas escritas')
