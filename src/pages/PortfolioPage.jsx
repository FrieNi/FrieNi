// Portfolio page — holdings, allocation, restructuring
const PortfolioPage = () => {
  const portfolio = window.MarketData.portfolio.map(p => {
    const stock = window.MarketData.getStock(p.symbol);
    const value = p.shares * stock.price;
    const cost = p.shares * p.avgCost;
    const pl = value - cost;
    const plPct = (pl / cost) * 100;
    return { ...stock, ...p, value, cost, pl, plPct };
  });
  const totalValue = portfolio.reduce((s, p) => s + p.value, 0);
  const totalCost = portfolio.reduce((s, p) => s + p.cost, 0);
  const totalPL = totalValue - totalCost;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Portfolio</div>
          <div className="page-sub">6 positions · last rebalanced 12 days ago · drift 4.2%</div>
        </div>
        <div className="row row-gap-2">
          <Button variant="ghost" size="sm">Export</Button>
          <Button variant="secondary" size="sm">Rebalance</Button>
          <Button variant="primary" size="sm">Run analysis</Button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Total Value</div>
          <div className="kpi-value">${window.FmtUtils.fmtPrice(totalValue)}</div>
          <div className="kpi-foot"><Delta value={totalPL} pct={(totalPL / totalCost) * 100} /></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Cost Basis</div>
          <div className="kpi-value">${window.FmtUtils.fmtPrice(totalCost)}</div>
          <div className="kpi-foot"><span>across 6 positions</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Unrealized P&L</div>
          <div className="kpi-value gain">+${window.FmtUtils.fmtPrice(totalPL)}</div>
          <div className="kpi-foot"><span>realized YTD: +$3,418</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sharpe (1Y)</div>
          <div className="kpi-value">1.42</div>
          <div className="kpi-foot"><span style={{ color: 'var(--gain)' }}>above benchmark 1.08</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card title="Holdings" titleSize="lg" bodyClass="tight" actions={
          <div className="row row-gap-2">
            <Button variant="ghost" size="xs">Sort: Value ↓</Button>
            <Button variant="ghost" size="xs">+ Add position</Button>
          </div>
        }>
          <StockTable stocks={portfolio} columns={['symbol', 'price', 'shares', 'value', 'pl']}
            onSelect={(sym) => window.AppStore.setStock(sym)} />
        </Card>

        <div className="col gap-4">
          <Card title="Allocation" titleSize="lg">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Donut size={140} thickness={24} segments={portfolio.map((p, i) => ({
                value: p.value,
                color: ['var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)','var(--chart-5)','var(--chart-6)'][i],
              }))} label={
                <>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>{window.FmtUtils.fmtCompact(totalValue)}</div>
                </>
              } />
              <div className="col gap-2" style={{ fontSize: 11.5 }}>
                {portfolio.map((p, i) => (
                  <div key={p.symbol} className="row row-gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: ['var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)','var(--chart-5)','var(--chart-6)'][i] }}></span>
                    <span className="mono" style={{ fontWeight: 600 }}>{p.symbol}</span>
                    <span style={{ color: 'var(--ink-3)' }}>{((p.value / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Risk · Concentration" titleSize="lg">
            <ScoreBar label="Single name" value={68} color="var(--warn)" />
            <ScoreBar label="Sector tilt" value={54} color="var(--brand)" />
            <ScoreBar label="Beta exposure" value={1.42 * 50} color="var(--info)" />
            <ScoreBar label="Drawdown risk" value={42} color="var(--gain)" />
            <div style={{ marginTop: 10, padding: 10, background: 'var(--warn-soft)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--warn)' }}>Heads up.</strong> NVDA is 28% of portfolio.
              Single-name concentration above your 20% policy.
            </div>
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Restructuring recommendations" titleSize="lg" actions={<Badge variant="brand" dot>3 actions</Badge>}>
          <div className="col gap-3">
            {[
              { action: 'TRIM', symbol: 'NVDA', from: '28%', to: '20%', reason: 'Reduce single-name concentration; lock in $26.4K gain.', amount: '-$33,612' },
              { action: 'ADD', symbol: 'XLV', from: '0%', to: '6%', reason: 'Defensive sector under-represented; healthcare hedge.', amount: '+$25,098' },
              { action: 'ROTATE', symbol: 'TSLA → JPM', from: '8%', to: '8%', reason: 'Lower beta into a more stable cash-flow profile.', amount: '$0 net' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 110px 1fr 120px 100px',
                alignItems: 'center', gap: 12, padding: 12,
                border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)',
              }}>
                <Badge variant={r.action === 'ADD' ? 'gain' : r.action === 'TRIM' ? 'loss' : 'info'} dot>{r.action}</Badge>
                <div className="mono" style={{ fontWeight: 600 }}>{r.symbol}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{r.reason}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{r.from} → <span style={{ color: 'var(--ink-1)' }}>{r.to}</span></div>
                <div className="row row-gap-2" style={{ justifyContent: 'flex-end' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{r.amount}</span>
                  <Button variant="primary" size="xs">Stage</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

window.PortfolioPage = PortfolioPage;
