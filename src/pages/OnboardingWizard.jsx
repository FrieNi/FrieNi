// OnboardingWizard — conversational, adaptive-depth first-run experience.
// Length: beginner ~4, intermediate ~7, pro ~10. Plain language only.

const WizIcon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SKILL_OPTIONS = [
  { value: 'new',  title: 'New to investing',
    sub: "I've never bought a stock — or I'm still figuring it out.", icon: 'M10 3a7 7 0 100 14 7 7 0 000-14zM10 7v3l2 2' },
  { value: 'some', title: 'Some experience',
    sub: 'I trade now and then. I know the basics but want guidance.', icon: 'M3 17l4-4 3 3 7-8M14 8h3v3' },
  { value: 'pro',  title: 'Active / professional',
    sub: 'I trade regularly and want fine-grained control.', icon: 'M3 12l3-7 3 11 3-9 3 5h2' },
];

const GOAL_OPTIONS = [
  { value: 'grow',    title: 'Grow my money over time', sub: 'Long-term wealth building.' },
  { value: 'income',  title: 'Get steady income', sub: 'Dividends and stable returns.' },
  { value: 'protect', title: 'Protect what I have', sub: 'Beat inflation, keep risk low.' },
  { value: 'learn',   title: 'Just exploring', sub: "I want to learn before committing." },
];

const GOAL_OPTIONS_SOME = [
  { value: 'grow',    title: 'Grow my money over time', sub: 'Long-term wealth building.' },
  { value: 'swing',   title: 'Capture market moves', sub: 'Weeks-to-months swing trades.' },
  { value: 'income',  title: 'Get steady income', sub: 'Dividends and stable returns.' },
  { value: 'protect', title: 'Protect what I have', sub: 'Beat inflation, keep risk low.' },
];

const GOAL_OPTIONS_PRO = [
  { value: 'alpha',   title: 'Generate alpha', sub: 'Outperform. Edge-driven, systematic or discretionary.', tag: 'Pro' },
  { value: 'intraday',title: 'Intraday P&L', sub: 'Day-trading. Flat overnight.', tag: 'Aggressive' },
  { value: 'swing',   title: 'Swing & momentum', sub: 'Multi-day to multi-week setups.', tag: null },
  { value: 'grow',    title: 'Position / long-term', sub: 'Core book. Months to years.', tag: null },
  { value: 'income',  title: 'Income & yield', sub: 'Dividends, covered calls, carry.', tag: null },
  { value: 'hedge',   title: 'Hedge a portfolio', sub: 'Reduce exposure, manage tail risk.', tag: null },
];

const HORIZON_OPTIONS_BEGINNER = [
  { value: 'months', title: 'A few months', sub: 'Short-term needs.' },
  { value: '1to3y',  title: '1–3 years',    sub: 'Mid-term.' },
  { value: '5y',     title: '~5 years',     sub: 'Patient.' },
  { value: '10y+',   title: '10+ years',    sub: 'Decades, no rush.' },
];

const HORIZON_OPTIONS_SOME = [
  { value: 'weeks',  title: 'Days to weeks',  sub: 'Swing trading range.' },
  { value: 'months', title: 'Weeks to months', sub: 'Medium swing.' },
  { value: '1to3y',  title: '1–3 years',       sub: 'Position trading.' },
  { value: '5y',     title: '5+ years',         sub: 'Core holdings.' },
];

const HORIZON_OPTIONS_PRO = [
  { value: 'intraday', title: 'Intraday',        sub: 'Open-to-close. Flat overnight.', tag: 'Aggressive' },
  { value: '1to3d',    title: '1–3 days',        sub: 'Overnight holds, short momentum.', tag: 'Aggressive' },
  { value: 'weeks',    title: 'Days to weeks',   sub: 'Swing setups.', tag: null },
  { value: 'months',   title: 'Weeks to months', sub: 'Catalyst plays, earnings.', tag: null },
  { value: '1to3y',    title: '1–3 years',        sub: 'Position trades.', tag: null },
  { value: '5y',       title: '5+ years',          sub: 'Core / long-term book.', tag: null },
];

const STYLE_OPTIONS = [
  { value: 'discretionary', title: 'Discretionary', sub: "I make calls based on judgement and research." },
  { value: 'systematic',    title: 'Systematic',    sub: 'I prefer rules-based and quantitative approaches.' },
  { value: 'mix',           title: 'A mix',         sub: 'Both — depends on the setup.' },
];

const TOOL_OPTIONS = [
  { value: 'hotkeys', title: 'Hotkey trading' },
  { value: 'feeds',   title: 'Premium data feeds' },
  { value: 'options', title: 'Options' },
  { value: 'futures', title: 'Futures' },
  { value: 'crypto',  title: 'Crypto' },
  { value: 'fx',      title: 'Forex' },
];

// Domain constellation — positioned in absolute %s for an organic, non-grid layout.
// 'pop' = relative size of the node when not selected.
const DOMAINS = [
  { name: 'Semiconductors', x: 30, y: 25, pop: 1.1 },
  { name: 'AI infrastructure', x: 56, y: 18, pop: 1.2 },
  { name: 'Clean energy', x: 18, y: 56, pop: 1.0 },
  { name: 'Biotech', x: 78, y: 35, pop: 0.95 },
  { name: 'Fintech', x: 70, y: 70, pop: 1.0 },
  { name: 'Consumer', x: 42, y: 78, pop: 0.9 },
  { name: 'Defense', x: 88, y: 60, pop: 0.9 },
  { name: 'Real estate', x: 12, y: 78, pop: 0.85 },
  { name: 'Cybersecurity', x: 62, y: 45, pop: 1.05 },
  { name: 'Commodities', x: 24, y: 38, pop: 0.85 },
  { name: 'Crypto / Web3', x: 88, y: 18, pop: 0.85 },
  { name: 'Auto & EV', x: 44, y: 50, pop: 0.95 },
];

const KNOWLEDGE_LEVELS = ['Curious', 'Familiar', 'Expert'];

const BROKERS = [
  { value: 'alpaca', name: 'Alpaca',
    glyph: 'α',
    sub: 'Free brokerage with simple API. Paper trading available.',
    tag: 'Recommended' },
  { value: 'ibkr', name: 'Interactive Brokers',
    glyph: 'IB',
    sub: 'Pro-grade access — global markets, options, futures, FX.',
    tag: 'Pro' },
  { value: 'csv', name: 'Manual CSV',
    glyph: '⤓',
    sub: 'Already keep records elsewhere? Drop in a CSV.',
    tag: 'Manual' },
];

const Bubble = ({ from = 'bot', children, sub, isQuestion = false, editable = false, isEditing = false, hasNote = false, onEdit, detail }) => (
  <div className={`wiz-bubble ${from === 'user' ? 'wiz-from-user' : ''} ${isQuestion ? 'wiz-question' : ''} ${editable ? 'wiz-editable' : ''} ${isEditing ? 'is-editing' : ''}`}>
    <div className="wiz-avatar">{from === 'user' ? 'You' : 'F'}</div>
    <div className="wiz-bubble-body">
      <div className="wiz-bubble-text">{children}</div>
      {detail && <div className="wiz-bubble-detail">{detail}</div>}
      {sub && <div className="wiz-bubble-sub">{sub}</div>}
      {editable && (
        <button type="button" className="wiz-bubble-edit" onClick={onEdit} title={isEditing ? 'Done' : hasNote ? 'Edit detail' : 'Add detail'}>
          {isEditing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-6"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 1.5a1.2 1.2 0 0 1 1.7 1.7L3.5 9.9l-2.5.6.6-2.5L8.5 1.5z"/></svg>
          )}
        </button>
      )}
    </div>
  </div>
);

const TypingBubble = () => (
  <div className="wiz-bubble">
    <div className="wiz-avatar">F</div>
    <div className="wiz-bubble-body">
      <div className="wiz-typing"><span /><span /><span /></div>
    </div>
  </div>
);

// ── Domain constellation: clickable nodes with a knowledge picker ────────────
const DomainConstellation = ({ selected, onToggle }) => {
  const max = 3;
  const isSel = (n) => selected.some(s => s.name === n);
  return (
    <div className="wiz-constellation">
      <div className="wiz-constellation-grid" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {selected.length > 1 && selected.map((s, i) => {
          const next = selected[(i + 1) % selected.length];
          const a = DOMAINS.find(d => d.name === s.name);
          const b = DOMAINS.find(d => d.name === next.name);
          if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="var(--brand)" strokeWidth="0.3" strokeDasharray="0.8 0.8" opacity="0.6" />;
        })}
      </svg>
      {DOMAINS.map((d, i) => {
        const sel = isSel(d.name);
        const disabled = !sel && selected.length >= max;
        const rank = sel ? selected.findIndex(s => s.name === d.name) + 1 : null;
        return (
          <button
            key={d.name}
            className={`wiz-domain-node ${sel ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
            style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: 11 + d.pop * 1.5 + 'px' }}
            onClick={() => onToggle(d.name)}
            disabled={disabled}
            type="button"
          >
            {d.name}
            {sel && <span className="wiz-domain-node-rank">#{rank}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ── Wizard step-builder ──────────────────────────────────────────────────────
function buildSteps(answers) {
  // Step structure: { id, prompt, sub, render(answers, set), validate(answers) }
  const baseStart = [
    { id: 'skill', prompt: "Welcome. Before we set anything up — how would you describe yourself?",
      sub: "This tells us how much detail to ask for next." },
    { id: 'goal', prompt: 'What are you hoping to do with your money?' },
    { id: 'domains', prompt: 'Pick up to 3 areas you want to focus on.',
      sub: "FrieNi works best when it knows where you have an edge. Tap up to three." },
  ];

  const skill = answers.skill;
  if (!skill) return [baseStart[0]];

  // Path: NEW (4 steps) — skill, goal, domains, broker
  if (skill === 'new') {
    return [
      ...baseStart,
      { id: 'broker', prompt: "Last step. Connect an account so we can analyze what you hold.",
        sub: "We'll never trade without your go-ahead. Demo / paper accounts work too." },
    ];
  }

  // Path: SOME (7 steps) — skill, goal, horizon, domains, knowledge, cash, broker
  if (skill === 'some') {
    return [
      baseStart[0],
      baseStart[1],
      { id: 'horizon', prompt: 'How long can your money stay invested?' },
      baseStart[2],
      { id: 'knowledge', prompt: 'How well do you know each of those areas?',
        sub: "We'll adjust how much detail we surface for each." },
      { id: 'cash', prompt: "Roughly how much are you working with?",
        sub: "Helps us scale recommendations. Stays private." },
      { id: 'broker', prompt: "Connect your account.",
        sub: "We'll pull positions and start the first analysis." },
    ];
  }

  // Path: PRO (10 steps)
  return [
    baseStart[0],
    baseStart[1],
    { id: 'horizon', prompt: 'Time horizon for the bulk of capital?' },
    baseStart[2],
    { id: 'knowledge', prompt: 'Knowledge depth for each focus area.',
      sub: 'Drives jargon density and which signals we surface.' },
    { id: 'style', prompt: 'How do you make decisions, mostly?' },
    { id: 'tools', prompt: 'Which instruments and tools do you use?',
      sub: 'We hide what you don\'t need.' },
    { id: 'risk', prompt: 'What\'s your max acceptable single-position loss?',
      sub: 'Hard cap on any one ticket. You can change this later.' },
    { id: 'cash', prompt: 'Approx. capital under management?' },
    { id: 'broker', prompt: 'Connect a broker.',
      sub: "Multi-account is supported — connect more in Settings." },
  ];
}

// ── Step renderer ────────────────────────────────────────────────────────────
const WizStep = ({ step, answers, onAnswer, isReplaying }) => {
  const { id } = step;

  if (id === 'skill') {
    return (
      <div className="wiz-options wiz-options-3">
        {SKILL_OPTIONS.map(o => (
          <button key={o.value} className={`wiz-opt ${answers.skill === o.value ? 'is-selected' : ''}`}
                  onClick={() => onAnswer('skill', o.value)} type="button">
            <div className="wiz-opt-icon"><WizIcon d={o.icon} /></div>
            <div className="wiz-opt-title">{o.title}</div>
            <div className="wiz-opt-sub">{o.sub}</div>
          </button>
        ))}
      </div>
    );
  }

  if (id === 'goal') {
    const skill = answers.skill;
    const opts = skill === 'pro' ? GOAL_OPTIONS_PRO
               : skill === 'some' ? GOAL_OPTIONS_SOME
               : GOAL_OPTIONS;
    const cols = skill === 'pro' ? 'wiz-options-3' : 'wiz-options-2';
    return (
      <div className={`wiz-options ${cols}`}>
        {opts.map(o => (
          <button key={o.value} className={`wiz-opt ${answers.goal === o.value ? 'is-selected' : ''}`}
                  onClick={() => onAnswer('goal', o.value)} type="button">
            {o.tag && <span className={`wiz-opt-tag wiz-opt-tag--aggressive ${o.tag === 'Pro' ? 'wiz-opt-tag--pro' : ''}`}>{o.tag}</span>}
            <div className="wiz-opt-title">{o.title}</div>
            <div className="wiz-opt-sub">{o.sub}</div>
          </button>
        ))}
      </div>
    );
  }

  if (id === 'horizon') {
    const skill = answers.skill;
    const opts = skill === 'pro' ? HORIZON_OPTIONS_PRO
               : skill === 'some' ? HORIZON_OPTIONS_SOME
               : HORIZON_OPTIONS_BEGINNER;
    const cols = skill === 'pro' ? 'wiz-options-3' : 'wiz-options-2';
    return (
      <div className={`wiz-options ${cols}`}>
        {opts.map(o => (
          <button key={o.value} className={`wiz-opt ${answers.horizon === o.value ? 'is-selected' : ''}`}
                  onClick={() => onAnswer('horizon', o.value)} type="button">
            {o.tag && <span className="wiz-opt-tag wiz-opt-tag--aggressive">{o.tag}</span>}
            <div className="wiz-opt-title">{o.title}</div>
            <div className="wiz-opt-sub">{o.sub}</div>
          </button>
        ))}
      </div>
    );
  }

  if (id === 'domains') {
    const selected = (answers.domains || []).map(name => ({ name, knowledge: answers.domainNotes?.[name + '/knowledge'] || 1 }));
    const toggle = (name) => {
      const cur = answers.domains || [];
      const next = cur.includes(name) ? cur.filter(n => n !== name) : (cur.length >= 3 ? cur : [...cur, name]);
      onAnswer('domains', next);
    };
    return (
      <>
        <DomainConstellation selected={selected} onToggle={toggle} />
        {selected.length > 0 && (
          <div className="wiz-bubble-sub" style={{ marginTop: 4 }}>
            {selected.length}/3 picked · {selected.map(s => s.name).join(' · ')}
          </div>
        )}
      </>
    );
  }

  if (id === 'knowledge') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(answers.domains || []).map(d => {
          const k = answers.domainNotes?.[d + '/knowledge'] ?? 1;
          const ctx = answers.domainNotes?.[d] || '';
          return (
            <div key={d} className="wiz-domain-detail">
              <div className="wiz-domain-detail-row">
                <div className="wiz-domain-detail-name">{d}</div>
                <div className="wiz-knowledge-pills">
                  {KNOWLEDGE_LEVELS.map((lvl, i) => (
                    <button key={lvl} type="button"
                            className={`wiz-knowledge-pill ${i === k ? 'is-on' : ''}`}
                            onClick={() => window.AppStore.setDomainNote(d + '/knowledge', i)}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="wiz-input wiz-textarea"
                placeholder={`Anything specific you watch in ${d}? (e.g. "I follow ASML and HBM cycles")`}
                value={ctx}
                onChange={(e) => window.AppStore.setDomainNote(d, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (id === 'style') {
    return (
      <div className="wiz-options wiz-options-3">
        {STYLE_OPTIONS.map(o => (
          <button key={o.value} className={`wiz-opt ${answers.style === o.value ? 'is-selected' : ''}`}
                  onClick={() => onAnswer('style', o.value)} type="button">
            <div className="wiz-opt-title">{o.title}</div>
            <div className="wiz-opt-sub">{o.sub}</div>
          </button>
        ))}
      </div>
    );
  }

  if (id === 'tools') {
    const sel = answers.tools || [];
    const toggle = (v) => onAnswer('tools', sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]);
    return (
      <div className="wiz-options wiz-options-3">
        {TOOL_OPTIONS.map(o => (
          <button key={o.value} className={`wiz-opt ${sel.includes(o.value) ? 'is-selected' : ''}`}
                  onClick={() => toggle(o.value)} type="button">
            <div className="wiz-opt-title">{o.title}</div>
          </button>
        ))}
      </div>
    );
  }

  if (id === 'risk') {
    const v = answers.riskCap ?? 2;
    return (
      <div className="wiz-cash-card">
        <div className="wiz-cash-display">{v.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--ink-3)' }}>%</span></div>
        <div className="wiz-cash-hint">of portfolio per single position. Stops out a losing trade automatically.</div>
        <input type="range" className="wiz-cash-slider" min="0.5" max="10" step="0.1"
               value={v} onChange={e => onAnswer('riskCap', parseFloat(e.target.value))} />
        <div className="wiz-cash-ticks"><span>0.5%</span><span>2%</span><span>5%</span><span>10%</span></div>
      </div>
    );
  }

  if (id === 'cash') {
    const stops = [5000, 25000, 100000, 250000, 1000000, 5000000];
    const idx = answers.cash != null ? stops.findIndex(s => s >= answers.cash) : 1;
    const cur = answers.cash ?? 25000;
    return (
      <div className="wiz-cash-card">
        <div className="wiz-cash-display">${(cur / 1000).toFixed(cur >= 1e6 ? 1 : 0)}{cur >= 1e6 ? 'M' : 'k'}</div>
        <div className="wiz-cash-hint">Approximate. Stays on your device.</div>
        <input type="range" className="wiz-cash-slider" min="0" max={stops.length - 1} step="1"
               value={Math.max(0, idx)} onChange={e => onAnswer('cash', stops[parseInt(e.target.value, 10)])} />
        <div className="wiz-cash-ticks">
          {stops.map(s => <span key={s}>${s >= 1e6 ? (s / 1e6) + 'M' : (s / 1000) + 'k'}</span>)}
        </div>
      </div>
    );
  }

  if (id === 'broker') {
    return <BrokerStep answers={answers} onAnswer={onAnswer} />;
  }

  return null;
};

const BrokerStep = ({ answers, onAnswer }) => {
  const [stage, setStage] = React.useState(answers.broker ? 'connecting' : 'pick');
  const [connected, setConnected] = React.useState(false);
  React.useEffect(() => {
    if (stage === 'connecting' && answers.broker) {
      const t = setTimeout(() => setConnected(true), 1300);
      return () => clearTimeout(t);
    }
  }, [stage, answers.broker]);
  const pick = (v) => { onAnswer('broker', v); setStage('connecting'); setConnected(false); };
  return (
    <>
      <div className="wiz-broker-grid">
        {BROKERS.map(b => (
          <button key={b.value} type="button"
                  className={`wiz-broker ${answers.broker === b.value ? 'is-selected' : ''}`}
                  onClick={() => pick(b.value)}>
            <div className="wiz-broker-logo">{b.glyph}</div>
            <div className="wiz-broker-name">{b.name}</div>
            <div className="wiz-broker-sub">{b.sub}</div>
            <span className="wiz-broker-tag">{b.tag}</span>
          </button>
        ))}
      </div>
      {answers.broker && (
        <div className="wiz-connect-card">
          {answers.broker === 'csv' ? (
            <>
              <div className="wiz-connect-row">
                <div className="wiz-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)' }}>
                  <WizIcon d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" /> Drop a CSV here, or click to upload
                </div>
              </div>
              <div className="wiz-connect-status">
                <span className="wiz-dot" /> Demo: positions imported
              </div>
            </>
          ) : (
            <>
              <div className="wiz-connect-row">
                <input className="wiz-input" placeholder="API Key" defaultValue={answers.broker === 'alpaca' ? 'PKDEMO••••••' : 'U•••••42'} />
                <input className="wiz-input" placeholder="Secret" defaultValue="••••••••••" type="password" />
              </div>
              <div className="wiz-connect-status">
                <span className="wiz-dot" /> {connected ? 'Connected · 2 accounts found' : 'Verifying credentials…'}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Inline elaboration editor — a textarea so users can add context to a quick
// option-pick they made earlier. Optional "change answer" toggle reveals the
// original WizStep options for steps where re-picking still makes sense.
const WizNoteEditor = ({ step, answers, onAnswer, onClose }) => {
  const note = answers.notes?.[step.id] || '';
  const [showChange, setShowChange] = React.useState(false);
  const taRef = React.useRef(null);
  React.useEffect(() => {
    // Focus textarea when it opens
    if (taRef.current) {
      taRef.current.focus();
      const len = taRef.current.value.length;
      taRef.current.setSelectionRange(len, len);
    }
  }, []);
  const placeholder = NOTE_PROMPTS[step.id] || 'Add any context that would help us tailor this for you.';
  const canChange = !!NOTE_PROMPTS[step.id] || ['domains', 'knowledge', 'tools', 'risk', 'cash'].includes(step.id);
  return (
    <div className="wiz-note-editor">
      <div className="wiz-note-label">Add detail · optional</div>
      <textarea
        ref={taRef}
        className="wiz-input wiz-textarea"
        placeholder={placeholder}
        value={note}
        onChange={(e) => window.AppStore.setWizardNote(step.id, e.target.value)}
      />
      <div className="wiz-note-foot">
        {canChange && (
          <button type="button" className="wiz-note-change-toggle"
                  onClick={() => setShowChange(v => !v)}>
            {showChange ? '↑ Hide' : '↻ Change answer instead'}
          </button>
        )}
        <button type="button" className="wiz-edit-done" onClick={onClose}>
          ✓ Save
        </button>
      </div>
      {showChange && (
        <div className="wiz-note-change">
          <WizStep step={step} answers={answers} onAnswer={onAnswer} />
        </div>
      )}
    </div>
  );
};
function isStepComplete(step, answers) {
  switch (step.id) {
    case 'skill':     return !!answers.skill;
    case 'goal':      return !!answers.goal;
    case 'horizon':   return !!answers.horizon;
    case 'domains':   return (answers.domains || []).length > 0;
    case 'knowledge': return true; // optional context
    case 'style':     return !!answers.style;
    case 'tools':     return true; // optional
    case 'risk':      return answers.riskCap != null;
    case 'cash':      return answers.cash != null;
    case 'broker':    return !!answers.broker;
    default: return true;
  }
}

// Steps where the answer is a single-pick / simple value — these benefit from
// an "add a freeform elaboration" affordance instead of re-picking.
const NOTE_PROMPTS = {
  skill:   "Tell us a bit more about your background. (e.g. 'Held index funds in my 401k for 5 years, never picked stocks myself')",
  goal:    "What's behind that goal? (e.g. 'Saving for a house in 7 years' or 'Want passive income to supplement my salary')",
  horizon: "Anything specific about your timing? (e.g. 'Big expense in year 4 — flexibility matters')",
  style:   "How do you like to research? Any rules you live by?",
  risk:    "How did you arrive at that number? Any past blowups shape it?",
  cash:    "Any context on the capital? (e.g. 'Half is locked in retirement accounts')",
  broker:  "Anything we should know about the account? (e.g. 'Sub-account for swing trades only')",
};

function summarizeAnswer(stepId, answers) {
  const a = answers;
  switch (stepId) {
    case 'skill': return SKILL_OPTIONS.find(o => o.value === a.skill)?.title;
    case 'goal':  return (
      [...GOAL_OPTIONS, ...GOAL_OPTIONS_SOME, ...GOAL_OPTIONS_PRO]
        .find(o => o.value === a.goal)?.title
    );
    case 'horizon': return (
      [...HORIZON_OPTIONS_BEGINNER, ...HORIZON_OPTIONS_SOME, ...HORIZON_OPTIONS_PRO]
        .find(o => o.value === a.horizon)?.title
    );
    case 'domains': {
      const list = a.domains || [];
      if (!list.length) return '—';
      return `${list.length} ${list.length === 1 ? 'area' : 'areas'} picked`;
    }
    case 'knowledge': {
      const list = a.domains || [];
      if (!list.length) return 'No areas selected';
      return `${list.length} ${list.length === 1 ? 'area' : 'areas'} rated`;
    }
    case 'style': return STYLE_OPTIONS.find(o => o.value === a.style)?.title;
    case 'tools': {
      const t = a.tools || [];
      if (!t.length) return 'Skipped';
      return `${t.length} ${t.length === 1 ? 'tool' : 'tools'} enabled`;
    }
    case 'risk':  return `${(a.riskCap ?? 2).toFixed(1)}% per position`;
    case 'cash':  {
      if (a.cash == null) return '—';
      return a.cash >= 1e6 ? `$${(a.cash / 1e6).toFixed(1)}M` : `$${(a.cash / 1000).toFixed(0)}k`;
    }
    case 'broker': return BROKERS.find(b => b.value === a.broker)?.name;
    default: return '';
  }
}

// Rich detail node shown below the main user-bubble line. Returns null when
// nothing extra is worth showing.
// IMPORTANT: for simple option-pick steps, we only show the freeform note (if
// any) — NOT the option's static subtitle. The subtitle already appeared on
// the option card during selection; repeating it in the sent bubble is noise.
function renderAnswerDetail(stepId, answers) {
  const a = answers;
  const note = a.notes?.[stepId];
  const noteEl = note ? <div className="wiz-detail-note">"{note}"</div> : null;
  switch (stepId) {
    case 'skill':
    case 'goal':
    case 'horizon':
    case 'style':
    case 'broker':
    case 'risk':
    case 'cash':
      return noteEl;
    case 'domains': {
      const list = a.domains || [];
      if (!list.length && !noteEl) return null;
      return (
        <>
          {list.length > 0 && (
            <div className="wiz-chip-row">
              {list.map((d, i) => (
                <span key={d} className="wiz-chip">
                  <span className="wiz-chip-rank">#{i + 1}</span>{d}
                </span>
              ))}
            </div>
          )}
          {noteEl}
        </>
      );
    }
    case 'knowledge': {
      const list = a.domains || [];
      if (!list.length && !noteEl) return null;
      return (
        <>
          {list.length > 0 && (
            <div className="wiz-detail-rows">
              {list.map(d => {
                const k = a.domainNotes?.[d + '/knowledge'] ?? 1;
                const dnote = a.domainNotes?.[d];
                return (
                  <div key={d} className="wiz-detail-row">
                    <div className="wiz-detail-row-head">
                      <span className="wiz-detail-row-name">{d}</span>
                      <span className="wiz-detail-row-tag">{KNOWLEDGE_LEVELS[k]}</span>
                    </div>
                    {dnote && <div className="wiz-detail-row-note">"{dnote}"</div>}
                  </div>
                );
              })}
            </div>
          )}
          {noteEl}
        </>
      );
    }
    case 'tools': {
      const t = a.tools || [];
      if (!t.length && !noteEl) return null;
      return (
        <>
          {t.length > 0 && (
            <div className="wiz-chip-row">
              {t.map(v => {
                const o = TOOL_OPTIONS.find(x => x.value === v);
                return <span key={v} className="wiz-chip">{o?.title || v}</span>;
              })}
            </div>
          )}
          {noteEl}
        </>
      );
    }
    default: return noteEl;
  }
}

// ── Main wizard component ───────────────────────────────────────────────────
const OnboardingWizard = () => {
  const [state, setState] = React.useState(window.AppStore.get());
  React.useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const stageRef = React.useRef(null);
  const [editingStepId, setEditingStepId] = React.useState(null);

  const answers = state.wizardAnswers;
  const steps = React.useMemo(() => buildSteps(answers), [answers.skill]);
  const stepIdx = Math.min(state.wizardStep, steps.length - 1);
  const step = steps[stepIdx];
  const total = steps.length;

  // Auto-scroll to bottom on step change
  React.useEffect(() => {
    if (stageRef.current) {
      stageRef.current.scrollTop = stageRef.current.scrollHeight;
    }
  }, [stepIdx, answers.domains?.length]);

  if (!state.wizardOpen) return null;

  const onAnswer = (k, v) => window.AppStore.setWizardAnswer(k, v);
  const goNext = () => {
    if (stepIdx === total - 1) {
      window.AppStore.completeWizard();
    } else {
      window.AppStore.setWizardStep(stepIdx + 1);
    }
  };
  const goBack = () => stepIdx > 0 && window.AppStore.setWizardStep(stepIdx - 1);
  const skip = () => {
    // Power-skip: choose minimal sensible defaults and complete
    if (!answers.skill) window.AppStore.setWizardAnswer('skill', 'new');
    if (!answers.goal) window.AppStore.setWizardAnswer('goal', 'grow');
    if (!(answers.domains || []).length) window.AppStore.setWizardAnswer('domains', ['Semiconductors', 'AI infrastructure']);
    if (!answers.broker) window.AppStore.setWizardAnswer('broker', 'alpaca');
    setTimeout(() => window.AppStore.completeWizard(), 50);
  };

  const canAdvance = isStepComplete(step, answers);
  const isLast = stepIdx === total - 1;

  // Path label
  const skillLabel = answers.skill === 'new' ? 'Beginner path · ~4 steps'
                    : answers.skill === 'some' ? 'Guided path · ~7 steps'
                    : answers.skill === 'pro' ? 'Pro path · ~10 steps'
                    : 'Adapting…';

  return (
    <div className="wiz-root">
      <div className="wiz-noise" />
      <div className="wiz-head">
        <div className="wiz-mark">
          <div className="wiz-mark-glyph">✦</div>
          <div>
            <div className="wiz-mark-eyebrow">First-run setup</div>
            <div>Let's tune FrieNi to how you trade</div>
          </div>
        </div>
        <div className="wiz-counter">
          <span>{skillLabel}</span>
          <button className="wiz-skip" onClick={skip}>Skip with smart defaults →</button>
        </div>
      </div>

      <div className="wiz-stage" ref={stageRef}>
        <div className="wiz-thread">
          {/* Replay prior answered steps as conversation */}
          {steps.slice(0, stepIdx).map((s, i) => {
            const isEditing = editingStepId === s.id;
            return (
              <React.Fragment key={s.id + '-' + i}>
                <Bubble from="bot" sub={s.sub}>{s.prompt}</Bubble>
                <Bubble
                  from="user"
                  editable
                  isEditing={isEditing}
                  hasNote={!!answers.notes?.[s.id]}
                  onEdit={() => setEditingStepId(isEditing ? null : s.id)}
                  detail={!isEditing && renderAnswerDetail(s.id, answers)}
                >
                  {summarizeAnswer(s.id, answers) || '—'}
                </Bubble>
                {isEditing && (
                  <div className="wiz-answer-area wiz-answer-area-edit">
                    <WizNoteEditor
                      step={s}
                      answers={answers}
                      onAnswer={onAnswer}
                      onClose={() => setEditingStepId(null)}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Active question */}
          {step && (
            <>
              <Bubble from="bot" isQuestion sub={step.sub}>{step.prompt}</Bubble>
              <div className="wiz-answer-area">
                <WizStep step={step} answers={answers} onAnswer={onAnswer} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="wiz-foot">
        <button className="wiz-back" onClick={goBack} disabled={stepIdx === 0}
                style={{ visibility: stepIdx === 0 ? 'hidden' : 'visible' }}>← Back</button>
        <div className="wiz-progress">
          <div className="wiz-progress-fill" style={{ width: `${((stepIdx + (canAdvance ? 1 : 0.4)) / total) * 100}%` }} />
        </div>
        <div className="wiz-foot-meta">
          <span>Step <b>{stepIdx + 1}</b> / {total}</span>
        </div>
        <button className="wiz-cta" onClick={goNext} disabled={!canAdvance}>
          {isLast ? 'Finish & analyze →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

window.OnboardingWizard = OnboardingWizard;
