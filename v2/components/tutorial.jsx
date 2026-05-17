// Tutorial overlay — guides the user through populated places

const TUTORIAL_STEPS = [
  {
    selector: '[data-tut="portfolio-agg"]',
    title: 'Your portfolios live here',
    body: "You can have multiple portfolios (Core, Growth, YOLO…) and switch the view between any of them or all at once. Aggressive ones can be excluded from rolled-up analysis.",
    placement: 'right',
  },
  {
    selector: '[data-tut="kpi-row"]',
    title: 'Always start with the summary',
    body: "Four numbers tell you 80% of what you need: market value, total P/L, an overall AI-driven rating, and how well you align with your active strategy.",
    placement: 'bottom',
  },
  {
    selector: '[data-tut="ai-insight"]',
    title: 'AI insights, surfaced',
    body: "FrieNi proactively flags what's worth your attention. One-click jumps you straight to the position or action.",
    placement: 'left',
  },
  {
    selector: '[data-tut="positions"]',
    title: 'Drill into any position',
    body: "Click any row to open per-stock overview, fundamentals, technicals, and sentiment. The three dots show pillar ratings at a glance.",
    placement: 'top',
  },
  {
    selector: '[data-tut="portfolio-actions"]',
    title: 'Run analysis whenever',
    body: "Change a strategy or want a fresh take? Re-run analysis from anywhere — or just ask FrieNi.",
    placement: 'bottom',
  },
];

function Tutorial({ onClose, animMult }) {
  const [step, setStep] = React.useState(0);
  const [rect, setRect] = React.useState(null);

  React.useEffect(() => {
    function compute() {
      const sel = TUTORIAL_STEPS[step].selector;
      const el = document.querySelector(sel);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
      } else {
        setRect(null);
      }
    }
    compute();
    window.addEventListener('resize', compute);
    const interval = setInterval(compute, 200); // catch lazy layouts
    return () => { window.removeEventListener('resize', compute); clearInterval(interval); };
  }, [step]);

  const current = TUTORIAL_STEPS[step];
  if (!rect) return null;

  // place pop card
  const popStyle = {};
  const W = 320;
  const H = 160;
  const gap = 16;
  if (current.placement === 'bottom') {
    popStyle.top = rect.top + rect.height + gap;
    popStyle.left = Math.max(20, Math.min(window.innerWidth - W - 20, rect.left + rect.width / 2 - W / 2));
  } else if (current.placement === 'top') {
    popStyle.top = Math.max(20, rect.top - H - gap);
    popStyle.left = Math.max(20, Math.min(window.innerWidth - W - 20, rect.left + rect.width / 2 - W / 2));
  } else if (current.placement === 'right') {
    popStyle.top = rect.top + rect.height / 2 - H / 2;
    popStyle.left = rect.left + rect.width + gap;
  } else if (current.placement === 'left') {
    popStyle.top = Math.max(20, rect.top + rect.height / 2 - H / 2);
    popStyle.left = Math.max(20, rect.left - W - gap);
  }

  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <>
      <div className="tutorial-backdrop" />
      <div className="tutorial-hole" style={rect} />
      <div className="tutorial-pop" style={popStyle}>
        <div className="step-num">Step {step + 1} of {TUTORIAL_STEPS.length}</div>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <footer>
          <div className="dots">
            {TUTORIAL_STEPS.map((_, i) => <span key={i} className={i === step ? 'active' : ''} />)}
          </div>
          <button className="btn sm ghost" onClick={onClose}>Skip</button>
          {step > 0 && <button className="btn sm" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="btn sm primary" onClick={() => isLast ? onClose() : setStep(step + 1)}>
            {isLast ? 'Got it' : 'Next'}
          </button>
        </footer>
      </div>
    </>
  );
}

function Toast({ toast, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, toast.duration || 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={'toast ' + (toast.type || 'success')}>
      <div className="toast-icon">
        <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={13} />
      </div>
      <div>
        <div style={{fontWeight: 500, fontSize: 13}}>{toast.title}</div>
        {toast.body && <div style={{fontSize: 12, color:'var(--text-3)', marginTop: 2}}>{toast.body}</div>}
      </div>
      <button className="close" onClick={onClose}><Icon name="x" size={12} /></button>
    </div>
  );
}

window.Tutorial = Tutorial;
window.Toast = Toast;
