import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const groups = [
  ['forum', 'forum', 'forumsData', ['20260614-youtube-growth', '20260612-story-business']],
  ['education', 'education', 'educationsData', ['20250719-ai-saas-project', '202606-ai-education']],
  ['foodculture', 'community/foodculture/posts', 'foodculturePosts', ['202606-foodculture-meeting']],
  ['bookclub', 'community/bookclub/posts', 'bookclubPosts', ['20260613-youtube-bookclub']],
  ['local', 'community/local/posts', 'localPosts', ['20260625-wind-culture']],
];
const manifest = [];
for (const [group, folder, exportName, slugs] of groups) {
  const dir = path.resolve('src/pages/Project', folder);
  const files = fs.readdirSync(dir).filter(f => /^post\d+\.ts$/.test(f)).sort();
  fs.mkdirSync(`src/content/${group}`, { recursive: true });
  files.forEach((file, index) => {
    let source = fs.readFileSync(path.join(dir, file), 'utf8');
    source = source.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];[^\r\n]*/g, (_, name, relative) => {
      const asset = '/' + path.relative(process.cwd(), path.resolve(dir, relative)).replaceAll('\\', '/');
      if (!fs.existsSync(path.resolve('.' + asset))) throw new Error(`Missing image: ${asset}`);
      return `const ${name} = ${JSON.stringify(asset)};`;
    }).replace(/export const (post\d+)\s*=/, 'const $1 =');
    const data = JSON.parse(JSON.stringify(vm.runInNewContext(source + `\npost${index + 1}`, {}, { timeout: 1000 })));
    const slug = slugs[index];
    const target = `src/content/${group}/${slug}.json`;
    if (fs.existsSync(target)) throw new Error(`Already migrated: ${target}`);
    fs.writeFileSync(target, JSON.stringify({ ...data, slug, order: index + 1 }, null, 2) + '\n');
    const migrated = JSON.parse(fs.readFileSync(target));
    const { slug: ignoredSlug, order: ignoredOrder, ...rest } = migrated;
    if (JSON.stringify(rest) !== JSON.stringify(data)) throw new Error(`Content mismatch: ${file}`);
    manifest.push({ source: path.relative(process.cwd(), path.join(dir, file)), target, blocks: data.contentBlocks.length });
  });
  const indexPath = folder.endsWith('/posts') ? path.resolve(dir, '../index.ts') : path.resolve(dir, 'index.ts');
  const relative = path.relative(path.dirname(indexPath), path.resolve('src/content/load.ts')).replaceAll('\\', '/').replace(/\.ts$/, '');
  fs.writeFileSync(indexPath, `import { loadPosts } from '${relative.startsWith('.') ? relative : './' + relative}';\n\nexport const ${exportName} = loadPosts('${group}');\n`);
}
fs.writeFileSync('src/content/migration-report.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Migrated ${manifest.length} posts; all blocks, text and image references matched exactly.`);
