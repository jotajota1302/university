import { X } from 'lucide-react';
import { useLang, t } from '../store/lang';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalModal({ isOpen, onClose }: LegalModalProps) {
  const { lang } = useLang();
  const _ = (key: string) => t(key, lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{_('legal.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
            aria-label={_('legal.close')}
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s1.title')}</h3>
            <p className="leading-relaxed">{_('legal.s1.intro')}</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li><strong>{lang === 'es' ? 'Titular' : 'Owner'}:</strong> Eduardo Severá Gonsálvez</li>
              <li><strong>NIF:</strong> 48.363.875-G</li>
              <li><strong>{lang === 'es' ? 'Domicilio' : 'Address'}:</strong> Jose Luis Navarro Campello 1, 03202 Elche, Alicante, España</li>
              <li><strong>Email:</strong> edusg83@gmail.com</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s2.title')}</h3>
            <div className="space-y-3">
              <p className="leading-relaxed"><strong>{_('legal.s2.1')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s2.2')}</strong></p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>{_('legal.s2.2.a')}</li>
                <li>{_('legal.s2.2.b')}</li>
              </ul>
              <p className="leading-relaxed"><strong>{_('legal.s2.3')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s2.4')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s2.5')}</strong></p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s3.title')}</h3>
            <div className="space-y-3">
              <p className="leading-relaxed"><strong>{_('legal.s3.1')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s3.2')}</strong></p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>{_('legal.s3.2.a')}</li>
                <li>{_('legal.s3.2.b')}</li>
                <li>{_('legal.s3.2.c')}</li>
                <li>{_('legal.s3.2.d')}</li>
              </ul>
              <p className="leading-relaxed"><strong>{_('legal.s3.3')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s3.4')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s3.5')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s3.6')}</strong></p>
              <p className="leading-relaxed"><strong>{_('legal.s3.7')}</strong></p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s4.title')}</h3>
            <p className="leading-relaxed">{_('legal.s4.text')}</p>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s5.title')}</h3>
            <p className="leading-relaxed">{_('legal.s5.text')}</p>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s6.title')}</h3>
            <p className="leading-relaxed">{_('legal.s6.text')}</p>
          </section>

          {/* Section 7 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{_('legal.s7.title')}</h3>
            <p className="leading-relaxed">{_('legal.s7.text')}</p>
          </section>

          {/* Contact */}
          <section className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{_('legal.contact.title')}</h3>
            <p className="leading-relaxed">
              {_('legal.contact.text')}
              <br />
              <strong>Email:</strong> edusg83@gmail.com
              <br />
              <strong>{lang === 'es' ? 'Dirección' : 'Address'}:</strong> Jose Luis Navarro Campello 1, 03202 Elche, Alicante
            </p>
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            {_('legal.updated')}
          </p>
        </div>

        <div className="sticky bottom-0 p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg"
          >
            {_('legal.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
