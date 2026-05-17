// AnalysisBanner — persistent banner on dashboard while/after analysis runs.
// AnalysisSheet — drill-down with portfolio metrics, domain stances, actions, positions.

const AnalysisBanner = () => {
  const [state, setState] = React.useState(window.AppStore.get());
  React.useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const a = state.analysis;
  if (!a) return null;
  const ws = (state.workspaces || []).find(w => w.id === state.activeWorkspace);
  const wsName = ws ? ws.name : 'Portfolio';
  const isDone = a.status === 'done';
  const C = 2 * Math.PI * 16; // circumference
  const pct = isDone ? 100 : Math.max(0, Math.min(100, a.progress));
  const offset = C * (1 - pct / 100);

  return (
    <div className={`an-banner ${isDone ? 'done' : ''}`}>
      <div className="an-banner-spinner">
        <svg viewBox="0 0 40 40">
          <circle className="ring" cx="20" cy="20" r="16" />
          <circle className="arc" cx="20" cy="20" r="16"
                  strokeDasharray={C}
                  strokeDashoffset={offset}
                  transform="rotate(-90 20 20)" />
        </svg>
        <div className="pip">{Math.round(pct)}</div>
      </div>
      <div className="an-banner-meta">
        <div className="an-banner-title">
          {isDone
            ? `Analysis ready for ${wsName}`
            : `Analyzing ${wsName}…`}
        </div>
        <div className="an-banner-stage">
          {!isDone && <span className="dot" />}
          {isDone
            ? (a.results?.headline || 'Open the report for full breakdown.')
            : (a.stages?.[a.stage]?.label || 'Working…')}
        </div>
      </div>
      {!isDone && (
        <div className="an-banner-stages">
          {a.stages.map((s, i) => (
            <span key={s.key}
                  className={i < a.stage ? 'done' : i === a.stage ? 'active' : ''}>
              {s.label}
            </span>
          ))}
        </div>
      )}
      <button className="an-banner-cta" onClick={() => window.AppStore.setAnalysisOpen(true)}>
        {isDone ? 'View report' : 'View progress'}
      </button>
    </div>
  );
};

const AnalysisSheet = () => {
  const [state, setState] = React.useState(window.AppStore.get());
  React.useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const onKey = React.useCallback((e) => {
    if (e.key === 'Escape') window.AppStore.setAnalysisOpen(false);
  }, []);
  React.useEffect(() => {
    if (state.analysisOpen) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [state.analysisOpen, onKey]);

  if (!state.analysisOpen) return null;
  const a = state.analysis;
  const ws = (state.workspaces || []).find(w => w.id === state.activeWorkspace);
  const wsName = ws ? ws.name : 'Portfolio';
  const r = a?.results;
  const close = () => window.AppStore.setAnalysisOpen(false);

  const stanceClass = (s) => {
    const t = String(s).toLowerCase();
    if (t.includes('long') || t.includes('add')) return 'long';
    if (t.includes('reduce') || t.includes('trim')) return 'reduce';
    return 'sideways';
  };
  const posClass = (s) => {
    const t = String(s).toLowerCase();
    if (t === 'add') return 'add';
    if (t === 'trim') return 'trim';
    return 'hold';
  };

  return (
    <>
      <div className="an-sheet-back" onClick={close} />
      <div className="an-sheet" role="dialog" aria-label="Portfolio analysis">
        <div className="an-sheet-head">
          <div>
            <div className="an-sheet-eyebrow">Analysis · {wsName}</div>
            <div className="an-sheet-title">
              {a?.status === 'done'
                ? r.headline
                : 'Running analysis…'}
            </div>
          </div>
          <button className="an-sheet-close" onClick={close} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
                 strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8" /></svg>
          </button>
        </div>

        <div className="an-sheet-body">
          {a?.status !== 'done' && (
            <div className="an-banner" style={{ margin: 0 }}>
              <div className="an-banner-spinner">
                <svg viewBox="0 0 40 40">
                  <circle className="ring" cx="20" cy="20" r="16" />
                  <circle className="arc" cx="20" cy="20" r="16"
                          strokeDasharray={2 * Math.PI * 16}
                          strokeDashoffset={(2 * Math.PI * 16) * (1 - (a?.progress || 0) / 100)}
                          transform="rotate(-90 20 20)" />
                </svg>
                <div className="pip">{Math.round(a?.progress || 0)}</div>
              </div>
              <div className="an-banner-meta">
                <div className="an-banner-title">{a?.stages?.[a.stage]?.label || 'Working…'}</div>
                <div className="an-banner-stage">
                  Pulling in your domain context · scoring positions · drafting recommendations.
                </div>
              </div>
            </div>
          )}

          {r && (
            <>
              {/* Portfolio metrics */}
              <div className="an-section">
                <div className="an-section-h">Portfolio at a glance</div>
                <div className="an-metrics">
                  <div className="an-metric">
                    <div className="an-metric-label">Domain fit</div>
                    <div className="an-metric-val">{r.portfolioMetrics.domainFit}<small>/100</small></div>
                    <div className="an-metric-bar"><i style={{ width: r.portfolioMetrics.domainFit + '%' }} /></div>
                  </div>
                  <div className="an-metric">
                    <div className="an-metric-label">Concentration</div>
                    <div className="an-metric-val">{r.portfolioMetrics.concentration}<small>/100</small></div>
                    <div className="an-metric-bar"><i style={{ width: r.portfolioMetrics.concentration + '%', background: 'var(--warn)' }} /></div>
                  </div>
                  <div className="an-metric">
                    <div className="an-metric-label">Risk fit</div>
                    <div className="an-metric-val">{r.portfolioMetrics.riskFit}<small>/100</small></div>
                    <div className="an-metric-bar"><i style={{ width: r.portfolioMetrics.riskFit + '%', background: 'var(--gain)' }} /></div>
                  </div>
                </div>
              </div>

              {/* Domain stances */}
              <div className="an-section">
                <div className="an-section-h">By domain</div>
                {r.domains.map(d => (
                  <div key={d.name} className="an-domain-row">
                    <div className="an-domain-stance" style={{}} >
                      <span className={`an-domain-stance ${stanceClass(d.stance)}`} style={{ padding: '4px 8px' }}>{d.stance}</span>
                    </div>
                    <div className="an-domain-meta">
                      <div className="an-domain-name">{d.name}</div>
                      <div className="an-domain-note">{d.note}</div>
                    </div>
                    <div className="an-domain-conf">conf {(d.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>

              {/* Suggested actions */}
              <div className="an-section">
                <div className="an-section-h">Suggested actions</div>
                {r.actions.map((act, i) => (
                  <div key={i} className="an-action">
                    <span className="an-action-kind">{act.kind}</span>
                    <div className="an-action-meta">
                      <div className="an-action-target">{act.target}</div>
                      <div className="an-action-why">{act.why}</div>
                    </div>
                    <div className="an-action-size">{act.size}</div>
                  </div>
                ))}
              </div>

              {/* Positions drill-down */}
              <div className="an-section">
                <div className="an-section-h">Positions in scope</div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line-soft)', borderRadius: 10, overflow: 'hidden' }}>
                  {r.positions.map(p => (
                    <div key={p.sym} className="an-pos">
                      <div className="an-pos-sym">{p.sym}</div>
                      <div>
                        <div className="an-pos-name">{p.name}</div>
                        <div className="an-pos-note">{p.note}</div>
                      </div>
                      <div style={{ flex: 1 }} />
                      <div className="an-pos-w">{p.weight.toFixed(1)}%</div>
                      <div className="an-pos-stance"><b className={posClass(p.stance)}>{p.stance}</b></div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="an-banner-cta" onClick={() => { window.AppStore.rerunAnalysis(); }}>
                  Re-run analysis
                </button>
                <button className="wiz-back" onClick={close}>Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

window.AnalysisBanner = AnalysisBanner;
window.AnalysisSheet = AnalysisSheet;
