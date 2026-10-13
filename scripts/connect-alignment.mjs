import fs from 'node:fs';
for (const name of ['Forum', 'Education', 'Project']) {
  const file = `src/pages/Project/${name}.tsx`;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace("import ContentLink from '../../components/ContentLink';", "import ContentLink from '../../components/ContentLink';\nimport { textAlignment } from '../../content/alignment';");
  source = source.replace('style={{ borderColor: COLORS.gold }}', 'style={{ borderColor: COLORS.gold, ...textAlignment(block.align) }}');
  for (const type of ['text', 'quote']) {
    const marker = `if (block.type === '${type}')`;
    const start = source.indexOf(marker);
    const end = source.indexOf('return null;', start);
    const tail = source.slice(start, end);
    const updated = tail.replace(/key=\{idx\}(\s*)/, 'key={idx} style={textAlignment(block.align)}$1');
    source = source.slice(0, start) + updated + source.slice(end);
  }
  source = source.replace('url={block.url} text={block.text}', 'url={block.url} text={block.text} align={block.align}');
  fs.writeFileSync(file, source);
}
