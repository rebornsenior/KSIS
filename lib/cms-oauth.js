import { randomBytes, timingSafeEqual } from 'node:crypto';

export const COOKIE = '__Host-ksis-oauth-state';
export function settings() {
  const origin = new URL(process.env.CMS_SITE_URL || 'https://www.rebornsenior.com').origin;
  if (!origin.startsWith('https://')) throw new Error('HTTPS is required');
  return { origin, clientId: process.env.GITHUB_OAUTH_CLIENT_ID, secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
    callback: `${origin}/api/callback` };
}
export function noCache(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}
export function stateCookie(value, maxAge = 600) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function validState(req, value) {
  const cookies = String(req.headers.cookie || '').split(';').map(v => v.trim());
  const saved = cookies.find(v => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!saved || !value || !/^[a-f0-9]{64}$/.test(saved) || !/^[a-f0-9]{64}$/.test(value)) return false;
  return timingSafeEqual(Buffer.from(saved), Buffer.from(value));
}
export function nonce() { return randomBytes(32).toString('hex'); }
export function query(req, key) {
  const value = req.query?.[key];
  return typeof value === 'string' ? value : '';
}
export function resultPage(res, origin, payload, success) {
  const scriptNonce = nonce();
  const message = JSON.stringify(`authorization:github:${success ? 'success' : 'error'}:${JSON.stringify(payload)}`).replaceAll('<', '\\u003c');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${scriptNonce}'; base-uri 'none'; frame-ancestors 'none'`);
  return res.status(success ? 200 : 403).send(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>KSIS GitHub 로그인</title><p>${success ? '로그인 확인 완료. 관리자 화면으로 돌아가세요.' : '로그인하지 못했습니다. 계정 권한과 설정을 확인한 뒤 다시 시도해 주세요.'}</p><script nonce="${scriptNonce}">
const origin=${JSON.stringify(origin)};
const opener=window.opener;
if(opener){
  function receive(event){
    if(event.origin!==origin || event.source!==opener || event.data!=='authorizing:github')return;
    window.removeEventListener('message',receive);
    opener.postMessage(${message},origin);
    window.close();
  }
  window.addEventListener('message',receive);
  opener.postMessage('authorizing:github',origin);
}
</script></html>`);
}
