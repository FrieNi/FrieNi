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
        {/* GitHub user — populated by auth-gate via window.FpkUser */}
        <UserAvatar workerUrl={window.__fpkWorkerUrl} />
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;

// Renders attached to body so it escapes sidebar overflow:hidden/auto clipping
function PortalDropdown({ anchorRef, user, loggingOut, onLogout, onClose }) {
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 200 });

  React.useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.top, left: r.left, width: r.width });
  }, []);

  // Close on outside click
  React.useEffect(() => {
    const h = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: pos.top - 8,
      left: pos.left,
      width: Math.max(pos.width, 180),
      transform: 'translateY(-100%)',
      background: 'var(--bg-1, #fff)', border: '1px solid var(--border, #e5e5e5)',
      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.18)',
      padding: '6px', zIndex: 99999,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }}>
      <div style={{padding:'6px 8px 8px', borderBottom:'1px solid var(--border, #e5e5e5)', marginBottom:4}}>
        <div style={{fontWeight:600, fontSize:12, color:'var(--text, #111)'}}>{user.name || user.login}</div>
        <div style={{fontSize:11, color:'var(--text-3, #888)'}}>@{user.login}</div>
      </div>
      <button
        onClick={onLogout}
        disabled={loggingOut}
        style={{
          width:'100%', textAlign:'left', background:'transparent', border:0,
          padding:'6px 8px', borderRadius:6, cursor:'pointer',
          fontSize:12, color:'var(--text-2, #444)',
          display:'flex', alignItems:'center', gap:6,
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--surface-2, #f5f5f5)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {loggingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}

function UserAvatar({ workerUrl }) {
  const [user, setUser]       = React.useState(window.FpkUser || null);
  const [open, setOpen]       = React.useState(false);
  const [loggingOut, setOut]  = React.useState(false);
  const ref                   = React.useRef(null);

  // Pick up FpkUser if auth-gate sets it after mount
  React.useEffect(() => {
    if (window.FpkUser) { setUser(window.FpkUser); return; }
    const id = setInterval(() => {
      if (window.FpkUser) { setUser(window.FpkUser); clearInterval(id); }
    }, 300);
    return () => clearInterval(id);
  }, []);

  const logout = async () => {
    setOut(true);
    try {
      const token = window.FpkToken || localStorage.getItem('fpk_session');
      if (token && workerUrl) {
        await fetch(`${workerUrl}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      localStorage.removeItem('fpk_session');
      window.FpkUser = null;
      window.FpkToken = null;
      window.location.reload();
    }
  };

  if (!user) return (
    <div className="sidebar-item" style={{cursor:'default', opacity:.4}}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'var(--surface-3)',
        display: 'grid', placeItems: 'center',
        color: 'var(--text-2)', fontSize: 10, fontWeight: 600,
      }}>?</div>
      <span style={{fontSize: 12.5, color:'var(--text-3)'}}>Not signed in</span>
    </div>
  );

  const initials = user.login.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button
        className="sidebar-item"
        style={{cursor:'pointer', width:'100%'}}
        onClick={() => setOpen(o => !o)}
        title={`@${user.login} — click to sign out`}
      >
        {user.avatar_url
          ? <img src={user.avatar_url} alt={user.login} style={{width:22,height:22,borderRadius:'50%',objectFit:'cover'}} />
          : <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg, oklch(0.55 0.18 275), oklch(0.55 0.18 320))',
              display: 'grid', placeItems: 'center',
              color: 'white', fontSize: 10, fontWeight: 600,
            }}>{initials}</div>
        }
        <span style={{fontSize: 12.5}}>{user.name || user.login}</span>
      </button>

      {open && ReactDOM.createPortal(
        <PortalDropdown
          anchorRef={ref}
          user={user}
          loggingOut={loggingOut}
          onLogout={logout}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </div>
  );
}

window.UserAvatar = UserAvatar;