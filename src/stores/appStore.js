// Lightweight global store — simple pub/sub, no React state libs needed
(() => {
  const state = {
    page: 'dashboard',          // dashboard | markets | stock | portfolio | news | assistant | settings
    settingsTab: 'Profile',     // Profile | API & Connections | Risk policy | Notifications | Billing
    selectedStock: 'NVDA',
    assistantMode: 'gsd2',      // step | gsd2 | half | full
    apiKeys: {
      alpaca: '',
      ibkr: '',
      polygon: '',
      openai: '',
    },
    // span: how many of the 3 grid columns this widget occupies (1, 2, or 3)
    dashboardWidgets: [
      { id: 'w3', type: 'chart', span: 2, symbol: 'NVDA' },
      { id: 'w2', type: 'portfolio-summary', span: 1 },
      { id: 'w1', type: 'watchlist', span: 1 },
      { id: 'w4', type: 'movers', span: 1 },
      { id: 'w5', type: 'news', span: 1 },
      { id: 'w6', type: 'assistant', span: 2 },
    ],
    editingDashboard: false,
    snapEnabled: true,
    dashboardMode: 'pro',       // pro | zen
    zenScenario: 'improvement', // calm | improvement | warning | blackswan

    // ── First-run wizard ────────────────────────────────────────────────
    wizardOpen: false,
    wizardStep: 0,
    wizardAnswers: {
      skill: null,          // 'new' | 'some' | 'pro'
      goal: null,           // 'grow' | 'income' | 'protect' | 'learn'
      horizon: null,        // 'months' | '1to3y' | '5y' | '10y+'
      cash: null,           // approx $ amount
      domains: [],          // up to 3
      domainNotes: {},      // per-domain freeform context
      style: null,          // pro: 'discretionary' | 'systematic' | 'mix'
      timezone: null,       // pro
      tools: [],            // pro: ['hotkeys','feeds','options','futures']
      riskCap: 2,           // pro: max % loss per position
      broker: null,         // 'alpaca' | 'ibkr' | 'csv'
      notes: {},            // per-step freeform elaboration {skill: '...', goal: '...'}
    },
    profile: null,          // populated on wizard complete

    // ── Workspaces & portfolios ─────────────────────────────────────────
    workspaces: [],         // [{id, name, scope:'all'|'domain', domain?, portfolioIds:[...]}]
    activeWorkspace: null,
    portfolios: [],         // [{id, name, broker, value, domain?}]

    // ── Analysis ────────────────────────────────────────────────────────
    analysis: null,         // {status:'queued'|'running'|'done', stage, progress, startedAt, results}
    analysisOpen: false,    // detail drawer
  };

  const listeners = new Set();
  const notify = () => listeners.forEach(fn => fn(state));

  window.AppStore = {
    get: () => state,
    set: (patch) => { Object.assign(state, patch); notify(); },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    setPage: (page) => { state.page = page; notify(); },
    setSettingsTab: (tab) => { state.page = 'settings'; state.settingsTab = tab; notify(); },
    setStock: (sym) => { state.selectedStock = sym; state.page = 'stock'; notify(); },
    setAssistantMode: (mode) => { state.assistantMode = mode; notify(); },
    setApiKey: (k, v) => { state.apiKeys[k] = v; notify(); },
    toggleEditDashboard: () => { state.editingDashboard = !state.editingDashboard; notify(); },
    toggleSnap: () => { state.snapEnabled = !state.snapEnabled; notify(); },
    setDashboardMode: (mode) => { state.dashboardMode = mode; notify(); },
    setZenScenario: (s) => { state.zenScenario = s; notify(); },
    addWidget: (type, span = 1) => {
      const s = (span === 1 || span === 2 || span === 3) ? span : 1;
      state.dashboardWidgets.push({ id: 'w' + Date.now(), type, span: s });
      notify();
    },
    removeWidget: (id) => {
      state.dashboardWidgets = state.dashboardWidgets.filter(w => w.id !== id);
      notify();
    },
    setWidgetSpan: (id, span) => {
      const w = state.dashboardWidgets.find(w => w.id === id);
      if (w) { w.span = Math.max(1, Math.min(3, span)); notify(); }
    },
    setWidgetHeight: (id, height) => {
      const w = state.dashboardWidgets.find(w => w.id === id);
      if (w) {
        w.height = height || null;
        notify();
      }
    },
    // Move a widget up/down in the flat list (the grid auto-flows them).
    // ── Wizard ──────────────────────────────────────────────────────────
    openWizard: () => { state.wizardOpen = true; state.wizardStep = 0; notify(); },
    closeWizard: () => { state.wizardOpen = false; notify(); },
    setWizardStep: (n) => { state.wizardStep = n; notify(); },
    setWizardAnswer: (k, v) => { state.wizardAnswers = { ...state.wizardAnswers, [k]: v }; notify(); },
    setWizardNote: (stepId, txt) => {
      state.wizardAnswers.notes = { ...(state.wizardAnswers.notes || {}), [stepId]: txt };
      notify();
    },
    setDomainNote: (d, txt) => {
      state.wizardAnswers.domainNotes = { ...state.wizardAnswers.domainNotes, [d]: txt };
      notify();
    },
    completeWizard: () => {
      const a = state.wizardAnswers;
      state.profile = { ...a, completedAt: Date.now() };
      // Seed portfolios based on broker choice
      const seedPortfolios = a.broker === 'csv'
        ? [{ id: 'p1', name: 'Imported · main.csv', broker: 'CSV', value: 84320, currency: 'USD' }]
        : a.broker === 'ibkr'
          ? [
              { id: 'p1', name: 'IBKR · Margin', broker: 'IBKR', value: 142500, currency: 'USD' },
              { id: 'p2', name: 'IBKR · IRA', broker: 'IBKR', value: 38200, currency: 'USD' },
            ]
          : [
              { id: 'p1', name: 'Alpaca · Live', broker: 'Alpaca', value: 96400, currency: 'USD' },
              { id: 'p2', name: 'Alpaca · Paper', broker: 'Alpaca', value: 100000, currency: 'USD' },
            ];
      state.portfolios = seedPortfolios;
      // Workspaces: one "All" + one per chosen domain
      const allIds = seedPortfolios.map(p => p.id);
      const domainWorkspaces = (a.domains || []).map((d, i) => ({
        id: 'ws-' + d,
        name: d,
        scope: 'domain',
        domain: d,
        portfolioIds: allIds, // narrowed by domain semantically; still pulls from all portfolios
      }));
      state.workspaces = [
        { id: 'ws-all', name: 'All portfolios', scope: 'all', portfolioIds: allIds },
        ...domainWorkspaces,
      ];
      state.activeWorkspace = 'ws-all';
      state.wizardOpen = false;
      // Kick off analysis
      window.AppStore.startAnalysis();
      notify();
    },
    setActiveWorkspace: (id) => { state.activeWorkspace = id; notify(); },
    setAnalysisOpen: (b) => { state.analysisOpen = b; notify(); },
    startAnalysis: () => {
      const stages = [
        { key: 'fetch', label: 'Pulling positions' },
        { key: 'context', label: 'Loading domain context' },
        { key: 'score', label: 'Scoring exposures' },
        { key: 'draft', label: 'Drafting recommendations' },
      ];
      state.analysis = {
        status: 'running',
        stage: 0,
        stages,
        progress: 0,
        startedAt: Date.now(),
        results: null,
      };
      notify();
      // Simulate
      let p = 0;
      const tick = () => {
        if (!state.analysis || state.analysis.status !== 'running') return;
        p += 4 + Math.random() * 6;
        if (p >= 100) {
          state.analysis.progress = 100;
          state.analysis.stage = stages.length - 1;
          state.analysis.status = 'done';
          state.analysis.results = window.AppStore.buildAnalysisResults();
          notify();
          return;
        }
        state.analysis.progress = p;
        state.analysis.stage = Math.min(stages.length - 1, Math.floor(p / 25));
        notify();
        setTimeout(tick, 400 + Math.random() * 300);
      };
      setTimeout(tick, 600);
    },
    rerunAnalysis: () => { window.AppStore.startAnalysis(); },
    buildAnalysisResults: () => {
      const a = state.wizardAnswers;
      const domains = a.domains && a.domains.length ? a.domains : ['Broad market'];
      return {
        verdict: 'attention',
        headline: domains.length > 1
          ? `${domains[0]} exposure looks crowded; ${domains[1]} is underweight.`
          : `${domains[0]} concentration is high — consider trimming on strength.`,
        portfolioMetrics: {
          domainFit: 72,
          concentration: 58,
          riskFit: a.skill === 'new' ? 81 : 64,
        },
        domains: domains.map((d, i) => ({
          name: d,
          stance: ['Long bias', 'Sideways', 'Reduce'][i % 3],
          confidence: 0.62 + (i * 0.07) % 0.3,
          note: i === 0
            ? 'Cycle indicators turned positive last week. Capacity tightening into Q3.'
            : 'Mixed signals; macro overhang. Sit on hands.',
        })),
        actions: [
          { kind: 'trim', target: 'NVDA', size: '15%', why: `Concentration in ${domains[0]} above your comfort.` },
          { kind: 'rotate', target: 'AVGO → MU', size: '$8k', why: 'Better risk-adjusted setup inside the same domain.' },
          { kind: 'hedge', target: 'SOXX puts', size: '0.6% NAV', why: 'Cheap insurance ahead of CPI.' },
        ],
        positions: [
          { sym: 'NVDA', name: 'NVIDIA', domain: domains[0], weight: 24.1, stance: 'Trim', conf: 0.71, note: 'Above target weight; momentum cooling.' },
          { sym: 'AVGO', name: 'Broadcom', domain: domains[0], weight: 9.8, stance: 'Hold', conf: 0.58, note: 'Capex visibility intact.' },
          { sym: 'MU', name: 'Micron', domain: domains[0], weight: 4.2, stance: 'Add', conf: 0.66, note: 'Memory pricing inflecting.' },
          { sym: 'SMCI', name: 'Super Micro', domain: domains[0], weight: 3.1, stance: 'Hold', conf: 0.41, note: 'Headline risk remains.' },
          { sym: 'TSM', name: 'TSMC', domain: domains[0], weight: 6.4, stance: 'Hold', conf: 0.69, note: 'Foundry pricing power.' },
        ],
      };
    },
    reorderWidget: (id, dir) => {
      const arr = state.dashboardWidgets;
      const idx = arr.findIndex(w => w.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= arr.length) return;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      notify();
    },
  };
})();
