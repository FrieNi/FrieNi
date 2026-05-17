// Portfolio holy-grail view
// Header KPIs + sector chart + positions table + alerts/news side

function PortfolioView({ portfolios, selectedPortfolio, setSelectedPortfolio, selectStock, theme, openAi }) {
  const { STOCKS, makeSeries, scoreColor } = window.FrieNi;

  // resolve which stocks belong to the active scope
  const activePortfolios = React.useMemo(() => {
    if (selectedPortfolio === 'all') {
      return portfolios.filter(p => !p.excluded);
    }
    return portfolios.filter(p => p.id === selectedPortfolio);
  }, [selectedPortfolio, portfolios]);

  const positions = React.useMemo(() => {
    const ids = new Set();
    activePortfolios.forEach(p => p.holdings.forEach(h => ids.add(h)));
    return STOCKS.filter(s => ids.has(s.id));
  }, [activePortfolios]);

  const totals = React.useMemo(() => {
    const mv = positions.reduce((a, b) => a + b.mv, 0);
    const cost = positions.reduce((a, b) => a + (b.avg * b.qty), 0);
    const pl = mv - cost;
    const plPct = (pl / cost) * 100;
    const dayChange = positions.reduce((a, b) => a + (b.change * b.qty), 0);
    const dayChangePct = (dayChange / (mv - dayChange)) * 100;
    return { mv, cost, pl, plPct, dayChange, dayChangePct, count: positions.length };
  }, [positions]);

  // sector weights
  const sectors = React.useMemo(() => {
    const m = {};
    positions.forEach(s => {
      m[s.sector] = (m[s.sector] || 0) + s.mv;
    });
    return Object.entries(m).map(([k, v]) => ({
      sector: k,
      value: v,
      pct: (v / totals.mv) * 100,
      color: window.FrieNi.ICONS[k],
    })).sort((a, b) => b.value - a.value);
  }, [positions, totals]);

  // synthetic portfolio chart - sum of stock series
  const portfolioSeries = React.useMemo(() => {
    if (!positions.length) return [];
    const len = 90;
    const out = new Array(len).fill(0);
    positions.forEach(s => {
      const ser = makeSeries(s, len);
      ser.forEach((v, i) => out[i] += v * s.qty);
    });
    return out;
  }, [positions]);

  const overallScore = React.useMemo(() => {
    if (!positions.length) return 0;
    return Math.round(positions.reduce((a, b) => a + b.scores.overall * b.mv, 0) / totals.mv);
  }, [positions, totals]);

  const ratingsAvg = React.useMemo(() => {
    if (!positions.length) return { fundamental: 0, technical: 0, sentiment: 0 };
    return {
      fundamental: Math.round(positions.reduce((a, b) => a + b.scores.fundamental * b.mv, 0) / totals.mv),
      technical: Math.round(positions.reduce((a, b) => a + b.scores.technical * b.mv, 0) / totals.mv),
      sentiment: Math.round(positions.reduce((a, b) => a + b.scores.sentiment * b.mv, 0) / totals.mv),
    };
  }, [positions, totals]);

  const portfolioName = selectedPortfolio === 'all'
    ? 'All portfolios'
    : portfolios.find(p => p.id === selectedPortfolio)?.name || '';

  const portfolioDesc = selectedPortfolio === 'all'
    ? `Aggregated across ${activePortfolios.length} portfolios · YOLO excluded`
    : portfolios.find(p => p.id === selectedPortfolio)?.desc;

  return (
    <div className="content fade-in">
      {/* page header */}
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18}}>
        <div>
          <div className="page-h">
            <h1>{portfolioName}</h1>
            <span className="sub">{portfolioDesc}</span>
          </div>
          <div style={{display:'flex', gap:6, marginTop: 10}}>
            <span className="tag">{positions.length} positions</span>
            <span className="tag">USD</span>
            {selectedPortfolio !== 'all' && portfolios.find(p => p.id === selectedPortfolio)?.aggressive && (
              <span className="tag" style={{background:'var(--bad-soft)', color:'var(--bad)'}}>Aggressive</span>
            )}
          </div>
        </div>
        <div style={{display:'flex', gap: 8, alignItems:'center'}} data-tut="portfolio-actions">
          <div className="agg-tabs">
            <button className={'agg-tab' + (selectedPortfolio === 'all' ? ' active' : '')} onClick={() => setSelectedPortfolio('all')}>All</button>
            {portfolios.map(p => (
              <button key={p.id} className={'agg-tab' + (selectedPortfolio === p.id ? ' active' : '')} onClick={() => setSelectedPortfolio(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => openAi('portfolio')}>
            <Icon name="sparkle" size={13} /> Ask AI
          </button>
          <button className="btn primary">
            <Icon name="refresh" size={13} /> Re-run analysis
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row" style={{marginBottom: 16}} data-tut="kpi-row">
        <div className="kpi">
          <div className="label">Market value</div>
          <div className="value mono">${totals.mv.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          <div className="meta">
            <span className={totals.dayChange >= 0 ? 'pos' : 'neg'}>
              {totals.dayChange >= 0 ? '+' : ''}${totals.dayChange.toFixed(0)} today
            </span>
            <span>· {totals.dayChangePct >= 0 ? '+' : ''}{totals.dayChangePct.toFixed(2)}%</span>
          </div>
        </div>
        <div className="kpi">
          <div className="label">Total P/L</div>
          <div className={'value mono ' + (totals.pl >= 0 ? 'pos' : 'neg')}>
            {totals.pl >= 0 ? '+' : ''}${totals.pl.toLocaleString(undefined, {maximumFractionDigits: 0})}
          </div>
          <div className="meta">
            <span className={totals.plPct >= 0 ? 'pos' : 'neg'}>{totals.plPct >= 0 ? '+' : ''}{totals.plPct.toFixed(2)}%</span>
            <span>· cost ${totals.cost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="label">Overall rating</div>
          <div className="value mono" style={{display:'flex', alignItems:'baseline', gap: 8}}>
            <span>{overallScore}</span>
            <span style={{fontSize: 14, color: 'var(--text-3)'}}>/100</span>
            <span className={'pill ' + scoreColor(overallScore)} style={{marginLeft: 'auto', fontSize: 11}}>
              {window.FrieNi.scoreLabel(overallScore)}
            </span>
          </div>
          <div className="meta" style={{gap: 12}}>
            <span><span className={'rating-dot ' + scoreColor(ratingsAvg.fundamental)} /> Fund. {ratingsAvg.fundamental}</span>
            <span><span className={'rating-dot ' + scoreColor(ratingsAvg.technical)} /> Tech. {ratingsAvg.technical}</span>
            <span><span className={'rating-dot ' + scoreColor(ratingsAvg.sentiment)} /> Sent. {ratingsAvg.sentiment}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="label">Strategy alignment</div>
          <div className="value mono" style={{display:'flex', alignItems:'baseline', gap: 8}}>
            <span>9</span>
            <span style={{fontSize: 14, color: 'var(--text-3)'}}>of 12 in range</span>
          </div>
          <div className="meta">
            <span>Strategy:</span> <span style={{color:'var(--text-2)', fontWeight: 500}}>Momentum Rider</span>
          </div>
        </div>
      </div>

      {/* Big chart + sidebar of insights */}
      <div className="split" style={{marginBottom: 16}}>
        <div className="card">
          <div className="card-h">
            <h3>Performance · 90 days</h3>
            <div className="chart-legend" style={{marginLeft: 'auto'}}>
              <span className="lk" style={{'--c': 'var(--accent)'}}>Portfolio</span>
            </div>
            <div className="agg-tabs" style={{marginLeft: 12}}>
              <button className="agg-tab">1D</button>
              <button className="agg-tab">1W</button>
              <button className="agg-tab active">3M</button>
              <button className="agg-tab">1Y</button>
              <button className="agg-tab">All</button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              {portfolioSeries.length > 0 && <LineChart data={portfolioSeries} theme={theme} />}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>What's moving the needle</h3></div>
          <div className="card-body flush">
            {[...positions].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5).map(s => (
              <button
                key={s.id}
                className="list-row"
                style={{width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none'}}
                onClick={() => selectStock(s.id)}
              >
                <div className="l">
                  <strong>{s.ticker}</strong>
                  <small>{s.name} · {s.sector}</small>
                </div>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <Sparkline data={makeSeries(s, 30)} w={64} h={20} />
                  <span className={s.changePct >= 0 ? 'pos mono' : 'neg mono'} style={{fontSize: 12.5, fontWeight: 500, minWidth: 60, textAlign: 'right'}}>
                    {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sector + Risk + AI insight cards */}
      <div className="split-3" style={{marginBottom: 16}}>
        <div className="card">
          <div className="card-h"><h3>Sector exposure</h3></div>
          <div className="card-body">
            <div className="sector-bar" style={{marginBottom: 14}}>
              {sectors.map(s => (
                <div key={s.sector} style={{flex: s.pct, background: s.color}} />
              ))}
            </div>
            {sectors.map(s => (
              <div key={s.sector} style={{display:'flex', alignItems:'center', gap: 10, padding: '6px 0', fontSize: 13}}>
                <span style={{width: 8, height: 8, borderRadius: 2, background: s.color}} />
                <span style={{flex: 1}}>{s.sector}</span>
                <span className="mono" style={{color: 'var(--text-3)'}}>${(s.value/1000).toFixed(1)}k</span>
                <span className="mono" style={{minWidth: 48, textAlign: 'right'}}>{s.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Risk concentration</h3>
            <span className="pill ok" style={{marginLeft: 'auto'}}>Yellow</span>
          </div>
          <div className="card-body" style={{display:'flex', flexDirection:'column', gap: 12}}>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 4}}>
                <span style={{color:'var(--text-2)'}}>Top 3 concentration</span>
                <span className="mono">{(positions.slice(0,3).reduce((a,b)=>a+b.mv,0) / totals.mv * 100).toFixed(0)}%</span>
              </div>
              <div className="bar" style={{height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${(positions.slice(0,3).reduce((a,b)=>a+b.mv,0) / totals.mv * 100).toFixed(0)}%`, background: 'var(--ok)'}} />
              </div>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 4}}>
                <span style={{color:'var(--text-2)'}}>Sector tilt (AI)</span>
                <span className="mono">{((sectors.find(s => s.sector === 'AI')?.pct) || 0).toFixed(0)}%</span>
              </div>
              <div className="bar" style={{height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${(sectors.find(s => s.sector === 'AI')?.pct) || 0}%`, background: 'var(--ok)'}} />
              </div>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 4}}>
                <span style={{color:'var(--text-2)'}}>Portfolio beta</span>
                <span className="mono">1.34</span>
              </div>
              <div className="bar" style={{height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden'}}>
                <div style={{height: '100%', width: '67%', background: 'var(--ok)'}} />
              </div>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 4}}>
                <span style={{color:'var(--text-2)'}}>Drawdown risk (90d)</span>
                <span className="mono">-14.2%</span>
              </div>
              <div className="bar" style={{height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden'}}>
                <div style={{height: '100%', width: '38%', background: 'var(--good)'}} />
              </div>
            </div>
          </div>
        </div>
        <div className="card" data-tut="ai-insight" style={{background: 'linear-gradient(180deg, var(--accent-soft), var(--surface))'}}>
          <div className="card-h" style={{borderBottom: '1px solid oklch(0.55 0.18 275 / 0.15)'}}>
            <Icon name="sparkle" size={14} style={{color: 'var(--accent)'}} />
            <h3 style={{color: 'var(--accent)'}}>FrieNi Insight</h3>
            <button className="btn sm ghost" style={{marginLeft: 'auto'}} onClick={() => openAi('portfolio')}>Open</button>
          </div>
          <div className="card-body" style={{fontSize: 13, lineHeight: 1.55}}>
            <p style={{margin: '0 0 10px 0'}}>
              Your AI exposure is doing the heavy lifting (<strong>+38% YTD</strong>), but <strong>HVNK</strong> has 
              degraded across all three pillars — fundamentals turned negative this quarter and sentiment is 
              following.
            </p>
            <p style={{margin: 0, color: 'var(--text-2)'}}>
              Consider trimming HVNK and rotating into <strong>VLTC</strong>, which scores 74/100 
              and is under-represented vs your strategy target.
            </p>
            <div style={{display:'flex', gap: 6, marginTop: 12}}>
              <button className="btn sm" onClick={() => selectStock('hvnk')}>Review HVNK</button>
              <button className="btn sm ghost">Dismiss</button>
            </div>
          </div>
        </div>
      </div>

      {/* Positions table */}
      <div className="card" data-tut="positions">
        <div className="card-h">
          <h3>Positions</h3>
          <span className="right">Sort by: Market value</span>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Sector</th>
                <th className="num">Price</th>
                <th className="num">Day</th>
                <th className="num">Qty</th>
                <th className="num">Market value</th>
                <th className="num">P/L</th>
                <th>Trend</th>
                <th>Ratings</th>
              </tr>
            </thead>
            <tbody>
              {[...positions].sort((a, b) => b.mv - a.mv).map(s => (
                <tr key={s.id} onClick={() => selectStock(s.id)}>
                  <td>
                    <div className="ticker">{s.ticker}</div>
                    <div className="name">{s.name}</div>
                  </td>
                  <td><span className="sector-tag">{s.sector} · {s.sub}</span></td>
                  <td className="num">${s.price.toFixed(2)}</td>
                  <td className={'num ' + (s.changePct >= 0 ? 'pos' : 'neg')}>
                    {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                  </td>
                  <td className="num">{s.qty}</td>
                  <td className="num">${s.mv.toLocaleString()}</td>
                  <td className={'num ' + (s.pl >= 0 ? 'pos' : 'neg')}>
                    {s.pl >= 0 ? '+' : ''}${s.pl.toFixed(0)}
                    <div style={{fontSize: 11, opacity: 0.7}}>{s.plPct >= 0 ? '+' : ''}{s.plPct.toFixed(1)}%</div>
                  </td>
                  <td>
                    <Sparkline data={makeSeries(s, 30)} w={64} h={20} />
                  </td>
                  <td>
                    <div style={{display:'flex', gap: 4}}>
                      <span className={'rating-dot ' + scoreColor(s.scores.fundamental)} title={`F: ${s.scores.fundamental}`} />
                      <span className={'rating-dot ' + scoreColor(s.scores.technical)} title={`T: ${s.scores.technical}`} />
                      <span className={'rating-dot ' + scoreColor(s.scores.sentiment)} title={`S: ${s.scores.sentiment}`} />
                      <span className="mono" style={{marginLeft: 6, fontSize: 12, color: 'var(--text-2)'}}>{s.scores.overall}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.PortfolioView = PortfolioView;
