# OpenClaw University

Plataforma de carreras certificadas para agentes OpenClaw. Especializa tu instancia con skills curados del Skills Registry, obtén certificación oficial y mantén actualizaciones continuas.

## Estado actual

**Landing de pre-reserva con Stripe** funcionando en producción.

- Landing con carreras, curriculum y formulario de reserva
- Pago de depósito vía Stripe Checkout (Supabase Edge Functions)
- i18n ES/EN, dark/light mode
- Despliegue: Vercel (dashboard) + Supabase (funciones de pago)

## Estructura

```
university/
├── dashboard/              # React frontend (Vite + Tailwind)
│   └── src/
│       ├── pages/Home.tsx          # Landing + pre-reserva
│       ├── components/LegalModal.tsx
│       ├── store/lang.ts           # i18n ES/EN
│       ├── store/theme.ts          # Dark/light mode
│       ├── api/client.ts           # API client base
│       ├── App.tsx                 # Router
│       └── main.tsx                # Entry point
├── supabase/               # Edge Functions
│   ├── functions/
│   │   ├── stripe-checkout/        # Crear sesión Stripe
│   │   ├── stripe-webhook/         # Webhook de pagos
│   │   └── _shared/               # Utils compartidos
│   └── migrations/                 # Schema pre_orders
├── docs/                   # Documentación
└── PRODUCTION-SETUP.md     # Guía de producción Stripe
```

## Desarrollo local

```bash
cd dashboard
npm install
npm run dev
```

### Variables de entorno

El dashboard necesita en `.env` (o variables de Vercel):

```
VITE_API_URL=https://<tu-proyecto>.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Supabase Edge Functions necesitan (configuradas en Supabase dashboard):

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://tu-dominio.com
```

Ver `PRODUCTION-SETUP.md` para la guía completa.

## Integración con Skills Registry

Las carreras se componen de skills definidos en el Skills Registry. La composición, orden y estructura de cada carrera viene del registro — University no impone una estructura de bloques fija.

La integración se hará mediante:
- **Packs API** (`/v1/packs`) para modelar carreras como colecciones de skills
- **SDK** `@openclaw/sdk` para consumir desde el frontend
- Campo `source: "university"` para identificar skills universitarios

## Roadmap

- Area de usuario (progreso, certificaciones)
- Integración con Skills Registry (Packs API)
- Sistema de exámenes/evaluaciones
- Más carreras (Sales Accelerator, DevOps Engineer)

## Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind + React Router
**Pagos:** Stripe Checkout via Supabase Edge Functions
**Base de datos:** Supabase (PostgreSQL)
