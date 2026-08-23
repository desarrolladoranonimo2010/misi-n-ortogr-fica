# G vs J — La Misión Ortográfica

Juego educativo interactivo sobre el uso de la G y la J en la ortografía
española. Desarrollado como complemento directo de una exposición escolar
sobre el mismo tema, basado en la investigación "El uso de la G y la J en
la ortografía española".

No requiere backend, cuenta ni conexión a internet para funcionar (excepto
la carga inicial de tipografías web). Todo el progreso se guarda en el
propio navegador (`localStorage`).

### Música y efectos

El juego genera efectos de acierto y error con Web Audio. Para añadir música,
crea la carpeta `audio/` y coloca estos archivos con estos nombres:

- `audio/musica-fondo.mp3` para niveles, reto rápido y desafío final.
- `audio/musica-fondo-lobby.mp3` para el inicio, menús, teoría, exposición y
  pantallas fuera de una partida.
- `audio/musica-duelo.mp3` para Dos jugadores.

Las rutas también están indicadas directamente en `js/ui.js`, en las
constantes `USER_MUSIC_FILE` y `TWO_PLAYER_MUSIC_FILE`.

Los cinco efectos configurables están definidos en el mismo archivo:
`SOUND_CORRECT_FILE`, `SOUND_INCORRECT_FILE`, `SOUND_PLAY_FILE`,
`SOUND_BUTTON_FILE` y `SOUND_VICTORY_FILE`.
La victoria del desafío final y del 1v1 usa además `SOUND_SPECIAL_VICTORY_FILE`.

---

## 1. Cómo ejecutarlo

No necesita instalación ni compilación. Es HTML5 + CSS3 + JavaScript puro.

**Opción A — abrir directamente:**
Abre `index.html` con doble clic en cualquier navegador moderno (Chrome,
Edge, Firefox, Safari).

**Opción B — servidor local (recomendado para evitar restricciones de
`file://` en algunos navegadores):**

```bash
cd gvsj
python3 -m http.server 8080
# luego abre http://localhost:8080 en el navegador
```

o, si tienes Node.js instalado:

```bash
npx serve .
```

**Para la exposición:** el modo "Modo exposición" (accesible desde
JUGAR → Modo exposición) está pensado para proyectarse en pantalla grande;
los textos están dimensionados para leerse a distancia.

---

## 2. Estructura de archivos

```
gvsj/
├── index.html          Punto de entrada, carga fuentes y scripts en orden
├── css/
│   └── style.css        Sistema de diseño completo (una sola hoja)
└── js/
    ├── data.js          Contenido pedagógico: 19 módulos, banco de
    │                    palabras, oraciones/correos/apps/mensajes,
    │                    verbos cambiantes, homófonas, insignias,
    │                    niveles, preguntas de modo exposición
    ├── storage.js        Persistencia (localStorage): progreso,
    │                    puntuación, insignias, estadísticas por regla
    ├── game.js           Motor del juego: generación de desafíos,
    │                    sesión de partida (vidas, racha, puntuación),
    │                    dificultad adaptativa, evaluación de insignias
    ├── ui.js             Renderizado de las 16 pantallas y toda la
    │                    lógica de interacción por tipo de desafío
    └── app.js            Arranque y delegación global de eventos
                         (conecta cada data-action con su función)
```

La separación sigue exactamente la arquitectura pedida: datos, lógica de
juego, estado del jugador (dentro de `game.js`/`storage.js`), UI,
navegación, puntuación, almacenamiento y efectos visuales están en
módulos distintos y no se mezclan.

---

## 3. Arquitectura (resumen técnico)

- **SPA sin framework:** un único `<div id="app">` se vuelve a renderizar
  por completo en cada cambio de pantalla (`render()` en `ui.js`), según
  `State.screen`. No hay recarga de página en ningún momento.
- **Eventos por delegación:** un solo listener de `click` en `document`
  (`app.js`) intercepta cualquier elemento con `data-action="..."` y lo
  enruta a la función correspondiente. Esto evita listeners duplicados o
  huérfanos al re-renderizar.
- **Motor de desafíos desacoplado de la UI:** `game.js` no toca el DOM.
  `ChallengeFactory` construye objetos de desafío homogéneos a partir de
  la base de datos (`WORDS`, `TEXT_CHALLENGES`, `VERB_CHANGES`,
  `MEANING_CHALLENGES`, `MATCH_PAIRS`); `ui.js` sólo sabe pintarlos y
  leer la respuesta del usuario.
- **`GameSession`:** clase que controla una partida (nivel, examen final):
  vidas, racha, puntuación con bonus de velocidad/racha y penalización
  por error, progreso y resumen final.
- **Persistencia incremental:** cada respuesta (`Storage.recordAnswer`)
  actualiza estadísticas por letra, por regla y por contexto, lo que
  alimenta tanto la pantalla de Progreso como el sistema de repaso
  inteligente (detecta las reglas con más errores y ofrece repasarlas).
- **Dificultad adaptativa real:** en el Reto Rápido, cada palabra
  siguiente se elige dinámicamente según la precisión acumulada del
  jugador (`adaptiveDifficulty` en `game.js`), no de una lista fija.

---

## 4. Funcionalidades implementadas

Todo lo solicitado en el prompt original está implementado y funcional
(sin placeholders ni botones decorativos):

- **19 módulos de teoría** (modo Aprender) con reglas, ejemplos y cajas
  de excepción, navegables módulo a módulo.
- **12 tipos de desafío:** elegir G/J, corrige la palabra, detecta el
  error en una oración, completa la palabra, une la regla, palabra
  trampa, verbo cambiante, significado (homófonas), correo profesional,
  interfaz de app, modo ciberseguridad y modo programador.
- **10 niveles progresivos C1/C1+** + **Examen final C2 ("El Gran Desafío
  G vs J")** que combina todos los contenidos y tipos de desafío.
- **Sistema de puntuación:** +100 por acierto, +50 de bonus por rapidez
  (<6s), +25 por cada nivel de racha (hasta ×5), penalización moderada
  por error.
- **Sistema de vidas** (3 oportunidades) con retroalimentación educativa
  completa en cada error: respuesta del jugador, respuesta correcta,
  regla aplicable y ejemplos — nunca un simple "incorrecto".
- **Sistema de combo/racha** visible en el HUD durante la partida.
- **10 insignias** con condiciones reales verificadas contra las
  estadísticas guardadas.
- **Pantalla de Progreso:** niveles completados, puntuación, precisión,
  mejor racha, mejor reto rápido, insignias, y una barra por regla que
  muestra qué se domina y qué necesita repaso.
- **Repaso inteligente:** al terminar un nivel, si detecta reglas con
  alta tasa de error, ofrece un botón "Repasar regla" directo al módulo
  correspondiente.
- **Reto rápido (60 segundos)** con dificultad adaptativa y mejor marca
  guardada.
- **Modo Dos Jugadores** (opcional, local, sin backend).
- **Modo exposición C2:** 10 preguntas de análisis, justificación y edición
  listas para lanzar al público con revelado de respuesta y explicación,
  pensado para proyectarse en pantalla grande.
  selección de nivel, tutorial (método de 6 pasos), aprender, módulo de
  aprender, juego, resultado de nivel, progreso, insignias, reglas
  (referencia rápida), reto rápido, resultado de reto rápido, dos
  jugadores, modo exposición y créditos.
- **Persistencia completa** vía `localStorage`, con "Restablecer
  progreso" protegido por un modal de confirmación (con botón X,
  cancelar y cierre con Escape — ningún modal queda atrapado).
- **Accesibilidad básica:** foco visible por teclado, elementos
  interactivos no nativos con `role="button"` y `tabindex`, activación
  con Enter/Espacio, `aria-label` en botones de ícono.
- **Responsive:** de escritorio a móvil, con tipografía fluida (`clamp`)
  y rejillas que colapsan en pantallas pequeñas.

---

## 5. Verificación de calidad realizada

Antes de entregar el proyecto se ejecutó una batería de pruebas
automatizadas (Node + jsdom) que:

- Recorre y renderiza los 19 módulos de teoría sin error.
- Juega **los 10 niveles completos + el examen final** respondiendo
  correctamente cada uno de los 12 tipos de desafío, verificando que
  siempre se llegue a la pantalla de resultado.
- Simula también el camino de **derrota por vidas agotadas**.
- Completa el Reto Rápido, el modo Dos Jugadores y las 10 preguntas del
  Modo Exposición.
- Verifica que el reinicio de progreso limpie el estado y vuelva a
  bloquear los niveles.
- Confirma que ningún botón visible en las pantallas principales tenga
  una acción rota.

La batería se corrió repetidas veces (el contenido se elige al azar en
cada partida) sin fallos.

---

## 6. Notas de contenido

Todas las reglas, ejemplos y excepciones incluidos en `data.js`
corresponden a los puntos indicados en la investigación original: el
conflicto fonético G/J, GUE/GUI vs GÜE/GÜI y la diéresis, GEST-/GEO-/
LEG-/GEN, las terminaciones de G y de J (incluidas las cultas y
científicas), los verbos en -ger/-gir/-igerar y sus excepciones (tejer,
crujir), AJE-/EJE-, -aje/-eje/-jería/-jero/-jear, los verbos "rebeldes"
(decir, traer, verbos en -ducir), las familias léxicas, la alternancia
G→J en la conjugación, las homófonas y parónimas, y los escenarios de
contexto profesional, interfaz de aplicación, ciberseguridad,
programación y contenido web. El módulo de ciberseguridad se mantiene
estrictamente educativo/preventivo, sin explicar técnicas de ataque.

---

## 7. Mejoras futuras (no solicitadas en el brief original)

- Pronunciación por voz (Web Speech API) como apoyo opcional adicional
  en el modo Aprender.
- Exportar/importar el progreso guardado como archivo, para llevarlo
  entre dispositivos.
- Modo multijugador en red (actualmente el modo "Dos jugadores" es
  local, en el mismo dispositivo, como se especificó).
- Más idiomas de interfaz.
