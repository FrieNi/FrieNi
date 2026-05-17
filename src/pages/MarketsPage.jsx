// Markets page — overview, indices, sectors, movers heatmap
const MarketsPage = () => {
  const indices = window.MarketData.indices;
  const stocks = window.MarketData.stocks;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Markets</div>
          <div className="page-sub">Tuesday, May 7 · 11:42 AM ET · Equities mixed, USD softer, oil down 2.4%</div>
        </div>
        <div className="row row-gap-2">
          <Button variant="ghost" size="sm">Equities</Button>
          <Button variant="ghost" size="sm">FX</Button>
          <Button variant="ghost" size="sm">Crypto</Button>
          <Button variant="ghost" size="sm">Rates</Button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {indices.map(i => (
          <div key={i.symbol} className="kpi">
            <div className="kpi-label">{i.name}</div>
            <div className="kpi-value" style={{ fontSize: 20 }}>{i.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
            <div className="kpi-foot"><Delta value={i.change} pct={i.pct} /></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card title="S&P 500 Index" titleSize="lg" actions={
          <div className="chart-tabs">
            {['1D','1W','1M','3M','1Y','5Y'].map(r => (
              <div key={r} className={`chart-tab ${r === '1M' ? 'chart-tab-active' : ''}`}>{r}</div>
            ))}
          </div>
        }>
          <AreaChart data={window.MarketData.getSeries(1, 200, 5400, 0.012, 0.0008)} height={320} color="var(--brand)" />
        </Card>

        <Card title="Sector Heatmap" titleSize="lg">
          <Heatmap items={[...stocks, ...stocks.slice(0, 6)].map((s, i) => ({ symbol: s.symbol, pct: s.pct + (i * 0.15 - 0.4) }))} />
          <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--ink-3)' }}>
            Tap any tile to drill into the instrument. Color saturation reflects 1-day move.
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="All Equities" titleSize="lg" actions={
          <div className="row row-gap-2">
            <Button variant="ghost" size="xs">Filter</Button>
            <Button variant="ghost" size="xs">Sort: Mkt Cap ↓</Button>
            <Button variant="ghost" size="xs">Export</Button>
          </div>
        } bodyClass="tight">
          <StockTable stocks={stocks} columns={['symbol', 'price', 'change', 'spark', 'mcap', 'vol']}
            onSelect={(sym) => window.AppStore.setStock(sym)} />
        </Card>
      </div>
    </div>
  );
};

window.MarketsPage = MarketsPage;
