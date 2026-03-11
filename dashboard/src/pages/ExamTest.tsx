import { useState } from 'react';

const REGISTRY_URL = 'https://openclaw-skills-registry.onrender.com';

// Defensive: handle both localized (string) and raw i18n ({es:..., en:...}) responses
function safeString(value: unknown, lang: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj[lang] && typeof obj[lang] === 'string') return obj[lang] as string;
    if (obj['es'] && typeof obj['es'] === 'string') return obj['es'] as string;
  }
  return String(value ?? '');
}

function safeOptions(value: unknown, lang: string): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const obj = value as Record<string, unknown>;
  // i18n format: {es: {A:..}, en: {A:..}}
  if (obj[lang] && typeof obj[lang] === 'object') return obj[lang] as Record<string, string>;
  if (obj['es'] && typeof obj['es'] === 'object') return obj['es'] as Record<string, string>;
  // Already flat: {A: "...", B: "..."}
  if (typeof Object.values(obj)[0] === 'string') return obj as Record<string, string>;
  return {};
}

interface ExamQuestion {
  questionId: string;
  section: string;
  question: string | Record<string, unknown>;
  options: Record<string, unknown>;
  skillName: string;
}

interface ExamStart {
  sessionId: string;
  packSlug: string;
  blockSlug: string;
  totalQuestions: number;
  passThreshold: number;
  questions: ExamQuestion[];
}

interface GradeDetail {
  questionId: string;
  correct: boolean;
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string | null;
  skillName: string;
}

interface GradeResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passThreshold: number;
  detail: GradeDetail[];
  scoreBySkill: Record<string, { correct: number; total: number }>;
}

type Phase = 'start' | 'exam' | 'results';
type Lang = 'es' | 'en';

export function ExamTest() {
  const [phase, setPhase] = useState<Phase>('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exam, setExam] = useState<ExamStart | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<GradeResult | null>(null);
  const [limit, setLimit] = useState(50);
  const [lang, setLang] = useState<Lang>('es');
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [parseMsg, setParseMsg] = useState('');

  async function startExam() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${REGISTRY_URL}/v1/exams/marketing-pro/foundation?limit=${limit}&lang=${lang}`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: ExamStart = await res.json();
      setExam(data);
      setAnswers({});
      setPhase('exam');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar examen');
    } finally {
      setLoading(false);
    }
  }

  async function submitExam() {
    if (!exam) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${REGISTRY_URL}/v1/exams/${exam.sessionId}/grade`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, lang }),
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: GradeResult = await res.json();
      setResults(data);
      setPhase('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar respuestas');
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function copyAllQuestions() {
    if (!exam) return;
    const header = `Responde a las siguientes ${exam.questions.length} preguntas de tipo test. Para cada una, indica SOLO la letra de la respuesta correcta (A, B, C o D).\n\nFormato de respuesta requerido (una línea por pregunta):\nF-MF-T01: C\nF-MF-T02: A\n...\n\n---\n\n`;
    const body = exam.questions.map((q, i) => {
      const opts = Object.entries(safeOptions(q.options, lang)).map(([k, v]) => `  ${k}) ${v}`).join('\n');
      return `${i + 1}. [${q.questionId}] ${safeString(q.question, lang)}\n${opts}`;
    }).join('\n\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function parseAnswers() {
    if (!exam || !pasteText.trim()) return;
    const parsed: Record<string, string> = {};
    const lines = pasteText.split('\n');
    for (const line of lines) {
      // Match patterns like: "F-MF-T01: C", "F-MF-T01 - C", "F-MF-T01 C", "1. F-MF-T01: C"
      const match = line.match(/([A-Z]-[A-Z]{2}-[A-Z]\d{2})\s*[:\-–—]?\s*([A-Da-d])/);
      if (match) {
        parsed[match[1]] = match[2].toUpperCase();
      }
    }
    const count = Object.keys(parsed).length;
    if (count === 0) {
      setParseMsg('No se encontraron respuestas. Asegúrate de usar el formato: F-MF-T01: C');
      return;
    }
    setAnswers((prev) => ({ ...prev, ...parsed }));
    setParseMsg(`${count} respuestas importadas`);
    setShowPaste(false);
    setPasteText('');
    setTimeout(() => setParseMsg(''), 3000);
  }

  // START
  if (phase === 'start') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Exam Test Page</h1>
        <p style={styles.subtitle}>Página temporal para probar el sistema de exámenes</p>

        <div style={styles.card}>
          <h2>Marketing Pro — Foundation</h2>
          <p>50 preguntas disponibles (25 teoría + 25 casos)</p>

          <label style={styles.label}>
            Idioma / Language:
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={styles.select}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>

          <label style={styles.label}>
            Número de preguntas:
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={styles.select}>
              <option value={5}>5 (rápido)</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50 (completo)</option>
            </select>
          </label>

          <button onClick={startExam} disabled={loading} style={styles.btn}>
            {loading ? 'Cargando...' : 'Iniciar Examen'}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </div>

        <a href="/" style={styles.backLink}>← Volver al inicio</a>
      </div>
    );
  }

  // EXAM — all questions on one page
  if (phase === 'exam' && exam) {
    const answeredCount = Object.keys(answers).length;
    const total = exam.questions.length;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span><strong>{answeredCount}/{total}</strong> respondidas</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={copyAllQuestions} style={styles.copyBtn}>
              {copied ? '¡Copiado!' : 'Copiar preguntas'}
            </button>
            <button onClick={() => setShowPaste(!showPaste)} style={{ ...styles.copyBtn, background: showPaste ? '#dbeafe' : '#f3f4f6' }}>
              Pegar respuestas
            </button>
          </div>
        </div>

        {parseMsg && (
          <p style={{ background: '#ecfdf5', color: '#065f46', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>{parseMsg}</p>
        )}

        {showPaste && (
          <div style={{ ...styles.card, background: '#f8fafc' }}>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              Pega las respuestas de Claude/ChatGPT aquí. Formato esperado: <code>F-MF-T01: C</code> (una por línea)
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'F-MF-T01: C\nF-MF-T02: A\nF-TA-T01: B\n...'}
              style={{ width: '100%', minHeight: 120, padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={parseAnswers} style={{ ...styles.btn, marginTop: 0, flex: 1 }}>
                Importar respuestas
              </button>
              <button onClick={() => { setShowPaste(false); setPasteText(''); }} style={{ ...styles.copyBtn, padding: '10px 16px' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(answeredCount / total) * 100}%` }} />
        </div>

        {exam.questions.map((q, i) => (
          <div key={q.questionId} style={{ ...styles.card, borderLeftColor: answers[q.questionId] ? '#2563eb' : '#e5e7eb', borderLeftWidth: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={styles.questionNum}>#{i + 1}</span>
              <span style={styles.badge}>{q.section === 'A' ? 'Teoría' : 'Caso'}</span>
              <span style={{ fontSize: 11, color: '#999' }}>{q.skillName}</span>
            </div>
            <p style={styles.questionText}>{safeString(q.question, lang)}</p>
            <div style={styles.options}>
              {Object.entries(safeOptions(q.options, lang)).map(([key, text]) => {
                const isSelected = answers[q.questionId] === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectAnswer(q.questionId, key)}
                    style={{
                      ...styles.option,
                      borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                      background: isSelected ? '#eff6ff' : '#fafafa',
                    }}
                  >
                    <span style={styles.optionKey}>{key}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={submitExam} disabled={loading} style={styles.btn}>
            {loading ? 'Enviando...' : `Enviar Examen (${answeredCount}/${total} respondidas)`}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  // RESULTS
  if (phase === 'results' && results) {
    return (
      <div style={styles.container}>
        <div style={{
          ...styles.card,
          borderColor: results.passed ? '#22c55e' : '#ef4444',
          borderWidth: 2,
        }}>
          <h1 style={{ fontSize: 48, textAlign: 'center' as const }}>
            {results.passed ? '✅' : '❌'}
          </h1>
          <h2 style={{ textAlign: 'center' as const }}>
            {results.passed ? 'APROBADO / PASSED' : 'NO APROBADO / FAILED'}
          </h2>
          <p style={{ textAlign: 'center' as const, fontSize: 36, fontWeight: 'bold' }}>
            {results.score}%
          </p>
          <p style={{ textAlign: 'center' as const, color: '#666' }}>
            {results.correctAnswers} / {results.totalQuestions} correctas
            (min: {results.passThreshold}%)
          </p>
        </div>

        <div style={styles.card}>
          <h3>Score por Skill</h3>
          {Object.entries(results.scoreBySkill).map(([skill, data]) => (
            <div key={skill} style={styles.skillRow}>
              <span style={styles.skillName}>{skill}</span>
              <span>{data.correct}/{data.total}</span>
              <div style={styles.miniBar}>
                <div style={{
                  ...styles.miniFill,
                  width: `${(data.correct / data.total) * 100}%`,
                  backgroundColor: data.correct / data.total >= 0.7 ? '#22c55e' : '#ef4444',
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h3>Detalle</h3>
          {results.detail.map((d) => (
            <div key={d.questionId} style={{
              ...styles.detailRow,
              borderLeftColor: d.correct ? '#22c55e' : '#ef4444',
            }}>
              <div style={styles.detailHeader}>
                <span style={{ fontWeight: 'bold' }}>{d.questionId}</span>
                <span>{d.correct ? '✓' : '✗'}</span>
              </div>
              {!d.correct && (
                <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                  Tu: <strong>{d.userAnswer || '(sin respuesta)'}</strong> — Correcta: <strong>{d.correctAnswer}</strong>
                </p>
              )}
              {d.explanation && (
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>{d.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={() => { setPhase('start'); setResults(null); setExam(null); }} style={styles.btn}>
            Repetir Examen
          </button>
        </div>
        <a href="/" style={{ ...styles.backLink, marginTop: 12, display: 'inline-block' }}>← Volver al inicio</a>
      </div>
    );
  }

  return null;
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { color: '#888', marginBottom: 24, fontSize: 14 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  label: { display: 'block', marginTop: 16, fontSize: 14 },
  select: { display: 'block', marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, width: '100%' },
  btn: { display: 'block', width: '100%', padding: '12px 24px', marginTop: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  copyBtn: { padding: '6px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  error: { color: '#ef4444', marginTop: 12, fontSize: 14 },
  backLink: { color: '#2563eb', fontSize: 14, textDecoration: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 14 },
  badge: { background: '#e0e7ff', color: '#3730a3', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  progressBar: { height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#2563eb', borderRadius: 3, transition: 'width 0.3s' },
  questionNum: { fontWeight: 'bold', fontSize: 14, color: '#2563eb' },
  questionText: { fontSize: 16, lineHeight: 1.5, marginBottom: 12 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  option: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 8, background: '#fafafa', cursor: 'pointer', textAlign: 'left' as const, fontSize: 14 },
  optionKey: { fontWeight: 'bold', color: '#2563eb', minWidth: 18 },
  skillRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  skillName: { flex: 1, fontSize: 13 },
  miniBar: { width: 80, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 4 },
  detailRow: { padding: '10px 12px', borderLeft: '3px solid', marginBottom: 8, background: '#fafafa', borderRadius: '0 8px 8px 0' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
};
