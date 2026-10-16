/* OAuth credentials stay in this page's memory, never in CMS data or storage. */
window.KSISRegistration = (() => {
  const allowed=['http://127.0.0.1:3004','http://localhost:3004','https://www.rebornsenior.com'].includes(location.origin);
  let loading,credential=null,pending=null;
  function load() {
    if(!allowed) return Promise.reject(new Error('UNSUPPORTED_ORIGIN'));
    if(window.google?.accounts?.oauth2) return Promise.resolve();
    if(!loading) loading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';
      const timer=setTimeout(()=>{loading=null;reject(new Error('GOOGLE_LOAD_FAILED'));},15000);
      script.onload=()=>{clearTimeout(timer);resolve();};
      script.onerror=()=>{clearTimeout(timer);loading=null;reject(new Error('GOOGLE_LOAD_FAILED'));};
      document.head.append(script);
    });
    return loading;
  }
  function authorize() {
    if(!allowed) return Promise.reject(new Error('UNSUPPORTED_ORIGIN'));
    if(credential && credential.until>Date.now()+60000) return Promise.resolve();
    if(pending) return pending;
    // Do not defer opening a popup until after a network request. The separate
    // connect button lets the browser retain the user's activation gesture.
    if(!window.google?.accounts?.oauth2) return load().then(()=>{throw new Error('GOOGLE_NOT_READY');});
    pending=new Promise((resolve,reject)=>{
      let finished=false;
      const timer=setTimeout(()=>finish(new Error('LOGIN_TIMEOUT')),90000);
      function finish(error) {if(finished)return;finished=true;clearTimeout(timer);error?reject(error):resolve();}
      const client=window.google.accounts.oauth2.initTokenClient({
        client_id:'192319107390-go7k54150oq8g3k2pr5v4enh7g4rfpms.apps.googleusercontent.com',
        scope:'https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/userinfo.email',
        error_callback:error=>finish(new Error(error?.type==='popup_failed_to_open'?'POPUP_BLOCKED':'LOGIN_CANCELLED')),
        callback:token=>{
          if(finished) {token.access_token='';return;}
          if(token.error || !token.access_token) {finish(new Error('LOGIN_CANCELLED'));return;}
          credential={token:token.access_token,until:Date.now()+Math.min(Number(token.expires_in)||300,3600)*1000};
          token.access_token='';finish();
        }
      });
      try {client.requestAccessToken({prompt:'select_account'});} catch {finish(new Error('POPUP_BLOCKED'));}
    }).finally(()=>{pending=null;});
    return pending;
  }
  async function call(request) {
    await authorize();
    const response=await fetch('https://script.googleapis.com/v1/scripts/AKfycbzY5SuG65FqgonF8sFzCGTvRyuuiU85hVjhM0uUShDvjWf50TejSzMtmYEWob3DxQBH7w:run',{
      method:'POST',credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(90000),
      headers:{Authorization:'Bearer '+credential.token,'Content-Type':'application/json'},
      body:JSON.stringify({function:'ksisRegistration',parameters:[request]})
    });
    const result=await response.json();
    if(!response.ok || result.error) {
      if(response.status===401) credential=null;
      const message=String(result.error?.details?.[0]?.errorMessage || result.error?.status || 'CONNECTION_FAILED');
      const codes=['AUTOMATION_NOT_CONFIGURED','INVALID_ACTION','FORBIDDEN','EVENT_YEAR_CHANGED','EVENT_LABEL_CONFLICT','INVALID_EVENT_DATE','INVALID_EVENT_TITLE','PERMISSION_DENIED','UNAUTHENTICATED','NOT_FOUND'];
      throw new Error(codes.find(code=>message.includes(code)) || 'CONNECTION_FAILED');
    }
    return result.response?.result;
  }
  if(allowed) load().catch(()=>{});
  return {call,connect:authorize};
})();
