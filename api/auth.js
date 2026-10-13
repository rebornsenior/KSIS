import { settings, noCache, stateCookie, nonce, query } from '../lib/cms-oauth.js';

export default function handler(req, res) {
  noCache(res);
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const config = settings();
    if (!config.clientId || !config.secret) return res.status(503).send('GitHub 로그인 등록이 아직 완료되지 않았습니다.');
    if (query(req, 'provider') && query(req, 'provider') !== 'github') return res.status(400).end();
    const state = nonce();
    res.setHeader('Set-Cookie', stateCookie(state));
    const url = new URL('https://github.com/login/oauth/authorize');
    url.search = new URLSearchParams({client_id: config.clientId, redirect_uri: config.callback, scope:'public_repo', state}).toString();
    return res.redirect(302, url.href);
  } catch { return res.status(503).send('로그인 설정을 확인해 주세요.'); }
}
