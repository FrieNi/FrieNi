// Fundamental, Technical, Sentiment tab content

function FundamentalTab({ s, theme }) {
  const { scoreColor, scoreLabel } = window.FrieNi;
  const m = s.metrics;

  const valuationItems = [
    { label: 'P/E (TTM)', val: m.pe || '—', bench: 22, lower: true, fmt: v => typeof v === 'number' ? v.toFixed(1) : v },
    { label: 'P/B', val: m.pb, bench: 4, lower: true, fmt: v => v.toFixed(1) },
    { label: 'P/S', val: m.ps, bench: 6, lower: true, fmt: v => v.toFixed(1) },
    { label: 'PEG', val: m.peg || '—', bench: 1.5, lower: true, fmt: v => typeof v === 'number' ? v.toFixed(1) : v },
    { label: 'EV / EBITDA', val: m.evEbitda || '—', bench: 18, lower: true, fmt: v => typeof v === 'number' ? v.toFixed(1) : v },
  ];

  const growthItems = [
    { label: 'Revenue growth (YoY)', val: m.revGrowth, bench: 15, lower: false, fmt: v => `${v >= 0 ? '+' : ''}${v}%` },
    { label: 'EPS growth (YoY)', val: m.epsGrowth, bench: 18, lower: false, fmt: v => `${v >= 0 ? '+' : ''}${v}%` },
    { label: 'Operating margin', val: m.opMargin, bench: 20, lower: false, fmt: v => `${v}%` },
    { label: 'Net margin', val: m.netMargin, bench: 14, lower: false, fmt: v => `${v}%` },
    { label: 'FCF margin', val: m.fcfMargin, bench: 16, lower: false, fmt: v => `${v}%` },
  ];

  const healthItems = [
    { label: 'ROE', val: m.roe, bench: 15, lower: false, fmt: v => `${v}%` },
    { label: 'ROIC', val: m.roic, bench: 12, lower: false, fmt: v => `${v}%` },
    { label: 'Debt / Equity', val: m.debtEquity, bench: 0.5, lower: true, fmt: v => v.toFixed(2) },
    { label: 'Current ratio', val: m.currentRatio, bench: 1.5, lower: false, fmt: v => v.toFixed(2) },
    { label: 'Beta', val: m.beta, bench: 1.2, lower: true, fmt: v => v.toFixed(2) },
  ];

  return (
    <div className="fade-in">
      <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 18}}>
        <div className="exec-tile" style={{flex: '0 0 280px', cursor: 'default'}}>
          <div className="et-h">
            <span className={'rating-dot ' + scoreColor(s.scores.fundamental)} />
            <span>Fundamental score</span>
          </div>
          <div className="et-score">
            <span className="num">{s.scores.fundamental}</span>
            <span className="max">/100</span>
            <span className={'pill ' + scoreColor(s.scores.fundamental)} style={{marginLeft: 'auto'}}>{scoreLabel(s.scores.fundamental)}</span>
          </div>
          <div className="et-bar">
            <div className="fill" style={{width: s.scores.fundamental + '%', background: `var(--${scoreColor(s.scores.fundamental)})`}} />
          </div>
        </div>
        <div style={{flex: 1, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)'}}>
          {s.scores.fundamental >= 70 ? (
            <p style={{margin: 0}}>
              <strong style={{color:'var(--text)'}}>Quality story.</strong> Revenue growing {m.revGrowth}% YoY 
              with operating margin of {m.opMargin}% and ROIC of {m.roic}%. Balance sheet is clean 
              (Debt/Equity {m.debtEquity}). Valuation is {m.pe > 30 ? 'rich but defensible by growth' : 'reasonable'}.
            </p>
          ) : s.scores.fundamental >= 50 ? (
            <p style={{margin: 0}}>
              <strong style={{color:'var(--text)'}}>Mixed picture.</strong> Growth at {m.revGrowth}% but margins are 
              {m.opMargin > 15 ? ' holding up' : ' compressing'}. The biggest concern is {m.peg > 2 ? 'PEG suggests overvalued for the growth' : 'execution risk going into next quarter'}.
            </p>
          ) : (
            <p style={{margin: 0}}>
              <strong style={{color:'var(--text)'}}>Quality deteriorating.</strong> {m.epsGrowth < 0 ? `EPS down ${Math.abs(m.epsGrowth)}% YoY` : 'Margins compressing'}, 
              {m.fcfMargin < 0 ? ' FCF turned negative,' : ''} and the balance sheet is under stress (D/E {m.debtEquity}). This needs to inflect or the position should be reviewed.
            </p>
          )}
        </div>
      </div>

      <div className="split-3">
        <MetricsCard title="Valuation" items={valuationItems} />
        <MetricsCard title="Growth & Profitability" items={growthItems} />
        <MetricsCard title="Health & Risk" items={healthItems} />
      </div>

      <div className="split" style={{marginTop: 16}}>
        <div className="card">
          <div className="card-h">
            <h3>Revenue & EPS · 8 quarters</h3>
            <div className="chart-legend" style={{marginLeft:'auto'}}>
              <span className="lk" style={{'--c': 'var(--accent)'}}>Revenue</span>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap sm" style={{height: 200}}>
              <BarChart
                data={genQuarterlyRevenue(s)}
                labels={['Q1\'23','Q2','Q3','Q4','Q1\'24','Q2','Q3','Q4']}
                colors={Array(8).fill('oklch(0.55 0.18 275 / 0.85)')}
                theme={theme}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Analyst ratings</h3>
            <span className="right">12 firms covering</span>
          </div>
          <div className="card-body">
            <div style={{display:'flex', gap: 10, marginBottom: 16, alignItems: 'baseline'}}>
              <span style={{fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em'}}>
                {(s.scores.fundamental / 20).toFixed(1)}
              </span>
              <span style={{color: 'var(--text-3)', fontSize: 13}}>/5.0 consensus</span>
              <span className="mono" style={{marginLeft: 'auto', fontSize: 13}}>
                PT ${(s.price * (1 + (s.scores.fundamental - 50) / 200)).toFixed(2)}
              </span>
            </div>
            <AnalystBar label="Strong Buy" count={Math.max(1, Math.round(s.scores.fundamental / 14))} total={12} tone="good" />
            <AnalystBar label="Buy" count={Math.max(1, Math.round(s.scores.fundamental / 22))} total={12} tone="good" />
            <AnalystBar label="Hold" count={Math.max(1, Math.round((100 - s.scores.fundamental) / 22))} total={12} tone="ok" />
            <AnalystBar label="Sell" count={Math.max(0, Math.round((100 - s.scores.fundamental) / 40))} total={12} tone="bad" />
            <AnalystBar label="Strong Sell" count={s.scores.fundamental < 50 ? 1 : 0} total={12} tone="bad" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalystBar({ label, count, total, tone }) {
  return (
    <div style={{display:'grid', gridTemplateColumns: '90px 1fr 24px', gap: 10, alignItems: 'center', padding: '4px 0', fontSize: 12.5}}>
      <span style={{color: 'var(--text-2)'}}>{label}</span>
      <div style={{height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${(count/total)*100}%`, background: `var(--${tone})`}} />
      </div>
      <span className="mono" style={{textAlign: 'right', color: 'var(--text-2)'}}>{count}</span>
    </div>
  );
}

function genQuarterlyRevenue(s) {
  // synthesize 8 quarters that roughly trend with the stock's growth
  const base = 100;
  const g = (s.metrics.revGrowth || 5) / 100;
  const out = [];
  let cur = base;
  for (let i = 0; i < 8; i++) {
    out.push(cur);
    cur *= 1 + g / 4;
  }
  // last quarter dip if score is bad
  if (s.scores.fundamental < 50) out[7] = out[7] * 0.88;
  return out;
}

function MetricsCard({ title, items }) {
  return (
    <div className="card">
      <div className="card-h"><h3>{title}</h3></div>
      <div className="card-body">
        {items.map(it => {
          const val = typeof it.val === 'number' ? it.val : 0;
          const ratio = it.lower
            ? Math.max(0.05, Math.min(1.5, it.bench / Math.max(0.01, Math.abs(val))))
            : Math.max(0.05, Math.min(1.5, val / it.bench));
          const isGood = ratio >= 1;
          const cls = isGood ? 'good' : ratio >= 0.6 ? 'ok' : 'bad';
          return (
            <div key={it.label} className="metric-row">
              <span className="label">{it.label}</span>
              <span className="val">{it.fmt(it.val)}</span>
              <div className="bar">
                <div className="fill" style={{
                  width: `${Math.min(100, ratio * 66)}%`,
                  background: `var(--${cls})`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
function TechnicalTab({ s, series, theme }) {
  const { scoreColor, scoreLabel } = window.FrieNi;
  const t = s.technical;

  // RSI history synthetic
  const rsiSeries = React.useMemo(() => {
    const out = [];
    let cur = 50;
    let seed = s.ticker.charCodeAt(0);
    for (let i = 0; i < 90; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const noise = (seed / 233280 - 0.5) * 12;
      cur = Math.max(15, Math.min(85, cur + noise));
      out.push(cur);
    }
    out[out.length - 1] = t.rsi;
    return out;
  }, [s.ticker, t.rsi]);

  return (
    <div className="fade-in">
      <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 18}}>
        <div className="exec-tile" style={{flex: '0 0 280px', cursor: 'default'}}>
          <div className="et-h">
            <span className={'rating-dot ' + scoreColor(s.scores.technical)} />
            <span>Technical score</span>
          </div>
          <div className="et-score">
            <span className="num">{s.scores.technical}</span>
            <span className="max">/100</span>
            <span className={'pill ' + scoreColor(s.scores.technical)} style={{marginLeft: 'auto'}}>{scoreLabel(s.scores.technical)}</span>
          </div>
          <div className="et-bar">
            <div className="fill" style={{width: s.scores.technical + '%', background: `var(--${scoreColor(s.scores.technical)})`}} />
          </div>
        </div>
        <div style={{flex: 1, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)'}}>
          <p style={{margin: 0}}>
            <strong style={{color:'var(--text)'}}>{t.macd === 'bullish' ? 'Bullish setup.' : t.macd === 'bearish' ? 'Bearish setup.' : 'Range-bound.'}</strong>{' '}
            Price is {s.price > t.sma50 ? 'above' : 'below'} the 50-day SMA (${t.sma50.toFixed(2)}) and {s.price > t.sma200 ? 'above' : 'below'} the 200-day (${t.sma200.toFixed(2)}). 
            RSI at {t.rsi} {t.rsi > 70 ? '(overbought)' : t.rsi < 30 ? '(oversold)' : '(neutral)'}. 
            Key levels: support ${t.support}, resistance ${t.resistance}.
          </p>
        </div>
      </div>

      <div className="card" style={{marginBottom: 16}}>
        <div className="card-h">
          <h3>Price action · 90 days</h3>
          <div className="chart-legend" style={{marginLeft: 'auto'}}>
            <span className="lk" style={{'--c': 'var(--accent)'}}>Price</span>
            <span className="lk" style={{'--c': 'var(--ok)'}}>50d SMA</span>
            <span className="lk" style={{'--c': 'var(--accent)'}}>200d SMA</span>
            <span className="lk" style={{'--c': 'var(--good)'}}>Support</span>
            <span className="lk" style={{'--c': 'var(--bad)'}}>Resistance</span>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-wrap tall">
            <LineChart data={series} indicators={{sma50: t.sma50, sma200: t.sma200, support: t.support, resistance: t.resistance}} theme={theme} />
          </div>
        </div>
      </div>

      <div className="split-3">
        <div className="card">
          <div className="card-h">
            <h3>RSI (14-period)</h3>
            <span className="mono" style={{marginLeft: 'auto', fontSize: 13, color: t.rsi > 70 ? 'var(--bad)' : t.rsi < 30 ? 'var(--bad)' : 'var(--text)'}}>
              {t.rsi}
            </span>
          </div>
          <div className="card-body">
            <div style={{height: 80, position: 'relative', marginBottom: 8}}>
              <Sparkline data={rsiSeries} w={280} h={80} positive={t.rsi > 50} />
              <div style={{position: 'absolute', top: 18, left: 0, right: 0, borderTop: '1px dashed var(--bad)'}}></div>
              <div style={{position: 'absolute', bottom: 18, left: 0, right: 0, borderTop: '1px dashed var(--good)'}}></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)'}}>
              <span>30 oversold</span>
              <span>50</span>
              <span>70 overbought</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Signals</h3></div>
          <div className="card-body">
            <SignalRow label="MACD" tone={t.macd === 'bullish' ? 'good' : t.macd === 'bearish' ? 'bad' : 'ok'}
              val={t.macd === 'bullish' ? 'Bullish crossover' : t.macd === 'bearish' ? 'Bearish crossover' : 'Neutral'} />
            <SignalRow label="Trend (50/200)" tone={t.sma50 > t.sma200 ? 'good' : 'bad'}
              val={t.sma50 > t.sma200 ? 'Golden cross' : 'Death cross zone'} />
            <SignalRow label="Volume profile" tone={s.scores.technical > 60 ? 'good' : 'ok'}
              val={s.scores.technical > 60 ? 'Above avg, bullish' : 'Below avg'} />
            <SignalRow label="Volatility (20d)" tone={s.metrics.beta > 1.5 ? 'bad' : 'ok'}
              val={`${(s.metrics.beta * 18).toFixed(0)}% annualized`} />
            <SignalRow label="Bollinger position" tone={t.rsi > 70 ? 'bad' : t.rsi < 30 ? 'good' : 'ok'}
              val={t.rsi > 70 ? 'Upper band' : t.rsi < 30 ? 'Lower band' : 'Mid band'} />
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Key levels</h3></div>
          <div className="card-body" style={{display:'flex', flexDirection:'column', gap: 10}}>
            <LevelBar label="Resistance" price={t.resistance} cur={s.price} tone="bad" />
            <LevelBar label="200d SMA" price={t.sma200} cur={s.price} tone="ok" />
            <LevelBar label="Current price" price={s.price} cur={s.price} tone="accent" isCur />
            <LevelBar label="50d SMA" price={t.sma50} cur={s.price} tone="ok" />
            <LevelBar label="Support" price={t.support} cur={s.price} tone="good" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalRow({ label, val, tone }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border)', fontSize: 13}}>
      <span style={{color:'var(--text-2)'}}>{label}</span>
      <span className={'pill ' + tone}>{val}</span>
    </div>
  );
}

function LevelBar({ label, price, cur, tone, isCur }) {
  const pct = ((price / cur) * 100 - 100);
  return (
    <div style={{display:'grid', gridTemplateColumns: '90px 1fr 50px', alignItems:'center', gap: 10, fontSize: 12.5}}>
      <span style={{color: isCur ? 'var(--text)' : 'var(--text-2)', fontWeight: isCur ? 600 : 400}}>{label}</span>
      <span className="mono" style={{textAlign: 'left'}}>${price.toFixed(2)}</span>
      <span className={'mono ' + (isCur ? '' : pct >= 0 ? 'pos' : 'neg')} style={{textAlign:'right', fontSize: 11.5}}>
        {isCur ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
      </span>
    </div>
  );
}

// =====================================================================
function SentimentTab({ s, news, theme }) {
  const { scoreColor, scoreLabel } = window.FrieNi;

  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? news : news.filter(n => n.platform === filter);

  const platformCounts = news.reduce((acc, n) => {
    acc[n.platform] = (acc[n.platform] || 0) + 1;
    return acc;
  }, {});

  // sentiment over time synthetic
  const sentSeries = React.useMemo(() => {
    const out = [];
    let cur = 50;
    let seed = s.ticker.charCodeAt(1) || 42;
    const target = s.scores.sentiment;
    for (let i = 0; i < 30; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const drift = (target - cur) / 18;
      const noise = (seed / 233280 - 0.5) * 10;
      cur = Math.max(0, Math.min(100, cur + drift + noise));
      out.push(cur);
    }
    out[out.length - 1] = target;
    return out;
  }, [s.ticker]);

  return (
    <div className="fade-in">
      <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 18}}>
        <div className="exec-tile" style={{flex: '0 0 280px', cursor: 'default'}}>
          <div className="et-h">
            <span className={'rating-dot ' + scoreColor(s.scores.sentiment)} />
            <span>Sentiment score</span>
          </div>
          <div className="et-score">
            <span className="num">{s.scores.sentiment}</span>
            <span className="max">/100</span>
            <span className={'pill ' + scoreColor(s.scores.sentiment)} style={{marginLeft: 'auto'}}>{scoreLabel(s.scores.sentiment)}</span>
          </div>
          <div className="et-bar">
            <div className="fill" style={{width: s.scores.sentiment + '%', background: `var(--${scoreColor(s.scores.sentiment)})`}} />
          </div>
        </div>
        <div style={{flex: 1, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)'}}>
          <p style={{margin: 0}}>
            <strong style={{color:'var(--text)'}}>
              {s.scores.sentiment >= 80 ? 'Strongly bullish chatter.' :
               s.scores.sentiment >= 60 ? 'Constructive narrative.' :
               s.scores.sentiment >= 40 ? 'Mixed coverage.' : 'Bearish narrative.'}
            </strong>{' '}
            We tracked {news.length} mentions across news, social, Reddit, and YouTube in the last 7 days. 
            Tone trended {s.scores.sentiment > 60 ? 'positive' : 'negative'} after the most recent earnings event.
          </p>
        </div>
      </div>

      <div className="split" style={{marginBottom: 16}}>
        <div className="card">
          <div className="card-h">
            <h3>Sentiment trend · 30 days</h3>
            <span className="right">{s.scores.sentiment > 55 ? '↗ improving' : s.scores.sentiment < 45 ? '↘ deteriorating' : '→ flat'}</span>
          </div>
          <div className="card-body">
            <div className="chart-wrap" style={{height: 220}}>
              <LineChart data={sentSeries} theme={theme} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Coverage by platform</h3></div>
          <div className="card-body">
            <PlatformRow icon="newspaper" label="News" count={platformCounts.news || 0} tone={s.scores.sentiment > 60 ? 'good' : 'ok'} />
            <PlatformRow icon="message" label="Social (X)" count={platformCounts.social || 0} tone={s.scores.sentiment > 65 ? 'good' : s.scores.sentiment > 45 ? 'ok' : 'bad'} />
            <PlatformRow icon="globe" label="Reddit" count={platformCounts.reddit || 0} tone={s.scores.sentiment > 55 ? 'good' : 'bad'} />
            <PlatformRow icon="film" label="YouTube" count={platformCounts.youtube || 0} tone={s.scores.sentiment > 60 ? 'good' : 'ok'} />
            <div className="hr" />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: 12.5, marginTop: 6}}>
              <span style={{color:'var(--text-2)'}}>Insider activity (90d)</span>
              <span className={'pill ' + (s.scores.sentiment > 60 ? 'good' : 'bad')}>
                {s.scores.sentiment > 60 ? 'Net buying' : 'Net selling'}
              </span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: 12.5, marginTop: 8}}>
              <span style={{color:'var(--text-2)'}}>Short interest</span>
              <span className="mono">{s.scores.sentiment > 60 ? '2.4%' : '14.8%'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Feed</h3>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 6}}>
            {['all', 'news', 'social', 'reddit', 'youtube'].map(f => (
              <button key={f} className={'btn sm ' + (filter === f ? 'primary' : 'ghost')} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body flush">
          {filtered.length === 0 ? (
            <div className="empty">No items in this filter</div>
          ) : filtered.map((n, i) => (
            <div key={i} className="news-item">
              <div>
                <div className="src">
                  <span className="platform-dot" style={{background: platformColor(n.platform)}} />
                  {platformLabel(n.platform)} · {n.src}
                </div>
                <h4>{n.title}</h4>
                {n.body && <p>{n.body}</p>}
                <div className="meta">
                  <span>{n.meta}</span>
                  <span className={'pill ' + (n.tone === 'good' ? 'good' : n.tone === 'bad' ? 'bad' : '')}>
                    {n.tone === 'good' ? 'Positive' : n.tone === 'bad' ? 'Negative' : 'Neutral'}
                  </span>
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 6}}>
                <button className="icon-btn" style={{width: 26, height: 26}}><Icon name="thumbsUp" size={13} /></button>
                <button className="icon-btn" style={{width: 26, height: 26}}><Icon name="thumbsDown" size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformRow({ icon, label, count, tone }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, padding: '7px 0', borderBottom: '1px dashed var(--border)'}}>
      <Icon name={icon} size={14} style={{color: 'var(--text-3)'}} />
      <span style={{flex: 1, fontSize: 13, color: 'var(--text-2)'}}>{label}</span>
      <span className="mono" style={{fontSize: 13}}>{count}</span>
      <span className={'rating-dot ' + tone} />
    </div>
  );
}

function platformColor(p) {
  return {
    news: 'oklch(0.55 0.18 275)',
    social: 'oklch(0.55 0.16 220)',
    reddit: 'oklch(0.65 0.18 30)',
    youtube: 'oklch(0.6 0.2 25)',
  }[p] || 'var(--text-3)';
}
function platformLabel(p) {
  return { news: 'NEWS', social: 'X', reddit: 'REDDIT', youtube: 'YOUTUBE' }[p] || p?.toUpperCase();
}

window.FundamentalTab = FundamentalTab;
window.TechnicalTab = TechnicalTab;
window.SentimentTab = SentimentTab;
