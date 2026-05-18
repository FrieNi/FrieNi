// Sidebar with grouped nav + Topbar with search and ticker tape
const NavIcon = ({ d }) => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 3h6v8H3zM11 3h6v5h-6zM3 13h6v4H3zM11 10h6v7h-6z',
  tickets: 'M3 7a2 2 0 012-2h10a2 2 0 012 2v2a1.5 1.5 0 100 3v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a1.5 1.5 0 100-3V7zM8 6v8',
  markets: 'M3 14l4-5 3 3 4-7 3 6M3 17h14',
  stock: 'M3 17V9l4 2 3-5 4 4 3-7v14H3z',
  portfolio: 'M3 6h14v11H3zM3 6V4h14v2M7 10h6',
  news: 'M3 4h11v13H3zM6 7h5M6 10h5M6 13h3M14 7h3v10h-3',
  assistant: 'M10 3a6 6 0 016 6v3l1.5 3h-2.5v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2H2.5L4 12V9a6 6 0 016-6zM7 10h.01M13 10h.01',
  alerts: 'M10 3a5 5 0 015 5v3l1.5 2H3.5L5 11V8a5 5 0 015-5zM8 16a2 2 0 004 0',
  screener: 'M3 5h14M5 10h10M7 15h6',
  settings: 'M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM10 2.5l1 2 2.2-.4 1 1.7L13 7.5l1.4 1.7-1 1.7-2.2-.4-1 2-2-2-2.2.4-1-1.7L7 9.2 5.6 7.5l1-1.7 2.2.4 1-2.7z',
  search: 'M9 15a6 6 0 100-12 6 6 0 000 12zM17 17l-3.5-3.5',
  bell: 'M10 3a5 5 0 015 5v3l1.5 2H3.5L5 11V8a5 5 0 015-5zM8 16a2 2 0 004 0',
  key: 'M12 8a3 3 0 11-2.83 4H7v2H5v2H2v-3l7.17-7.17A3 3 0 1112 8z',
  user: 'M10 10a3 3 0 100-6 3 3 0 000 6zM4 17a6 6 0 0112 0',
  signout: 'M11 4H5a2 2 0 00-2 2v8a2 2 0 002 2h6M14 7l3 3-3 3M9 10h8',
  shield: 'M10 3l6 2v5c0 4-2.5 6.5-6 7.5-3.5-1-6-3.5-6-7.5V5l6-2z',
  billing: 'M3 6h14v9H3zM3 9h14M6 12h3',
  help: 'M10 14v.01M10 12a2 2 0 10-2-2M10 3a7 7 0 100 14 7 7 0 000-14z',
};

const Sidebar = ({ page, onNav }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [fpkUser, setFpkUser]   = React.useState(window.FpkUser || null);
  const footRef = React.useRef(null);

  // Poll until auth-gate sets window.FpkUser (async /auth/me fetch)
  React.useEffect(() => {
    if (window.FpkUser) { setFpkUser(window.FpkUser); return; }
    const id = setInterval(() => {
      if (window.FpkUser) { setFpkUser(window.FpkUser); clearInterval(id); }
    }, 150);
    setTimeout(() => clearInterval(id), 15000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (footRef.current && !footRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const onboarding = page === 'onboarding';

  const item = (id, label, icon, badge) => (
    <div
      className={`nav-item ${page === id ? 'nav-item-active' : ''} ${onboarding ? 'nav-item-locked' : ''}`}
      onClick={() => { if (!onboarding) onNav(id); }}
      key={id}
      aria-disabled={onboarding || undefined}
      title={onboarding ? 'Available after setup' : undefined}
    >
      <NavIcon d={ICONS[icon]} />
      <span>{label}</span>
      {onboarding ? <span className="nav-item-lock" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1" /><path d="M4 5.5V4a2 2 0 014 0v1.5" /></svg>
      </span> : (badge && <span className="nav-item-badge">{badge}</span>)}
    </div>
  );

  const [ticketCount, setTicketCount] = React.useState(
    window.TicketStore ? window.TicketStore.countOpen() : 0
  );
  React.useEffect(() => {
    if (!window.TicketStore) return;
    return window.TicketStore.subscribe(() => setTicketCount(window.TicketStore.countOpen()));
  }, []);

  const menuItem = (icon, label, onClick, opts = {}) => (
    <div
      className={`account-menu-item ${opts.active ? 'account-menu-item-active' : ''} ${opts.danger ? 'account-menu-item-danger' : ''}`}
      onClick={() => { setMenuOpen(false); onClick && onClick(); }}
    >
      <NavIcon d={ICONS[icon]} />
      <span>{label}</span>
      {opts.kbd && <span className="kbd account-menu-kbd">{opts.kbd}</span>}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">F</div>
        <div className="col">
          <div className="sidebar-brand-name">FrieNi</div>
          <div className="sidebar-brand-tag">Pro · Tier II</div>
        </div>
      </div>

      {window.WorkspaceSwitcher && !onboarding && <WorkspaceSwitcher />}

      {onboarding && (
        <div className="nav-onboarding">
          <div className="nav-onboarding-eyebrow">
            <span className="nav-onboarding-dot" />
            Setting up
          </div>
          <div className="nav-onboarding-title">First-run setup</div>
          <div className="nav-onboarding-sub">Workspace unlocks once setup is done.</div>
        </div>
      )}

      <div className="nav-section">Trade</div>
      <div className="col" style={{ gap: 2 }}>
        {item('dashboard', 'Dashboard', 'dashboard')}
        {item('tickets', 'Tickets', 'tickets', ticketCount > 0 ? ticketCount : null)}
        {item('markets', 'Markets', 'markets')}
        {item('stock', 'Instrument', 'stock')}
        {item('portfolio', 'Portfolio', 'portfolio')}
      </div>

      <div className="nav-section">Intelligence</div>
      <div className="col" style={{ gap: 2 }}>
        {item('news', 'News & Sentiment', 'news', '12')}
        {item('assistant', 'Assistant', 'assistant', 'NEW')}
        {item('screener', 'Screener', 'screener')}
      </div>

      <div className="nav-section">Account</div>
      <div className="col" style={{ gap: 2 }}>
        {item('alerts', 'Alerts', 'alerts', '3')}
      </div>

      <div className="sidebar-foot" ref={footRef}>
        <div
          className={`sidebar-user ${menuOpen ? 'sidebar-user-open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {fpkUser?.avatar_url
            ? <img src={fpkUser.avatar_url} alt={fpkUser.login}
                style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
            : <div className="user-avatar">{fpkUser ? fpkUser.login.slice(0,2).toUpperCase() : 'EM'}</div>
          }
          <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
            <div className="user-name">{fpkUser?.name || fpkUser?.login || 'Elena Marković'}</div>
            <div className="user-tier">Pro · 2 connections</div>
          </div>
          <svg className="account-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </div>

        {menuOpen && (
          <div className="account-menu" role="menu">
            <div className="account-menu-header">
              {fpkUser?.avatar_url
                ? <img src={fpkUser.avatar_url} alt={fpkUser.login}
                    style={{width:34,height:34,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                : <div className="user-avatar account-menu-avatar">{fpkUser ? fpkUser.login.slice(0,2).toUpperCase() : 'EM'}</div>
              }
              <div className="col" style={{ gap: 2, minWidth: 0 }}>
                <div className="account-menu-name">{fpkUser?.name || fpkUser?.login || 'Elena Marković'}</div>
                <div className="account-menu-email">@{fpkUser?.login || 'elena'}</div>
              </div>
            </div>

            <div className="account-menu-section">
              {menuItem('user', 'Profile', () => window.AppStore.setSettingsTab('Profile'), { active: page === 'settings' })}
              {menuItem('key', 'Connections', () => window.AppStore.setSettingsTab('Connections'))}
              {menuItem('shield', 'Risk policy', () => window.AppStore.setSettingsTab('Risk policy'))}
              {menuItem('alerts', 'Notifications', () => window.AppStore.setSettingsTab('Notifications'))}
              {menuItem('billing', 'Billing', () => window.AppStore.setSettingsTab('Billing'))}
            </div>

            <div className="account-menu-divider"></div>

            <div className="account-menu-section">
              {menuItem('help', 'Help & docs', () => {})}
              {menuItem('signout', 'Sign out', async () => {
                const token = window.FpkToken || localStorage.getItem('fpk_session');
                const workerUrl = window.__fpkWorkerUrl;
                if (token && workerUrl) {
                  try { await fetch(workerUrl + '/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }); } catch {}
                }
                localStorage.removeItem('fpk_session');
                window.FpkUser = null; window.FpkToken = null;
                window.location.reload();
              }, { danger: true })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

const Topbar = ({ indices }) => (
  <div className="topbar">
    <div className="topbar-search">
      <NavIcon d={ICONS.search} />
      <input placeholder="Search ticker, sector, news, command..." />
      <span className="kbd">⌘ K</span>
    </div>
    <div className="market-pill">
      <span className="market-status-dot"></span>
      <span style={{ color: 'var(--ink-2)' }}>Market open</span>
      <span style={{ color: 'var(--ink-3)' }}>· closes 4:00 PM ET</span>
    </div>
    <div className="ticker-tape">
      {[...indices, ...indices].map((idx, i) => (
        <div className="ticker-item" key={i}>
          <span className="ticker-sym">{idx.symbol}</span>
          <span className="mono">{idx.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          <Delta value={idx.change} pct={idx.pct} />
        </div>
      ))}
    </div>
    <Button variant="ghost" size="sm" icon={<NavIcon d={ICONS.bell} />}></Button>
    <Button variant="primary" size="sm">+ New trade</Button>
  </div>
);

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.NavIcon = NavIcon;
window.NAV_ICONS = ICONS;