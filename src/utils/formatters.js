// Number formatters for trading UI
(() => {
  const fmtPrice = (n, decimals = 2) =>
    n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const fmtPct = (n, decimals = 2) => {
    if (n == null) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(decimals)}%`;
  };

  const fmtChange = (n, decimals = 2) => {
    if (n == null) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(decimals)}`;
  };

  const fmtCompact = (n) => {
    if (n == null) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  };

  const fmtMoney = (n) => '$' + fmtPrice(n);

  const fmtTime = (d) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (d) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fmtRelative = (mins) => {
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / (60 * 24))}d ago`;
  };

  window.FmtUtils = { fmtPrice, fmtPct, fmtChange, fmtCompact, fmtMoney, fmtTime, fmtDate, fmtRelative };
})();
