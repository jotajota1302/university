# OpenClaw University API

> Motor de auditoría y certificación de agentes OpenClaw. API-first: los clientes instalan un conector ligero; toda la inteligencia vive en este servidor.

**Repo:** https://github.com/jotajota1302/university  
**Producción:** https://openclaw-university-api.onrender.com  
**Estado:** ✅ Sprint 3 completo y operativo  
**DB:** Supabase PostgreSQL (schema `university`)  
**Stack:** Node.js · TypeScript · Fastify · Prisma · Render

📖 **[Ver manual completo de funcionalidades →](./FEATURES.md)**

---

## 🔌 Endpoints disponibles

| Método | Ruta | Auth | Sprint | Descripción |
|--------|------|------|--------|-------------|
| GET | `/v1/health` | No | 1 | Health check del servidor |
| POST | `/v1/auth/token` | No | 1 | Genera token de acceso (válido 30 días) |
| POST | `/v1/audit/security` | Bearer | 1 | Auditoría de seguridad (8 checks) |
| POST | `/v1/audit/gdpr` | Bearer | 2 | Auditoría GDPR/privacidad (8 checks) |
| POST | `/v1/certifications` | Bearer | 2 | Crear certificado desde auditoría aprobada |
| GET | `/v1/certifications/:id` | Bearer | 2 | Datos del certificado |
| GET | `/v1/certifications/:id/badge` | No | 2 | Badge SVG público |
| GET | `/v1/certifications/:id/verify` | No | 2 | Verificación pública del certificado |
| GET | `/v1/billing/subscription` | Bearer | 3 | Estado del plan actual |
| POST | `/v1/billing/checkout` | Bearer | 3 | URL de pago para upgrade (Stripe) |
| POST | `/v1/billing/webhook` | Stripe | 3 | Webhook de Stripe (activar/cancelar tier) |
| GET | `/v1/audits` | Bearer | 3 | Historial de auditorías paginado |

---

## ✅ Sprint 1 — Seguridad (completo)

### Checks de seguridad

| Check | Severidad | Qué detecta |
|-------|-----------|-------------|
| SEC-01 | 🔴 CRITICAL | API keys / tokens en texto plano (ghp_, sk-, AKIA...) |
| SEC-02 | 🟠 HIGH | Falta de `dmPolicy` en la config |
| SEC-03 | 🟠 HIGH | Falta de `allowFrom` en la config |
| SEC-04 | 🟠 HIGH | Palabras clave de credenciales en SOUL/AGENTS |
| SEC-05 | 🟠 HIGH | Comandos destructivos (rm -rf, DROP TABLE...) |
| SEC-06 | 🟡 MEDIUM | Datos personales (emails, teléfonos) en archivos |
| SEC-07 | 🟡 MEDIUM | Instrucciones de exfiltración de datos |
| SEC-08 | 🟢 LOW | Falta de configuración de aislamiento de sesión |

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

### Certificaciones
- Crear certificado a partir de una auditoría con `certifiable: true`
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

### Crear certificado
```bash
curl -X POST https://openclaw-university-api.onrender.com/v1/certifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"auditId":"uuid-de-auditoria-certificable","type":"SECURITY"}'
```

### Verificar badge (sin auth)
```bash
curl https://openclaw-university-api.onrender.com/v1/certifications/<id>/verify
```

---

## 🗄️ Base de datos (Supabase)

Tablas en el schema `university`:
- **Token** — tokens de acceso (clientId, token UUID, active, expiresAt)
- **Audit** — registro de auditorías (tokenId, score, grade, módulo, resultado JSON)
- **Certificate** — certificados emitidos (auditId, grade, validUntil, revoked)

---

## 🧪 Tests

94 tests pasando con Vitest (6 archivos):

| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `health.test.ts` | 1 | Endpoint health |
| `auth.test.ts` | 4 | Generación y validación de tokens |
| `audit.test.ts` | 5 | Auditoría seguridad end-to-end |
| `securityAudit.test.ts` | 34 | Tests unitarios 8 checks seguridad |
| `gdprAudit.test.ts` | 33 | Tests unitarios 8 checks GDPR |
| `certification.test.ts` | 17 | Endpoints de certificación |

---

## 🗺️ Roadmap

### ✅ Sprint 1 — Seguridad (36 tests)
### ✅ Sprint 2 — GDPR + Certificaciones + Skill Connector + Deploy Render (94 tests)
### ✅ Sprint 3 — Token Scopes + Rate Limiting + Stripe Billing + Historial (104 tests)

### 🔄 Sprint 4 — Dashboard + Stripe real + Primer cliente
- Dashboard React para ver auditorías y certificados
- Stripe configurado con productos reales
- Primer cliente real: auditoría + certificado GDPR
- Setup fee + mensualidad

---

## 🔐 Variables de entorno

```env
DATABASE_URL=postgresql://...?pgbouncer=true&schema=university
PORT=3000
```
