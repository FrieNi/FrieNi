// Onboarding chat flow

const ONBOARDING_STEPS_BASE = [
  {
    id: 'welcome',
    msg: "Welcome. I'm FrieNi — your portfolio's second brain. Before we start, I'll ask a few questions so I tailor everything to you.",
    msg2: "First — how would you describe your experience with markets?",
    choices: ['Just getting started', 'Some experience, hobbyist', 'Pro / advanced', 'I trade for a living'],
    key: 'experience',
  },
  {
    id: 'style',
    msg: "Good to know. And what kind of trader are you most of the time?",
    choices: ['Long-term investor', 'Swing trader (weeks)', 'Day trader', 'Mix — depends on the setup'],
    key: 'style',
  },
  {
    id: 'goal',
    msg: "What are you trying to achieve right now?",
    choices: ['Grow wealth steadily', 'Beat the market', 'Generate income', 'Aggressive growth, max upside'],
    key: 'goal',
  },
  {
    id: 'risk',
    msg: "How do you feel about drawdowns? Real talk — when your portfolio drops 25%, what do you do?",
    choices: ['Sell, lock in losses', 'Hold and ride it out', 'Hold and add more', 'Depends on what dropped'],
    key: 'risk',
  },
  {
    id: 'horizon',
    msg: "Time horizon for most of your capital?",
    choices: ['< 1 year', '1–3 years', '3–10 years', '10+ years / retirement'],
    key: 'horizon',
  },
];

const ONBOARDING_STEPS_PRO = [
  {
    id: 'sizing',
    msg: "Position sizing approach?",
    choices: ['Equal weight', 'Conviction-weighted', 'Kelly / risk parity', 'Manual per trade'],
    key: 'sizing',
  },
  {
    id: 'derivs',
    msg: "Options or other derivatives in the mix?",
    choices: ['No, equities only', 'Covered calls / cash-secured puts', 'Spreads and verticals', 'Yes, including naked positions'],
    key: 'derivs',
  },
  {
    id: 'backtesting',
    msg: "Do you backtest strategies before deploying?",
    choices: ['Always, with my own tooling', 'Sometimes', 'Rarely / vibe-based', "Never"],
    key: 'backtesting',
  },
];

function OnboardingFlow({ onComplete, onClose, animMult }) {
  const [history, setHistory] = React.useState([]); // [{role, content, stepKey?, choice?, note?}]
  const [stepIdx, setStepIdx] = React.useState(0);
  const [pendingSteps, setPendingSteps] = React.useState(ONBOARDING_STEPS_BASE);
  const [typing, setTyping] = React.useState(false);
  const [stage, setStage] = React.useState('hero'); // hero | chat | broker | importing | done
  const [answers, setAnswers] = React.useState({});
  const [editingIdx, setEditingIdx] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [importPicked, setImportPicked] = React.useState(null);
  const [importProgress, setImportProgress] = React.useState(0);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, typing, stage]);

  React.useEffect(() => {
    // start with hero, then auto-advance to first question
    if (stage !== 'hero') return;
    const t = setTimeout(() => {
      setStage('chat');
      askNext(0, pendingSteps);
    }, 1400 * animMult);
    return () => clearTimeout(t);
  }, [stage, animMult]);

  function askNext(idx, steps) {
    const step = steps[idx];
    if (!step) {
      // Done with questions, go to broker step
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setHistory(h => [...h, { role: 'app', content: "Last step. Connect a broker or import a CSV so I can analyze your real portfolio." }]);
        setStage('broker');
      }, 1100 * animMult);
      return;
    }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setHistory(h => [
        ...h,
        { role: 'app', content: step.msg },
        ...(step.msg2 ? [{ role: 'app', content: step.msg2 }] : []),
        { role: 'choices', stepIdx: idx, stepKey: step.key, choices: step.choices }
      ]);
    }, 900 * animMult);
  }

  function handleChoice(choice, stepKey, idx) {
    const step = pendingSteps[idx];
    const newAnswers = { ...answers, [stepKey]: choice };
    setAnswers(newAnswers);

    // Replace choices entry with user bubble
    setHistory(h => h.map(item =>
      item.role === 'choices' && item.stepIdx === idx
        ? { role: 'user', content: choice, stepKey, idx }
        : item
    ));

    // If first question is experience and pro, extend steps with PRO additions before sizing question
    let steps = pendingSteps;
    if (stepKey === 'experience') {
      const isPro = choice === 'Pro / advanced' || choice === 'I trade for a living';
      if (isPro && pendingSteps.length === ONBOARDING_STEPS_BASE.length) {
        steps = [...ONBOARDING_STEPS_BASE, ...ONBOARDING_STEPS_PRO];
        setPendingSteps(steps);
      }
    }

    const next = idx + 1;
    setStepIdx(next);
    askNext(next, steps);
  }

  function goBack(idx) {
    // Remove all bubbles at or after this user reply, re-ask
    const cutIdx = history.findIndex(h => h.role === 'user' && h.idx === idx);
    if (cutIdx === -1) return;
    setHistory(history.slice(0, cutIdx).filter(h => h.role !== 'choices'));
    setStepIdx(idx);
    askNext(idx, pendingSteps);
  }

  function startEdit(idx, currentNote = '') {
    setEditingIdx(idx);
    setEditText(currentNote);
  }

  function saveEdit(idx) {
    setHistory(h => h.map(item =>
      item.role === 'user' && item.idx === idx
        ? { ...item, note: editText.trim() }
        : item
    ));
    setEditingIdx(null);
    setEditText('');
  }

  function pickBroker(b) {
    setImportPicked(b);
    setHistory(h => [...h, {
      role: 'user',
      content: b === 'ibkr' ? 'Connect Interactive Brokers' : b === 'alpaca' ? 'Connect Alpaca' : 'Import a CSV',
      stepKey: 'broker',
      idx: -1,
    }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setHistory(h => [...h, { role: 'app', content: "Authenticating… this normally takes a few seconds." }]);
      // simulate progress
      let p = 0;
      const tick = () => {
        p += Math.random() * 14 + 4;
        setImportProgress(Math.min(100, p));
        if (p < 100) setTimeout(tick, 180 * animMult);
        else {
          setTimeout(() => {
            setHistory(h => [...h, { role: 'app', content: "Connected. I found 12 positions across 3 portfolios. Crunching them now." }]);
            setTimeout(() => onComplete(answers), 900 * animMult);
          }, 400 * animMult);
        }
      };
      setTimeout(tick, 700 * animMult);
    }, 800 * animMult);
  }

  // progress: how many questions answered / total + broker step
  const progress = Math.min(100, (Object.keys(answers).length / (pendingSteps.length + 1)) * 100);

  return (
    <div className="onboarding-overlay">
      <div className="progress"><div className="fill" style={{width: progress + '%'}} /></div>
      <button className="icon-btn onboarding-close" onClick={onClose}>
        <Icon name="x" size={16} />
      </button>

      <div className="onboarding-stage" ref={scrollRef}>
        {stage === 'hero' || history.length > 0 ? (
          <div className="onboarding-hero">
            <div className="mark">f</div>
            <h1>Let's set up your <span className="accent">edge</span>.</h1>
            <p>A short chat to understand how you trade — then we'll connect your portfolio and start analyzing.</p>
          </div>
        ) : null}

        {history.map((item, i) => {
          if (item.role === 'app') {
            return <div key={i} className="bubble ai">{item.content}</div>;
          }
          if (item.role === 'choices') {
            return (
              <div key={i} className="choices">
                {item.choices.map(c => (
                  <button key={c} className="choice" onClick={() => handleChoice(c, item.stepKey, item.stepIdx)}>
                    {c}
                  </button>
                ))}
              </div>
            );
          }
          if (item.role === 'user') {
            const isEditing = editingIdx === item.idx;
            return (
              <React.Fragment key={i}>
                <div className="bubble user">
                  {item.content}
                  {item.note && !isEditing && <span className="edit-note">{item.note}</span>}
                  {isEditing && (
                    <div style={{display:'flex', gap: 6, marginTop: 8}}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(item.idx)}
                        placeholder="Add nuance…"
                        style={{
                          flex: 1, background: 'oklch(1 0 0 / 0.18)', color: 'inherit',
                          border: 'none', outline: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 13,
                        }}
                      />
                      <button onClick={() => saveEdit(item.idx)} style={{
                        background: 'oklch(1 0 0 / 0.25)', color: 'inherit',
                        borderRadius: 8, padding: '4px 10px', fontSize: 12,
                      }}>Save</button>
                    </div>
                  )}
                </div>
                {item.idx >= 0 && (
                  <div className="bubble user-actions">
                    <button onClick={() => goBack(item.idx)}><Icon name="refresh" size={11} /> Change</button>
                    <button onClick={() => startEdit(item.idx, item.note)}>
                      <Icon name="edit" size={11} /> {item.note ? 'Edit note' : 'Add note'}
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          }
          return null;
        })}

        {typing && (
          <div className="typing"><span /><span /><span /></div>
        )}

        {stage === 'broker' && !importPicked && (
          <div className="broker-grid">
            <button className="broker-card ibkr" onClick={() => pickBroker('ibkr')}>
              <div className="logo">IB</div>
              <h4>Interactive Brokers</h4>
              <p>OAuth · read-only positions</p>
            </button>
            <button className="broker-card alpaca" onClick={() => pickBroker('alpaca')}>
              <div className="logo">α</div>
              <h4>Alpaca</h4>
              <p>API key · paper or live</p>
            </button>
            <button className="broker-card csv" onClick={() => pickBroker('csv')}>
              <div className="logo"><Icon name="upload" size={13} /></div>
              <h4>Import CSV</h4>
              <p>Drag-and-drop or paste</p>
            </button>
          </div>
        )}

        {importPicked && importProgress > 0 && (
          <div className="bubble ai" style={{maxWidth: '100%', alignSelf:'stretch', padding: 14}}>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10, fontSize: 12.5, color:'var(--text-2)'}}>
              <div className="skel" style={{width: 22, height: 22, borderRadius: 6}}></div>
              <span>{importPicked === 'ibkr' ? 'Interactive Brokers' : importPicked === 'alpaca' ? 'Alpaca' : 'CSV'} · syncing positions</span>
              <span className="mono" style={{marginLeft: 'auto'}}>{Math.round(importProgress)}%</span>
            </div>
            <div className="analysis-prog" style={{marginBottom: 0}}>
              <div className="fill" style={{width: importProgress + '%'}} />
            </div>
          </div>
        )}
      </div>

      {stage === 'chat' && !typing && (
        <div className="onboarding-bottom">
          <form
            className="onboarding-input"
            onSubmit={e => {
              e.preventDefault();
              const v = e.target.elements.q.value;
              if (!v.trim()) return;
              // freeform fallback — treat as 'Other'
              const step = pendingSteps[stepIdx];
              if (step) handleChoice(v, step.key, stepIdx);
              e.target.reset();
            }}
          >
            <input name="q" placeholder="Or type your own answer…" autoComplete="off" />
            <button type="submit" className="send-btn"><Icon name="send" size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

window.OnboardingFlow = OnboardingFlow;
