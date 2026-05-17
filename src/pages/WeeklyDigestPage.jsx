// Weekly Digest — the page that opens from Zen mode's "Review weekly digest" action.
// Quiet, scannable, prose-forward. Mirrors the Zen aesthetic.
//
// The three insights below ("needs attention", "opportunity", "worth noting")
// are wired into the central TicketStore. Their primary actions either open
// an existing open ticket or create one via TicketStore.openOrCreate, using
// `source.ref` as a dedupe key so re-opening the digest doesn't pile up
// duplicates. New kinds (`cash-yield`, `events`) ride the same registry as
// `trim` — they fall back to GenericTicketDetail until a custom workflow ships.

// Helper used by all three insights — open or create a ticket, then route.
const openTicket = (spec) => {
  window.TicketStore.openOrCreate(spec);
  window.AppStore.setPage('tickets');
};

// The three insight specs live as data so the JSX stays uncluttered and
// other modules (e.g. Zen, Alerts) can import the same dedupe refs.
const DIGEST_INSIGHT_TICKETS = {
  concentration: {
    kind: 'trim',
    priority: 'normal',
    source: { module: 'digest', ref: 'digest-2026-w18-nvda-concentration', label: 'Weekly digest' },
    subject: 'Trim NVDA toward 12% target',
    summary: 'NVDA at 14.1% — 0.9pp of headroom to the 15% cap. Two more weeks at this pace breaches it.',
    payload: {
      symbol: 'NVDA', side: 'sell', shares: 28, totalShares: 127,
      limitPx: 462.10, orderType: 'limit', tif: 'day', destSleeve: 'tbill',
      weightBefore: 14.1, weightTarget: 12, weightCap: 15, cashBefore: 5.9,
    },
  },
  cashYield: {
    kind: 'cash-yield',
    priority: 'low',
    source: { module: 'digest', ref: 'digest-2026-w18-cash-ladder', label: 'Weekly digest' },
    subject: 'Enable auto-ladder for cash sleeve',
    summary: 'Move excess above $15k buying-power floor into a 4-week T-bill ladder. +$240/yr at current size.',
    payload: { sweepApy: 4.10, ladderApy: 5.28, principal: 24820, projectedAnnual: 240 },
  },
  events: {
    kind: 'events',
    priority: 'low',
    source: { module: 'digest', ref: 'digest-2026-w18-calendar', label: 'Weekly digest' },
    subject: 'Two events before next digest',
    summary: 'CPI Tue 08:30 ET, MSFT earnings Wed after close. Both within volatility budget.',
    payload: {
      events: [
        { day: 'Tue', time: '08:30 ET', name: 'CPI · April',     impact: '±0.4% typical move' },
        { day: 'Wed', time: 'After close', name: 'MSFT earnings · 8.2% of book', impact: 'Within volatility budget' },
      ],
    },
  },
};

const WeeklyDigestPage = () => {
  return (
    <div className="digest-shell">
      <button className="digest-back" onClick={() => window.AppStore.setPage('dashboard')}>
        ← Back to dashboard
      </button>

      <header className="digest-head">
        <div className="digest-eyebrow">
          <span className="zen-eyebrow-dot" />
          <span>Weekly digest · Apr 28 – May 4</span>
        </div>
        <h1 className="digest-title">A quiet week. Your plan held.</h1>
        <p className="digest-lede">
          Markets drifted higher on soft inflation data. Your portfolio compounded with it —
          no rebalances triggered, no alerts fired, no policy bands breached. Here's what
          mattered, and what to know going into next week.
        </p>
      </header>

      {/* Five-up summary line */}
      <section className="digest-summary">
        <div className="digest-summary-item">
          <div className="digest-summary-label">Portfolio</div>
          <div className="digest-summary-value">+1.42%</div>
          <div className="digest-summary-sub">+$5,840 · S&P +1.18%</div>
        </div>
        <div className="digest-summary-item">
          <div className="digest-summary-label">Best</div>
          <div className="digest-summary-value gain">NVDA +4.6%</div>
          <div className="digest-summary-sub">+$1,920 contribution</div>
        </div>
        <div className="digest-summary-item">
          <div className="digest-summary-label">Worst</div>
          <div className="digest-summary-value loss">MRNA −2.1%</div>
          <div className="digest-summary-sub">−$184 contribution</div>
        </div>
        <div className="digest-summary-item">
          <div className="digest-summary-label">Drift</div>
          <div className="digest-summary-value">0.4%</div>
          <div className="digest-summary-sub">within ±2.0% band</div>
        </div>
        <div className="digest-summary-item">
          <div className="digest-summary-label">Alerts</div>
          <div className="digest-summary-value">0 / 12</div>
          <div className="digest-summary-sub">none triggered</div>
        </div>
      </section>

      <div className="digest-grid">
        {/* What FrieNi did */}
        <section className="digest-block">
          <div className="digest-block-eyebrow">What FrieNi did this week</div>
          <ul className="digest-log">
            <li>
              <span className="digest-log-day">Mon</span>
              <div>
                <div className="digest-log-line">Re-priced cost basis on 14 lots after May 1 corporate actions.</div>
                <div className="digest-log-detail">Tax estimate refreshed · no realized events</div>
              </div>
            </li>
            <li>
              <span className="digest-log-day">Tue</span>
              <div>
                <div className="digest-log-line">Reviewed 47 news items, surfaced 3 (MSFT cloud guide, NVDA Blackwell, Fed minutes).</div>
                <div className="digest-log-detail">All read · none required action</div>
              </div>
            </li>
            <li>
              <span className="digest-log-day">Wed</span>
              <div>
                <div className="digest-log-line">Checked your sector caps after AVGO ran +2.8%.</div>
                <div className="digest-log-detail">Semis 22% · still within 25% cap</div>
              </div>
            </li>
            <li>
              <span className="digest-log-day">Thu</span>
              <div>
                <div className="digest-log-line">Confirmed dividend — JNJ $1.19/sh, $214 credited.</div>
                <div className="digest-log-detail">Auto-routed to cash sleeve per your settings</div>
              </div>
            </li>
            <li>
              <span className="digest-log-day">Fri</span>
              <div>
                <div className="digest-log-line">Ran the weekly drift &amp; risk pass.</div>
                <div className="digest-log-detail">VaR 1.9% NAV · drift 0.4% · no rebalance suggested</div>
              </div>
            </li>
          </ul>
        </section>

        {/* Performance */}
        <section className="digest-block">
          <div className="digest-block-eyebrow">Performance vs. plan</div>
          <div className="digest-perf">
            <div className="digest-perf-row">
              <div className="digest-perf-label">Week</div>
              <div className="digest-perf-bars">
                <div className="digest-perf-bar you" style={{ width: '71%' }}><span>+1.42%</span></div>
                <div className="digest-perf-bar bench" style={{ width: '59%' }}><span>+1.18%</span></div>
              </div>
            </div>
            <div className="digest-perf-row">
              <div className="digest-perf-label">Month</div>
              <div className="digest-perf-bars">
                <div className="digest-perf-bar you" style={{ width: '52%' }}><span>+2.10%</span></div>
                <div className="digest-perf-bar bench" style={{ width: '63%' }}><span>+2.54%</span></div>
              </div>
            </div>
            <div className="digest-perf-row">
              <div className="digest-perf-label">YTD</div>
              <div className="digest-perf-bars">
                <div className="digest-perf-bar you" style={{ width: '78%' }}><span>+9.1%</span></div>
                <div className="digest-perf-bar bench" style={{ width: '70%' }}><span>+8.2%</span></div>
              </div>
            </div>
            <div className="digest-perf-row">
              <div className="digest-perf-label">1Y</div>
              <div className="digest-perf-bars">
                <div className="digest-perf-bar you" style={{ width: '84%' }}><span>+18.4%</span></div>
                <div className="digest-perf-bar bench" style={{ width: '79%' }}><span>+17.2%</span></div>
              </div>
            </div>
            <div className="digest-perf-legend">
              <span><span className="digest-swatch you" /> Your portfolio</span>
              <span><span className="digest-swatch bench" /> S&amp;P 500</span>
            </div>
          </div>
        </section>

        {/* Three things worth knowing */}
        <section className="digest-block digest-block-wide" data-comment-anchor="digest-three">
          <div className="digest-block-eyebrow digest-block-eyebrow-row">
            <span>Three things worth knowing</span>
            <span className="digest-block-meta">1 needs attention · 1 opportunity · 1 to note</span>
          </div>

          <ol className="digest-insights">
            <li className="digest-insight" data-tone="attention">
              <div className="digest-insight-rail" aria-hidden="true" />
              <div className="digest-insight-body">
                <div className="digest-insight-meta">
                  <span className="digest-insight-tone">
                    <span className="digest-insight-dot" />
                    Needs attention
                  </span>
                  <span className="digest-insight-cat">Concentration · NVDA</span>
                </div>
                <h3 className="digest-insight-title">
                  NVDA is drifting toward your 15% cap.
                </h3>
                <div className="digest-signal">
                  <div className="digest-signal-stats">
                    <div className="digest-signal-stat">
                      <span className="digest-signal-stat-label">Target</span>
                      <span className="digest-signal-stat-value">12.0%</span>
                    </div>
                    <div className="digest-signal-stat is-now">
                      <span className="digest-signal-stat-label">Now</span>
                      <span className="digest-signal-stat-value">14.1%</span>
                      <span className="digest-signal-stat-delta">+0.4 pp this wk</span>
                    </div>
                    <div className="digest-signal-stat">
                      <span className="digest-signal-stat-label">Cap</span>
                      <span className="digest-signal-stat-value">15.0%</span>
                    </div>
                    <div className="digest-signal-stat">
                      <span className="digest-signal-stat-label">Headroom</span>
                      <span className="digest-signal-stat-value">0.9 pp</span>
                      <span className="digest-signal-stat-delta">~2 wks at pace</span>
                    </div>
                  </div>
                  <div className="digest-signal-track">
                    <span className="digest-signal-fill" style={{ width: '94%' }} />
                    <span className="digest-signal-target" style={{ left: '80%' }} title="Target 12%" />
                    <span className="digest-signal-cap" style={{ left: '100%' }} title="Cap 15%" />
                    <span className="digest-signal-now-marker" style={{ left: '94%' }} />
                  </div>
                </div>
                <p className="digest-insight-prose">
                  Two more weeks at this pace would breach the cap. If you don't want to trim,
                  raise the target so future drift checks compare against the right number.
                </p>
                <div className="digest-insight-actions">
                  <button
                    className="zen-btn zen-btn-primary"
                    onClick={() => openTicket(DIGEST_INSIGHT_TICKETS.concentration)}
                  >Trim to 12%</button>
                  <button
                    className="zen-btn zen-btn-ghost"
                    onClick={() => openTicket({
                      ...DIGEST_INSIGHT_TICKETS.concentration,
                      source: { ...DIGEST_INSIGHT_TICKETS.concentration.source, ref: DIGEST_INSIGHT_TICKETS.concentration.source.ref + '-raise-target' },
                      kind: 'policy-edit',
                      subject: 'Raise NVDA target to 15%',
                      summary: 'Lift single-name target so future drift checks compare against the new number.',
                      payload: { symbol: 'NVDA', currentTarget: 12, proposedTarget: 15, currentCap: 15 },
                    })}
                  >Raise target to 15%</button>
                  <button
                    className="digest-insight-snooze"
                    aria-label="Snooze for one week"
                    onClick={() => {
                      const t = window.TicketStore.openOrCreate(DIGEST_INSIGHT_TICKETS.concentration);
                      window.TicketStore.setStatus(t.id, 'snoozed', { note: 'Snoozed 1 week from digest' });
                    }}
                  >
                    Snooze 1w
                  </button>
                </div>
              </div>
            </li>

            <li className="digest-insight" data-tone="opportunity">
              <div className="digest-insight-rail" aria-hidden="true" />
              <div className="digest-insight-body">
                <div className="digest-insight-meta">
                  <span className="digest-insight-tone">
                    <span className="digest-insight-dot" />
                    Opportunity
                  </span>
                  <span className="digest-insight-cat">Cash · low-effort yield</span>
                </div>
                <h3 className="digest-insight-title">
                  Your cash sleeve is earning 1.2 pp less than it could.
                </h3>
                <div className="digest-compare">
                  <div className="digest-compare-row">
                    <span className="digest-compare-label">Default sweep</span>
                    <span className="digest-compare-value">4.10%</span>
                    <span className="digest-compare-amt">$24,820</span>
                  </div>
                  <div className="digest-compare-row strong">
                    <span className="digest-compare-label">4-week T-bill ladder</span>
                    <span className="digest-compare-value gain">5.28%</span>
                    <span className="digest-compare-amt">+$240 / yr</span>
                  </div>
                </div>
                <p className="digest-insight-prose">
                  Auto-laddering the excess above your $15k buying-power floor changes nothing about
                  liquidity — same T+1 access, just a higher coupon.
                </p>
                <div className="digest-insight-actions">
                  <button
                    className="zen-btn zen-btn-primary"
                    onClick={() => openTicket(DIGEST_INSIGHT_TICKETS.cashYield)}
                  >Enable auto-ladder</button>
                  <button className="zen-btn zen-btn-ghost">See projection</button>
                  <button
                    className="digest-insight-snooze"
                    onClick={() => {
                      const t = window.TicketStore.openOrCreate(DIGEST_INSIGHT_TICKETS.cashYield);
                      window.TicketStore.setStatus(t.id, 'dismissed', { note: 'Dismissed from digest' });
                    }}
                  >Not now</button>
                </div>
              </div>
            </li>

            <li className="digest-insight" data-tone="note">
              <div className="digest-insight-rail" aria-hidden="true" />
              <div className="digest-insight-body">
                <div className="digest-insight-meta">
                  <span className="digest-insight-tone">
                    <span className="digest-insight-dot" />
                    Worth noting
                  </span>
                  <span className="digest-insight-cat">Calendar · next 7 days</span>
                </div>
                <h3 className="digest-insight-title">
                  Two scheduled events before next digest. No action expected.
                </h3>
                <ul className="digest-events">
                  <li>
                    <span className="digest-event-day">Tue</span>
                    <span className="digest-event-time">08:30 ET</span>
                    <span className="digest-event-name">CPI · April</span>
                    <span className="digest-event-impact">±0.4% typical move</span>
                  </li>
                  <li>
                    <span className="digest-event-day">Wed</span>
                    <span className="digest-event-time">After close</span>
                    <span className="digest-event-name">MSFT earnings <em>· 8.2% of book</em></span>
                    <span className="digest-event-impact">Within volatility budget</span>
                  </li>
                </ul>
                <div className="digest-insight-actions">
                  <button
                    className="zen-btn zen-btn-ghost"
                    onClick={() => openTicket(DIGEST_INSIGHT_TICKETS.events)}
                  >Add to calendar</button>
                  <button className="digest-insight-snooze">Don't show events</button>
                </div>
              </div>
            </li>
          </ol>
        </section>

        {/* Holdings movement */}
        <section className="digest-block digest-block-wide">
          <div className="digest-block-eyebrow">Holdings · week change</div>
          <table className="digest-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Weight</th>
                <th>Δ vs. last week</th>
                <th>Week return</th>
                <th>Contribution</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>NVDA</td><td>14.1%</td><td className="num pos">+0.4 pp</td><td className="num pos">+4.6%</td><td className="num pos">+$1,920</td><td>Blackwell roadmap update</td></tr>
              <tr><td>MSFT</td><td>8.2%</td><td className="num">+0.1 pp</td><td className="num pos">+1.9%</td><td className="num pos">+$640</td><td>Earnings Wed</td></tr>
              <tr><td>AVGO</td><td>7.4%</td><td className="num pos">+0.2 pp</td><td className="num pos">+2.8%</td><td className="num pos">+$580</td><td>—</td></tr>
              <tr><td>JNJ</td><td>5.1%</td><td className="num">−0.1 pp</td><td className="num">+0.3%</td><td className="num pos">+$214</td><td>Dividend $1.19</td></tr>
              <tr><td>VTI</td><td>22.0%</td><td className="num">0.0 pp</td><td className="num pos">+1.2%</td><td className="num pos">+$1,108</td><td>Core, no change</td></tr>
              <tr><td>TLT</td><td>9.8%</td><td className="num">−0.1 pp</td><td className="num neg">−0.4%</td><td className="num neg">−$160</td><td>Long-rate drift</td></tr>
              <tr><td>MRNA</td><td>0.7%</td><td className="num">−0.0 pp</td><td className="num neg">−2.1%</td><td className="num neg">−$184</td><td>Pipeline downgrade</td></tr>
            </tbody>
          </table>
          <div className="digest-table-foot">
            7 of 24 holdings shown · sorted by absolute contribution ·
            <button className="digest-link" onClick={() => window.AppStore.setPage('portfolio')}> see full portfolio →</button>
          </div>
        </section>
      </div>

      <footer className="digest-foot">
        <div>
          <div className="digest-foot-label">Next digest</div>
          <div className="digest-foot-value">Sunday, May 11 · 6:00 PM ET</div>
        </div>
        <div className="digest-foot-spacer" />
        <button className="zen-btn zen-btn-ghost" onClick={() => window.AppStore.setPage('settings')}>Digest settings</button>
        <button className="zen-btn zen-btn-secondary">Email me a copy</button>
      </footer>
    </div>
  );
};

window.WeeklyDigestPage = WeeklyDigestPage;
