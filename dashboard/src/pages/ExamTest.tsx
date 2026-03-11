import { useState } from 'react';

const REGISTRY_URL = 'https://openclaw-skills-registry.onrender.com';

interface ExamQuestion {
  questionId: string;
  section: string;
  question: string;
  options: Record<string, string>;
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
    const text = exam.questions.map((q, i) => {
      const opts = Object.entries(q.options).map(([k, v]) => `  ${k}) ${v}`).join('\n');
      return `${i + 1}. [${q.questionId}] ${q.question}\n${opts}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // START
  if (phase === 'start') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Exam Test Page</h1>
        <p style={styles.subtitle}>Pagina temporal para probar el sistema de examenes</p>

        <div style={styles.card}>
          <h2>Marketing Pro — Foundation</h2>
          <p>50 preguntas disponibles (25 teoria + 25 casos)</p>

          <label style={styles.label}>
            Idioma / Language:
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={styles.select}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label style={styles.label}>
            Numero de preguntas:
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={styles.select}>
              <option value={5}>5 (rapido)</option>
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
          <button onClick={copyAllQuestions} style={styles.copyBtn}>
            {copied ? 'Copiado!' : 'Copiar todas las preguntas'}
          </button>
        </div>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(answeredCount / total) * 100}%` }} />
        </div>

        {exam.questions.map((q, i) => (
          <div key={q.questionId} style={{ ...styles.card, borderLeftColor: answers[q.questionId] ? '#2563eb' : '#e5e7eb', borderLeftWidth: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={styles.questionNum}>#{i + 1}</span>
              <span style={styles.badge}>{q.section === 'A' ? 'Teoria' : 'Caso'}</span>
              <span style={{ fontSize: 11, color: '#999' }}>{q.skillName}</span>
            </div>
            <p style={styles.questionText}>{q.question}</p>
            <div style={styles.options}>
              {Object.entries(q.options).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => selectAnswer(q.questionId, key)}
                  style={{
                    ...styles.option,
                    ...(answers[q.questionId] === key ? styles.optionSelected : {}),
                  }}
                >
                  <span style={styles.optionKey}>{key}</span>
                  <span>{text}</span>
                </button>
              ))}
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
  option: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 8, background: '#fafafa', cursor: 'pointer', textAlign: 'left' as const, fontSize: 14, transition: 'all 0.15s' },
  optionSelected: { borderColor: '#2563eb', background: '#eff6ff' },
  optionKey: { fontWeight: 'bold', color: '#2563eb', minWidth: 18 },
  skillRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  skillName: { flex: 1, fontSize: 13 },
  miniBar: { width: 80, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 4 },
  detailRow: { padding: '10px 12px', borderLeft: '3px solid', marginBottom: 8, background: '#fafafa', borderRadius: '0 8px 8px 0' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
};
