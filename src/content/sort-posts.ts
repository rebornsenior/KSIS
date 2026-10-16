export type PostSortOrder = 'newest' | 'oldest';
function dateKey(value: unknown): number {
  const match=String(value || '').match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/);
  if(!match) return 0;
  return Number(match[1])*10000+Number(match[2])*100+Number(match[3]);
}
export function sortPosts<T extends {date?: unknown;slug?: string;id?: unknown}>(posts: readonly T[],order: PostSortOrder='newest'): T[] {
  return [...posts].sort((a,b)=>{
    const first=dateKey(a.date),second=dateKey(b.date);
    if(!first || !second) return first ? -1 : second ? 1 : 0;
    const direction=order==='newest' ? -1 : 1;
    return direction*(first-second || String(a.slug || a.id || '').localeCompare(String(b.slug || b.id || ''),'ko',{numeric:true}));
  });
}
export function postDate(value: unknown): string {
  const key=dateKey(value);
  return key ? String(key).replace(/^(\d{4})(\d{2})(\d{2})$/,'$1.$2.$3') : '';
}
