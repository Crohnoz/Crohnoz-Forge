# Bitácora — Crohnoz Forge

**Ventana:** 2026-08-16 → 2026-08-17

## Avances
- Forge evolucionó desde blueprint puntual a **Forge Studio** y PR #20 quedó mergeado.
- Nuevo workspace multiproyecto local-first con ciclo `Raw → Discovery → Blueprint → Prototype → Testing → Outcome`.
- Stage gates y Forge Readiness explicable.
- Registro de supuestos, evidencia, alcance MVP, métricas, notas de prototipo, escenarios de prueba, decisiones, iteraciones y outcomes.
- Handoff Markdown y portabilidad `.forge.json`.
- Persistencia local desactivada por defecto y habilitada sólo con consentimiento explícito.
- Build reproducible, ruta `/studio`, arquitectura same-origin/CSP-compatible y validadores/lifecycle tests incorporados.

## Límites
- No afirmar IA conectada cuando el motor es determinista/local.
- Una futura capa IA o multiusuario requiere boundary server-side y actualización del contrato de privacidad.

## Mañana
- Revisar visualmente Studio y el flujo completo problema → blueprint → testing → outcome.
- Priorizar QA y uso real antes de abrir nuevas superficies.
