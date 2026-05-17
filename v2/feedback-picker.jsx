// feedback-picker.jsx — v2 with GitHub OAuth auth via Cloudflare Worker
// Meta tags required in host HTML:
//   <meta name="frieni-version" content="v1">   (or v2)
//   <meta name="frieni-repo"    content="FrieNi/FrieNi">
//   <meta name="frieni-worker"  content="https://frieni-auth.<account>.workers.dev">

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
  .fpk-tag {
    position: absolute; top: -20px; left: -1px;
    background: rgba(30,115,255,.9); color: #fff;
    font: 600 10px/1 ui-monospace,monospace;
    padding: 3px 6px; border-radius: 3px 3px 3px 0; white-space: nowrap;
  }
  .fpk-selector-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483640;
    background: rgba(20,20,20,.92); color: rgba(255,255,255,.85);
    font: 11px/1.4 ui-monospace,monospace; padding: 6px 14px;
    pointer-events: none; letter-spacing: .01em;
  }

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
  .fpk-login-btn {
    position: fixed; bottom: 16px; left: 16px; z-index: 2147483641;
    appearance: none; border: 1px solid rgba(0,0,0,.15); border-radius: 20px;
    background: rgba(255,255,255,.9); backdrop-filter: blur(8px);
    padding: 6px 14px; font: 600 12px/1 ui-sans-serif,system-ui,sans-serif;
    color: #1a1a1a; cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    display: flex; align-items: center; gap: 6px;
  }
  .fpk-login-btn:hover { background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.15); }
  .fpk-login-btn svg { width: 14px; height: 14px; }

  /* Modal */
  .fpk-backdrop {
    position: fixed; inset: 0; z-index: 2147483645;
    background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2px);
  }
  .fpk-modal {
    width: 480px; max-width: calc(100vw - 32px);
    background: #fff; border-radius: 14px;
    box-shadow: 0 24px 64px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.1);
    overflow: hidden; font: 13px/1.5 ui-sans-serif,system-ui,sans-serif;
    animation: fpk-in .18s cubic-bezier(.3,.7,.4,1);
  }
  @keyframes fpk-in {
    from { opacity: 0; transform: scale(.95) translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  .fpk-modal-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px; border-bottom: 1px solid rgba(0,0,0,.07);
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
    background: #fafafa; min-height: 110px;
  }
  .fpk-textarea:focus { border-color: rgba(30,115,255,.6); background: #fff; box-shadow: 0 0 0 3px rgba(30,115,255,.1); }
  .fpk-modal-ft {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px 14px; gap: 10px;
  }
  .fpk-status { font-size: 11px; color: rgba(0,0,0,.4); }
  .fpk-status.error { color: #c0392b; }
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
    if (node.parentElement) {
      const siblings = Array.from(node.parentElement.children).filter(c => c.tagName === node.tagName);
      if (siblings.length > 1) p += `:nth-child(${Array.from(node.parentElement.children).indexOf(node) + 1})`;
    }
    parts.unshift(p);
    node = node.parentElement;
  }
  return parts.join(' > ') || el.tagName.toLowerCase();
}

function fpkIsOwn(el) {
  return !!(el && el.closest && (el.closest('[data-fpk]') || el.closest('#__fpk_root')));
}

const SESSION_KEY = 'fpk_session';

function FeedbackPicker({ version, repo, workerUrl }) {
  const [user, setUser]           = React.useState(null);   // { login, avatar_url, name }
  const [authChecked, setChecked] = React.useState(false);
  const [active, setActive]       = React.useState(false);
  const [highlight, setHighlight] = React.useState(null);
  const [picked, setPicked]       = React.useState(null);
  const [comment, setComment]     = React.useState('');
  const [status, setStatus]       = React.useState(null);   // null | { type, msg }

  // ── session bootstrap ────────────────────────────────────────────────────────
  React.useEffect(() => {
    // Grab session token from URL fragment after OAuth redirect
    const hash = window.location.hash;
    const match = hash.match(/fpk_session=([a-f0-9]+)/);
    if (match) {
      localStorage.setItem(SESSION_KEY, match[1]);
      // Clean fragment without reloading
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const token = localStorage.getItem(SESSION_KEY);
    if (!token) { setChecked(true); return; }

    fetch(`${workerUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.login) setUser(data);
        else localStorage.removeItem(SESSION_KEY);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [workerUrl]);

  const login = () => {
    const returnTo = window.location.href.split('#')[0];
    window.location.href = `${workerUrl}/auth/login?return_to=${encodeURIComponent(returnTo)}`;
  };

  // ── Ctrl key ─────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!user) return;
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
  }, [user, picked]);

  React.useEffect(() => {
    document.body.classList.toggle('fpk-cursor-active', active);
    return () => document.body.classList.remove('fpk-cursor-active');
  }, [active]);

  // ── mouse tracking ────────────────────────────────────────────────────────────
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
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);
      setPicked({ selector: fpkSelector(el), text, tagName: el.tagName.toLowerCase() });
      setActive(false); setHighlight(null);
    };
    window.addEventListener('mousemove', move, true);
    window.addEventListener('click',     click, true);
    return () => {
      window.removeEventListener('mousemove', move, true);
      window.removeEventListener('click',     click, true);
    };
  }, [active]);

  // ── submit → worker API ───────────────────────────────────────────────────────
  const submit = React.useCallback(async () => {
    if (!picked || !comment.trim()) return;
    const token = localStorage.getItem(SESSION_KEY);
    setStatus({ type: 'loading', msg: 'Wird erstellt…' });
    try {
      const firstLine = comment.trim().split('\n')[0].slice(0, 72);
      const res = await fetch(`${workerUrl}/api/create-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          repo,
          title: `[${version}] ${firstLine}`,
          version,
          element: picked.selector,
          element_text: picked.text || '',
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');
      setStatus({ type: 'success', msg: `✓ Issue #${data.number} erstellt` });
      setTimeout(() => {
        setPicked(null); setComment(''); setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: `Fehler: ${err.message}` });
    }
  }, [picked, comment, version, repo, workerUrl]);

  if (!authChecked) return null;

  return (
    <>
      <style>{__FPK_STYLE}</style>

      {/* Auth badge / login button */}
      {user ? (
        <div data-fpk className="fpk-auth-badge" title="Ctrl+Klick auf ein Element um Feedback zu geben">
          <img src={user.avatar_url} alt={user.login} />
          <span>Angemeldet als <strong>{user.login}</strong></span>
        </div>
      ) : (
        <button data-fpk className="fpk-login-btn" onClick={login}>
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Mit GitHub anmelden
        </button>
      )}

      {/* Ctrl banner */}
      {active && (
        <div data-fpk className="fpk-hint-bar">
          🎯 Ctrl gedrückt — Element anklicken um Feedback zu hinterlassen
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
      {active && highlight && (
        <div data-fpk className="fpk-selector-bar">{highlight.selector}</div>
      )}

      {/* Comment modal */}
      {picked && (
        <div data-fpk className="fpk-backdrop" onClick={e => { if (e.target === e.currentTarget) { setPicked(null); setComment(''); setStatus(null); } }}>
          <div data-fpk className="fpk-modal">
            <div className="fpk-modal-hd">
              <strong>Kommentar hinterlassen</strong>
              <button onClick={() => { setPicked(null); setComment(''); setStatus(null); }}>✕</button>
            </div>
            <div className="fpk-meta">
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Version</span><code>{version}</code>
              </div>
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Element</span><code>{picked.selector}</code>
              </div>
              {picked.text && (
                <div className="fpk-meta-row">
                  <span className="fpk-meta-label">Text</span>
                  <span className="fpk-meta-text">"{picked.text}"</span>
                </div>
              )}
              <div className="fpk-meta-row">
                <span className="fpk-meta-label">Von</span><code>@{user.login}</code>
              </div>
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

// ── Auto-mount ────────────────────────────────────────────────────────────────
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
