# 🚀 Quick Deploy - Sin Docker (Producción Directa)

Si no tienes Docker instalado y quieres deployar directamente a producción:

## 1️⃣ Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Crea una organización (gratis)
4. Crea un nuevo proyecto:
   - **Name:** OpenClaw University
   - **Database Password:** (guarda esto en un lugar seguro)
   - **Region:** West EU (Ireland) - más cercano a España
   - **Pricing Plan:** Free

Espera 2-3 minutos a que el proyecto se provisione.

## 2️⃣ Obtener Credenciales

Una vez creado el proyecto, ve a **Settings > API**:

- **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
- **Project API keys:**
  - `anon` public (para el frontend)
  - `service_role` secret (para las Edge Functions)

**Copia estos valores, los necesitarás más adelante.**

## 3️⃣ Login desde CLI

```powershell
# Login en Supabase
supabase login

# Link al proyecto (reemplaza con tu project-ref)
supabase link --project-ref xxxxxxxxxxxxx
```

El `project-ref` es la parte de tu URL: `https://[ESTE-VALOR].supabase.co`

## 4️⃣ Crear Tabla en Base de Datos

1. Ve al **SQL Editor** en el dashboard de Supabase
2. Copia y pega el contenido de: `supabase/migrations/20260306000000_create_pre_orders.sql`
3. Click en **Run**

Esto creará la tabla `pre_orders` para almacenar los pedidos.

## 5️⃣ Configurar Secrets

```powershell
# Navega a la raíz del proyecto
cd C:\Users\edu_8\Documents\CLAW-UNIVERSITY\university

# Configura las variables de entorno (PRODUCCIÓN)
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE

supabase secrets set FRONTEND_URL=https://tu-dominio.com

# Webhook secret (por ahora déjalo vacío, lo actualizaremos después)
supabase secrets set STRIPE_WEBHOOK_SECRET=pending
```

## 6️⃣ Deploy Edge Functions

```powershell
# Deploy checkout function
supabase functions deploy stripe-checkout

# Deploy webhook function
supabase functions deploy stripe-webhook
```

Esto te dará las URLs:
```
✅ stripe-checkout: https://xxxxxxxxxxxxx.supabase.co/functions/v1/stripe-checkout
✅ stripe-webhook: https://xxxxxxxxxxxxx.supabase.co/functions/v1/stripe-webhook
```

**¡Guarda estas URLs!**

## 7️⃣ Configurar Webhook en Stripe

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://xxxxxxxxxxxxx.supabase.co/functions/v1/stripe-webhook`
4. **Description:** OpenClaw University Pre-orders
5. **Events to send:**
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. Click **"Add endpoint"**
7. **Copia el "Signing secret"** (empieza con `whsec_`)

8. **Actualiza el secret en Supabase:**
   ```powershell
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_el_secreto_que_copiaste
   ```

9. **Redeploy el webhook:**
   ```powershell
   supabase functions deploy stripe-webhook
   ```

## 8️⃣ Actualizar Frontend

### En `dashboard/.env.production`:

```bash
VITE_API_URL=https://xxxxxxxxxxxxx.supabase.co/functions/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE
```

### Actualizar el código en `dashboard/src/pages/Home.tsx`:

Busca la línea que hace el fetch (aproximadamente línea 116):

```typescript
// ANTES
const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`, {

// DESPUÉS
const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe-checkout`, {
```

### Build y Deploy del Frontend:

```powershell
cd dashboard
npm run build
# Sube la carpeta dist/ a tu hosting (Vercel, Netlify, etc.)
```

## 9️⃣ Testing

### Test desde Stripe Dashboard:

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click en tu endpoint
3. Click en **"Send test webhook"**
4. Selecciona `checkout.session.completed`
5. Verifica que llegue correctamente

### Test real:

1. Abre tu sitio web
2. Completa el formulario de pre-order
3. Usa tarjeta de prueba si estás en Stripe Test Mode:
   - **Número:** 4242 4242 4242 4242
   - **Fecha:** Cualquier fecha futura
   - **CVC:** Cualquier 3 dígitos

## 🔍 Verificar que Todo Funciona

```powershell
# Ver logs de las functions
supabase functions logs stripe-checkout
supabase functions logs stripe-webhook

# Ver secrets configurados
supabase secrets list
```

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase
- [ ] Tabla `pre_orders` creada
- [ ] Secrets configurados (STRIPE_SECRET_KEY, WEBHOOK_SECRET, FRONTEND_URL)
- [ ] Functions deployed (checkout + webhook)
- [ ] Webhook configurado en Stripe Dashboard
- [ ] Frontend actualizado con nuevas URLs
- [ ] Test de pago realizado exitosamente

## 🎉 ¡Listo!

Tu integración de Stripe está funcionando en producción sin necesidad de Docker.

## 📊 Ver Pedidos en Base de Datos

1. Ve al dashboard de Supabase
2. **Table Editor** > `pre_orders`
3. Verás todos los pedidos completados

## 🔄 Si Necesitas Hacer Cambios

```powershell
# Edita el código en supabase/functions/stripe-checkout/index.ts
# Luego redeploy:
supabase functions deploy stripe-checkout

# Ver logs en tiempo real:
supabase functions logs stripe-checkout --follow
```
