// Detail tab panels for StockDetailPage: Technicals, Fundamentals, Sentiment, News, Options.
// Each panel takes (stock, candles) and renders the full main+side grid for its tab.

// ─── shared bits ──────────────────────────────────────────────────────────
const SignalPill = ({ tone = 'neutral', children }) => (
  <span className={`sig-pill sig-pill-${tone}`}>{children}</span>
);

const MetricRow = ({ label, value, sub, tone, bar, barMax = 100 }) => (
  <div className="metric-row">
    <div className="metric-row-head">
      <span className="metric-label">{label}</span>
      <span className={`metric-val ${tone ? 'metric-val-' + tone : ''}`}>{value}</span>
    </div>
    {bar != null && (
      <div className="metric-bar-track">
        <div className={`metric-bar-fill ${tone ? 'metric-bar-fill-' + tone : ''}`}
             style={{ width: `${Math.min(100, (bar / barMax) * 100)}%` }}></div>
      </div>
    )}
    {sub && <div className="metric-sub">{sub}</div>}
  </div>
);

// Convert a 0..100 value to color
const tonalize = (v, invert = false) => {
  const x = invert ? 100 - v : v;
  if (x >= 70) return 'gain';
  if (x >= 45) return 'neutral';
  return 'loss';
};

// ═══════════════════════════════════════════════════════════════════════════
// TECHNICALS
// ═══════════════════════════════════════════════════════════════════════════
const TechnicalsTab = ({ stock, candles }) => {
  const closes = candles.map(c => c.close);
  const last = stock.price;
  const high52 = Math.max(...closes) * 1.05;
  const low52 = Math.min(...closes) * 0.95;
  const ma50 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma200 = closes.reduce((a, b) => a + b, 0) / closes.length * 0.78;

  // pivot levels
  const pivot = (last + high52 * 0.92 + low52 * 1.05) / 3;
  const r1 = pivot * 1.04, r2 = pivot * 1.09, r3 = pivot * 1.14;
  const s1 = pivot * 0.96, s2 = pivot * 0.91, s3 = pivot * 0.86;

  // Position of last vs 52w range
  const range52pct = ((last - low52) / (high52 - low52)) * 100;

  return (
    <div className="stock-grid">
      <div className="col gap-4">
        <Card title="Price · with overlays" titleSize="lg" actions={
          <div className="row row-gap-2">
            <div className="chart-tabs">
              {['1D','1W','1M','3M','6M','1Y','5Y'].map(r => (
                <div key={r} className={`chart-tab ${r === '3M' ? 'chart-tab-active' : ''}`}>{r}</div>
              ))}
            </div>
            <Button variant="ghost" size="xs">+ Indicator</Button>
          </div>
        }>
          <Candlestick data={candles} height={320} />
          <div className="overlay-chips">
            <span className="overlay-chip" style={{ '--c': 'var(--brand)' }}><i></i>MA(50) <b className="mono">${ma50.toFixed(2)}</b></span>
            <span className="overlay-chip" style={{ '--c': 'var(--info)' }}><i></i>MA(200) <b className="mono">${ma200.toFixed(2)}</b></span>
            <span className="overlay-chip" style={{ '--c': 'var(--warn)' }}><i></i>BB(20,2)</span>
            <span className="overlay-chip" style={{ '--c': 'var(--ink-3)' }}><i></i>VWAP</span>
            <Button variant="ghost" size="xs" style={{ marginLeft: 'auto' }}>Studies</Button>
          </div>
        </Card>

        <div className="tech-osc-grid">
          <Card title="RSI (14)" titleSize="sm" bodyClass="tight">
            <OscillatorPlot data={candles.map((c, i) => 30 + Math.sin(i / 3) * 12 + (c.close % 25))}
                            min={0} max={100} bands={[[0,30,'oversold'],[70,100,'overbought']]} />
            <div className="osc-readout">
              <div className="row row-gap-3">
                <span className="label-cap">Now</span>
                <span className="mono" style={{ fontWeight: 600 }}>62.4</span>
                <SignalPill tone="neutral">Neutral / climbing</SignalPill>
              </div>
              <div className="osc-meta">14d · last cross above 50 → 8d ago</div>
            </div>
          </Card>

          <Card title="MACD (12,26,9)" titleSize="sm" bodyClass="tight">
            <MACDPlot data={candles} />
            <div className="osc-readout">
              <div className="row row-gap-3">
                <span className="label-cap">Hist</span>
                <span className="mono delta-gain" style={{ fontWeight: 600 }}>+12.4</span>
                <SignalPill tone="bull">Bull crossover · 3d ago</SignalPill>
              </div>
              <div className="osc-meta">Signal 18.1 · MACD 30.5</div>
            </div>
          </Card>

          <Card title="Volume profile" titleSize="sm" bodyClass="tight">
            <VolumeProfile candles={candles} last={last} />
            <div className="osc-readout">
              <div className="row row-gap-3">
                <span className="label-cap">POC</span>
                <span className="mono" style={{ fontWeight: 600 }}>${(last * 0.94).toFixed(2)}</span>
                <SignalPill tone="neutral">High-vol node below</SignalPill>
              </div>
              <div className="osc-meta">Value area: ${(last*0.89).toFixed(0)} – ${(last*1.02).toFixed(0)}</div>
            </div>
          </Card>

          <Card title="ATR (14) · Volatility" titleSize="sm" bodyClass="tight">
            <OscillatorPlot data={candles.map((c, i) => 18 + Math.cos(i/4) * 6 + (c.high-c.low)/4)}
                            min={0} max={50} color="var(--warn)" />
            <div className="osc-readout">
              <div className="row row-gap-3">
                <span className="label-cap">ATR</span>
                <span className="mono" style={{ fontWeight: 600 }}>$28.10</span>
                <SignalPill tone="neutral">2.2% of price · normal</SignalPill>
              </div>
              <div className="osc-meta">5d avg true range · annualized vol 38%</div>
            </div>
          </Card>
        </div>

        <Card title="Pivot levels · classical" titleSize="lg" bodyClass="tight">
          <div className="pivot-ladder">
            {[
              ['R3', r3, 'res'],
              ['R2', r2, 'res'],
              ['R1', r1, 'res'],
              ['Pivot', pivot, 'piv'],
              ['S1', s1, 'sup'],
              ['S2', s2, 'sup'],
              ['S3', s3, 'sup'],
            ].map(([lbl, v, kind]) => {
              const dist = ((v - last) / last) * 100;
              return (
                <div key={lbl} className={`pivot-row pivot-${kind} ${Math.abs(dist) < 1 ? 'pivot-near' : ''}`}>
                  <span className="pivot-lbl">{lbl}</span>
                  <span className="mono pivot-val">${v.toFixed(2)}</span>
                  <div className="pivot-spark">
                    <div className="pivot-marker" style={{ left: `${50 + dist * 5}%` }}></div>
                  </div>
                  <span className={`mono pivot-dist ${dist >= 0 ? 'delta-gain' : 'delta-loss'}`}>
                    {dist >= 0 ? '+' : ''}{dist.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="col gap-4">
        <Card title="Signal verdict" titleSize="lg">
          <div className="verdict">
            <div className="verdict-dial">
              <Donut size={150} thickness={18} segments={[
                { value: 67, color: 'var(--gain)' },
                { value: 33, color: 'var(--bg-inset)' },
              ]} label={
                <>
                  <div className="verdict-score">67</div>
                  <div className="verdict-label">BULLISH</div>
                </>
              } />
            </div>
            <div className="verdict-tally">
              <div className="verdict-tally-row"><b>9</b> bullish signals</div>
              <div className="verdict-tally-row"><b>4</b> neutral</div>
              <div className="verdict-tally-row"><b>2</b> bearish</div>
            </div>
          </div>
        </Card>

        <Card title="Signal stack" titleSize="lg" bodyClass="tight">
          <div className="signal-stack">
            {[
              ['MA(50) > MA(200)', 'Golden cross 14d ago', 'bull'],
              ['Price > MA(50)', `+${(((last - ma50)/ma50)*100).toFixed(1)}% above`, 'bull'],
              ['MACD histogram positive', 'Expanding 3d', 'bull'],
              ['RSI 62.4', 'Trending, not overbought', 'bull'],
              ['Higher highs / higher lows', '5 of last 7 sessions', 'bull'],
              ['Volume > 20d avg', '+24% on up days', 'bull'],
              ['Donchian (20) breakout', 'New 20d high yesterday', 'bull'],
              ['Bollinger %B = 0.78', 'Approaching upper band', 'neutral'],
              ['ATR rising', 'Vol expansion · risk', 'neutral'],
              ['Stochastic K=82', 'Overbought zone', 'bear'],
              ['Volume divergence', 'Up moves on lower vol', 'bear'],
            ].map(([k, v, t]) => (
              <div key={k} className={`signal-row signal-row-${t}`}>
                <span className={`signal-dot signal-dot-${t}`}></span>
                <span className="signal-name">{k}</span>
                <span className="signal-val">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="52-week range" titleSize="lg">
          <div className="range52">
            <div className="range52-track">
              <div className="range52-marker" style={{ left: `${range52pct}%` }}></div>
              <div className="range52-tick" style={{ left: `${range52pct}%` }}></div>
            </div>
            <div className="range52-labels">
              <div><div className="label-cap">52w Low</div><div className="mono">${low52.toFixed(2)}</div></div>
              <div style={{ textAlign: 'center' }}>
                <div className="label-cap">Now</div>
                <div className="mono" style={{ fontWeight: 600 }}>${last.toFixed(2)}</div>
                <div className="range52-pct">at {range52pct.toFixed(0)}% of range</div>
              </div>
              <div style={{ textAlign: 'right' }}><div className="label-cap">52w High</div><div className="mono">${high52.toFixed(2)}</div></div>
            </div>
          </div>
          <div className="range52-grid">
            <MetricRow label="Beta vs SPX" value="1.84" sub="High systematic risk" />
            <MetricRow label="Annualized σ" value="38%" sub="vs SPX 14%" />
            <MetricRow label="Sharpe (1y)" value="2.41" sub="Strong risk-adjusted" tone="gain" />
            <MetricRow label="Max drawdown" value="–24.8%" sub="Q3 2025" tone="loss" />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tiny line oscillator
const OscillatorPlot = ({ data, min = 0, max = 100, bands = [], color = 'var(--brand)' }) => {
  const w = 320, h = 90, p = 4;
  const range = max - min;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (w - p * 2);
    const y = p + (1 - (v - min) / range) * (h - p * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="osc-svg" preserveAspectRatio="none" style={{ width: '100%', height: 90 }}>
      {bands.map(([lo, hi, kind], i) => {
        const y1 = p + (1 - (hi - min) / range) * (h - p * 2);
        const y2 = p + (1 - (lo - min) / range) * (h - p * 2);
        return <rect key={i} x={p} y={y1} width={w - p*2} height={y2 - y1}
                     fill={kind === 'overbought' ? 'var(--loss-soft)' : 'var(--gain-soft)'} opacity="0.55" />;
      })}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      {bands.map(([lo, hi, kind], i) => (
        <text key={`l${i}`} x={w - 6} y={p + (1 - (kind === 'overbought' ? hi : lo) / range) * (h - p*2) + 9}
              textAnchor="end" fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-mono)">
          {kind === 'overbought' ? `OB ${hi}` : `OS ${lo}`}
        </text>
      ))}
    </svg>
  );
};

const MACDPlot = ({ data }) => {
  const w = 320, h = 90, p = 4;
  const histo = data.map((c, i) => Math.sin(i/4) * 8 + (i > 30 ? 6 : -3));
  const macd = data.map((c, i) => Math.sin(i/4) * 14 + (i > 30 ? 8 : -2));
  const sig = data.map((c, i) => Math.sin((i-3)/4) * 14 + (i > 30 ? 6 : -2));
  const all = [...histo, ...macd, ...sig];
  const min = Math.min(...all), max = Math.max(...all);
  const yz = p + (1 - (0 - min) / (max - min)) * (h - p*2);
  const barW = (w - p*2) / data.length * 0.7;
  const toLine = (arr) => arr.map((v, i) => {
    const x = p + (i / (arr.length - 1)) * (w - p*2);
    const y = p + (1 - (v - min) / (max - min)) * (h - p*2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="osc-svg" preserveAspectRatio="none" style={{ width: '100%', height: 90 }}>
      <line x1={p} x2={w-p} y1={yz} y2={yz} stroke="var(--line-strong)" strokeDasharray="2 3" />
      {histo.map((v, i) => {
        const x = p + (i / (histo.length - 1)) * (w - p*2) - barW/2;
        const y = p + (1 - (v - min) / (max - min)) * (h - p*2);
        const bh = Math.abs(yz - y);
        return <rect key={i} x={x} y={Math.min(yz, y)} width={barW} height={bh}
                     fill={v >= 0 ? 'var(--gain)' : 'var(--loss)'} opacity="0.55" />;
      })}
      <polyline points={toLine(macd)} fill="none" stroke="var(--brand)" strokeWidth="1.5" />
      <polyline points={toLine(sig)} fill="none" stroke="var(--info)" strokeWidth="1.2" strokeDasharray="3 2" />
    </svg>
  );
};

const VolumeProfile = ({ candles, last }) => {
  // 12 horizontal bins
  const bins = 12;
  const lo = Math.min(...candles.map(c => c.low));
  const hi = Math.max(...candles.map(c => c.high));
  const w = 320, h = 90, p = 4;
  const buckets = Array(bins).fill(0);
  candles.forEach(c => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(((c.close - lo) / (hi - lo)) * bins)));
    buckets[idx] += c.vol;
  });
  const max = Math.max(...buckets);
  const lastBin = Math.min(bins - 1, Math.max(0, Math.floor(((last - lo) / (hi - lo)) * bins)));
  const binH = (h - p*2) / bins;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="osc-svg" preserveAspectRatio="none" style={{ width: '100%', height: 90 }}>
      {buckets.map((v, i) => {
        const y = h - p - (i + 1) * binH + 1;
        const bw = (v / max) * (w - p*2 - 32);
        return <rect key={i} x={p} y={y} width={bw} height={binH - 2}
                     fill={i === lastBin ? 'var(--brand)' : 'var(--info)'} opacity={i === lastBin ? 0.85 : 0.45} />;
      })}
      <line x1={p} x2={w-p} y1={h - p - (lastBin + 0.5) * binH}
            y2={h - p - (lastBin + 0.5) * binH} stroke="var(--ink-2)" strokeDasharray="2 2" />
      <text x={w - p} y={h - p - (lastBin + 0.5) * binH + 3} textAnchor="end"
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-1)">last ${last.toFixed(0)}</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNDAMENTALS
// ═══════════════════════════════════════════════════════════════════════════
const FundamentalsTab = ({ stock }) => {
  const [period, setPeriod] = useState('quarterly');
  const periods = period === 'quarterly'
    ? ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26']
    : ['FY 22', 'FY 23', 'FY 24', 'FY 25', 'FY 26e'];

  // Synthetic statement data scaled by stock seed
  const k = (stock.seed / 10);
  const rev = period === 'quarterly'
    ? [12.4, 14.1, 18.6, 22.1, 26.0].map(v => v * k)
    : [26.9, 27.0, 60.9, 96.3, 142.5].map(v => v * k);
  const cogs = rev.map(r => r * 0.26);
  const gp = rev.map((r, i) => r - cogs[i]);
  const opex = rev.map(r => r * 0.15);
  const opInc = rev.map((r, i) => gp[i] - opex[i]);
  const ni = opInc.map(o => o * 0.78);
  const eps = ni.map(n => (n / 24.5).toFixed(2));

  const max = Math.max(...rev);

  return (
    <div className="stock-grid">
      <div className="col gap-4">
        <Card title="Income statement" titleSize="lg" actions={
          <div className="row row-gap-2">
            <div className="chart-tabs">
              <div className={`chart-tab ${period === 'quarterly' ? 'chart-tab-active' : ''}`}
                   onClick={() => setPeriod('quarterly')}>Quarterly</div>
              <div className={`chart-tab ${period === 'annual' ? 'chart-tab-active' : ''}`}
                   onClick={() => setPeriod('annual')}>Annual</div>
            </div>
            <Button variant="ghost" size="xs">Export</Button>
          </div>
        }>
          <table className="stmt">
            <thead>
              <tr>
                <th></th>
                {periods.map(p => <th key={p} className="mono">{p}</th>)}
                <th className="mono">YoY</th>
              </tr>
            </thead>
            <tbody>
              <StmtRow label="Revenue" data={rev} fmt="$" max={max} highlight />
              <StmtRow label="Cost of revenue" data={cogs} fmt="$" max={max} dim />
              <StmtRow label="Gross profit" data={gp} fmt="$" max={max} />
              <StmtRow label="Operating expenses" data={opex} fmt="$" max={max} dim />
              <StmtRow label="Operating income" data={opInc} fmt="$" max={max} />
              <StmtRow label="Net income" data={ni} fmt="$" max={max} highlight />
              <StmtRow label="Diluted EPS" data={eps.map(parseFloat)} fmt="$" prefix="$" />
            </tbody>
          </table>
        </Card>

        <div className="fund-2col">
          <Card title="Margins · trend" titleSize="lg">
            <MarginTrend
              series={[
                { label: 'Gross', color: 'var(--gain)', data: rev.map((r, i) => (gp[i]/r)*100) },
                { label: 'Operating', color: 'var(--brand)', data: rev.map((r, i) => (opInc[i]/r)*100) },
                { label: 'Net', color: 'var(--info)', data: rev.map((r, i) => (ni[i]/r)*100) },
              ]}
              labels={periods}
            />
          </Card>

          <Card title="Cash flow" titleSize="lg" bodyClass="tight">
            <table className="stmt">
              <thead>
                <tr><th></th><th className="mono">TTM</th><th className="mono">Trend</th></tr>
              </thead>
              <tbody>
                {[
                  ['Operating CF', '$54.2B', [40, 44, 48, 52, 54], 'gain'],
                  ['CapEx', '–$3.6B', [3.0, 3.1, 3.3, 3.5, 3.6], 'loss'],
                  ['Free cash flow', '$50.6B', [37, 41, 45, 48, 51], 'gain'],
                  ['SBC', '–$2.6B', [1.8, 2.0, 2.3, 2.4, 2.6], 'neutral'],
                  ['Buybacks', '–$24.1B', [12, 16, 19, 22, 24], 'gain'],
                  ['Dividends', '–$0.4B', [0.3, 0.3, 0.4, 0.4, 0.4], 'neutral'],
                ].map(([lbl, ttm, sp, tone]) => (
                  <tr key={lbl}>
                    <td>{lbl}</td>
                    <td className={`stmt-num mono stmt-tone-${tone}`}>{ttm}</td>
                    <td className="stmt-spark"><Sparkline data={sp} width={70} height={20}
                          color={tone === 'gain' ? 'var(--gain)' : tone === 'loss' ? 'var(--loss)' : 'var(--ink-3)'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Balance sheet · key items" titleSize="lg">
          <div className="bs-grid">
            <div className="bs-col">
              <div className="label-cap">Assets · $96.4B</div>
              <BSBar segments={[
                { label: 'Cash & ST', value: 38.5, color: 'var(--gain)' },
                { label: 'Receivables', value: 14.2, color: 'var(--info)' },
                { label: 'Inventory', value: 8.6, color: 'var(--warn)' },
                { label: 'PP&E', value: 5.1, color: 'var(--brand)' },
                { label: 'Goodwill', value: 4.6, color: 'var(--ink-4)' },
                { label: 'Other', value: 25.4, color: 'var(--ink-3)' },
              ]} />
            </div>
            <div className="bs-col">
              <div className="label-cap">Liabilities + Equity · $96.4B</div>
              <BSBar segments={[
                { label: 'AP', value: 5.2, color: 'var(--loss)' },
                { label: 'ST debt', value: 1.4, color: 'var(--warn)' },
                { label: 'LT debt', value: 8.5, color: 'var(--warn)' },
                { label: 'Other liab', value: 35.4, color: 'var(--ink-4)' },
                { label: 'Equity', value: 45.9, color: 'var(--gain)' },
              ]} />
            </div>
          </div>
          <div className="bs-ratios">
            <div className="bs-ratio"><div className="label-cap">Current ratio</div><div className="bs-ratio-val mono">3.4</div></div>
            <div className="bs-ratio"><div className="label-cap">Quick ratio</div><div className="bs-ratio-val mono">2.8</div></div>
            <div className="bs-ratio"><div className="label-cap">Debt / Equity</div><div className="bs-ratio-val mono">0.18</div></div>
            <div className="bs-ratio"><div className="label-cap">Net debt</div><div className="bs-ratio-val mono">–$28B</div></div>
            <div className="bs-ratio"><div className="label-cap">Interest cov.</div><div className="bs-ratio-val mono">142×</div></div>
          </div>
        </Card>
      </div>

      <div className="col gap-4">
        <Card title="Valuation · vs peers" titleSize="lg" bodyClass="tight">
          <div className="peer-table-head">
            <span></span><span>This</span><span>Sector</span><span>z</span>
          </div>
          {[
            ['P/E (TTM)', '68.2', '32.1', 1.6, 'rich'],
            ['P/E (Fwd)', '42.1', '24.8', 1.2, 'rich'],
            ['EV/EBITDA', '54.2', '18.4', 2.1, 'rich'],
            ['EV/Sales', '31.8', '6.2', 2.8, 'rich'],
            ['P/Book', '48.6', '8.1', 3.4, 'rich'],
            ['PEG (3y)', '1.4', '1.8', -0.4, 'cheap'],
            ['FCF Yield', '2.1%', '3.4%', -0.8, 'rich'],
            ['Div Yield', '0.003%', '1.4%', -1.2, 'rich'],
          ].map(([m, t, s, z, kind]) => (
            <div key={m} className="peer-row">
              <span className="peer-label">{m}</span>
              <span className="mono peer-val">{t}</span>
              <span className="mono peer-sec">{s}</span>
              <span className={`peer-z peer-z-${kind}`}>
                <span className="peer-z-bar" style={{ width: `${Math.min(100, Math.abs(z) * 25)}%`, marginLeft: z < 0 ? `${50 - Math.min(50, Math.abs(z)*25)}%` : '50%' }}></span>
                <span className="mono">{z >= 0 ? '+' : ''}{z.toFixed(1)}</span>
              </span>
            </div>
          ))}
          <div className="peer-foot">Peers: AMD, AVGO, MRVL, INTC, QCOM (6m median).</div>
        </Card>

        <Card title="Growth · 5y CAGR" titleSize="lg" bodyClass="tight">
          {[
            ['Revenue', 56.4, 'gain'],
            ['Operating income', 78.1, 'gain'],
            ['Net income', 84.2, 'gain'],
            ['Diluted EPS', 81.6, 'gain'],
            ['Free cash flow', 62.4, 'gain'],
            ['Book value', 28.4, 'gain'],
            ['Shares outstanding', -0.8, 'loss'],
          ].map(([k, v, tone]) => (
            <MetricRow key={k} label={k} value={`${v >= 0 ? '+' : ''}${v}%`}
              tone={tone} bar={Math.abs(v)} barMax={100} />
          ))}
        </Card>

        <Card title="Dividend & buyback" titleSize="lg">
          <div className="div-card">
            <div>
              <div className="label-cap">Indicated dividend</div>
              <div className="div-card-val">$0.04</div>
              <div className="div-card-sub">0.003% yield · paid quarterly</div>
            </div>
            <div>
              <div className="label-cap">Buyback (TTM)</div>
              <div className="div-card-val">$24.1B</div>
              <div className="div-card-sub">~1.9% of float</div>
            </div>
          </div>
          <div className="div-grid">
            <MetricRow label="Payout ratio" value="0.2%" sub="Massive retention" />
            <MetricRow label="Years raised" value="6" sub="Since FY20" />
            <MetricRow label="Shareholder yield" value="1.9%" sub="Buyback + div" tone="gain" />
          </div>
        </Card>
      </div>
    </div>
  );
};

const StmtRow = ({ label, data, fmt, prefix = '', max, highlight, dim }) => {
  const yoy = data.length >= 2 ? ((data[data.length-1] - data[data.length-2]) / data[data.length-2]) * 100 : 0;
  return (
    <tr className={`${highlight ? 'stmt-row-hl' : ''} ${dim ? 'stmt-row-dim' : ''}`}>
      <td>{label}</td>
      {data.map((v, i) => (
        <td key={i} className="stmt-num mono">
          {fmt}{typeof v === 'number' ? (Math.abs(v) > 100 ? v.toFixed(0) : v.toFixed(1)) : v}{fmt === '$' && Math.abs(v) > 1 && !prefix ? 'B' : ''}
        </td>
      ))}
      <td className={`stmt-yoy mono ${yoy >= 0 ? 'delta-gain' : 'delta-loss'}`}>{yoy >= 0 ? '+' : ''}{yoy.toFixed(0)}%</td>
    </tr>
  );
};

const MarginTrend = ({ series, labels }) => {
  const w = 480, h = 220, p = { t: 16, r: 12, b: 28, l: 36 };
  const all = series.flatMap(s => s.data);
  const min = Math.min(...all) - 4;
  const max = Math.max(...all) + 4;
  const innerW = w - p.l - p.r, innerH = h - p.t - p.b;
  const xAt = i => p.l + (i / (labels.length - 1)) * innerW;
  const yAt = v => p.t + (1 - (v - min) / (max - min)) * innerH;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 220 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const v = max - t * (max - min);
        return (
          <g key={i}>
            <line x1={p.l} x2={w - p.r} y1={p.t + t * innerH} y2={p.t + t * innerH} stroke="var(--line-soft)" strokeWidth="1" />
            <text x={p.l - 6} y={p.t + t * innerH + 3} textAnchor="end" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">{v.toFixed(0)}%</text>
          </g>
        );
      })}
      {series.map((s, si) => (
        <g key={si}>
          <polyline fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round"
            points={s.data.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')} />
          {s.data.map((v, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3" fill="var(--bg-elevated)" stroke={s.color} strokeWidth="1.5" />
          ))}
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={xAt(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">{l}</text>
      ))}
      <g transform={`translate(${p.l + 6}, ${p.t + 6})`}>
        {series.map((s, i) => (
          <g key={i} transform={`translate(0, ${i * 16})`}>
            <rect width="10" height="3" y="5" fill={s.color} rx="1" />
            <text x="14" y="9" fontSize="11" fill="var(--ink-2)">{s.label}</text>
            <text x="80" y="9" fontSize="11" fill="var(--ink-1)" fontFamily="var(--font-mono)">{s.data[s.data.length-1].toFixed(1)}%</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const BSBar = ({ segments }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <>
      <div className="bs-bar">
        {segments.map((s, i) => (
          <div key={i} className="bs-seg" style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
               title={`${s.label}: $${s.value}B`}></div>
        ))}
      </div>
      <div className="bs-legend">
        {segments.map((s, i) => (
          <div key={i} className="bs-legend-item">
            <span className="bs-legend-sw" style={{ background: s.color }}></span>
            <span className="bs-legend-lbl">{s.label}</span>
            <span className="mono bs-legend-val">${s.value}B</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SENTIMENT
// ═══════════════════════════════════════════════════════════════════════════
const SentimentTab = ({ stock }) => {
  // 30d sentiment series
  const days = 30;
  const series = Array.from({ length: days }, (_, i) => 0.2 + Math.sin(i / 3.5) * 0.25 + Math.cos(i / 7) * 0.15 + (i / 60));
  const newsSeries = series.map(v => v + 0.1);
  const socialSeries = series.map(v => v + Math.sin(v * 8) * 0.15 + 0.05);
  const analystSeries = series.map(v => 0.55 + Math.cos(v * 4) * 0.1);

  const themes = [
    { label: 'AI capex sustained', count: 248, score: 0.78, sources: ['News', 'Analyst', 'Social'] },
    { label: 'Rubin architecture launch', count: 184, score: 0.84, sources: ['News', 'Trade'] },
    { label: 'Hyperscaler concentration risk', count: 96, score: -0.42, sources: ['Analyst', 'Buy-side'] },
    { label: 'Custom silicon competitive threat', count: 82, score: -0.58, sources: ['Analyst', 'Trade'] },
    { label: 'China export controls', count: 64, score: -0.34, sources: ['News', 'Macro'] },
    { label: 'Margin expansion narrative', count: 124, score: 0.71, sources: ['Sell-side'] },
  ];

  const insiders = [
    { name: 'Huang, J.', role: 'CEO', action: 'Sell', shares: '120K', value: '$154M', date: '2026-04-22' },
    { name: 'Kress, C.', role: 'CFO', action: 'Sell', shares: '15K', value: '$19.3M', date: '2026-04-18' },
    { name: 'Dally, W.', role: 'Chief Scientist', action: 'Sell', shares: '8K', value: '$10.2M', date: '2026-04-12' },
    { name: 'Shoquist, D.', role: 'EVP', action: 'Hold', shares: '—', value: '—', date: '—' },
  ];

  return (
    <div className="stock-grid">
      <div className="col gap-4">
        <Card title="Sentiment timeline · 30d" titleSize="lg" actions={
          <div className="row row-gap-2">
            <div className="chart-tabs">
              {['7D','30D','90D','1Y'].map(r => (
                <div key={r} className={`chart-tab ${r === '30D' ? 'chart-tab-active' : ''}`}>{r}</div>
              ))}
            </div>
          </div>
        }>
          <SentimentChart
            sources={[
              { label: 'News', color: 'var(--info)', data: newsSeries },
              { label: 'Social', color: 'var(--brand)', data: socialSeries },
              { label: 'Analyst', color: 'var(--gain)', data: analystSeries },
            ]}
            events={[
              { day: 6, type: 'earn', label: 'Q1 FY26 earnings' },
              { day: 14, type: 'news', label: 'Rubin announce' },
              { day: 22, type: 'down', label: 'Custom silicon report' },
            ]}
          />
          <div className="sent-legend">
            <span><i style={{ background: 'var(--info)' }}></i>News (4.2K mentions)</span>
            <span><i style={{ background: 'var(--brand)' }}></i>Social (84K posts)</span>
            <span><i style={{ background: 'var(--gain)' }}></i>Analyst (38 firms)</span>
            <span className="sent-legend-sep">·</span>
            <span className="sent-legend-event"><i className="ev ev-earn"></i>Earnings</span>
            <span className="sent-legend-event"><i className="ev ev-news"></i>News event</span>
          </div>
        </Card>

        <Card title="Narrative themes · what people are saying" titleSize="lg" bodyClass="tight">
          <div className="theme-list">
            {themes.map((t, i) => (
              <div key={i} className="theme-row">
                <div className={`theme-bar ${t.score >= 0 ? 'theme-bar-pos' : 'theme-bar-neg'}`}
                     style={{ width: `${Math.abs(t.score) * 100}%`,
                              marginLeft: t.score >= 0 ? '50%' : `${50 - Math.abs(t.score) * 100}%` }}></div>
                <div className="theme-content">
                  <div className="theme-head">
                    <span className="theme-label">{t.label}</span>
                    <span className={`theme-score mono ${t.score >= 0 ? 'delta-gain' : 'delta-loss'}`}>
                      {t.score >= 0 ? '+' : ''}{t.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="theme-meta">
                    <span className="mono">{t.count} mentions</span>
                    <span className="theme-sep">·</span>
                    <span>{t.sources.join(' / ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Social signal · channels" titleSize="lg">
          <div className="social-grid">
            {[
              { label: 'X / Twitter', vol: '52.4K', delta: '+18%', tone: 0.74, color: 'var(--info)' },
              { label: 'Reddit (r/wsb, r/inv)', vol: '8.2K', delta: '+34%', tone: 0.68, color: 'var(--brand)' },
              { label: 'StockTwits', vol: '14.1K', delta: '+12%', tone: 0.81, color: 'var(--gain)' },
              { label: 'YouTube finance', vol: '4.8K', delta: '+6%', tone: 0.62, color: 'var(--warn)' },
              { label: 'Substack / blogs', vol: '124', delta: '+22%', tone: 0.58, color: 'var(--ink-2)' },
              { label: 'Discord / TG', vol: '2.1K', delta: '+44%', tone: 0.71, color: 'var(--loss)' },
            ].map(c => (
              <div key={c.label} className="social-card">
                <div className="social-head">
                  <span className="social-dot" style={{ background: c.color }}></span>
                  <span className="social-label">{c.label}</span>
                </div>
                <div className="social-vol">
                  <span className="mono social-vol-num">{c.vol}</span>
                  <span className="mono delta-gain social-delta">{c.delta}</span>
                </div>
                <div className="social-bar">
                  <div className="social-bar-fill" style={{ width: `${c.tone * 100}%`, background: c.color }}></div>
                </div>
                <div className="social-tone-label mono">{Math.round(c.tone * 100)}% bullish</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="col gap-4">
        <Card title="Composite sentiment" titleSize="lg">
          <div className="sent-composite">
            <Donut size={160} thickness={22} segments={[
              { value: 64, color: 'var(--gain)' },
              { value: 22, color: 'var(--ink-4)' },
              { value: 14, color: 'var(--loss)' },
            ]} label={
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--gain)' }}>+0.64</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bullish</div>
              </>
            } />
            <div className="sent-comp-legend">
              <div className="row row-gap-2"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gain)' }}></span>Bullish 64%</div>
              <div className="row row-gap-2"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--ink-4)' }}></span>Neutral 22%</div>
              <div className="row row-gap-2"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--loss)' }}></span>Bearish 14%</div>
              <div className="sent-comp-trend mono delta-gain">+0.18 vs 7d ago</div>
            </div>
          </div>
          <div className="sent-source-bars">
            <ScoreBar label="News (24h)" value={78} color="var(--gain)" />
            <ScoreBar label="Social" value={84} color="var(--gain)" />
            <ScoreBar label="Analyst" value={71} color="var(--gain)" />
            <ScoreBar label="Insider" value={45} color="var(--warn)" />
            <ScoreBar label="Options flow" value={68} color="var(--info)" />
          </div>
        </Card>

        <Card title="Analyst tape · 38 firms" titleSize="lg" bodyClass="tight">
          <div className="analyst-summary">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Strong Buy</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Avg PT $1,420 · +10.5% upside</div>
            </div>
            <BarChart data={[
              { label: 'S.Buy', value: 28 },
              { label: 'Buy', value: 10 },
              { label: 'Hold', value: 3 },
              { label: 'Sell', value: 1 },
              { label: 'S.Sell', value: 0 },
            ]} height={100} />
          </div>
          <div className="analyst-recent">
            <div className="label-cap" style={{ marginBottom: 6 }}>Recent changes</div>
            {[
              ['Goldman Sachs', 'Buy → Buy', 'PT $1,400 → $1,520', 'pos'],
              ['Morgan Stanley', 'OW → OW', 'PT $1,360 → $1,450', 'pos'],
              ['Bernstein', 'Hold → Buy', 'Upgraded · PT $1,400', 'pos'],
              ['Barclays', 'OW → EW', 'Downgraded · PT $1,260', 'neg'],
              ['Wells Fargo', 'OW → OW', 'PT $1,450 maintained', 'neu'],
            ].map(([firm, rating, pt, tone]) => (
              <div key={firm} className="analyst-row">
                <span className="analyst-firm">{firm}</span>
                <span className={`analyst-rating analyst-rating-${tone}`}>{rating}</span>
                <span className="analyst-pt mono">{pt}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Insider activity · 90d" titleSize="lg" bodyClass="tight">
          <div className="insider-summary">
            <div className="insider-bal insider-bal-sell">
              <span className="label-cap">Net</span>
              <span className="mono">–$184M</span>
            </div>
            <div className="insider-counts">
              <div><b>0</b> buys</div><div><b>4</b> sells</div><div><b>2</b> 10b5-1</div>
            </div>
          </div>
          <div className="insider-list">
            {insiders.map((p, i) => (
              <div key={i} className="insider-row">
                <div className="insider-name">
                  <div className="insider-name-name">{p.name}</div>
                  <div className="insider-name-role">{p.role}</div>
                </div>
                <span className={`insider-action insider-action-${p.action.toLowerCase()}`}>{p.action}</span>
                <span className="mono insider-shares">{p.shares}</span>
                <span className="mono insider-value">{p.value}</span>
                <span className="mono insider-date">{p.date}</span>
              </div>
            ))}
          </div>
          <div className="insider-foot">All filed Form 4s. Net selling consistent with 10b5-1 cadence; not flagged as anomalous.</div>
        </Card>

        <Card title="Options sentiment" titleSize="lg" bodyClass="tight">
          <div className="opt-flow-grid">
            <MetricRow label="P/C ratio (5d)" value="0.62" sub="Below 0.8 → bullish" tone="gain" />
            <MetricRow label="Skew (25Δ)" value="–4.2" sub="Calls bid over puts" tone="gain" />
            <MetricRow label="IV rank" value="42%" sub="Mid-range" />
            <MetricRow label="Unusual volume" value="3 strikes" sub="$1300 / $1350 calls hot" tone="gain" />
          </div>
        </Card>
      </div>
    </div>
  );
};

const SentimentChart = ({ sources, events }) => {
  const w = 760, h = 240, p = { t: 16, r: 16, b: 32, l: 40 };
  const innerW = w - p.l - p.r, innerH = h - p.t - p.b;
  const all = sources.flatMap(s => s.data);
  const min = Math.min(-1, Math.min(...all));
  const max = Math.max(1, Math.max(...all));
  const xAt = i => p.l + (i / (sources[0].data.length - 1)) * innerW;
  const yAt = v => p.t + (1 - (v - min) / (max - min)) * innerH;
  const yz = yAt(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 240 }}>
      {/* zero line and gridlines */}
      <rect x={p.l} y={p.t} width={innerW} height={yz - p.t} fill="var(--gain-soft)" opacity="0.25" />
      <rect x={p.l} y={yz} width={innerW} height={p.t + innerH - yz} fill="var(--loss-soft)" opacity="0.25" />
      <line x1={p.l} x2={w - p.r} y1={yz} y2={yz} stroke="var(--ink-3)" strokeWidth="1" />

      {[1, 0.5, -0.5, -1].map(v => (
        <g key={v}>
          <line x1={p.l} x2={w - p.r} y1={yAt(v)} y2={yAt(v)} stroke="var(--line-soft)" strokeDasharray="2 3" />
          <text x={p.l - 6} y={yAt(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">{v.toFixed(1)}</text>
        </g>
      ))}

      {events.map((ev, i) => {
        const x = xAt(ev.day);
        const colors = { earn: 'var(--brand)', news: 'var(--info)', down: 'var(--loss)' };
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={p.t} y2={p.t + innerH} stroke={colors[ev.type]} strokeDasharray="3 3" opacity="0.6" />
            <circle cx={x} cy={p.t + 4} r="4" fill={colors[ev.type]} />
            <text x={x + 6} y={p.t + 8} fontSize="10" fill="var(--ink-2)" fontFamily="var(--font-mono)">{ev.label}</text>
          </g>
        );
      })}

      {sources.map((s, si) => (
        <polyline key={si} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round"
          points={s.data.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')} />
      ))}

      <text x={p.l - 28} y={yAt(0.6)} fontSize="9" fill="var(--gain)" fontFamily="var(--font-mono)" transform={`rotate(-90 ${p.l - 28} ${yAt(0.6)})`}>BULLISH</text>
      <text x={p.l - 28} y={yAt(-0.6)} fontSize="9" fill="var(--loss)" fontFamily="var(--font-mono)" transform={`rotate(-90 ${p.l - 28} ${yAt(-0.6)})`}>BEARISH</text>
      {[0, 7, 14, 21, 29].map(d => (
        <text key={d} x={xAt(d)} y={h - 12} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">d-{29 - d}</text>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEWS — shares the news bus with NewsPage
// ═══════════════════════════════════════════════════════════════════════════
const NewsTab = ({ stock }) => {
  const [filter, setFilter] = useState('ticker');
  // Pull from the SAME bus that powers News & Sentiment in the sidebar.
  const all = window.MarketData.news;
  const tickerNews = all.filter(n => n.tickers.includes(stock.symbol));
  const sectorNews = all.filter(n => !n.tickers.includes(stock.symbol)).slice(0, 3);
  const items = filter === 'ticker' ? tickerNews
    : filter === 'sector' ? sectorNews
    : all.filter(n => n.sentiment === filter);

  // Sentiment distribution from items mentioning this ticker
  const dist = { bullish: 0, neutral: 0, bearish: 0 };
  tickerNews.forEach(n => { dist[n.sentiment]++; });
  const total = Math.max(1, tickerNews.length);

  return (
    <div className="stock-grid">
      <div className="col gap-4">
        <Card title={`News bus · ${stock.symbol}`} titleSize="lg" bodyClass="tight" actions={
          <div className="row row-gap-2">
            {[
              ['ticker', `${stock.symbol} only`],
              ['sector', stock.sector],
              ['bullish', 'Bullish'],
              ['bearish', 'Bearish'],
            ].map(([k, lbl]) => (
              <Button key={k} variant={filter === k ? 'primary' : 'ghost'} size="xs" onClick={() => setFilter(k)}>
                {lbl}
              </Button>
            ))}
          </div>
        }>
          {tickerNews.length > 0 && (
            <>
              <div className="newsbus-section-head">
                <span className="label-cap">Direct mentions</span>
                <span className="newsbus-count mono">{tickerNews.length}</span>
              </div>
              <NewsList items={tickerNews} />
            </>
          )}

          {filter !== 'ticker' && (
            <NewsList items={items} />
          )}
        </Card>
      </div>

      <div className="col gap-4">
        <Card title="Mention summary · 24h" titleSize="lg">
          <div className="kpi-trio">
            <div>
              <div className="label-cap">Stories</div>
              <div className="kpi-trio-val">{tickerNews.length || 38}</div>
              <div className="kpi-trio-sub mono delta-gain">+12 vs prior</div>
            </div>
            <div>
              <div className="label-cap">Sentiment</div>
              <div className="kpi-trio-val gain">+0.74</div>
              <div className="kpi-trio-sub">Strongly bullish</div>
            </div>
            <div>
              <div className="label-cap">Outlets</div>
              <div className="kpi-trio-val">42</div>
              <div className="kpi-trio-sub">8 newswire</div>
            </div>
          </div>
          <div className="sent-bar-row">
            <div className="sent-bar-track">
              <div className="sent-bar-pos" style={{ width: `${(dist.bullish/total)*100}%` }}></div>
              <div className="sent-bar-neu" style={{ width: `${(dist.neutral/total)*100}%` }}></div>
              <div className="sent-bar-neg" style={{ width: `${(dist.bearish/total)*100}%` }}></div>
            </div>
            <div className="sent-bar-labels">
              <span className="delta-gain mono">{Math.round((dist.bullish/total)*100) || 70}%</span>
              <span className="mono">{Math.round((dist.neutral/total)*100) || 22}%</span>
              <span className="delta-loss mono">{Math.round((dist.bearish/total)*100) || 8}%</span>
            </div>
          </div>
        </Card>

        <Card title="Coverage tilt" titleSize="lg" bodyClass="tight">
          <div className="cov-tilt">
            <div className="cov-tilt-row">
              <span className="cov-tilt-label">Lean</span>
              <div className="cov-tilt-bar">
                <div className="cov-tilt-seg cov-tilt-l" style={{ width: '24%' }}></div>
                <div className="cov-tilt-seg cov-tilt-c" style={{ width: '48%' }}></div>
                <div className="cov-tilt-seg cov-tilt-r" style={{ width: '28%' }}></div>
              </div>
              <span className="mono cov-tilt-val">24/48/28</span>
            </div>
            <div className="cov-tilt-row">
              <span className="cov-tilt-label">Tier</span>
              <div className="cov-tilt-bar">
                <div className="cov-tilt-seg" style={{ width: '22%', background: 'var(--info)' }}></div>
                <div className="cov-tilt-seg" style={{ width: '54%', background: 'var(--brand)' }}></div>
                <div className="cov-tilt-seg" style={{ width: '24%', background: 'var(--warn)' }}></div>
              </div>
              <span className="mono cov-tilt-val">N/M/T</span>
            </div>
            <div className="cov-tilt-row">
              <span className="cov-tilt-label">Factuality</span>
              <div className="cov-tilt-bar">
                <div className="cov-tilt-seg cov-tilt-fact" style={{ width: '88%' }}></div>
              </div>
              <span className="mono cov-tilt-val">88/100</span>
            </div>
          </div>
        </Card>

        <Card title="Watch this story" titleSize="lg">
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Get notified when factuality crosses thresholds, when bias shifts, or when a primary newswire confirms an unconfirmed story.
          </div>
          <div className="row row-gap-2" style={{ marginTop: 12 }}>
            <Button variant="primary" size="sm">+ Alert</Button>
            <Button variant="ghost" size="sm">Pin to dashboard</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// OPTIONS
// ═══════════════════════════════════════════════════════════════════════════
const OptionsTab = ({ stock }) => {
  const [tab, setTab] = useState('chain');
  const [expiry, setExpiry] = useState('2026-06-19');
  const [strategy, setStrategy] = useState('long-call');
  const last = stock.price;

  // Build chain centered on ATM
  const strikes = Array.from({ length: 11 }, (_, i) => Math.round((last + (i - 5) * (last * 0.025)) / 5) * 5);
  const chain = strikes.map(k => {
    const moneyness = (last - k) / last;
    const callIV = 0.34 + Math.abs(moneyness) * 0.4 + (k > last ? -0.02 : 0.02);
    const putIV = 0.34 + Math.abs(moneyness) * 0.4 + (k < last ? -0.02 : 0.02);
    const callPx = Math.max(0.05, last - k + 18 - Math.abs(moneyness) * 8);
    const putPx = Math.max(0.05, k - last + 18 - Math.abs(moneyness) * 8);
    const itmCall = k < last;
    const itmPut = k > last;
    return {
      strike: k,
      callBid: callPx * 0.99, callAsk: callPx * 1.01, callIV: callIV * 100,
      callDelta: itmCall ? 0.6 + (last - k) / (last * 0.2) : 0.4 - (k - last) / (last * 0.2),
      callOI: Math.round(2000 + Math.random() * 8000), callVol: Math.round(100 + Math.random() * 1500),
      putBid: putPx * 0.99, putAsk: putPx * 1.01, putIV: putIV * 100,
      putDelta: itmPut ? -(0.6 + (k - last) / (last * 0.2)) : -(0.4 - (last - k) / (last * 0.2)),
      putOI: Math.round(1500 + Math.random() * 7000), putVol: Math.round(80 + Math.random() * 1200),
      itmCall, itmPut,
    };
  });

  return (
    <div>
      <div className="opt-toolbar">
        <div className="opt-toolbar-section">
          <span className="label-cap">Expiry</span>
          <div className="chart-tabs">
            {['2026-05-15','2026-06-19','2026-07-17','2026-09-19','2027-01-16','2027-06-18'].map(e => (
              <div key={e} className={`chart-tab ${expiry === e ? 'chart-tab-active' : ''}`}
                   onClick={() => setExpiry(e)}>
                <span className="mono">{e.slice(5)}</span>
              </div>
            ))}
          </div>
          <span className="opt-dte mono">43d to expiry</span>
        </div>
        <div className="opt-toolbar-section">
          <div className="chart-tabs">
            {[['chain','Chain'],['strategy','Strategy'],['surface','IV surface'],['flow','Flow']].map(([k, l]) => (
              <div key={k} className={`chart-tab ${tab === k ? 'chart-tab-active' : ''}`}
                   onClick={() => setTab(k)}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="opt-stat-row">
        <div className="opt-stat"><span className="label-cap">IV (30d)</span><b className="mono">38.4%</b></div>
        <div className="opt-stat"><span className="label-cap">IV rank</span><b className="mono">42</b></div>
        <div className="opt-stat"><span className="label-cap">HV (20d)</span><b className="mono">31.2%</b></div>
        <div className="opt-stat"><span className="label-cap">P/C OI</span><b className="mono">0.72</b></div>
        <div className="opt-stat"><span className="label-cap">P/C Vol</span><b className="mono">0.62</b></div>
        <div className="opt-stat"><span className="label-cap">Max pain</span><b className="mono">${(last * 0.97).toFixed(0)}</b></div>
        <div className="opt-stat"><span className="label-cap">Gamma flip</span><b className="mono">${(last * 1.03).toFixed(0)}</b></div>
        <div className="opt-stat"><span className="label-cap">Skew</span><b className="mono">–4.2</b></div>
      </div>

      {tab === 'chain' && <OptionChain chain={chain} last={last} />}
      {tab === 'strategy' && <StrategyBuilder strategy={strategy} setStrategy={setStrategy} last={last} chain={chain} />}
      {tab === 'surface' && <IVSurface chain={chain} last={last} />}
      {tab === 'flow' && <UnusualFlow stock={stock} />}
    </div>
  );
};

const OptionChain = ({ chain, last }) => (
  <Card title="Option chain" titleSize="lg" bodyClass="tight">
    <table className="opt-chain-table">
      <thead>
        <tr>
          <th colSpan="6" className="opt-chain-side opt-chain-calls">CALLS</th>
          <th className="opt-chain-strike-head">STRIKE</th>
          <th colSpan="6" className="opt-chain-side opt-chain-puts">PUTS</th>
        </tr>
        <tr>
          <th>OI</th><th>Vol</th><th>IV</th><th>Δ</th><th>Bid</th><th>Ask</th>
          <th></th>
          <th>Bid</th><th>Ask</th><th>Δ</th><th>IV</th><th>Vol</th><th>OI</th>
        </tr>
      </thead>
      <tbody>
        {chain.map((r, i) => (
          <tr key={i} className={`${Math.abs(r.strike - last) < last * 0.012 ? 'opt-row-atm' : ''}`}>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callOI.toLocaleString()}</td>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callVol.toLocaleString()}</td>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callIV.toFixed(1)}</td>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callDelta.toFixed(2)}</td>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callBid.toFixed(2)}</td>
            <td className={`mono opt-num ${r.itmCall ? 'opt-itm' : ''}`}>{r.callAsk.toFixed(2)}</td>
            <td className="opt-strike mono">${r.strike}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putBid.toFixed(2)}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putAsk.toFixed(2)}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putDelta.toFixed(2)}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putIV.toFixed(1)}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putVol.toLocaleString()}</td>
            <td className={`mono opt-num ${r.itmPut ? 'opt-itm' : ''}`}>{r.putOI.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="opt-chain-foot">
      <span className="opt-chain-legend"><i className="opt-itm-sw"></i>ITM shaded</span>
      <span className="opt-chain-legend"><i className="opt-atm-sw"></i>ATM row at last ${last.toFixed(2)}</span>
      <span className="spacer"></span>
      <span className="mono">Greeks · spot model · 5min refresh</span>
    </div>
  </Card>
);

const STRATEGIES = {
  'long-call': { name: 'Long call', leg: [{ side: 'buy', type: 'call', strike: 1300 }], view: 'Bullish · defined risk' },
  'long-put': { name: 'Long put', leg: [{ side: 'buy', type: 'put', strike: 1260 }], view: 'Bearish · defined risk' },
  'covered-call': { name: 'Covered call', leg: [{ side: 'sell', type: 'call', strike: 1320 }], view: 'Bullish-flat · income' },
  'cash-put': { name: 'Cash-secured put', leg: [{ side: 'sell', type: 'put', strike: 1240 }], view: 'Bullish-flat · income' },
  'iron-condor': { name: 'Iron condor', leg: [
    { side: 'sell', type: 'put', strike: 1220 }, { side: 'buy', type: 'put', strike: 1180 },
    { side: 'sell', type: 'call', strike: 1340 }, { side: 'buy', type: 'call', strike: 1380 },
  ], view: 'Range-bound · defined' },
  'straddle': { name: 'Long straddle', leg: [
    { side: 'buy', type: 'call', strike: 1280 }, { side: 'buy', type: 'put', strike: 1280 },
  ], view: 'Big move either way' },
};

const StrategyBuilder = ({ strategy, setStrategy, last }) => {
  const s = STRATEGIES[strategy];
  return (
    <div className="opt-strategy-grid">
      <Card title="Strategy" titleSize="lg" bodyClass="tight">
        <div className="strategy-list">
          {Object.entries(STRATEGIES).map(([k, v]) => (
            <button key={k} className={`strategy-pick ${strategy === k ? 'strategy-pick-active' : ''}`}
                    onClick={() => setStrategy(k)}>
              <div className="strategy-pick-name">{v.name}</div>
              <div className="strategy-pick-view">{v.view}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={`P&L · ${s.name}`} titleSize="lg" actions={
        <div className="row row-gap-2">
          <Button variant="ghost" size="xs">+ Leg</Button>
          <Button variant="primary" size="xs">Stage trade</Button>
        </div>
      }>
        <PayoffChart strategy={s} last={last} />
        <div className="payoff-stats">
          <div className="payoff-stat"><span className="label-cap">Max profit</span><b className="mono delta-gain">$2,840</b></div>
          <div className="payoff-stat"><span className="label-cap">Max loss</span><b className="mono delta-loss">–$1,160</b></div>
          <div className="payoff-stat"><span className="label-cap">Breakeven</span><b className="mono">$1,316</b></div>
          <div className="payoff-stat"><span className="label-cap">Net debit</span><b className="mono">$1,160</b></div>
          <div className="payoff-stat"><span className="label-cap">PoP</span><b className="mono">42%</b></div>
          <div className="payoff-stat"><span className="label-cap">R/R</span><b className="mono">2.4×</b></div>
        </div>

        <div className="leg-list">
          <div className="label-cap" style={{ marginBottom: 6 }}>Legs</div>
          {s.leg.map((l, i) => (
            <div key={i} className="leg-row">
              <span className={`leg-side leg-side-${l.side}`}>{l.side.toUpperCase()}</span>
              <span className="mono leg-qty">1×</span>
              <span className="mono leg-strike">${l.strike}</span>
              <span className={`leg-type leg-type-${l.type}`}>{l.type.toUpperCase()}</span>
              <span className="mono leg-exp">06-19</span>
              <span className="mono leg-px">@ $11.60</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Greeks · combined" titleSize="lg" bodyClass="tight">
        <MetricRow label="Δ Delta" value="+0.42" sub="$0.42 per $1 move" tone="gain" bar={42} />
        <MetricRow label="Γ Gamma" value="+0.018" sub="Δ accelerates up" />
        <MetricRow label="Θ Theta" value="–$8.40/d" sub="Time decay against" tone="loss" bar={42} />
        <MetricRow label="ν Vega" value="+$24.10" sub="Long volatility" tone="gain" bar={48} />
        <MetricRow label="ρ Rho" value="+$1.40" sub="Mild rate exposure" />
      </Card>
    </div>
  );
};

const PayoffChart = ({ strategy, last }) => {
  const w = 540, h = 240, p = { t: 16, r: 16, b: 28, l: 44 };
  const innerW = w - p.l - p.r, innerH = h - p.t - p.b;
  const lo = last * 0.85, hi = last * 1.15;
  const pts = 60;
  const pricePts = Array.from({ length: pts }, (_, i) => lo + (hi - lo) * (i / (pts - 1)));
  // Compute payoff per leg
  const pls = pricePts.map(price => {
    let pl = 0;
    strategy.leg.forEach(l => {
      const intrinsic = l.type === 'call'
        ? Math.max(0, price - l.strike)
        : Math.max(0, l.strike - price);
      const prem = 14;
      pl += (l.side === 'buy' ? 1 : -1) * (intrinsic - prem);
    });
    return pl * 100;
  });
  const min = Math.min(...pls);
  const max = Math.max(...pls);
  const xAt = i => p.l + (i / (pts - 1)) * innerW;
  const yAt = v => p.t + (1 - (v - min) / (max - min)) * innerH;
  const yz = yAt(0);
  const xLast = p.l + ((last - lo) / (hi - lo)) * innerW;

  // Build separate paths for positive and negative regions
  const positivePoints = pls.map((v, i) => ({ x: xAt(i), y: yAt(v), v, i }));
  const linePath = positivePoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 240 }}>
      {/* zero gain/loss zones */}
      <rect x={p.l} y={p.t} width={innerW} height={yz - p.t} fill="var(--gain-soft)" opacity="0.5" />
      <rect x={p.l} y={yz} width={innerW} height={p.t + innerH - yz} fill="var(--loss-soft)" opacity="0.5" />
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <line key={i} x1={p.l} x2={w - p.r} y1={p.t + t * innerH} y2={p.t + t * innerH} stroke="var(--line-soft)" strokeDasharray="2 3" />
      ))}
      <line x1={p.l} x2={w - p.r} y1={yz} y2={yz} stroke="var(--ink-2)" strokeWidth="1" />
      {/* current spot */}
      <line x1={xLast} x2={xLast} y1={p.t} y2={p.t + innerH} stroke="var(--brand)" strokeDasharray="4 3" strokeWidth="1.5" />
      <text x={xLast} y={p.t - 4} fontSize="10" fill="var(--brand)" fontFamily="var(--font-mono)" textAnchor="middle">
        spot ${last.toFixed(0)}
      </text>
      {/* payoff curve */}
      <path d={linePath} fill="none" stroke="var(--ink-1)" strokeWidth="2" strokeLinejoin="round" />
      {/* y-axis labels */}
      <text x={p.l - 6} y={p.t + 12} textAnchor="end" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">${(max).toFixed(0)}</text>
      <text x={p.l - 6} y={yz + 3} textAnchor="end" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">$0</text>
      <text x={p.l - 6} y={p.t + innerH - 2} textAnchor="end" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">${(min).toFixed(0)}</text>
      {/* x-axis */}
      {[lo, lo + (hi - lo) * 0.25, last, lo + (hi - lo) * 0.75, hi].map((v, i) => {
        const x = p.l + ((v - lo) / (hi - lo)) * innerW;
        return <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">${v.toFixed(0)}</text>;
      })}
    </svg>
  );
};

const IVSurface = ({ chain, last }) => (
  <Card title="Implied volatility surface" titleSize="lg">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <div className="label-cap" style={{ marginBottom: 8 }}>Skew · current expiry</div>
        <svg viewBox="0 0 420 200" style={{ width: '100%', height: 200 }}>
          {/* skew curves */}
          <line x1="40" x2="410" y1="180" y2="180" stroke="var(--line-soft)" />
          <line x1="40" x2="40" y1="20" y2="180" stroke="var(--line-soft)" />
          <polyline fill="none" stroke="var(--brand)" strokeWidth="2"
            points={chain.map((r, i) => `${40 + (i / (chain.length - 1)) * 370},${180 - r.callIV * 1.8}`).join(' ')} />
          <polyline fill="none" stroke="var(--info)" strokeWidth="2" strokeDasharray="3 2"
            points={chain.map((r, i) => `${40 + (i / (chain.length - 1)) * 370},${180 - r.putIV * 1.8}`).join(' ')} />
          <line x1={40 + (5 / 10) * 370} x2={40 + (5 / 10) * 370} y1="20" y2="180" stroke="var(--ink-3)" strokeDasharray="3 3" />
          <text x={40 + (5 / 10) * 370} y="14" textAnchor="middle" fontSize="10" fill="var(--ink-2)" fontFamily="var(--font-mono)">ATM</text>
          <text x="46" y="32" fontSize="10" fill="var(--brand)">Calls</text>
          <text x="46" y="46" fontSize="10" fill="var(--info)">Puts</text>
        </svg>
      </div>
      <div>
        <div className="label-cap" style={{ marginBottom: 8 }}>Term structure · ATM IV</div>
        <svg viewBox="0 0 420 200" style={{ width: '100%', height: 200 }}>
          <line x1="40" x2="410" y1="180" y2="180" stroke="var(--line-soft)" />
          <line x1="40" x2="40" y1="20" y2="180" stroke="var(--line-soft)" />
          <polyline fill="none" stroke="var(--gain)" strokeWidth="2"
            points="40,120 110,108 180,98 250,92 320,88 390,86" />
          {[['7d',40],['30d',110],['60d',180],['90d',250],['180d',320],['1y',390]].map(([l, x]) => (
            <text key={l} x={x} y="195" textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">{l}</text>
          ))}
        </svg>
        <div className="iv-foot mono">Contango · vol curve normal-shaped</div>
      </div>
    </div>
    <div className="iv-grid">
      <div className="iv-stat"><span className="label-cap">25Δ skew</span><b className="mono">–4.2</b><span className="iv-stat-sub">Calls bid</span></div>
      <div className="iv-stat"><span className="label-cap">ATM 30d</span><b className="mono">38.4%</b><span className="iv-stat-sub">42 IVR</span></div>
      <div className="iv-stat"><span className="label-cap">RV / IV</span><b className="mono">0.81</b><span className="iv-stat-sub">Vol rich</span></div>
      <div className="iv-stat"><span className="label-cap">Front/back</span><b className="mono">1.09×</b><span className="iv-stat-sub">Earnings bid</span></div>
    </div>
  </Card>
);

const UnusualFlow = ({ stock }) => {
  const flows = [
    { time: '11:38:14', side: 'BUY', type: 'CALL', strike: 1300, exp: '2026-06-19', size: '4,200', prem: '$2.4M', iv: '41.2', spot: 'bid', score: 92 },
    { time: '11:32:08', side: 'BUY', type: 'CALL', strike: 1350, exp: '2026-09-19', size: '1,800', prem: '$1.8M', iv: '38.6', spot: 'ask', score: 88 },
    { time: '11:18:42', side: 'SELL', type: 'PUT', strike: 1240, exp: '2026-06-19', size: '3,100', prem: '$1.2M', iv: '36.4', spot: 'bid', score: 76 },
    { time: '10:54:18', side: 'BUY', type: 'CALL', strike: 1400, exp: '2027-01-16', size: '900', prem: '$1.6M', iv: '36.1', spot: 'ask', score: 84 },
    { time: '10:42:01', side: 'BUY', type: 'CALL', strike: 1280, exp: '2026-05-15', size: '5,600', prem: '$2.1M', iv: '46.4', spot: 'mid', score: 71 },
    { time: '10:18:36', side: 'BUY', type: 'PUT', strike: 1200, exp: '2026-07-17', size: '2,400', prem: '$1.4M', iv: '38.2', spot: 'ask', score: 68 },
  ];

  return (
    <div className="opt-flow-layout">
      <Card title="Unusual options activity · today" titleSize="lg" bodyClass="tight">
        <table className="flow-table">
          <thead>
            <tr>
              <th>Time</th><th>Side</th><th>Contract</th><th>Exp</th>
              <th className="num">Size</th><th className="num">Premium</th>
              <th className="num">IV</th><th>At</th><th className="num">Score</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((f, i) => (
              <tr key={i}>
                <td className="mono">{f.time}</td>
                <td><span className={`flow-side flow-side-${f.side.toLowerCase()}`}>{f.side}</span></td>
                <td className="mono">${f.strike} <span className={`flow-type flow-type-${f.type.toLowerCase()}`}>{f.type}</span></td>
                <td className="mono">{f.exp.slice(5)}</td>
                <td className="mono num">{f.size}</td>
                <td className="mono num">{f.prem}</td>
                <td className="mono num">{f.iv}%</td>
                <td className={`flow-at flow-at-${f.spot}`}>{f.spot.toUpperCase()}</td>
                <td className="mono num"><span className="flow-score" style={{ '--s': f.score + '%' }}>{f.score}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Flow summary" titleSize="lg">
        <div className="flow-summary-grid">
          <div className="flow-summary-stat">
            <span className="label-cap">Net premium</span>
            <b className="mono delta-gain">+$8.4M</b>
            <span className="flow-summary-sub">to call buyers</span>
          </div>
          <div className="flow-summary-stat">
            <span className="label-cap">Call/Put $</span>
            <b className="mono">3.8×</b>
            <span className="flow-summary-sub">Strongly bullish</span>
          </div>
          <div className="flow-summary-stat">
            <span className="label-cap">Above ask</span>
            <b className="mono">62%</b>
            <span className="flow-summary-sub">Aggressive</span>
          </div>
          <div className="flow-summary-stat">
            <span className="label-cap">Sweeps</span>
            <b className="mono">4</b>
            <span className="flow-summary-sub">Multi-exchange</span>
          </div>
        </div>
        <div className="label-cap" style={{ marginTop: 14, marginBottom: 6 }}>Top strikes by premium</div>
        {[
          ['$1300C 06-19', 84, '$2.4M'],
          ['$1280C 05-15', 76, '$2.1M'],
          ['$1350C 09-19', 64, '$1.8M'],
          ['$1400C 27-01', 58, '$1.6M'],
          ['$1200P 07-17', 50, '$1.4M'],
        ].map(([n, w, p]) => (
          <div key={n} className="flow-strike-row">
            <span className="mono flow-strike-name">{n}</span>
            <div className="flow-strike-bar">
              <div className="flow-strike-fill" style={{ width: `${w}%` }}></div>
            </div>
            <span className="mono flow-strike-prem">{p}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

window.TechnicalsTab = TechnicalsTab;
window.FundamentalsTab = FundamentalsTab;
window.SentimentTab = SentimentTab;
window.NewsTab = NewsTab;
window.OptionsTab = OptionsTab;
