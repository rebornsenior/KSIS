/* Number the visible rows, independently of Decap's active sorting. */
(() => {
  const marker = '⟦KSIS⟧';
  const dateLabel = value => {
    if (/^\d{4}[.-]\d{2}[.-]\d{2}$/.test(value.trim())) return value.trim().replace(/-/g, '.');
    const date = new Date(value.trim());
    return Number.isNaN(date.getTime()) ? '기록 없음' : new Intl.DateTimeFormat('ko-KR', {
      timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,
    }).format(date);
  };
  function groupCollections() {
    const groups = [
      ['PROJECT', ['forum','foodculture','bookclub','local','education','shopping']],
      ['CALENDAR', ['calendar']],
      ['BOARD', ['gallery','notices','insights']],
    ];
    const links = [...document.querySelectorAll('a[href]')];
    for (const [label, collections] of groups) {
      const first = links.find(link => {
        const hash = new URL(link.href, location.href).hash;
        return collections.some(name => hash === '#/collections/' + name) && link.getClientRects().length;
      });
      let heading = document.querySelector('[data-ksis-group="' + label + '"]');
      if (!first) { heading?.remove(); continue; }
      const row = first.closest('li') || first;
      if (!heading) {
        heading = document.createElement(row.tagName === 'LI' ? 'li' : 'div');
        heading.dataset.ksisGroup = label;
        heading.setAttribute('role', 'heading');
        heading.setAttribute('aria-level', '3');
        heading.textContent = label;
        heading.style.cssText = 'list-style:none;padding:16px 16px 6px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;pointer-events:none';
      }
      if (row.previousElementSibling !== heading) row.before(heading);
    }
  }
  function render() {
    groupCollections();
    // The settings collection remains available to Decap's relation field, but is managed from shopping.
    for (const link of document.querySelectorAll('a[href]')) {
      if (new URL(link.href, location.href).hash === '#/collections/member_filters') {
        const row = link.closest('li') || link;
        row.hidden = true;
        row.style.display = 'none';
      }
    }
    if (location.hash === '#/collections/member_filters' && window.top === window) {
      location.replace('#/collections/shopping');
      return;
    }
    if (location.hash === '#/collections/shopping') {
      const heading = [...document.querySelectorAll('h1')].find(el => el.textContent.trim() === '회원사 소개');
      if (heading && !document.querySelector('[data-member-filter-settings]')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.memberFilterSettings = '';
        button.textContent = '분류 관리';
        button.style.cssText = 'display:inline-block;margin:12px 0;color:#2563eb;font-size:14px;border:0;background:transparent;cursor:pointer';
        button.onclick = () => {
          const dialog = document.createElement('dialog');
          dialog.setAttribute('aria-label', '회원사 분류 관리');
          dialog.style.cssText = 'width:min(1100px,94vw);height:88vh;max-height:94vh;padding:0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden';
          const bar = document.createElement('div');
          bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #e2e8f0;background:white';
          const title = document.createElement('strong');
          title.textContent = '분류 관리';
          const close = document.createElement('button');
          close.type = 'button';
          close.textContent = '닫기';
          close.style.cssText = 'padding:8px 16px;cursor:pointer';
          close.onclick = () => dialog.close();
          bar.append(title, close);
          const frame = document.createElement('iframe');
          frame.title = '회원사 분류 편집';
          const url = new URL(location.href);
          url.searchParams.set('memberFilterEditor', '1');
          url.hash = '#/collections/member_filters/entries/filters';
          frame.src = url.href;
          frame.style.cssText = 'width:100%;height:calc(100% - 65px);border:0';
          dialog.append(bar, frame);
          dialog.addEventListener('close', () => { dialog.remove(); location.reload(); });
          document.body.append(dialog);
          dialog.showModal();
        };
        heading.after(button);
      }
    }
    const match = location.hash.match(/^#\/collections\/([^/?]+)\/?(?:\?.*)?$/);
    if (!match || match[1] === 'calendar') return;
    const prefix = '#/collections/' + match[1] + '/entries/';
    const links = [...document.querySelectorAll('a[href]')].filter(link => {
      const hash = new URL(link.href, location.href).hash;
      return hash.startsWith(prefix) && link.getClientRects().length;
    });
    links.forEach((link, index) => {
      let number = link.querySelector('[data-ksis-number]');
      if (!number) {
        number = document.createElement('span');
        number.dataset.ksisNumber = '';
        number.style.cssText = 'margin-right:12px;flex-shrink:0;font-variant-numeric:tabular-nums';
        link.prepend(number);
      }
      const label = String(index + 1) + '.';
      if (number.textContent !== label) number.textContent = label;
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.includes(marker)) continue;
        const [title, updatedAt = '', cmsAuthor = '', publishedDate = '', specialty = '', author = ''] = node.textContent.split(marker);
        const row = document.createElement('span');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;min-width:0;flex-wrap:wrap';
        const heading = document.createElement('span');
        heading.textContent = title.trim();
        const metadata = document.createElement('span');
        metadata.style.cssText = 'margin-left:auto;font-size:12px;font-weight:normal;color:#64748b';
        const displayAuthor = specialty.trim() || author.trim() || cmsAuthor.trim() || '미등록';
        metadata.textContent = match[1] === 'shopping'
          ? '대표명: ' + (updatedAt.trim() || '미등록')
          : (updatedAt.trim() ? '작성·수정일: ' + dateLabel(updatedAt) : '게시일: ' + (publishedDate.trim() ? dateLabel(publishedDate) : '미등록')) + ' · 작성자: ' + displayAuthor;
        row.append(heading, metadata);
        node.replaceWith(row);
        break;
      }
    });
  }
  const observer = new MutationObserver(() => {
    observer.disconnect();
    render();
    observer.observe(document.body, {childList:true,subtree:true,characterData:true});
  });
  observer.observe(document.body, {childList:true,subtree:true,characterData:true});
  window.addEventListener('hashchange', render);
  render();
})();
