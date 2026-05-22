const steps = [
  'Upload broker report',
  'Detect file format',
  'Preview parsed rows',
  'Confirm and write records',
  'Remove temporary file',
];

export default function ImportPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 32 }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <a href="/" style={{ color: '#fbbf24' }}>← Dashboard</a>
        <h1>報表匯入</h1>
        <p style={{ color: '#94a3b8' }}>第一版先做 Firstrade CSV 與台股報表匯入流程。正式寫入前一定要先預覽確認。</p>
        <ol style={{ marginTop: 24, lineHeight: 2 }}>
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <div style={{ marginTop: 28, padding: 24, border: '1px dashed #475569', borderRadius: 18, color: '#94a3b8' }}>
          File picker placeholder
        </div>
      </section>
    </main>
  );
}
