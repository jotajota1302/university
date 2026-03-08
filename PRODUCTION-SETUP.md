# 🚀 Configuración de Producción - Checklist Completa

## ✅ Paso 1: Configurar Secrets en Supabase (BACKEND)

Necesitas configurar las claves de producción en Supabase para que las Edge Functions puedan procesar pagos reales.

```bash
# 1. Desde la raíz del proyecto
cd C:\Users\edu_8\Documents\CLAW-UNIVERSITY\university

# 2. Configurar clave secreta de Stripe (PRODUCCIÓN)
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_KEY

# 3. Configurar URL del frontend en Vercel
supabase secrets set FRONTEND_URL=https://tu-dominio-vercel.vercel.app

# 4. Webhook secret (lo configuraremos en el siguiente paso)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_PENDING
```

**⚠️ IMPORTANTE:** Reemplaza `https://tu-dominio-vercel.vercel.app` con la URL real de tu proyecto en Vercel.

### Verificar secrets configurados:
```bash
supabase secrets list
```

Deberías ver:
- `STRIPE_SECRET_KEY` ✓
- `FRONTEND_URL` ✓
- `STRIPE_WEBHOOK_SECRET` ✓

---

## ✅ Paso 2: Configurar Webhook en Stripe Dashboard

Los webhooks son necesarios para que Stripe notifique a tu backend cuando un pago se completa.

### 2.1. Crear Webhook Endpoint

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Asegúrate de estar en **LIVE MODE** (no Test)
3. Click en **"Add endpoint"**
4. Configura:
   - **Endpoint URL:** `https://iknhymwjpsknzdxffxmf.supabase.co/functions/v1/stripe-webhook`
   - **Description:** OpenClaw University - Production Webhooks
   - **Events to send:**
     - ✅ `checkout.session.completed`
     - ✅ `checkout.session.expired`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`

5. Click **"Add endpoint"**

### 2.2. Copiar Signing Secret

1. En el webhook recién creado, copia el **"Signing secret"** (empieza con `whsec_`)
2. Actualiza el secret en Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_EL_SECRETO_QUE_COPIASTE
```

### 2.3. Redeploy Webhook Function

Para que tome el nuevo secret:

```bash
supabase functions deploy stripe-webhook
```

---

## ✅ Paso 3: Verificar Variables de Entorno en Vercel

En tu proyecto de Vercel, asegúrate de tener configuradas:

### Environment Variables en Vercel:

```bash
VITE_API_URL=https://iknhymwjpsknzdxffxmf.supabase.co/functions/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Cómo verificar/añadir en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings > Environment Variables
3. Añade las variables si no están
4. Redeploy el proyecto si añadiste nuevas variables

---

## ✅ Paso 4: Activar Stripe Live Mode

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Cambia el toggle de **"Test mode"** a **"Live mode"** (arriba a la derecha)
3. Verifica que aparezca el texto **"You're viewing live data"**

---

## ✅ Paso 5: Test de Pago Real

### ⚠️ ADVERTENCIA: Esto procesará un pago REAL

1. Abre tu sitio en producción: `https://tu-dominio.vercel.app`
2. Completa el formulario de pre-order
3. **USA UNA TARJETA REAL** (ya no funcionan las de prueba)
4. Usa un importe pequeño para probar (99€)
5. Completa el pago

### Verificar que funcionó:

1. **Stripe Dashboard** > Payments
   - Debería aparecer el pago de 99€
   - Estado: Succeeded

2. **Supabase Dashboard** > Table Editor > `pre_orders`
   - Debería aparecer el registro del pedido

3. **Logs de Supabase:**
   ```bash
   supabase functions logs stripe-webhook --project-ref wijjvyjmpipekxsolocq
   ```
   - Deberías ver: "Payment completed" con los datos del pedido

---

## 🔍 Troubleshooting

### Error: "Missing authorization header"
**Solución:** Verifica que `VITE_SUPABASE_ANON_KEY` esté configurada en Vercel

### Error: "Invalid API Key provided"
**Solución:** Verifica que `STRIPE_SECRET_KEY` en Supabase sea la clave **LIVE** (empieza con `sk_live_`)

### Webhook no se ejecuta
**Solución:**
1. Verifica que el webhook esté en **Live mode** en Stripe
2. Testea el webhook desde Stripe Dashboard: Webhooks > tu endpoint > "Send test webhook"
3. Revisa logs: `supabase functions logs stripe-webhook`

### Frontend no conecta con Supabase
**Solución:**
1. Verifica CORS: Las Edge Functions ya tienen CORS configurado
2. Verifica que `VITE_API_URL` apunte a `https://wijjvyjmpipekxsolocq.supabase.co/functions/v1`

---

## 📊 Monitoreo Post-Lanzamiento

### Stripe Dashboard
- Pagos en tiempo real
- Disputas/chargebacks
- Análisis de conversión

### Supabase Dashboard
- Logs de Edge Functions
- Tabla `pre_orders` con todos los pedidos
- Métricas de uso

### Comandos útiles:
```bash
# Ver logs de checkout en tiempo real
supabase functions logs stripe-checkout --follow

# Ver logs de webhook en tiempo real
supabase functions logs stripe-webhook --follow

# Ver todos los pedidos en la base de datos
# (desde Supabase Dashboard > SQL Editor)
SELECT * FROM pre_orders ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ Checklist Final

- [ ] Secrets configurados en Supabase (STRIPE_SECRET_KEY, FRONTEND_URL, STRIPE_WEBHOOK_SECRET)
- [ ] Webhook creado en Stripe Dashboard (Live mode)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Stripe en Live mode
- [ ] Test de pago real completado exitosamente
- [ ] Webhook recibió notificación (verificar logs)
- [ ] Pedido guardado en tabla `pre_orders`

---

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos, tu sistema de pagos estará 100% operativo en producción.

**Cosas a tener en cuenta:**
- Los pagos procesados son REALES
- Stripe cobra 1.5% + 0.25€ por transacción exitosa (Europa)
- Los reembolsos deben hacerse desde Stripe Dashboard
- Guarda las claves de producción en un lugar seguro
