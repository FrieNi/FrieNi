// WorkspaceSwitcher — left-nav popover. Switching re-scopes the whole app.
// A workspace can hold 1..n portfolios. The portfolio set drives ticket context.

const WorkspaceSwitcher = () => {
  const [state, setState] = React.useState(window.AppStore.get());
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  if (!state.workspaces || state.workspaces.length === 0) return null;
  const active = state.workspaces.find(w => w.id === state.activeWorkspace) || state.workspaces[0];
  const portfolios = state.portfolios || [];
  const inActive = portfolios.filter(p => active.portfolioIds.includes(p.id));
  const totalValue = inActive.reduce((s, p) => s + p.value, 0);
  const glyphFor = (ws) => ws.scope === 'all' ? '◯' : ws.name.slice(0, 2).toUpperCase();

  const hasPortfolios = inActive.length > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Switcher trigger — square bottom corners when portfolio list is attached below */}
      <div
        className="ws-switcher"
        style={hasPortfolios ? { borderRadius: '10px 10px 0 0', borderBottomColor: 'transparent', marginBottom: 0 } : {}}
        onClick={() => setOpen(o => !o)}
      >
        <div className="ws-switcher-glyph">{glyphFor(active)}</div>
        <div className="ws-switcher-meta">
          <div className="ws-switcher-label">Workspace</div>
          <div className="ws-switcher-name">{active.name}</div>
        </div>
        <svg className="ws-switcher-chev" width="14" height="14" viewBox="0 0 20 20" fill="none"
             stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 8l4 4 4-4" />
        </svg>
      </div>

      {/* Popover — workspace picker */}
      {open && (
        <div className="ws-popover">
          <div className="ws-pop-section">Workspaces</div>
          {state.workspaces.map(ws => {
            const ps = portfolios.filter(p => ws.portfolioIds.includes(p.id));
            const v = ps.reduce((s, p) => s + p.value, 0);
            return (
              <div key={ws.id}
                   className={`ws-pop-item ${ws.id === active.id ? 'is-active' : ''}`}
                   onClick={() => { window.AppStore.setActiveWorkspace(ws.id); setOpen(false); }}>
                <div className="ws-pop-glyph">{glyphFor(ws)}</div>
                <div className="ws-pop-name">{ws.name}</div>
                <div className="ws-pop-sub">{ps.length} {ps.length === 1 ? 'pf' : 'pfs'} · ${(v/1000).toFixed(0)}k</div>
              </div>
            );
          })}
          <div className="ws-pop-divider" />
          <div className="ws-pop-create">+ New workspace</div>
        </div>
      )}

      {/* Portfolio sub-list — flush beneath the switcher card */}
      {hasPortfolios && (
        <div className="ws-portfolios">
          {inActive.map(p => (
            <div key={p.id} className="ws-portfolio-row" title={p.broker}>
              <span className="name">{p.name}</span>
              <span className="val">${(p.value/1000).toFixed(0)}k</span>
            </div>
          ))}
          {inActive.length > 1 && (
            <div className="ws-portfolio-row" style={{ borderTop: '1px dashed var(--line-soft)', paddingTop: 4, marginTop: 2 }}>
              <span className="name" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Combined</span>
              <span className="val" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>${(totalValue/1000).toFixed(0)}k</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

window.WorkspaceSwitcher = WorkspaceSwitcher;
