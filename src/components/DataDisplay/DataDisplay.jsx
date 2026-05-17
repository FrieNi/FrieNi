// StockTable, NewsList, AssistantChat, ModeSelector

const StockTable = ({ stocks, onSelect, columns = ['symbol', 'price', 'change', 'spark', 'mcap'] }) => {
  return (
    <table className="tbl">
      <thead>
        <tr>
          {columns.includes('symbol') && <th>Symbol</th>}
          {columns.includes('price') && <th style={{ textAlign: 'right' }}>Last</th>}
          {columns.includes('change') && <th style={{ textAlign: 'right' }}>Chg</th>}
          {columns.includes('spark') && <th style={{ width: 100 }}>Trend</th>}
          {columns.includes('mcap') && <th style={{ textAlign: 'right' }}>Mkt Cap</th>}
          {columns.includes('vol') && <th style={{ textAlign: 'right' }}>Vol</th>}
          {columns.includes('shares') && <th style={{ textAlign: 'right' }}>Shares</th>}
          {columns.includes('value') && <th style={{ textAlign: 'right' }}>Value</th>}
          {columns.includes('pl') && <th style={{ textAlign: 'right' }}>P&L</th>}
        </tr>
      </thead>
      <tbody>
        {stocks.map(s => {
          const series = window.MarketData.getSeries(s.seed || 1, 30, s.price * 0.95, 0.025, 0);
          return (
            <tr key={s.symbol} onClick={() => onSelect && onSelect(s.symbol)}>
              {columns.includes('symbol') && (
                <td>
                  <div className="tbl-sym">{s.symbol}</div>
                  <div className="tbl-name">{s.name}</div>
                </td>
              )}
              {columns.includes('price') && <td className="tbl-num">{window.FmtUtils.fmtPrice(s.price)}</td>}
              {columns.includes('change') && (
                <td className="tbl-num"><Delta value={s.change} pct={s.pct} /></td>
              )}
              {columns.includes('spark') && (
                <td><Sparkline data={series} width={90} height={28} /></td>
              )}
              {columns.includes('mcap') && (
                <td className="tbl-num" style={{ color: 'var(--ink-2)' }}>{window.FmtUtils.fmtCompact(s.mcap)}</td>
              )}
              {columns.includes('vol') && (
                <td className="tbl-num" style={{ color: 'var(--ink-2)' }}>{window.FmtUtils.fmtCompact(s.vol || 1.2e7)}</td>
              )}
              {columns.includes('shares') && <td className="tbl-num">{s.shares}</td>}
              {columns.includes('value') && <td className="tbl-num">${window.FmtUtils.fmtPrice(s.value)}</td>}
              {columns.includes('pl') && (
                <td className="tbl-num">
                  <Delta value={s.plPct} pct={s.plPct} />
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>${window.FmtUtils.fmtPrice(s.pl)}</div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Coverage summary helpers — operate on item.coverage = [{lean,tier,fact,frames,count}, ...]
// lean range: -2..+2; we collapse into 3 buckets (left / center / right) for the bar.
const summarizeCoverage = (coverage = []) => {
  let left = 0, center = 0, right = 0, total = 0, factSum = 0, primary = 0;
  coverage.forEach(c => {
    const n = c.count || 0;
    total += n;
    factSum += c.fact * n;
    if (c.tier === 1) primary += n;
    if (c.lean <= -1) left += n;
    else if (c.lean >= 1) right += n;
    else center += n;
  });
  return {
    total,
    left, center, right,
    leftPct: total ? Math.round((left / total) * 100) : 0,
    centerPct: total ? Math.round((center / total) * 100) : 0,
    rightPct: total ? Math.round((right / total) * 100) : 0,
    fact: total ? Math.round(factSum / total) : 0,
    primary,
  };
};

const LEAN_LABEL = { '-2': 'Left', '-1': 'Lean L', '0': 'Center', '1': 'Lean R', '2': 'Right' };
const TIER_LABEL = { 1: 'Newswire', 2: 'Major', 3: 'Trade' };

const BiasBar = ({ summary, height = 6 }) => (
  <div className="bias-bar" style={{ height }}>
    {summary.leftPct > 0 && <div className="bias-seg bias-seg-l" style={{ width: summary.leftPct + '%' }}></div>}
    {summary.centerPct > 0 && <div className="bias-seg bias-seg-c" style={{ width: summary.centerPct + '%' }}></div>}
    {summary.rightPct > 0 && <div className="bias-seg bias-seg-r" style={{ width: summary.rightPct + '%' }}></div>}
  </div>
);

const NewsItem = ({ n, onSelect }) => {
  const [open, setOpen] = useState(false);
  const summary = summarizeCoverage(n.coverage);
  const sortedCoverage = [...(n.coverage || [])].sort((a, b) => a.lean - b.lean);

  return (
    <div className={`news-item ${open ? 'news-item-open' : ''}`}>
      <div className="news-row" onClick={() => { setOpen(!open); onSelect && onSelect(n); }}>
        <div className={`news-tick news-tick-${n.sentiment}`}></div>
        <div className="news-body">
          <div className="news-headline">{n.headline}</div>
          <div className="news-coverage-line">
            <span className="news-coverage-count">
              <strong>{summary.total}</strong> outlets
            </span>
            <BiasBar summary={summary} />
            <span className="news-coverage-split mono">
              {summary.leftPct}<span className="news-split-dim">L</span>·{summary.centerPct}<span className="news-split-dim">C</span>·{summary.rightPct}<span className="news-split-dim">R</span>
            </span>
            <span className="news-meta-dot"></span>
            <span className="news-fact mono" title="Aggregate factuality score">{summary.fact}<span className="news-split-dim">/100</span></span>
            <span className="news-meta-dot"></span>
            <span>{window.FmtUtils.fmtRelative(n.mins)}</span>
            <span className="news-meta-dot"></span>
            <Badge variant={n.sentiment === 'bullish' ? 'gain' : n.sentiment === 'bearish' ? 'loss' : 'neutral'}>
              {n.sentiment}
            </Badge>
          </div>
        </div>
        <div className="news-right">
          <div className="news-tickers">
            {n.tickers.map(t => <span key={t} className="news-ticker-pill">{t}</span>)}
          </div>
          <span className={`news-chev ${open ? 'news-chev-open' : ''}`}>›</span>
        </div>
      </div>

      {open && (
        <div className="news-drill">
          <div className="news-drill-framing">
            <span className="label-cap">How it’s being framed</span>
            <p>{n.framing}</p>
          </div>

          <div className="news-drill-grid">
            <div className="news-drill-stat">
              <div className="label-cap">Coverage</div>
              <div className="news-drill-stat-val">{summary.total} <span className="news-drill-stat-unit">outlets</span></div>
              <div className="news-drill-stat-sub">{summary.primary} primary newswire{summary.primary === 1 ? '' : 's'}</div>
            </div>
            <div className="news-drill-stat">
              <div className="label-cap">Lean distribution</div>
              <BiasBar summary={summary} height={10} />
              <div className="news-drill-legend">
                <span><i className="bias-dot bias-dot-l"></i>Left {summary.left}</span>
                <span><i className="bias-dot bias-dot-c"></i>Center {summary.center}</span>
                <span><i className="bias-dot bias-dot-r"></i>Right {summary.right}</span>
              </div>
            </div>
            <div className="news-drill-stat">
              <div className="label-cap">Factuality</div>
              <div className="news-drill-stat-val">{summary.fact}<span className="news-drill-stat-unit">/100</span></div>
              <div className="news-drill-stat-sub">Weighted by outlet count</div>
            </div>
          </div>

          <div className="label-cap" style={{ marginTop: 12, marginBottom: 6 }}>By outlet group</div>
          <div className="news-coverage-list">
            {sortedCoverage.map((c, i) => (
              <div key={i} className="news-coverage-row">
                <div className={`news-coverage-lean news-coverage-lean-${c.lean < 0 ? 'l' : c.lean > 0 ? 'r' : 'c'}`}>
                  {LEAN_LABEL[c.lean]}
                </div>
                <div className="news-coverage-tier mono">{TIER_LABEL[c.tier]}</div>
                <div className="news-coverage-frame">“{c.frames}”</div>
                <div className="news-coverage-count-cell mono">×{c.count}</div>
                <div className="news-coverage-fact mono" title="Factuality">{c.fact}</div>
              </div>
            ))}
          </div>

          <div className="news-drill-actions">
            <Button variant="ghost" size="xs">Open all sources</Button>
            <Button variant="ghost" size="xs">Track this story</Button>
            <span className="news-drill-note">Outlet identities anonymized — FrieNi shows aggregate signal, not single-source narrative.</span>
          </div>
        </div>
      )}
    </div>
  );
};

const NewsList = ({ items, onSelect, max }) => {
  const list = max ? items.slice(0, max) : items;
  return (
    <div className="news-list">
      {list.map(n => <NewsItem key={n.id} n={n} onSelect={onSelect} />)}
    </div>
  );
};

const ModeSelector = ({ mode, onChange, compact }) => {
  const modes = [
    { id: 'step', name: 'Step', desc: 'Plan → Execute → Verify' },
    { id: 'gsd2', name: 'GSD²', desc: 'Get Shit Done²' },
    { id: 'half', name: 'Half-Auto', desc: 'Confirm before commit' },
    { id: 'full', name: 'Full-Auto', desc: 'Within risk limits' },
  ];
  return (
    <div className="mode-bar">
      <div className="label-cap" style={{ marginRight: 4 }}>Mode</div>
      {modes.map(m => (
        <div key={m.id} className={`mode-pill ${mode === m.id ? 'mode-pill-active' : ''}`} onClick={() => onChange(m.id)}>
          <div className="mode-pill-name">{m.name}</div>
          {!compact && <div className="mode-pill-desc">{m.desc}</div>}
        </div>
      ))}
    </div>
  );
};

const StepPipeline = ({ steps, current }) => (
  <div className="step-pipeline">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <span className={`step-pip ${i < current ? 'step-pip-done' : i === current ? 'step-pip-active' : ''}`}>
          {i < current ? '✓ ' : ''}{s}
        </span>
        {i < steps.length - 1 && <span className="step-arrow">→</span>}
      </React.Fragment>
    ))}
  </div>
);

const AssistantChat = ({ embedded = false }) => {
  const store = window.AppStore.get();
  const [mode, setMode] = useState(store.assistantMode);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Good morning Elena. I scanned your portfolio and the overnight tape. Three items want attention.',
      cards: [
        {
          type: 'suggestion',
          symbol: 'PLTR',
          action: 'BUY',
          confidence: 78,
          thesis: 'Government contract pipeline accelerating. FedRAMP High momentum, 4 new DoD wins this quarter.',
          target: 32.40,
          current: 27.18,
        },
      ],
    },
    {
      role: 'user',
      content: 'Why TSLA underweight? Show me the breakdown.',
    },
    {
      role: 'assistant',
      content: 'Three reasons stack against TSLA into Q3:',
      bullets: [
        'Delivery growth decelerating (–6% YoY est.)',
        'China demand softening on local EV competition',
        'Multiple compression risk, P/E still 56x vs peer median 18x',
      ],
      pipeline: mode === 'step' ? { steps: ['Research', 'Plan', 'Confirm', 'Execute', 'Verify'], current: 1 } : null,
    },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Let me trace through that. In ' + mode.toUpperCase() + ' mode I would:',
        bullets: ['Pull current holdings, sector betas, and 30d realized vol', 'Stress against three rate scenarios', 'Surface 2 concrete rebalancing trades for your approval'],
      }]);
    }, 500);
  };

  return (
    <div className="chat">
      <ModeSelector mode={mode} onChange={(m) => { setMode(m); window.AppStore.setAssistantMode(m); }} compact={embedded} />
      <div className="chat-thread">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : ''}`}>
            <div className={`chat-avatar ${m.role === 'user' ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
              {m.role === 'user' ? 'EM' : 'F'}
            </div>
            <div>
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {m.content}
                {m.bullets && (
                  <ul style={{ marginTop: 8, paddingLeft: 18, listStyle: 'disc' }}>
                    {m.bullets.map((b, j) => <li key={j} style={{ marginTop: 3 }}>{b}</li>)}
                  </ul>
                )}
                {m.pipeline && (
                  <div style={{ marginTop: 10 }}>
                    <StepPipeline steps={m.pipeline.steps} current={m.pipeline.current} />
                  </div>
                )}
                {m.cards && m.cards.map((c, j) => (
                  <div key={j} className="chat-card">
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                      <div className="row row-gap-2">
                        <Badge variant={c.action === 'BUY' ? 'gain' : 'loss'} dot>{c.action}</Badge>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{c.symbol}</span>
                      </div>
                      <Badge variant="brand">{c.confidence}% conf.</Badge>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>{c.thesis}</div>
                    <div className="row row-gap-3" style={{ fontSize: 11.5 }}>
                      <div><span className="label-cap">Target </span><span className="mono">${c.target}</span></div>
                      <div><span className="label-cap">Current </span><span className="mono">${c.current}</span></div>
                      <div className="spacer"></div>
                      <Button variant="primary" size="xs">Stage trade</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-bar">
        <input
          className="chat-input"
          placeholder="Ask about positions, scenarios, or stage a trade..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <Button variant="ghost" size="sm">/</Button>
        <Button variant="primary" size="sm" onClick={send}>Send</Button>
      </div>
    </div>
  );
};

window.StockTable = StockTable;
window.NewsList = NewsList;
window.AssistantChat = AssistantChat;
window.ModeSelector = ModeSelector;
window.StepPipeline = StepPipeline;
