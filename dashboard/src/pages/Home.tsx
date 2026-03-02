import { useState } from 'react';
import { ArrowRight, CheckCircle2, Zap, Link2, Cpu, Trophy } from 'lucide-react';

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

const flowSteps = [
  {
    num: 1,
    title: 'Elige Carrera',
    desc: 'Selecciona la especialización que necesitas',
    icon: Zap,
  },
  {
    num: 2,
    title: 'Conecta OpenClaw',
    desc: 'Tu instancia se conecta a OpenSkills',
    icon: Link2,
  },
  {
    num: 3,
    title: 'Instala Skills',
    desc: '8-10 skills curadas automáticamente',
    icon: Cpu,
  },
  {
    num: 4,
    title: 'Obtén Certificación',
    desc: 'Badge oficial verificable',
    icon: Trophy,
  },
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="text-sm font-semibold tracking-[0.08em] text-slate-100">
            🎓 OPENCLAW UNIVERSITY
          </a>
          <a
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:border-lime-300/50 hover:text-lime-300 transition"
          >
            Login
          </a>
        </nav>
      </header>

      <main id="top" className="relative">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-lime-200">
              ✨ Launching Q2 2026
            </p>
            
            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Especializa tu Agente OpenClaw con Carreras Certificadas
            </h1>
            
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Carreras certificadas que transforman tu instancia en un especialista. 
              Skills curadas + Certificación oficial + Actualizaciones continuas.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#careers"
                className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-lime-400 transition shadow-lg shadow-lime-300/30"
              >
                Ver Carreras
                <ArrowRight size={18} />
              </a>
              <a
                href="#pre-registro"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 hover:border-lime-300/50 hover:text-lime-300 transition"
              >
                Pre-registro
              </a>
            </div>
          </div>

          <aside className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-300">Propuesta de valor</p>
            <div className="mt-5 space-y-4">
              {[
                'Paquetes coherentes de 8-12 skills por vertical',
                'Certificación oficial verificable',
                'Mejor precio que comprar skills individualmente',
              ].map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                  {item}
                </p>
              ))}
            </div>
            
            <div className="mt-8 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Time to specialist</p>
                <p className="mt-1 text-base font-semibold text-slate-100">A tu ritmo</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Carreras disponibles</p>
                <p className="mt-1 text-base font-semibold text-slate-100">3 (Marketing, Sales, DevOps)</p>
              </div>
            </div>
          </aside>
        </section>

        {/* How it Works */}
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-sky-300">Cómo funciona</span>
              <h2 className="mt-4 text-3xl font-semibold text-white">Un flujo simple de idea a certificación</h2>
            </div>
            
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {flowSteps.map((step) => (
                <article key={step.num} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <step.icon className="h-7 w-7 text-sky-300" />
                  <div className="mt-2 text-sm text-sky-300 font-semibold">Paso {step.num}</div>
                  <h3 className="mt-2 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="border-t border-white/10 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-lime-300">Carreras disponibles</span>
              <h2 className="mt-4 text-3xl font-semibold text-white">Especializa tu instancia en tu vertical</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
                Paquetes completos de skills curadas por expertos. Mejor precio que comprar individualmente en OpenSkills.
              </p>
            </div>
            
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {careers.map((c) => (
                <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-lime-300/50 transition backdrop-blur-sm">
                  <div className="text-4xl mb-4">{c.icon}</div>
                  <h3 className="text-xl font-bold text-white">{c.name}</h3>
                  <div className="mt-2 text-2xl font-bold text-lime-300">{c.price}</div>
                  <p className="mt-3 text-sm text-slate-400">{c.description}</p>
                  
                  <div className="mt-4 mb-4">
                    <div className="text-xs text-slate-500 mb-2">{c.skills} skills incluidas:</div>
                    <ul className="space-y-1">
                      {c.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-lime-300">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <code className="block rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-lime-200 font-mono">
                    university enroll {c.id}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pre-registro */}
        <section id="pre-registro" className="border-t border-white/10 py-16">
          <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Siguiente paso</span>
              <h2 className="mt-3 text-3xl font-semibold text-white">Reserva tu Plaza</h2>
              <p className="mt-3 text-slate-300">
                Primeros 20 inscritos: <span className="font-semibold text-lime-300">50% descuento</span> el primer mes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-300/50 focus:border-lime-300/50"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Carrera de interés</label>
                  <select
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-300/50 focus:border-lime-300/50"
                  >
                    <option value="marketing-pro">Marketing Pro</option>
                    <option value="sales-accelerator">Sales Accelerator</option>
                    <option value="devops-engineer">DevOps Engineer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3 rounded-lg bg-lime-300 text-slate-950 font-semibold hover:bg-lime-400 disabled:bg-slate-700 disabled:text-slate-500 transition shadow-lg shadow-lime-300/30"
                >
                  {status === 'loading' ? 'Enviando...' : 'Reserva tu Plaza'}
                </button>

                {status === 'success' && (
                  <div className="p-4 rounded-lg border border-lime-300/30 bg-lime-300/10 text-lime-200 text-sm">
                    {message}
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-lg border border-red-400/30 bg-red-400/10 text-red-200 text-sm">
                    {message}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-6">
          <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
            <p className="mb-4">
              OpenClaw University · Powered by{' '}
              <a href="https://openskills.app" className="text-lime-300 hover:underline">OpenSkills</a>
            </p>
            <p>© 2026 OpenClaw University. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
