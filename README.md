# Raíces Café Bar (Zafra) · «Sacuanjoche»

Maqueta de una sola página para **Raíces Café Bar**, Pl. España 15a, 06300 Zafra (Badajoz).
Web hermana del mismo negocio: «Dos orillas» (`raices-cafe-bar-zafra-dos-orillas-web`).

## Concepto

**Botánico nocturno.** La flor de la carta impresa (la plumeria, el sacuanjoche de Nicaragua) y el
ramillete del sello: se entra por una plumeria que se abre, en el hero se dibuja el ramillete del logo
y después la flor, y la carta es un herbario donde cada sección es una lámina y cada plato un espécimen.

- Paleta: verde del sello `#0D393C` de fondo, crema `#FCF0CC` en las superficies claras y un único
  acento, la yema `#F2C94C`. Donde la yema es texto sobre crema se usa `--yema-texto`, derivada con
  `color-mix` del mismo acento.
- Tipografía: Zilla Slab (afín al monograma) + Figtree.
- Movimiento protagonista: trazo que se dibuja (ramillete, pétalos, láminas), con Lenis, char-reveal
  (palabra `inline-block` + `nowrap`), botones magnéticos y tira de nombres que acelera con el scroll.
- Firma de interacción: el cursor deja un rastro de polen (sprites precacheados; ni en táctil ni con
  movimiento reducido ni en la densidad sobria).

## Qué la separa de «Dos orillas»

| | Sacuanjoche (esta) | Dos orillas |
|---|---|---|
| Eje de la página | **Una sola columna vertical y editorial.** Nada se parte en dos. | Pantalla partida aquí / allá con un eje verde en medio |
| Hero | Libre, sin pin: la flor se dibuja sola y, al bajar, gira y se va al fondo desenfocada detrás de «La casa» | Anclado con pin: el scroll hace crecer raíces que parten la pantalla |
| Cómo se ordena la carta | **Por secciones de la carta** (5 láminas con título pegajoso) | Por **orilla** (`aqui` / `alla` / `compartida`): columnas enfrentadas que convergen |
| Uso del campo `orilla` | Solo como «hábitat» en la ficha de los tres más pedidos | Es la estructura de toda la web |
| Motivo | La plumeria y plantas dibujadas (plátano, encina, limonero, sacuanjoche, caña) | Raíces que crecen y se bifurcan |
| Fondo | Verde dominante, crema en la carta | Neutro claro con ocre y plátano; el verde solo en el eje |
| Horario | Una flor por día: abiertas vie–dom, botones cerrados lun–jue | Una raíz con ramas vivas y nudos secos |
| Frase | Nunca «de aquí y de allá» (reservada para la hermana) | Sí |

## Secciones

1. **Hero** — ramillete del logo → cinco pétalos y aro fino → yema con rebote → «Raíces» letra a letra.
2. **La casa** — Plaza de España, terraza, viernes a domingo. Párrafo corto, sin biografía.
3. **Tira** — los 37 platos en una cinta (en la sobria: una línea de datos).
4. **La carta como herbario** — láminas I–V con título pegajoso y planta que se dibuja al entrar.
5. **Los más pedidos** — los tres `destacados`, como fichas de espécimen.
6. **Reseñas** — 4,8 y 49, con enlace a Google. Citas: [PENDIENTE].
7. **Horario y dónde** — estado en vivo (Europe/Madrid, turnos que cruzan medianoche) y mapa por clic.
8. **Pie.**

## Datos: de dónde sale cada cosa

- **Carta**: `data/carta.json`, copiada tal cual de `raices-cafe-bar-zafra-bocetos/` (foto de la carta
  plastificada + lista de texto del cliente, 2026-09-26). **La web se pinta desde ahí**:
  `node scripts/construir.mjs` rellena los bloques `<!-- construir:… -->` de `index.html` (carta,
  destacados, tira, recuentos y cifras). Se pinta en el HTML y no con `fetch()` para que la carta se
  vea sin JavaScript y con doble clic. Ningún recuento está escrito a mano.
- **Descripciones de plato**: `data/notas-carta.json`, seis líneas nuestras para platos y bebidas nicas.
  Todas [REVISAR CLIENTE]; en la web van en cursiva con ‡.
- **Ficha de Google** (DATOS-RAICES.md, consultada 2026-09-26): dirección, teléfono, horario, 4,8★/49,
  10–20 €, terraza.
- **Facebook** «Café Bar Raíces | Zafra» (leído 2026-09-26): dirección Plaza España 15A; publicaciones
  de 2023-04-02 a 2024-09-26. Frases propias: «Un pedacito de Nicaragua en zafra» (2023-04-19) y
  «Mezcla de sabores, aquí en bar Raices» (2023-08-25). **Con la primera se da por confirmado el vínculo
  nica de la casa** y se usa la línea del sacuanjoche. La biografía de los dueños sigue sin confirmar:
  la web no habla de ellos.

### Hallazgo importante: el Instagram no es de este bar

`instagram.com/raices_cafe_` (el que figura en DATOS-RAICES.md), leído el 2026-09-26, es **«Raíces
café», una cafetería de brunch argentina de Palma de Mallorca** (Carrer Mare de Déu de Montserrat 6, Es
Rafal Vell; abrió en abril de 2024; dueños Leo y Sofi; bio «CERRADO PERMANENTE»). Consecuencias:

- **Cero fotos**: sus fotos son de otro local y otra comida. La web se sostiene con ilustración y tipografía.
- **No se enlaza** ese Instagram (lo comprueba `verificar.mjs`).
- **El sello «RC» coincide con el de esa cafetería**, que lo presentó el 2025-03-12 («agregamos un
  segundo logo con nuestras iniciales»). El JPG del logo lo aportó el usuario el 2026-09-26. No decido
  yo: **hay que confirmar con el cliente que el sello es suyo** antes de usarlo. [VERIFICAR]

## Logo (propuesta, a validar por el cliente)

`marca.html` enseña original y versiones. Generado por `scripts/ramillete.py` + `scripts/marca.py`:

- `assets/logo/raices-sello.svg` — sello circular. Disco y aro fino **medidos** sobre el JPG; letras de
  Zilla Slab **Medium** (asta/alto 0,154 frente a 0,151 del original); perfil negro limpio = copia con
  **desplazamiento constante** (−3,2, +3,2) + contorno fijo.
- `assets/logo/raices-lockup.svg` — sello + «Raíces» + «CAFÉ BAR».
- `assets/logo/raices-mono.svg` — una tinta, `currentColor`, con el aro cortado alrededor de las letras.
- `assets/favicon.svg` — legible a 32 px (sin aro ni ramillete, letras en Bold).
- **Ramillete como trazo central animable**: tubería de trazos de pluma (`scripts/penlib.py`, la de
  Cervantes): ampliar ×8 + desenfoque, umbral, Zhang-Suen, grafo por ramas, giro mínimo, RDP +
  Catmull-Rom. 13 trazos en `assets/logo/marca.json`, ordenados del tallo a la flor.

## Pendientes, con su fuente y su fecha

| Marca | Qué | Fuente · fecha |
|---|---|---|
| [VERIFICAR] | Que el sello «RC» sea del cliente (coincide con el de la cafetería de Palma) | Instagram @raices_cafe_, post 2025-03-12 |
| [VERIFICAR] | Tacos mexicanos 10 €, Maduro con queso 8 €, Tajadas con queso 8 € (precio medio tapado por un reflejo) | carta.json · foto de la carta, 2026-09-26 |
| [VERIFICAR] | Pollo asado nica: precio ilegible (sale «—») | carta.json · foto de la carta, 2026-09-26 |
| [VERIFICAR] | «Jalapeño» 12 €: no está claro qué plato es; va el nombre literal | carta.json · 2026-09-26 |
| [VERIFICAR] | Maduro con leche condensada: sale en la foto pero no en la lista de texto | carta.json · 2026-09-26 |
| [VERIFICAR] | «/R» = por ración (en la web: «ración») | carta.json · 2026-09-26 |
| [PENDIENTE] | Precios de las 7 bebidas | carta.json (todas `null`) · 2026-09-26 |
| [PENDIENTE] | Reseñas reales (nombre de pila + inicial) y permiso para citarlas | — |
| [PENDIENTE] | Titular, NIF, correo (aviso legal y privacidad) | — |
| [PENDIENTE] | WhatsApp: no confirmado, no se pone | DATOS-RAICES.md · 2026-09-26 |
| [REVISAR CLIENTE] | Las 6 descripciones de `data/notas-carta.json` (repocheta, tajadas, maduro, Rojita, Toña, Flor de Caña) | nuestras · 2026-09-26 |
| [REVISAR CLIENTE] | La cita «Un pedacito de Nicaragua en Zafra» en «La casa» | Facebook de la casa · 2023-04-19 |
| [REVISAR CLIENTE] | «Terraza · cuando acompaña el tiempo» (Google solo dice que hay terraza) | ficha de Google · 2026-09-26 |

## Comandos

```bash
node scripts/construir.mjs          # pinta la carta y los recuentos desde data/carta.json
node scripts/test-horario.mjs       # horario con fechas simuladas (los 4 casos obligatorios + bordes)
node scripts/verificar.mjs          # 72 comprobaciones con Playwright; --capturas guarda screenshots/
node scripts/servir.mjs             # http://127.0.0.1:4290
python scripts/ramillete.py && python scripts/marca.py   # rehace el logo
python scripts/paginas.py           # aviso legal, privacidad, 404 y marca.html
node scripts/og.mjs                 # assets/og-raices.jpg (con servir.mjs levantado)
```

`verificar.mjs` usa el Playwright de `alvarotaiagu.github.io/node_modules` y el axe-core de
`subcon-works-web/node_modules`.

## Quitar el mando de maqueta

El mando (abajo a la izquierda: «Sacuanjoche» / «Sobria») **solo aparece si la URL lleva `?revision`**
(`https://alvarotaiagu.github.io/raices-cafe-bar-zafra-sacuanjoche-web/?revision`). El enlace que se
manda al cliente, sin el parámetro, sale limpio; en la reunión se abre el de revisión para comparar.
Sin `?revision` tampoco se aplica una densidad guardada.

Para la entrega definitiva se quita del todo. La receta está hecha script y probada contra los archivos:

```bash
# 1. copia el sitio a otra carpeta (nunca sobre la maqueta)
node scripts/quitar-mando.mjs ../raices-entrega
node ../raices-entrega/scripts/construir.mjs
node ../raices-entrega/scripts/comprobar-borrado.mjs     # tiene que decir «Sin rastros del mando»
```

Qué quita: el `<div class="mando">`, la lectura de `raices-sac-densidad` del `<head>`, la clase
`densidad-sacuanjoche`, los bloques `data-solo-sobria` (casa en cifras, tira de datos, semana en
horas, carta en cifras), el bloque CSS y el JS marcados `[MANDO DE MAQUETA]`, la función `sobria()`,
`cifras()` y sus recuentos del generador, y la fila de la densidad en `privacidad.html`. Si se elige
la sobria para el cliente, primero se pasa a CSS base lo que se quiera conservar de ella.

## Notas

- `noindex, nofollow` en todas las páginas, justo tras el charset.
- Lenis desde jsDelivr (cdnjs ya no lo sirve). Su hoja va pegada a mano en `estilos.css`.
- La cortina no bloquea el scroll: se retira al primer gesto, sale una vez por sesión y tiene dos redes
  de seguridad (en `main.js` y en el `<head>`, por si `main.js` no llega a cargar).
- El desenfoque de la flor es un sprite de 200 px rasterizado **una vez**; al hacer scroll solo cambia
  su opacidad.
- El 404 usa rutas relativas: si se publica en GitHub Pages bajo un prefijo, hay que pasarlas a
  absolutas con el nombre del repo.
