/* Google access tokens stay in memory and are never written to CMS data. */
window.KSISRegistration = (() => {
  const allowed = ['http://127.0.0.1:3004','http://localhost:3004','https://www.rebornsenior.com'].includes(location.origin);
  let loading;
  function load() {
    if (!allowed) return Promise.reject(new Error('UNSUPPORTED_ORIGIN'));
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (!loading) loading = new Promise((resolve,reject)=>{
      const script=document.createElement('script'); script.src='https://accounts.google.com/gsi/client';
      script.onload=resolve; script.onerror=()=>{loading=null;reject(new Error('GOOGLE_LOAD_FAILED'));}; document.head.append(script);
    });
    return loading;
  }
  async function call(request) {
    await load();
    return new Promise((resolve,reject)=>{
      const client=google.accounts.oauth2.initTokenClient({
        client_id:'192319107390-go7k54150oq8g3k2pr5v4enh7g4rfpms.apps.googleusercontent.com',
        scope:'https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/userinfo.email',
        error_callback:()=>reject(new Error('LOGIN_CANCELLED')),
        callback:async token=>{
          try {
            if(token.error || !token.access_token) throw new Error('LOGIN_CANCELLED');
            const response=await fetch('https://script.googleapis.com/v1/scripts/AKfycbzY5SuG65FqgonF8sFzCGTvRyuuiU85hVjhM0uUShDvjWf50TejSzMtmYEWob3DxQBH7w:run',{
              method:'POST',credentials:'omit',cache:'no-store',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},
              body:JSON.stringify({function:'ksisRegistration',parameters:[request]})
            });
            const result=await response.json();
            if(!response.ok || result.error) {
              const message=String(result.error?.details?.[0]?.errorMessage || result.error?.status || 'CONNECTION_FAILED');
              const codes=['AUTOMATION_NOT_CONFIGURED','INVALID_ACTION','FORBIDDEN','EVENT_YEAR_CHANGED','EVENT_LABEL_CONFLICT','INVALID_EVENT_DATE','INVALID_EVENT_TITLE','PERMISSION_DENIED','UNAUTHENTICATED','NOT_FOUND'];
              throw new Error(codes.find(code=>message.includes(code)) || 'CONNECTION_FAILED');
            }
            resolve(result.response?.result);
          } catch(error) { reject(error); }
          finally { token.access_token=''; }
        }
      });
      client.requestAccessToken({prompt:'select_account'});
    });
  }
  if(allowed) load().catch(()=>{});
  return {call};
})();
