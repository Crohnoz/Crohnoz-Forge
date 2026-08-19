# Bitácora — Crohnoz Forge release prep

**Fecha:** 2026-08-19  
**Objetivo:** dejar Forge preparado para publicación del 20 de agosto de 2026.

## Estado del producto
- Public Forge y Forge Studio ya se presentan como partes de un mismo producto.
- Public Forge genera el blueprint localmente y permite continuarlo en Studio.
- El traspaso usa `sessionStorage` same-origin y se consume una sola vez.
- El contenido del blueprint no viaja en query strings ni se envía a un backend para esta continuidad.
- Forge Studio recibe el proyecto en etapa `Raw`; no se saltan stage gates.
- El guardado local continúa desactivado por defecto y sólo persiste tras consentimiento explícito del usuario.
- Studio mantiene lifecycle `Raw → Discovery → Blueprint → Prototype → Testing → Outcome`.
- Se mantienen assumptions register, evidence ledger, MVP, métricas, test scenarios, decision log, iterations, handoff Markdown y `.forge.json`.

## QA del release
El PR #21 pasó el workflow **Forge Quality** completo:
- instalación reproducible;
- auditoría de dependencias de alta severidad;
- validadores de privacidad y seguridad;
- tests del lifecycle y contrato Forge → Studio;
- build del sitio público;
- generación del artifact de preview.

## Integración con Crohnoz Labs
- `crohnozlabs.cl` presenta Forge como producto del laboratorio.
- La ruta institucional `/forge` queda definida como **Quick Blueprint**, evitando duplicar conceptualmente el producto completo.
- La home y Quick Blueprint enlazan explícitamente al Forge completo y Forge Studio.
- La narrativa pública refleja el producto real: problema → blueprint → evidencia → prototipo/testing → outcome.
- No existe transferencia automática cross-origin desde `crohnozlabs.cl` al dominio independiente de Forge.

## Seguridad e integridad
- Sin iframes nuevos.
- Sin nuevas dependencias de runtime.
- Sin credenciales o secretos incluidos en código.
- Sin afirmar IA conectada: el motor actual sigue siendo determinista/local.
- Sin persistencia automática nueva.
- La recomendación de no introducir secretos, credenciales ni datos personales sensibles sigue visible.

## Discoverability
- Forge Studio queda incluido en `sitemap.xml` como superficie pública de producto.

## Pendiente operativo
- Verificar la publicación efectiva del build standalone en Netlify después del merge. El código y el artifact de release están validados; la publicación depende del mecanismo de deploy configurado para el proyecto `crohnoz-forge`.

## Siguiente fase — no bloqueante para release
- QA visual manual del recorrido completo en desktop y móvil.
- Medición de uso: inicio de Forge, blueprint generado, continuación a Studio, stage alcanzado y handoff exportado; sin capturar contenido sensible del proyecto.
- Evaluar capa server-side/IA o colaboración multiusuario sólo con boundary de seguridad y privacidad explícito.
