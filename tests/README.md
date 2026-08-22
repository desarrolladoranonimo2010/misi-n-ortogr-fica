# Pruebas automatizadas (QA)

Estos archivos no forman parte del juego (no se cargan desde index.html).
Son el arnés de pruebas usado durante el desarrollo para verificar que
las 16 pantallas, los 12 tipos de desafío, los 10 niveles y el examen
final funcionan de principio a fin sin errores.

## Cómo ejecutarlas

```bash
cd gvsj
npm install jsdom --no-save
node tests/test.js
```

Simula partidas completas (incluyendo el camino de "game over" por
vidas agotadas), reto rápido, dos jugadores, modo exposición y
reinicio de progreso, usando siempre las respuestas reales generadas
por la base de datos del juego.
