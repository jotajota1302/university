import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Zap, Link2, Cpu, Trophy, Moon, Sun } from 'lucide-react';
import { useTheme } from '../store/theme';

const careers = [
  {
    id: 'marketing-pro',
    name: 'Grado en Marketing Digital',
    icon: '🎯',
    price: '1.490€',
    regularPrice: '1.790€',
    deposit: '100€',
    remaining: '1.390€',
    skills: 8,
    available: true,
    startDate: '16 marzo 2026',
    description: 'SEO, contenido, CRO, ads, email marketing',
    highlights: ['Auditoría SEO completa', 'Planificación de contenido', 'Optimización de conversión', 'Análisis de campañas']
  },
  {
    id: 'sales-accelerator',
    name: 'Grado en Desarrollo de Negocio',
    icon: '💼',
    price: '1.690€',
    regularPrice: '1.990€',
    deposit: '100€',
    remaining: '1.590€',
    skills: 8,
    available: false,
    description: 'Pipeline, prospección, scoring, CRM',
    highlights: ['Análisis de pipeline', 'Secuencias de prospección', 'Priorización de oportunidades', 'Análisis de competencia']
  },
  {
    id: 'devops-engineer',
    name: 'Grado en Ingeniería DevOps',
    icon: '🛠️',
    price: '1.990€',
    regularPrice: '2.490€',
    deposit: '100€',
    remaining: '1.890€',
    skills: 10,
    available: false,
    description: 'CI/CD, observability, security, IaC',
    highlights: ['Evaluación CI/CD', 'Monitoring setup', 'Security hardening', 'Cost optimization']
  }
];

const flowSteps = [
  {
    num: 1,
    title: 'Matrícula',
    desc: 'Elige la facultad y programa académico de tu agente',
    icon: Zap,
  },
  {
    num: 2,
    title: 'Acceso al Campus',
    desc: 'Tu agente se conecta al ecosistema académico',
    icon: Link2,
  },
  {
    num: 3,
    title: 'Cursar Asignaturas',
    desc: '8-10 materias curadas se instalan automáticamente',
    icon: Cpu,
  },
  {
    num: 4,
    title: 'Graduación',
    desc: 'Diploma oficial verificable',
    icon: Trophy,
  },
];

export function Home() {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [career, setCareer] = useState('marketing-pro');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Detectar si el usuario volvió de Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      setStatus('success');
      setMessage('¡Pago completado! Tu plaza ha sido reservada. Recibirás un email de confirmación.');
      // Limpiar URL
      window.history.replaceState({}, '', '/');
    } else if (paymentStatus === 'cancelled') {
      setStatus('error');
      setMessage('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Crear sesión de checkout en Stripe
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, career })
      });

      if (!response.ok) throw new Error('Error al crear la sesión de pago');

      const { url } = await response.json();

      // Redirigir a Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error al procesar el pago. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="text-sm font-semibold tracking-[0.08em] text-slate-900 dark:text-slate-100">
            🎓 OPENCLAW UNIVERSITY
          </a>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200 dark:border-white/10 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <a
              href="#pre-registro"
              className="rounded-lg bg-brand-red dark:bg-lime-300 px-4 py-2 text-sm font-semibold text-white dark:text-slate-950 hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg shadow-brand-red/20 dark:shadow-lime-300/20"
            >
              Pre-order
            </a>
          </div>
        </nav>
      </header>

      <main id="top" className="relative">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 dark:border-lime-300/30 bg-emerald-50 dark:bg-lime-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-lime-200">
              🎓 Pre-order: Marketing Digital · 100€ · Inicio 16/03
            </p>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              La Primera Universidad para Agentes OpenClaw: Carreras Completas, Certificación Oficial
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              Programas académicos completos que llevan a tu agente desde estudiante hasta profesional certificado.
              Currículo curado + Titulación oficial + Educación continua.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#pre-registro"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-red dark:bg-lime-300 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950 hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg shadow-brand-red/30 dark:shadow-lime-300/30"
              >
                Reservar con 100€
                <ArrowRight size={18} />
              </a>
              <a
                href="#careers"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Más información
              </a>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">Por qué OpenClaw University</p>
            <div className="mt-5 space-y-4">
              {[
                'Programas académicos completos de 8-12 asignaturas por especialidad',
                'Titulación oficial de OpenClaw University',
                'Plan educativo más económico que cursos individuales',
              ].map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-red dark:text-lime-300" />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Duración del programa</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">A tu ritmo, modalidad flexible</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Facultades disponibles</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">3 (Marketing, Ventas, DevOps)</p>
              </div>
            </div>
          </aside>
        </section>

        {/* How it Works */}
        <section className="border-t border-slate-200 dark:border-white/10 py-16 bg-slate-50 dark:bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-cyan-600 dark:text-sky-300">Cómo funciona</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">De la Matrícula a la Graduación en 4 Pasos</h2>
            </div>
            
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {flowSteps.map((step) => (
                <article key={step.num} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 backdrop-blur-sm">
                  <step.icon className="h-7 w-7 text-cyan-600 dark:text-sky-300" />
                  <div className="mt-2 text-sm text-cyan-600 dark:text-sky-300 font-semibold">Paso {step.num}</div>
                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="border-t border-slate-200 dark:border-white/10 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-emerald-600 dark:text-lime-300">Facultades disponibles</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Elige la Facultad de tu Agente</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Programas académicos diseñados por expertos del sector. Más económico que cursar asignaturas sueltas en OpenSkills.
              </p>
            </div>
            
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {careers.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:border-brand-red dark:hover:border-lime-300/50 transition backdrop-blur-sm shadow-sm hover:shadow-lg relative">
                  {c.available && (
                    <div className="absolute -top-3 right-4 bg-emerald-600 dark:bg-lime-300 text-white dark:text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                      PRE-ORDER ABIERTO
                    </div>
                  )}
                  {!c.available && (
                    <div className="absolute -top-3 right-4 bg-slate-400 dark:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PRÓXIMAMENTE
                    </div>
                  )}

                  <div className="text-4xl mb-4">{c.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{c.name}</h3>

                  {c.available ? (
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-brand-red dark:text-lime-300">{c.price}</span>
                        <span className="text-sm text-slate-400 line-through">{c.regularPrice}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Adelanto hoy: <span className="font-semibold text-slate-900 dark:text-slate-100">{c.deposit}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Resto al inicio: <span className="font-semibold text-slate-900 dark:text-slate-100">{c.remaining}</span>
                      </div>
                      <div className="mt-2 text-xs text-emerald-700 dark:text-lime-300 font-medium">
                        Inicio: {c.startDate}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-brand-red dark:text-lime-300">{c.price}</span>
                        <span className="text-sm text-slate-400 line-through">{c.regularPrice}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Adelanto: <span className="font-semibold text-slate-900 dark:text-slate-100">{c.deposit}</span>
                      </div>
                    </div>
                  )}

                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>

                  <div className="mt-4 mb-4">
                    <div className="text-xs text-slate-500 mb-2">{c.skills} asignaturas incluidas:</div>
                    <ul className="space-y-1">
                      {c.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-brand-red dark:text-lime-300">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {c.available ? (
                    <a
                      href="#pre-registro"
                      className="block text-center rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 transition"
                    >
                      Reservar con {c.deposit}
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 text-sm font-semibold cursor-not-allowed"
                    >
                      Avisar cuando esté disponible
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pre-registro */}
        <section id="pre-registro" className="border-t border-slate-200 dark:border-white/10 py-16 bg-slate-50 dark:bg-transparent">
          <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Siguiente paso</span>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Reserva tu Plaza con 100€</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Asegura tu precio de primera promoción. Ahorra <span className="font-semibold text-brand-red dark:text-lime-300">300€</span> y sé parte de la historia de OpenClaw University.
              </p>
            </div>

            {/* Desglose visual */}
            <div className="mb-8 rounded-xl border border-emerald-200 dark:border-lime-300/30 bg-emerald-50 dark:bg-lime-300/10 p-6">
              <div className="text-sm font-semibold text-emerald-900 dark:text-lime-200 mb-4">📊 Desglose de tu matrícula</div>
              <div className="space-y-2 text-sm text-emerald-800 dark:text-lime-100">
                <div className="font-semibold">Grado en Marketing Digital</div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>Matrícula completa:</span>
                  <span className="font-bold">1.490€ <span className="text-xs line-through opacity-60">1.790€</span></span>
                </div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>Adelanto hoy:</span>
                  <span className="font-bold">100€</span>
                </div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>Resto al inicio:</span>
                  <span className="font-bold">1.390€ (antes del 16 marzo)</span>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-300 dark:border-lime-300/50 font-semibold text-emerald-900 dark:text-lime-200">
                  💰 Ahorras 300€ vs. precio regular
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-lime-300/50 focus:border-brand-red dark:focus:border-lime-300/50"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Facultad de interés</label>
                  <select
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-lime-300/50 focus:border-brand-red dark:focus:border-lime-300/50"
                  >
                    <option value="marketing-pro">Grado en Marketing Digital</option>
                    <option value="sales-accelerator">Grado en Desarrollo de Negocio</option>
                    <option value="devops-engineer">Grado en Ingeniería DevOps</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3 rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition shadow-lg shadow-brand-red/30 dark:shadow-lime-300/30"
                >
                  {status === 'loading' ? 'Procesando...' : 'Pagar 100€ y Reservar Plaza'}
                </button>

                {status === 'success' && (
                  <div className="p-4 rounded-lg border border-emerald-300 dark:border-lime-300/30 bg-emerald-50 dark:bg-lime-300/10 text-emerald-700 dark:text-lime-200 text-sm">
                    {message}
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-lg border border-red-300 dark:border-red-400/30 bg-red-50 dark:bg-red-400/10 text-red-700 dark:text-red-200 text-sm">
                    {message}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 bg-slate-50 dark:bg-transparent">
          <div className="mx-auto max-w-6xl text-center text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-4">
              OpenClaw University · Acreditada por el ecosistema{' '}
              <a href="https://skills-registry.com" target="_blank" rel="noopener noreferrer" className="text-brand-red dark:text-lime-300 hover:underline">
                OpenSkills
              </a>
            </p>
            <p>© 2026 OpenClaw University. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
