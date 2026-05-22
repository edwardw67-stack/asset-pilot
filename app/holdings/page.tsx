const rows = [
  { market: 'TW', ticker: '2308', name: '台達電', qty: 70, avg: 1626, price: 1688 },
  { market: 'US', ticker: 'GOOGL', name: 'Alphabet', qty: 50, avg: 366.07, price: 402.71 },
];

export default function HoldingsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 32 }}>
      <section style={{ maxWidth: 1000, margin: '0 auto' }}>
        <a href="/" style={{ color: '#fbbf24' }}>← Dashboard</a>
        <h1>持倉</h1>
        <p style={{ color: '#94a3b8' }}>建倉日期是非必填。第一版先支援手動輸入與報表匯入後產生持倉。</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
              <th style={cell}>市場</th><th style={cell}>代號</th><th style={cell}>名稱</th><th style={cell}>股數</th><th style={cell}>成本</th><th style={cell}>現價</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.ticker} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={cell}>{row.market}</td><td style={cell}>{row.ticker}</td><td style={cell}>{row.name}</td><td style={cell}>{row.qty}</td><td style={cell}>{row.avg}</td><td style={cell}>{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

const cell = { padding: '12px 8px' };
