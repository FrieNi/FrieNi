// FrieNi — fake portfolio data
// 12 fictional tickers across IT, AI, and Energy

const ICONS = {
  IT: 'oklch(0.55 0.18 275)',
  AI: 'oklch(0.55 0.18 320)',
  Energy: 'oklch(0.65 0.16 90)',
};

const STOCKS = [
  // ===== IT =====
  {
    id: 'lmnx', ticker: 'LMNX', name: 'Luminex Systems', sector: 'IT', sub: 'Enterprise Cloud',
    price: 184.22, change: 1.82, changePct: 0.99, dayLow: 181.05, dayHigh: 185.40,
    qty: 124, avg: 156.10, mv: 22843, pl: 3499.88, plPct: 18.07, weightHint: 12.4,
    scores: { overall: 78, fundamental: 82, technical: 71, sentiment: 80 },
    risk: 'medium', recommendation: 'hold',
    metrics: {
      pe: 24.3, pb: 4.1, ps: 5.8, peg: 1.6, evEbitda: 18.2,
      revGrowth: 22.4, epsGrowth: 31.0, opMargin: 24.1, netMargin: 18.6, fcfMargin: 21.0,
      roe: 22.1, roic: 18.4, debtEquity: 0.32, currentRatio: 2.1, beta: 1.12,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 58, macd: 'bullish', sma50: 178.4, sma200: 162.1, support: 174, resistance: 192 },
  },
  {
    id: 'vrtl', ticker: 'VRTL', name: 'Veritel Cloud', sector: 'IT', sub: 'Cybersecurity',
    price: 92.61, change: -0.74, changePct: -0.79, dayLow: 91.80, dayHigh: 94.05,
    qty: 188, avg: 74.50, mv: 17410, pl: 3403.68, plPct: 24.31, weightHint: 9.5,
    scores: { overall: 81, fundamental: 78, technical: 84, sentiment: 81 },
    risk: 'medium', recommendation: 'buy',
    metrics: {
      pe: 31.2, pb: 6.2, ps: 8.4, peg: 1.4, evEbitda: 22.1,
      revGrowth: 28.6, epsGrowth: 42.0, opMargin: 19.4, netMargin: 14.2, fcfMargin: 24.0,
      roe: 18.0, roic: 16.2, debtEquity: 0.18, currentRatio: 2.6, beta: 1.28,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 62, macd: 'bullish', sma50: 88.2, sma200: 80.4, support: 86, resistance: 96 },
  },
  {
    id: 'nxsy', ticker: 'NXSY', name: 'Nexsy Compute', sector: 'IT', sub: 'Semiconductors',
    price: 41.07, change: -0.92, changePct: -2.19, dayLow: 40.62, dayHigh: 42.50,
    qty: 240, avg: 43.10, mv: 9857, pl: -487.20, plPct: -4.71, weightHint: 5.3,
    scores: { overall: 52, fundamental: 60, technical: 41, sentiment: 56 },
    risk: 'high', recommendation: 'watch',
    metrics: {
      pe: 18.4, pb: 2.6, ps: 3.1, peg: 2.4, evEbitda: 11.4,
      revGrowth: 4.2, epsGrowth: -8.0, opMargin: 16.2, netMargin: 11.0, fcfMargin: 12.8,
      roe: 12.4, roic: 9.6, debtEquity: 0.42, currentRatio: 1.4, beta: 1.45,
      divYield: 1.2, payout: 22,
    },
    technical: { rsi: 38, macd: 'bearish', sma50: 43.6, sma200: 45.2, support: 39, resistance: 45 },
  },
  {
    id: 'oryx', ticker: 'ORYX', name: 'Oryx Software', sector: 'IT', sub: 'Dev Tools',
    price: 118.40, change: 2.21, changePct: 1.90, dayLow: 116.05, dayHigh: 119.80,
    qty: 96, avg: 109.85, mv: 11366, pl: 820.20, plPct: 7.78, weightHint: 6.1,
    scores: { overall: 72, fundamental: 75, technical: 68, sentiment: 73 },
    risk: 'medium', recommendation: 'hold',
    metrics: {
      pe: 28.1, pb: 5.1, ps: 6.4, peg: 1.8, evEbitda: 19.6,
      revGrowth: 18.4, epsGrowth: 22.0, opMargin: 22.2, netMargin: 17.4, fcfMargin: 19.6,
      roe: 19.4, roic: 16.0, debtEquity: 0.24, currentRatio: 2.3, beta: 1.08,
      divYield: 0.4, payout: 12,
    },
    technical: { rsi: 56, macd: 'neutral', sma50: 115.4, sma200: 108.6, support: 112, resistance: 124 },
  },

  // ===== AI =====
  {
    id: 'nrla', ticker: 'NRLA', name: 'Neurala Labs', sector: 'AI', sub: 'Foundation Models',
    price: 412.55, change: 8.42, changePct: 2.08, dayLow: 405.10, dayHigh: 416.40,
    qty: 38, avg: 291.40, mv: 15677, pl: 4604.30, plPct: 41.58, weightHint: 14.2,
    scores: { overall: 85, fundamental: 79, technical: 88, sentiment: 92 },
    risk: 'high', recommendation: 'buy',
    metrics: {
      pe: 62.4, pb: 14.1, ps: 22.4, peg: 1.9, evEbitda: 48.1,
      revGrowth: 86.4, epsGrowth: 124.0, opMargin: 28.4, netMargin: 22.0, fcfMargin: 26.1,
      roe: 31.4, roic: 24.8, debtEquity: 0.12, currentRatio: 3.4, beta: 1.62,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 72, macd: 'bullish', sma50: 388.4, sma200: 322.6, support: 392, resistance: 432 },
  },
  {
    id: 'cgnt', ticker: 'CGNT', name: 'Cogent AI', sector: 'AI', sub: 'Inference Infra',
    price: 67.84, change: 1.21, changePct: 1.82, dayLow: 66.40, dayHigh: 68.20,
    qty: 220, avg: 52.90, mv: 14925, pl: 3286.80, plPct: 28.24, weightHint: 9.8,
    scores: { overall: 79, fundamental: 74, technical: 82, sentiment: 84 },
    risk: 'high', recommendation: 'buy',
    metrics: {
      pe: 48.6, pb: 8.4, ps: 14.1, peg: 1.5, evEbitda: 36.4,
      revGrowth: 64.2, epsGrowth: 92.0, opMargin: 24.1, netMargin: 18.0, fcfMargin: 21.4,
      roe: 24.6, roic: 19.4, debtEquity: 0.21, currentRatio: 2.8, beta: 1.55,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 64, macd: 'bullish', sma50: 64.2, sma200: 56.4, support: 62, resistance: 72 },
  },
  {
    id: 'hvnk', ticker: 'HVNK', name: 'Heuvenik AI', sector: 'AI', sub: 'AI Hardware',
    price: 22.40, change: -1.18, changePct: -5.01, dayLow: 22.10, dayHigh: 23.80,
    qty: 380, avg: 25.48, mv: 8512, pl: -1170.40, plPct: -12.09, weightHint: 4.5,
    scores: { overall: 41, fundamental: 38, technical: 32, sentiment: 52 },
    risk: 'high', recommendation: 'review',
    metrics: {
      pe: 92.4, pb: 4.2, ps: 18.6, peg: 4.2, evEbitda: 64.0,
      revGrowth: 12.4, epsGrowth: -32.0, opMargin: -4.2, netMargin: -8.4, fcfMargin: -2.0,
      roe: -5.2, roic: -3.6, debtEquity: 0.84, currentRatio: 1.1, beta: 2.04,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 28, macd: 'bearish', sma50: 24.6, sma200: 28.2, support: 21, resistance: 26 },
  },
  {
    id: 'phrm', ticker: 'PHRM', name: 'Phrame Robotics', sector: 'AI', sub: 'Physical AI',
    price: 156.20, change: 3.10, changePct: 2.03, dayLow: 153.05, dayHigh: 157.40,
    qty: 84, avg: 135.40, mv: 13121, pl: 1747.20, plPct: 15.36, weightHint: 7.2,
    scores: { overall: 73, fundamental: 68, technical: 76, sentiment: 78 },
    risk: 'high', recommendation: 'hold',
    metrics: {
      pe: 54.2, pb: 9.4, ps: 16.4, peg: 2.2, evEbitda: 42.1,
      revGrowth: 48.2, epsGrowth: 68.0, opMargin: 18.4, netMargin: 12.8, fcfMargin: 14.2,
      roe: 18.6, roic: 14.2, debtEquity: 0.34, currentRatio: 2.2, beta: 1.74,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 61, macd: 'bullish', sma50: 148.4, sma200: 132.6, support: 146, resistance: 168 },
  },

  // ===== Energy =====
  {
    id: 'hlio', ticker: 'HLIO', name: 'Helio Solar', sector: 'Energy', sub: 'Solar',
    price: 38.12, change: 0.42, changePct: 1.11, dayLow: 37.80, dayHigh: 38.60,
    qty: 280, avg: 36.24, mv: 10674, pl: 526.40, plPct: 5.19, weightHint: 9.1,
    scores: { overall: 68, fundamental: 72, technical: 64, sentiment: 67 },
    risk: 'medium', recommendation: 'hold',
    metrics: {
      pe: 16.4, pb: 2.1, ps: 2.4, peg: 1.2, evEbitda: 10.8,
      revGrowth: 14.2, epsGrowth: 18.4, opMargin: 14.2, netMargin: 9.8, fcfMargin: 11.4,
      roe: 14.2, roic: 11.6, debtEquity: 0.46, currentRatio: 1.8, beta: 1.18,
      divYield: 2.1, payout: 34,
    },
    technical: { rsi: 54, macd: 'neutral', sma50: 37.4, sma200: 35.8, support: 36, resistance: 40 },
  },
  {
    id: 'kryn', ticker: 'KRYN', name: 'Kryon Energy', sector: 'Energy', sub: 'Oil & Gas',
    price: 56.20, change: -0.92, changePct: -1.61, dayLow: 55.60, dayHigh: 57.40,
    qty: 142, avg: 61.34, mv: 7980, pl: -730.18, plPct: -8.38, weightHint: 6.8,
    scores: { overall: 48, fundamental: 56, technical: 42, sentiment: 46 },
    risk: 'medium', recommendation: 'watch',
    metrics: {
      pe: 9.4, pb: 1.4, ps: 1.1, peg: 1.8, evEbitda: 6.2,
      revGrowth: -4.2, epsGrowth: -12.0, opMargin: 18.4, netMargin: 12.0, fcfMargin: 14.6,
      roe: 16.4, roic: 12.8, debtEquity: 0.62, currentRatio: 1.3, beta: 0.94,
      divYield: 5.2, payout: 56,
    },
    technical: { rsi: 36, macd: 'bearish', sma50: 58.2, sma200: 60.4, support: 54, resistance: 60 },
  },
  {
    id: 'altx', ticker: 'ALTX', name: 'Althalix Fusion', sector: 'Energy', sub: 'Next-Gen Nuclear',
    price: 24.80, change: 0.81, changePct: 3.38, dayLow: 23.90, dayHigh: 25.10,
    qty: 320, avg: 18.54, mv: 7936, pl: 2003.20, plPct: 33.77, weightHint: 4.2,
    scores: { overall: 70, fundamental: 58, technical: 78, sentiment: 88 },
    risk: 'very-high', recommendation: 'speculative',
    metrics: {
      pe: 0, pb: 8.4, ps: 0, peg: 0, evEbitda: 0,
      revGrowth: 0, epsGrowth: 0, opMargin: -42.0, netMargin: -52.0, fcfMargin: -38.0,
      roe: -28.0, roic: -22.0, debtEquity: 0.28, currentRatio: 4.2, beta: 2.34,
      divYield: 0.0, payout: 0,
    },
    technical: { rsi: 68, macd: 'bullish', sma50: 22.4, sma200: 18.6, support: 22, resistance: 27 },
  },
  {
    id: 'vltc', ticker: 'VLTC', name: 'Voltacore Storage', sector: 'Energy', sub: 'Battery Storage',
    price: 81.40, change: 1.42, changePct: 1.78, dayLow: 80.10, dayHigh: 82.30,
    qty: 110, avg: 72.74, mv: 8954, pl: 952.60, plPct: 11.90, weightHint: 6.7,
    scores: { overall: 74, fundamental: 70, technical: 76, sentiment: 76 },
    risk: 'medium', recommendation: 'buy',
    metrics: {
      pe: 32.4, pb: 4.6, ps: 5.8, peg: 1.6, evEbitda: 21.4,
      revGrowth: 32.4, epsGrowth: 40.0, opMargin: 20.4, netMargin: 14.8, fcfMargin: 17.2,
      roe: 18.4, roic: 14.6, debtEquity: 0.38, currentRatio: 2.1, beta: 1.32,
      divYield: 0.6, payout: 18,
    },
    technical: { rsi: 58, macd: 'bullish', sma50: 78.4, sma200: 70.2, support: 76, resistance: 86 },
  },
];

// ===== Portfolios =====
const PORTFOLIOS = [
  {
    id: 'core',
    name: 'Core',
    desc: 'Long-term holds, balanced',
    color: 'oklch(0.55 0.18 275)',
    risk: 'Moderate',
    holdings: ['lmnx', 'vrtl', 'oryx', 'nrla', 'cgnt', 'hlio', 'vltc'],
    aggressive: false,
    excluded: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    desc: 'Higher-beta tech & AI plays',
    color: 'oklch(0.55 0.18 320)',
    risk: 'Aggressive',
    holdings: ['nxsy', 'phrm'],
    aggressive: true,
    excluded: false,
  },
  {
    id: 'yolo',
    name: 'YOLO',
    desc: 'Speculative, excluded from aggregate',
    color: 'oklch(0.65 0.18 25)',
    risk: 'Very High',
    holdings: ['hvnk', 'altx', 'kryn'],
    aggressive: true,
    excluded: true,
  },
];

// ===== Strategies =====
const STRATEGIES = [
  {
    id: 'momo',
    name: 'Momentum Rider',
    desc: 'Buy strength, sell weakness',
    active: true,
    rules: {
      buy: [
        { metric: 'RSI', op: '>', value: 55 },
        { metric: 'Price vs 50-day SMA', op: '>', value: 2 },
        { metric: 'Sentiment score', op: '>', value: 70 },
      ],
      sell: [
        { metric: 'RSI', op: '<', value: 35 },
        { metric: 'Price vs 50-day SMA', op: '<', value: -3 },
      ],
    },
    weights: { fundamental: 25, technical: 50, sentiment: 25 },
  },
  {
    id: 'value',
    name: 'Value Compounder',
    desc: 'Quality at reasonable prices',
    active: false,
    rules: {
      buy: [
        { metric: 'P/E', op: '<', value: 22 },
        { metric: 'ROIC', op: '>', value: 15 },
        { metric: 'Debt/Equity', op: '<', value: 0.5 },
        { metric: 'Revenue Growth', op: '>', value: 8 },
      ],
      sell: [
        { metric: 'Fundamental score', op: '<', value: 55 },
      ],
    },
    weights: { fundamental: 70, technical: 10, sentiment: 20 },
  },
  {
    id: 'contra',
    name: 'Contrarian Sentiment',
    desc: 'Buy quality in beaten-up names',
    active: false,
    rules: {
      buy: [
        { metric: 'RSI', op: '<', value: 35 },
        { metric: 'Fundamental score', op: '>', value: 65 },
        { metric: 'Sentiment score', op: '<', value: 40 },
      ],
      sell: [
        { metric: 'RSI', op: '>', value: 70 },
        { metric: 'Sentiment score', op: '>', value: 80 },
      ],
    },
    weights: { fundamental: 50, technical: 30, sentiment: 20 },
  },
];

// ===== News / sentiment ======
const NEWS_TEMPLATES = {
  good: [
    { src: 'Hedgewire', platform: 'news', title: '{name} crushes Q3 revenue, raises full-year guidance', body: 'Analysts on the call called the operating margin expansion "structural", citing pricing power and reduced churn across enterprise tier.', meta: '4h ago · 12k reads', tone: 'good' },
    { src: 'Linotype Daily', platform: 'news', title: 'Why {name} is the most-shorted name being squeezed this quarter', body: 'Short interest dropped 38% over the last two weeks as institutional flows turned net buyers, per CFTC filings.', meta: '1d ago · 8.4k reads', tone: 'good' },
    { src: '@kirstenmacro', platform: 'social', title: 'Just dug into {ticker}\'s 10-Q. Cash conversion went from 0.7x to 1.1x in 12 months. This is the boring tell.', body: '', meta: '6h ago · 2.1k likes', tone: 'good' },
    { src: 'r/investing', platform: 'reddit', title: '{ticker} margin expansion is being slept on', body: 'Operating leverage finally kicking in now that R&D as % of revenue is leveling off. Free cash flow guide implies $4.20 EPS by FY26.', meta: '2d ago · 384 comments', tone: 'good' },
    { src: 'Quiet Capital (YouTube)', platform: 'youtube', title: 'I bought more {ticker} this week — here\'s the thesis update', body: '14:32 · Reviews segment-level revenue from the latest filing and walks through why the bull case strengthens.', meta: '12h ago · 41k views', tone: 'good' },
  ],
  bad: [
    { src: 'Hedgewire', platform: 'news', title: '{name} misses on EPS, guides Q4 below consensus', body: 'Management cited "softer enterprise renewal cycles" and a delayed AI infrastructure rollout pushing back monetization.', meta: '6h ago · 18k reads', tone: 'bad' },
    { src: 'Linotype Daily', platform: 'news', title: 'Insiders sell $42M in {ticker} as stock approaches 52-week high', body: 'CFO and two VPs filed Form 4s in the past week. Analysts split on whether this is routine compensation or directional.', meta: '2d ago · 6.2k reads', tone: 'bad' },
    { src: '@bear.thesis', platform: 'social', title: '{ticker} dilution math: 4.8% annual SBC + new convertible = look at fully diluted FCF/share, not GAAP.', body: '', meta: '1d ago · 980 likes', tone: 'bad' },
    { src: 'r/stocks', platform: 'reddit', title: 'Anyone else worried about {ticker}\'s working capital?', body: 'Days sales outstanding ballooned from 52 to 81. Either they\'re channel-stuffing or their customers can\'t pay.', meta: '3d ago · 612 comments', tone: 'bad' },
    { src: 'Skeptic Lens (YouTube)', platform: 'youtube', title: 'Why I sold all my {ticker} — three flags I can\'t ignore', body: '18:11 · Covers receivables, customer concentration, and TAM math that doesn\'t pencil out.', meta: '1d ago · 86k views', tone: 'bad' },
  ],
  neutral: [
    { src: 'Hedgewire', platform: 'news', title: '{name} announces new partnership with mid-tier reseller channel', body: 'Reseller agreement expands distribution but management declined to quantify near-term revenue contribution.', meta: '8h ago · 3.4k reads', tone: 'neutral' },
    { src: '@chartcraft', platform: 'social', title: '{ticker} consolidating around the 200-day. Either side of $X is the trade.', body: '', meta: '11h ago · 540 likes', tone: 'neutral' },
    { src: 'r/investing', platform: 'reddit', title: 'Long-term hold question for {ticker}', body: 'Anyone holding through the next earnings? Curious about positioning across the next six months.', meta: '4d ago · 124 comments', tone: 'neutral' },
  ],
};

function buildNews(stock) {
  const out = [];
  const sentScore = stock.scores.sentiment;
  const goodN = sentScore > 70 ? 4 : sentScore > 50 ? 2 : 1;
  const badN = sentScore < 50 ? 4 : sentScore < 70 ? 2 : 1;
  const neuN = 2;
  for (let i = 0; i < goodN && i < NEWS_TEMPLATES.good.length; i++) {
    out.push(fill(NEWS_TEMPLATES.good[i], stock));
  }
  for (let i = 0; i < badN && i < NEWS_TEMPLATES.bad.length; i++) {
    out.push(fill(NEWS_TEMPLATES.bad[i], stock));
  }
  for (let i = 0; i < neuN && i < NEWS_TEMPLATES.neutral.length; i++) {
    out.push(fill(NEWS_TEMPLATES.neutral[i], stock));
  }
  // shuffle stable-ish based on ticker
  return out.sort((a, b) => (a.tone + a.title).localeCompare(b.tone + b.title));
}
function fill(t, s) {
  return {
    ...t,
    title: t.title.replaceAll('{name}', s.name).replaceAll('{ticker}', s.ticker),
    body: t.body.replaceAll('{name}', s.name).replaceAll('{ticker}', s.ticker),
  };
}

// ===== Price history series (synthetic) =====
function makeSeries(stock, points = 90, vol = 0.025) {
  const start = stock.price * 0.78;
  const end = stock.price;
  const arr = [];
  // deterministic pseudo-random based on ticker
  let seed = 0;
  for (let i = 0; i < stock.ticker.length; i++) seed += stock.ticker.charCodeAt(i);
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  let cur = start;
  for (let i = 0; i < points; i++) {
    const drift = (end - start) / points;
    const noise = (rand() - 0.5) * cur * vol;
    cur += drift + noise;
    arr.push(cur);
  }
  // ensure last is the actual price
  arr[arr.length - 1] = stock.price;
  return arr;
}

function scoreColor(score) {
  if (score >= 70) return 'good';
  if (score >= 50) return 'ok';
  return 'bad';
}

function scoreLabel(score) {
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Mixed';
  if (score >= 35) return 'Weak';
  return 'Poor';
}

window.FrieNi = {
  STOCKS, PORTFOLIOS, STRATEGIES,
  buildNews, makeSeries, scoreColor, scoreLabel, ICONS,
  byId: (id) => STOCKS.find(s => s.id === id),
};
