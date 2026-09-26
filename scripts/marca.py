"""Marca de Raíces Café Bar — PROPUESTA, A VALIDAR POR EL CLIENTE.

Redibujo del sello «RC» (no es un calco con potrace):
  - disco y aro fino medidos sobre logo-original.jpg (centro, radio, grosor);
  - letras con los glifos de Zilla Slab Medium (mismo grosor de asta que el original), colocadas en las cajas medidas de la R y la C;
  - perfil negro limpio: una copia desplazada un vector CONSTANTE + contorno de grosor fijo;
  - ramillete: líneas centrales sacadas con la tubería de trazos de pluma (ramillete.py).

Genera en ../assets/logo/: sello, lockup horizontal, versión mono y favicon, y
../assets/logo/marca.json con los trazados para pintarlos inline en la web.

    python scripts/ramillete.py && python scripts/marca.py
"""
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, '..', 'assets', 'logo')
os.makedirs(SALIDA, exist_ok=True)

VERDE, HONDO, CREMA, NEGRO, YEMA = '#0D393C', '#0E2D30', '#FCF0CC', '#0A1414', '#F2C94C'
K = 500 / 487
ARO = (238.3 * K, 243.1 * K, 172.2 * K)            # centro y radio medidos
HUECO = (336, 16)                                    # grados donde el ramillete sustituye al aro
PERFIL = (-3.2, 3.2)                                 # desplazamiento constante del perfil negro
CONTORNO = 6.4                                       # grosor del contorno negro (3,2 px a cada lado)

bold = TTFont(os.path.join(AQUI, 'fuentes', 'ZillaSlab-Bold.ttf'))
semi = TTFont(os.path.join(AQUI, 'fuentes', 'ZillaSlab-SemiBold.ttf'))
medium = TTFont(os.path.join(AQUI, 'fuentes', 'ZillaSlab-Medium.ttf'))   # asta/alto 0,154 frente a 0,151 del original


def glifo(fuente, car):
    return fuente.getGlyphSet()[fuente.getBestCmap()[ord(car)]]


def glifo_en_caja(fuente, car, x0, y0, x1, y1):
    """Trazado del glifo escalado (uniforme) para que su alto llene la caja y centrado en ella."""
    g = glifo(fuente, car)
    bp = BoundsPen(fuente.getGlyphSet()); g.draw(bp)
    gx0, gy0, gx1, gy1 = bp.bounds
    s = (y1 - y0) / (gy1 - gy0)
    ancho = (gx1 - gx0) * s
    dx = (x0 + x1) / 2 - ancho / 2 - gx0 * s
    dy = y1 + gy0 * s                                  # el eje Y de la fuente va hacia arriba
    pen = SVGPathPen(fuente.getGlyphSet(), ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    g.draw(TransformPen(pen, (s, 0, 0, -s, dx, dy)))
    return pen.getCommands(), ancho


def texto(fuente, cadena, x, base, tam, tracking=0.0):
    """Texto convertido a trazados (el SVG no depende de ninguna fuente instalada)."""
    upm = fuente['head'].unitsPerEm
    s = tam / upm
    gs = fuente.getGlyphSet(); cmap = fuente.getBestCmap(); hmtx = fuente['hmtx']
    out = []
    for c in cadena:
        nombre = cmap[ord(c)]
        pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
        gs[nombre].draw(TransformPen(pen, (s, 0, 0, -s, x, base)))
        cmd = pen.getCommands()
        if cmd: out.append(cmd)
        x += hmtx[nombre][0] * s + tracking * tam
    return ' '.join(out), x


def arco(cx, cy, r, a0, a1):
    """Arco en sentido horario de a0 a a1 (grados, eje Y hacia abajo)."""
    import math
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    x0, y0 = p(a0); x1, y1 = p(a1)
    barrido = (a1 - a0) % 360
    return 'M%.2f %.2f A%.2f %.2f 0 %d 1 %.2f %.2f' % (x0, y0, r, r, 1 if barrido > 180 else 0, x1, y1)


R_d, _ = glifo_en_caja(medium, 'R', 119 * K, 249 * K, 286 * K, 441 * K)
C_d, _ = glifo_en_caja(medium, 'C', 205 * K, 89 * K, 347 * K, 282 * K)
ramillete = [t for t in json.load(open(os.path.join(AQUI, 'ramillete.json'))) if t['largo'] >= 9]
aro_d = arco(ARO[0], ARO[1], ARO[2], HUECO[1], HUECO[0])

AVISO = '<!-- Raíces Café Bar · PROPUESTA DE LOGO, A VALIDAR POR EL CLIENTE. Redibujo del sello original. -->'


def letras(tinta_letra=CREMA, perfil=True):
    capas = []
    if perfil:
        # copia desplazada + contorno: un único perfil de grosor constante, sin mordiscos del JPG
        capas.append('<g transform="translate(%.1f %.1f)" fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round">'
                     '<path d="%s"/><path d="%s"/></g>' % (PERFIL[0], PERFIL[1], NEGRO, NEGRO, CONTORNO, R_d, C_d))
        capas.append('<g fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round"><path d="%s"/><path d="%s"/></g>'
                     % (NEGRO, NEGRO, CONTORNO, R_d, C_d))
    capas.append('<g fill="%s"><path d="%s"/><path d="%s"/></g>' % (tinta_letra, R_d, C_d))
    return ''.join(capas)


def ramillete_svg(tinta, ancho=2.1):
    return ('<g fill="none" stroke="%s" stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round">%s</g>'
            % (tinta, ancho, ''.join('<path d="%s"/>' % t['d'] for t in ramillete)))


def sello_interior():
    return ('<circle cx="250" cy="250" r="249" fill="%s"/>' % VERDE +
            '<circle cx="250" cy="250" r="243.5" fill="none" stroke="%s" stroke-width="3"/>' % HONDO +
            '<path d="%s" fill="none" stroke="%s" stroke-width="2.1" stroke-linecap="round"/>' % (aro_d, CREMA) +
            ramillete_svg(CREMA) + letras())


# 1 · sello circular
sello = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img" aria-label="Raíces Café Bar">'
         + AVISO + '<title>Raíces Café Bar</title>' + sello_interior() + '</svg>')
open(os.path.join(SALIDA, 'raices-sello.svg'), 'w', encoding='utf8').write(sello)

# 2 · lockup horizontal: sello + «Raíces» + «CAFÉ BAR»
nombre_d, fin1 = texto(semi, 'Raíces', 560, 300, 250, 0)
sub_d, fin2 = texto(semi, 'CAFÉ BAR', 566, 392, 64, 0.32)
ancho_lock = max(fin1, fin2) + 20
lockup = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d 500" role="img" aria-label="Raíces Café Bar">' % ancho_lock
          + AVISO + '<title>Raíces Café Bar</title>' + sello_interior()
          + '<path fill="%s" d="%s"/>' % (VERDE, nombre_d)
          + '<rect x="566" y="330" width="%.0f" height="2.4" fill="%s"/>' % (fin2 - 566 - 0.32 * 64, YEMA)
          + '<path fill="%s" d="%s"/>' % (VERDE, sub_d) + '</svg>')
open(os.path.join(SALIDA, 'raices-lockup.svg'), 'w', encoding='utf8').write(lockup)

# 3 · mono, una sola tinta (currentColor): el aro se corta alrededor de las letras con una máscara
mono = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img" aria-label="Raíces Café Bar" fill="currentColor" color="%s">' % VERDE
        + AVISO + '<title>Raíces Café Bar</title>'
        + '<defs><mask id="m-hueco"><rect width="500" height="500" fill="#fff"/>'
        + '<g fill="#000" stroke="#000" stroke-width="16" stroke-linejoin="round"><path d="%s"/><path d="%s"/></g></mask></defs>' % (R_d, C_d)
        + '<circle cx="250" cy="250" r="246" fill="none" stroke="currentColor" stroke-width="5"/>'
        + '<g mask="url(#m-hueco)"><path d="%s" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' % aro_d
        + ramillete_svg('currentColor', 2.4) + '</g>'
        + '<g fill="currentColor"><path d="%s"/><path d="%s"/></g>' % (R_d, C_d) + '</svg>')
open(os.path.join(SALIDA, 'raices-mono.svg'), 'w', encoding='utf8').write(mono)

# 4 · favicon: a 32 px el ramillete y el aro son ruido; quedan disco, R y C más gruesas
Rf, _ = glifo_en_caja(bold, 'R', 60, 214, 300, 470)
Cf, _ = glifo_en_caja(bold, 'C', 196, 36, 440, 290)
fav = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">' + AVISO
       + '<circle cx="250" cy="250" r="250" fill="%s"/>' % VERDE
       + '<g fill="%s" stroke="%s" stroke-width="30" stroke-linejoin="round"><path d="%s"/><path d="%s"/></g>' % (NEGRO, NEGRO, Rf, Cf)
       + '<g fill="%s"><path d="%s"/><path d="%s"/></g>' % (CREMA, Rf, Cf) + '</svg>')
open(os.path.join(SALIDA, '..', 'favicon.svg'), 'w', encoding='utf8').write(fav)

# datos para la web (inline, animables)
json.dump({
    'aviso': 'Propuesta de logo, a validar por el cliente.',
    'aro': aro_d, 'aroCentro': [round(ARO[0], 2), round(ARO[1], 2), round(ARO[2], 2)],
    'R': R_d, 'C': C_d, 'perfil': PERFIL, 'contorno': CONTORNO,
    'ramillete': ramillete,
}, open(os.path.join(SALIDA, 'marca.json'), 'w', encoding='utf8'), ensure_ascii=False)
print('ok', len(ramillete), 'trazos de ramillete; lockup', ancho_lock, 'de ancho')
