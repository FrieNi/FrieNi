// Zen mode — single recommendation card based on the user's portfolio + risk policy.
// Four scenarios: calm (nothing to do), improvement, warning, blackswan.

const ZEN_SCENARIOS = {
  calm: {
    eyebrow: 'Nothing to do today',
    glyph: '◯',
    tone: 'calm',
    title: 'Your plan is on track.',
    body: 'No drift beyond your tolerances, no triggered alerts, no earnings or macro events on your watchlist before next Tuesday. The market is open — you don\'t need to be.',
    metrics: [
      { label: 'Portfolio drift', value: '0.4%', sub: 'within ±2.0% band',
        track: { kind: 'band', min: 0, max: 2.0, current: 0.4, status: 'ok',
                 ticks: [{ at: 2.0, label: 'limit' }] } },
      { label: 'Cash', value: '5.9%', sub: 'target 4–8%',
        track: { kind: 'range', min: 0, max: 12, lo: 4, hi: 8, current: 5.9, status: 'ok' } },
      { label: 'Open alerts', value: '0', sub: 'none triggered',
        pill: { kind: 'ok', text: 'All clear' } },
      { label: 'Events ≤ 7d', value: 'None', sub: 'next: MSFT earn. May 14',
        pill: { kind: 'muted', text: '7 calm days' } },
    ],
    actions: [
      { label: 'Review weekly digest', kind: 'ghost', onClick: () => window.AppStore.setPage('digest') },
      { label: 'Snooze until Monday', kind: 'ghost' },
    ],
    rationale: [
      'All positions sized within your 25% per-name and 35% per-sector caps.',
      'Day P&L (+$1,284) is well inside one standard deviation of your 30-day range.',
      'No news flagged \u201chigh impact\u201d on your watchlist since yesterday close.',
    ],
  },

  improvement: {
    eyebrow: 'One opportunity',
    glyph: '↗',
    tone: 'improvement',
    title: 'Trim NVDA back to your 12% target.',
    body: 'NVDA has run to 18.4% of the portfolio — above your 15% concentration cap. Trimming ~$26,800 brings it to your stated 12% target and frees buying power you wanted to redeploy into the Treasuries ladder.',
    metrics: [
      { label: 'NVDA weight', value: '18.4%', sub: 'cap 15% · target 12%', lead: true,
        track: { kind: 'band', min: 0, max: 22, current: 18.4, status: 'breach',
                 ticks: [{ at: 12 }, { at: 15, label: 'cap' }] } },
      { label: 'Suggested trim', value: '$26,800', sub: '~58 sh @ 462.10',
        pill: { kind: 'brand', text: 'Sell · limit · day' } },
      { label: 'Tax lot', value: 'LT gain', sub: 'long-term · est. $4.1k',
        pill: { kind: 'ok', text: 'Tax-efficient' } },
      { label: 'After trim', value: '12.1%', sub: 'on target · cap 15%',
        track: { kind: 'band', min: 0, max: 22, current: 12.1, status: 'ok',
                 ticks: [{ at: 12, label: 'target' }] } },
    ],
    actions: [
      { label: 'Review trim ticket', kind: 'primary', onClick: () => {
        // Open the trim ticket via the central ticketing system.
        const t = window.TicketStore.list({ status: 'open', kind: 'trim' })[0];
        if (t) {
          window.TicketStore.setActive(t.id);
          window.AppStore.setPage('tickets');
        } else {
          // No open trim ticket — Zen creates one and routes to it.
          window.TicketStore.openOrCreate({
            kind: 'trim',
            priority: 'normal',
            source: { module: 'zen', ref: 'zen-improvement-2026-05-07', label: 'Zen recommendation' },
            subject: 'Trim NVDA · 58 sh',
            summary: 'Bring NVDA to 12% target weight; route ~$26.8k to T-bill ladder.',
            payload: {
              symbol: 'NVDA', side: 'sell', shares: 58, totalShares: 314,
              limitPx: 462.10, orderType: 'limit', tif: 'day', destSleeve: 'tbill',
              weightBefore: 18.4, weightTarget: 12, weightCap: 15, cashBefore: 5.9,
            },
          });
          window.AppStore.setPage('tickets');
        }
      } },
      { label: 'Snooze 1 day', kind: 'ghost' },
      { label: 'Dismiss', kind: 'ghost' },
    ],
    rationale: [
      'Your risk policy caps single-name exposure at 15%; NVDA crossed that on May 5.',
      'Long-term lots available — short-term lots are <1% of the position.',
      'Cash target is 4–8%; trimming brings cash to 6.4% before redeployment.',
    ],
  },

  warning: {
    eyebrow: 'Heads up — review today',
    glyph: '!',
    tone: 'warning',
    title: 'Your portfolio is concentrated in semis going into a CPI print.',
    body: 'Tomorrow at 8:30 ET, April CPI lands. 34% of the book is in semiconductors (NVDA, AVGO, AMD), a sector with elevated implied moves on macro prints. Your stated risk tolerance is moderate — this is sitting at the high end of it.',
    metrics: [
      { label: 'Semis weight', value: '34%', sub: 'cap 25%', lead: true,
        track: { kind: 'band', min: 0, max: 40, current: 34, status: 'breach',
                 ticks: [{ at: 25, label: 'cap' }] } },
      { label: 'Implied 1d move', value: '±2.1%', sub: 'sector basket',
        track: { kind: 'spread', min: -3, max: 3, lo: -2.1, hi: 2.1, status: 'warn' } },
      { label: 'Headline risk', value: 'CPI', sub: 'tomorrow · 8:30 ET',
        pill: { kind: 'warn', text: 'In 18 hours', countdown: true } },
      { label: 'Hedge cost', value: '$340', sub: '0.08% of NAV',
        pill: { kind: 'brand', text: 'SOXX puts · defined risk' } },
    ],
    actions: [
      { label: 'Review hedge ticket', kind: 'primary', onClick: () => {
        const existing = window.TicketStore.list({ kind: 'hedge' }).find(t => t.status === 'open' || t.status === 'snoozed');
        if (existing) {
          window.TicketStore.setActive(existing.id);
          window.AppStore.setPage('tickets');
        } else {
          window.TicketStore.openOrCreate({
            kind: 'hedge',
            priority: 'high',
            source: { module: 'zen', ref: 'zen-warning-2026-05-07-semis-cpi', label: 'Zen recommendation' },
            subject: 'SOXX put hedge · semis into CPI',
            summary: 'Defined-risk hedge on 34% semis exposure ahead of tomorrow 8:30 ET CPI print.',
            payload: { symbol: 'SOXX', notional: 142000, premium: 340, navPct: 0.08 },
          });
          window.AppStore.setPage('tickets');
        }
      } },
      { label: 'Trim semis to 25%', kind: 'secondary', onClick: () => {
        window.TicketStore.openOrCreate({
          kind: 'rebalance',
          priority: 'high',
          source: { module: 'zen', ref: 'zen-warning-2026-05-07-semis-trim', label: 'Zen recommendation' },
          subject: 'Trim semis sleeve to 25% cap',
          summary: 'Bring semiconductor exposure (NVDA, AVGO, AMD) from 34% back to your 25% sector cap.',
          payload: { sector: 'Semiconductors', currentWeight: 34, capWeight: 25, holdings: ['NVDA', 'AVGO', 'AMD'] },
        });
        window.AppStore.setPage('tickets');
      } },
      { label: 'Accept risk', kind: 'ghost' },
    ],
    rationale: [
      'Sector concentration cap (25%) breached on May 4 with the AVGO add.',
      'Last three CPI prints produced ±1.8% same-day moves in semis on average.',
      'Your policy allows defined-risk hedges up to 0.5% of NAV per event.',
    ],
  },

  blackswan: {
    eyebrow: 'Critical — act now',
    glyph: '⚠',
    tone: 'blackswan',
    title: 'A black swan scenario is unfolding. Your downside today could exceed $52k.',
    body: 'Pre-market futures are down 6.8% on overnight news. Your portfolio is positioned long-only, no hedges, with 34% in semis and 18% in NVDA alone. A 1-day 99% VaR estimate is $52,400 (12.5% of NAV) — well past your stated worst-case tolerance of 8%.',
    metrics: [
      { label: '1d 99% VaR', value: '$52,400', sub: 'policy limit $33,400', lead: true,
        track: { kind: 'band', min: 0, max: 60000, current: 52400, status: 'breach',
                 ticks: [{ at: 33400, label: 'limit' }],
                 valueFormat: 'usd-k' } },
      { label: 'Futures', value: '−6.8%', sub: 'ES_F · pre-mkt',
        track: { kind: 'delta', min: -8, max: 2, current: -6.8, status: 'breach' } },
      { label: 'Hedges', value: 'None', sub: 'portfolio is unprotected',
        pill: { kind: 'danger', text: 'No downside coverage' } },
      { label: 'Liquidation', value: '~12 min', sub: 'all positions · MOO',
        pill: { kind: 'muted', text: 'Liquidity normal' } },
    ],
    actions: [
      { label: 'Open emergency hedge', kind: 'danger' },
      { label: 'Reduce gross exposure 50%', kind: 'secondary' },
      { label: 'Hold — accept full risk', kind: 'ghost' },
    ],
    rationale: [
      'Overnight news (geopolitical, AI export ban) historically drives 5–10% gap-down opens.',
      'Your policy requires hedge or de-risk action when 1d VaR exceeds 8% of NAV.',
      'Markets open in 47 minutes. Liquidity is normal in your top 10 positions.',
    ],
  },
};

const ZEN_SCENARIO_OPTIONS = [
  { id: 'calm', label: 'Nothing to do' },
  { id: 'improvement', label: 'Improvement' },
  { id: 'warning', label: 'Warning' },
  { id: 'blackswan', label: 'Black swan' },
];

// ── Inline gauge / pill primitives for zen metrics ───────────────
// A metric can carry an optional `track` (numeric, with reference points) or
// `pill` (categorical status). When neither is present the cell falls back to
// the bare label/value/sub layout.

const pct = (v, min, max) => {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
};

const ZenTrack = ({ track }) => {
  const status = track.status || 'ok';

  if (track.kind === 'band') {
    // Single current marker on a [min, max] track, with reference ticks.
    const cur = pct(track.current, track.min, track.max);
    return (
      <div className={`zt zt-band zt-${status}`}>
        <div className="zt-rail">
          {(track.ticks || []).map((t, i) => {
            const at = pct(t.at, track.min, track.max);
            return (
              <div key={i} className="zt-tick" style={{ left: `${at}%` }}>
                {t.label && <span className="zt-tick-label">{t.label}</span>}
              </div>
            );
          })}
          <div className="zt-fill" style={{ width: `${cur}%` }} />
          <div className="zt-marker" style={{ left: `${cur}%` }} />
        </div>
      </div>
    );
  }

  if (track.kind === 'range') {
    // Acceptable [lo, hi] window on a [min, max] axis, with current dot.
    const lo = pct(track.lo, track.min, track.max);
    const hi = pct(track.hi, track.min, track.max);
    const cur = pct(track.current, track.min, track.max);
    const inside = track.current >= track.lo && track.current <= track.hi;
    return (
      <div className={`zt zt-range zt-${inside ? 'ok' : 'warn'}`}>
        <div className="zt-rail">
          <div className="zt-window" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
          <div className="zt-marker" style={{ left: `${cur}%` }} />
        </div>
      </div>
    );
  }

  if (track.kind === 'spread') {
    // Symmetric implied move shown as a centered band on a signed axis.
    const lo = pct(track.lo, track.min, track.max);
    const hi = pct(track.hi, track.min, track.max);
    const zero = pct(0, track.min, track.max);
    return (
      <div className={`zt zt-spread zt-${status}`}>
        <div className="zt-rail">
          <div className="zt-axis" style={{ left: `${zero}%` }} />
          <div className="zt-window" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        </div>
      </div>
    );
  }

  if (track.kind === 'delta') {
    // Signed move with zero baseline. Fills from 0 to current (left or right).
    const cur = pct(track.current, track.min, track.max);
    const zero = pct(0, track.min, track.max);
    const left = Math.min(cur, zero);
    const width = Math.abs(cur - zero);
    return (
      <div className={`zt zt-delta zt-${status}`}>
        <div className="zt-rail">
          <div className="zt-axis" style={{ left: `${zero}%` }} />
          <div className="zt-fill" style={{ left: `${left}%`, width: `${width}%` }} />
          <div className="zt-marker" style={{ left: `${cur}%` }} />
        </div>
      </div>
    );
  }

  return null;
};

const ZenPill = ({ pill }) => (
  <div className={`zen-pill zen-pill-${pill.kind}`}>
    {pill.countdown && <span className="zen-pill-pulse" aria-hidden="true" />}
    <span>{pill.text}</span>
  </div>
);

const ZenMetric = ({ metric: m }) => (
  <div className={`zen-metric${m.lead ? ' zen-metric-lead' : ''}`}>
    <div className="zen-metric-label">{m.label}</div>
    <div className="zen-metric-value">{m.value}</div>
    {m.track && <ZenTrack track={m.track} />}
    {m.pill && <ZenPill pill={m.pill} />}
    <div className="zen-metric-sub">{m.sub}</div>
  </div>
);

const ZenDashboard = () => {
  const [state, setState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const s = ZEN_SCENARIOS[state.zenScenario] || ZEN_SCENARIOS.calm;

  return (
    <div className={`zen-shell zen-${s.tone}`}>
      <div className="zen-stage">
        <div className="zen-eyebrow">
          <span className="zen-eyebrow-dot" />
          <span>{s.eyebrow}</span>
          <span className="zen-eyebrow-time">· 8:42 ET, May 7</span>
        </div>

        <div className="zen-headline">
          <div className="zen-glyph" aria-hidden="true">{s.glyph}</div>
          <h1 className="zen-title">{s.title}</h1>
        </div>

        <p className="zen-body">{s.body}</p>

        <div className="zen-metrics" role="group" aria-label="Decision metrics">
          {s.metrics.map((m, i) => (
            <ZenMetric key={i} metric={m} tone={s.tone} />
          ))}
        </div>

        <div className="zen-actions">
          {s.actions.map((a, i) => (
            <button key={i} className={`zen-btn zen-btn-${a.kind}`} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>

        <details className="zen-rationale">
          <summary>Why FrieNi is showing you this</summary>
          <ul>
            {s.rationale.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </details>
      </div>

      <div className="zen-foot">
        <div className="zen-foot-item">
          <span className="zen-foot-label">Portfolio</span>
          <span className="zen-foot-value">$418,294</span>
        </div>
        <div className="zen-foot-divider" />
        <div className="zen-foot-item">
          <span className="zen-foot-label">Day</span>
          <span className="zen-foot-value gain">+$1,284</span>
        </div>
        <div className="zen-foot-divider" />
        <div className="zen-foot-item">
          <span className="zen-foot-label">Risk policy</span>
          <span className="zen-foot-value">Moderate</span>
        </div>
        <div className="zen-foot-spacer" />
        <button
          className="zen-foot-link"
          onClick={() => window.AppStore.setDashboardMode('pro')}>
          Open full workstation →
        </button>
      </div>
    </div>
  );
};

window.ZenDashboard = ZenDashboard;
window.ZEN_SCENARIO_OPTIONS = ZEN_SCENARIO_OPTIONS;
