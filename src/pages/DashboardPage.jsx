// Mode toggle — flips the dashboard between Pro (full workstation) and Zen (single recommendation)
const DashboardModeToggle = ({ mode, onChange }) => (
  <div className="mode-toggle" role="tablist" aria-label="Dashboard mode">
    <button
      className={`mode-toggle-btn ${mode === 'pro' ? 'active' : ''}`}
      role="tab"
      aria-selected={mode === 'pro'}
      onClick={() => onChange('pro')}
      title="Full workstation: KPIs, charts, watchlist, news"
    >
      <span className="mode-toggle-glyph" aria-hidden="true">▦</span>
      <span>Pro</span>
    </button>
    <button
      className={`mode-toggle-btn ${mode === 'zen' ? 'active' : ''}`}
      role="tab"
      aria-selected={mode === 'zen'}
      onClick={() => onChange('zen')}
      title="One recommendation, based on your portfolio and risk policy"
    >
      <span className="mode-toggle-glyph" aria-hidden="true">◯</span>
      <span>Zen</span>
    </button>
  </div>
);

// Dashboard page — modular widget grid with edit mode, or zen single-card view
const DashboardPage = () => {
  const [state, setState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const [picker, setPicker] = useState(false);

  // Zen mode — minimal head + ZenDashboard body
  if (state.dashboardMode === 'zen') {
    const Zen = window.ZenDashboard;
    return (
      <div>
        <div className="zen-page-head">
          <div className="page-title">Good morning, Elena</div>
          <DashboardModeToggle
            mode={state.dashboardMode}
            onChange={(m) => window.AppStore.setDashboardMode(m)}
          />
        </div>
        {Zen ? <Zen /> : null}
      </div>
    );
  }

  return (
    <div>
      {window.AnalysisBanner && <AnalysisBanner />}
      <div className="page-head">
        <div>
          <div className="page-title">Good morning, Elena</div>
          <div className="page-sub">
            Markets opened mixed · S&P +0.32% · 2 alerts triggered overnight · Portfolio +$1,284 today
          </div>
        </div>
        <div className="row row-gap-2">
          <DashboardModeToggle
            mode={state.dashboardMode}
            onChange={(m) => window.AppStore.setDashboardMode(m)}
          />
          {state.editingDashboard && (
            <button
              className={`snap-toggle ${state.snapEnabled ? 'snap-on' : ''}`}
              onClick={() => window.AppStore.toggleSnap()}
              title={state.snapEnabled ? 'Snapping on — heights step in row increments' : 'Free resize — drag to any height'}
            >
              <span className="snap-icon" aria-hidden="true">
                <span /><span /><span /><span />
              </span>
              <span>Snap to grid</span>
              <span className={`snap-pip ${state.snapEnabled ? 'on' : 'off'}`}>{state.snapEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setPicker(true)}>+ Add widget</Button>
          <Button
            variant={state.editingDashboard ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => window.AppStore.toggleEditDashboard()}
          >
            {state.editingDashboard ? 'Done' : 'Edit layout'}
          </Button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Portfolio Value</div>
          <div className="kpi-value">$418,294</div>
          <div className="kpi-foot"><Delta value={1284} pct={0.31} /><span>today</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Buying Power</div>
          <div className="kpi-value">$24,820</div>
          <div className="kpi-foot"><span>2 pending orders</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Day P&L</div>
          <div className="kpi-value gain">+$1,284</div>
          <div className="kpi-foot"><Delta value={1284} pct={0.31} /><span>realized $0</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Risk · 1d 95% VaR</div>
          <div className="kpi-value">$8,420</div>
          <div className="kpi-foot"><span style={{ color: 'var(--warn)' }}>elevated · concentration NVDA</span></div>
        </div>
      </div>

      <div className="dash-grid">
        {state.dashboardWidgets.map(w => {
          const Cmp = window.WIDGET_CATALOG[w.type]?.component;
          if (!Cmp) return null;
          const span = w.span || 1;
          return (
            <div key={w.id} className="dash-cell" style={{ gridColumn: `span ${span}` }}>
              <Cmp
                symbol={w.symbol}
                span={span}
                height={w.height}
                editing={state.editingDashboard}
                onRemove={() => window.AppStore.removeWidget(w.id)}
                onMove={(dir) => window.AppStore.reorderWidget(w.id, dir)}
                onSpan={(s) => window.AppStore.setWidgetSpan(w.id, s)}
                onHeight={(h) => window.AppStore.setWidgetHeight(w.id, h)}
                snap={state.snapEnabled} />
            </div>
          );
        })}
        {state.editingDashboard && (
          <button className="widget-add-btn" style={{ gridColumn: 'span 3' }} onClick={() => setPicker(true)}>+ Add widget</button>
        )}
      </div>

      {picker && (
        <div className="widget-picker" onClick={() => setPicker(false)}>
          <div className="widget-picker-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Add a widget</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Pick a module — you can resize it after.</div>
            <div className="widget-options">
              {Object.entries(window.WIDGET_CATALOG).map(([id, w]) => (
                <div key={id} className="widget-option" onClick={() => {
                  window.AppStore.addWidget(id, w.defaultSpan || 1);
                  setPicker(false);
                }}>
                  <div className="widget-option-name">{w.name}</div>
                  <div className="widget-option-desc">{w.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.DashboardPage = DashboardPage;
