const entries = import.meta.glob('./*/*.json', { eager: true, import: 'default' });
const images = import.meta.glob('../images/**/*.{jpg,jpeg,png,webp,gif,svg}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

function resolveAssets(value: any): any {
  if (typeof value === 'string' && value.startsWith('/src/images/')) {
    const key = '../images/' + value.slice('/src/images/'.length);
    if (!images[key]) throw new Error(`Missing content image: ${value}`);
    return images[key];
  }
  if (Array.isArray(value)) return value.map(resolveAssets);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveAssets(item)]));
  }
  return value;
}

export function loadPosts(group: string): any[] {
  return Object.entries(entries)
    .filter(([file]) => file.startsWith(`./${group}/`))
    .map(([file, data]) => {
      const post = resolveAssets(data);
      const slug = file.split('/').pop()!.replace(/\.json$/, '');
      return { ...post, slug: post.slug || slug, id: post.id ?? `${group}-${slug}` };
    })
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || String(a.slug).localeCompare(String(b.slug)));
}
