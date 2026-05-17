// Dashboard widgets — small composable cards
//
// Resize behaviour:
//  - Right edge:  snaps to grid columns (1, 2, 3) — span is discrete.
//  - Bottom edge: free drag with min/max content bounds; if `snap` is on,
//    snaps to ~80px row increments so neighbours can line up.
const SNAP_ROW = 80;       // pixels per snap row
const MIN_HEIGHT = 140;
const MAX_HEIGHT = 900;

const Widget = ({ title, actions, children, padded = true, editing, onRemove, onMove, onSpan, onHeight, snap = true, span = 1, height }) => {
  const ref = React.useRef(null);
  const [drag, setDrag] = React.useState(null);

  const onDragStart = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = ref.current.getBoundingClientRect();
    setDrag({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: span,
      startH: rect.height,
      colW: rect.width / span,
      hoverSpan: span,
      liveH: rect.height,
    });
  };

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      if (drag.type === 'r') {
        const dx = e.clientX - drag.startX;
        const targetW = drag.startSpan * drag.colW + dx;
        let s = Math.round(targetW / drag.colW);
        s = Math.max(1, Math.min(3, s));
        if (s !== drag.hoverSpan) setDrag(d => d && { ...d, hoverSpan: s });
      } else if (drag.type === 'b') {
        const dy = e.clientY - drag.startY;
        let h = drag.startH + dy;
        if (snap) h = Math.round(h / SNAP_ROW) * SNAP_ROW;
        h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h));
        setDrag(d => d && { ...d, liveH: h });
      }
    };
    const onUp = () => {
      if (drag.type === 'r' && drag.hoverSpan !== drag.startSpan) {
        onSpan && onSpan(drag.hoverSpan);
      } else if (drag.type === 'b') {
        onHeight && onHeight(Math.round(drag.liveH));
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, onSpan, onHeight, snap]);

  const liveStyle = {};
  if (drag && drag.type === 'b') liveStyle.height = drag.liveH;
  else if (height) liveStyle.height = height;

  const ghostSpan = drag && drag.type === 'r' ? drag.hoverSpan : null;
  const showSnapLines = drag && drag.type === 'b' && snap;

  return (
    <div
      ref={ref}
      className={`widget ${editing ? 'widget-edit' : ''} ${drag ? 'widget-dragging' : ''}`}
      style={{ width: '100%', ...liveStyle }}
      data-span={span}
    >
      {editing && (
        <div className="widget-handle">
          <button title="Move up" onClick={() => onMove && onMove(-1)}>↑</button>
          <button title="Move down" onClick={() => onMove && onMove(1)}>↓</button>
          <button title="Remove" onClick={onRemove}>×</button>
        </div>
      )}
      {title && (
        <div className="card-head">
          <div className="card-title">{title}</div>
          {actions && <div className="row row-gap-2">{actions}</div>}
        </div>
      )}
      <div style={{ padding: padded ? 0 : 0, height: liveStyle.height ? `calc(100% - 0px)` : 'auto', overflow: liveStyle.height ? 'hidden' : 'visible' }}>{children}</div>

      {editing && onSpan && (
        <div className="widget-resize widget-resize-r" onPointerDown={onDragStart('r')} title="Drag to resize width">
          <span className="widget-resize-grip" />
        </div>
      )}
      {editing && onHeight && (
        <div className="widget-resize widget-resize-b" onPointerDown={onDragStart('b')} title="Drag to resize height">
          <span className="widget-resize-grip" />
        </div>
      )}
      {editing && onSpan && onHeight && (
        <div className="widget-resize widget-resize-br" onPointerDown={(e) => { onDragStart('r')(e); }} title="Drag to resize" />
      )}

      {drag && drag.type === 'r' && (
        <div className="widget-resize-ghost" style={{ width: `${(ghostSpan / drag.startSpan) * 100}%` }} />
      )}
      {drag && drag.type === 'b' && (
        <div className="widget-size-readout">
          {Math.round(drag.liveH)}px{snap ? ` · snap ${SNAP_ROW}px` : ' · free'}
        </div>
      )}
      {showSnapLines && (
        <div className="widget-snap-lines" aria-hidden="true">
          {Array.from({ length: Math.floor(MAX_HEIGHT / SNAP_ROW) }).map((_, i) => (
            <div key={i} style={{ top: (i + 1) * SNAP_ROW }} />
          ))}
        </div>
      )}
    </div>
  );
};

const PortfolioSummaryWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const series = window.MarketData.getSeries(99, 60, 380000, 0.01, 0.0008);
  const value = series[series.length - 1];
  const day = value - series[series.length - 2];
  const total = value - 380000;
  const sparkW = span === 1 ? 280 : span === 2 ? 600 : 920;
  const sparkH = span === 1 ? 48 : 72;
  return (
    <Widget title="Portfolio" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: span >= 2 ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div className="kpi-label">Total Value</div>
          <div className="kpi-value">${window.FmtUtils.fmtPrice(value)}</div>
          <div className="row row-gap-3" style={{ fontSize: 12, marginTop: 4, flexWrap: 'wrap' }}>
            <Delta value={day} pct={(day / value) * 100} />
            <span style={{ color: 'var(--ink-3)' }}>today</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <Delta value={total} pct={(total / 380000) * 100} />
            <span style={{ color: 'var(--ink-3)' }}>all-time</span>
          </div>
          {span >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <div><div className="label-cap" style={{ marginBottom: 2 }}>Cash</div><div className="mono" style={{ fontSize: 14 }}>$24,820</div></div>
              <div><div className="label-cap" style={{ marginBottom: 2 }}>Invested</div><div className="mono" style={{ fontSize: 14 }}>$393,474</div></div>
              <div><div className="label-cap" style={{ marginBottom: 2 }}>Day P&L</div><div className="mono" style={{ fontSize: 14, color: 'var(--gain)' }}>+$1,284</div></div>
              <div><div className="label-cap" style={{ marginBottom: 2 }}>Realized YTD</div><div className="mono" style={{ fontSize: 14 }}>+$8,402</div></div>
            </div>
          )}
        </div>
        <div style={{ marginTop: span >= 2 ? 0 : 12 }}>
          <Sparkline data={series} width={sparkW} height={sparkH} fill />
          {span >= 3 && (
            <div className="row row-gap-3" style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-3)', justifyContent: 'space-between' }}>
              <span>1D <span className="mono" style={{ color: 'var(--gain)' }}>+0.31%</span></span>
              <span>1W <span className="mono" style={{ color: 'var(--gain)' }}>+1.84%</span></span>
              <span>1M <span className="mono" style={{ color: 'var(--gain)' }}>+4.12%</span></span>
              <span>3M <span className="mono" style={{ color: 'var(--gain)' }}>+7.90%</span></span>
              <span>YTD <span className="mono" style={{ color: 'var(--gain)' }}>+10.07%</span></span>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
};

const WatchlistWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const count = span === 1 ? 5 : span === 2 ? 8 : 12;
  const list = window.MarketData.stocks.slice(0, count);
  const cols = span === 1
    ? ['symbol', 'price', 'change']
    : span === 2
      ? ['symbol', 'price', 'change', 'spark']
      : ['symbol', 'price', 'change', 'spark', 'mcap', 'vol'];
  return (
    <Widget title="Watchlist" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}
      actions={<Button variant="ghost" size="xs">Edit</Button>}>
      <StockTable stocks={list} columns={cols}
        onSelect={(sym) => window.AppStore.setStock(sym)} />
    </Widget>
  );
};

const ChartWidget = ({ symbol, editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const stock = window.MarketData.getStock(symbol) || window.MarketData.stocks[0];
  const [range, setRange] = useState('1M');
  const ranges = { '1D': 60, '1W': 120, '1M': 200, '3M': 300, '1Y': 500 };
  const series = window.MarketData.getSeries(stock.seed, ranges[range], stock.price * 0.85, 0.022, 0.001);
  const chartH = span === 1 ? 160 : span === 2 ? 260 : 320;
  const visibleRanges = span === 1 ? ['1D', '1M', '1Y'] : Object.keys(ranges);
  return (
    <Widget title={`${stock.symbol} · Chart`} editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}
      actions={
        <div className="chart-tabs">
          {visibleRanges.map(r => (
            <div key={r} className={`chart-tab ${range === r ? 'chart-tab-active' : ''}`} onClick={() => setRange(r)}>{r}</div>
          ))}
        </div>
      }>
      <div style={{ padding: '12px 16px 4px' }}>
        <div className="row row-gap-3" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: span >= 2 ? 28 : 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ${window.FmtUtils.fmtPrice(stock.price)}
          </div>
          <Delta value={stock.change} pct={stock.pct} />
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{range}</span>
          {span >= 2 && (
            <span className="spacer"></span>
          )}
          {span >= 2 && (
            <div className="row row-gap-3" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              <span><span className="label-cap">Open </span><span className="mono">${window.FmtUtils.fmtPrice(stock.price - stock.change)}</span></span>
              <span><span className="label-cap">High </span><span className="mono">${window.FmtUtils.fmtPrice(stock.price * 1.012)}</span></span>
              <span><span className="label-cap">Low </span><span className="mono">${window.FmtUtils.fmtPrice(stock.price * 0.991)}</span></span>
              {span >= 3 && <span><span className="label-cap">Vol </span><span className="mono">{window.FmtUtils.fmtCompact(stock.vol || 1.2e7)}</span></span>}
              {span >= 3 && <span><span className="label-cap">Mkt Cap </span><span className="mono">{window.FmtUtils.fmtCompact(stock.mcap)}</span></span>}
              {span >= 3 && <span><span className="label-cap">P/E </span><span className="mono">28.4</span></span>}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '0 8px' }}>
        <AreaChart data={series} height={chartH} />
      </div>
    </Widget>
  );
};

const MoversWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const count = span === 1 ? 3 : span === 2 ? 5 : 6;
  const gainers = window.MarketData.stocks.filter(s => s.pct > 0).sort((a,b) => b.pct - a.pct).slice(0, count);
  const losers = window.MarketData.stocks.filter(s => s.pct < 0).sort((a,b) => a.pct - b.pct).slice(0, count);
  const Row = ({ s }) => (
    <div className="row" style={{ padding: '7px 16px', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer', alignItems: 'center', gap: 10 }}
         onClick={() => window.AppStore.setStock(s.symbol)}>
      <div className="tbl-sym" style={{ width: 56 }}>{s.symbol}</div>
      {span >= 2 && <div style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-3)', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>}
      <div style={{ flex: span === 1 ? 1 : 0, fontSize: 11.5, color: 'var(--ink-4)', textAlign: span === 1 ? 'left' : 'right', minWidth: span >= 2 ? 80 : 'auto' }}>{s.sector}</div>
      {span >= 3 && <div className="tbl-num mono" style={{ width: 70 }}>${window.FmtUtils.fmtPrice(s.price)}</div>}
      <div style={{ minWidth: 70, textAlign: 'right' }}><Delta value={s.change} pct={s.pct} /></div>
    </div>
  );
  if (span >= 2) {
    return (
      <Widget title="Movers" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ borderRight: '1px solid var(--line-soft)' }}>
            <div style={{ padding: '8px 16px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--gain)', textTransform: 'uppercase' }}>Gainers</div>
            {gainers.map(s => <Row key={s.symbol} s={s} />)}
          </div>
          <div>
            <div style={{ padding: '8px 16px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--loss)', textTransform: 'uppercase' }}>Losers</div>
            {losers.map(s => <Row key={s.symbol} s={s} />)}
          </div>
        </div>
      </Widget>
    );
  }
  return (
    <Widget title="Movers" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}>
      <div style={{ padding: '8px 16px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--gain)', textTransform: 'uppercase' }}>Gainers</div>
      {gainers.map(s => <Row key={s.symbol} s={s} />)}
      <div style={{ padding: '8px 16px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--loss)', textTransform: 'uppercase' }}>Losers</div>
      {losers.map(s => <Row key={s.symbol} s={s} />)}
    </Widget>
  );
};

const NewsWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const max = span === 1 ? 4 : span === 2 ? 6 : 8;
  return (
    <Widget title="Latest news" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}
      actions={<Button variant="ghost" size="xs" onClick={() => window.AppStore.setPage('news')}>All →</Button>}>
      {span >= 2 ? (
        <div style={{ display: 'grid', gridTemplateColumns: span === 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 0 }}>
          {Array.from({ length: span === 3 ? 3 : 2 }).map((_, i) => (
            <div key={i} style={{ borderRight: i < (span === 3 ? 2 : 1) ? '1px solid var(--line-soft)' : 'none' }}>
              <NewsList items={window.MarketData.news.slice(i * Math.ceil(max / (span === 3 ? 3 : 2)), (i + 1) * Math.ceil(max / (span === 3 ? 3 : 2)))} max={Math.ceil(max / (span === 3 ? 3 : 2))} />
            </div>
          ))}
        </div>
      ) : (
        <NewsList items={window.MarketData.news} max={max} />
      )}
    </Widget>
  );
};

const AssistantWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const sugs = window.MarketData.chatSuggestions;
  const visible = span === 1 ? sugs.slice(0, 1) : span === 2 ? sugs.slice(0, 2) : sugs.slice(0, 3);
  return (
    <Widget title="Assistant suggestion" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}
      actions={<Button variant="ghost" size="xs" onClick={() => window.AppStore.setPage('assistant')}>Open chat →</Button>}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))`, gap: 0 }}>
        {visible.map((sug, i) => (
          <div key={i} style={{ padding: 16, borderRight: i < visible.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div className="row row-gap-2" style={{ marginBottom: 8 }}>
              <Badge variant={sug.type === 'buy' ? 'gain' : sug.type === 'reduce' ? 'loss' : 'warn'} dot>
                {sug.type.toUpperCase()}
              </Badge>
              <span className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{sug.symbol}</span>
              <span className="spacer"></span>
              <Badge variant="brand">{sug.confidence}%</Badge>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: span === 1 ? 3 : 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sug.thesis}</div>
            <div className="row row-gap-3" style={{ marginTop: 10, fontSize: 11.5 }}>
              <div><span className="label-cap">Target </span><span className="mono">${sug.target}</span></div>
              <div><span className="label-cap">Now </span><span className="mono">${sug.current}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
};

const HeatmapWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const items = [...window.MarketData.stocks, ...window.MarketData.stocks.slice(0, 6)].map((s, i) => ({
    symbol: s.symbol, pct: s.pct + (i * 0.1 - 0.3),
  }));
  const visible = span === 1 ? items.slice(0, 9) : span === 2 ? items.slice(0, 14) : items;
  return (
    <Widget title="Sector heatmap" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}>
      <div style={{ padding: 14 }}>
        <Heatmap items={visible} />
      </div>
    </Widget>
  );
};

const AlertsWidget = ({ editing, onRemove, onMove, onSpan, onHeight, snap, span = 1, height }) => {
  const alerts = [
    { sym: 'NVDA', msg: 'Crossed above $1,250 support', detail: 'Technical breakout above prior resistance with above-average volume.', t: 14, type: 'info' },
    { sym: 'TSLA', msg: 'RSI < 30 on daily', detail: 'Oversold signal — historical bounces in 68% of cases at this level.', t: 38, type: 'warn' },
    { sym: 'AAPL', msg: 'Volume spike 2.4× avg', detail: 'Unusual options flow detected, mostly call buying near $245 strike.', t: 72, type: 'info' },
    { sym: 'MSFT', msg: 'Earnings in 2 days', detail: 'Consensus EPS $3.12 · IV +28% · last 4 quarters beat estimates.', t: 180, type: 'warn' },
  ];
  const visible = span === 3 ? alerts : alerts.slice(0, 3);
  return (
    <Widget title="Active alerts" editing={editing} onRemove={onRemove} onMove={onMove} onSpan={onSpan} onHeight={onHeight} snap={snap} span={span} height={height}>
      <div>
        {visible.map((a, i) => (
          <div key={i} style={{ padding: '10px 16px', borderBottom: i < visible.length - 1 ? '1px solid var(--line-soft)' : 'none', display: 'flex', gap: 10, alignItems: span >= 2 ? 'flex-start' : 'center' }}>
            <Badge variant={a.type} dot>{a.sym}</Badge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5 }}>{a.msg}</div>
              {span >= 2 && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{a.detail}</div>}
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{a.t}m</span>
          </div>
        ))}
      </div>
    </Widget>
  );
};

const WIDGET_CATALOG = {
  'portfolio-summary': { name: 'Portfolio summary', desc: 'Total value + sparkline', defaultSpan: 1, component: PortfolioSummaryWidget },
  'watchlist':         { name: 'Watchlist',         desc: 'Tracked tickers',          defaultSpan: 1, component: WatchlistWidget },
  'chart':             { name: 'Chart',             desc: 'Price chart for a symbol', defaultSpan: 2, component: ChartWidget },
  'movers':            { name: 'Movers',            desc: 'Top gainers / losers',     defaultSpan: 1, component: MoversWidget },
  'news':              { name: 'News feed',         desc: 'Latest with sentiment',    defaultSpan: 1, component: NewsWidget },
  'assistant':         { name: 'Assistant tip',     desc: 'AI suggestion of the day', defaultSpan: 2, component: AssistantWidget },
  'heatmap':           { name: 'Sector heatmap',    desc: 'Visual market overview',   defaultSpan: 1, component: HeatmapWidget },
  'alerts':            { name: 'Alerts',            desc: 'Active triggered alerts',  defaultSpan: 1, component: AlertsWidget },
};

window.WIDGET_CATALOG = WIDGET_CATALOG;
window.Widget = Widget;
