// FrieNi Auth Worker — Service Worker format (paste into CF dashboard)
//
// Secrets to set in CF dashboard → Worker Settings → Variables → Secrets:
//   GH_CLIENT_ID      — GitHub OAuth App client ID
//   GH_CLIENT_SECRET  — GitHub OAuth App client secret
//   GH_ORG            — GitHub org that must contain the user, e.g. "FrieNi"
//   SESSION_SECRET    — any random string (openssl rand -hex 32)
//
// KV binding: Settings → Variables → KV Namespace Bindings
//   Variable name: SESSIONS  →  Namespace: FRIENI_SESSIONS

const ALLOWED_ORIGINS = [
  'https://frieni.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

// ── entry point ───────────────────────────────────────────────────────────────

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return corsResponse(request, null, 204);

  if (url.pathname === '/auth/login')        return handleLogin(request, url);
  if (url.pathname === '/auth/callback')     return handleCallback(request, url);
  if (url.pathname === '/auth/me')           return handleMe(request);
  if (url.pathname === '/api/create-issue' &&
      request.method === 'POST')             return handleCreateIssue(request);

  return new Response('Not found', { status: 404 });
}

// ── /auth/login ───────────────────────────────────────────────────────────────

async function handleLogin(request, url) {
  const returnTo = url.searchParams.get('return_to') || 'https://frieni.github.io/FrieNi/';
  const state = btoa(returnTo).replace(/=/g, '');
  const params = new URLSearchParams({
    client_id: GH_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/callback`,
    scope: 'read:org',
    state,
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}

// ── /auth/callback ────────────────────────────────────────────────────────────

async function handleCallback(request, url) {
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state') || '';
  if (!code) return new Response('Missing code', { status: 400 });

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: GH_CLIENT_ID,
      client_secret: GH_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/auth/callback`,
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    return new Response(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
  }

  const ghToken = tokenData.access_token;
  const user = await getGhUser(ghToken);
  if (!user) return new Response('Could not fetch GitHub user', { status: 400 });

  // Check org membership
  const member = await isOrgMember(ghToken, GH_ORG, user.login);
  if (!member) {
    return new Response(
      `<html><body style="font:16px system-ui;max-width:420px;margin:80px auto;text-align:center;padding:0 20px">
        <h2>Access denied</h2>
        <p><strong>${user.login}</strong> is not a member of the <strong>${GH_ORG}</strong> GitHub org.</p>
        <p style="color:#888;font-size:14px">Ask an org admin to add you, then try again.</p>
        <a href="https://frieni.github.io/FrieNi/" style="font-size:14px">← Back</a>
      </body></html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Create session in KV
  const sessionId = await randomHex(32);
  await SESSIONS.put(sessionId, JSON.stringify({
    ghToken,
    login: user.login,
    avatar_url: user.avatar_url,
    name: user.name || user.login,
    created: Date.now(),
  }), { expirationTtl: SESSION_TTL });

  // Decode return URL from state
  let returnTo = 'https://frieni.github.io/FrieNi/';
  try {
    const pad = state.length % 4 ? '=='.slice(0, 4 - (state.length % 4)) : '';
    returnTo = atob(state + pad);
  } catch (_) {}

  return Response.redirect(`${returnTo}#fpk_session=${sessionId}`, 302);
}

// ── /auth/me ──────────────────────────────────────────────────────────────────

async function handleMe(request) {
  const session = await getSession(request);
  if (!session) return jsonResponse(request, { error: 'unauthenticated' }, 401);
  return jsonResponse(request, {
    login: session.login,
    avatar_url: session.avatar_url,
    name: session.name,
  });
}

// ── /api/create-issue ─────────────────────────────────────────────────────────

async function handleCreateIssue(request) {
  const session = await getSession(request);
  if (!session) return jsonResponse(request, { error: 'unauthenticated' }, 401);

  // Re-check org membership (catches revoked access)
  const still = await isOrgMember(session.ghToken, GH_ORG, session.login);
  if (!still) return jsonResponse(request, { error: 'not_org_member' }, 403);

  let body;
  try { body = await request.json(); }
  catch { return jsonResponse(request, { error: 'invalid_json' }, 400); }

  const { repo, title, version, element, element_text, comment } = body;
  if (!title || !comment) return jsonResponse(request, { error: 'missing_fields' }, 400);

  const issueBody = [
    `**App version:** \`${version || 'unknown'}\``,
    `**Element:** \`${element || 'n/a'}\``,
    element_text ? `**Visible text:** "${element_text}"` : null,
    `**Reporter:** @${session.login}`,
    '',
    '---',
    '',
    '**Comment:**',
    comment.trim(),
  ].filter(s => s !== null).join('\n');

  const targetRepo = repo || `${GH_ORG}/FrieNi`;
  const issueRes = await ghFetch(`/repos/${targetRepo}/issues`, session.ghToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body: issueBody, labels: ['feedback'] }),
  });

  if (!issueRes.ok) {
    const err = await issueRes.json().catch(() => ({}));
    return jsonResponse(request, { error: 'github_error', detail: err.message }, 502);
  }

  const issue = await issueRes.json();
  return jsonResponse(request, { url: issue.html_url, number: issue.number });
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function getSession(request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const raw = await SESSIONS.get(token);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function getGhUser(token) {
  const r = await ghFetch('/user', token);
  return r.ok ? r.json() : null;
}

async function isOrgMember(token, org, login) {
  const r = await ghFetch(`/orgs/${org}/members/${login}`, token);
  if (r.status === 204) return true;
  const r2 = await ghFetch(`/user/memberships/orgs/${org}`, token);
  if (r2.ok) {
    const d = await r2.json();
    return d.state === 'active';
  }
  return false;
}

async function ghFetch(path, token, opts = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'FrieNi-Auth-Worker/1.0',
      ...(opts.headers || {}),
    },
  });
}

async function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

function corsResponse(request, body, status = 200) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

function jsonResponse(request, data, status = 200) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
