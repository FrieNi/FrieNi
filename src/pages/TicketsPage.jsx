// Tickets — modular inbox + detail.
//
// Architecture:
//   • TicketStore holds tickets (any kind).
//   • TicketRegistry maps a `kind` to { label, glyph, DetailComponent, summary }.
//   • TicketsPage renders the inbox (left) and the active ticket's detail (right).
//   • Each kind owns its own detail component — we just slot it in.
//
// Adding a new kind elsewhere is a one-liner:
//   TicketRegistry.register('rebalance', { label, glyph, DetailComponent });

const KIND_GLYPHS = {
  trim: '↘',
  hedge: '◇',
  rebalance: '⇌',
  'tax-loss': '%',
  'cash-yield': '$',
  'events': '◷',
  'policy-edit': '⚙',
};
const KIND_LABELS = {
  trim: 'Trim',
  hedge: 'Hedge',
  rebalance: 'Rebalance',
  'tax-loss': 'Tax-loss harvest',
  'cash-yield': 'Cash yield',
  'events': 'Calendar events',
  'policy-edit': 'Policy edit',
};

const fmtRelative = (iso) => {
  const d = new Date(iso);
  const now = new Date('2026-05-07T09:00:00-04:00');
  const mins = Math.round((now - d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.round(hrs / 24);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtAbsolute = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ── Inbox row ──────────────────────────────────────────────────
const TicketRow = ({ t, active, onClick }) => (
  <div className={`tk-row ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="tk-row-glyph" data-kind={t.kind} aria-hidden="true">{KIND_GLYPHS[t.kind] || '·'}</div>
    <div className="tk-row-body">
      <div className="tk-row-meta">
        <span className="tk-row-id">{t.id}</span>
        <span className="tk-priority-flag" data-p={t.priority} title={`Priority: ${t.priority}`} />
        <span className="tk-row-source">{t.source.label || t.source.module}</span>
      </div>
      <div className="tk-row-subject">{t.subject}</div>
      <div className="tk-row-summary">{t.summary}</div>
    </div>
    <div className="tk-row-aside">
      <span className="tk-status" data-status={t.status}>{t.status}</span>
      <span className="tk-row-time">{fmtRelative(t.updated)}</span>
    </div>
  </div>
);

// ── Inbox ──────────────────────────────────────────────────────
const TicketInbox = ({ tickets, filter, activeId, onSelect, onFilter }) => {
  const counts = {
    open: tickets.filter(t => t.status === 'open').length,
    queued: tickets.filter(t => t.status === 'queued').length,
    snoozed: tickets.filter(t => t.status === 'snoozed').length,
    filled: tickets.filter(t => t.status === 'filled').length,
    dismissed: tickets.filter(t => t.status === 'dismissed').length,
    all: tickets.length,
  };

  const visible = window.TicketStore.list(filter);

  const STATUS_PILLS = [
    { id: 'open',      label: 'Open' },
    { id: 'queued',    label: 'Queued' },
    { id: 'snoozed',   label: 'Snoozed' },
    { id: 'filled',    label: 'Filled' },
    { id: 'dismissed', label: 'Dismissed' },
    { id: 'all',       label: 'All' },
  ];

  return (
    <div className="tk-inbox">
      <div className="tk-inbox-head">
        <div className="tk-inbox-title-row">
          <h1 className="tk-inbox-title">Tickets</h1>
          <span className="tk-inbox-count">{visible.length} of {tickets.length}</span>
        </div>
        <div className="tk-inbox-filters">
          {STATUS_PILLS.map(p => (
            <button
              key={p.id}
              className={`tk-pill ${filter.status === p.id ? 'active' : ''}`}
              onClick={() => onFilter({ status: p.id })}
            >
              {p.label}
              <span className="tk-pill-count">{counts[p.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="tk-inbox-list">
        {visible.length === 0 ? (
          <div className="tk-inbox-empty">
            <div className="tk-inbox-empty-glyph">◯</div>
            <div>No tickets here.</div>
          </div>
        ) : (
          visible.map(t => (
            <TicketRow
              key={t.id}
              t={t}
              active={t.id === activeId}
              onClick={() => onSelect(t.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ── Generic detail — used when a kind has no custom DetailComponent ─
const GenericTicketDetail = ({ ticket }) => (
  <div className="tk-generic">
    <h1 className="tk-generic-subject">{ticket.subject}</h1>
    <p className="tk-generic-summary">{ticket.summary}</p>
    <div className="tk-generic-stub">
      <strong>{KIND_LABELS[ticket.kind] || ticket.kind} workflow not yet wired up.</strong>
      <br />
      The <code>{ticket.kind}</code> kind has no detail component registered.
      Other modules can plug one in by calling{' '}
      <code>TicketRegistry.register('{ticket.kind}', {'{'} DetailComponent {'}'})</code>.
    </div>
    <TicketHistory ticket={ticket} />
  </div>
);

const TicketHistory = ({ ticket }) => (
  <div className="tk-history">
    <div className="tk-history-label">History</div>
    <div className="tk-history-list">
      {ticket.history.map((h, i) => (
        <div key={i} className="tk-history-item">
          <span className="tk-history-when">{fmtAbsolute(h.at)}</span>
          <div>
            <span className="tk-history-event">{h.event}</span>
            <span className="tk-history-by">by {h.by}</span>
            {h.note && <span className="tk-history-note">{h.note}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Detail shell ──────────────────────────────────────────────
const TicketDetail = ({ ticket }) => {
  if (!ticket) {
    return (
      <div className="tk-detail">
        <div className="tk-detail-empty">
          <div className="tk-detail-empty-glyph">◯</div>
          <h2 className="tk-detail-empty-title">No ticket selected</h2>
          <p className="tk-detail-empty-body">
            Pick a ticket from the inbox. Tickets come from Zen recommendations,
            alerts, the Assistant, and scheduled reviews — they all land here.
          </p>
        </div>
      </div>
    );
  }

  const descriptor = window.TicketRegistry.get(ticket.kind);
  const Body = descriptor?.DetailComponent || GenericTicketDetail;

  return (
    <div className="tk-detail">
      <div className="tk-detail-bar">
        <span className="tk-detail-bar-kind">
          <span
            className="tk-detail-bar-kind-glyph"
            style={{ background: 'var(--bg-inset)', color: 'var(--ink-2)' }}
            data-kind={ticket.kind}
          >{KIND_GLYPHS[ticket.kind] || '·'}</span>
          {KIND_LABELS[ticket.kind] || ticket.kind}
        </span>
        <span className="tk-detail-bar-id">{ticket.id}</span>
        <span className="tk-status" data-status={ticket.status}>{ticket.status}</span>
        <div className="tk-detail-bar-spacer" />
        <span className="tk-detail-bar-source">
          From <strong>{ticket.source.label || ticket.source.module}</strong>
          {' · '}{fmtRelative(ticket.created)}
        </span>
        <div className="tk-detail-bar-actions">
          <button className="tk-icon-btn" onClick={() => window.TicketStore.setStatus(ticket.id, 'snoozed', { note: 'Snoozed 1 day' })}>
            Snooze
          </button>
          <button className="tk-icon-btn" onClick={() => window.TicketStore.setStatus(ticket.id, 'dismissed', { note: 'Dismissed' })}>
            Dismiss
          </button>
        </div>
      </div>
      <div className="tk-detail-body">
        <Body ticket={ticket} />
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────
const TicketsPage = () => {
  const [tState, setTState] = useState(window.TicketStore.get());
  useEffect(() => window.TicketStore.subscribe(s => setTState({ ...s })), []);

  // If nothing active, default to first matching ticket so the page never lands empty.
  useEffect(() => {
    if (!tState.activeId) {
      const visible = window.TicketStore.list(tState.inboxFilter);
      if (visible[0]) window.TicketStore.setActive(visible[0].id);
    }
  }, [tState.activeId, tState.inboxFilter]);

  const active = tState.activeId ? window.TicketStore.byId(tState.activeId) : null;

  return (
    <div className="tk-shell">
      <TicketInbox
        tickets={tState.tickets}
        filter={tState.inboxFilter}
        activeId={tState.activeId}
        onSelect={(id) => window.TicketStore.setActive(id)}
        onFilter={(patch) => window.TicketStore.setInboxFilter(patch)}
      />
      <TicketDetail ticket={active} />
    </div>
  );
};

window.TicketsPage = TicketsPage;
window.TicketHistory = TicketHistory;
window.GenericTicketDetail = GenericTicketDetail;
