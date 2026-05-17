// Settings page — Profile · Connections · Risk policy · Notifications · Billing
const TABS = ['Profile', 'Connections', 'Risk policy', 'Notifications', 'Billing'];

// ---------- Reusable little Toggle (no library) ----------
const Toggle = ({ on, onChange, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={ariaLabel}
    className={`toggle ${on ? 'toggle-on' : ''}`}
    onClick={() => onChange(!on)}
  />
);

// ---------- Profile tab ----------
const ProfileTab = () => {
  const [name, setName] = useState('Elena Marquez');
  const [email, setEmail] = useState('elena.marquez@frieni.app');
  const [handle, setHandle] = useState('@elenam');
  const [tz, setTz] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');
  const [defaultAccount, setDefaultAccount] = useState('Live · Alpaca · Individual');

  return (
    <div className="col gap-4">
      <Card title="Account" titleSize="lg">
        <div className="profile-head">
          <div className="profile-avatar">EM</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{name}</div>
            <div className="profile-handle">{handle} · {email}</div>
            <div className="profile-meta">Member since Mar 2024 · ID usr_8K2P···91L · Pacific time Mon–Fri 06:30–15:00</div>
          </div>
          <div className="row row-gap-2">
            <Button variant="secondary" size="sm">Change avatar</Button>
            <Button variant="secondary" size="sm">Sign out</Button>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <div className="setting-label">Display name</div>
            <div className="setting-desc">Shown on assistant greetings and shared notes.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 360, fontFamily: 'var(--font-sans)' }} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Email</div>
            <div className="setting-desc">Used for sign-in, security alerts, and receipts.</div>
          </div>
          <div className="row row-gap-2" style={{ maxWidth: 460 }}>
            <input className="input-text" value={email} onChange={e => setEmail(e.target.value)} />
            <Badge variant="gain" dot>Verified</Badge>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Handle</div>
            <div className="setting-desc">Used to mention you in shared workspaces.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 280 }} value={handle} onChange={e => setHandle(e.target.value)} />
        </div>
      </Card>

      <Card title="Trading defaults" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Default account</div>
            <div className="setting-desc">New orders and assistant suggestions route here.</div>
          </div>
          <select className="input-select" style={{ maxWidth: 360 }} value={defaultAccount} onChange={e => setDefaultAccount(e.target.value)}>
            <option>Live · Alpaca · Individual</option>
            <option>Paper · Alpaca · Sandbox</option>
            <option>Live · IBKR · Pro</option>
            <option>Paper · IBKR · Sandbox</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Base currency</div>
            <div className="setting-desc">P&L, KPIs and watchlist values display in this currency.</div>
          </div>
          <select className="input-select" style={{ maxWidth: 200 }} value={currency} onChange={e => setCurrency(e.target.value)}>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>JPY</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Timezone</div>
            <div className="setting-desc">Controls market hours, session labels and alert windows.</div>
          </div>
          <select className="input-select" style={{ maxWidth: 280 }} value={tz} onChange={e => setTz(e.target.value)}>
            <option>America/New_York</option>
            <option>America/Los_Angeles</option>
            <option>America/Chicago</option>
            <option>Europe/London</option>
            <option>Asia/Tokyo</option>
          </select>
        </div>
      </Card>

      <Card title="Security" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Two-factor authentication</div>
            <div className="setting-desc">Required for live trading actions over $25k notional.</div>
          </div>
          <div className="row row-gap-2"><Badge variant="gain" dot>Enabled · Authenticator app</Badge><Button variant="ghost" size="sm">Reconfigure</Button></div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Active sessions</div>
            <div className="setting-desc">3 devices · last activity 4 minutes ago on this Mac.</div>
          </div>
          <Button variant="secondary" size="sm">Sign out other sessions</Button>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Delete account</div>
            <div className="setting-desc">Closes all positions, exports data, and removes API keys.</div>
          </div>
          <Button variant="ghost" size="sm" style={{ color: 'var(--loss)' }}>Request deletion</Button>
        </div>
      </Card>
    </div>
  );
};

// ---------- Risk policy tab ----------
const RiskTab = () => {
  const [haltOnNews, setHaltOnNews] = useState(true);
  const [autoStop, setAutoStop] = useState(true);
  const [sectorCap, setSectorCap] = useState(true);
  const [drawdownPause, setDrawdownPause] = useState(false);

  return (
    <div className="col gap-4">
      <Card title="Position limits" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Max single-name weight</div>
            <div className="setting-desc">Assistant trims positions exceeding this before adding more.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 120 }} defaultValue="20%" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Max open positions</div>
            <div className="setting-desc">Hard cap on simultaneous holdings across all accounts.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 120 }} defaultValue="25" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Max gross leverage</div>
            <div className="setting-desc">Long + short notional / equity. Margin is auto-disabled above this.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 120 }} defaultValue="1.5×" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Sector concentration cap</div>
            <div className="setting-desc">Block adds when any GICS sector exceeds 35% of equity.</div>
          </div>
          <Toggle on={sectorCap} onChange={setSectorCap} ariaLabel="Sector concentration cap" />
        </div>
      </Card>

      <Card title="Loss controls" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Max daily loss</div>
            <div className="setting-desc">Auto-pauses Full-Auto trading if breached.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 160 }} defaultValue="$5,000" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Max weekly drawdown</div>
            <div className="setting-desc">Sends a review prompt and disables new entries until acknowledged.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 160 }} defaultValue="-3.5%" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Default stop-loss</div>
            <div className="setting-desc">Applied to staged orders when no stop is specified.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 160 }} defaultValue="-7%" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Auto stop-loss on entry</div>
            <div className="setting-desc">Place a bracketed stop alongside every market or limit order.</div>
          </div>
          <Toggle on={autoStop} onChange={setAutoStop} ariaLabel="Auto stop-loss" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Pause assistant on drawdown</div>
            <div className="setting-desc">Switches assistant from Full-Auto to Step mode when daily loss is hit.</div>
          </div>
          <Toggle on={drawdownPause} onChange={setDrawdownPause} ariaLabel="Pause assistant on drawdown" />
        </div>
      </Card>

      <Card title="Order behaviour" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Default order type</div>
            <div className="setting-desc">Used when assistant stages trades without explicit type.</div>
          </div>
          <select className="input-select" style={{ maxWidth: 220 }} defaultValue="Limit (mid)">
            <option>Limit (mid)</option>
            <option>Limit (best bid/ask)</option>
            <option>Market</option>
            <option>Market on close</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Slippage budget</div>
            <div className="setting-desc">Max accepted slippage from arrival price before order is cancelled.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 120 }} defaultValue="15 bps" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Halt trading on breaking news</div>
            <div className="setting-desc">Pauses orders on a held name when high-severity news hits.</div>
          </div>
          <Toggle on={haltOnNews} onChange={setHaltOnNews} ariaLabel="Halt on news" />
        </div>
      </Card>
    </div>
  );
};

// ---------- Notifications tab ----------
const NotificationsTab = () => {
  const events = [
    { id: 'price', name: 'Price alerts', desc: 'Watchlist crossings and custom thresholds.' },
    { id: 'fills', name: 'Order fills & cancels', desc: 'Every execution from any linked account.' },
    { id: 'risk', name: 'Risk breaches', desc: 'Concentration, drawdown, and stop-loss events.' },
    { id: 'news', name: 'Holdings news', desc: 'High-severity headlines on owned positions.' },
    { id: 'summary', name: 'Daily summary', desc: 'EOD P&L digest, weekly review on Fridays.' },
    { id: 'assistant', name: 'Assistant proposals', desc: 'When assistant has trades staged for review.' },
  ];
  const channels = ['Email', 'Push', 'SMS', 'Slack'];

  // Default subscriptions matrix — row id -> { channel: bool }
  const [subs, setSubs] = useState({
    price:     { Email: true,  Push: true,  SMS: false, Slack: false },
    fills:     { Email: false, Push: true,  SMS: false, Slack: true  },
    risk:      { Email: true,  Push: true,  SMS: true,  Slack: true  },
    news:      { Email: false, Push: true,  SMS: false, Slack: false },
    summary:   { Email: true,  Push: false, SMS: false, Slack: false },
    assistant: { Email: false, Push: true,  SMS: false, Slack: true  },
  });
  const setCell = (eid, ch, v) => setSubs({ ...subs, [eid]: { ...subs[eid], [ch]: v } });
  const [quietOn, setQuietOn] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  return (
    <div className="col gap-4">
      <Card title="Delivery channels" titleSize="lg" actions={<Badge variant="gain" dot>Push & Slack live</Badge>}>
        <div className="setting-row">
          <div>
            <div className="setting-label">Email · elena.marquez@frieni.app</div>
            <div className="setting-desc">Verified · digest delivery preferred.</div>
          </div>
          <div className="row row-gap-2"><Badge variant="gain" dot>Verified</Badge><Button variant="ghost" size="sm">Change</Button></div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Push · MacBook Pro · iPhone 15</div>
            <div className="setting-desc">2 devices receiving push. Token last refreshed 4h ago.</div>
          </div>
          <Button variant="ghost" size="sm">Manage devices</Button>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">SMS · +1 (415) ··· 0142</div>
            <div className="setting-desc">Used for risk-tier alerts only. Rate-limited to 1 / 5 minutes.</div>
          </div>
          <Button variant="ghost" size="sm">Change number</Button>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Slack · #frieni-trading on marquez-capital</div>
            <div className="setting-desc">Webhook posts as @FrieNi. Mentions your handle on critical events.</div>
          </div>
          <div className="row row-gap-2"><Badge variant="gain" dot>Connected</Badge><Button variant="ghost" size="sm">Disconnect</Button></div>
        </div>
      </Card>

      <Card title="What to notify me about" titleSize="lg">
        <table className="notif-matrix">
          <thead>
            <tr>
              <th>Event</th>
              {channels.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id}>
                <td>
                  <div className="notif-event-name">{ev.name}</div>
                  <div className="notif-event-desc">{ev.desc}</div>
                </td>
                {channels.map(ch => (
                  <td key={ch}>
                    <div className="notif-cell-toggle">
                      <Toggle
                        on={subs[ev.id][ch]}
                        onChange={(v) => setCell(ev.id, ch, v)}
                        ariaLabel={`${ev.name} via ${ch}`}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Quiet hours & focus" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Quiet hours</div>
            <div className="setting-desc">Mute non-critical channels outside market hours.</div>
          </div>
          <div className="row row-gap-3" style={{ flexWrap: 'wrap' }}>
            <Toggle on={quietOn} onChange={setQuietOn} ariaLabel="Quiet hours" />
            <input className="input-text" style={{ maxWidth: 110 }} defaultValue="21:00" disabled={!quietOn} />
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>to</span>
            <input className="input-text" style={{ maxWidth: 110 }} defaultValue="06:30" disabled={!quietOn} />
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Do not disturb</div>
            <div className="setting-desc">Silence everything except Risk breaches until manually disabled.</div>
          </div>
          <Toggle on={doNotDisturb} onChange={setDoNotDisturb} ariaLabel="Do not disturb" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Weekly review</div>
            <div className="setting-desc">Recap email delivered Fridays at market close.</div>
          </div>
          <select className="input-select" style={{ maxWidth: 220 }} defaultValue="Friday · 4:15 PM ET">
            <option>Friday · 4:15 PM ET</option>
            <option>Saturday · 9:00 AM ET</option>
            <option>Sunday · 6:00 PM ET</option>
            <option>Off</option>
          </select>
        </div>
      </Card>
    </div>
  );
};

// ---------- Billing tab ----------
const BillingTab = () => {
  const usage = [
    { label: 'Polygon API calls',    sub: 'Resets May 31 · 100k / mo included', used: 62400, cap: 100000, fmt: (n) => n.toLocaleString() },
    { label: 'Assistant tokens',     sub: 'GPT-5 reasoning · 5M / mo included', used: 4_120_000, cap: 5_000_000, fmt: (n) => (n / 1_000_000).toFixed(2) + 'M' },
    { label: 'Active price alerts',  sub: '50 included · live cross-checked', used: 38, cap: 50, fmt: (n) => n.toString() },
    { label: 'Custom dashboards',    sub: '3 included · unlimited on Pro+', used: 2, cap: 3, fmt: (n) => n.toString() },
  ];
  const invoices = [
    { date: '2026-04-01', id: 'INV-2026-0412', desc: 'FrieNi Pro · monthly', amount: 49, status: 'Paid' },
    { date: '2026-03-01', id: 'INV-2026-0311', desc: 'FrieNi Pro · monthly', amount: 49, status: 'Paid' },
    { date: '2026-02-01', id: 'INV-2026-0207', desc: 'FrieNi Pro · monthly', amount: 49, status: 'Paid' },
    { date: '2026-01-01', id: 'INV-2026-0103', desc: 'FrieNi Pro · monthly + setup', amount: 64, status: 'Paid' },
    { date: '2025-12-01', id: 'INV-2025-1201', desc: 'FrieNi Pro · monthly', amount: 49, status: 'Paid' },
  ];

  return (
    <div className="col gap-4">
      <Card title="Current plan" titleSize="lg">
        <div className="plan-card">
          <div>
            <div className="plan-tag">Active subscription</div>
            <div className="plan-name">FrieNi Pro</div>
            <div className="plan-price"><b>$49</b> / month · billed monthly · next charge May 31, 2026</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
              Includes live trading, 5M assistant tokens, unlimited watchlists, and 3 custom dashboards.
            </div>
          </div>
          <div className="row row-gap-2">
            <Button variant="secondary" size="sm">Compare plans</Button>
            <Button variant="primary" size="sm">Upgrade to Pro+</Button>
          </div>
        </div>
      </Card>

      <Card title="Usage this period" titleSize="lg" actions={<span style={{ fontSize: 12, color: 'var(--ink-3)' }}>May 1 – May 31, 2026</span>}>
        {usage.map(u => {
          const pct = Math.min(100, (u.used / u.cap) * 100);
          const warn = pct > 80;
          return (
            <div key={u.label} className="usage-row">
              <div>
                <div className="usage-label">{u.label}</div>
                <div className="usage-sub">{u.sub}</div>
              </div>
              <div className="usage-bar-track">
                <div className={`usage-bar-fill ${warn ? 'warn' : ''}`} style={{ width: pct + '%' }} />
              </div>
              <div className="usage-num">
                <b>{u.fmt(u.used)}</b> / {u.fmt(u.cap)}
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="Payment method" titleSize="lg" actions={<Button variant="secondary" size="sm">+ Add method</Button>}>
        <div className="pay-card">
          <div className="pay-mark">VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Visa ending in 4242</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Exp 09/2028 · billing zip 94110</div>
          </div>
          <Badge variant="neutral">Default</Badge>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </Card>

      <Card title="Invoices" titleSize="lg">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="date-cell">{inv.date}</td>
                <td className="num-cell" style={{ textAlign: 'left' }}>{inv.id}</td>
                <td>{inv.desc}</td>
                <td className="num-cell">${inv.amount.toFixed(2)}</td>
                <td><Badge variant="gain" dot>{inv.status}</Badge></td>
                <td style={{ textAlign: 'right' }}><a className="invoice-link">Download PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Billing details" titleSize="lg">
        <div className="setting-row">
          <div>
            <div className="setting-label">Billing email</div>
            <div className="setting-desc">Where receipts and invoices are delivered.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 360 }} defaultValue="billing@marquez-capital.com" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Tax / VAT ID</div>
            <div className="setting-desc">Added to all future invoices for this account.</div>
          </div>
          <input className="input-text" style={{ maxWidth: 280 }} defaultValue="" placeholder="Optional" />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Cancel subscription</div>
            <div className="setting-desc">You'll keep Pro features until the end of the current period.</div>
          </div>
          <Button variant="ghost" size="sm" style={{ color: 'var(--loss)' }}>Cancel plan</Button>
        </div>
      </Card>
    </div>
  );
};

// ---------- Connections tab (linked broker/SSO accounts + API keys) ----------
const ApiTab = () => {
  const [state, setState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  const [show, setShow] = useState({});

  const linked = [
    { mark: 'AL', name: 'Alpaca · Individual', detail: 'PA3K2···94L · Live · funded $418k', status: 'Active' },
    { mark: 'AL', name: 'Alpaca · Paper', detail: 'PKP9···17X · Paper · funded $100k', status: 'Active' },
    { mark: 'IB', name: 'IBKR · Pro', detail: 'U7842···31 · Live · funded $612k', status: 'Active' },
    { mark: 'IB', name: 'IBKR · Paper', detail: 'DU482···09 · Paper · funded $1.0M', status: 'Active' },
    { mark: 'GG', name: 'Google', detail: 'elena.marquez@gmail.com · SSO', status: 'Connected' },
  ];

  const providers = [
    {
      id: 'alpaca', name: 'Alpaca Markets', mark: 'AL',
      desc: 'Brokerage execution · live and paper trading',
      unlocks: ['Live trading', 'Paper account', 'Real-time quotes', 'Order routing'],
      placeholder: 'PKXXX...',
    },
    {
      id: 'ibkr', name: 'Interactive Brokers', mark: 'IB',
      desc: 'Brokerage execution · live and paper · global markets',
      unlocks: ['Live trading', 'Paper (DU) account', 'Multi-asset', 'TWS / Gateway'],
      placeholder: 'IBKR-...',
    },
    {
      id: 'polygon', name: 'Polygon.io', mark: 'PG',
      desc: 'Market data · tick-level, fundamentals, news',
      unlocks: ['Tick data', 'Options chains', 'Fundamentals', 'News API'],
      placeholder: 'YOUR_API_KEY',
    },
    {
      id: 'openai', name: 'OpenAI', mark: 'AI',
      desc: 'Reasoning model for the assistant',
      unlocks: ['GPT-5 reasoning', 'Custom prompts', 'Vision charts'],
      placeholder: 'sk-proj-...',
    },
  ];

  return (
    <div className="col gap-4">
      <Card title="Linked accounts" titleSize="lg" actions={<Button variant="secondary" size="sm">+ Link account</Button>}>
        {linked.map(l => (
          <div key={l.name} className="linked-account">
            <div className="linked-mark">{l.mark}</div>
            <div style={{ flex: 1 }}>
              <div className="linked-name">{l.name}</div>
              <div className="linked-detail">{l.detail}</div>
            </div>
            <Badge variant="gain" dot>{l.status}</Badge>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
        ))}
      </Card>

      <Card title="API keys" titleSize="lg" actions={<Badge variant="gain" dot>3 of 4 connected</Badge>}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 16 }}>
          Add API keys to unlock more functionality. Keys are encrypted at rest and never sent to third parties.
        </div>
        <div className="col gap-3">
          {providers.map(p => {
            const value = state.apiKeys[p.id] || '';
            const connected = value.length > 6;
            return (
              <div key={p.id} className="api-key-card">
                <div className="api-key-head">
                  <div className="api-key-mark">{p.mark}</div>
                  <div style={{ flex: 1 }}>
                    <div className="api-key-name">{p.name}</div>
                    <div className="api-key-status">{p.desc}</div>
                  </div>
                  {connected ? (
                    <Badge variant="gain" dot>Connected</Badge>
                  ) : (
                    <Badge variant="neutral">Not connected</Badge>
                  )}
                </div>
                <div className="row row-gap-2" style={{ marginTop: 4 }}>
                  <input
                    className="input-text"
                    style={{ flex: 1 }}
                    type={show[p.id] ? 'text' : 'password'}
                    placeholder={p.placeholder}
                    value={value}
                    onChange={(e) => window.AppStore.setApiKey(p.id, e.target.value)}
                  />
                  <Button variant="secondary" size="sm" onClick={() => setShow({ ...show, [p.id]: !show[p.id] })}>
                    {show[p.id] ? 'Hide' : 'Show'}
                  </Button>
                  <Button variant="primary" size="sm">Test</Button>
                </div>
                <div className="unlock-list">
                  {p.unlocks.map(u => (
                    <span key={u} className={`unlock-pill ${connected ? 'unlock-pill-on' : ''}`}>
                      {connected ? '✓ ' : ''}{u}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ---------- Page shell ----------
const SettingsPage = () => {
  const [storeState, setStoreState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setStoreState({ ...s })), []);
  const tab = storeState.settingsTab || 'Profile';
  const setTab = (t) => window.AppStore.setSettingsTab(t);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Profile · connections · risk policy · notifications · billing</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <div
            key={t}
            className={`tab ${tab === t ? 'tab-active' : ''}`}
            onClick={() => setTab(t)}
          >{t}</div>
        ))}
      </div>

      {tab === 'Profile' && <ProfileTab />}
      {tab === 'Connections' && <ApiTab />}
      {tab === 'Risk policy' && <RiskTab />}
      {tab === 'Notifications' && <NotificationsTab />}
      {tab === 'Billing' && <BillingTab />}
    </div>
  );
};

window.SettingsPage = SettingsPage;
