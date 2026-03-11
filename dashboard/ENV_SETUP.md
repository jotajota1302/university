# Variables de Entorno - OpenClaw University Dashboard

Este documento lista las variables de entorno necesarias para el frontend.

## 🔑 Variables Requeridas

### Para Producción (Vercel / Netlify / etc.)

Configura estas variables en tu plataforma de hosting:

```bash
# Supabase Edge Functions URL
VITE_API_URL=https://iknhymwjpsknzdxffxmf.supabase.co/functions/v1

# Supabase Public Key (anon key)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrbmh5bXdqcHNrbnpkeGZmeG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjIzMTIsImV4cCI6MjA4ODM5ODMxMn0.-iskkYA7Xlomx_M1D3O4Buc2_9TAmIAk5DL-XJXRN8I

# Stripe Public Key (TEST mode para pruebas, LIVE mode para producción)
VITE_STRIPE_PUBLIC_KEY=pk_test_51T65bIKGNiZmDpPvPSovZZsxUOqSyWtFHG1MrPeScWnEVUhD6CuF6NyYQLPq86Jc7lWPHeS8qT0eC42acycUNhOw00djl8nJKJ
```

## 📦 Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en **Settings** → **Environment Variables**
3. Añade cada variable con su valor:
   - Name: `VITE_API_URL`
   - Value: `https://iknhymwjpsknzdxffxmf.supabase.co/functions/v1`
   - Environment: **Production**, **Preview**, **Development** (todas marcadas)
4. Repite para `VITE_SUPABASE_ANON_KEY` y `VITE_STRIPE_PUBLIC_KEY`
5. Click en **Save**
6. **Redeploy** tu proyecto para que cargue las nuevas variables

## 🔄 Redeploy en Vercel

Opción 1 - Desde el Dashboard:
1. Ve a **Deployments**
2. Click en los 3 puntos del deployment más reciente
3. Click en **Redeploy**

Opción 2 - Desde CLI:
```bash
cd dashboard
vercel --prod
```

Opción 3 - Trigger desde Git:
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

## 🧪 Verificar que Funciona

Después del redeploy, abre:
```
https://www.claw-university.com
```

Y prueba hacer click en "Pagar 20€ y Reservar Plaza". Debería redirigir a Stripe Checkout correctamente en lugar de mostrar un error 404.

## 📝 Para Desarrollo Local

Las variables ya están configuradas en `.env.local` (ignorado por git).

Para crear tu propio archivo local:
```bash
cp dashboard/.env.example dashboard/.env.local
# Edita .env.local con tus valores
```

## ⚠️ Importante

- **NO** commitear archivos `.env*` con claves reales a git
- `.env.example` es el único que debe estar en git (sin valores reales)
- Usar variables de entorno de Vercel para producción
- El `.gitignore` raíz ignora todos los archivos `.env.*`
