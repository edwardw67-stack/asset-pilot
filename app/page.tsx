const snapshots = [
  { date: '05/18', value: 1280000 },
  { date: '05/19', value: 1305000 },
  { date: '05/20', value: 1291000 },
  { date: '05/21', value: 1342000 },
  { date: '05/22', value: 1368000 },
];

const holdings = [
  { market: 'TW', ticker: '2308', name: '台達電', value: 113820, pnl: 7120, risk: 'ATR 20 / 2.3x' },
  { market: 'US', ticker: 'GOOGL', name: 'Alphabet', value: 201355, pnl: 18320, risk: 'ATR 20 / 2.0x' },
  { market: 'US', ticker: 'TSLA', name: 'Tesla', value: 90210, pnl: -4200, risk: 'ATR 20 / 3.0x' },
];

export default function Home() {
  const max = Math.max(...snapshots.map((item) => item.value));

  return (
    <main style={{ minHeight: '100vh', padding: 32, background: '#020617' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>Asset Pilot</p>
          <h1 style={{ fontSize: 44, margin: '8px 0', letterSpacing: -1 }}>資產追蹤與 ATR 停利儀表板</h1>
          <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 720 }}>
            台股、美股、現金、負債、匯率與資產曲線集中管理。第一版先做安全的 Google 登入、手動輸入、Firstrade CSV 與報表匯入流程。
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          <Metric label="總資產 TWD" value="1,368,000" />
          <Metric label="未實現損益" value="+21,240" />
          <Metric label="現金水位" value="18.6%" />
          <Metric label="USD/TWD" value="31.20" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitle}>資產曲線</h2>
            <div style={{ display: 'flex', alignItems: 'end', gap: 14, height: 220, paddingTop: 24 }}>
              {snapshots.map((item) => (
                <div key={item.date} style={{ flex: 1 }}>
                  <div
                    title={`${item.date} ${item.value}`}
                    style={{
                      height: `${(item.value / max) * 180}px`,
                      borderRadius: 10,
                      background: 'linear-gradient(180deg, #fbbf24, #92400e)',
                    }}
                  />
                  <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>{item.date}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={sectionTitle}>匯入流程</h2>
            <ol style={{ color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 18 }}>
              <li>上傳 Firstrade CSV 或台股報表</li>
              <li>解析並預覽資料</li>
              <li>標記重複與錯誤列</li>
              <li>確認後寫入持倉與現金</li>
            </ol>
          </section>
        </div>

        <section style={{ ...panelStyle, marginTop: 16 }}>
          <h2 style={sectionTitle}>持倉與 ATR 建議</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                  <th style={thStyle}>市場</th>
                  <th style={thStyle}>代號</th>
                  <th style={thStyle}>名稱</th>
                  <th style={thStyle}>市值 TWD</th>
                  <th style={thStyle}>損益</th>
                  <th style={thStyle}>建議</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((item) => (
                  <tr key={item.ticker} style={{ borderTop: '1px solid #1f2937' }}>
                    <td style={tdStyle}>{item.market}</td>
                    <td style={tdStyle}>{item.ticker}</td>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.value.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: item.pnl >= 0 ? '#86efac' : '#fca5a5' }}>{item.pnl.toLocaleString()}</td>
                    <td style={tdStyle}>{item.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <section style={panelStyle}>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{label}</p>
      <strong style={{ display: 'block', marginTop: 10, fontSize: 26 }}>{value}</strong>
    </section>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid #1e293b',
  borderRadius: 20,
  padding: 20,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
};

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 8px',
  color: '#e5e7eb',
};
