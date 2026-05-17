// Strategies editor

function StrategiesView({ strategies, setStrategies, theme, openAi, runAnalysis }) {
  const [selectedId, setSelectedId] = React.useState(strategies[0]?.id);
  const selected = strategies.find(s => s.id === selectedId);

  function updateSelected(updater) {
    setStrategies(prev => prev.map(s => s.id === selectedId ? updater(s) : s));
  }

  function addRule(side) {
    updateSelected(s => ({
      ...s,
      rules: {
        ...s.rules,
        [side]: [...s.rules[side], { metric: 'RSI', op: '>', value: 50 }]
      }
    }));
  }
  function removeRule(side, i) {
    updateSelected(s => ({
      ...s,
      rules: { ...s.rules, [side]: s.rules[side].filter((_, idx) => idx !== i) }
    }));
  }
  function updateRule(side, i, key, val) {
    updateSelected(s => ({
      ...s,
      rules: {
        ...s.rules,
        [side]: s.rules[side].map((r, idx) => idx === i ? { ...r, [key]: val } : r)
      }
    }));
  }
  function setWeight(key, val) {
    updateSelected(s => ({ ...s, weights: { ...s.weights, [key]: val } }));
  }
  function activate() {
    setStrategies(prev => prev.map(s => ({ ...s, active: s.id === selectedId })));
  }

  return (
    <div className="content fade-in">
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 22}}>
        <div>
          <div className="page-h">
            <h1>Strategies</h1>
            <span className="sub">Define how buy and sell signals are generated</span>
          </div>
          <div style={{display:'flex', gap:6, marginTop: 10}}>
            <span className="tag">{strategies.length} strategies</span>
            <span className="tag" style={{background:'var(--accent-soft)', color:'var(--accent)'}}>
              Active: {strategies.find(s => s.active)?.name || 'None'}
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap: 8}}>
          <button className="btn" onClick={() => openAi('strategy', selectedId)}><Icon name="sparkle" size={13} /> Generate from goal</button>
          <button className="btn primary" onClick={() => runAnalysis(selectedId)}><Icon name="refresh" size={13} /> Re-run on portfolio</button>
        </div>
      </div>

      <div className="strategy-canvas">
        <div className="strategy-list">
          {strategies.map(st => (
            <div
              key={st.id}
              className={'strategy-card-list' + (selectedId === st.id ? ' active' : '')}
              onClick={() => setSelectedId(st.id)}
            >
              <div style={{display:'flex', alignItems:'center', gap: 6}}>
                <h4 style={{flex: 1}}>{st.name}</h4>
                {st.active && <span className="pill good" style={{fontSize: 10}}>Active</span>}
              </div>
              <p>{st.desc}</p>
            </div>
          ))}
          <button className="strategy-card-list" style={{textAlign:'center', color:'var(--text-3)', cursor:'pointer'}}>
            <Icon name="plus" size={12} /> New strategy
          </button>
        </div>

        {selected && (
          <div className="strategy-editor">
            <div className="strategy-editor-h">
              <input
                value={selected.name}
                onChange={e => updateSelected(s => ({ ...s, name: e.target.value }))}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.015em',
                  flex: 1,
                }}
              />
              {selected.active ? (
                <span className="pill good">Active</span>
              ) : (
                <button className="btn sm primary" onClick={activate}>Set active</button>
              )}
              <button className="btn sm ghost"><Icon name="trash" size={12} /></button>
            </div>

            <div className="rules-section">
              <h4>When to buy <span style={{color: 'var(--good)', marginLeft: 6}}>↗</span></h4>
              {selected.rules.buy.map((r, i) => (
                <RuleEditor key={i} rule={r}
                  onChange={(k, v) => updateRule('buy', i, k, v)}
                  onRemove={() => removeRule('buy', i)}
                  side="buy"
                />
              ))}
              <button className="btn sm ghost" onClick={() => addRule('buy')}>
                <Icon name="plus" size={12} /> Add buy rule
              </button>
            </div>

            <div className="rules-section">
              <h4>When to sell <span style={{color: 'var(--bad)', marginLeft: 6}}>↘</span></h4>
              {selected.rules.sell.map((r, i) => (
                <RuleEditor key={i} rule={r}
                  onChange={(k, v) => updateRule('sell', i, k, v)}
                  onRemove={() => removeRule('sell', i)}
                  side="sell"
                />
              ))}
              <button className="btn sm ghost" onClick={() => addRule('sell')}>
                <Icon name="plus" size={12} /> Add sell rule
              </button>
            </div>

            <div className="rules-section">
              <h4>Rating weights — how to compute overall score</h4>
              <div className="weight-grid">
                <WeightRow label="Fundamental" val={selected.weights.fundamental} onChange={v => setWeight('fundamental', v)} />
                <WeightRow label="Technical" val={selected.weights.technical} onChange={v => setWeight('technical', v)} />
                <WeightRow label="Sentiment" val={selected.weights.sentiment} onChange={v => setWeight('sentiment', v)} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-3)'}}>
                <span>Total: {selected.weights.fundamental + selected.weights.technical + selected.weights.sentiment}%</span>
                {(selected.weights.fundamental + selected.weights.technical + selected.weights.sentiment) !== 100 && (
                  <span style={{color: 'var(--ok)'}}>Should sum to 100%</span>
                )}
              </div>
            </div>

            <div className="rules-section" style={{borderBottom: 'none'}}>
              <h4>Backtest preview · 1y</h4>
              <div style={{display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
                <Stat label="Return" val="+27.4%" tone="good" />
                <Stat label="Max drawdown" val="-12.8%" tone="ok" />
                <Stat label="Sharpe" val="1.62" tone="good" />
                <Stat label="Win rate" val="64%" tone="good" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RuleEditor({ rule, onChange, onRemove, side }) {
  const metrics = [
    'RSI', 'P/E', 'PEG', 'ROIC', 'Debt/Equity', 'Revenue Growth',
    'Operating Margin', 'Price vs 50-day SMA', 'Price vs 200-day SMA',
    'Fundamental score', 'Technical score', 'Sentiment score',
  ];
  return (
    <div className="rule">
      <span className="when">{side === 'buy' ? 'IF' : 'IF'}</span>
      <select value={rule.metric} onChange={e => onChange('metric', e.target.value)}>
        {metrics.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={rule.op} onChange={e => onChange('op', e.target.value)}>
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&ge;</option>
        <option value="<=">&le;</option>
        <option value="=">=</option>
      </select>
      <input
        type="number"
        value={rule.value}
        onChange={e => onChange('value', parseFloat(e.target.value) || 0)}
        style={{width: 70, textAlign: 'right'}}
      />
      <button className="rule-x" onClick={onRemove}><Icon name="x" size={12} /></button>
    </div>
  );
}

function WeightRow({ label, val, onChange }) {
  return (
    <div className="weight-row">
      <span>{label}</span>
      <input
        type="range" min="0" max="100" value={val}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ '--pct': val + '%' }}
      />
      <span className="val">{val}%</span>
    </div>
  );
}

function Stat({ label, val, tone }) {
  return (
    <div style={{padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)'}}>
      <div style={{fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4}}>{label}</div>
      <div className={'mono ' + (tone === 'good' ? 'pos' : tone === 'bad' ? 'neg' : '')} style={{fontSize: 18, fontWeight: 500}}>{val}</div>
    </div>
  );
}

window.StrategiesView = StrategiesView;
