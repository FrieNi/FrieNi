// FrieNi Tweaks — exposes design knobs via the host's Tweaks toolbar
const FrieNiTweaks = () => {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [appState, setAppState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setAppState({ ...s })), []);

  // Apply the brand color and radius live to CSS variables
  useEffect(() => {
    if (!t || !t.brand) return;
    document.documentElement.style.setProperty('--brand', t.brand);
    const r = parseInt(t.brand.slice(1, 3), 16);
    const g = parseInt(t.brand.slice(3, 5), 16);
    const b = parseInt(t.brand.slice(5, 7), 16);
    document.documentElement.style.setProperty('--brand-soft', `rgba(${r}, ${g}, ${b}, 0.16)`);
    document.documentElement.style.setProperty('--brand-hover',
      `rgb(${Math.round(r * 0.85)}, ${Math.round(g * 0.85)}, ${Math.round(b * 0.85)})`);
    document.documentElement.style.setProperty('--brand-ink',
      `rgb(${Math.round(r * 0.5)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.5)})`);

    document.documentElement.style.setProperty('--bg-canvas', t.canvas);
    document.documentElement.style.setProperty('--r-md', t.radius + 'px');
    document.documentElement.style.setProperty('--r-lg', (t.radius + 4) + 'px');
    document.documentElement.style.setProperty('--r-sm', Math.max(2, t.radius - 2) + 'px');

    document.documentElement.style.setProperty('--gain', t.gain);
    document.documentElement.style.setProperty('--loss', t.loss);

    document.documentElement.style.setProperty('--font-display', t.displayFont);
  }, [t]);

  return (
    <TweaksPanel title="FrieNi Tweaks">
      <TweakSection title="Palette">
        <TweakColor label="Brand" value={t.brand} options={['#c2531e', '#a64b1e', '#8a4a2a', '#2d5e7a', '#4f7a3f']}
          onChange={v => setTweak('brand', v)} />
        <TweakColor label="Canvas" value={t.canvas} options={['#f5f1ea', '#fbf6ec', '#efe9df', '#1f1812']}
          onChange={v => setTweak('canvas', v)} />
        <TweakColor label="Gain" value={t.gain} options={['#4f7a3f', '#3a8a4a', '#2a8b6a']}
          onChange={v => setTweak('gain', v)} />
        <TweakColor label="Loss" value={t.loss} options={['#b04a3a', '#c54a3a', '#964032']}
          onChange={v => setTweak('loss', v)} />
      </TweakSection>

      <TweakSection title="Shape">
        <TweakSlider label="Corner radius" value={t.radius} min={0} max={20} step={1}
          onChange={v => setTweak('radius', v)} suffix="px" />
      </TweakSection>

      <TweakSection title="Typography">
        <TweakRadio label="Display font" value={t.displayFont}
          options={['"Source Serif 4", Georgia, serif', '"Inter", sans-serif']}
          labels={['Serif', 'Sans']}
          onChange={v => setTweak('displayFont', v)} />
      </TweakSection>

      <TweakSection title="First-run wizard">
        <TweakButton label={appState.wizardOpen ? 'Close wizard' : 'Open onboarding wizard'} onClick={() => {
          if (appState.wizardOpen) window.AppStore.closeWizard();
          else window.AppStore.openWizard();
        }} />
      </TweakSection>

      <TweakSection title="Zen scenario">
        <TweakSelect
          label="Scenario"
          value={appState.zenScenario}
          options={[
            { value: 'calm', label: 'Nothing to do' },
            { value: 'improvement', label: 'Improvement' },
            { value: 'warning', label: 'Warning' },
            { value: 'blackswan', label: 'Black swan' },
          ]}
          onChange={v => window.AppStore.setZenScenario(v)} />
        <TweakButton label={appState.dashboardMode === 'zen' ? 'Switch to Pro' : 'Switch to Zen'} onClick={() => {
          window.AppStore.setDashboardMode(appState.dashboardMode === 'zen' ? 'pro' : 'zen');
        }} />
      </TweakSection>
    </TweaksPanel>
  );
};

window.FrieNiTweaks = FrieNiTweaks;
