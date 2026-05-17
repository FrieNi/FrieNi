// Charts: sparkline + line chart + bar chart (canvas-based)
// Reads CSS vars for colors

function readVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v ? v.trim() : fallback;
}

function Sparkline({ data, w = 80, h = 26, positive }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c || !data?.length) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;
    const sx = (w - pad * 2) / (data.length - 1);
    const sy = (h - pad * 2) / range;
    const isPos = positive ?? (data[data.length - 1] >= data[0]);
    const stroke = readVar(isPos ? '--good' : '--bad', isPos ? '#22c55e' : '#ef4444');
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + i * sx;
      const y = h - pad - (v - min) * sy;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, w, h, positive]);
  return <canvas ref={ref} className="spark" />;
}

function LineChart({ data, height = 320, indicators = {}, theme }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const min = Math.min(...data) * 0.98;
      const max = Math.max(...data) * 1.02;
      const range = max - min || 1;
      const padL = 44, padR = 16, padT = 18, padB = 26;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;

      // grid
      const grid = readVar('--border', '#e5e7eb');
      ctx.strokeStyle = grid; ctx.lineWidth = 1;
      ctx.font = '10.5px Geist Mono, monospace';
      ctx.fillStyle = readVar('--text-3', '#999');
      for (let i = 0; i <= 4; i++) {
        const y = padT + (innerH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(padL, y); ctx.lineTo(w - padR, y);
        ctx.stroke();
        const val = max - (range * i) / 4;
        ctx.fillText(val.toFixed(2), 4, y + 3);
      }
      // x labels (every 1/4)
      ctx.textAlign = 'center';
      const months = ['90d', '60d', '30d', 'Today'];
      for (let i = 0; i < 4; i++) {
        const x = padL + (innerW * i) / 3;
        ctx.fillText(months[i], x, h - 8);
      }
      ctx.textAlign = 'left';

      // optional SMAs
      if (indicators.sma50) {
        ctx.strokeStyle = readVar('--ok', '#f59e0b');
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, padT + innerH - ((indicators.sma50 - min) / range) * innerH);
        ctx.lineTo(w - padR, padT + innerH - ((indicators.sma50 - min) / range) * innerH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (indicators.sma200) {
        ctx.strokeStyle = readVar('--accent', '#7c3aed');
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, padT + innerH - ((indicators.sma200 - min) / range) * innerH);
        ctx.lineTo(w - padR, padT + innerH - ((indicators.sma200 - min) / range) * innerH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (indicators.support) {
        ctx.strokeStyle = readVar('--good', '#22c55e');
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 3]);
        ctx.beginPath();
        const y = padT + innerH - ((indicators.support - min) / range) * innerH;
        ctx.moveTo(padL, y); ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (indicators.resistance) {
        ctx.strokeStyle = readVar('--bad', '#ef4444');
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 3]);
        ctx.beginPath();
        const y = padT + innerH - ((indicators.resistance - min) / range) * innerH;
        ctx.moveTo(padL, y); ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // area gradient
      const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
      const accent = readVar('--accent', '#7c3aed');
      grad.addColorStop(0, accent.replace(')', ' / 0.15)').replace('oklch(', 'oklch('));
      grad.addColorStop(1, accent.replace(')', ' / 0)').replace('oklch(', 'oklch('));

      ctx.beginPath();
      data.forEach((v, i) => {
        const x = padL + (innerW * i) / (data.length - 1);
        const y = padT + innerH - ((v - min) / range) * innerH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // fill
      ctx.lineTo(padL + innerW, h - padB);
      ctx.lineTo(padL, h - padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // last value dot
      const lastX = padL + innerW;
      const lastY = padT + innerH - ((data[data.length - 1] - min) / range) * innerH;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = readVar('--surface', '#fff');
      ctx.beginPath();
      ctx.arc(lastX, lastY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [data, height, JSON.stringify(indicators), theme]);
  return <canvas ref={ref} />;
}

function BarChart({ data, height = 160, labels, colors, theme }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const max = Math.max(...data.map(Math.abs)) * 1.15 || 1;
      const padL = 40, padR = 12, padT = 8, padB = 22;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;
      const barW = (innerW / data.length) * 0.6;
      const gap = (innerW / data.length) * 0.4;
      const zero = padT + innerH / 2;

      // zero line
      ctx.strokeStyle = readVar('--border', '#e5e7eb');
      ctx.beginPath();
      ctx.moveTo(padL, zero); ctx.lineTo(w - padR, zero);
      ctx.stroke();

      ctx.font = '10px Geist Mono, monospace';
      ctx.fillStyle = readVar('--text-3', '#999');
      ctx.textAlign = 'right';
      ctx.fillText(max.toFixed(0), padL - 6, padT + 8);
      ctx.fillText('0', padL - 6, zero + 3);
      ctx.fillText('-' + max.toFixed(0), padL - 6, h - padB + 3);
      ctx.textAlign = 'center';

      data.forEach((v, i) => {
        const x = padL + gap / 2 + i * (barW + gap);
        const barH = (Math.abs(v) / max) * (innerH / 2);
        const color = colors ? colors[i] : (v >= 0 ? readVar('--good', '#22c55e') : readVar('--bad', '#ef4444'));
        ctx.fillStyle = color;
        if (v >= 0) {
          ctx.fillRect(x, zero - barH, barW, barH);
        } else {
          ctx.fillRect(x, zero, barW, barH);
        }
        // label
        if (labels) {
          ctx.fillStyle = readVar('--text-3', '#888');
          ctx.fillText(labels[i], x + barW / 2, h - 8);
        }
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [data, height, JSON.stringify(labels), JSON.stringify(colors), theme]);
  return <canvas ref={ref} />;
}

function DonutChart({ segments, size = 160, theme }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr; c.height = size * dpr;
    c.style.width = size + 'px'; c.style.height = size + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 6, ir = r * 0.62;
    const total = segments.reduce((a, b) => a + b.value, 0);
    let start = -Math.PI / 2;
    segments.forEach(seg => {
      const ang = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(cx + Math.cos(start) * ir, cy + Math.sin(start) * ir);
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.arc(cx, cy, ir, start + ang, start, true);
      ctx.closePath();
      ctx.fill();
      start += ang;
    });
  }, [JSON.stringify(segments), size, theme]);
  return <canvas ref={ref} />;
}

Object.assign(window, { Sparkline, LineChart, BarChart, DonutChart });
