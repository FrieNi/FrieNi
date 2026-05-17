// Stock detail page — drill-down with fundamentals, technicals, sentiment
const ScoreBar = ({ label, value, max = 100, color }) => (
  <div className="score-row">
    <div className="score-label">{label}</div>
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color || 'var(--brand)' }}></div>
    </div>
    <div className="score-val">{value}</div>
  </div>
);

// ─── Source attribution data ──────────────────────────────────────────────
// In a real system this would come from a provenance service.
const SOURCES = {
  'Market Cap': {
    consensus: '$3.16T', confidence: 'high', conflict: false,
    derivation: 'Shares Outstanding × Last Trade',
    sources: [
      { name: 'NASDAQ Last Trade', value: '$3.16T', ts: '11:42:08 ET', weight: 0.45, doc: 'NASDAQ TotalView feed', excerpt: 'NVDA  LAST 1287.42  SHRS_OUT 2,455,832,000  MKTCAP 3,162,398,765,440' },
      { name: 'Bloomberg Terminal', value: '$3.16T', ts: '11:42:00 ET', weight: 0.35, doc: 'BBG <NVDA US Equity> CUR_MKT_CAP', excerpt: 'CUR_MKT_CAP   3,159,440  USD MM   AS_OF 2026-05-07T15:42:00Z' },
      { name: 'Refinitiv Eikon', value: '$3.15T', ts: '11:40:30 ET', weight: 0.20, doc: 'TR.CompanyMarketCap', excerpt: 'CompanyMarketCap = 3,153,892 USD MM   delay=90s' },
    ],
  },
  'P/E (TTM)': {
    consensus: '68.2', confidence: 'medium', conflict: true,
    derivation: 'Last Price ÷ TTM Diluted EPS',
    sources: [
      { name: 'S&P CapIQ', value: '68.2', ts: 'EOD 05-06', weight: 0.40, doc: 'CIQ Fundamentals · IQ_PE_EXCL', excerpt: 'IQ_PE_EXCL = 68.21    EPS_DILUTED_TTM = 18.84    PRICE = 1285.40' },
      { name: 'Bloomberg', value: '68.4', ts: 'Live', weight: 0.35, doc: 'BBG PE_RATIO', excerpt: 'PE_RATIO   68.41    TRAIL_12M_DILUTED_EPS  18.81' },
      { name: 'Yahoo Finance', value: '64.9', ts: 'EOD 05-06', weight: 0.10, doc: 'finance.yahoo.com/quote/NVDA', excerpt: 'Trailing P/E    64.91   <-- uses basic EPS, not diluted' },
      { name: 'FactSet', value: '68.3', ts: 'EOD 05-06', weight: 0.15, doc: 'FDS FF_PE', excerpt: 'FF_PE = 68.27    period=TTM    method=diluted-excl-extra' },
    ],
  },
  'EPS (TTM)': {
    consensus: '$18.84', confidence: 'high', conflict: false,
    derivation: 'Sum of last 4 quarterly diluted EPS (10-Q + 10-K)',
    sources: [
      { name: 'SEC 10-Q (Q1 FY26)', value: '$18.84', ts: 'Filed 2026-02-26', weight: 0.50, doc: 'SEC EDGAR · 10-Q · Form 6.K', excerpt: 'Diluted earnings per share — three months ended:   $5.16  Trailing twelve months:  $18.84' },
      { name: 'S&P CapIQ', value: '$18.84', ts: 'EOD 05-06', weight: 0.30, doc: 'IQ_DILUT_EPS_INCL_EXTRA_TTM', excerpt: 'IQ_DILUT_EPS_INCL_EXTRA_TTM = 18.8400' },
      { name: 'Bloomberg', value: '$18.81', ts: 'Live', weight: 0.20, doc: 'BBG TRAIL_12M_DIL_EPS', excerpt: 'TRAIL_12M_DIL_EPS  18.81  (excludes one-time tax benefit)' },
    ],
  },
  'Forward P/E': {
    consensus: '42.1', confidence: 'low', conflict: true,
    derivation: 'Last Price ÷ Consensus FY+1 EPS estimate',
    sources: [
      { name: 'Refinitiv I/B/E/S', value: '42.1', ts: 'Updated 05-06', weight: 0.45, doc: 'I/B/E/S Consensus · 38 analysts', excerpt: 'FY27 EPS Mean = 30.55  Median = 30.40  High = 36.20  Low = 24.10  N=38' },
      { name: 'Bloomberg BEst', value: '40.9', ts: 'Live', weight: 0.35, doc: 'BBG BEST_PE_RATIO', excerpt: 'BEST_PE_RATIO   40.92   period=BF1   contributors=42' },
      { name: 'Visible Alpha', value: '44.6', ts: 'EOD 05-06', weight: 0.20, doc: 'VA Consensus · sell-side detail', excerpt: 'FY27 EPS Mean = 28.81 (excludes 4 buy-side outliers)   StdDev = 3.21' },
    ],
  },
  'Revenue (TTM)': {
    consensus: '$96.3B', confidence: 'high', conflict: false,
    derivation: 'Sum of last 4 quarterly net revenue',
    sources: [
      { name: 'SEC 10-Q (Q1 FY26)', value: '$96.31B', ts: 'Filed 2026-02-26', weight: 0.55, doc: 'SEC EDGAR · 10-Q', excerpt: 'Revenue     Three months ended Jan 28, 2026: $26,044   Trailing twelve months: $96,307 (in millions)' },
      { name: 'S&P CapIQ', value: '$96.31B', ts: 'EOD 05-06', weight: 0.25, doc: 'IQ_TOTAL_REV_TTM', excerpt: 'IQ_TOTAL_REV_TTM = 96,307.0' },
      { name: 'Bloomberg', value: '$96.30B', ts: 'Live', weight: 0.20, doc: 'BBG SALES_REV_TURN', excerpt: 'SALES_REV_TURN   96,302.4  USD MM  TTM' },
    ],
  },
  'Rev Growth YoY': {
    consensus: '+126%', confidence: 'high', conflict: false,
    derivation: '(TTM Revenue − Prior TTM Revenue) ÷ Prior TTM Revenue',
    sources: [
      { name: 'Derived from 10-Q', value: '+126.4%', ts: 'Filed 2026-02-26', weight: 0.60, doc: 'SEC EDGAR · 10-Q', excerpt: 'TTM 96,307   Prior TTM 42,540   YoY = (96307−42540)/42540 = 126.39%' },
      { name: 'S&P CapIQ', value: '+126.4%', ts: 'EOD 05-06', weight: 0.25, doc: 'IQ_TOTAL_REV_GROWTH_TTM', excerpt: 'IQ_TOTAL_REV_GROWTH_TTM = 126.40' },
      { name: 'Bloomberg', value: '+126.1%', ts: 'Live', weight: 0.15, doc: 'BBG SALES_GROWTH', excerpt: 'SALES_GROWTH   126.12   period=TTM_YOY' },
    ],
  },
  'Gross Margin': {
    consensus: '74.2%', confidence: 'high', conflict: false,
    derivation: '(Revenue − COGS) ÷ Revenue, TTM',
    sources: [
      { name: 'SEC 10-Q', value: '74.21%', ts: 'Filed 2026-02-26', weight: 0.60, doc: 'SEC EDGAR · 10-Q', excerpt: 'Gross profit  71,478   Revenue  96,307   GM = 74.21%' },
      { name: 'S&P CapIQ', value: '74.2%', ts: 'EOD 05-06', weight: 0.25, doc: 'IQ_GROSS_MARGIN', excerpt: 'IQ_GROSS_MARGIN = 74.215' },
      { name: 'FactSet', value: '74.2%', ts: 'EOD 05-06', weight: 0.15, doc: 'FDS FF_GROSS_MGN', excerpt: 'FF_GROSS_MGN = 74.21' },
    ],
  },
  'Op Margin': {
    consensus: '62.1%', confidence: 'medium', conflict: true,
    derivation: 'Operating Income ÷ Revenue, TTM',
    sources: [
      { name: 'SEC 10-Q', value: '62.07%', ts: 'Filed 2026-02-26', weight: 0.55, doc: 'SEC EDGAR · 10-Q', excerpt: 'Operating income  59,772    Revenue  96,307    OpMargin = 62.07%' },
      { name: 'S&P CapIQ', value: '62.1%', ts: 'EOD 05-06', weight: 0.25, doc: 'IQ_EBIT_MARGIN', excerpt: 'IQ_EBIT_MARGIN = 62.07' },
      { name: 'Bloomberg (adj.)', value: '64.8%', ts: 'Live', weight: 0.20, doc: 'BBG OPER_MARGIN — non-GAAP', excerpt: 'OPER_MARGIN  64.82   adjusts for $2.6B SBC and one-time legal' },
    ],
  },
  'ROE': {
    consensus: '118.4%', confidence: 'medium', conflict: false,
    derivation: 'Net Income TTM ÷ Avg Shareholders Equity',
    sources: [
      { name: 'S&P CapIQ', value: '118.4%', ts: 'EOD 05-06', weight: 0.50, doc: 'IQ_RETURN_EQUITY', excerpt: 'IQ_RETURN_EQUITY = 118.41   method=avg_equity' },
      { name: 'Bloomberg', value: '116.9%', ts: 'Live', weight: 0.30, doc: 'BBG RETURN_COM_EQY', excerpt: 'RETURN_COM_EQY  116.91   method=ending_equity' },
      { name: 'Derived from 10-Q', value: '120.2%', ts: 'Filed 2026-02-26', weight: 0.20, doc: 'SEC EDGAR · 10-Q', excerpt: 'NI TTM 46,180   Avg Equity 38,420   ROE = 120.20%' },
    ],
  },
  'Debt/Equity': {
    consensus: '0.18', confidence: 'high', conflict: false,
    derivation: 'Total Debt ÷ Shareholders Equity',
    sources: [
      { name: 'SEC 10-Q', value: '0.184', ts: 'Filed 2026-02-26', weight: 0.55, doc: 'SEC EDGAR · 10-Q', excerpt: 'Long-term debt 8,463   Short-term 0    Equity 45,940   D/E = 0.184' },
      { name: 'S&P CapIQ', value: '0.18', ts: 'EOD 05-06', weight: 0.25, doc: 'IQ_TOTAL_DEBT_EQUITY', excerpt: 'IQ_TOTAL_DEBT_EQUITY = 0.1842' },
      { name: 'Bloomberg', value: '0.18', ts: 'Live', weight: 0.20, doc: 'BBG TOT_DEBT_TO_TOT_EQY', excerpt: 'TOT_DEBT_TO_TOT_EQY  18.42   (expressed ×100)' },
    ],
  },
  'FCF Yield': {
    consensus: '2.1%', confidence: 'low', conflict: true,
    derivation: 'Free Cash Flow TTM ÷ Market Cap',
    sources: [
      { name: 'S&P CapIQ', value: '2.1%', ts: 'EOD 05-06', weight: 0.40, doc: 'IQ_FCF_YIELD', excerpt: 'IQ_FCF_YIELD = 2.103   FCF defn: CFO − CapEx' },
      { name: 'Bloomberg', value: '2.4%', ts: 'Live', weight: 0.35, doc: 'BBG FREE_CASH_FLOW_YIELD', excerpt: 'FREE_CASH_FLOW_YIELD  2.41   FCF=CFO-CapEx-SBC adj' },
      { name: 'FactSet', value: '1.8%', ts: 'EOD 05-06', weight: 0.25, doc: 'FDS FF_FCF_YLD', excerpt: 'FF_FCF_YLD = 1.83   FCF=CFO-CapEx-Acquisitions' },
    ],
  },
  'Dividend': {
    consensus: '$0.04 (0.003%)', confidence: 'high', conflict: false,
    derivation: 'Last declared annualized × 4 ÷ Last Price',
    sources: [
      { name: 'NVIDIA IR Press Release', value: '$0.04', ts: '2026-02-26', weight: 0.60, doc: 'investor.nvidia.com/press-release', excerpt: 'The Board declared a quarterly cash dividend of $0.01 per share, payable June 27, 2026.' },
      { name: 'NASDAQ Dividend Feed', value: '$0.04', ts: '2026-02-26', weight: 0.25, doc: 'NASDAQ Corporate Actions', excerpt: 'NVDA  DIV  0.0100  EX_DATE 2026-06-05  PAY_DATE 2026-06-27  FREQ Q' },
      { name: 'Bloomberg', value: '$0.04', ts: 'Live', weight: 0.15, doc: 'BBG DVD_SH_LAST', excerpt: 'DVD_SH_LAST  0.04   ANNUALIZED  YIELD 0.0031%' },
    ],
  },
};

const CONF_META = {
  high:   { color: 'var(--gain)', soft: 'var(--gain-soft)', label: 'High confidence' },
  medium: { color: 'var(--warn)', soft: 'var(--warn-soft)', label: 'Medium confidence' },
  low:    { color: 'var(--loss)', soft: 'var(--loss-soft)', label: 'Low confidence' },
};

const ConfDot = ({ level }) => {
  const m = CONF_META[level];
  return <span className="conf-dot" style={{ background: m.color }} title={m.label}></span>;
};

const FundRow = ({ label, value, onOpen, active }) => {
  const meta = SOURCES[label];
  if (!meta) return (
    <div className="fund-row">
      <span className="fund-label">{label}</span>
      <span className="fund-val">{value}</span>
    </div>
  );
  return (
    <button
      className={`fund-row fund-row-clickable ${active ? 'fund-row-active' : ''}`}
      onClick={() => onOpen(label)}
      type="button"
    >
      <span className="fund-label">
        <ConfDot level={meta.confidence} />
        {label}
        {meta.conflict && <span className="fund-conflict" title="Sources disagree">≠</span>}
      </span>
      <span className="fund-val">
        {value}
        <span className="fund-src-count">{meta.sources.length}</span>
      </span>
    </button>
  );
};

// Source attribution drawer (replaces right column when active)
const SourceDrawer = ({ metric, onClose, onOpenSource }) => {
  const meta = SOURCES[metric];
  if (!meta) return null;
  const cm = CONF_META[meta.confidence];
  const totalWeight = meta.sources.reduce((s, x) => s + x.weight, 0);

  return (
    <Card
      className="src-drawer"
      title={<span className="src-drawer-title"><span className="src-drawer-eyebrow">Source attribution</span>{metric}</span>}
      titleSize="lg"
      actions={<button className="src-drawer-close" onClick={onClose} aria-label="Close">×</button>}
    >
      {/* Consensus header */}
      <div className="src-consensus">
        <div>
          <div className="label-cap" style={{ marginBottom: 4 }}>Consensus</div>
          <div className="src-consensus-val">{meta.consensus}</div>
        </div>
        <div className="src-conf-pill" style={{ background: cm.soft, color: cm.color }}>
          <span className="conf-dot" style={{ background: cm.color }}></span>
          {cm.label}
          {meta.conflict && <span className="src-conflict-flag">· conflicting</span>}
        </div>
      </div>

      <div className="src-derivation">
        <span className="label-cap">Formula</span>
        <code>{meta.derivation}</code>
      </div>

      {/* Distribution bar */}
      <div className="src-dist">
        <div className="label-cap" style={{ marginBottom: 6 }}>Source weighting</div>
        <div className="src-dist-track">
          {meta.sources.map((s, i) => (
            <div
              key={i}
              className="src-dist-seg"
              style={{
                width: `${(s.weight / totalWeight) * 100}%`,
                background: `var(--chart-${(i % 6) + 1})`,
              }}
              title={`${s.name} · ${Math.round(s.weight * 100)}%`}
            ></div>
          ))}
        </div>
      </div>

      {/* Source list */}
      <div className="src-list">
        {meta.sources.map((s, i) => (
          <div key={i} className="src-item">
            <div className="src-item-bar" style={{ background: `var(--chart-${(i % 6) + 1})` }}></div>
            <div className="src-item-body">
              <div className="src-item-head">
                <div className="src-item-name">{s.name}</div>
                <div className="src-item-val">{s.value}</div>
              </div>
              <div className="src-item-meta">
                <span>{s.doc}</span>
                <span className="src-item-sep">·</span>
                <span>{s.ts}</span>
                <span className="src-item-sep">·</span>
                <span>weight {Math.round(s.weight * 100)}%</span>
              </div>
              <button className="src-item-view" onClick={() => onOpenSource({ metric, source: s, value: meta.consensus })}>
                View highlighted source →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="src-foot">
        Confidence reflects source agreement, recency, and provider reliability. Tap any source to see the original document with the cited value highlighted.
      </div>
    </Card>
  );
};

// Source viewer modal — shows the original document with highlighted excerpt
const SourceViewerModal = ({ payload, onClose }) => {
  if (!payload) return null;
  const { metric, source } = payload;

  // Build a mock document with the excerpt embedded and highlighted
  const matchValue = source.value.replace(/[$%TBM,]/g, '').trim();

  return (
    <div className="src-modal-backdrop" onClick={onClose}>
      <div className="src-modal" onClick={(e) => e.stopPropagation()}>
        <div className="src-modal-head">
          <div>
            <div className="src-modal-eyebrow">Source viewer · {metric}</div>
            <div className="src-modal-title">{source.name}</div>
          </div>
          <div className="row row-gap-2">
            <Button variant="ghost" size="xs">Open in new tab ↗</Button>
            <Button variant="ghost" size="xs">Copy citation</Button>
            <button className="src-drawer-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="src-modal-meta">
          <span className="src-modal-meta-item"><span className="label-cap">Document</span>{source.doc}</span>
          <span className="src-modal-meta-item"><span className="label-cap">Captured</span>{source.ts}</span>
          <span className="src-modal-meta-item"><span className="label-cap">Reported value</span><b>{source.value}</b></span>
        </div>

        <div className="src-modal-doc">
          <div className="src-modal-doc-chrome">
            <span className="src-modal-doc-dot"></span>
            <span className="src-modal-doc-dot"></span>
            <span className="src-modal-doc-dot"></span>
            <span className="src-modal-doc-path">{source.doc}</span>
          </div>
          <pre className="src-modal-doc-body">
{`/* … upstream context … */

`}
            <mark className="src-highlight">{source.excerpt}</mark>
{`

/* … downstream context … */`}
          </pre>
        </div>

        <div className="src-modal-foot">
          <span className="src-modal-foot-key"><kbd>Esc</kbd> close</span>
          <span className="src-modal-foot-key"><kbd>←</kbd> <kbd>→</kbd> previous / next source</span>
        </div>
      </div>
    </div>
  );
};

const StockDetailPage = () => {
  const [state] = useState(window.AppStore.get());
  const [tab, setTab] = useState('overview');
  const [drillMetric, setDrillMetric] = useState(null);
  const [viewerPayload, setViewerPayload] = useState(null);
  const stock = window.MarketData.getStock(state.selectedStock) || window.MarketData.stocks[0];
  const candles = window.MarketData.getCandles(stock.seed, 60, stock.price * 0.85);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (viewerPayload) setViewerPayload(null);
        else if (drillMetric) setDrillMetric(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drillMetric, viewerPayload]);

  return (
    <div>
      <div className="stock-head">
        <div className="stock-mark">{stock.symbol.slice(0, 2)}</div>
        <div style={{ flex: 1 }}>
          <div className="row row-gap-3" style={{ alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>{stock.symbol}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>{stock.name}</div>
            <Badge variant="neutral">{stock.sector}</Badge>
            <Badge variant="info" dot>NASDAQ</Badge>
          </div>
          <div className="row row-gap-4" style={{ marginTop: 6, alignItems: 'baseline' }}>
            <div className="stock-price">${window.FmtUtils.fmtPrice(stock.price)}</div>
            <Delta value={stock.change} pct={stock.pct} size="15px" />
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>at 11:42 AM ET · vol 22.4M</span>
          </div>
        </div>
        <div className="row row-gap-2">
          <Button variant="secondary" size="sm">Add alert</Button>
          <Button variant="secondary" size="sm">Watchlist ★</Button>
          <Button variant="success" size="sm">Buy</Button>
          <Button variant="danger" size="sm">Sell</Button>
        </div>
      </div>

      <div className="tabs">
        {['overview', 'technicals', 'fundamentals', 'sentiment', 'news', 'options'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'tab-active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === 'technicals' && <window.TechnicalsTab stock={stock} candles={candles} />}
      {tab === 'fundamentals' && <window.FundamentalsTab stock={stock} />}
      {tab === 'sentiment' && <window.SentimentTab stock={stock} />}
      {tab === 'news' && <window.NewsTab stock={stock} />}
      {tab === 'options' && <window.OptionsTab stock={stock} />}

      {tab === 'overview' && (
      <div className="stock-grid">
        <div className="col gap-4">
          <Card title="Price · Daily" titleSize="lg" actions={
            <div className="row row-gap-2">
              <div className="chart-tabs">
                {['1D','1W','1M','3M','1Y'].map(r => (
                  <div key={r} className={`chart-tab ${r === '3M' ? 'chart-tab-active' : ''}`}>{r}</div>
                ))}
              </div>
              <Button variant="ghost" size="xs">Indicators</Button>
            </div>
          }>
            <Candlestick data={candles} height={340} />
          </Card>

          <Card title="Analyst signals" titleSize="lg">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="label-cap" style={{ marginBottom: 8 }}>Composite Scores</div>
                <ScoreBar label="Fundamentals" value={82} color="var(--gain)" />
                <ScoreBar label="Technicals" value={67} color="var(--brand)" />
                <ScoreBar label="Momentum" value={91} color="var(--gain)" />
                <ScoreBar label="Sentiment" value={74} color="var(--info)" />
                <ScoreBar label="Quality" value={88} color="var(--gain)" />
                <ScoreBar label="Value" value={32} color="var(--loss)" />
              </div>
              <div>
                <div className="label-cap" style={{ marginBottom: 8 }}>Wall Street</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Strong Buy</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12 }}>42 analysts · avg PT $1,420</div>
                <BarChart data={[
                  { label: 'Strong Buy', value: 28 },
                  { label: 'Buy', value: 10 },
                  { label: 'Hold', value: 3 },
                  { label: 'Sell', value: 1 },
                  { label: 'S. Sell', value: 0 },
                ]} height={120} />
              </div>
            </div>
          </Card>

          <Card title="Fundamentals" titleSize="lg" bodyClass="tight" actions={
            <div className="fund-legend">
              <span className="fund-legend-item"><span className="conf-dot" style={{ background: 'var(--gain)' }}></span>High</span>
              <span className="fund-legend-item"><span className="conf-dot" style={{ background: 'var(--warn)' }}></span>Med</span>
              <span className="fund-legend-item"><span className="conf-dot" style={{ background: 'var(--loss)' }}></span>Low</span>
              <span className="fund-legend-item"><span className="fund-conflict" style={{ marginLeft: 0 }}>≠</span>Conflict</span>
            </div>
          }>
            <div className="fund-grid">
              {[
                ['Market Cap', '$3.16T'],
                ['P/E (TTM)', '68.2'],
                ['EPS (TTM)', '$18.84'],
                ['Forward P/E', '42.1'],
                ['Revenue (TTM)', '$96.3B'],
                ['Rev Growth YoY', '+126%'],
                ['Gross Margin', '74.2%'],
                ['Op Margin', '62.1%'],
                ['ROE', '118.4%'],
                ['Debt/Equity', '0.18'],
                ['FCF Yield', '2.1%'],
                ['Dividend', '$0.04 (0.003%)'],
              ].map(([label, value]) => (
                <FundRow key={label} label={label} value={value} active={drillMetric === label} onOpen={setDrillMetric} />
              ))}
            </div>
            <div className="fund-foot">
              Click any row to inspect sources, view original documents, and check confidence.
            </div>
          </Card>
        </div>

        <div className="col gap-4">
          {drillMetric ? (
            <SourceDrawer
              metric={drillMetric}
              onClose={() => setDrillMetric(null)}
              onOpenSource={(p) => setViewerPayload(p)}
            />
          ) : (
            <>
            <Card title="Sentiment" titleSize="lg">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Donut size={120} thickness={20} segments={[
                { value: 64, color: 'var(--gain)' },
                { value: 22, color: 'var(--ink-4)' },
                { value: 14, color: 'var(--loss)' },
              ]} label={
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--gain)' }}>+0.64</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bullish</div>
                </>
              } />
              <div className="col gap-2" style={{ fontSize: 12 }}>
                <div className="row row-gap-2"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--gain)' }}></span>Bullish 64%</div>
                <div className="row row-gap-2"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--ink-4)' }}></span>Neutral 22%</div>
                <div className="row row-gap-2"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--loss)' }}></span>Bearish 14%</div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
              <div className="label-cap" style={{ marginBottom: 8 }}>By source</div>
              <ScoreBar label="News (24h)" value={78} color="var(--gain)" />
              <ScoreBar label="Social" value={84} color="var(--gain)" />
              <ScoreBar label="Analyst" value={71} color="var(--gain)" />
              <ScoreBar label="Insider" value={45} color="var(--warn)" />
              <ScoreBar label="Options flow" value={68} color="var(--info)" />
            </div>
          </Card>

          <Card title="Key technicals" titleSize="lg" bodyClass="tight">
            <div className="fund-grid">
              <FundRow label="50d MA" value="$1,184" />
              <FundRow label="200d MA" value="$924" />
              <FundRow label="RSI (14)" value="62.4" />
              <FundRow label="MACD" value="+12.4" />
              <FundRow label="Beta" value="1.84" />
              <FundRow label="ATR (14)" value="$28.1" />
              <FundRow label="52w High" value="$1,344" />
              <FundRow label="52w Low" value="$394" />
            </div>
          </Card>

          <Card title="AI thesis" titleSize="lg" actions={<Badge variant="brand" dot>Generated</Badge>}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              <strong>Bull case.</strong> Rubin architecture launches into a tight supply environment.
              Hyperscaler capex commitments through 2027 support 80%+ of consensus revenue. Margin
              has room to expand as Blackwell ramps yields.
              <div style={{ marginTop: 8 }}>
                <strong>Bear case.</strong> Custom silicon at AWS/GCP could compress 2027 share. Concentration
                in 3 customers (~52% of DC revenue) is the largest tail risk.
              </div>
            </div>
            <Button variant="ghost" size="sm" style={{ marginTop: 10, padding: 0 }}>Continue with assistant →</Button>
          </Card>
            </>
          )}
        </div>
      </div>
      )}
      <SourceViewerModal payload={viewerPayload} onClose={() => setViewerPayload(null)} />
    </div>
  );
};

window.StockDetailPage = StockDetailPage;
