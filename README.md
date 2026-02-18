# OpenClaw University API

> Motor de auditoría y certificación de agentes OpenClaw. API-first: los clientes instalan un conector ligero; toda la inteligencia vive en este servidor.

**Repo:** https://github.com/jotajota1302/university  
**Estado:** ✅ Sprint 1 completo y operativo  
**DB:** Supabase PostgreSQL (schema `university`)  
**Stack:** Node.js 20 · TypeScript · Fastify · Prisma

---

## ✅ Qué está implementado (Sprint 1)

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/v1/health` | No | Health check del servidor |
| POST | `/v1/auth/token` | No | Genera token de acceso (válido 30 días) |
| POST | `/v1/audit/security` | Bearer token | Auditoría de seguridad de un agente |

### Módulo de auditoría de seguridad

Analiza los archivos de configuración de un agente OpenClaw (`SOUL.md`, `AGENTS.md`, `TOOLS.md`, `config`) y ejecuta **8 checks estáticos** (regex, sin IA):

| Check | Severidad | Qué detecta |
|-------|-----------|-------------|
| SEC-01 | 🔴 CRITICAL | API keys / tokens en texto plano (ghp_, sk-, AKIA...) |
| SEC-02 | 🟠 HIGH | Falta de `dmPolicy` en la config |
| SEC-03 | 🟠 HIGH | Falta de `allowFrom` en la config |
| SEC-04 | 🟠 HIGH | Palabras clave de credenciales en SOUL/AGENTS (password, secret...) |
| SEC-05 | 🟠 HIGH | Comandos destructivos (rm -rf, DROP TABLE, mkfs...) |
| SEC-06 | 🟡 MEDIUM | Datos personales (emails, teléfonos) en archivos del agente |
| SEC-07 | 🟡 MEDIUM | Instrucciones de exfiltración de datos |
| SEC-08 | 🟢 LOW | Falta de configuración de aislamiento de sesión |

**Scoring:**
- Puntuación: 100 − (checks fallidos × peso por severidad)
- CRITICAL: −25 · HIGH: −15 · MEDIUM: −10 · LOW: −5
- Grades: A (90-100) · B (75-89) · C (60-74) · D (40-59) · F (<40)
- `certifiable: true` si ningún check CRITICAL o HIGH falla

### Base de datos (Supabase)

Tablas en el schema `university`:
- **Token** — tokens de acceso (clientId, token UUID, active, expiresAt)
- **Audit** — registro de cada auditoría (tokenId, score, grade, resultado JSON)

### Tests

36 tests pasando con Vitest:
- `health.test.ts` — endpoint health
- `auth.test.ts` — generación de tokens y validación de entrada
- `audit.test.ts` — autenticación, token inválido, auditoría end-to-end
- `securityAudit.test.ts` — 26 tests unitarios de los 8 checks (archivos limpios y con problemas)

---

## 🚀 Arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno (ya está en .env con Supabase)
cp .env.example .env  # si no existe .env

# 3. Sincronizar schema con Supabase
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
curl http://localhost:3000/v1/health
# {"status":"ok","version":"1.0.0","service":"openclaw-university"}
```

### Obtener token
```bash
curl -X POST http://localhost:3000/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"mi-cliente","secret":"mi-secreto"}'
# {"token":"uuid...","expiresAt":"2026-03-20T..."}
```

### Auditoría de seguridad
```bash
curl -X POST http://localhost:3000/v1/audit/security \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "files": {
      "SOUL.md": "Eres un asistente seguro y útil.",
      "AGENTS.md": "No compartas datos de usuarios.",
      "config": "{\"dmPolicy\":\"allowlist\",\"allowFrom\":[\"34619021128\"],\"sessionId\":\"jarvis-main\"}"
    }
  }'
```

Respuesta:
```json
{
  "auditId": "uuid",
  "timestamp": "ISO",
  "score": 85,
  "grade": "B",
  "certifiable": true,
  "checks": [...],
  "recommendations": [...],
  "certificationBlockers": []
}
```

---

## 📁 Estructura del proyecto

```
src/
├── server.ts               # App Fastify + registro de rutas
├── routes/
│   ├── health.ts           # GET /v1/health
│   ├── auth.ts             # POST /v1/auth/token
│   └── audit.ts            # POST /v1/audit/security
├── services/
│   └── securityAudit.ts    # Lógica de los 8 checks
└── middleware/
    └── auth.ts             # Verificación Bearer token

prisma/
└── schema.prisma           # Modelos Token + Audit (PostgreSQL/Supabase)

tests/
├── health.test.ts
├── auth.test.ts
├── audit.test.ts
└── securityAudit.test.ts   # 26 tests unitarios de checks
```

---

## 🗺️ Próximos pasos

### Sprint 2 — Módulo GDPR + integración Skills Registry

**Objetivo:** Segundo módulo de auditoría + conectar con el Skills Registry para mostrar badges

- [ ] **Endpoint `POST /v1/audit/gdpr`** con estos checks:
  - ¿El agente procesa datos personales? ¿Con qué justificación?
  - ¿Tiene política de retención de memoria configurada?
  - ¿Los datos de terceros quedan fuera del contexto enviado al LLM?
  - ¿Existe log/registro de qué datos se procesan?
- [ ] **Certificado digital** — generar PDF/JSON firmado tras auditoría aprobada
- [ ] **Endpoint `GET /v1/certifications/:id`** — consultar certificado público
- [ ] **Webhook hacia Skills Registry** — notificar badge "✅ Security Audited" cuando un skill pasa
- [ ] **Dashboard básico** — React/Next.js que muestre auditorías del cliente
- [ ] **Skill conector** para OpenClaw — script bash/Node que cualquier OpenClaw pueda instalar para llamar a esta API

### Sprint 3 — Formación por dominio (API-first, vendor lock-in)

**Objetivo:** Dar capacidades especializadas a agentes SIN ceder el know-how

- [ ] **Endpoint `POST /v1/train/domain`** — activa un dominio de conocimiento en el agente vía API
  - Dominios iniciales: `asesor-financiero`, `atencion-cliente`, `soporte-tecnico`
  - El agente llama a este endpoint en cada conversación para enriquecer el contexto
  - La lógica y prompts especializados viven en el servidor, no en el cliente
- [ ] **Token con scopes** — `audit:read`, `train:domain`, `certify:gdpr`
- [ ] **Rate limiting** por tier (free/pro/enterprise)
- [ ] **Billing con Stripe** — suscripción mensual por agente

### Sprint 4 — Primer cliente real (asesor de Edu)

- [ ] Auditar la instancia OpenClaw del cliente
- [ ] Generar informe y certificado GDPR
- [ ] Activar dominio "asesor-financiero" para su agente
- [ ] Cobrar setup fee (1.500-3.000€) + mensualidad (200-400€/mes)

---

## 🔐 Variables de entorno

```env
DATABASE_URL=postgresql://...?pgbouncer=true&schema=university
DIRECT_URL=postgresql://...?schema=university
PORT=3000
HOST=0.0.0.0
```
