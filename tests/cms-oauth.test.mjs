import test from 'node:test';
import assert from 'node:assert/strict';
import auth from '../api/auth.js';
import callback from '../api/callback.js';
import {COOKIE} from '../lib/cms-oauth.js';

function response() {
  return {headers:{},code:200,setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},
    send(v){this.body=v;return this;},end(){return this;},redirect(n,v){this.code=n;this.location=v;return this;}};
}
test('OAuth setup, state protection and repository access', async () => {
  const originalFetch = globalThis.fetch;
  const names = ['GITHUB_OAUTH_CLIENT_ID','GITHUB_OAUTH_CLIENT_SECRET','CMS_SITE_URL'];
  const original = names.map(n => process.env[n]);
  try {
    delete process.env.GITHUB_OAUTH_CLIENT_ID;
    delete process.env.GITHUB_OAUTH_CLIENT_SECRET;
    process.env.CMS_SITE_URL='https://www.rebornsenior.com';
    let res=response(); auth({method:'GET',query:{},headers:{}},res);
    assert.equal(res.code,503);
    process.env.GITHUB_OAUTH_CLIENT_ID='test-client';
    process.env.GITHUB_OAUTH_CLIENT_SECRET='test-secret';
    res=response(); auth({method:'GET',query:{provider:'github'},headers:{}},res);
    assert.equal(res.code,302);
    const url=new URL(res.location), state=url.searchParams.get('state');
    assert.equal(url.searchParams.get('scope'),'public_repo');
    assert.equal(url.searchParams.get('redirect_uri'),'https://www.rebornsenior.com/api/callback');
    assert.match(res.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax/);
    let calls=0;
    globalThis.fetch=async () => {calls++; throw new Error('Unexpected fetch');};
    res=response(); await callback({method:'GET',query:{code:'code',state},headers:{}},res);
    assert.equal(res.code,403); assert.equal(calls,0);
    const req={method:'GET',query:{code:'code',state},headers:{cookie:`${COOKIE}=${state}`}};
    globalThis.fetch=async input => input.includes('access_token')
      ? {ok:true,json:async()=>({access_token:'test-token'})}
      : {ok:true,json:async()=>({permissions:{push:false}})};
    res=response(); await callback(req,res); assert.equal(res.code,403);
    assert.ok(!res.body.includes('test-token'));
    globalThis.fetch=async input => input.includes('access_token')
      ? {ok:true,json:async()=>({access_token:'test-token'})}
      : {ok:true,json:async()=>({permissions:{push:true}})};
    res=response(); await callback(req,res); assert.equal(res.code,200);
    assert.ok(res.body.includes('authorization:github:success:'));
    assert.ok(res.body.includes('event.origin!==origin'));
    assert.ok(!res.body.includes('test-secret'));
    assert.equal(res.headers['Cache-Control'],'no-store');
  } finally {
    globalThis.fetch=originalFetch;
    names.forEach((n,i) => original[i] === undefined ? delete process.env[n] : process.env[n]=original[i]);
  }
});
