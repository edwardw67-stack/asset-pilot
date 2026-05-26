export default function ResetPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 28 }}>
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1>Reset</h1>
        <p>Open /manual and use the browser console command provided by the assistant to reset local data.</p>
        <a href="/manual" style={{ color: '#fbbf24' }}>Back</a>
      </section>
    </main>
  );
}
