import type {PostSortOrder} from '../content/sort-posts';
export default function PostSortControl({value,onChange}:{value:PostSortOrder;onChange:(value:PostSortOrder)=>void}) {
  return <div className="flex justify-end mb-4"><select aria-label="글 정렬 순서" value={value} onChange={event=>onChange(event.target.value as PostSortOrder)} className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-2 bg-white"><option value="newest">최신순</option><option value="oldest">오래된순</option></select></div>;
}
