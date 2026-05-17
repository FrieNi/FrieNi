// Main app component

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "skipOnboarding": true,
  "animSpeed": 1
}/*EDITMODE-END*/;

function App() {
  const tweakResult = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const tweaks = tweakResult[0] || TWEAK_DEFAULTS;
  const setTweak = tweakResult[1] || (() => {});
  const animMult = 1 / Math.max(0.1, tweaks.animSpeed || 1);

  // Theme
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('frieni-theme') || 'light';
  });
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('frieni-theme', theme);
  }, [theme]);

  // ===== onboarding / analysis state =====
  // skip by default — user can replay
  const [onboardingActive, setOnboardingActive] = React.useState(false);
  const [analysisActive, setAnalysisActive] = React.useState(false);
  const [tutorialActive, setTutorialActive] = React.useState(false);
  const [populated, setPopulated] = React.useState(true);

  // navigation state
  const [view, setView] = React.useState('portfolio'); // portfolio | strategies | watchlist | etc
  const [selectedStockId, setSelectedStockId] = React.useState(null);
  const [stockTab, setStockTab] = React.useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = React.useState('all');

  // strategies state
  const [strategies, setStrategies] = React.useState(window.FrieNi.STRATEGIES);

  // ai drawer
  const [aiDrawer, setAiDrawer] = React.useState(null);

  // toasts
  const [toasts, setToasts] = React.useState([]);
  function addToast(t) {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, ...t }]);
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  // expose stock-select for cross-component
  React.useEffect(() => {
    window.__selectStock = (id) => {
      setSelectedStockId(id);
      setView('stockDetail');
      setStockTab('overview');
    };
  }, []);

  function selectStock(id) {
    setSelectedStockId(id);
    setView('stockDetail');
    setStockTab('overview');
  }

  function openOnboarding() {
    setOnboardingActive(true);
    setPopulated(false);
  }

  function completeOnboarding(answers) {
    setOnboardingActive(false);
    setAnalysisActive(true);
  }

  function completeAnalysis() {
    setAnalysisActive(false);
    setPopulated(true);
    addToast({
      type: 'success',
      title: 'Analysis complete',
      body: '12 positions across 3 portfolios · all ratings up to date',
      duration: 6000,
    });
    // start tutorial after a brief moment
    setTimeout(() => setTutorialActive(true), 700 * animMult);
  }

  function runAnalysis(strategyId) {
    addToast({
      type: 'success',
      title: 'Re-running analysis…',
      body: `Applying ${strategies.find(s => s.id === strategyId)?.name || 'strategy'} to your portfolio`,
      duration: 2400,
    });
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Strategy applied',
        body: 'Ratings refreshed across 12 positions',
        duration: 4000,
      });
    }, 2400);
  }

  function openAi(context, contextId) {
    setAiDrawer({ context, contextId });
  }

  // crumbs
  const crumbs = React.useMemo(() => {
    const c = [];
    if (view === 'portfolio') {
      c.push({ label: selectedPortfolio === 'all' ? 'All portfolios' : window.FrieNi.PORTFOLIOS.find(p => p.id === selectedPortfolio)?.name });
    } else if (view === 'stockDetail') {
      const s = window.FrieNi.byId(selectedStockId);
      c.push({ label: 'Portfolio', onClick: () => setView('portfolio') });
      if (s) c.push({ label: s.ticker });
    } else if (view === 'strategies') {
      c.push({ label: 'Strategies' });
    } else {
      c.push({ label: view.charAt(0).toUpperCase() + view.slice(1) });
    }
    return c;
  }, [view, selectedStockId, selectedPortfolio]);

  return (
    <>
      <div className="app">
        <Sidebar
          view={view}
          setView={(v) => { setView(v); if (v !== 'stockDetail') setSelectedStockId(null); }}
          selectedPortfolio={selectedPortfolio}
          setSelectedPortfolio={setSelectedPortfolio}
          portfolios={window.FrieNi.PORTFOLIOS}
          theme={theme}
          setTheme={setTheme}
          openOnboarding={openOnboarding}
        />
        <main className="main">
          <div className="topbar">
            <div className="crumbs">
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="sep"><Icon name="chevronRight" size={12} /></span>}
                  {c.onClick ? (
                    <button onClick={c.onClick}>{c.label}</button>
                  ) : (
                    <span className={i === crumbs.length - 1 ? 'current' : ''}>{c.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="topbar-spacer" />
            <button className="btn ghost" style={{padding: '5px 10px'}}>
              <Icon name="search" size={13} /> <span style={{fontSize: 12, color: 'var(--text-3)'}}>Search · </span>
              <span className="mono" style={{fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4}}>⌘K</span>
            </button>
            <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
            </button>
            <button className="icon-btn"><Icon name="bell" size={14} /></button>
            <button className="icon-btn primary" onClick={() => openAi(view === 'stockDetail' ? 'stock' : view === 'strategies' ? 'strategy' : 'portfolio', selectedStockId)} data-tut="ai-btn">
              <Icon name="sparkle" size={14} />
            </button>
          </div>

          {view === 'portfolio' && populated && (
            <PortfolioView
              portfolios={window.FrieNi.PORTFOLIOS}
              selectedPortfolio={selectedPortfolio}
              setSelectedPortfolio={setSelectedPortfolio}
              selectStock={selectStock}
              theme={theme}
              openAi={openAi}
            />
          )}
          {view === 'stockDetail' && selectedStockId && populated && (
            <StockDetail
              stockId={selectedStockId}
              setView={setView}
              selectStock={selectStock}
              theme={theme}
              openAi={openAi}
              tab={stockTab}
              setTab={setStockTab}
            />
          )}
          {view === 'strategies' && (
            <StrategiesView
              strategies={strategies}
              setStrategies={setStrategies}
              theme={theme}
              openAi={openAi}
              runAnalysis={runAnalysis}
            />
          )}
          {(view === 'watchlist' || view === 'screener' || view === 'news') && (
            <div className="content">
              <div className="page-h">
                <h1>{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
                <span className="sub">Coming up next</span>
              </div>
              <div className="card" style={{marginTop: 20}}>
                <div className="card-body" style={{textAlign:'center', padding: 60}}>
                  <Icon name="sparkles" size={32} style={{color: 'var(--text-4)', marginBottom: 10}} />
                  <h3 style={{margin: '6px 0', fontWeight: 500}}>This area's on the roadmap</h3>
                  <p style={{color:'var(--text-3)', maxWidth: 360, margin: '4px auto 16px'}}>
                    The {view} module hooks into the same rating engine — preview coming in the next milestone.
                  </p>
                  <button className="btn primary" onClick={() => setView('portfolio')}>Back to portfolio</button>
                </div>
              </div>
            </div>
          )}
          {!populated && !onboardingActive && !analysisActive && (
            <div className="content" style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap: 16}}>
              <Icon name="briefcase" size={32} style={{color: 'var(--text-4)'}} />
              <div className="page-h"><h1>No portfolio yet</h1></div>
              <button className="btn primary lg" onClick={openOnboarding}>Set up portfolio</button>
            </div>
          )}
        </main>
      </div>

      {onboardingActive && (
        <OnboardingFlow
          onComplete={completeOnboarding}
          onClose={() => { setOnboardingActive(false); setPopulated(true); }}
          animMult={animMult}
        />
      )}

      {analysisActive && (
        <AnalysisLoader onDone={completeAnalysis} animMult={animMult} />
      )}

      {tutorialActive && populated && view === 'portfolio' && (
        <Tutorial onClose={() => setTutorialActive(false)} animMult={animMult} />
      )}

      {aiDrawer && (
        <AiDrawer
          context={aiDrawer.context}
          contextId={aiDrawer.contextId}
          onClose={() => setAiDrawer(null)}
          theme={theme}
          addToast={addToast}
        />
      )}

      <div className="toast-wrap">
        {toasts.map(t => <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />)}
      </div>

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Onboarding" />
          <window.TweakButton
            label="Replay onboarding now"
            onClick={() => { setPopulated(false); setOnboardingActive(true); }}
          />
          <window.TweakToggle
            label="Skip on first load"
            value={tweaks.skipOnboarding}
            onChange={v => setTweak('skipOnboarding', v)}
          />
          <window.TweakSection label="Animation" />
          <window.TweakSlider
            label="Animation speed"
            value={tweaks.animSpeed}
            min={0.25} max={4} step={0.25}
            onChange={v => setTweak('animSpeed', v)}
            unit="×"
          />
          <window.TweakSection label="Theme" />
          <window.TweakRadio
            label="Mode"
            value={theme}
            options={['light', 'dark']}
            onChange={setTheme}
          />
        </window.TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
