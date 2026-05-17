// Central ticketing store.
//
// Tickets are the unit of "something the user should review and act on".
// Anything in the app — Zen recommendations, alerts, the Assistant, scheduled
// rebalances — can write a ticket via TicketStore.openOrCreate({ kind, ... }).
//
// Each ticket has:
//   id        — stable string id (auto-generated if omitted)
//   kind      — registered type ('trim' | 'hedge' | 'rebalance' | 'tax-loss' | …)
//   status    — 'draft' | 'open' | 'queued' | 'filled' | 'dismissed' | 'snoozed'
//   priority  — 'low' | 'normal' | 'high' | 'critical'
//   source    — { module: 'zen'|'assistant'|'alerts'|…, ref?: string }
//   subject   — short string ("Sell 58 NVDA")
//   summary   — one-liner for inbox
//   payload   — kind-specific data (consumed by the kind's detail component)
//   created   — ISO timestamp
//   updated   — ISO timestamp
//   history   — [{ at, by, event, note }]
//
// Kinds register themselves via TicketRegistry.register(kind, descriptor) so
// other features can plug in without this file knowing about them.

(() => {
  const REGISTRY = {};

  window.TicketRegistry = {
    register(kind, descriptor) {
      REGISTRY[kind] = { kind, ...descriptor };
    },
    get(kind) { return REGISTRY[kind]; },
    all() { return Object.values(REGISTRY); },
  };

  // ── Seed tickets ──────────────────────────────────────────────
  // These mirror the demo state: one open trim from Zen + a few others
  // from different modules to show the system is shared.
  const seed = [
    {
      id: 'TKT-2087',
      kind: 'trim',
      status: 'open',
      priority: 'normal',
      source: { module: 'zen', ref: 'zen-improvement-2026-05-07', label: 'Zen recommendation' },
      subject: 'Trim NVDA · 58 sh',
      summary: 'Bring NVDA to 12% target weight; route ~$26.8k to T-bill ladder.',
      payload: {
        symbol: 'NVDA',
        side: 'sell',
        shares: 58,
        totalShares: 167,
        limitPx: 462.10,
        orderType: 'limit',
        tif: 'day',
        destSleeve: 'tbill',
        weightBefore: 18.4,
        weightAfter: 12.1,
        weightTarget: 12,
        weightCap: 15,
        cashBefore: 5.9,
        rationale: [
          'Single-name cap (15%) breached on May 5',
          'Long-term lots available — short-term lots are <1% of position',
          'Cash target is 4–8%; trim brings cash to 6.4% before redeployment',
        ],
      },
      created: '2026-05-07T08:42:00-04:00',
      updated: '2026-05-07T08:42:00-04:00',
      history: [
        { at: '2026-05-07T08:42:00-04:00', by: 'FrieNi', event: 'created', note: 'Drafted from Zen improvement scenario' },
      ],
    },
    {
      id: 'TKT-2086',
      kind: 'hedge',
      status: 'open',
      priority: 'high',
      source: { module: 'alerts', ref: 'alert-cpi-semis', label: 'Alert · sector concentration' },
      subject: 'SOXX 1-week put hedge',
      summary: 'Defined-risk hedge ahead of CPI · 0.08% NAV cost.',
      payload: { symbol: 'SOXX', notional: 142000, premium: 340 },
      created: '2026-05-07T07:18:00-04:00',
      updated: '2026-05-07T07:18:00-04:00',
      history: [
        { at: '2026-05-07T07:18:00-04:00', by: 'FrieNi', event: 'created', note: 'Drafted from concentration alert' },
      ],
    },
    {
      id: 'TKT-2084',
      kind: 'rebalance',
      status: 'snoozed',
      priority: 'low',
      source: { module: 'zen', ref: 'zen-quarterly-2026-q2', label: 'Quarterly review' },
      subject: 'Rebalance to policy bands',
      summary: 'Quarterly drift review — 4 positions to adjust.',
      payload: {},
      created: '2026-05-04T09:10:00-04:00',
      updated: '2026-05-06T11:00:00-04:00',
      history: [
        { at: '2026-05-04T09:10:00-04:00', by: 'FrieNi', event: 'created' },
        { at: '2026-05-06T11:00:00-04:00', by: 'Elena', event: 'snoozed', note: 'Until next Monday' },
      ],
    },
    {
      id: 'TKT-2081',
      kind: 'tax-loss',
      status: 'open',
      priority: 'normal',
      source: { module: 'assistant', ref: 'assistant-thread-2381', label: 'Assistant suggestion' },
      subject: 'Harvest $3.2k loss in PFE',
      summary: 'Switch to JNJ for 31 days to maintain healthcare exposure.',
      payload: { symbol: 'PFE', loss: 3200, replacement: 'JNJ' },
      created: '2026-05-06T14:55:00-04:00',
      updated: '2026-05-06T14:55:00-04:00',
      history: [
        { at: '2026-05-06T14:55:00-04:00', by: 'FrieNi', event: 'created', note: 'Suggested in Assistant thread' },
      ],
    },
    {
      id: 'TKT-2078',
      kind: 'trim',
      status: 'filled',
      priority: 'normal',
      source: { module: 'zen', ref: 'zen-improvement-2026-05-02', label: 'Zen recommendation' },
      subject: 'Trim AVGO · 22 sh',
      summary: 'Filled at limit · proceeds routed to ladder.',
      payload: { symbol: 'AVGO', shares: 22, limitPx: 1382.40 },
      created: '2026-05-02T10:14:00-04:00',
      updated: '2026-05-02T10:38:00-04:00',
      history: [
        { at: '2026-05-02T10:14:00-04:00', by: 'FrieNi', event: 'created' },
        { at: '2026-05-02T10:21:00-04:00', by: 'Elena',  event: 'queued',  note: 'Confirmed via Zen' },
        { at: '2026-05-02T10:38:00-04:00', by: 'broker', event: 'filled',  note: 'Avg fill 1382.46' },
      ],
    },
    {
      id: 'TKT-2065',
      kind: 'rebalance',
      status: 'dismissed',
      priority: 'low',
      source: { module: 'alerts', ref: 'alert-drift-bonds', label: 'Drift alert' },
      subject: 'Bond sleeve at 11% (target 12%)',
      summary: 'Drift inside ±2% band — no action needed.',
      payload: {},
      created: '2026-04-28T16:02:00-04:00',
      updated: '2026-04-28T16:02:00-04:00',
      history: [
        { at: '2026-04-28T16:02:00-04:00', by: 'Elena', event: 'dismissed', note: 'Within tolerance' },
      ],
    },
  ];

  const state = {
    tickets: seed,
    activeId: null,                 // currently-open ticket id
    inboxFilter: { status: 'open', kind: 'all', source: 'all' },
  };

  const listeners = new Set();
  const notify = () => listeners.forEach(fn => fn(state));

  const now = () => new Date().toISOString();
  const genId = () => 'TKT-' + Math.floor(2090 + Math.random() * 900);

  window.TicketStore = {
    get: () => state,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },

    list: (filter = {}) => {
      return state.tickets.filter(t =>
        (!filter.status || filter.status === 'all' || t.status === filter.status) &&
        (!filter.kind   || filter.kind   === 'all' || t.kind   === filter.kind) &&
        (!filter.source || filter.source === 'all' || t.source.module === filter.source)
      );
    },

    byId: (id) => state.tickets.find(t => t.id === id),

    countOpen: () => state.tickets.filter(t => t.status === 'open').length,

    // Other modules call this to push a ticket. If `dedupeKey` (source.ref) matches
    // an existing open ticket of the same kind, that ticket is reused — so the
    // user never sees duplicate "Trim NVDA" tickets if Zen re-renders.
    openOrCreate: (input) => {
      const ref = input?.source?.ref;
      if (ref) {
        const existing = state.tickets.find(t =>
          t.kind === input.kind && t.source?.ref === ref && t.status !== 'dismissed' && t.status !== 'filled'
        );
        if (existing) {
          state.activeId = existing.id;
          notify();
          return existing;
        }
      }
      const t = {
        id: input.id || genId(),
        kind: input.kind,
        status: input.status || 'open',
        priority: input.priority || 'normal',
        source: input.source || { module: 'system' },
        subject: input.subject || '',
        summary: input.summary || '',
        payload: input.payload || {},
        created: input.created || now(),
        updated: now(),
        history: input.history || [{ at: now(), by: input.source?.module || 'system', event: 'created' }],
      };
      state.tickets.unshift(t);
      state.activeId = t.id;
      notify();
      return t;
    },

    open: (id) => {
      state.activeId = id;
      window.AppStore && window.AppStore.setPage('tickets');
      notify();
    },

    update: (id, patch, historyEvent) => {
      const t = state.tickets.find(t => t.id === id);
      if (!t) return;
      Object.assign(t, patch, { updated: now() });
      if (historyEvent) t.history.push({ at: now(), ...historyEvent });
      notify();
    },

    setStatus: (id, status, note) => {
      window.TicketStore.update(id, { status }, { by: note?.by || 'Elena', event: status, note: note?.note });
    },

    setActive: (id) => { state.activeId = id; notify(); },
    clearActive: () => { state.activeId = null; notify(); },

    setInboxFilter: (patch) => {
      state.inboxFilter = { ...state.inboxFilter, ...patch };
      notify();
    },
  };
})();
