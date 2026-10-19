const groups = ['forum', 'foodculture', 'bookclub', 'local', 'education', 'notices'];
const categories: Record<string, string> = {foodculture:'food',bookclub:'book',local:'local'};
export function postPath(group: string, slug: string) {
  if (!groups.includes(group) || !slug) throw new Error('Invalid post destination');
  return '/post/' + group + '/' + encodeURIComponent(slug);
}
export function postTab(group: string) {
  return group === 'forum' ? 'forum' : group === 'education' ? 'education' : 'project';
}
export function postListPath(group: string) {
  if (!groups.includes(group) || group === 'notices') return '/community?tab=notice';
  const params = new URLSearchParams({tab:postTab(group)});
  if (categories[group]) params.set('category',categories[group]);
  return '/archive?' + params.toString();
}
