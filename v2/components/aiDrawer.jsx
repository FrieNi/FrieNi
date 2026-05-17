// AI drawer — bottom sheet

const AI_PROMPTS_BY_CONTEXT = {
  portfolio: [
    'Highlight anything that looks overvalued',
    'Where is my biggest concentration risk?',
    'Rebalance ideas for the next quarter',
    'Compare YOLO vs Core — what\'s the alpha cost?',
  ],
  stock: [
    'Explain this rating in plain English',
    'What\'s the bear case in two sentences?',
    'How does this compare to peers in the sector?',
    'Walk me through what happened at the last earnings',
  ],
  strategy: [
    'Build a momentum strategy with downside protection',
    'Adapt this for a higher-risk YOLO portfolio',
    'Suggest a contrarian variant',
    'What rules would have caught HVNK before the drawdown?',
  ],
};

const AI_RESPONSES = {
  // portfolio
  'highlight anything that looks overvalued': {
    target: 'kpi-row',
    body: "Three positions look stretched on a forward-multiple basis: NRLA (62x P/E vs 38x peer median), VRTL (PEG 1.4 but compounding pressure), and PHRM (54x P/E). I've highlighted them in your KPI summary above.",
  },
  'where is my biggest concentration risk?': {
    target: 'positions',
    body: "Your AI sector is 35% of total — about 1.6x your strategy target. NRLA alone is 14% of NAV. Trimming NRLA to 9% would normalize sector tilt without touching the rest.",
  },
  'rebalance ideas for the next quarter': {
    target: 'positions',
    body: "Three moves: (1) Trim NRLA by 35% — capture gains, restore strategy fit. (2) Exit HVNK — fails 4 of 6 strategy rules. (3) Add to VLTC — scores 74/100, under-weight vs target by 2.1%.",
  },
  'compare yolo vs core': {
    target: 'kpi-row',
    body: "YOLO is +14.8% YTD vs Core +21.2%, but with 2.4x the drawdown. Sharpe is 0.61 vs 1.42. You're paying 0.81 alpha per unit of risk for the YOLO exposure — defensible only if you can stomach -38% drawdowns.",
  },
  // stock
  'explain this rating': {
    target: 'exec-grid',
    body: "This 78/100 comes from: Fundamental 82 (revenue +22% YoY, expanding margins), Technical 71 (above both SMAs, RSI neutral at 58), Sentiment 80 (positive news flow, analyst upgrades). The drag is Technical — RSI is near the upper end of neutral, so any pullback is mostly mean-reversion.",
  },
  'what\'s the bear case': {
    target: 'exec-grid',
    body: "Two things break this: (1) AI cap-ex cycle peaks earlier than consensus → revenue decel. (2) Margin compression as cloud commodity providers undercut on price. Watch FCF margin — if it dips below 18% next quarter, the multiple compresses fast.",
  },
  // strategy
  'build a momentum strategy': {
    target: 'strategy-editor',
    body: "I'd suggest: BUY when RSI > 55 AND price > 50d SMA by 3% AND sentiment > 70. SELL when RSI > 80 (overbought) OR price drops 8% from 20-day high. Weight technical 60% / sentiment 30% / fundamental 10%.",
  },
};

function findResponse(prompt) {
  const lc = prompt.toLowerCase();
  for (const [k, v] of Object.entries(AI_RESPONSES)) {
    if (lc.includes(k)) return v;
  }
  // generic
  return {
    target: null,
    body: "I looked at the data and here's what stands out: your portfolio is over-indexed on momentum (technicals high, fundamentals slightly lower), and the biggest improvement would come from rotating one of your weaker AI positions into a name with better fundamentals.",
  };
}

function AiDrawer({ context, contextId, onClose, theme, addToast }) {
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const prompts = AI_PROMPTS_BY_CONTEXT[context] || AI_PROMPTS_BY_CONTEXT.portfolio;

  const contextLabel = React.useMemo(() => {
    if (context === 'stock' && contextId) {
      const s = window.FrieNi.byId(contextId);
      return s ? `${s.ticker} · ${s.name}` : 'stock';
    }
    if (context === 'strategy') return 'Strategy editor';
    if (context === 'portfolio') return 'Portfolio overview';
    return 'Workspace';
  }, [context, contextId]);

  function submit(text) {
    if (!text.trim()) return;
    setLoading(true);
    setInput('');
    setTimeout(() => {
      const r = findResponse(text);
      setResponse({ prompt: text, ...r });
      setLoading(false);
      // pulse target element
      if (r.target) {
        const el = document.querySelector(`[data-tut="${r.target}"]`);
        if (el) {
          el.style.transition = 'box-shadow 0.4s, transform 0.4s';
          el.style.boxShadow = '0 0 0 2px var(--accent), 0 0 24px oklch(0.55 0.18 275 / 0.4)';
          el.style.transform = 'translateY(-2px)';
          setTimeout(() => {
            el.style.boxShadow = '';
            el.style.transform = '';
          }, 2500);
        }
      }
    }, 900);
  }

  return (
    <div className="ai-drawer-overlay" onClick={onClose}>
      <div className="ai-drawer" onClick={e => e.stopPropagation()}>
        <div className="handle" />
        <h3>
          <span className="spark-icon"><Icon name="sparkle" size={13} color="white" /></span>
          Ask FrieNi
        </h3>
        <p className="ctx">Context: <strong style={{color:'var(--text-2)'}}>{contextLabel}</strong></p>

        <div className="ai-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about this view…"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
          />
          <button className="icon-btn primary" onClick={() => submit(input)} disabled={!input.trim() || loading}>
            <Icon name={loading ? 'sparkles' : 'send'} size={14} />
          </button>
        </div>

        {!response && (
          <div className="ai-suggestions">
            {prompts.map(p => (
              <button key={p} className="ai-suggestion" onClick={() => submit(p)}>{p}</button>
            ))}
          </div>
        )}

        {loading && (
          <div className="ai-response" style={{display:'flex', gap: 10, alignItems:'center'}}>
            <div className="typing" style={{background:'transparent', border:'none', padding:0}}>
              <span style={{background:'var(--accent)'}} /><span style={{background:'var(--accent)'}} /><span style={{background:'var(--accent)'}} />
            </div>
            <span style={{color:'var(--accent)', fontSize: 12.5}}>Thinking…</span>
          </div>
        )}

        {response && !loading && (
          <>
            <div style={{padding: '8px 0', fontSize: 12.5, color:'var(--text-3)', borderBottom: '1px dashed var(--border)', marginBottom: 10}}>
              <span style={{color:'var(--text-2)'}}>You asked:</span> "{response.prompt}"
            </div>
            <div className="ai-response">
              <div className="label">
                <Icon name="sparkle" size={11} />
                FrieNi
              </div>
              {response.body}
              {response.target && (
                <div style={{marginTop: 12, display:'flex', gap: 6}}>
                  <button className="btn sm" onClick={onClose}>
                    <Icon name="arrowRight" size={11} /> See where in the UI
                  </button>
                  <button className="btn sm ghost" onClick={() => { setResponse(null); }}>Ask another</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.AiDrawer = AiDrawer;
