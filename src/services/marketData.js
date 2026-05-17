// Mock market data service — generates deterministic data for the prototype
const seedRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const generateSeries = (seed, points, start, vol = 0.02, trend = 0) => {
  const rand = seedRandom(seed);
  const arr = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    v = v * (1 + (rand() - 0.5) * vol + trend);
    arr.push(v);
  }
  return arr;
};

const STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 1284.50, change: 32.18, pct: 2.57, mcap: 3.16e12, sector: 'Semiconductors', seed: 7, trend: 0.002 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 218.74, change: -1.42, pct: -0.64, mcap: 3.32e12, sector: 'Consumer Tech', seed: 12, trend: 0.0001 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 442.33, change: 4.21, pct: 0.96, mcap: 3.28e12, sector: 'Software', seed: 21, trend: 0.0008 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 254.18, change: -8.32, pct: -3.17, mcap: 8.1e11, sector: 'Auto / EV', seed: 33, trend: -0.0015 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.92, change: 2.04, pct: 1.15, mcap: 2.21e12, sector: 'Internet', seed: 44, trend: 0.0006 },
  { symbol: 'META', name: 'Meta Platforms', price: 568.21, change: 7.83, pct: 1.40, mcap: 1.45e12, sector: 'Internet', seed: 55, trend: 0.0010 },
  { symbol: 'AMZN', name: 'Amazon.com', price: 198.43, change: 1.21, pct: 0.61, mcap: 2.07e12, sector: 'E-commerce', seed: 67, trend: 0.0004 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 218.41, change: 0.32, pct: 0.15, mcap: 6.2e11, sector: 'Banking', seed: 78, trend: 0.0002 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 478.22, change: 1.84, pct: 0.39, mcap: 1.03e12, sector: 'Conglomerate', seed: 89, trend: 0.0003 },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 118.94, change: -0.84, pct: -0.70, mcap: 4.7e11, sector: 'Energy', seed: 91, trend: -0.0002 },
];

const PORTFOLIO = [
  { symbol: 'NVDA', shares: 42, avgCost: 612.40 },
  { symbol: 'AAPL', shares: 180, avgCost: 165.20 },
  { symbol: 'MSFT', shares: 65, avgCost: 380.10 },
  { symbol: 'GOOGL', shares: 90, avgCost: 142.30 },
  { symbol: 'BRK.B', shares: 28, avgCost: 412.80 },
  { symbol: 'TSLA', shares: 35, avgCost: 281.50 },
];

// Coverage breakdown for each story — anonymized "tier + lean + factuality"
// rather than naming a single outlet, so the feed reads as aggregate signal.
// lean: -2 left, -1 center-left, 0 center, 1 center-right, 2 right
// tier: 1 = newswire/primary, 2 = major, 3 = trade/blog
// factuality: 0–100 (mix media-bias-style score)
const NEWS = [
  { id: 1, headline: 'NVIDIA unveils Rubin architecture, claims 4× inference throughput on next-gen accelerators',
    tickers: ['NVDA', 'AMD'], sentiment: 'bullish', mins: 12, category: 'Earnings',
    framing: 'Most outlets lead on throughput claims; trade press emphasizes power-draw caveats.',
    coverage: [
      { lean: 0, tier: 1, fact: 96, frames: 'Rubin claims 4× inference, 30kW per rack', count: 4 },
      { lean: -1, tier: 2, fact: 88, frames: 'NVIDIA tightens grip on accelerator market', count: 6 },
      { lean: 1, tier: 2, fact: 86, frames: 'Capex bonanza extends; Rubin ships H1 ’27', count: 5 },
      { lean: 0, tier: 3, fact: 78, frames: 'Hands-on: Rubin tape-out details leaked', count: 8 },
    ] },
  { id: 2, headline: 'Fed minutes signal patience on rate cuts as services inflation remains sticky',
    tickers: ['SPY', 'TLT'], sentiment: 'neutral', mins: 38, category: 'Macro',
    framing: 'Centrist coverage reads as hawkish; left-leaning outlets emphasize labor risk.',
    coverage: [
      { lean: 0, tier: 1, fact: 97, frames: 'FOMC patient; September cut on the table', count: 3 },
      { lean: -2, tier: 2, fact: 82, frames: 'Powell risks job market for inflation theatre', count: 4 },
      { lean: -1, tier: 2, fact: 89, frames: 'Services CPI keeps Fed on hold', count: 7 },
      { lean: 1, tier: 2, fact: 87, frames: 'Markets hawkish-tilt: cuts pushed to Q4', count: 6 },
      { lean: 2, tier: 3, fact: 71, frames: 'Powell finally admits inflation is sticky', count: 3 },
    ] },
  { id: 3, headline: 'Tesla Q1 deliveries miss estimates by 6%, China demand softens',
    tickers: ['TSLA'], sentiment: 'bearish', mins: 64, category: 'Earnings',
    framing: 'Bearish across spectrum; left-leaning frames focus on labor and EV credits.',
    coverage: [
      { lean: 0, tier: 1, fact: 96, frames: 'Deliveries 386.8k vs 411k consensus', count: 5 },
      { lean: -1, tier: 2, fact: 88, frames: 'BYD eats Tesla’s lunch in mainland China', count: 7 },
      { lean: 1, tier: 2, fact: 86, frames: 'Demand wall hits; margin guide at risk', count: 6 },
      { lean: 2, tier: 3, fact: 72, frames: 'Musk distractions blamed for shortfall', count: 4 },
    ] },
  { id: 4, headline: 'Apple Vision Pro 2 expected in late 2026, new manufacturing partner secured',
    tickers: ['AAPL'], sentiment: 'bullish', mins: 92, category: 'Product',
    framing: 'Trade press leads, mainstream lags by ~6 hours.',
    coverage: [
      { lean: 0, tier: 3, fact: 84, frames: 'Sources: Luxshare wins assembly, Sept ’26 launch', count: 5 },
      { lean: -1, tier: 2, fact: 87, frames: 'Apple resets headset bet at lower price', count: 4 },
      { lean: 1, tier: 2, fact: 85, frames: 'Apple chases mass-market AR with VP2', count: 3 },
    ] },
  { id: 5, headline: 'JPMorgan raises year-end S&P target to 6,400 citing AI capex tailwind',
    tickers: ['JPM', 'SPY'], sentiment: 'bullish', mins: 124, category: 'Analyst',
    framing: 'Even-spread coverage; left-leaning outlets question concentration risk.',
    coverage: [
      { lean: 0, tier: 1, fact: 96, frames: 'Kolanovic note: AI capex sustains EPS upside', count: 3 },
      { lean: -1, tier: 2, fact: 87, frames: 'Wall Street raises target — top 7 driving 60% of gains', count: 5 },
      { lean: 1, tier: 2, fact: 88, frames: 'Bull case: melt-up to 6,400 by year-end', count: 6 },
    ] },
  { id: 6, headline: 'Meta begins testing Ray-Ban with always-on display in five US cities',
    tickers: ['META'], sentiment: 'neutral', mins: 188, category: 'Product',
    framing: 'Privacy framing dominates left-leaning coverage; trade press product-focused.',
    coverage: [
      { lean: -2, tier: 2, fact: 79, frames: 'Always-on cameras spark new privacy fight', count: 4 },
      { lean: -1, tier: 2, fact: 87, frames: 'Meta inches toward AR glasses milestone', count: 3 },
      { lean: 0, tier: 3, fact: 83, frames: 'Hands-on: HUD is sharp, battery still 4hr', count: 6 },
    ] },
  { id: 7, headline: 'Oil drops 2.4% on surprise crude build, OPEC+ holds production cuts',
    tickers: ['XOM', 'CVX'], sentiment: 'bearish', mins: 244, category: 'Commodities',
    framing: 'Commodity desks neutral; right-leaning frames blame demand softness on policy.',
    coverage: [
      { lean: 0, tier: 1, fact: 97, frames: 'EIA: +5.4M bbl build vs –1.2M expected', count: 4 },
      { lean: -1, tier: 2, fact: 88, frames: 'Crude slides as glut fears resurface', count: 3 },
      { lean: 1, tier: 2, fact: 86, frames: 'OPEC+ defends cuts as US demand wobbles', count: 4 },
      { lean: 2, tier: 3, fact: 72, frames: 'Energy policy weighing on industrial demand', count: 2 },
    ] },
  { id: 8, headline: 'Microsoft and CoreWeave extend cloud GPU partnership through 2030',
    tickers: ['MSFT'], sentiment: 'bullish', mins: 312, category: 'Deal',
    framing: 'Single-source story; coverage thin until newswire confirms.',
    coverage: [
      { lean: 0, tier: 1, fact: 96, frames: 'Five-year extension, undisclosed terms', count: 2 },
      { lean: 1, tier: 3, fact: 80, frames: 'Neocloud bet pays off for CoreWeave', count: 4 },
    ] },
];

const INDICES = [
  { symbol: 'SPX', name: 'S&P 500', value: 5742.18, change: 18.42, pct: 0.32 },
  { symbol: 'NDX', name: 'Nasdaq 100', value: 20184.32, change: 142.18, pct: 0.71 },
  { symbol: 'DJI', name: 'Dow Jones', value: 42218.40, change: -42.12, pct: -0.10 },
  { symbol: 'RUT', name: 'Russell 2000', value: 2218.32, change: 8.21, pct: 0.37 },
  { symbol: 'VIX', name: 'Volatility', value: 14.82, change: -0.42, pct: -2.76 },
  { symbol: 'DXY', name: 'Dollar Index', value: 102.84, change: 0.18, pct: 0.18 },
];

const CHAT_SUGGESTIONS = [
  { id: 1, type: 'buy', symbol: 'PLTR', confidence: 78, thesis: 'Government contract pipeline accelerating, FedRAMP High momentum.', target: 32.40, current: 27.18 },
  { id: 2, type: 'reduce', symbol: 'TSLA', confidence: 64, thesis: 'Delivery growth decelerating, multiple compression risk into Q3.', target: 220.00, current: 254.18 },
  { id: 3, type: 'watch', symbol: 'ASML', confidence: 71, thesis: 'EUV order book firming. Wait for pullback to 880 support.', target: 880.00, current: 924.50 },
];

window.MarketData = {
  stocks: STOCKS,
  portfolio: PORTFOLIO,
  news: NEWS,
  indices: INDICES,
  chatSuggestions: CHAT_SUGGESTIONS,
  getStock: (sym) => STOCKS.find(s => s.symbol === sym),
  getSeries: (seed, points, start, vol, trend) => generateSeries(seed, points, start, vol, trend),
  getCandles: (seed, count, start) => {
    const rand = seedRandom(seed);
    const arr = [];
    let prev = start;
    for (let i = 0; i < count; i++) {
      const open = prev;
      const close = open * (1 + (rand() - 0.48) * 0.025);
      const high = Math.max(open, close) * (1 + rand() * 0.01);
      const low = Math.min(open, close) * (1 - rand() * 0.01);
      arr.push({ open, close, high, low, vol: rand() * 1e7 + 5e6 });
      prev = close;
    }
    return arr;
  },
};
