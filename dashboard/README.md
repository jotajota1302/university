# OpenClaw University Dashboard

> Frontend web para auditoría y validación de agentes IA

## 🚀 Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🏗️ Build

```bash
npm run build
```

Output in `dist/`

## 🌐 Production

**URL:** https://openclaw-university-dashboard.vercel.app

**Deploy:** Automático desde GitHub via Vercel

## 🛠️ Stack

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React
- **API:** OpenClaw University API

## 📁 Structure

```
src/
├── api/           # API client & types
├── components/    # Reusable UI components
├── pages/         # Route pages
└── App.tsx        # Router setup
```

## 🔧 Configuration

API URL configured in `src/api/client.ts`:
```typescript
const API_URL = 'https://openclaw-university-api.onrender.com';
```

---

**Made with ❤️ for OpenClaw**
