// Stock detail view - tabs: overview, fundamental, technical, sentiment

function StockDetail({ stockId, setView, selectStock, theme, openAi, tab, setTab }) {
  const { byId, buildNews, makeSeries, scoreColor, scoreLabel } = window.FrieNi;
  const s = byId(stockId);
  if (!s) return null;

  const news = React.useMemo(() => buildNews(s), [s.id]);
  const series = React.useMemo(() => makeSeries(s, 90), [s.id]);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="stock-hero">
        <div className="left">
          <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12, color: 'var(--text-3)'}}>
            <button className="btn sm ghost" onClick={() => setView('portfolio')}>
              <Icon name="chevronLeft" size={13} /> Back to portfolio
            </button>
            <span>·</span>
            <span>{s.sector} · {s.sub}</span>
          </div>
          <div className="ticker">
            <span>{s.ticker}</span>
            <span className={'pill ' + scoreColor(s.scores.overall)}>
              {scoreLabel(s.scores.overall)} · {s.scores.overall}/100
            </span>
          </div>
          <div className="name">{s.name}</div>
          <div className="price-row">
            <span className="price">${s.price.toFixed(2)}</span>
            <span className={s.change >= 0 ? 'pos mono' : 'neg mono'} style={{fontSize: 14}}>
              {s.change >= 0 ? '+' : ''}${s.change.toFixed(2)} ({s.change >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%)
            </span>
            <span className="mono" style={{color: 'var(--text-3)', fontSize: 12}}>Today</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 8, alignItems:'flex-end'}}>
          <div style={{display:'flex', gap: 6}}>
            <button className="btn"><Icon name="bell" size={13} /> Alert</button>
            <button className="btn" onClick={() => openAi('stock', s.id)}><Icon name="sparkle" size={13} /> Ask AI</button>
            <button className="btn primary">Trade</button>
          </div>
          <div style={{fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 14}}>
            <span>Qty <span className="mono" style={{color:'var(--text-2)'}}>{s.qty}</span></span>
            <span>Avg <span className="mono" style={{color:'var(--text-2)'}}>${s.avg.toFixed(2)}</span></span>
            <span>MV <span className="mono" style={{color:'var(--text-2)'}}>${s.mv.toLocaleString()}</span></span>
            <span>P/L <span className={'mono ' + (s.pl >=0 ? 'pos' : 'neg')}>{s.pl >= 0 ? '+' : ''}${s.pl.toFixed(0)} ({s.plPct >= 0 ? '+' : ''}{s.plPct.toFixed(1)}%)</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="stock-tabs" data-tut="stock-tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          <Icon name="layers" size={13} /> Overview
        </button>
        <button className={tab === 'fundamental' ? 'active' : ''} onClick={() => setTab('fundamental')}>
          <span className={'rating-dot ' + scoreColor(s.scores.fundamental)} /> Fundamental
        </button>
        <button className={tab === 'technical' ? 'active' : ''} onClick={() => setTab('technical')}>
          <span className={'rating-dot ' + scoreColor(s.scores.technical)} /> Technical
        </button>
        <button className={tab === 'sentiment' ? 'active' : ''} onClick={() => setTab('sentiment')}>
          <span className={'rating-dot ' + scoreColor(s.scores.sentiment)} /> Sentiment
        </button>
      </div>

      <div className="content">
        {tab === 'overview' && <OverviewTab s={s} setTab={setTab} series={series} theme={theme} openAi={openAi} />}
        {tab === 'fundamental' && <FundamentalTab s={s} theme={theme} />}
        {tab === 'technical' && <TechnicalTab s={s} series={series} theme={theme} />}
        {tab === 'sentiment' && <SentimentTab s={s} news={news} theme={theme} />}
      </div>
    </div>
  );
}

function OverviewTab({ s, setTab, series, theme, openAi }) {
  const { scoreColor, scoreLabel, makeSeries } = window.FrieNi;

  const tiles = [
    {
      key: 'fundamental',
      title: 'Fundamental',
      score: s.scores.fundamental,
      desc: s.scores.fundamental >= 70 ? 'Strong balance sheet, expanding margins' :
             s.scores.fundamental >= 50 ? 'Growth slowing, margins under pressure' :
             'Negative cash flow, deteriorating quality',
    },
    {
      key: 'technical',
      title: 'Technical',
      score: s.scores.technical,
      desc: s.scores.technical >= 70 ? `Above 50/200 SMA · RSI ${s.technical.rsi}` :
             s.scores.technical >= 50 ? `Consolidating near support · RSI ${s.technical.rsi}` :
             `Below 50-day SMA · RSI ${s.technical.rsi} (oversold)`,
    },
    {
      key: 'sentiment',
      title: 'Sentiment',
      score: s.scores.sentiment,
      desc: s.scores.sentiment >= 70 ? 'Bullish across news and social' :
             s.scores.sentiment >= 50 ? 'Mixed coverage, retail leaning positive' :
             'Negative news flow, insider selling',
    },
    {
      key: 'overall',
      title: 'Overall',
      score: s.scores.overall,
      desc: 'Weighted by your active strategy',
    },
  ];

  return (
    <div>
      <div className="exec-grid" style={{marginBottom: 16}} data-tut="exec-grid">
        {tiles.map(t => (
          <button
            key={t.key}
            className={'exec-tile ' + scoreColor(t.score)}
            onClick={() => t.key !== 'overall' && setTab(t.key)}
            style={t.key === 'overall' ? { cursor: 'default', background: 'var(--surface-2)' } : {}}
          >
            <div className="et-h">
              <span className={'rating-dot ' + scoreColor(t.score)} />
              <span>{t.title}</span>
              {t.key !== 'overall' && <Icon name="arrowRight" size={12} style={{marginLeft: 'auto', color: 'var(--text-3)'}} />}
            </div>
            <div className="et-score">
              <span className="num">{t.score}</span>
              <span className="max">/100</span>
              <span className={'pill ' + scoreColor(t.score)} style={{marginLeft: 'auto', fontSize: 10.5}}>{scoreLabel(t.score)}</span>
            </div>
            <div className="et-bar">
              <div className="fill" style={{width: t.score + '%', background: `var(--${scoreColor(t.score)})`}} />
            </div>
            <div className="et-foot">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Chart + summary side */}
      <div className="split" style={{marginBottom: 16}}>
        <div className="card">
          <div className="card-h">
            <h3>Price · 90 days</h3>
            <div className="chart-legend" style={{marginLeft: 'auto'}}>
              <span className="lk" style={{'--c': 'var(--accent)'}}>Price</span>
              <span className="lk" style={{'--c': 'var(--ok)'}}>50d SMA</span>
              <span className="lk" style={{'--c': 'var(--accent)'}}>200d SMA</span>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <LineChart data={series} indicators={{sma50: s.technical.sma50, sma200: s.technical.sma200}} theme={theme} />
            </div>
          </div>
        </div>
        <div className="card" style={{background: 'linear-gradient(180deg, var(--accent-soft), var(--surface))'}}>
          <div className="card-h" style={{borderBottom: '1px solid oklch(0.55 0.18 275 / 0.15)'}}>
            <Icon name="sparkle" size={14} style={{color: 'var(--accent)'}} />
            <h3 style={{color: 'var(--accent)'}}>Executive summary</h3>
          </div>
          <div className="card-body" style={{fontSize: 13.5, lineHeight: 1.6}}>
            {s.scores.overall >= 70 ? (
              <p style={{margin: '0 0 10px 0'}}>
                <strong>{s.ticker}</strong> is firing on most cylinders. {s.metrics.revGrowth > 20 
                  ? `Revenue is growing ${s.metrics.revGrowth}% YoY, ` 
                  : `Margins are expanding (${s.metrics.opMargin}% operating), `}
                technicals are constructive (RSI {s.technical.rsi}), and sentiment is broadly positive.
              </p>
            ) : s.scores.overall >= 50 ? (
              <p style={{margin: '0 0 10px 0'}}>
                <strong>{s.ticker}</strong> is at a decision point. Fundamentals are {s.scores.fundamental >= 60 ? 'still solid' : 'softening'}, 
                but technicals show {s.technical.macd === 'bearish' ? 'momentum loss' : 'consolidation'}. 
                Watch the {s.technical.support}–{s.technical.resistance} range.
              </p>
            ) : (
              <p style={{margin: '0 0 10px 0'}}>
                <strong>{s.ticker}</strong> is flagging across multiple dimensions. {s.metrics.fcfMargin < 0 ? 'Free cash flow turned negative this quarter, ' : ''}
                price is below both moving averages, and sentiment has deteriorated. Consider position sizing.
              </p>
            )}
            <div style={{display: 'flex', gap: 14, padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: 8}}>
              <div>
                <div style={{fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5}}>Recommendation</div>
                <div style={{fontWeight: 600, fontSize: 15, textTransform: 'capitalize', marginTop: 2}}>{s.recommendation}</div>
              </div>
              <div>
                <div style={{fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5}}>Risk</div>
                <div style={{fontWeight: 600, fontSize: 15, textTransform: 'capitalize', marginTop: 2}}>{s.risk.replace('-', ' ')}</div>
              </div>
              <div>
                <div style={{fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5}}>Strategy fit</div>
                <div style={{fontWeight: 600, fontSize: 15, marginTop: 2}}>{s.scores.overall >= 65 ? 'In range' : 'Out of range'}</div>
              </div>
            </div>
            <div style={{display: 'flex', gap: 6, marginTop: 12}}>
              <button className="btn sm" onClick={() => openAi('stock', s.id)}><Icon name="sparkle" size={12} /> Explain this rating</button>
              <button className="btn sm ghost">Compare peers</button>
            </div>
          </div>
        </div>
      </div>

      <div className="split-3">
        <div className="card">
          <div className="card-h"><h3>Key metrics</h3></div>
          <div className="card-body">
            <MetricRow label="Market cap" val={`$${(s.price * s.qty * 8000 / 1e9).toFixed(1)}B`} />
            <MetricRow label="P/E (TTM)" val={s.metrics.pe ? s.metrics.pe.toFixed(1) : '—'} />
            <MetricRow label="Revenue growth" val={`${s.metrics.revGrowth >= 0 ? '+' : ''}${s.metrics.revGrowth}%`} good={s.metrics.revGrowth > 15} bad={s.metrics.revGrowth < 0} />
            <MetricRow label="Operating margin" val={`${s.metrics.opMargin}%`} good={s.metrics.opMargin > 20} bad={s.metrics.opMargin < 0} />
            <MetricRow label="ROIC" val={`${s.metrics.roic}%`} good={s.metrics.roic > 15} bad={s.metrics.roic < 5} />
            <MetricRow label="Beta" val={s.metrics.beta.toFixed(2)} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Recent catalysts</h3></div>
          <div className="card-body" style={{display:'flex', flexDirection:'column', gap: 10, fontSize: 13}}>
            <CatalystItem date="Apr 28" type="Earnings" tone={s.scores.fundamental >= 65 ? 'good' : 'bad'}
              text={s.scores.fundamental >= 65 ? 'Beat on revenue and EPS, raised guidance' : 'Missed EPS, lowered FY guide'} />
            <CatalystItem date="Apr 14" type="Analyst" tone={s.scores.sentiment >= 65 ? 'good' : 'neutral'}
              text={s.scores.sentiment >= 65 ? `Upgraded to Buy by 2 firms (PT $${(s.price * 1.18).toFixed(0)})` : `Maintained Hold rating across 4 firms`} />
            <CatalystItem date="Mar 22" type="Insider" tone={s.scores.sentiment >= 60 ? 'good' : 'bad'}
              text={s.scores.sentiment >= 60 ? 'CEO purchased 50k shares at market' : 'CFO filed Form 4: sold 28k shares'} />
            <CatalystItem date="Mar 08" type="Product" tone="good"
              text={`Announced new ${s.sector === 'AI' ? 'inference platform' : s.sector === 'Energy' ? 'capacity expansion' : 'enterprise tier'}`} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Peer ranking</h3></div>
          <div className="card-body flush">
            {window.FrieNi.STOCKS.filter(p => p.sector === s.sector && p.id !== s.id).slice(0, 4).map(p => (
              <div key={p.id} className="list-row" style={{padding: '10px 14px'}}>
                <div className="l" style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                  <span className="ticker mono" style={{fontWeight: 600, fontSize: 12}}>{p.ticker}</span>
                  <Sparkline data={makeSeries(p, 30)} w={48} h={16} />
                </div>
                <div style={{display:'flex', gap: 8, alignItems: 'center'}}>
                  <span className={'rating-dot ' + scoreColor(p.scores.overall)} />
                  <span className="mono" style={{fontSize: 12.5}}>{p.scores.overall}</span>
                  <button className="btn sm ghost" onClick={() => selectStockGlobal(p.id)}><Icon name="arrowRight" size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// helper for peer ranking jump
function selectStockGlobal(id) {
  if (window.__selectStock) window.__selectStock(id);
}

function MetricRow({ label, val, good, bad }) {
  const cls = good ? 'good' : bad ? 'bad' : '';
  return (
    <div className="metric-row">
      <span className="label">{label}</span>
      <span className="val">
        {val} {cls && <span className={'rating-dot ' + cls} style={{marginLeft: 4}} />}
      </span>
      <span></span>
    </div>
  );
}

function CatalystItem({ date, type, tone, text }) {
  return (
    <div style={{display:'grid', gridTemplateColumns: '52px 1fr', gap: 10}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <div className="mono" style={{fontSize: 11, color: 'var(--text-3)'}}>{date}</div>
        <span className="tag" style={{
          background: tone === 'good' ? 'var(--good-soft)' : tone === 'bad' ? 'var(--bad-soft)' : 'var(--surface-3)',
          color: tone === 'good' ? 'var(--good)' : tone === 'bad' ? 'var(--bad)' : 'var(--text-2)',
        }}>{type}</span>
      </div>
      <div style={{fontSize: 13, lineHeight: 1.45, color: 'var(--text-2)'}}>{text}</div>
    </div>
  );
}

window.StockDetail = StockDetail;
window.OverviewTab = OverviewTab;
window.MetricRow = MetricRow;
