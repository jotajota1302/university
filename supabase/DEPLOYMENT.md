# 🚀 Guía Rápida de Deployment - Stripe en Supabase

## ✅ Checklist Pre-Deployment

- [ ] Instalar Supabase CLI
- [ ] Crear proyecto en Supabase Dashboard
- [ ] Configurar secrets en producción
- [ ] Configurar webhook en Stripe Dashboard
- [ ] Actualizar URL del frontend

## 📦 Paso 1: Instalar Supabase CLI

### Windows (PowerShell como Admin)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS/Linux
```bash
brew install supabase/tap/supabase
```

## 🔑 Paso 2: Login y Link al Proyecto

```bash
# Login en Supabase
supabase login

# Link al proyecto (busca tu project-ref en el dashboard)
supabase link --project-ref tu-proyecto-ref
```

## 🗄️ Paso 3: Crear Tabla en Base de Datos (Opcional)

Si quieres guardar los pedidos en Supabase:

```bash
# Aplicar migración
supabase db push
```

O ejecuta manualmente el SQL desde [supabase/migrations/20260306000000_create_pre_orders.sql](./migrations/20260306000000_create_pre_orders.sql) en el SQL Editor del Dashboard.

## 🔐 Paso 4: Configurar Secrets

```bash
# Stripe Secret Key (PRODUCTION)
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE

# Frontend URL
supabase secrets set FRONTEND_URL=https://tu-dominio.com

# Webhook Secret (lo obtendremos después de configurar el webhook en Stripe)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_PENDING
```

## 🚀 Paso 5: Deploy Functions

```bash
# Deploy ambas funciones
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

Esto te dará las URLs:
- Checkout: `https://tu-proyecto-ref.supabase.co/functions/v1/stripe-checkout`
- Webhook: `https://tu-proyecto-ref.supabase.co/functions/v1/stripe-webhook`

## 🔔 Paso 6: Configurar Webhook en Stripe

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://tu-proyecto-ref.supabase.co/functions/v1/stripe-webhook`
4. **Events to send:**
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. **Copia el Signing Secret** (empieza con `whsec_`)
7. Actualiza el secret en Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_el_secreto_copiado
```

8. Redeploy el webhook para que tome el nuevo secret:

```bash
supabase functions deploy stripe-webhook
```

## 🌐 Paso 7: Actualizar Frontend

### 1. Crear/Actualizar `.env` en `dashboard/`:

```bash
VITE_API_URL=https://tu-proyecto-ref.supabase.co/functions/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_51T65b8Gp8YCr2f0t4TeE2ElOhUBZHTRhVHLNOjTBFfuqNg1P05th5ypPjvujhovivzaXwn9npzmxPCU2pC9E8P0b009rPrBHb6
```

### 2. Actualizar `Home.tsx` (si es necesario):

Cambiar el endpoint de:
```typescript
`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`
```

A:
```typescript
`${import.meta.env.VITE_API_URL}/stripe-checkout`
```

### 3. Rebuild y deploy del frontend:

```bash
cd dashboard
npm run build
# Deploy a tu hosting (Vercel, Netlify, etc.)
```

## ✅ Paso 8: Testing en Producción

### Test Manual
1. Abre tu sitio en producción
2. Completa el formulario de pre-order
3. Usa una [tarjeta de prueba de Stripe](https://stripe.com/docs/testing):
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
4. Completa el pago
5. Verifica en Stripe Dashboard que el pago se registró

### Ver Logs
```bash
# Logs de checkout
supabase functions logs stripe-checkout --project-ref tu-proyecto-ref

# Logs de webhook
supabase functions logs stripe-webhook --project-ref tu-proyecto-ref
```

## 🔍 Verificación

### ✅ Checklist Post-Deployment

- [ ] Functions deployed correctamente
- [ ] Secrets configurados (verificar con `supabase secrets list`)
- [ ] Webhook configurado en Stripe Dashboard
- [ ] Frontend apuntando a las nuevas URLs
- [ ] Test de pago completado exitosamente
- [ ] Webhook recibiendo eventos (ver logs)
- [ ] (Opcional) Datos guardándose en tabla `pre_orders`

## 🐛 Troubleshooting

### Error: "Function not found"
- Verifica que las functions estén deployed: `supabase functions list`
- Redeploy: `supabase functions deploy stripe-checkout`

### Error: "Missing Stripe key"
- Verifica secrets: `supabase secrets list --project-ref tu-proyecto-ref`
- Reconfigura: `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`

### Webhook no funciona
- Verifica la URL del webhook en Stripe Dashboard
- Verifica el signing secret: `supabase secrets list`
- Revisa los logs: `supabase functions logs stripe-webhook`
- Testea desde Stripe: Dashboard > Webhooks > tu endpoint > "Send test webhook"

### CORS errors
- Las functions ya tienen CORS configurado (`Access-Control-Allow-Origin: *`)
- Si necesitas más control, edita `corsHeaders` en cada function

## 🔄 Rollback

Si algo sale mal, puedes volver al API de Fastify:

```bash
# En dashboard/.env
VITE_API_URL=http://localhost:3000  # o tu URL de Fastify

# En Home.tsx, revertir a:
`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`
```

## 📊 Monitoreo

### Dashboard de Supabase
- Functions: Ver invocaciones, errores, latencia
- Logs: Ver logs en tiempo real
- Database: Ver registros de `pre_orders`

### Dashboard de Stripe
- Payments: Ver pagos completados
- Webhooks: Ver eventos enviados/recibidos
- Test mode vs Live mode

## 💰 Costos

**Supabase:**
- Free tier: 500,000 Edge Function invocations/mes
- Pro tier ($25/mes): 2,000,000 invocations/mes

**Stripe:**
- Test mode: Gratis ilimitado
- Live mode: 1.5% + 0.25€ por transacción exitosa (EU)

## 🎉 ¡Listo!

Tu integración de Stripe con Supabase está funcionando. Los usuarios ahora pueden hacer pre-orders desde tu landing page y todos los pagos se procesan de forma segura.
