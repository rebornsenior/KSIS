import Archive from './Archive';
import {postListPath} from '../content/post-links';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {loadPosts} from '../content/load';
import {groupLabels} from '../content/board';
import Forum from './Project/Forum';
import Education from './Project/Education';
import Project from './Project/Project';
export default function PostDetail(){
 const {group='',slug=''}=useParams();
 const navigate=useNavigate();
 const post=groupLabels[group] && loadPosts(group).find(p=>p.slug===slug);
 if(!post) return <p>연결된 글이 없거나 삭제되었습니다. <Link to="/community">공지사항으로 돌아가기</Link></p>;
 post.name=post.name || post.title;
 const content=group==='notices' ? <Forum previewPost={post}/> : <Archive postGroup={group} post={post}/>;
 return <div onClickCapture={event=>{
   const button=(event.target as HTMLElement).closest('button');
   if(button && /돌아가기|뒤로 가기/.test(button.textContent || '')){
     event.stopPropagation(); navigate(postListPath(group));
   }
 }}>{content}</div>;
}