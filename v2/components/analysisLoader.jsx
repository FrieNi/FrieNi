// 20-second analysis loader, after import

const ANALYSIS_STEPS = [
  'Fetching positions and live prices',
  'Pulling 5 years of historicals',
  'Computing fundamental ratings',
  'Computing technical indicators',
  'Crawling news, X, Reddit, YouTube',
  'Scoring sentiment per holding',
  'Cross-checking against your strategy',
  'Generating personalized insights',
];

function AnalysisLoader({ onDone, animMult, duration = 20000 }) {
  const realDuration = duration * animMult;
  const [progress, setProgress] = React.useState(0);
  const [stepIdx, setStepIdx] = React.useState(0);

  React.useEffect(() => {
    const start = performance.now();
    let raf;
    function tick(t) {
      const elapsed = t - start;
      const p = Math.min(100, (elapsed / realDuration) * 100);
      setProgress(p);
      const si = Math.min(ANALYSIS_STEPS.length - 1, Math.floor((p / 100) * ANALYSIS_STEPS.length));
      setStepIdx(si);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 400 * animMult);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [realDuration]);

  return (
    <div className="analysis-overlay">
      <div className="analysis-bg" />
      <div className="analysis-card">
        <h2>Analyzing your portfolio</h2>
        <p className="desc">Crunching ~5 years of data across 12 positions. This typically takes about 20 seconds.</p>
        <div className="analysis-prog">
          <div className="fill" style={{width: progress + '%'}} />
        </div>
        <div className="analysis-steps">
          {ANALYSIS_STEPS.map((s, i) => (
            <div key={i} className={'analysis-step ' + (i < stepIdx ? 'done' : i === stepIdx ? 'active' : '')}>
              <span className="step-dot">
                {i < stepIdx && <Icon name="check" size={9} color="white" />}
              </span>
              <span>{s}</span>
              {i < stepIdx && (
                <span style={{marginLeft:'auto', fontSize: 11, color:'var(--text-3)'}} className="mono">
                  done
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'relative', fontSize: 12, color:'var(--text-3)'}}>
        FrieNi keeps your data on-device — analyses run locally where possible.
      </div>
    </div>
  );
}

window.AnalysisLoader = AnalysisLoader;
