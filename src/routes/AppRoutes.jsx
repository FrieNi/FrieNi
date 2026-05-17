// Routing — minimal hash-free in-memory router driven by AppStore
const AppRoutes = () => {
  const [state, setState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);

  const onNav = (id) => window.AppStore.setPage(id);

  // First-run onboarding lives inside the app shell so the sidebar/topbar
  // chrome stays consistent. The sidebar shows a contextual "setup" state.
  if (state.wizardOpen) {
    return (
      <DefaultLayout page="onboarding" onNav={onNav}>
        <OnboardingWizard />
      </DefaultLayout>
    );
  }

  let Page;
  switch (state.page) {
    case 'dashboard': Page = window.DashboardPage; break;
    case 'markets': Page = window.MarketsPage; break;
    case 'stock': Page = window.StockDetailPage; break;
    case 'portfolio': Page = window.PortfolioPage; break;
    case 'news': Page = window.NewsPage; break;
    case 'assistant': Page = window.AssistantPage; break;
    case 'settings': Page = window.SettingsPage; break;
    case 'screener': Page = window.MarketsPage; break;
    case 'alerts': Page = window.NewsPage; break;
    case 'digest': Page = window.WeeklyDigestPage; break;
    case 'trim-ticket': Page = window.TrimTicketPage; break;
    case 'tickets': Page = window.TicketsPage; break;
    default: Page = window.DashboardPage;
  }

  return (
    <DefaultLayout page={state.page} onNav={onNav}>
      <Page />
    </DefaultLayout>
  );
};

window.AppRoutes = AppRoutes;
