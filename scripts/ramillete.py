"""Ramillete del logo -> trazos de pluma (líneas centrales animables).
Tubería de asesoria-cervantes (penlib.py): ampliar x8 + blur, umbral, Zhang-Suen,
grafo por ramas, recorrido por giro mínimo, RDP + Catmull-Rom.
Salida: ramillete.json con paths en coordenadas del sello (viewBox 0 0 500 500).
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageFilter
from penlib import adelgazar, trazos_de, rdp, a_bezier, largo

ESC = 8
X0, Y0, X1, Y1 = 348, 150, 440, 318          # recorte del ramillete en el jpg (487 px)
CX, CY, R = 238.3, 243.1, 172.2               # aro fino medido
K = 500 / 487                                  # jpg -> viewBox del sello

im = Image.open('fuentes/logo-original.jpg').convert('L').crop((X0, Y0, X1, Y1))
im = im.resize(((X1 - X0) * ESC, (Y1 - Y0) * ESC), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.3 * ESC / 4))
a = np.asarray(im).astype(float)
tinta = a > 125

# el aro fino pasa por encima de la flor y por debajo del tallo: se quita fuera del ramillete
yy, xx = np.mgrid[0:tinta.shape[0], 0:tinta.shape[1]]
gx = X0 + xx / ESC; gy = Y0 + yy / ESC
dist = np.abs(np.hypot(gx - CX, gy - CY) - R)
ang = (np.degrees(np.arctan2(gy - CY, gx - CX)) + 360) % 360
aro = (dist < 3.2) & ((ang < 336) & (ang > 300) | (ang > 16) & (ang < 60))
tinta &= ~aro

S = adelgazar(tinta)
T = trazos_de(S.astype(bool), podar_umbral=5 * ESC // 2, corte_giro=1.5, min_pts=6 * ESC)
salida = []
for t in T:
    pts = [((p[1] / ESC + X0) * K, (p[0] / ESC + Y0) * K) for p in t]
    pts = rdp(pts, 0.35)
    salida.append({'d': a_bezier(pts, dec=2), 'largo': round(largo(pts), 1)})
# de abajo (tallo) hacia arriba (flor): así se dibuja como crece
salida.sort(key=lambda s: -float(s['d'].split('C')[0][1:].split()[1]))
json.dump(salida, open('ramillete.json', 'w'), indent=1)
print(len(salida), 'trazos', [s['largo'] for s in salida])

# hoja de control
prev = Image.new('RGB', (tinta.shape[1], tinta.shape[0]), (13, 57, 60))
prev.paste(Image.fromarray((tinta * 90).astype(np.uint8)).convert('RGB'))
prev.save(sys.argv[1] if len(sys.argv) > 1 else 'ramillete-control.png')
