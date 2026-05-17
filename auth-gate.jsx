// auth-gate.jsx
// Loaded BEFORE the app scripts. Hides the page until session is verified.
// If not authenticated → shows a login screen instead of the app.
// If authenticated → sets window.FpkUser and reveals the page.
//
// Requires: <meta name="frieni-worker" content="https://...workers.dev">
//           React + ReactDOM already loaded above this script

const __AG_STYLE = `
  .ag-screen {
    position: fixed; inset: 0; z-index: 2147483647;
    background: #f9f8f6;
    display: flex; align-items: center; justify-content: center;
    font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
    visibility: visible !important;
  }

  .ag-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; text-align: center; padding: 20px;
    animation: ag-in .3s cubic-bezier(.3,.7,.4,1);
  }
  @keyframes ag-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }

  .ag-logo {
    font-size: 28px; font-weight: 700; letter-spacing: -.03em;
    color: #1a1a1a;
  }
  .ag-logo span { color: #2d6be4; }

  .ag-tagline {
    color: rgba(0,0,0,.45); font-size: 13px; margin-top: -12px;
  }

  .ag-btn {
    display: flex; align-items: center; gap: 10px;
    appearance: none; border: 1.5px solid rgba(0,0,0,.15); border-radius: 10px;
    background: #fff; padding: 11px 20px;
    font: 600 14px/1 ui-sans-serif,system-ui,sans-serif; color: #1a1a1a;
    cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.08);
    transition: box-shadow .15s, transform .1s;
  }
  .ag-btn:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,.13);
    transform: translateY(-1px);
  }
  .ag-btn svg { width: 18px; height: 18px; }

  .ag-note {
    font-size: 12px; color: rgba(0,0,0,.35); max-width: 280px;
  }

  .ag-spinner {
    width: 24px; height: 24px;
    border: 2px solid rgba(0,0,0,.1);
    border-top-color: #2d6be4;
    border-radius: 50%;
    animation: ag-spin .7s linear infinite;
  }
  @keyframes ag-spin { to { transform: rotate(360deg); } }
`;

const SESSION_KEY = 'fpk_session';

function AuthGate({ workerUrl, onAuth }) {
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // Grab session from URL fragment after OAuth redirect
    const hash = window.location.hash;
    const match = hash.match(/fpk_session=([a-f0-9]+)/);
    if (match) {
      localStorage.setItem(SESSION_KEY, match[1]);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const token = localStorage.getItem(SESSION_KEY);
    if (!token) { setChecking(false); return; }

    fetch(`${workerUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.login) {
          window.FpkUser   = data;
          window.FpkToken  = token;
          onAuth(data);
        } else {
          localStorage.removeItem(SESSION_KEY);
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, []);

  const login = () => {
    const returnTo = window.location.href.split('#')[0];
    window.location.href = `${workerUrl}/auth/login?return_to=${encodeURIComponent(returnTo)}`;
  };

  if (checking) {
    return (
      <div className="ag-screen">
        <style>{__AG_STYLE}</style>
        <div className="ag-spinner" />
      </div>
    );
  }

  return (
    <div className="ag-screen">
      <style>{__AG_STYLE}</style>
      <div className="ag-card">
        <div className="ag-logo">Frie<span>Ni</span></div>
        <div className="ag-tagline">AI-native trading workspace</div>
        <button className="ag-btn" onClick={login}>
          <svg viewBox="0 0 16 16" fill="currentColor">
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
        </button>
        <div class="ag-note">
          Nur Mitglieder der FrieNi-Organisation haben Zugang.
        </div>
      </div>
    </div>
  );
}

// ── bootstrap ─────────────────────────────────────────────────────────────────
(function () {
  const workerUrl = document.querySelector('meta[name="frieni-worker"]')?.content;
  if (!workerUrl) return; // no worker configured — don't gate

  // Hide page immediately to avoid flash of unstyled app
  document.documentElement.classList.add('fpk-hidden');

  const gateRoot = document.createElement('div');
  gateRoot.id = '__ag_root';
  // Insert before #root so it renders on top during check
  document.addEventListener('DOMContentLoaded', () => {
    document.body.prepend(gateRoot);
    ReactDOM.createRoot(gateRoot).render(
      React.createElement(AuthGate, {
        workerUrl,
        onAuth: (user) => {
          // Auth confirmed — reveal the page and remove gate
          document.documentElement.style.visibility = '';
          gateRoot.remove();
        },
      })
    );
  });
})();