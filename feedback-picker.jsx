// feedback-picker.jsx — v3: enrichment (no app changes) + multi-select
// Meta tags required in host HTML:
//   <meta name="frieni-version" content="v1">   (or v2)
//   <meta name="frieni-repo"    content="FrieNi/FrieNi">
//   <meta name="frieni-worker"  content="https://frieni-auth.<account>.workers.dev">

const BADGES      = ['①','②','③','④','⑤'];
const BADGE_COLORS = [
  'rgba(30,115,255,.9)',  // ① blue
  'rgba(220,90,20,.9)',   // ② orange
  'rgba(20,160,80,.9)',   // ③ green
  'rgba(160,30,200,.9)',  // ④ purple
  'rgba(200,30,80,.9)',   // ⑤ red
];

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
    background: rgba(30,115,255,.08); border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(30,115,255,.2);
    transition: top .05s, left .05s, width .05s, height .05s;
  }
  .fpk-highlight-pinned {
    position: fixed; z-index: 2147483638; pointer-events: none;
    border-width: 2px; border-style: solid; border-radius: 3px;
  }
  .fpk-tag {
    position: absolute; top: -22px; left: -1px;
    font: 600 12px/1 ui-monospace,monospace;
    padding: 3px 7px; border-radius: 3px 3px 3px 0; white-space: nowrap;
    color: #fff;
  }
  .fpk-selector-bar {
    position: fixed; bottom: 48px; left: 0; right: 0; z-index: 2147483640;
    background: rgba(20,20,20,.92); color: rgba(255,255,255,.85);
    font: 11px/1.4 ui-monospace,monospace; padding: 6px 14px;
    pointer-events: none; letter-spacing: .01em;
  }

  /* Mini-bar (multi-select tray) */
  .fpk-mini-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483641;
    background: rgba(15,15,15,.96); backdrop-filter: blur(8px);
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    padding: 8px 14px;
    box-shadow: 0 -2px 16px rgba(0,0,0,.3);
    font: 12px/1 ui-sans-serif,system-ui,sans-serif;
  }
  .fpk-chip {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 20px; padding: 4px 8px 4px 7px;
    font: 600 11px/1 ui-sans-serif,system-ui,sans-serif;
    color: #fff; white-space: nowrap; max-width: 200px;
  }
  .fpk-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fpk-chip-remove {
    appearance: none; border: 0; background: rgba(255,255,255,.25);
    color: #fff; border-radius: 50%; width: 15px; height: 15px;
    font-size: 10px; cursor: pointer; line-height: 15px; text-align: center;
    flex-shrink: 0; padding: 0;
  }
  .fpk-chip-remove:hover { background: rgba(255,255,255,.45); }
  .fpk-mini-spacer { flex: 1; }
  .fpk-mini-btn {
    appearance: none; border: 1px solid rgba(255,255,255,.2);
    border-radius: 8px; padding: 6px 12px;
    font: 600 11px/1 ui-sans-serif,system-ui,sans-serif;
    cursor: pointer; white-space: nowrap;
  }
  .fpk-mini-btn-add  { background: rgba(255,255,255,.08); color: rgba(255,255,255,.8); }
  .fpk-mini-btn-add:hover { background: rgba(255,255,255,.15); }
  .fpk-mini-btn-done { background: rgba(30,115,255,.9); color: #fff; border-color: transparent; }
  .fpk-mini-btn-done:hover { background: rgb(20,100,240); }

  /* Auth badge */
  .fpk-auth-badge {
    position: fixed; bottom: 16px; left: 16px; z-index: 2147483641;
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.9); border: 1px solid rgba(0,0,0,.1);
    border-radius: 20px; padding: 5px 10px 5px 6px;
    font: 12px/1 ui-sans-serif,system-ui,sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    backdrop-filter: blur(8px); cursor: default;
  }
  .fpk-auth-badge img { width: 20px; height: 20px; border-radius: 50%; }
  .fpk-auth-badge span { color: rgba(0,0,0,.6); }
  .fpk-auth-badge strong { color: #1a1a1a; font-weight: 600; }

  /* Modal */
  .fpk-backdrop {
    position: fixed; inset: 0; z-index: 2147483645;
    background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2px);
  }
  .fpk-modal {
    width: 520px; max-width: calc(100vw - 32px);
    background: #fff; border-radius: 14px;
    box-shadow: 0 24px 64px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.1);
    overflow: hidden; font: 13px/1.5 ui-sans-serif,system-ui,sans-serif;
    animation: fpk-in .18s cubic-bezier(.3,.7,.4,1);
    max-height: calc(100vh - 48px); display: flex; flex-direction: column;
  }
  @keyframes fpk-in {
    from { opacity: 0; transform: scale(.95) translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  .fpk-modal-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px; border-bottom: 1px solid rgba(0,0,0,.07);
    flex-shrink: 0;
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
    overflow-y: auto; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 4px;
  }
  .fpk-meta-row { display: flex; gap: 6px; align-items: flex-start; }
  .fpk-meta-label {
    font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    color: rgba(0,0,0,.35); min-width: 60px; padding-top: 1px; flex-shrink: 0;
  }
  .fpk-meta code {
    font: 11px/1.5 ui-monospace,monospace;
    background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px;
    word-break: break-all; color: rgba(0,0,0,.75);
  }
  .fpk-meta-text {
    font-size: 11px; color: rgba(0,0,0,.5); font-style: italic;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px;
  }
  .fpk-area-header {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0 4px;
    font: 600 11px/1 ui-sans-serif,system-ui,sans-serif;
    color: rgba(0,0,0,.6); margin-top: 4px;
  }
  .fpk-area-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%;
    font-size: 12px; flex-shrink: 0;
  }
  .fpk-area-divider { height: 1px; background: rgba(0,0,0,.08); margin: 6px 0; }
  .fpk-body { padding: 14px 16px; flex: 1; overflow-y: auto; }
  .fpk-title-preview {
    font: 12px/1.4 ui-monospace,monospace;
    background: rgba(0,0,0,.04); border: 1px solid rgba(0,0,0,.1);
    border-radius: 6px; padding: 7px 10px; color: rgba(0,0,0,.6);
    margin-bottom: 10px; word-break: break-all;
  }
  .fpk-title-label {
    font: 600 10px/1 ui-sans-serif,system-ui,sans-serif;
    letter-spacing: .06em; text-transform: uppercase;
    color: rgba(0,0,0,.35); margin-bottom: 5px;
  }
  .fpk-textarea {
    width: 100%; box-sizing: border-box;
    border: 1px solid rgba(0,0,0,.14); border-radius: 8px;
    padding: 10px 12px; font: 13px/1.5 ui-sans-serif,system-ui,sans-serif;
    resize: vertical; outline: none; color: #1a1a1a;
    background: #fafafa; min-height: 100px;
  }
  .fpk-textarea:focus { border-color: rgba(30,115,255,.6); background: #fff; box-shadow: 0 0 0 3px rgba(30,115,255,.1); }
  .fpk-modal-ft {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px 14px; gap: 10px; flex-shrink: 0;
    border-top: 1px solid rgba(0,0,0,.07);
  }
  .fpk-status { font-size: 11px; color: rgba(0,0,0,.4); }
  .fpk-status.error   { color: #c0392b; }
  .fpk-status.success { color: #27ae60; }
  .fpk-submit {
    appearance: none; border: 0; cursor: pointer;
    background: rgba(30,115,255,.92); color: #fff;
    font: 600 13px/1 ui-sans-serif,system-ui,sans-serif;
    padding: 8px 16px; border-radius: 8px; transition: background .12s;
    white-space: nowrap;
  }
  .fpk-submit:hover { background: rgb(20,100,240); }
  .fpk-submit:disabled { background: rgba(0,0,0,.15); color: rgba(0,0,0,.35); cursor: not-allowed; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fpkSelector(el) {
  const parts = [];
  let node = el;
  while (node && node.tagName && node !== document.body && parts.length < 5) {
    let p = node.tagName.toLowerCase();
    if (node.id) { p += '#' + node.id; parts.unshift(p); break; }
    const cls = typeof node.className === 'string'
      ? node.className.trim().split(/\s+/).filter(c => c && !c.startsWith('fpk-')).slice(0, 2).join('.')
      : '';
    if (cls) p += '.' + cls;
    parts.unshift(p);
    node = node.parentElement;
  }
  return parts.join(' > ') || el.tagName.toLowerCase();
}

function fpkIsOwn(el) {
  return !!(el && el.closest && (el.closest('[data-fpk]') || el.closest('#__fpk_root')));
}

// Enrich an element with zero-code-change context signals
function fpkEnrich(el) {
  const route     = window.location.pathname;
  const pageTitle = document.title;

  // Nearest heading: walk up, also check previous siblings at each level
  let nearestHeading = null;
  let node = el;
  outer: while (node && node !== document.body) {
    if (/^H[1-6]$/.test(node.tagName)) {
      nearestHeading = (node.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      break;
    }
    let sib = node.previousElementSibling;
    while (sib) {
      if (/^H[1-6]$/.test(sib.tagName)) {
        nearestHeading = (sib.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60);
        break outer;
      }
      sib = sib.previousElementSibling;
    }
    node = node.parentElement;
  }

  // Nearest ancestor with a meaningful id
  let nearestId = null;
  node = el;
  while (node && node !== document.body) {
    if (node.id && !node.id.startsWith('__fpk') && !node.id.startsWith('fpk-')) {
      nearestId = node.id; break;
    }
    node = node.parentElement;
  }

  // ARIA label + role, walking up
  let ariaLabel = null, ariaRole = null;
  node = el;
  while (node && node !== document.body) {
    if (!ariaLabel && node.getAttribute('aria-label'))
      ariaLabel = node.getAttribute('aria-label').slice(0, 80);
    if (!ariaRole && node.getAttribute('role'))
      ariaRole = node.getAttribute('role');
    if (ariaLabel && ariaRole) break;
    node = node.parentElement;
  }

  // SPA router state — React Router / Vue Router store route name here
  const routeName = window.history?.state?.name || window.history?.state?.as || null;

  const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  const r    = el.getBoundingClientRect();

  return {
    selector: fpkSelector(el),
    tagName:  el.tagName.toLowerCase(),
    text,
    route,
    pageTitle,
    routeName,
    nearestHeading,
    nearestId,
    ariaLabel,
    ariaRole,
    rect: { top: r.top, left: r.left, width: r.width, height: r.height },
  };
}

function fpkChipLabel(s) {
  return s.nearestHeading || s.ariaLabel || s.routeName || s.route;
}

function fpkAutoTitle(selections, version) {
  const areas = selections.map(fpkChipLabel);
  if (selections.length === 1) return `[${version}] ${areas[0]}`;
  return `[${version}] ${selections.length} areas: ${areas.join(' + ')}`;
}

const SESSION_KEY = 'fpk_session';

// ── Component ─────────────────────────────────────────────────────────────────

function FeedbackPicker({ version, repo, workerUrl }) {
  const [user, setUser]           = React.useState(null);
  const [authChecked, setChecked] = React.useState(false);
  const [active, setActive]       = React.useState(false);   // hover-pick mode
  const [highlight, setHighlight] = React.useState(null);    // current hover
  const [selections, setSelections] = React.useState([]);    // captured elements
  const [modalOpen, setModalOpen] = React.useState(false);
  const [comment, setComment]     = React.useState('');
  const [status, setStatus]       = React.useState(null);    // null | { type, msg }

  const hasSelections = selections.length > 0;

  // ── Auth bootstrap ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (window.FpkUser) setUser(window.FpkUser);
    setChecked(true);
  }, []);

  // ── Ctrl key — activates hover mode ──────────────────────────────────────
  React.useEffect(() => {
    if (!user) return;
    const down = (e) => { if (e.key === 'Control' && !modalOpen) setActive(true); };
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
  }, [user, modalOpen]);

  React.useEffect(() => {
    document.body.classList.toggle('fpk-cursor-active', active);
    return () => document.body.classList.remove('fpk-cursor-active');
  }, [active]);

  // ── Mouse tracking ────────────────────────────────────────────────────────
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
      e.preventDefault(); e.stopPropagation();
      const enriched = fpkEnrich(el);
      setSelections(prev => {
        // don't add duplicate selector
        if (prev.some(s => s.selector === enriched.selector)) return prev;
        return [...prev, enriched].slice(0, 5); // max 5
      });
      setActive(false); setHighlight(null);
    };
    window.addEventListener('mousemove', move, true);
    window.addEventListener('click',     click, true);
    return () => {
      window.removeEventListener('mousemove', move, true);
      window.removeEventListener('click',     click, true);
    };
  }, [active]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const removeSelection = (i) => {
    setSelections(prev => prev.filter((_, idx) => idx !== i));
  };

  const resetAll = () => {
    setSelections([]); setModalOpen(false); setComment(''); setStatus(null);
  };

  const openModal = () => {
    setActive(false); setHighlight(null); setModalOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = React.useCallback(async () => {
    if (!selections.length || !comment.trim()) return;
    const token = window.FpkToken || localStorage.getItem(SESSION_KEY);
    setStatus({ type: 'loading', msg: 'Wird erstellt…' });
    try {
      const title = fpkAutoTitle(selections, version);
      const res = await fetch(`${workerUrl}/api/create-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          repo,
          title,
          version,
          elements: selections.map(s => ({
            selector:       s.selector,
            tagName:        s.tagName,
            text:           s.text,
            route:          s.route,
            pageTitle:      s.pageTitle,
            routeName:      s.routeName,
            nearestHeading: s.nearestHeading,
            nearestId:      s.nearestId,
            ariaLabel:      s.ariaLabel,
            ariaRole:       s.ariaRole,
          })),
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');
      setStatus({ type: 'success', msg: `✓ Issue #${data.number} erstellt` });
      setTimeout(resetAll, 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: `Fehler: ${err.message}` });
    }
  }, [selections, comment, version, repo, workerUrl]);

  if (!authChecked) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{__FPK_STYLE}</style>

      {/* Auth badge (hide when mini-bar is showing) */}
      {user && !hasSelections && !modalOpen && (
        <div data-fpk className="fpk-auth-badge" title="Ctrl+Klick auf ein Element um Feedback zu geben">
          <img src={user.avatar_url} alt={user.login} />
          <span>Angemeldet als <strong>{user.login}</strong></span>
        </div>
      )}

      {/* Ctrl banner */}
      {active && (
        <div data-fpk className="fpk-hint-bar">
          {hasSelections
            ? `🎯 Ctrl — weiteres Element wählen (${selections.length}/5 ausgewählt)`
            : '🎯 Ctrl gedrückt — Element anklicken um Feedback zu hinterlassen'
          }
        </div>
      )}

      {/* Hover highlight */}
      {active && highlight && (() => {
        const r = highlight.rect;
        return (
          <div data-fpk className="fpk-highlight" style={{ top: r.top, left: r.left, width: r.width, height: r.height }}>
            <span className="fpk-tag" style={{ background: 'rgba(30,115,255,.9)' }}>
              {highlight.el.tagName.toLowerCase()}
            </span>
          </div>
        );
      })()}
      {active && highlight && (
        <div data-fpk className="fpk-selector-bar">{highlight.selector}</div>
      )}

      {/* Pinned selection badges */}
      {!modalOpen && selections.map((s, i) => (
        <div key={i} data-fpk className="fpk-highlight-pinned" style={{
          top: s.rect.top, left: s.rect.left, width: s.rect.width, height: s.rect.height,
          borderColor: BADGE_COLORS[i],
          background: BADGE_COLORS[i].replace('.9)', '.06)'),
        }}>
          <span className="fpk-tag" style={{ background: BADGE_COLORS[i] }}>
            {BADGES[i]} {fpkChipLabel(s).slice(0, 24)}
          </span>
        </div>
      ))}

      {/* Mini-bar — shown whenever ≥1 selection and modal is closed */}
      {hasSelections && !modalOpen && (
        <div data-fpk className="fpk-mini-bar">
          {selections.map((s, i) => (
            <span key={i} className="fpk-chip" style={{ background: BADGE_COLORS[i] }}>
              {BADGES[i]}
              <span title={fpkChipLabel(s)}>{fpkChipLabel(s).slice(0, 28)}</span>
              <button className="fpk-chip-remove" onClick={() => removeSelection(i)}>×</button>
            </span>
          ))}
          <div className="fpk-mini-spacer" />
          {selections.length < 5 && (
            <button data-fpk className="fpk-mini-btn fpk-mini-btn-add" onClick={() => setActive(true)}>
              + Add area
            </button>
          )}
          <button data-fpk className="fpk-mini-btn fpk-mini-btn-done" onClick={openModal}>
            → Create issue
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div data-fpk className="fpk-backdrop" onClick={e => { if (e.target === e.currentTarget) resetAll(); }}>
          <div data-fpk className="fpk-modal">
            <div className="fpk-modal-hd">
              <strong>Feedback hinterlassen</strong>
              <button onClick={resetAll}>✕</button>
            </div>

            {/* Meta: all selected areas */}
            <div className="fpk-meta">
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Version</span><code>{version}</code>
              </div>
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Von</span><code>@{user.login}</code>
              </div>

              {selections.map((s, i) => (
                <React.Fragment key={i}>
                  {selections.length > 1 && <div className="fpk-area-divider" />}
                  {selections.length > 1 && (
                    <div className="fpk-area-header">
                      <span className="fpk-area-badge" style={{ background: BADGE_COLORS[i], color: '#fff' }}>
                        {BADGES[i]}
                      </span>
                      {fpkChipLabel(s)}
                    </div>
                  )}
                  <div className="fpk-meta-row">
                    <span className="fpk-meta-label">Route</span><code>{s.route}</code>
                  </div>
                  {s.nearestHeading && (
                    <div className="fpk-meta-row">
                      <span className="fpk-meta-label">Section</span>
                      <span className="fpk-meta-text">{s.nearestHeading}</span>
                    </div>
                  )}
                  {s.ariaLabel && (
                    <div className="fpk-meta-row">
                      <span className="fpk-meta-label">ARIA</span>
                      <span className="fpk-meta-text">{s.ariaLabel}{s.ariaRole ? ` (${s.ariaRole})` : ''}</span>
                    </div>
                  )}
                  {s.nearestId && (
                    <div className="fpk-meta-row">
                      <span className="fpk-meta-label">ID</span><code>#{s.nearestId}</code>
                    </div>
                  )}
                  {s.text && (
                    <div className="fpk-meta-row">
                      <span className="fpk-meta-label">Text</span>
                      <span className="fpk-meta-text">"{s.text}"</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="fpk-body">
              <div className="fpk-title-label">Auto-generated title</div>
              <div className="fpk-title-preview">{fpkAutoTitle(selections, version)}</div>
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
              {status
                ? <span className={`fpk-status ${status.type}`}>{status.msg}</span>
                : <span className="fpk-status">Ctrl+Enter zum Absenden</span>
              }
              <button className="fpk-submit" onClick={submit}
                disabled={!comment.trim() || status?.type === 'loading' || status?.type === 'success'}>
                {status?.type === 'loading' ? '…' : status?.type === 'success' ? '✓ Erstellt' : 'Issue erstellen →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Auto-mount ─────────────────────────────────────────────────────────────────
(function () {
  const version   = document.querySelector('meta[name="frieni-version"]')?.content  || 'unknown';
  const repo      = document.querySelector('meta[name="frieni-repo"]')?.content     || 'FrieNi/FrieNi';
  const workerUrl = document.querySelector('meta[name="frieni-worker"]')?.content   || '';

  if (!workerUrl) {
    console.warn('[FeedbackPicker] No <meta name="frieni-worker"> found — picker disabled.');
    return;
  }

  const root = document.createElement('div');
  root.id = '__fpk_root';
  document.body.appendChild(root);
  const mount = () => ReactDOM.createRoot(root).render(
    React.createElement(FeedbackPicker, { version, repo, workerUrl })
  );
  if (document.readyState === 'complete' || document.readyState === 'interactive') mount();
  else window.addEventListener('DOMContentLoaded', mount);
})();
