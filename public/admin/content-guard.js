/* Best-effort duplicate check; this is not an atomic multi-user edit lock. */
window.KSISContentGuard = (() => {
  const groups = new Set(['forum', 'education', 'foodculture', 'bookclub', 'local']);
  const normalize = value => String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  const day = value => String(value || '').replace(/[.-]/g, '').slice(0, 8);
  async function request(path) {
    let user;
    try { user = JSON.parse(localStorage.getItem('decap-cms-user') || 'null'); } catch { /* Fail closed below. */ }
    if (!user?.token) throw new Error('로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요.');
    const response = await fetch('https://api.github.com/repos/rebornsenior/KSIS/' + path, {
      headers: {Authorization: 'Bearer ' + user.token, Accept: 'application/vnd.github+json'},
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('중복 글 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    return response.json();
  }
  async function pages(path) {
    const result = [];
    for (let page = 1; ; page++) {
      const batch = await request(path + (path.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
      result.push(...batch);
      if (batch.length < 100) return result;
    }
  }
  async function check({entry}) {
    const collection = entry.get('collection');
    if (!groups.has(collection)) return entry.get('data');
    const data = entry.get('data').toJS();
    const selfPath = entry.get('newRecord') ? null : entry.get('path');
    const root = 'src/content/' + collection + '/';
    const pulls = await pages('pulls?state=open');
    const refs = ['main', ...new Set(pulls.filter(p => p.head.ref.startsWith('cms/' + collection + '/')).map(p => p.head.ref))];
    const checkedBlobs = new Set();
    for (const ref of refs) {
      const tree = await request('git/trees/' + encodeURIComponent(ref) + '?recursive=1');
      if (tree.truncated) throw new Error('전체 글 목록을 확인하지 못했습니다. 저장을 중단합니다.');
      for (const file of tree.tree.filter(f => f.type === 'blob' && f.path.startsWith(root) && f.path.endsWith('.json'))) {
        if (file.path === selfPath) continue;
        if (checkedBlobs.has(file.sha)) continue;
        checkedBlobs.add(file.sha);
        const blob = await request('git/blobs/' + file.sha);
        const bytes = Uint8Array.from(atob(blob.content.replace(/\s/g, '')), c => c.charCodeAt(0));
        const existing = JSON.parse(new TextDecoder().decode(bytes));
        if (normalize(existing.name) === normalize(data.name) && day(existing.date) === day(data.date)) {
          throw new Error('같은 날짜와 제목의 글이 이미 있습니다(게시글 또는 초안). 날짜 또는 제목을 변경해 주세요.');
        }
      }
    }
    return entry.get('data');
  }
  async function checkWithNotice(args) {
    try {
      return await check(args);
    } catch (error) {
      // Decap wraps event errors in an object, hiding Error.message in its toast.
      window.alert(error?.message || '중복 글 확인에 실패했습니다. 저장되지 않았습니다.');
      throw error;
    }
  }
  return {check: checkWithNotice};
})();
