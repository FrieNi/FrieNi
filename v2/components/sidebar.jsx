// Sidebar - left nav with portfolios

function Sidebar({ view, setView, selectedPortfolio, setSelectedPortfolio, portfolios, theme, setTheme, openOnboarding }) {
  const navItems = [
    { id: 'portfolio', label: 'Portfolio', icon: 'briefcase' },
    { id: 'strategies', label: 'Strategies', icon: 'flask' },
    { id: 'watchlist', label: 'Watchlist', icon: 'list', count: 8 },
    { id: 'screener', label: 'Screener', icon: 'filter' },
    { id: 'news', label: 'News', icon: 'newspaper' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">f</span>
        <span>FrieNi</span>
      </div>

      {navItems.map(it => (
        <button
          key={it.id}
          className={'sidebar-item' + (view === it.id ? ' active' : '')}
          onClick={() => setView(it.id)}
        >
          <Icon name={it.icon} size={15} />
          <span>{it.label}</span>
          {it.count && <span className="count">{it.count}</span>}
        </button>
      ))}

      <div className="sidebar-section-label">Portfolios</div>
      <button
        className={'sidebar-portfolio' + (selectedPortfolio === 'all' ? ' active' : '')}
        style={{ '--dot': 'oklch(0.55 0.18 275)' }}
        onClick={() => { setSelectedPortfolio('all'); setView('portfolio'); }}
        data-tut="portfolio-agg"
      >
        <span>All portfolios</span>
        <span className="pl pos">+19.4%</span>
      </button>
      {portfolios.map(p => (
        <button
          key={p.id}
          className={'sidebar-portfolio' + (selectedPortfolio === p.id ? ' active' : '')}
          style={{ '--dot': p.color }}
          onClick={() => { setSelectedPortfolio(p.id); setView('portfolio'); }}
        >
          <span>{p.name}</span>
          {p.excluded && <span className="tag" style={{fontSize: '9.5px'}}>excl</span>}
        </button>
      ))}
      <button className="sidebar-item" style={{color: 'var(--text-3)', marginTop: 2}}>
        <Icon name="plus" size={14} />
        <span style={{fontSize: 12.5}}>New portfolio</span>
      </button>

      <div className="sidebar-section-label">Workspace</div>
      <button className="sidebar-item">
        <Icon name="bell" size={15} />
        <span>Alerts</span>
        <span className="count" style={{background:'var(--bad)', color:'white', borderRadius: '999px', padding: '0 6px'}}>3</span>
      </button>
      <button className="sidebar-item" onClick={openOnboarding}>
        <Icon name="refresh" size={15} />
        <span>Replay onboarding</span>
      </button>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
        </button>
        <button className="sidebar-item">
          <Icon name="settings" size={15} />
          <span>Settings</span>
        </button>
        <div className="sidebar-item" style={{cursor:'default'}}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(135deg, oklch(0.55 0.18 275), oklch(0.55 0.18 320))',
            display: 'grid', placeItems: 'center',
            color: 'white', fontSize: 10, fontWeight: 600,
          }}>EM</div>
          <span style={{fontSize: 12.5}}>Elena M.</span>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
