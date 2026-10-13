import { Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function ContentLink({ url, text, align }: { url: string; text?: string; align?: string; key?: number }) {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
  } catch { return null; }
  const host = parsed.hostname;
  const site = host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com') ? 'YouTube · ' : '';
  return (
    <a href={parsed.href} target="_blank" rel="noopener noreferrer" style={align === 'center' ? {marginLeft:'auto',marginRight:'auto'} : align === 'right' ? {marginLeft:'auto',marginRight:0} : {marginLeft:0,marginRight:'auto'}} className="flex items-center w-full max-w-xl border border-slate-200 bg-white text-[#002147] overflow-hidden hover:border-slate-400 transition-colors">
      <span className="flex items-center justify-center self-stretch w-20 sm:w-24 shrink-0 bg-slate-100" aria-hidden="true">
        <LinkIcon className="w-7 h-7" />
      </span>
      <span className="min-w-0 flex-1 p-4">
        <span className="block font-semibold text-sm sm:text-base break-words">{text || host}</span>
        <span className="block text-xs text-slate-500 mt-2 break-all">{site}{host}</span>
      </span>
      <ExternalLink className="w-4 h-4 shrink-0 mr-4" aria-label="새 탭에서 열기" />
    </a>
  );
}
