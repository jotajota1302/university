# OpenClaw University API — Manual de Funcionalidades

> Referencia completa de todo lo que está implementado. Actualizado sprint a sprint.

**API en producción:** https://openclaw-university-api.onrender.com  
**Repo:** https://github.com/jotajota1302/university

---

## Índice

- [Autenticación](#autenticación)
- [Sprint 1 — Auditoría de Seguridad](#sprint-1--auditoría-de-seguridad)
- [Sprint 2 — GDPR + Certificaciones + Skill Connector](#sprint-2--gdpr--certificaciones--skill-connector)
- [Sprint 3 — Token Scopes + Billing + Historial](#sprint-3--token-scopes--billing--historial)
- [Tiers y Planes](#tiers-y-planes)
- [Errores comunes](#errores-comunes)

---

## Autenticación

Todos los endpoints protegidos requieren un **Bearer token** en la cabecera `Authorization`.

### Obtener token

```http
POST /v1/auth/token
Content-Type: application/json

{
  "clientId": "mi-empresa",
  "secret": "mi-secreto"
}
```

**Respuesta:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2026-08-18T17:00:00.000Z"
}
```

> Los tokens nuevos se crean con tier `free` (1 auditoría/mes, scope `audit:security`).  
> El token es válido 30 días.

### Usar el token

```bash
curl -H "Authorization: Bearer <token>" https://openclaw-university-api.onrender.com/v1/...
```

---

## Sprint 1 — Auditoría de Seguridad

> **Estado:** ✅ Producción  
> **Fecha:** 2026-02-18  
> **Tests:** 36

### Health check

```http
GET /v1/health
```

```json
{ "status": "ok", "version": "1.0.0", "service": "openclaw-university" }
```

---

### Auditoría de seguridad

Analiza los archivos de configuración de un agente OpenClaw y detecta vulnerabilidades de seguridad.

```http
POST /v1/audit/security
Authorization: Bearer <token>
Content-Type: application/json

{
  "files": {
    "SOUL.md": "Contenido del archivo SOUL.md...",
    "AGENTS.md": "Contenido del archivo AGENTS.md...",
    "TOOLS.md": "Contenido del archivo TOOLS.md...",
    "config": "{\"dmPolicy\": \"allowlist\", \"allowFrom\": [\"+34600000000\"]}"
  }
}
```

Todos los campos de `files` son opcionales. Si no se proporciona un archivo, los checks que lo requieren se marcan como `N/A`.

**Respuesta:**
```json
{
  "auditId": "uuid",
  "score": 85,
  "grade": "B",
  "certifiable": false,
  "certificationBlockers": ["SEC-02"],
  "checks": [
    {
      "id": "SEC-01",
      "status": "PASS",
      "severity": "CRITICAL",
      "message": "No plaintext API keys or tokens detected",
      "fix": null
    },
    {
      "id": "SEC-02",
      "status": "FAIL",
      "severity": "HIGH",
      "message": "dmPolicy not configured",
      "fix": "Add dmPolicy: 'allowlist' and allowFrom: ['your-number'] in the channel config"
    }
  ],
  "recommendations": ["[SEC-02] Add dmPolicy: 'allowlist'..."]
}
```

**Checks incluidos:**

| ID | Severidad | Qué detecta | Penalización |
|----|-----------|-------------|--------------|
| SEC-01 | 🔴 CRITICAL | API keys en texto plano (`ghp_`, `sk-`, `AKIA...`) | -25 pts |
| SEC-02 | 🟠 HIGH | Falta de `dmPolicy` en la config | -15 pts |
| SEC-03 | 🟠 HIGH | Falta de `allowFrom` en la config | -15 pts |
| SEC-04 | 🟠 HIGH | Palabras clave de credenciales en SOUL/AGENTS | -15 pts |
| SEC-05 | 🟠 HIGH | Comandos destructivos (`rm -rf`, `DROP TABLE`...) | -15 pts |
| SEC-06 | 🟡 MEDIUM | Emails o teléfonos en archivos del agente | -10 pts |
| SEC-07 | 🟡 MEDIUM | Instrucciones de exfiltración de datos | -10 pts |
| SEC-08 | 🟢 LOW | Falta de configuración de aislamiento de sesión | -5 pts |

**Scoring:**
- Puntuación: 100 − suma de penalizaciones
- **A** (90-100) · **B** (75-89) · **C** (60-74) · **D** (40-59) · **F** (<40)
- `certifiable: true` si no hay checks CRITICAL o HIGH fallidos

---

## Sprint 2 — GDPR + Certificaciones + Skill Connector

> **Estado:** ✅ Producción  
> **Fecha:** 2026-02-18  
> **Tests:** 94 (acumulado)

### Auditoría GDPR

Analiza la configuración del agente desde la perspectiva del RGPD/privacidad.

```http
POST /v1/audit/gdpr
Authorization: Bearer <token>
Content-Type: application/json

{
  "files": {
    "SOUL.md": "...",
    "AGENTS.md": "...",
    "TOOLS.md": "...",
    "config": "...",
    "memory": "Contenido de los archivos de memoria del agente..."
  }
}
```

El campo `memory` es especialmente relevante para GDPR-01 y GDPR-02 (datos personales en memoria).

**Respuesta:** mismo formato que `/v1/audit/security`.

**Checks incluidos:**

| ID | Severidad | Qué detecta | Penalización |
|----|-----------|-------------|--------------|
| GDPR-01 | 🔴 CRITICAL | Datos personales en memoria sin política de retención | -25 pts |
| GDPR-02 | 🔴 CRITICAL | Emails, teléfonos o DNI en archivos de memoria | -25 pts |
| GDPR-03 | 🟠 HIGH | Transferencia de datos a terceros sin consentimiento | -15 pts |
| GDPR-04 | 🟠 HIGH | Logs con conversaciones completas | -15 pts |
| GDPR-05 | 🟠 HIGH | Contraseñas o credenciales de usuarios finales | -15 pts |
| GDPR-06 | 🟡 MEDIUM | Falta de política de privacidad o aviso legal | -10 pts |
| GDPR-07 | 🟡 MEDIUM | Referencias a datos de menores sin protección especial | -10 pts |
| GDPR-08 | 🟢 LOW | Falta de base legal documentada para el tratamiento | -5 pts |

---

### Certificaciones

#### Crear certificado

Disponible cuando una auditoría tiene `certifiable: true`.

```http
POST /v1/certifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "auditId": "uuid-de-auditoria-certificable",
  "type": "SECURITY"
}
```

`type` puede ser `SECURITY`, `GDPR` o `FULL`.

**Respuesta:**
```json
{
  "id": "uuid",
  "auditId": "uuid",
  "type": "SECURITY",
  "grade": "A",
  "score": 95,
  "issuedAt": "2026-02-18T18:00:00.000Z",
  "validUntil": "2026-08-18T18:00:00.000Z",
  "revoked": false
}
```

Los certificados tienen validez de **6 meses**.

#### Obtener certificado

```http
GET /v1/certifications/:id
Authorization: Bearer <token>
```

#### Badge SVG público

Sin autenticación. Embebible en README, webs, etc.

```http
GET /v1/certifications/:id/badge
```

Devuelve un SVG con el grade y tipo. Ejemplo de uso en Markdown:
```markdown
![OpenClaw Security Badge](https://openclaw-university-api.onrender.com/v1/certifications/UUID/badge)
```

#### Verificación pública

Sin autenticación. Permite verificar la validez de un certificado.

```http
GET /v1/certifications/:id/verify
```

```json
{
  "valid": true,
  "certificateId": "uuid",
  "type": "SECURITY",
  "grade": "A",
  "issuedAt": "2026-02-18T...",
  "validUntil": "2026-08-18T...",
  "revoked": false
}
```

---

### Skill Connector

Carpeta `skills/university-connector/` en el repo. Instalable en cualquier OpenClaw.

**Configuración requerida:**
```bash
export UNIVERSITY_TOKEN="tu-token"
export UNIVERSITY_API_URL="https://openclaw-university-api.onrender.com"
```

**Auditoría de seguridad:**
```bash
./skills/university-connector/audit.sh
```

**Auditoría GDPR:**
```bash
./skills/university-connector/audit-gdpr.sh
```

Los scripts recogen automáticamente los archivos `SOUL.md`, `AGENTS.md` y `TOOLS.md` del directorio actual y los envían a la API.

---

## Sprint 3 — Token Scopes + Billing + Historial

> **Estado:** ✅ Producción  
> **Fecha:** 2026-02-18  
> **Tests:** 104 (acumulado)

### Sistema de tiers y scopes

Cada token tiene un tier que determina qué puede hacer y cuántas auditorías puede realizar al mes.

| Tier | Scopes | Auditorías/mes | Precio |
|------|--------|----------------|--------|
| free | `audit:security` | 1 | Gratis |
| pro | `audit:security`, `audit:gdpr`, `certify` | 10 | 49€/mes |
| enterprise | Todos (`*`) | Ilimitadas | 199€/mes |

Si intentas usar un endpoint sin el scope necesario → **403 Forbidden**  
Si superas el límite de auditorías del mes → **429 Too Many Requests**

---

### Estado de suscripción

```http
GET /v1/billing/subscription
Authorization: Bearer <token>
```

```json
{
  "tier": "free",
  "scopes": ["audit:security"],
  "auditCount": 0,
  "auditLimit": 1,
  "stripeSubscriptionId": null,
  "active": true
}
```

---

### Checkout para upgrade

Genera una URL de pago de Stripe para actualizar el tier.

```http
POST /v1/billing/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "pro"
}
```

`plan` puede ser `pro` o `enterprise`.

```json
{
  "url": "https://checkout.stripe.com/...",
  "plan": "pro",
  "price": "49€/month"
}
```

> **Nota:** Stripe está en modo mock hasta que se configuren las env vars `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` y `STRIPE_ENTERPRISE_PRICE_ID` en Render.

---

### Webhook de Stripe

Endpoint para recibir eventos de Stripe. Se configura en el dashboard de Stripe apuntando a:

```
POST https://openclaw-university-api.onrender.com/v1/billing/webhook
```

Eventos gestionados:
- `checkout.session.completed` → activa el tier del token
- `customer.subscription.deleted` → vuelve a tier free

---

### Historial de auditorías

```http
GET /v1/audits?limit=10&offset=0
Authorization: Bearer <token>
```

```json
{
  "audits": [
    {
      "id": "uuid",
      "score": 85,
      "grade": "B",
      "createdAt": "2026-02-18T18:00:00.000Z",
      "result": { ... }
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0
}
```

---

## Tiers y Planes

### Free
- 1 auditoría de seguridad al mes
- Sin acceso a GDPR ni certificaciones
- Sin soporte

### Pro (49€/mes)
- 10 auditorías al mes (security + GDPR)
- Certificados descargables con badge público
- Email de soporte

### Enterprise (199€/mes)
- Auditorías ilimitadas
- Todos los módulos actuales y futuros
- Soporte prioritario
- (Roadmap) On-premise license disponible

---

## Errores comunes

| Código | Significado | Solución |
|--------|-------------|----------|
| 401 | Token inválido o expirado | Genera un nuevo token con `POST /v1/auth/token` |
| 403 | Tu tier no incluye este scope | Haz upgrade con `POST /v1/billing/checkout` |
| 404 | Recurso no encontrado | Verifica el ID del recurso |
| 409 | Ya existe un certificado para esta auditoría | Usa el certificado existente |
| 429 | Límite de auditorías del mes alcanzado | Haz upgrade o espera al mes siguiente |
| 500 | Error interno | Revisa los logs en Render |

---

## Roadmap

### Sprint 4 (próximo)
- Dashboard React para ver auditorías y certificados
- Stripe configurado con productos reales
- Primer cliente real: auditoría + certificado GDPR

### Futuro
- Módulo de formación por dominio (vendor lock-in total)
- MCP server nativo
- Multi-tenant (varios agentes por cuenta)
- Webhook hacia Skills Registry para badges automáticos
