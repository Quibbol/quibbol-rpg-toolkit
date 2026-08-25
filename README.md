# Quibbol’s RPG Toolkit

Aplicación web local para gestionar herramientas de partidas y fichas de distintos sistemas de rol.

## Estructura

- index.html: menú principal.
- tools/worldbuilding/: Panel de Mundo independiente de cualquier sistema.
- systems/dnd-5e-2024/character/: ficha de personaje de D&D 5e 2024.
- assets/: recursos y utilidades compartidas.
- schemas/: contratos de las nuevas exportaciones JSON.

Los JSON anteriores siguen siendo admitidos. Las nuevas exportaciones incorporan `_quibbolRpgToolkit` para identificar el módulo, el sistema y la versión del formato. También se siguen admitiendo `_archivoRol` y el identificador `archivo-de-rol` en archivos anteriores.
