// Layouts
const DefaultLayout = ({ page, onNav, children }) => (
  <div className="app-shell">
    <Sidebar page={page} onNav={onNav} />
    <div className="app-main">
      <Topbar indices={window.MarketData.indices} />
      <div className="app-content">{children}</div>
    </div>
    {window.AnalysisSheet && <AnalysisSheet />}
  </div>
);

window.DefaultLayout = DefaultLayout;
