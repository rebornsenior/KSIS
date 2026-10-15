import {loadPosts} from './load';
export const groupLabels: Record<string,string> = {forum:'비즈니스 포럼',foodculture:'소모임 프로젝트 · 식문화',bookclub:'소모임 프로젝트 · 북클럽',local:'소모임 프로젝트 · 로컬탐방',education:'AI · 마케팅 · 창업 교육',notices:'공지사항'};
const labels={...groupLabels,naver:'네이버 카페',news:'뉴스'};
export function boardPosts(group:string){
 return loadPosts(group).map(post=>{
  const source=post.sourceInfo?.[0];
  const label=source?.type==='other'?source.label:(labels as Record<string,string>)[source?.type] || '기타';
  if(group==='insights') return {...post,tags:(post.tags || []).slice(0,5),sourceLabel:label};
  return {...post,url:'#/post/notices/'+encodeURIComponent(post.slug),label,internal:true};
 });
}
