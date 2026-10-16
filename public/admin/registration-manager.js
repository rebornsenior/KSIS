(() => {
  'use strict';
  if (!['http://127.0.0.1:3004','http://localhost:3004','https://www.rebornsenior.com'].includes(location.origin)) {
    document.body.textContent = '공식 관리자 도메인에서 이용해 주세요.';
    return;
  }
  const eventId = new URLSearchParams(location.search).get('event') || '';
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(eventId)) {document.body.textContent='올바른 일정 연결이 아닙니다.';return;}
  let eventTitle='이 일정';
  document.querySelector('h1').textContent=eventTitle+' · 신청 명단';

  const connect = document.querySelector('#connect');
  const disconnect = document.querySelector('#disconnect');
  const status = document.querySelector('#status');
  const table = document.querySelector('table');
  const body = document.querySelector('tbody');
  let generation = 0;
  const clear = () => { body.replaceChildren(); table.hidden = true; };
  window.addEventListener('pagehide',()=>{generation++;clear();});
  disconnect.onclick = () => {
    generation++;
    clear();
    status.textContent = '연결을 해제하고 화면의 명단을 지웠습니다.';
    connect.disabled = false;
    disconnect.disabled = true;
  };
  connect.disabled = true;
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onerror = () => { status.textContent = '구글 로그인 도구를 불러오지 못했습니다. 새로고침해 주세요.'; };
  script.onload = () => {
    connect.disabled = false;
    const authorize = (request = {action: 'list', eventId}) => {
      const current = ++generation;
      clear();
      connect.disabled = true;
      disconnect.disabled = false;
      status.textContent = '구글 로그인 창에서 계정을 확인해 주세요.';
      const fail = message => {
        if (current !== generation) return;
        clear(); status.textContent = message; connect.disabled = false;
      };
      const client = google.accounts.oauth2.initTokenClient({
        client_id: '192319107390-go7k54150oq8g3k2pr5v4enh7g4rfpms.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/userinfo.email',
        error_callback: () => fail('로그인 창이 닫혔거나 열리지 않았습니다. 다시 연결해 주세요.'),
        callback: async token => {
          if (current !== generation) return;
          if (token.error || !token.access_token) { fail('로그인을 완료하지 못했습니다. 다시 연결해 주세요.'); return; }
          status.textContent = '구글 폼에서 실제 응답을 불러오고 있습니다.';
          try {
            const response = await fetch('https://script.googleapis.com/v1/scripts/AKfycbzY5SuG65FqgonF8sFzCGTvRyuuiU85hVjhM0uUShDvjWf50TejSzMtmYEWob3DxQBH7w:run', {
              method: 'POST', cache: 'no-store', credentials: 'omit',
              headers: {Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json'},
              body: JSON.stringify({function: 'ksisRegistration', parameters: [request]})
            });
            const result = await response.json();
            if (current !== generation) return;
            if (!response.ok || result.error) {
              const code = result.error?.details?.[0]?.errorMessage || result.error?.status || 'UNKNOWN_ERROR';
              const known = ['NOT_CONFIGURED','EVENT_NOT_CONFIGURED','INVALID_EVENT_CONFIG','FORBIDDEN','SIGN_IN_REQUIRED','PERMISSION_DENIED','UNAUTHENTICATED','NOT_FOUND'];
              const safeCode = known.find(value => String(code).includes(value)) || '연결 설정 확인 필요';
              fail('요청을 완료하지 못했습니다. 오류: ' + safeCode + ' · 명단을 다시 조회해 주세요.'); return;
            }
            const data = result.response?.result;
            if (request.action === 'delete') {
              if (data?.deleted !== true || data.eventId !== request.eventId || data.responseId !== request.responseId) {
                fail('삭제 결과를 확인할 수 없습니다. 명단을 다시 조회해 주세요.'); return;
              }
              clear();
              status.textContent = '구글 폼 응답 삭제 확인 완료. 명단 불러오기를 눌러 다시 확인해 주세요.';
              connect.disabled = false;
              return;
            }
            if (data?.eventId !== eventId || !Array.isArray(data.records) || data.records.some(row => row.eventId !== data.eventId)) {
              fail('응답 형식을 확인할 수 없습니다. 명단을 표시하지 않았습니다.'); return;
            }
            eventTitle=data.title || eventTitle;
            document.querySelector('h1').textContent=eventTitle+' · 신청 명단';
            for (const row of data.records) {
              const tr = document.createElement('tr');
              for (const key of ['name','phone','payer','submittedAt']) {
                const td = document.createElement('td'); td.textContent = String(row[key] || ''); tr.append(td);
              }
              const action = document.createElement('td');
              const cancel = document.createElement('button');
              cancel.textContent = '신청 취소';
              cancel.onclick = () => {
                if (current !== generation || connect.disabled) return;
                if (!window.confirm(eventTitle+'\n신청자: ' + row.name + '\n신청 시각: ' + row.submittedAt + '\n\n이 신청자의 구글 폼 응답을 영구 삭제합니다. 복구할 수 없습니다. 삭제할까요?')) return;
                authorize({action: 'delete',eventId,responseId: row.id,expectedName: row.name,expectedSubmittedAt: row.submittedAt,confirmDelete: true});
              };
              action.append(cancel); tr.append(action);
              body.append(tr);
            }
            table.hidden = false;
            status.textContent = '실제 응답 연결 완료 · ' + data.records.length + '명';
            connect.disabled = false;
          } catch { fail('네트워크 연결에 실패했습니다. 다시 연결해 주세요.'); }
          finally { token.access_token = ''; }
        }
      });
      client.requestAccessToken({prompt: 'select_account'});
    };
    connect.onclick = () => authorize();
  };
  document.head.append(script);
})();
