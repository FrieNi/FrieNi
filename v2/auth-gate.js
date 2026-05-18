// auth-gate.js — plain JS, no Babel/JSX, runs synchronously
// Loaded as a normal <script> tag right after React CDN scripts.
// Hides the page, checks session, shows login screen or reveals app.

(function () {
  const SESSION_KEY = 'fpk_session';
  const workerUrl   = document.querySelector('meta[name="frieni-worker"]')?.content;
  if (!workerUrl) {
    // No worker configured — reveal and bail
    document.documentElement.style.visibility = '';
    return;
  }

  // ── Inject login screen CSS ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #__ag {
      position: fixed; inset: 0; z-index: 2147483647;
      background: #f9f8f6; visibility: visible;
      display: flex; align-items: center; justify-content: center;
      font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    #__ag .ag-card {
      display: flex; flex-direction: column; align-items: center;
      gap: 20px; text-align: center; padding: 20px;
      animation: ag-in .3s cubic-bezier(.3,.7,.4,1);
    }
    @keyframes ag-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: none; }
    }
    #__ag .ag-logo {
      font-size: 32px; font-weight: 700; letter-spacing: -.03em; color: #1a1a1a;
    }
    #__ag .ag-logo span { color: #2d6be4; }
    #__ag .ag-tagline { color: rgba(0,0,0,.4); font-size: 13px; margin-top: -12px; }
    #__ag .ag-btn {
      display: flex; align-items: center; gap: 10px;
      border: 1.5px solid rgba(0,0,0,.15); border-radius: 10px;
      background: #fff; padding: 12px 22px;
      font: 600 14px/1 ui-sans-serif,system-ui,sans-serif; color: #1a1a1a;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.08);
      transition: box-shadow .15s, transform .1s;
      text-decoration: none;
    }
    #__ag .ag-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,.14); transform: translateY(-1px); }
    #__ag .ag-note { font-size: 12px; color: rgba(0,0,0,.35); max-width: 280px; }
    #__ag .ag-spinner {
      width: 26px; height: 26px;
      border: 2.5px solid rgba(0,0,0,.1); border-top-color: #2d6be4;
      border-radius: 50%; animation: ag-spin .7s linear infinite;
    }
    @keyframes ag-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  // ── Build overlay ────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__ag';
  overlay.innerHTML = '<div class="ag-spinner"></div>';

  // Insert overlay as soon as body exists (may be called before DOMContentLoaded)
  function mountOverlay() {
    if (!document.body) return;
    document.body.prepend(overlay);
  }
  if (document.body) mountOverlay();
  else document.addEventListener('DOMContentLoaded', mountOverlay);

  // ── Show login card ──────────────────────────────────────────────────────
  function showLogin() {
    const returnTo = encodeURIComponent(window.location.href.split('#')[0]);
    const loginUrl = `${workerUrl}/auth/login?return_to=${returnTo}`;
    overlay.innerHTML = `
      <div class="ag-card">
        <div class="ag-logo">Frie<span>Ni</span></div>
        <div class="ag-tagline">AI-native trading workspace</div>
        <a class="ag-btn" href="${loginUrl}">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
              1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56
              .82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07
              -.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Mit GitHub anmelden
        </a>
        <div class="ag-note">Nur Mitglieder der FrieNi-Organisation haben Zugang.</div>
      </div>
    `;
  }

  // ── Reveal app ───────────────────────────────────────────────────────────
  function revealApp(user) {
    window.FpkUser  = user;
    window.FpkToken = localStorage.getItem(SESSION_KEY);
    overlay.remove();
    document.documentElement.style.visibility = '';
    // Notify any components that are waiting for auth to complete
    window.dispatchEvent(new CustomEvent('fpk:user-ready', { detail: user }));
  }

  // ── Check session ────────────────────────────────────────────────────────
  // Grab token from URL fragment after OAuth redirect
  var hash  = window.location.hash;
  var match = hash.match(/fpk_session=([a-f0-9]+)/);
  if (match) {
    localStorage.setItem(SESSION_KEY, match[1]);
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  var token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    // No session at all — show login immediately
    if (document.body) showLogin();
    else document.addEventListener('DOMContentLoaded', showLogin);
    return;
  }

  // Verify session with worker
  fetch(workerUrl + '/auth/me', {
    headers: { Authorization: 'Bearer ' + token },
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.login) {
        revealApp(data);
      } else {
        localStorage.removeItem(SESSION_KEY);
        showLogin();
      }
    })
    .catch(function () { showLogin(); });

})();