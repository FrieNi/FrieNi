// Badge + Delta (price change) components
const Badge = ({ variant = 'neutral', dot, children }) => (
  <span className={`badge badge-${variant} ${dot ? 'badge-dot' : ''}`}>{children}</span>
);

const Delta = ({ value, pct, prefix = '', size }) => {
  const positive = value >= 0;
  const cls = positive ? 'delta-gain' : 'delta-loss';
  const arrow = positive ? '▲' : '▼';
  return (
    <span className={`delta ${cls}`} style={{ fontSize: size }}>
      <span className="delta-arrow">{arrow}</span>
      <span className="mono">{prefix}{positive ? '+' : ''}{pct != null ? pct.toFixed(2) + '%' : value.toFixed(2)}</span>
    </span>
  );
};

window.Badge = Badge;
window.Delta = Delta;
