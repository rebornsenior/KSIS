import { settings, noCache, stateCookie, validState, query, resultPage } from '../lib/cms-oauth.js';

export default async function handler(req, res) {
  noCache(res);
  if (req.method !== 'GET') return res.status(405).end();
  res.setHeader('Set-Cookie', stateCookie('', 0));
  let config;
  try { config = settings(); } catch { return res.status(503).end(); }
  const fail = () => resultPage(res, config.origin, {error:'로그인 설정 또는 KSIS 저장소 쓰기 권한을 확인해 주세요.'}, false);
  if (!config.clientId || !config.secret || !validState(req, query(req, 'state')) || !query(req, 'code') || query(req, 'error')) return fail();
  try {
    const exchange = await fetch('https://github.com/login/oauth/access_token', {
      method:'POST', headers:{Accept:'application/json', 'Content-Type':'application/json'},
      body:JSON.stringify({client_id:config.clientId,client_secret:config.secret,code:query(req,'code'),redirect_uri:config.callback}),
      signal:AbortSignal.timeout(15000),
    });
    if (!exchange.ok) return fail();
    const token = await exchange.json();
    if (!token.access_token || token.error) return fail();
    const access = await fetch('https://api.github.com/repos/rebornsenior/KSIS', {
      headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'KSIS-CMS'},
      signal:AbortSignal.timeout(15000),
    });
    if (!access.ok || !(await access.json()).permissions?.push) return fail();
    return resultPage(res, config.origin, {token:token.access_token,provider:'github'}, true);
  } catch { return fail(); }
}
