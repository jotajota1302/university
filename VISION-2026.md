# OpenClaw University — Vision 2026

> De plataforma de auditoría a **Taller/Mecánico Integral** para instancias OpenClaw

---

## 🎯 Nueva Visión

**OpenClaw University** se reposiciona como el **taller de confianza** para usuarios y equipos con instancias OpenClaw:

### Lo que somos ahora
✅ Plataforma de auditoría técnica (security + GDPR)  
✅ Validación de skills instaladas  
✅ Reportes con scoring 0-100

### Lo que seremos (Refactor 2026)
🔧 **Taller/Mecánico OpenClaw:**
- Audita tu instancia (security, privacy, performance)
- Detecta vulnerabilidades y configuraciones inseguras
- **Repara automáticamente** problemas comunes
- Verifica instalación correcta de OpenClaw
- Valida integridad de skills instaladas
- Optimiza rendimiento y recursos

🔗 **Conexión con OpenSkills Registry:**
- Cross-sell: "Tu OpenClaw necesita esta skill para mejorar X"
- Instalación asistida de skills recomendadas
- Embudo: auditoría → skill recommendation → OpenSkills checkout

📊 **Dashboard unificado:**
- Mismo look & feel que OpenSkills (Tailwind slate/emerald palette)
- Login único (futuro: SSO entre University y OpenSkills)
- Historial de auditorías + skills instaladas

---

## 🏗️ Arquitectura Propuesta

### Backend (API)

**Endpoints actuales:**
- `POST /v1/audit/security` — Security audit (8 checks)
- `POST /v1/audit/gdpr` — GDPR compliance (8 checks)
- `GET /v1/audits` — Audit history
- `POST /v1/validations` — Validate skill functionality
- `GET /v1/billing/subscribe` — Mock Stripe subscription

**Nuevos endpoints propuestos:**

```
POST /v1/health-check
- Verifica instalación completa de OpenClaw
- Checks: CLI version, config.yaml, skills path, provider tokens
- Returns: healthy: boolean, issues: [], recommendations: []

POST /v1/repair
- Input: issue_id (from health-check or audit)
- Auto-fix común problems:
  - Regenerate broken config
  - Fix file permissions
  - Clear corrupted cache
  - Reset provider cooldowns
- Returns: fixed: boolean, actions_taken: []

POST /v1/optimize
- Analiza uso de memoria/CPU/tokens
- Recomienda ajustes de config
- Sugiere skills a desinstalar (poco usadas)

GET /v1/skills/installed
- Input: workspace_path
- Returns: lista de skills instaladas + metadata
- Cross-reference con OpenSkills Registry

POST /v1/recommendations
- Input: audit_result + installed_skills
- Returns: skill recommendations from OpenSkills
- "Tu OpenClaw tiene riesgo GDPR → instala gdpr-readiness-check"
```

---

### Frontend (Dashboard)

**Pantallas actuales:**
- Login
- New Audit (security/GDPR)
- Audit Result (scoring + findings)
- Validation View
- History

**Nuevas pantallas propuestas:**

```
1. Health Dashboard (nueva landing)
   - Quick health score (0-100)
   - Botón "Run Full Check"
   - Últimas auditorías
   - Skills instaladas (con link a OpenSkills)

2. Repair Center
   - Issues detectados con botón "Auto-Fix"
   - Manual fixes con instrucciones paso a paso
   - Logs de reparaciones anteriores

3. Skills Manager
   - Lista de skills instaladas
   - Estado de cada skill (active/broken/outdated)
   - Botón "Install from OpenSkills" (redirect)
   - Recommendations basadas en auditorías

4. Optimization Hub
   - Uso de recursos (memoria/tokens/API calls)
   - Sugerencias de optimización
   - A/B test configs (experimental)

5. University → OpenSkills Bridge
   - "Improve your OpenClaw" CTA panel
   - Skill recommendations personalizadas
   - 1-click redirect to OpenSkills install page
```

---

## 🔗 Integración University ↔ OpenSkills

### Flujo de Usuario

```
1. Usuario audita su OpenClaw en University
   ↓
2. Recibe reporte: "Security: 65/100 — Missing AI governance checks"
   ↓
3. Panel de recomendaciones:
   "🔧 Install ai-governance-audit from OpenSkills to improve this score"
   [View in OpenSkills] → redirect a /skills/skillia/ai-governance-audit
   ↓
4. Usuario compra skill en OpenSkills
   ↓
5. Instala con token desde Account page
   ↓
6. Vuelve a University y re-audita → "Security: 92/100 ✅"
```

### Datos Compartidos (futuro SSO)

**Opción A (MVP sin SSO):**
- University genera URL con context:
  `https://skillia.app/skills/skillia/gdpr-readiness-check?ref=university&issue=gdpr-compliance`
- OpenSkills muestra banner: "Recommended by OpenClaw University"
- Analytics: track conversión University → OpenSkills

**Opción B (con SSO):**
- Login único entre ambas plataformas
- University conoce skills compradas en OpenSkills
- OpenSkills conoce audit history de University
- Dashboard unificado (futuro)

---

## 🎨 Unificación de Diseño

### Paleta de Colores (alinear con OpenSkills)

```css
/* OpenSkills palette (copiar exacto) */
--primary: emerald-600
--secondary: blue-600
--accent: amber-500
--bg-light: slate-50
--bg-dark: slate-950
--text-light: slate-900
--text-dark: white
--border-light: slate-200
--border-dark: zinc-800
```

### Componentes Compartidos

**Crear en University:**
- `<SkillCard>` — mismo diseño que OpenSkills
- `<AuditBadge>` — con tier colors (free/pro/enterprise)
- `<InstallPrompt>` — copy/paste commands iguales
- `<Footer>` — mismo legal footer
- `<Header>` — navegación coherente

**Tailwind config:**
- Copiar `tailwind.config.js` de OpenSkills
- Usar mismas clases utilitarias
- Mismo dark mode toggle

---

## 💰 Modelo de Negocio Refactorizado

### Tiers (alineados con OpenSkills)

| Tier | Precio | Incluye |
|------|--------|---------|
| **Free** | 0€ | 1 audit/mes (solo security), manual fixes |
| **Pro** | 49€/mes | Unlimited audits, auto-repair, GDPR checks, skill recommendations |
| **Enterprise** | 199€/mes | Todo Pro + API access, SSO, custom checks, priority support |

### Revenue Streams

1. **Suscripciones University** (49€/mes Pro)
2. **Affiliate commission de OpenSkills:**
   - University recomienda skill → usuario compra en OpenSkills
   - University cobra 20% de la primera venta
3. **Bundle University + OpenSkills:**
   - 79€/mes (ahorro vs 98€ separado)
   - Cross-sell natural

---

## 📋 Roadmap de Refactor

### Phase 1: Foundation (1 semana)
- [x] Backend ya tiene audits + validations
- [ ] Añadir endpoints `/health-check` y `/recommendations`
- [ ] Crear skill-bridge service (link a OpenSkills API)
- [ ] Unificar Tailwind config con OpenSkills

### Phase 2: UI Refactor (1 semana)
- [ ] Rediseñar Dashboard con OpenSkills palette
- [ ] Crear Health Dashboard (nueva landing)
- [ ] Skills Manager con recommendations
- [ ] Footer/Header alineados

### Phase 3: Integration (1 semana)
- [ ] University → OpenSkills deep links con context
- [ ] OpenSkills muestra "Recommended by University" badge
- [ ] Analytics: track conversiones cross-platform
- [ ] Testing E2E del funnel completo

### Phase 4: Advanced (futuro)
- [ ] Auto-repair automático de issues comunes
- [ ] SSO entre University y OpenSkills
- [ ] Dashboard unificado
- [ ] API pública para third-party integrations

---

## 🎯 Quick Wins para Mañana

### Cambios Inmediatos (alta prioridad)

1. **Añadir endpoint de recommendations:**
```typescript
// api/src/routes/recommendations.ts
export async function recommendationsRoute(app: FastifyInstance) {
  app.post('/v1/recommendations', async (req, reply) => {
    const { audit_result } = req.body;
    
    const recommendations = [];
    
    if (audit_result.security_score < 80) {
      recommendations.push({
        skill: 'ai-governance-audit',
        namespace: 'skillia',
        reason: 'Improve AI governance and prompt safety',
        skillia_url: 'https://skillia.app/skills/skillia/ai-governance-audit'
      });
    }
    
    if (audit_result.gdpr_score < 70) {
      recommendations.push({
        skill: 'gdpr-readiness-check',
        namespace: 'skillia',
        reason: 'Ensure GDPR compliance',
        skillia_url: 'https://skillia.app/skills/skillia/gdpr-readiness-check'
      });
    }
    
    return { recommendations };
  });
}
```

2. **Copiar paleta OpenSkills a University:**
```bash
# Copiar tailwind.config.js de OpenSkills a University
cp ~/Desktop/PROYECTOS/activos/openclaw-skills-registry/frontend/tailwind.config.js \
   ~/Desktop/PROYECTOS/activos/university/dashboard/
```

3. **Añadir panel de recommendations en Audit Result:**
```tsx
// dashboard/src/pages/AuditResult.tsx
<div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
  <h3 className="font-semibold text-blue-900">Improve Your Score</h3>
  <p className="mt-2 text-sm text-slate-600">
    Install these skills from OpenSkills to address detected issues:
  </p>
  <div className="mt-4 space-y-3">
    {recommendations.map(rec => (
      <a href={rec.skillia_url} className="block rounded-lg border p-4 hover:border-emerald-500">
        <div className="font-medium">{rec.skill}</div>
        <div className="text-sm text-slate-600">{rec.reason}</div>
      </a>
    ))}
  </div>
</div>
```

---

## 📊 KPIs de Éxito

**Para University:**
- Usuarios activos auditando mensualmente
- % de issues auto-reparados
- Avg audit score improvement over time

**Para el Funnel University → OpenSkills:**
- Click-through rate en recommendations
- Conversion rate University → OpenSkills purchase
- Revenue de affiliate commission

**Para el Bundle:**
- % usuarios con ambas suscripciones activas
- Churn rate de bundle vs individual

---

## 🚀 Valor Único

**¿Por qué University + OpenSkills juntos son más fuertes?**

1. **Circle completo:**
   - University detecta el problema
   - OpenSkills vende la solución (skill)
   - University valida que funcionó (re-audit)

2. **Trust loop:**
   - University es neutro (auditor)
   - Recomienda skills basadas en datos reales
   - OpenSkills gana credibilidad por asociación

3. **Upsell natural:**
   - Free user en University → ve valor → upgrade Pro
   - Pro user en University → necesita skill → compra en OpenSkills
   - OpenSkills user → quiere validar → audita en University

---

**Next Steps:** Mañana empezamos por el endpoint de recommendations + copiar Tailwind config.
