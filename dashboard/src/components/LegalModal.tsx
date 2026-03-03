import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Términos y Condiciones</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
            aria-label="Cerrar"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Identificación */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. IDENTIFICACIÓN DEL TITULAR</h3>
            <p className="leading-relaxed">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa que:
            </p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li><strong>Titular:</strong> Eduardo Severá Gonsálvez</li>
              <li><strong>NIF:</strong> 48.363.875-G</li>
              <li><strong>Domicilio:</strong> Jose Luis Navarro Campello 1, 03202 Elche, Alicante, España</li>
              <li><strong>Email:</strong> edusg83@gmail.com</li>
            </ul>
          </section>

          {/* Condiciones de Pre-Compra */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. CONDICIONES DE PRE-COMPRA</h3>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong>2.1. Naturaleza del Producto:</strong> OpenClaw University es una plataforma educativa digital que ofrece programas de formación especializados ("Grados") para agentes de inteligencia artificial. La pre-compra garantiza el acceso al programa seleccionado cuando este esté disponible.
              </p>
              <p className="leading-relaxed">
                <strong>2.2. Modelo de Pago:</strong> El precio total del programa se divide en dos pagos:
              </p>
              <ul className="ml-6 space-y-1 list-disc">
                <li><strong>Adelanto de Pre-Compra:</strong> 99€ (pagadero inmediatamente)</li>
                <li><strong>Pago Restante:</strong> Variable según el programa elegido (pagadero antes del 16 de marzo de 2026)</li>
              </ul>
              <p className="leading-relaxed">
                <strong>2.3. Fecha de Inicio:</strong> Los programas comenzarán el 16 de marzo de 2026. Si por causas de fuerza mayor el inicio se retrasa, se notificará con al menos 15 días de antelación.
              </p>
              <p className="leading-relaxed">
                <strong>2.4. Derecho de Desistimiento:</strong> De acuerdo con el Real Decreto Legislativo 1/2007, el usuario tiene derecho a desistir de la compra en un plazo de 14 días desde el pago del adelanto, sin necesidad de justificación. Para ejercer este derecho, debe enviar un correo electrónico a edusg83@gmail.com indicando su intención de desistir. El reembolso se realizará en un plazo máximo de 14 días.
              </p>
              <p className="leading-relaxed">
                <strong>2.5. Política de Reembolso Post-Inicio:</strong> Una vez iniciado el programa (16 de marzo de 2026), no se realizarán reembolsos del pago completo. El adelanto de 99€ solo será reembolsable durante los 14 días posteriores al pago inicial.
              </p>
            </div>
          </section>

          {/* Protección de Datos */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. PROTECCIÓN DE DATOS PERSONALES (RGPD Y LOPD)</h3>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong>3.1. Responsable del Tratamiento:</strong> Eduardo Severá Gonsálvez, con domicilio en Jose Luis Navarro Campello 1, 03202 Elche, Alicante. Email de contacto: edusg83@gmail.com
              </p>
              <p className="leading-relaxed">
                <strong>3.2. Finalidad del Tratamiento:</strong> Los datos personales recabados (email, nombre, datos de pago) se utilizarán exclusivamente para:
              </p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Gestionar la pre-compra y el acceso al programa educativo</li>
                <li>Procesar pagos a través de Stripe (procesador de pagos externo)</li>
                <li>Enviar comunicaciones relacionadas con el servicio contratado</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
              <p className="leading-relaxed">
                <strong>3.3. Legitimación:</strong> La base legal para el tratamiento de datos es la ejecución del contrato de prestación de servicios educativos y el consentimiento expreso del usuario.
              </p>
              <p className="leading-relaxed">
                <strong>3.4. Destinatarios:</strong> Los datos no se cederán a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio (ejemplo: Stripe para procesamiento de pagos).
              </p>
              <p className="leading-relaxed">
                <strong>3.5. Derechos del Usuario:</strong> Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición enviando un correo a edusg83@gmail.com. También puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
              </p>
              <p className="leading-relaxed">
                <strong>3.6. Conservación de Datos:</strong> Los datos se conservarán durante la vigencia del servicio y, posteriormente, durante los plazos legales establecidos para el cumplimiento de obligaciones fiscales y legales (4-6 años).
              </p>
              <p className="leading-relaxed">
                <strong>3.7. Seguridad:</strong> Se han implementado medidas de seguridad técnicas y organizativas para proteger los datos contra acceso no autorizado, pérdida o destrucción.
              </p>
            </div>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. PROPIEDAD INTELECTUAL E INDUSTRIAL</h3>
            <p className="leading-relaxed">
              Todos los contenidos de la plataforma OpenClaw University (textos, imágenes, código, diseño, marcas) son propiedad de Eduardo Severá Gonsálvez o se utilizan bajo licencia. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
            </p>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">5. LIMITACIÓN DE RESPONSABILIDAD</h3>
            <p className="leading-relaxed">
              OpenClaw University se compromete a proporcionar contenido educativo de calidad, pero no garantiza resultados específicos derivados del uso de los programas. El titular no se hace responsable de interrupciones del servicio por causas técnicas, mantenimiento o fuerza mayor.
            </p>
          </section>

          {/* Modificaciones */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">6. MODIFICACIONES</h3>
            <p className="leading-relaxed">
              OpenClaw University se reserva el derecho de modificar estos términos y condiciones. Las modificaciones se notificarán a los usuarios con al menos 15 días de antelación a través del email proporcionado.
            </p>
          </section>

          {/* Legislación */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">7. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h3>
            <p className="leading-relaxed">
              Estas condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Elche, Alicante, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          {/* Contacto */}
          <section className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Contacto para Consultas</h3>
            <p className="leading-relaxed">
              Para cualquier duda o consulta relacionada con estos términos, puede contactar en:
              <br />
              <strong>Email:</strong> edusg83@gmail.com
              <br />
              <strong>Dirección:</strong> Jose Luis Navarro Campello 1, 03202 Elche, Alicante
            </p>
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Última actualización: 3 de marzo de 2026
          </p>
        </div>

        <div className="sticky bottom-0 p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg bg-brand-red dark:bg-lime-300 text-white dark:text-slate-950 font-semibold hover:bg-brand-600 dark:hover:bg-lime-400 transition shadow-lg"
          >
            He leído y acepto los términos
          </button>
        </div>
      </div>
    </div>
  );
}
