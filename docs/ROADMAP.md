# University — Roadmap

**Actualizado:** 2026-03-11
**Estado actual:** Landing de pre-reserva con Stripe funcionando en producción.

---

## Lo que ya funciona (completado)

- Landing page con carreras, curriculum, formulario de pre-reserva
- Pago de depósito (20€) vía Stripe Checkout (Supabase Edge Function)
- Webhook que guarda pre_orders en Supabase (PostgreSQL)
- i18n ES/EN, dark/light mode
- Modal de términos legales (LOPD/RGPD)
- Despliegue: Vercel (dashboard) + Supabase (funciones + DB)
- Limpieza completa del código legacy de auditorías

---

## Fase 0: Exámenes en el Skills Registry (PREREQUISITO)

> **Repo:** skills-registry — Este trabajo se hace allí, no aquí.
> **Plan detallado:** `skills-registry/docs/EXAMS-IMPLEMENTATION-PLAN.md`
> **Estado:** EN PROGRESO

**Objetivo:** Que cada skill (o grupo de skills) del registry tenga un examen asociado con preguntas y respuestas, consumible vía API.

**Lo que hay que hacer en el Skills Registry:**

1. **Modelo de datos para exámenes**
   - Asociar preguntas a skills individuales o a grupos (ej: todos los skills de "Foundation")
   - Cada pregunta: enunciado + opciones (A/B/C/D) + respuesta correcta + explicación
   - Metadatos: dificultad, categoría, skill asociado

2. **Endpoints de examen**
   - `GET /v1/exams/:packId/:groupId` — Devuelve preguntas SIN respuestas correctas (para el frontend)
   - `POST /v1/exams/:packId/:groupId/grade` — Recibe respuestas del usuario, corrige, devuelve score
   - Opción: parámetro `?limit=20` para seleccionar N preguntas aleatorias del pool

3. **Contenido: preguntas de Foundation**
   - Crear pool de preguntas para los 5 skills de Foundation (Marketing Fundamentals, Target Audience Research, Marketing Psychology, Competitive Analysis, Marketing Metrics 101)
   - Mínimo ~10 preguntas por skill = ~50 preguntas en pool
   - El examen selecciona 20 preguntas aleatorias

4. **Configuración de aprobado**
   - Porcentaje mínimo para aprobar (ej: 70%)
   - Configurar por pack/grupo, no hardcodeado

**Criterio de salida:**
- `GET /v1/exams/marketing-pro/foundation` devuelve preguntas
- `POST /v1/exams/marketing-pro/foundation/grade` corrige y devuelve score + pass/fail
- Pool de preguntas de Foundation creado

---

## Fase 1: Sistema de exámenes en University

> **Estado:** BLOQUEADO por Fase 0

**Objetivo:** Que un usuario que pagó pueda hacer un examen tipo test y obtener certificación automática.

**Tareas en University:**

1. **Crear Edge Function `exam-start`**
   - Recibe: email + career_id + group_id (ej: "foundation")
   - Valida que el usuario tiene pre_order completada
   - Llama al Skills Registry: `GET /v1/exams/:packId/:groupId`
   - Crea registro en `exam_sessions` (estado: in_progress)
   - Devuelve: session_id + preguntas

2. **Crear Edge Function `exam-submit`**
   - Recibe: session_id + respuestas del usuario
   - Llama al Skills Registry: `POST /v1/exams/:packId/:groupId/grade`
   - Guarda resultado en `exam_results`
   - Devuelve: score, pass/fail, detalle por pregunta

3. **Crear migraciones**
   ```sql
   create table exam_sessions (
     id uuid primary key default gen_random_uuid(),
     email text not null,
     career_id text not null,
     group_id text not null,
     started_at timestamptz default now(),
     status text default 'in_progress' check (status in ('in_progress', 'completed', 'expired'))
   );

   create table exam_results (
     id uuid primary key default gen_random_uuid(),
     session_id uuid references exam_sessions(id),
     email text not null,
     career_id text not null,
     group_id text not null,
     score integer not null,
     passed boolean not null,
     answers jsonb not null,
     created_at timestamptz default now()
   );
   ```

4. **UI de examen en el dashboard**
   - Página `/exam/:groupId` — muestra preguntas, recoge respuestas, envía
   - Página `/results/:sessionId` — muestra resultado con detalle
   - Timer opcional (ej: 30 min)

**Criterio de salida:**
- Usuario con pre_order puede hacer examen Foundation
- Score calculado por el Skills Registry, resultado guardado en University
- UI funcional de examen + resultados

---

## Fase 2: Área de usuario

**Objetivo:** Dashboard personal donde el usuario ve su progreso, certificaciones y próximos pasos.

**Tareas:**

1. **Auth con Supabase Auth**
   - Login con magic link (email)
   - El email ya está en pre_orders, se vincula automáticamente
   - Proteger rutas de examen y resultados

2. **Página `/me` — Mi progreso**
   - Carrera matriculada (de pre_orders)
   - Grupos completados / pendientes
   - Scores de exámenes realizados
   - Botón para hacer siguiente examen

3. **Certificados descargables**
   - Generar badge/certificado verificable por grupo aprobado
   - Formato simple: PDF o imagen con QR de verificación

**Criterio de salida:**
- Usuario se loguea con magic link
- Ve su carrera, progreso y resultados
- Puede descargar certificado de grupos aprobados

---

## Fase 3: Integración completa con Skills Registry (Packs API)

**Objetivo:** Las carreras dejan de estar hardcodeadas en el frontend y se consumen del Skills Registry.

**Contexto:**
- El Skills Registry tiene una Packs API (`/v1/packs`) que modela colecciones de skills
- Cada carrera = 1 Pack en el registro
- Los skills que componen una carrera se definen allí — University no impone estructura de bloques fija
- SDK disponible: `@openclaw/sdk`
- Campo `source: "university"` identifica skills universitarios

**Tareas:**

1. **Consumir Packs desde University**
   - Instalar `@openclaw/sdk` en dashboard
   - Reemplazar arrays hardcodeados en Home.tsx por datos del Pack
   - Curriculum dinámico basado en los skills del Pack

2. **Sincronizar progreso**
   - Cuando un usuario aprueba un examen, registrar instalación del skill en el registro
   - El pack muestra progreso real basado en skills instalados

**Criterio de salida:**
- Carreras se cargan del Skills Registry (no hardcodeadas)
- Nuevo skill en el pack aparece automáticamente en University
- Progreso sincronizado entre University y Skills Registry

---

## Fase 4: Más carreras y contenido

**Objetivo:** Ampliar la oferta de carreras y abrir pre-reserva para todas.

**Tareas:**

1. **Sales Accelerator** — crear pack + preguntas en registry, abrir pre-reserva
2. **DevOps Engineer** — crear pack + preguntas en registry, abrir pre-reserva
3. **Landing dinámica** — las carreras disponibles se renderizan desde los Packs
4. **Notificación de apertura** — sistema para avisar a usuarios interesados

---

## Flujo completo (visión final)

```
Usuario                  University (Supabase)           Skills Registry
───────                  ────────────────────           ───────────────
Paga depósito 20€   →   Guarda pre_order

Login magic link     →   Supabase Auth

Pulsa "Hacer examen" →   Valida pre_order          →   GET /v1/exams/:pack/:group
                         Crea exam_session          ←   { questions: [...] }
                     ←   Muestra preguntas

Envía respuestas     →   Recibe respuestas          →   POST /v1/exams/:pack/:group/grade
                         Guarda exam_result          ←   { score, passed, detail }
                     ←   Muestra resultado

Ve progreso          →   Lee exam_results
                     ←   Muestra bloques aprobados

Descarga certificado →   Genera PDF/badge
                     ←   Certificado verificable
```

---

## Decisiones de arquitectura

| Decisión | Elección | Motivo |
|----------|----------|--------|
| Backend | Supabase Edge Functions | Ya funciona para pagos, evita mantener servidor |
| Auth | Supabase Auth (magic link) | Mismo stack, el email ya existe en pre_orders |
| Exámenes (preguntas) | En el Skills Registry | Single source of truth, junto a las skills |
| Exámenes (grading) | En el Skills Registry | Las respuestas correctas no salen del registry |
| Exámenes (resultados) | En University (Supabase) | Datos del usuario, progreso local |
| Carreras | Definidas en Skills Registry | Sin duplicar datos, estructura flexible |
| Certificados | Generados en Edge Function | Sin dependencia de frontend |

---

## Stack técnico

- **Frontend:** React + TypeScript + Vite + Tailwind + React Router
- **Backend:** Supabase Edge Functions (Deno)
- **DB:** Supabase PostgreSQL
- **Pagos:** Stripe Checkout
- **Skills/Carreras/Exámenes:** Skills Registry (Packs API + Exams API)
- **Despliegue:** Vercel (frontend) + Supabase (funciones + DB)
