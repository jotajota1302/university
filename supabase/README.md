# OpenClaw University - Supabase Edge Functions

Este directorio contiene las Edge Functions de Supabase para gestionar los pagos de Stripe.

## 📁 Estructura

```
supabase/
├── functions/
│   ├── stripe-checkout/    # Crear sesiones de checkout
│   │   └── index.ts
│   ├── stripe-webhook/     # Procesar webhooks de Stripe
│   │   └── index.ts
│   └── .env               # Variables de entorno locales
├── config.toml            # Configuración de Supabase
└── README.md
```

## 🚀 Setup Local

### 1. Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (usando Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Iniciar Supabase Local

```bash
# Desde la raíz del proyecto
supabase start
```

Esto iniciará:
- PostgreSQL en `localhost:54322`
- API en `localhost:54321`
- Studio en `http://localhost:54323`
- Edge Functions en `localhost:54321/functions/v1/`

### 3. Configurar Variables de Entorno

Edita `supabase/functions/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

### 4. Ejecutar Functions Localmente

```bash
# Servir todas las functions
supabase functions serve

# O servir una función específica
supabase functions serve stripe-checkout --env-file supabase/functions/.env
```

## 📡 Endpoints

### Stripe Checkout (Crear Sesión)

**URL Local:** `http://localhost:54321/functions/v1/stripe-checkout`

**Método:** `POST`

**Body:**
```json
{
  "email": "user@example.com",
  "career": "marketing-pro"
}
```

**Respuesta:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Carreras disponibles:**
- `marketing-pro`: Grado en Marketing Digital (99€)
- `sales-accelerator`: Grado en Desarrollo de Negocio (99€)
- `devops-engineer`: Grado en Ingeniería DevOps (99€)

### Stripe Webhook

**URL Local:** `http://localhost:54321/functions/v1/stripe-webhook`

**Método:** `POST`

**Headers:**
- `stripe-signature`: Firma del webhook de Stripe

Este endpoint recibe y procesa eventos de Stripe:
- `checkout.session.completed`: Pago completado
- `checkout.session.expired`: Sesión expirada
- `payment_intent.succeeded`: Intento de pago exitoso
- `payment_intent.payment_failed`: Pago fallido

## 🔧 Testing Local con Stripe CLI

### 1. Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe
```

### 2. Login en Stripe

```bash
stripe login
```

### 3. Configurar Webhook Local

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

Esto te dará un `webhook secret` que empieza con `whsec_`. Cópialo y añádelo a `supabase/functions/.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_el_secreto_que_te_dieron
```

### 4. Probar un Pago

```bash
stripe trigger checkout.session.completed
```

## 🌐 Deployment a Producción

### 1. Login en Supabase

```bash
supabase login
```

### 2. Link al Proyecto

```bash
supabase link --project-ref tu-proyecto-id
```

### 3. Configurar Secrets en Producción

```bash
# Stripe Secret Key (PRODUCTION)
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE

# Stripe Webhook Secret (obtenlo desde Stripe Dashboard)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Frontend URL
supabase secrets set FRONTEND_URL=https://tu-dominio.com
```

### 4. Deploy Functions

```bash
# Deploy todas las functions
supabase functions deploy

# O deploy una función específica
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

### 5. Configurar Webhook en Stripe Dashboard

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click en "Add endpoint"
3. URL del endpoint: `https://tu-proyecto-ref.supabase.co/functions/v1/stripe-webhook`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copia el "Signing secret" y actualiza en Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_el_nuevo_secret
   ```

## 🔗 Actualizar Frontend

Actualiza la URL del API en tu frontend:

**Dashboard `.env`:**
```bash
# Local
VITE_API_URL=http://localhost:54321/functions/v1

# Production
VITE_API_URL=https://tu-proyecto-ref.supabase.co/functions/v1
```

**Cambiar la llamada en `Home.tsx`:**
```typescript
// Antes (Fastify API)
const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, career })
});

// Ahora (Supabase Edge Function)
const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe-checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, // Si usas RLS
  },
  body: JSON.stringify({ email, career })
});
```

## 📊 Monitoreo

### Ver Logs Locales

```bash
# Ver logs en tiempo real
supabase functions logs stripe-checkout --follow
```

### Ver Logs en Producción

```bash
# Ver logs de producción
supabase functions logs stripe-checkout --project-ref tu-proyecto-id
```

## 🔒 Claves de Stripe

### Test (Development)
- **Publicable:** `pk_test_...` (obtén tu clave desde Stripe Dashboard)
- **Secreta:** `sk_test_...` (obtén tu clave desde Stripe Dashboard)

### Live (Production)
- **Publicable:** `pk_live_...` (obtén tu clave desde Stripe Dashboard)
- **Secreta:** `sk_live_...` (obtén tu clave desde Stripe Dashboard)

**⚠️ Nunca compartas tus claves secretas públicamente**

## 🛡️ Seguridad

- ✅ Las claves secretas se almacenan como secrets de Supabase (nunca en código)
- ✅ Verificación de firma en webhooks de Stripe
- ✅ CORS configurado correctamente
- ✅ Validación de entrada de datos
- ✅ Logs estructurados para debugging

## 📝 Notas

- Las Edge Functions usan Deno runtime (TypeScript nativo)
- Importaciones desde ESM.sh para módulos NPM
- Timeout máximo: 2 minutos por invocación
- Cold start: ~100-300ms primera vez
