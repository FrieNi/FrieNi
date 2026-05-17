// News page — full feed with filters and sentiment summary
const NewsPage = () => {
  const [filter, setFilter] = useState('all');
  const items = filter === 'all' ? window.MarketData.news : window.MarketData.news.filter(n => n.sentiment === filter);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">News & Sentiment</div>
          <div className="page-sub">12 stories in the last 24h tracked across your watchlist · sentiment skewing bullish</div>
        </div>
        <div className="row row-gap-2">
          <Button variant="ghost" size="sm">Sources</Button>
          <Button variant="ghost" size="sm">Saved</Button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi">
          <div className="kpi-label">Stories · 24h</div>
          <div className="kpi-value">142</div>
          <div className="kpi-foot"><Delta value={28} pct={24.5} /><span>vs prior</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sentiment Index</div>
          <div className="kpi-value gain">+0.42</div>
          <div className="kpi-foot"><span>Bullish · climbing since Mon</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Top Mention</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>NVDA</div>
          <div className="kpi-foot"><span>38 stories · 84% positive</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card title="Feed" titleSize="lg" bodyClass="tight" actions={
          <div className="row row-gap-2">
            {['all', 'bullish', 'bearish', 'neutral'].map(f => (
              <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="xs" onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        }>
          <NewsList items={items} />
        </Card>

        <div className="col gap-4">
          <Card title="Sentiment by ticker" titleSize="lg">
            {window.MarketData.stocks.slice(0, 6).map(s => {
              const score = 30 + Math.floor((s.seed * 7) % 60);
              return (
                <ScoreBar key={s.symbol} label={s.symbol} value={score}
                  color={score > 60 ? 'var(--gain)' : score < 40 ? 'var(--loss)' : 'var(--ink-4)'} />
              );
            })}
          </Card>

          <Card title="Themes trending" titleSize="lg">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { t: 'AI capex', count: 38 },
                { t: 'Fed rate path', count: 24 },
                { t: 'EV demand', count: 18 },
                { t: 'Earnings season', count: 41 },
                { t: 'Oil supply', count: 12 },
                { t: 'Commercial real estate', count: 9 },
              ].map(theme => (
                <div key={theme.t} style={{
                  padding: '6px 10px',
                  background: 'var(--bg-inset)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 12,
                  display: 'flex', gap: 6, alignItems: 'center',
                }}>
                  {theme.t}
                  <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{theme.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.NewsPage = NewsPage;
