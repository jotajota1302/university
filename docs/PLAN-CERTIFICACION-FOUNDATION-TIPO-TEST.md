# Plan de trabajo (pendiente) — Foundation 100% tipo test

Fecha: 2026-03-10
Estado: PAUSADO (retomar mañana)

## Objetivo
Retomar la certificación por bloques con un enfoque **100% tipo test** (sin casos prácticos abiertos ni checklist manual), y luego implementar en University los endpoints necesarios para ejecutar y corregir el examen automáticamente.

---

## Fase 1 — Skills Registry (primero)
Repo: `~/Desktop/PROYECTOS/activos/skills-registry`

### Tareas
1. Revisar `docs/certifications/foundation/*`.
2. Dejar el examen Foundation en formato único de opción múltiple (A/B/C/D).
3. Eliminar del flujo oficial cualquier parte de evaluación práctica abierta/checklist manual.
4. Ajustar documentación para consistencia total:
   - `README.md`
   - `exam-spec.md`
   - `rubric.md`
   - `grader-template.json`
   - otros archivos relacionados
5. Mantener trazabilidad de cambios (notas breves en docs donde aplique).

### Criterio de salida
- Foundation queda descrito y diseñado como examen **100% tipo test**, con scoring automático y pass/fail claro.

---

## Fase 2 — University (después)
Repo: `~/Desktop/PROYECTOS/activos/university`

### Tareas
1. Implementar endpoints mínimos de examen:
   - `POST /v1/exams/start`
   - `GET /v1/exams/:id/status`
   - `POST /v1/exams/:id/submit`
   - `GET /v1/exams/:id/results`
2. Alinear payloads/estructura al modelo final 100% tipo test.
3. Implementar scoring automático con respuestas correctas.
4. Dejar TODOs explícitos para integración posterior de:
   - base de datos persistente
   - autenticación/authorization
   - antifraude/retakes

### Criterio de salida
- Endpoints funcionales en University, alineados al formato de examen tipo test.

---

## Notas de implementación para mañana
- Si existe scaffold previo de exámenes, adaptarlo al diseño final (no duplicar rutas).
- Evitar introducir features de evaluación manual en esta iteración.
- Priorizar un MVP testable localmente antes de endurecer seguridad.

---

## Entrega esperada al cerrar mañana
1. Lista de archivos modificados por repo.
2. Decisiones tomadas.
3. Pasos de prueba local de endpoints.
4. Riesgos pendientes y siguientes pasos.
