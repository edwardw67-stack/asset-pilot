const balances = [
  { account: 'TWD Cash', currency: 'TWD', amount: 180000 },
  { account: 'Firstrade Cash', currency: 'USD', amount: 3200 },
];

export default function CashPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 32 }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <a href="/" style={{ color: '#fbbf24' }}>← Dashboard</a>
        <h1>現金</h1>
        <p style={{ color: '#94a3b8' }}>TWD 與 USD 現金會一起納入總資產；USD 會用最新 USD/TWD 匯率換算。</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          {balances.map((item) => (
            <section key={item.account} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 18, padding: 18 }}>
              <p style={{ margin: 0, color: '#94a3b8' }}>{item.account}</p>
              <strong style={{ display: 'block', marginTop: 8, fontSize: 28 }}>{item.currency} {item.amount.toLocaleString()}</strong>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
