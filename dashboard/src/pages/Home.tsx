import { useState } from 'react';

const careers = [
  {
    id: 'marketing-pro',
    name: 'Marketing Pro',
    icon: '🎯',
    price: '149€/mes',
    skills: 8,
    description: 'SEO, contenido, CRO, ads, email marketing',
    highlights: ['Auditoría SEO completa', 'Planificación de contenido', 'Optimización de conversión', 'Análisis de campañas']
  },
  {
    id: 'sales-accelerator',
    name: 'Sales Accelerator',
    icon: '💼',
    price: '149€/mes',
    skills: 8,
    description: 'Pipeline, prospección, scoring, CRM',
    highlights: ['Análisis de pipeline', 'Secuencias de prospección', 'Priorización de oportunidades', 'Análisis de competencia']
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    icon: '🛠️',
    price: '199€/mes',
    skills: 10,
    description: 'CI/CD, observability, security, IaC',
    highlights: ['Evaluación CI/CD', 'Monitoring setup', 'Security hardening', 'Cost optimization']
  }
];

export function Home() {
  const [email, setEmail] = useState('');
  const [career, setCareer] = useState('marketing-pro');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/pre-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, career })
      });

      if (!response.ok) throw new Error('Error al registrar');

      setStatus('success');
      setMessage('¡Gracias! Te contactaremos pronto.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Error al registrar. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl text-slate-900">OpenClaw University</span>
          </div>
          <a
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Login
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <span>✨</span>
            <span>Launching Q2 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Especializa tu Agente OpenClaw<br />
            <span className="text-emerald-600">en 48 horas</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Carreras certificadas que transforman tu instancia en un especialista. 
            Skills curadas + Certificación oficial + Actualizaciones continuas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#careers"
              className="px-8 py-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30"
            >
              Ver Carreras
            </a>
            <a
              href="#pre-registro"
              className="px-8 py-4 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition"
            >
              Pre-registro
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Cómo Funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: 'Elige Carrera', desc: 'Selecciona la especialización que necesitas', icon: '🎯' },
              { num: 2, title: 'Conecta OpenClaw', desc: 'Tu instancia se conecta a OpenSkills', icon: '🔗' },
              { num: 3, title: 'Instala Skills', desc: '8-10 skills curadas automáticamente', icon: '⚡' },
              { num: 4, title: 'Obtén Certificación', desc: 'Badge oficial verificable', icon: '🏆' }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-sm text-emerald-600 font-semibold mb-2">Paso {step.num}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">Carreras Disponibles</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Paquetes completos de skills curadas por expertos. Mejor precio que comprar individualmente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {careers.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-xl hover:border-emerald-300 transition">
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{c.name}</h3>
                <div className="text-2xl font-bold text-emerald-600 mb-4">{c.price}</div>
                <p className="text-sm text-slate-600 mb-4">{c.description}</p>
                
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">{c.skills} skills incluidas:</div>
                  <ul className="space-y-1">
                    {c.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition text-sm">
                  Más info
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-registro */}
      <section id="pre-registro" className="py-16 px-6 bg-slate-50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Reserva tu Plaza</h2>
            <p className="text-slate-600">
              Primeros 20 inscritos: <span className="font-semibold text-emerald-600">50% descuento</span> el primer mes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Carrera de interés</label>
                <select
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="marketing-pro">Marketing Pro</option>
                  <option value="sales-accelerator">Sales Accelerator</option>
                  <option value="devops-engineer">DevOps Engineer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-slate-300 transition"
              >
                {status === 'loading' ? 'Enviando...' : 'Reserva tu Plaza'}
              </button>

              {status === 'success' && (
                <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                  {message}
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-600">
          <p className="mb-4">
            OpenClaw University · Powered by{' '}
            <a href="https://openskills.app" className="text-emerald-600 hover:underline">OpenSkills</a>
          </p>
          <p>© 2026 OpenClaw University. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
