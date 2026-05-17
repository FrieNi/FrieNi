// feedback-picker.jsx
// Hold Ctrl → element inspector overlay. Click any element → comment modal → GitHub Issue.
// Auto-mounts from a <meta name="frieni-version"> tag on the page.
// Add to any HTML file:
//   <meta name="frieni-version" content="v1">  (or v2)
//   <script type="text/babel" src="feedback-picker.jsx"></script>  (after React + Babel)

const __FPK_STYLE = `
  .fpk-cursor-active * { cursor: crosshair !important; }

  .fpk-hint-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483640;
    background: rgba(30,115,255,.92); color: #fff;
    font: 600 12px/1 ui-sans-serif,system-ui,sans-serif;
    padding: 8px 14px; text-align: center;
    letter-spacing: .02em; pointer-events: none;
    box-shadow: 0 1px 8px rgba(30,115,255,.35);
  }

  .fpk-highlight {
    position: fixed; z-index: 2147483639; pointer-events: none;
    border: 2px solid rgba(30,115,255,.9);
    background: rgba(30,115,255,.08);
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(30,115,255,.2);
    transition: top .05s, left .05s, width .05s, height .05s;
  }
  .fpk-tag {
    position: absolute; top: -20px; left: -1px;
    background: rgba(30,115,255,.9); color: #fff;
    font: 600 10px/1 ui-monospace,monospace;
    padding: 3px 6px; border-radius: 3px 3px 3px 0;
    white-space: nowrap;
  }
  .fpk-selector-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483640;
    background: rgba(20,20,20,.92);
    color: rgba(255,255,255,.85);
    font: 11px/1.4 ui-monospace,monospace;
    padding: 6px 14px;
    pointer-events: none;
    letter-spacing: .01em;
  }

  .fpk-backdrop {
    position: fixed; inset: 0; z-index: 2147483645;
    background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2px);
  }
  .fpk-modal {
    width: 480px; max-width: calc(100vw - 32px);
    background: #fff; border-radius: 14px;
    box-shadow: 0 24px 64px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.1);
    overflow: hidden;
    font: 13px/1.5 ui-sans-serif,system-ui,sans-serif;
    animation: fpk-in .18s cubic-bezier(.3,.7,.4,1);
  }
  @keyframes fpk-in {
    from { opacity: 0; transform: scale(.95) translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  .fpk-modal-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(0,0,0,.07);
  }
  .fpk-modal-hd strong { font-size: 14px; font-weight: 600; }
  .fpk-modal-hd button {
    appearance: none; border: 0; background: transparent;
    color: rgba(0,0,0,.4); width: 24px; height: 24px;
    border-radius: 6px; cursor: pointer; font-size: 14px;
  }
  .fpk-modal-hd button:hover { background: rgba(0,0,0,.06); color: #000; }

  .fpk-meta {
    padding: 10px 16px; background: rgba(0,0,0,.03);
    border-bottom: 1px solid rgba(0,0,0,.06);
    display: flex; flex-direction: column; gap: 4px;
  }
  .fpk-meta-row { display: flex; gap: 6px; align-items: flex-start; }
  .fpk-meta-label {
    font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    color: rgba(0,0,0,.35); min-width: 60px; padding-top: 1px;
  }
  .fpk-meta code {
    font: 11px/1.5 ui-monospace,monospace;
    background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px;
    word-break: break-all; color: rgba(0,0,0,.75);
  }
  .fpk-meta-text {
    font-size: 11px; color: rgba(0,0,0,.5); font-style: italic;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 340px;
  }

  .fpk-body { padding: 14px 16px; }
  .fpk-textarea {
    width: 100%; box-sizing: border-box;
    border: 1px solid rgba(0,0,0,.14); border-radius: 8px;
    padding: 10px 12px; font: 13px/1.5 ui-sans-serif,system-ui,sans-serif;
    resize: vertical; outline: none; color: #1a1a1a;
    background: #fafafa;
    min-height: 110px;
  }
  .fpk-textarea:focus { border-color: rgba(30,115,255,.6); background: #fff; box-shadow: 0 0 0 3px rgba(30,115,255,.1); }

  .fpk-modal-ft {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px 14px; gap: 10px;
  }
  .fpk-hint-txt { font-size: 11px; color: rgba(0,0,0,.35); }
  .fpk-hint-txt a { color: rgba(30,115,255,.8); text-decoration: none; }
  .fpk-submit {
    appearance: none; border: 0; cursor: pointer;
    background: rgba(30,115,255,.92); color: #fff;
    font: 600 13px/1 ui-sans-serif,system-ui,sans-serif;
    padding: 8px 16px; border-radius: 8px;
    transition: background .12s;
  }
  .fpk-submit:hover { background: rgb(20,100,240); }
  .fpk-submit:disabled { background: rgba(0,0,0,.15); color: rgba(0,0,0,.35); cursor: not-allowed; }
`;

// Build a readable CSS selector for an element (up to 4 ancestors)
function fpkSelector(el) {
  const parts = [];
  let node = el;
  while (node && node.tagName && node !== document.body && parts.length < 5) {
    let p = node.tagName.toLowerCase();
    if (node.id) {
      p += '#' + node.id;
      parts.unshift(p);
      break;
    }
    const cls = typeof node.className === 'string'
      ? node.className.trim().split(/\s+/).filter(c => c && !c.startsWith('fpk-')).slice(0, 2).join('.')
      : '';
    if (cls) p += '.' + cls;
    // nth-child for disambiguation
    if (node.parentElement) {
      const siblings = Array.from(node.parentElement.children).filter(c => c.tagName === node.tagName);
      if (siblings.length > 1) p += `:nth-child(${Array.from(node.parentElement.children).indexOf(node) + 1})`;
    }
    parts.unshift(p);
    node = node.parentElement;
  }
  return parts.join(' > ') || el.tagName.toLowerCase();
}

// Is this element part of our own picker UI?
function fpkIsOwn(el) {
  return !!(el && el.closest && (el.closest('[data-fpk]') || el.closest('#__fpk_root')));
}

function FeedbackPicker({ version, repo }) {
  const [active, setActive]       = React.useState(false);
  const [highlight, setHighlight] = React.useState(null); // { el, rect, selector }
  const [picked, setPicked]       = React.useState(null); // { selector, text, tagName }
  const [comment, setComment]     = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  // ── Ctrl key ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const down = (e) => { if (e.key === 'Control' && !picked) setActive(true); };
    const up   = (e) => { if (e.key === 'Control') { setActive(false); setHighlight(null); } };
    const blur = () => { setActive(false); setHighlight(null); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    window.addEventListener('blur',    blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup',   up);
      window.removeEventListener('blur',    blur);
    };
  }, [picked]);

  // ── cursor class on body ───────────────────────────────────────────────────
  React.useEffect(() => {
    document.body.classList.toggle('fpk-cursor-active', active);
    return () => document.body.classList.remove('fpk-cursor-active');
  }, [active]);

  // ── mouse tracking ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!active) return;

    const move = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || fpkIsOwn(el)) return;
      setHighlight({ el, rect: el.getBoundingClientRect(), selector: fpkSelector(el) });
    };

    const click = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || fpkIsOwn(el)) return;
      e.preventDefault();
      e.stopPropagation();
      const selector = fpkSelector(el);
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);
      setPicked({ selector, text, tagName: el.tagName.toLowerCase() });
      setActive(false);
      setHighlight(null);
    };

    window.addEventListener('mousemove', move, true);
    window.addEventListener('click',     click, true);
    return () => {
      window.removeEventListener('mousemove', move, true);
      window.removeEventListener('click',     click, true);
    };
  }, [active]);

  // ── submit → open GitHub issue page ───────────────────────────────────────
  const submit = React.useCallback(() => {
    if (!picked || !comment.trim()) return;
    const firstLine = comment.trim().split('\n')[0].slice(0, 72);
    const title = `[${version}] ${firstLine}`;
    const body = [
      `**App version:** \`${version}\``,
      `**Element:** \`${picked.selector}\``,
      `**Tag:** \`<${picked.tagName}>\``,
      picked.text ? `**Visible text:** "${picked.text}"` : null,
      '',
      '---',
      '',
      '**Comment:**',
      comment.trim(),
    ].filter(s => s !== null).join('\n');

    const params = new URLSearchParams({ title, body, labels: 'feedback' });
    window.open(`https://github.com/${repo}/issues/new?${params}`, '_blank');
    setSubmitted(true);
    setTimeout(() => {
      setPicked(null);
      setComment('');
      setSubmitted(false);
    }, 1200);
  }, [picked, comment, version, repo]);

  return (
    <>
      <style>{__FPK_STYLE}</style>

      {/* Ctrl banner */}
      {active && (
        <div data-fpk className="fpk-hint-bar">
          🎯 Ctrl gedrückt — Element anklicken um einen Kommentar zu hinterlassen
        </div>
      )}

      {/* Highlight box */}
      {active && highlight && (() => {
        const r = highlight.rect;
        return (
          <div data-fpk className="fpk-highlight" style={{ top: r.top, left: r.left, width: r.width, height: r.height }}>
            <span className="fpk-tag">{highlight.el.tagName.toLowerCase()}</span>
          </div>
        );
      })()}

      {/* Selector bar at bottom */}
      {active && highlight && (
        <div data-fpk className="fpk-selector-bar">
          {highlight.selector}
        </div>
      )}

      {/* Comment modal */}
      {picked && (
        <div data-fpk className="fpk-backdrop" onClick={e => { if (e.target === e.currentTarget) { setPicked(null); setComment(''); } }}>
          <div data-fpk className="fpk-modal">
            <div className="fpk-modal-hd">
              <strong>Kommentar hinterlassen</strong>
              <button aria-label="Schließen" onClick={() => { setPicked(null); setComment(''); }}>✕</button>
            </div>
            <div className="fpk-meta">
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Version</span>
                <code>{version}</code>
              </div>
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Element</span>
                <code>{picked.selector}</code>
              </div>
              {picked.text && (
                <div className="fpk-meta-row">
                  <span className="fpk-meta-label">Text</span>
                  <span className="fpk-meta-text">"{picked.text}"</span>
                </div>
              )}
            </div>
            <div className="fpk-body">
              <textarea
                className="fpk-textarea"
                placeholder="Beschreibe das Problem oder den Vorschlag…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
              />
            </div>
            <div className="fpk-modal-ft">
              <span className="fpk-hint-txt">
                {submitted ? '✓ GitHub wird geöffnet…' : 'Öffnet GitHub Issues · Ctrl+Enter zum Absenden'}
              </span>
              <button className="fpk-submit" onClick={submit} disabled={!comment.trim() || submitted}>
                {submitted ? '✓ Geöffnet' : 'Issue erstellen →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Auto-mount ────────────────────────────────────────────────────────────────
(function () {
  const version = document.querySelector('meta[name="frieni-version"]')?.content || 'unknown';
  const repo    = document.querySelector('meta[name="frieni-repo"]')?.content    || 'FrieNi/FrieNi';
  const root    = document.createElement('div');
  root.id       = '__fpk_root';
  document.body.appendChild(root);
  const mount = () => ReactDOM.createRoot(root).render(
    React.createElement(FeedbackPicker, { version, repo })
  );
  if (document.readyState === 'complete' || document.readyState === 'interactive') mount();
  else window.addEventListener('DOMContentLoaded', mount);
})();
