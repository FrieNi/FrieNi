// Chart components — Sparkline, AreaChart, Candlestick, Heatmap
const { useState, useMemo, useRef, useEffect } = React;

const Sparkline = ({ data, width = 80, height = 28, color, fill = false }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const positive = data[data.length - 1] >= data[0];
  const stroke = color || (positive ? 'var(--gain)' : 'var(--loss)');
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M0,${height} L${points.replace(/ /g, ' L')} L${width},${height} Z`.replace('L,', 'L');
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ height }}>
      {fill && <path d={`M${points.split(' ').join(' L')} L${width},${height} L0,${height} Z`} fill={stroke} opacity="0.15" />}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const AreaChart = ({ data, height = 280, color = 'var(--brand)', showGrid = true, showAxis = true, padding = { top: 16, right: 8, bottom: 22, left: 44 } }) => {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const width = 800; // viewBox; SVG scales
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const stats = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { min, max, range: max - min || 1 };
  }, [data]);

  const points = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - ((v - stats.min) / stats.range) * innerH;
    return { x, y, v, i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = stats.max - (i / yTicks) * stats.range;
    const y = padding.top + (i / yTicks) * innerH;
    return { v, y };
  });

  const xTicks = 6;
  const xLabels = Array.from({ length: xTicks }, (_, i) => {
    const idx = Math.floor((i / (xTicks - 1)) * (data.length - 1));
    return { idx, x: padding.left + (idx / (data.length - 1)) * innerW };
  });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((x - padding.left) / innerW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) setHover({ idx, ...points[idx] });
  };

  return (
    <div className="chart-container" style={{ height }}>
      <svg ref={ref} className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
           onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        {showGrid && yLabels.map((t, i) => (
          <line key={i} x1={padding.left} x2={width - padding.right} y1={t.y} y2={t.y} className="chart-grid" />
        ))}
        {showAxis && yLabels.map((t, i) => (
          <text key={i} x={padding.left - 8} y={t.y + 3} className="chart-axis-label" textAnchor="end">
            {t.v >= 1000 ? t.v.toFixed(0) : t.v.toFixed(2)}
          </text>
        ))}
        {showAxis && xLabels.map((t, i) => (
          <text key={i} x={t.x} y={height - 6} className="chart-axis-label" textAnchor="middle">
            {String(t.idx)}
          </text>
        ))}

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} className="chart-line" stroke={color} />

        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={padding.top} y2={padding.top + innerH} stroke="var(--ink-3)" strokeDasharray="2 3" strokeWidth="1" />
            <circle cx={hover.x} cy={hover.y} r="4" fill="var(--bg-elevated)" stroke={color} strokeWidth="1.8" />
          </>
        )}
      </svg>
      {hover && (
        <div className="chart-tooltip" style={{ left: `${(hover.x / width) * 100}%`, top: `${(hover.y / height) * 100}%` }}>
          {hover.v.toFixed(2)}
        </div>
      )}
    </div>
  );
};

const Candlestick = ({ data, height = 320, showVolume = true }) => {
  const width = 800;
  const padding = { top: 12, right: 8, bottom: 60, left: 48 };
  const volH = showVolume ? 50 : 0;
  const innerH = height - padding.top - padding.bottom - volH;
  const innerW = width - padding.left - padding.right;
  const max = Math.max(...data.map(d => d.high));
  const min = Math.min(...data.map(d => d.low));
  const range = max - min || 1;
  const maxVol = Math.max(...data.map(d => d.vol));
  const w = innerW / data.length * 0.7;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ height }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = padding.top + p * innerH;
        const v = max - p * range;
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid" />
            <text x={padding.left - 8} y={y + 3} className="chart-axis-label" textAnchor="end">{v.toFixed(2)}</text>
          </g>
        );
      })}
      {data.map((c, i) => {
        const x = padding.left + (i / data.length) * innerW + (innerW / data.length - w) / 2;
        const cx = x + w / 2;
        const yHigh = padding.top + ((max - c.high) / range) * innerH;
        const yLow = padding.top + ((max - c.low) / range) * innerH;
        const yOpen = padding.top + ((max - c.open) / range) * innerH;
        const yClose = padding.top + ((max - c.close) / range) * innerH;
        const up = c.close >= c.open;
        const color = up ? 'var(--gain)' : 'var(--loss)';
        const yTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(1, Math.abs(yClose - yOpen));
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth="1" />
            <rect x={x} y={yTop} width={w} height={bodyH} fill={up ? color : color} opacity={up ? 1 : 1} />
            {showVolume && (
              <rect className="vol-bar" x={x} y={height - padding.bottom - (c.vol / maxVol) * volH} width={w}
                    height={(c.vol / maxVol) * volH} fill={color} />
            )}
          </g>
        );
      })}
      {showVolume && (
        <text x={padding.left - 8} y={height - padding.bottom + 12} className="chart-axis-label" textAnchor="end">VOL</text>
      )}
    </svg>
  );
};

const Heatmap = ({ items }) => {
  const colorFor = (pct) => {
    const a = Math.min(Math.abs(pct) / 4, 1);
    if (pct >= 0) return `rgba(79, 122, 63, ${0.15 + a * 0.7})`;
    return `rgba(176, 74, 58, ${0.15 + a * 0.7})`;
  };
  return (
    <div className="heatmap">
      {items.map((it, i) => (
        <div key={i} className="heatmap-cell" style={{ background: colorFor(it.pct), color: Math.abs(it.pct) > 1.5 ? '#fff8ed' : 'var(--ink-1)' }}>
          <div className="heatmap-sym">{it.symbol}</div>
          <div className="heatmap-pct">{it.pct >= 0 ? '+' : ''}{it.pct.toFixed(2)}%</div>
        </div>
      ))}
    </div>
  );
};

const Donut = ({ segments, size = 140, thickness = 22, label }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-inset)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const off = c - acc;
          acc += len;
          return (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color}
                    strokeWidth={thickness} strokeDasharray={`${len} ${c}`} strokeDashoffset={off}
                    transform={`rotate(-90 ${size/2} ${size/2})`} />
          );
        })}
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {label}
        </div>
      )}
    </div>
  );
};

const BarChart = ({ data, height = 140, color = 'var(--brand)' }) => {
  const max = Math.max(...data.map(d => Math.abs(d.value)));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '8px 0' }}>
      {data.map((d, i) => {
        const positive = d.value >= 0;
        const h = (Math.abs(d.value) / max) * (height - 30);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ height: h, width: '100%', background: positive ? 'var(--gain)' : 'var(--loss)', borderRadius: '3px 3px 0 0', opacity: 0.85 }}></div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

window.Sparkline = Sparkline;
window.AreaChart = AreaChart;
window.Candlestick = Candlestick;
window.Heatmap = Heatmap;
window.Donut = Donut;
window.BarChart = BarChart;
