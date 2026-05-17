// Trim ticket — detail body for tickets of kind 'trim'.
// Mounts inside the TicketsPage detail pane. Reads the order spec from
// `ticket.payload`, mutates local form state, and writes back to the store
// when the user confirms.

const TrimTicketDetail = ({ ticket }) => {
  const p = ticket.payload || {};

  const [shares, setShares] = useState(p.shares ?? 58);
  const [orderType, setOrderType] = useState(p.orderType || 'limit');
  const [limitPx, setLimitPx] = useState(p.limitPx ?? 462.10);
  const [tif, setTif] = useState(p.tif || 'day');
  const [destSleeve, setDestSleeve] = useState(p.destSleeve || 'tbill');

  const symbol = p.symbol || 'NVDA';
  const px = p.limitPx ?? 462.10;
  const proceeds = shares * px;
  const totalShares = p.totalShares ?? 167;
  const afterShares = totalShares - shares;
  const navBefore = 418294;
  const navAfter = navBefore;
  const wBefore = p.weightBefore ?? 18.4;
  const wAfter = +(((afterShares * px) / navAfter) * 100).toFixed(1);
  const cashBefore = p.cashBefore ?? 5.9;
  const cashAfter = destSleeve === 'cash' ? +(cashBefore + (proceeds / navAfter) * 100).toFixed(1) : cashBefore;

  const lots = [
    { id: 'L-2023-04-12', date: 'Apr 12 2023', qty: 24, basis: 274.45, tax: 'long', pnl: (px - 274.45) * 24 },
    { id: 'L-2023-08-03', date: 'Aug 03 2023', qty: 18, basis: 460.20, tax: 'long', pnl: (px - 460.20) * 18 },
    { id: 'L-2023-11-21', date: 'Nov 21 2023', qty: 16, basis: 489.85, tax: 'long', pnl: (px - 489.85) * 16 },
  ];
  const totalQty = lots.reduce((a, l) => a + l.qty, 0);
  const totalGain = lots.reduce((a, l) => a + l.pnl, 0);
  const ltGain = lots.filter(l => l.tax === 'long').reduce((a, l) => a + l.pnl, 0);
  const taxRate = 0.238;
  const taxOwed = ltGain * taxRate;

  const fmtMoney = (n, opts = {}) => {
    const sign = n < 0 ? '−' : '';
    const abs = Math.abs(n);
    return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: opts.cents ? 2 : 0, maximumFractionDigits: opts.cents ? 2 : 0 });
  };

  const isQueued = ticket.status === 'queued' || ticket.status === 'filled';

  const onConfirm = () => {
    window.TicketStore.update(
      ticket.id,
      {
        status: 'queued',
        payload: { ...ticket.payload, shares, orderType, limitPx, tif, destSleeve },
      },
      { by: 'Elena', event: 'queued', note: `Confirmed · ${shares} sh ${symbol} · ${orderType.toUpperCase()}` }
    );
  };

  if (isQueued) {
    return (
      <div className="ticket-shell">
        <div className="ticket-confirmed">
          <div className="ticket-confirmed-glyph">✓</div>
          <h1 className="ticket-confirmed-title">
            {ticket.status === 'filled' ? 'Trim ticket filled.' : 'Trim ticket queued.'}
          </h1>
          <p className="ticket-confirmed-body">
            Sell {shares} sh {symbol} · {orderType === 'limit' ? `LMT ${limitPx.toFixed(2)}` : orderType.toUpperCase()} · {tif.toUpperCase()}.
            Proceeds {ticket.status === 'filled' ? 'routed' : 'will route'} to your {destSleeve === 'tbill' ? '4-week T-bill ladder' : 'cash sweep'}.
          </p>
          <div className="ticket-confirmed-actions">
            <button className="zen-btn zen-btn-secondary" onClick={() => window.AppStore.setPage('dashboard')}>
              Back to Zen
            </button>
            <button
              className="zen-btn zen-btn-ghost"
              onClick={() => window.TicketStore.update(ticket.id, { status: 'open' }, { by: 'Elena', event: 'reopened' })}
            >
              Edit ticket
            </button>
          </div>
          <TicketHistory ticket={ticket} />
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-shell">
      <header className="ticket-head">
        <div className="ticket-eyebrow">
          <span className="zen-eyebrow-dot" />
          <span>Trim ticket · drafted by FrieNi</span>
          <span className="ticket-eyebrow-time">· {ticket.id}</span>
        </div>
        <h1 className="ticket-title">
          Sell <strong>{shares}</strong> shares of {symbol} at <strong>${limitPx.toFixed(2)}</strong> limit.
        </h1>
        <p className="ticket-lede">
          {ticket.summary} Realizes ~{fmtMoney(ltGain, { cents: false })} in long-term gains
          and frees {fmtMoney(proceeds, { cents: false })} of buying power.
        </p>
      </header>

      <section className="ticket-section">
        <div className="ticket-section-head">
          <span className="ticket-section-label">Portfolio impact</span>
          <span className="ticket-section-meta">snapshot at fill</span>
        </div>
        <div className="ticket-impact">
          <ImpactRow
            label={`${symbol} weight`}
            before={`${wBefore.toFixed(1)}%`}
            after={`${wAfter.toFixed(1)}%`}
            target="target 12.0% · cap 15.0%"
            tone={wAfter <= 12.5 ? 'good' : 'warn'}
            barBefore={wBefore} barAfter={wAfter} barMax={20} barTarget={12} barCap={15}
          />
          <ImpactRow
            label="Cash sleeve"
            before={`${cashBefore.toFixed(1)}%`}
            after={`${cashAfter.toFixed(1)}%`}
            target="target 4–8%"
            tone="neutral"
          />
          <ImpactRow
            label="T-bill ladder"
            before="$48,400"
            after={destSleeve === 'tbill' ? '$75,200' : '$48,400'}
            target="rolls weekly · 5.28% APY"
            tone="neutral"
          />
        </div>
      </section>

      <section className="ticket-section">
        <div className="ticket-section-head">
          <span className="ticket-section-label">Tax lots · highest-cost-basis first</span>
          <button className="ticket-section-link">Override selection</button>
        </div>
        <table className="ticket-lots">
          <thead>
            <tr>
              <th>Lot</th><th>Acquired</th><th className="num">Qty</th>
              <th className="num">Cost basis</th><th>Tax</th><th className="num">Realized P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id}>
                <td><span className="ticket-lot-id">{l.id}</span></td>
                <td>{l.date}</td>
                <td className="num">{l.qty}</td>
                <td className="num">${l.basis.toFixed(2)}</td>
                <td><span className="ticket-tax-pill">Long-term</span></td>
                <td className="num pos">{fmtMoney(l.pnl, { cents: false })}</td>
              </tr>
            ))}
            <tr className="ticket-lots-total">
              <td colSpan="2">Total</td>
              <td className="num">{totalQty}</td>
              <td className="num"></td><td></td>
              <td className="num pos">{fmtMoney(totalGain, { cents: false })}</td>
            </tr>
          </tbody>
        </table>
        <div className="ticket-tax-summary">
          <div>
            <div className="ticket-tax-summary-label">Long-term gain</div>
            <div className="ticket-tax-summary-value">{fmtMoney(ltGain, { cents: false })}</div>
          </div>
          <div>
            <div className="ticket-tax-summary-label">Est. tax owed</div>
            <div className="ticket-tax-summary-value">{fmtMoney(taxOwed, { cents: false })}</div>
            <div className="ticket-tax-summary-sub">23.8% blended · LTCG + NIIT</div>
          </div>
          <div>
            <div className="ticket-tax-summary-label">Net of tax</div>
            <div className="ticket-tax-summary-value">{fmtMoney(proceeds - taxOwed, { cents: false })}</div>
          </div>
          <div>
            <div className="ticket-tax-summary-label">Wash-sale risk</div>
            <div className="ticket-tax-summary-value">None</div>
            <div className="ticket-tax-summary-sub">no {symbol} buys in 30d</div>
          </div>
        </div>
      </section>

      <section className="ticket-section">
        <div className="ticket-section-head">
          <span className="ticket-section-label">Execution</span>
          <span className="ticket-section-meta">Alpaca · routed via SMART</span>
        </div>
        <div className="ticket-form">
          <div className="ticket-field">
            <label className="ticket-field-label">Quantity</label>
            <div className="ticket-qty">
              <button className="ticket-qty-step" onClick={() => setShares(Math.max(1, shares - 1))}>−</button>
              <input
                type="number"
                className="ticket-qty-input"
                value={shares}
                onChange={e => setShares(Math.max(1, Math.min(totalShares, +e.target.value || 0)))}
              />
              <button className="ticket-qty-step" onClick={() => setShares(Math.min(totalShares, shares + 1))}>+</button>
              <span className="ticket-qty-helper">of {totalShares} held · {((shares / totalShares) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="ticket-field">
            <label className="ticket-field-label">Order type</label>
            <div className="ticket-segmented">
              {[{ id: 'limit', label: 'Limit' }, { id: 'market', label: 'Market' }, { id: 'twap', label: 'TWAP · 30 min' }].map(o => (
                <button key={o.id} className={`ticket-seg ${orderType === o.id ? 'active' : ''}`} onClick={() => setOrderType(o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {orderType === 'limit' && (
            <div className="ticket-field">
              <label className="ticket-field-label">Limit price</label>
              <div className="ticket-price">
                <span className="ticket-price-prefix">$</span>
                <input type="number" step="0.01" className="ticket-price-input" value={limitPx.toFixed(2)} onChange={e => setLimitPx(+e.target.value || 0)} />
                <span className="ticket-price-helper">last $462.10 · bid 462.06 · ask 462.14</span>
              </div>
            </div>
          )}
          <div className="ticket-field">
            <label className="ticket-field-label">Time in force</label>
            <div className="ticket-segmented">
              {[{ id: 'day', label: 'Day' }, { id: 'gtc', label: 'GTC · 90d' }, { id: 'ioc', label: 'IOC' }].map(o => (
                <button key={o.id} className={`ticket-seg ${tif === o.id ? 'active' : ''}`} onClick={() => setTif(o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ticket-field">
            <label className="ticket-field-label">Route proceeds to</label>
            <div className="ticket-radios">
              <label className={`ticket-radio ${destSleeve === 'tbill' ? 'active' : ''}`}>
                <input type="radio" checked={destSleeve === 'tbill'} onChange={() => setDestSleeve('tbill')} />
                <div>
                  <div className="ticket-radio-title">4-week T-bill ladder</div>
                  <div className="ticket-radio-sub">5.28% APY · same-day liquidity</div>
                </div>
              </label>
              <label className={`ticket-radio ${destSleeve === 'cash' ? 'active' : ''}`}>
                <input type="radio" checked={destSleeve === 'cash'} onChange={() => setDestSleeve('cash')} />
                <div>
                  <div className="ticket-radio-title">Cash sweep</div>
                  <div className="ticket-radio-sub">4.10% APY · settles T+1</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <TicketHistory ticket={ticket} />

      <div className="ticket-confirm">
        <div className="ticket-confirm-summary">
          <div className="ticket-confirm-line">
            <strong>SELL {shares} {symbol}</strong>
            <span className="ticket-confirm-sep">·</span>
            <span>{orderType === 'limit' ? `LMT $${limitPx.toFixed(2)}` : orderType === 'market' ? 'MKT' : 'TWAP 30m'}</span>
            <span className="ticket-confirm-sep">·</span>
            <span>{tif.toUpperCase()}</span>
          </div>
          <div className="ticket-confirm-sub">
            Est. proceeds <strong>{fmtMoney(proceeds, { cents: false })}</strong>
            <span className="ticket-confirm-sep">·</span>
            Net of tax <strong>{fmtMoney(proceeds - taxOwed, { cents: false })}</strong>
            <span className="ticket-confirm-sep">·</span>
            {symbol} weight {wBefore.toFixed(1)}% → <strong>{wAfter.toFixed(1)}%</strong>
          </div>
        </div>
        <button className="zen-btn zen-btn-ghost" onClick={() => window.TicketStore.setStatus(ticket.id, 'dismissed', { note: 'Cancelled by user' })}>Cancel</button>
        <button className="zen-btn zen-btn-secondary" onClick={() => window.TicketStore.update(ticket.id, { payload: { ...ticket.payload, shares, orderType, limitPx, tif, destSleeve } }, { by: 'Elena', event: 'saved draft' })}>Save as draft</button>
        <button className="zen-btn zen-btn-primary" onClick={onConfirm}>Confirm trim</button>
      </div>
    </div>
  );
};

const ImpactRow = ({ label, before, after, target, tone, barBefore, barAfter, barMax, barTarget, barCap }) => {
  const hasBar = barBefore !== undefined;
  return (
    <div className={`ticket-impact-row tone-${tone || 'neutral'}`}>
      <div className="ticket-impact-label">
        <div className="ticket-impact-label-name">{label}</div>
        <div className="ticket-impact-label-target">{target}</div>
      </div>
      <div className="ticket-impact-values">
        <div className="ticket-impact-before">
          <span className="ticket-impact-tag">Now</span>
          <span className="ticket-impact-value">{before}</span>
        </div>
        <div className="ticket-impact-arrow" aria-hidden="true">→</div>
        <div className="ticket-impact-after">
          <span className="ticket-impact-tag">After</span>
          <span className="ticket-impact-value">{after}</span>
        </div>
      </div>
      {hasBar && (
        <div className="ticket-impact-bar">
          <div className="ticket-impact-bar-track">
            <span className="ticket-impact-bar-cap" style={{ left: `${(barCap / barMax) * 100}%` }} />
            <span className="ticket-impact-bar-target" style={{ left: `${(barTarget / barMax) * 100}%` }} />
            <span className="ticket-impact-bar-before" style={{ width: `${(barBefore / barMax) * 100}%` }} />
            <span className="ticket-impact-bar-after" style={{ width: `${(barAfter / barMax) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Register this kind with the registry — this is the modular extension point.
window.TicketRegistry.register('trim', {
  label: 'Trim',
  glyph: '↘',
  DetailComponent: TrimTicketDetail,
});

window.TrimTicketDetail = TrimTicketDetail;

// Back-compat: TrimTicketPage was referenced by AppRoutes for the old direct page.
// Now it just opens the tickets page with the most recent open trim ticket selected.
window.TrimTicketPage = () => {
  useEffect(() => {
    const trim = window.TicketStore.list({ status: 'open', kind: 'trim' })[0];
    if (trim) {
      window.TicketStore.setActive(trim.id);
      window.AppStore.setPage('tickets');
    } else {
      window.AppStore.setPage('tickets');
    }
  }, []);
  return null;
};
