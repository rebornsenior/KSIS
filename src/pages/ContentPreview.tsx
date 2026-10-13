import { useEffect, useState } from 'react';
import Forum from './Project/Forum';
import Education from './Project/Education';
import Project from './Project/Project';

export default function ContentPreview() {
  const [preview, setPreview] = useState<any>(() => {
    if (!['localhost', '127.0.0.1', '[::1]', 'www.rebornsenior.com'].includes(location.hostname)) return null;
    try { return JSON.parse(sessionStorage.getItem('ksis-content-preview') || 'null'); } catch { return null; }
  });
  useEffect(() => {
    if (!['localhost', '127.0.0.1', '[::1]', 'www.rebornsenior.com'].includes(location.hostname)) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || (event.source !== window.parent && event.source !== window.top) || event.data?.type !== 'ksis-preview') return;
      if (!event.data.post || !Array.isArray(event.data.post.contentBlocks)) return;
      setPreview(event.data);
      try { sessionStorage.setItem('ksis-content-preview', JSON.stringify(event.data)); } catch { /* In-memory preview still works. */ }
    };
    window.addEventListener('message', receive);
    window.top?.postMessage({type: 'ksis-preview-ready'}, location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  if (!preview) return <p>관리자 입력 내용을 기다리고 있습니다. 실제 게시가 아닌 미리보기입니다.</p>;
  if (preview.group === 'forum') return <Forum previewPost={preview.post} />;
  if (preview.group === 'education') return <Education previewPost={preview.post} />;
  return <Project previewPost={preview.post} selectedCategory={preview.post.category || 'food'} />;
}
