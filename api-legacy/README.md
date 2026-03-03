# OpenClaw University API

> Motor de auditoría y validación de agentes OpenClaw. API-first: los clientes instalan un conector ligero; toda la inteligencia vive en este servidor.

**Repo:** https://github.com/jotajota1302/university  
**Producción:** https://openclaw-university-api.onrender.com  
**Estado:** ✅ Sprint 4 completo — Dashboard en producción  
**Dashboard:** https://openclaw-university-dashboard.vercel.app  
**DB:** Supabase PostgreSQL (schema `university`)  
**Stack:** Node.js · TypeScript · Fastify · Prisma · Render

📖 **[Ver manual completo de funcionalidades →](./FEATURES.md)**

---

## 🔌 Endpoints disponibles

| Método | Ruta | Auth | Sprint | Descripción |
|--------|------|------|--------|-------------|
| GET | `/v1/health` | No | 1 | Health check del servidor |
| POST | `/v1/auth/token` | No | 1 | Genera token de acceso (válido 30 días) |
| POST | `/v1/audit/security` | Bearer | 1-5 | Auditoría de seguridad ampliada (16 checks + blockers técnicos/política) |
| POST | `/v1/audit/gdpr` | Bearer | 2 | Auditoría GDPR/privacidad (8 checks) |
| POST | `/v1/validations` | Bearer | 2 | Crear validación desde auditoría aprobada |
| GET | `/v1/validations/:id` | Bearer | 2 | Datos de la validación |
| GET | `/v1/validations/:id/badge` | No | 2 | Badge SVG público |
| GET | `/v1/validations/:id/verify` | No | 2 | Verificación pública de la validación |
| GET | `/v1/billing/subscription` | Bearer | 3 | Estado del plan actual |
| POST | `/v1/billing/checkout` | Bearer | 3 | URL de pago para upgrade (Stripe) |
| POST | `/v1/billing/webhook` | Stripe | 3 | Webhook de Stripe (activar/cancelar tier) |
| GET | `/v1/audits` | Bearer | 3 | Historial de auditorías paginado |

---

## ✅ Sprint 1 — Seguridad (base completa)

### Checks de seguridad (estado actual ampliado: 16)

| Check | Severidad | Qué detecta |
|-------|-----------|-------------|
| SEC-01 | 🔴 CRITICAL | API keys / tokens en texto plano (con reducción de falsos positivos de placeholders) |
| SEC-02 | 🟠 HIGH | Falta de `dmPolicy` en la config |
| SEC-03 | 🟠 HIGH | Falta de `allowFrom` en la config |
| SEC-04 | 🟠 HIGH | Credenciales hardcodeadas en SOUL/AGENTS (`WARN` si solo hay mención sin valor) |
| SEC-05 | 🟠 HIGH | Comandos destructivos (rm -rf, DROP TABLE...) |
| SEC-06 | 🟡 MEDIUM | Datos personales en contexto de contacto (regex más precisa) |
| SEC-07 | 🟡 MEDIUM | Instrucciones de exfiltración de datos |
| SEC-08 | 🟢 LOW | Aislamiento de sesión (`sessionId`, `session_id`, `session`, `dmScope`) |
| ETH-01 | 🟡 MEDIUM | Acciones externas con target externo sin política de confirmación explícita |
| TOOL-01 | 🟡 MEDIUM | Herramientas de riesgo habilitadas sin guardrails |
| FILE-01 | 🟠 HIGH | Acceso amplio a rutas/artefactos sensibles |
| NET-01 | 🟠 HIGH | Exposición de red sin controles completos |
| MSG-01 | 🟡 MEDIUM | Canales salientes sin límites de política |
| ETH-02 | 🟠 HIGH | Acciones irreversibles sin confirmación explícita (blocker de política) |
| CONSENT-01 | 🟡 MEDIUM | Flujo de datos externos sin consentimiento/autorización explícita |
| PRIV-01 | 🟡 MEDIUM | Retención masiva sin límites (TTL/minimización/anonimización) |

---

## ✅ Sprint 2 — GDPR + Certificaciones + Skill Connector (completo)

### Checks GDPR

| Check | Severidad | Qué detecta |
|-------|-----------|-------------|
| GDPR-01 | 🔴 CRITICAL | Datos personales en memoria sin política de retención |
| GDPR-02 | 🔴 CRITICAL | Emails, teléfonos o DNI en archivos de memoria |
| GDPR-03 | 🟠 HIGH | Transferencia de datos a terceros sin consentimiento |
| GDPR-04 | 🟠 HIGH | Logs con conversaciones completas |
| GDPR-05 | 🟠 HIGH | Contraseñas o credenciales de usuarios finales |
| GDPR-06 | 🟡 MEDIUM | Falta de política de privacidad o aviso legal |
| GDPR-07 | 🟡 MEDIUM | Referencias a datos de menores sin protección |
| GDPR-08 | 🟢 LOW | Falta de base legal documentada para el tratamiento |

### Scoring (ambos módulos)
- Puntuación: 100 − (checks fallidos × peso por severidad)
- CRITICAL: −25 · HIGH: −15 · MEDIUM: −10 · LOW: −5
- Grades: A (90-100) · B (75-89) · C (60-74) · D (40-59) · F (<40)
- `certifiable: true` si no hay checks CRITICAL o HIGH fallidos

### Validaciones
- Crear validación a partir de una auditoría con `certifiable: true`
- Badge SVG público embebible en README o web
- Endpoint de verificación pública (sin auth) para que cualquiera pueda validar un badge
- Validez: 6 meses desde la emisión

### Skill Connector
Conector instalable en cualquier OpenClaw en `skills/university-connector/`:
- `audit.sh` — audita seguridad y muestra el informe
- `audit-gdpr.sh` — audita GDPR
- `SKILL.md` — instrucciones para el agente
- Requiere `UNIVERSITY_TOKEN` y `UNIVERSITY_API_URL` en el entorno

---

## 🚀 Arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Añadir DATABASE_URL de Supabase

# 3. Sincronizar schema
npx prisma generate
npx prisma db push

# 4. Arrancar servidor
npm run dev
# → http://localhost:3000
```

---

## 🔌 Ejemplos de uso

### Health check
```bash
curl https://openclaw-university-api.onrender.com/v1/health
# {"status":"ok","version":"1.0.0","service":"openclaw-university"}
```

### Obtener token
```bash
curl -X POST https://openclaw-university-api.onrender.com/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"mi-cliente","secret":"mi-secreto"}'
# {"token":"uuid...","expiresAt":"2026-08-18T..."}
```

### Auditoría de seguridad
```bash
curl -X POST https://openclaw-university-api.onrender.com/v1/audit/security \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "files": {
      "SOUL.md": "Eres un asistente...",
      "AGENTS.md": "# AGENTS...",
      "TOOLS.md": "# TOOLS...",
      "config": "{\"dmPolicy\":\"allowlist\"}"
    }
  }'
```

### Auditoría GDPR
```bash
curl -X POST https://openclaw-university-api.onrender.com/v1/audit/gdpr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "files": {
      "SOUL.md": "...",
      "memory": "Contenido de archivos de memoria..."
    }
  }'
```

### Crear validación
```bash
curl -X POST https://openclaw-university-api.onrender.com/v1/validations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"auditId":"uuid-de-auditoria-certificable","type":"SECURITY"}'
```

### Verificar badge (sin auth)
```bash
curl https://openclaw-university-api.onrender.com/v1/validations/<id>/verify
```

---

## 🗄️ Base de datos (Supabase)

Tablas en el schema `university`:
- **Token** — tokens de acceso (clientId, token UUID, active, expiresAt)
- **Audit** — registro de auditorías (tokenId, score, grade, módulo, resultado JSON)
- **Validation** — validaciones emitidas (auditId, grade, validUntil, revoked)

---

## 🧪 Tests

118 tests pasando con Vitest (7 archivos):

| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `health.test.ts` | 1 | Endpoint health |
| `auth.test.ts` | 4 | Generación y validación de tokens |
| `audit.test.ts` | 7 | Auditoría seguridad end-to-end (WARN + blockers de política) |
| `securityAudit.test.ts` | 46 | Tests unitarios 16 checks seguridad/gobernanza |
| `gdprAudit.test.ts` | 33 | Tests unitarios 8 checks GDPR |
| `validation.test.ts` | 17 | Endpoints de validación |
| `billing.test.ts` | 10 | Scopes, rate limits, Stripe billing |

---

## 🗺️ Roadmap

### ✅ Sprint 1 — Seguridad (36 tests)
### ✅ Sprint 2 — GDPR + Certificaciones + Skill Connector + Deploy Render (94 tests)
### ✅ Sprint 3 — Token Scopes + Rate Limiting + Stripe Billing + Historial (104 tests)

### ✅ Sprint 4 — Dashboard en producción (2026-02-18)
- Dashboard React: Login, Auditorías, Resultados, Certificados, Historial
- Deploy en Vercel: https://openclaw-university-dashboard.vercel.app
- GDPR consent en el flujo de auditoría
- Privacy Policy: `PRIVACY_POLICY.md`
- Token de Edu listo para PoC (clientId: `edu`, expira 2026-03-20)

### 🔄 Sprint 5 — Hardening auditoría + PoC con Edu (en progreso)
- ✅ PoC real con Edu ejecutada en ngrok (auditoría funcional end-to-end)
- ✅ Hardening anti-falsos positivos + estado `WARN`
- ✅ Separación de `validationBlockers` por tipo: `blockersTechnical` y `blockersPolicy`
- ✅ ETH-02 como blocker de política explícito
- ⏳ Siguiente: nueva ronda PoC con reglas calibradas
- ⏳ Stripe real pendiente (pro 49€, enterprise 199€)

---

## 🔐 Variables de entorno

```env
DATABASE_URL=postgresql://...?pgbouncer=true&schema=university
PORT=3000
```
