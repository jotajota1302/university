import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Zap, Link2, Cpu, Trophy, Globe } from 'lucide-react';
import { useLang, t } from '../store/lang';
import { LegalModal } from '../components/LegalModal';

const careerIds = ['marketing-pro', 'sales-accelerator', 'devops-engineer'] as const;
const careerKeys = ['marketing', 'sales', 'devops'] as const;
const careerIcons = ['🎯', '💼', '🛠️'];
const careerPrices = ['590€', '690€', '790€'];
const careerRegularPrices = ['790€', '890€', '990€'];
const careerDeposits = ['99€', '99€', '99€'];
const careerRemaining = ['491€', '591€', '691€'];
const careerSkills = [12, 12, 14];
const careerAvailable = [true, false, false];
const careerStartDate = ['16 marzo 2026', '', ''];

const flowStepIcons = [Zap, Link2, Cpu, Trophy];

export function Home() {
  const { lang, setLang } = useLang();
  const [email, setEmail] = useState('');
  const [career, setCareer] = useState('marketing-pro');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      setStatus('success');
      setMessage(t('pre.success', lang));
      window.history.replaceState({}, '', '/');
    } else if (paymentStatus === 'cancelled') {
      setStatus('error');
      setMessage(t('pre.cancelled', lang));
      window.history.replaceState({}, '', '/');
    }
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setStatus('error');
      setMessage(t('pre.terms.error', lang));
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, career })
      });

      if (!response.ok) throw new Error('Error');

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch {
      setStatus('error');
      setMessage(t('pre.error', lang));
    }
  };

  const _ = (key: string) => t(key, lang);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="text-sm font-semibold tracking-[0.08em] text-slate-900 dark:text-slate-100">
            🎓 OPENCLAW UNIVERSITY
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              aria-label="Switch language"
            >
              <Globe size={14} />
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <a
              href="#pre-registro"
              className="rounded-lg bg-brand-red dark:bg-lime-300 px-4 py-2 text-sm font-semibold text-white dark:text-slate-950 hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg shadow-brand-red/20 dark:shadow-lime-300/20"
            >
              {_('nav.preorder')}
            </a>
          </div>
        </nav>
      </header>

      <main id="top" className="relative">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 dark:border-lime-300/30 bg-emerald-50 dark:bg-lime-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-lime-200">
              🎓 {_('hero.badge')}
            </p>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              {_('hero.title')}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              {_('hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#pre-registro"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-red dark:bg-lime-300 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950 hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg shadow-brand-red/30 dark:shadow-lime-300/30"
              >
                {_('hero.cta')}
                <ArrowRight size={18} />
              </a>
              <a
                href="#careers"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                {_('hero.more')}
              </a>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">{_('why.title')}</p>
            <div className="mt-5 space-y-4">
              {['why.item1', 'why.item2', 'why.item3'].map((key) => (
                <p key={key} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-red dark:text-lime-300" />
                  {_(key)}
                </p>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{_('why.duration.label')}</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{_('why.duration.value')}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{_('why.faculties.label')}</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{_('why.faculties.value')}</p>
              </div>
            </div>
          </aside>
        </section>

        {/* How it Works */}
        <section className="border-t border-slate-200 dark:border-white/10 py-16 bg-slate-50 dark:bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-cyan-600 dark:text-sky-300">{_('how.label')}</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{_('how.title')}</h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((num) => {
                const Icon = flowStepIcons[num - 1];
                return (
                  <article key={num} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 backdrop-blur-sm">
                    <Icon className="h-7 w-7 text-cyan-600 dark:text-sky-300" />
                    <div className="mt-2 text-sm text-cyan-600 dark:text-sky-300 font-semibold">{_('how.step')} {num}</div>
                    <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{_(`how.step${num}.title`)}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{_(`how.step${num}.desc`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="border-t border-slate-200 dark:border-white/10 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-emerald-600 dark:text-lime-300">{_('careers.label')}</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{_('careers.title')}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {_('careers.subtitle')}
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {careerIds.map((id, i) => {
                const key = careerKeys[i];
                const available = careerAvailable[i];
                const highlights = [1, 2, 3, 4].map((n) => _(`career.${key}.h${n}`));

                return (
                  <div key={id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:border-brand-red dark:hover:border-lime-300/50 transition backdrop-blur-sm shadow-sm hover:shadow-lg relative">
                    {available && (
                      <div className="absolute -top-3 right-4 bg-emerald-600 dark:bg-lime-300 text-white dark:text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                        {_('careers.open')}
                      </div>
                    )}
                    {!available && (
                      <div className="absolute -top-3 right-4 bg-slate-400 dark:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {_('careers.soon')}
                      </div>
                    )}

                    <div className="text-4xl mb-4">{careerIcons[i]}</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{_(`career.${key}`)}</h3>

                    {available ? (
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-brand-red dark:text-lime-300">{careerPrices[i]}</span>
                          <span className="text-sm text-slate-400 line-through">{careerRegularPrices[i]}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {_('careers.deposit')} <span className="font-semibold text-slate-900 dark:text-slate-100">{careerDeposits[i]}</span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {_('careers.remaining')} <span className="font-semibold text-slate-900 dark:text-slate-100">{careerRemaining[i]}</span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-700 dark:text-lime-300 font-medium">
                          {_('careers.start')} {careerStartDate[i]}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-brand-red dark:text-lime-300">{careerPrices[i]}</span>
                          <span className="text-sm text-slate-400 line-through">{careerRegularPrices[i]}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {_('careers.deposit2')} <span className="font-semibold text-slate-900 dark:text-slate-100">{careerDeposits[i]}</span>
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{_(`career.${key}.desc`)}</p>

                    <div className="mt-4 mb-4">
                      <div className="text-xs text-slate-500 mb-2">{careerSkills[i]} {_('careers.subjects')}</div>
                      <ul className="space-y-1">
                        {highlights.slice(0, 3).map((h, j) => (
                          <li key={j} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-brand-red dark:text-lime-300">✓</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {available ? (
                      <a
                        href="#pre-registro"
                        className="block text-center rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 transition"
                      >
                        {_('careers.reserve')} {careerDeposits[i]}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 text-sm font-semibold cursor-not-allowed"
                      >
                        {_('careers.notify')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pre-registro */}
        <section id="pre-registro" className="border-t border-slate-200 dark:border-white/10 py-16 bg-slate-50 dark:bg-transparent">
          <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{_('pre.label')}</span>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{_('pre.title')}</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {_('pre.subtitle').replace('{save}', '')}
                <span className="font-semibold text-brand-red dark:text-lime-300">{_('pre.save')}</span>
                {_('pre.subtitle').split('{save}')[1] || ''}
              </p>
            </div>

            {/* Desglose visual */}
            <div className="mb-8 rounded-xl border border-emerald-200 dark:border-lime-300/30 bg-emerald-50 dark:bg-lime-300/10 p-6">
              <div className="text-sm font-semibold text-emerald-900 dark:text-lime-200 mb-4">📊 {_('pre.breakdown.title')}</div>
              <div className="space-y-2 text-sm text-emerald-800 dark:text-lime-100">
                <div className="font-semibold">{_('pre.breakdown.career')}</div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>{_('pre.breakdown.full')}</span>
                  <span className="font-bold">590€ <span className="text-xs line-through opacity-60">790€</span></span>
                </div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>{_('pre.breakdown.now')}</span>
                  <span className="font-bold">99€</span>
                </div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-emerald-300 dark:border-lime-300/50">
                  <span>{_('pre.breakdown.rest')}</span>
                  <span className="font-bold">{_('pre.breakdown.rest.date')}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-300 dark:border-lime-300/50 font-semibold text-emerald-900 dark:text-lime-200">
                  💰 {_('pre.breakdown.savings')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{_('pre.email')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-lime-300/50 focus:border-brand-red dark:focus:border-lime-300/50"
                    placeholder={_('pre.email.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{_('pre.faculty')}</label>
                  <select
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-lime-300/50 focus:border-brand-red dark:focus:border-lime-300/50"
                  >
                    {careerIds.map((id, i) => (
                      <option key={id} value={id}>{_(`career.${careerKeys[i]}`)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-white/10 text-brand-red dark:text-lime-300 focus:ring-brand-red dark:focus:ring-lime-300"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-300">
                    {_('pre.terms')}{' '}
                    <button
                      type="button"
                      onClick={() => setShowLegalModal(true)}
                      className="text-brand-red dark:text-lime-300 hover:underline font-semibold"
                    >
                      {_('pre.terms.link')}
                    </button>
                    {' '}{_('pre.terms.of')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !acceptedTerms}
                  className="w-full px-6 py-3 rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition shadow-lg shadow-brand-red/30 dark:shadow-lime-300/30"
                >
                  {status === 'loading' ? _('pre.loading') : _('pre.submit')}
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
              {_('footer.accredited')}{' '}
              <a href="https://skills-registry.com" target="_blank" rel="noopener noreferrer" className="text-brand-red dark:text-lime-300 hover:underline">
                OpenSkills
              </a>
            </p>
            <p>{_('footer.rights')}</p>
          </div>
        </footer>
      </main>

      <LegalModal
        isOpen={showLegalModal}
        onClose={() => {
          setShowLegalModal(false);
          setAcceptedTerms(true);
        }}
      />
    </div>
  );
}
