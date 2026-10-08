/** Import a locally drafted JSON article into the tracked content list.
 * Usage: npm run article:add -- path/to/draft.json --publish */
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2);
const file=args.find(x=>!x.startsWith('--'));
if(!file){console.error('Usage: npm run article:add -- /path/to/draft.json [--publish]');process.exit(1)}
const source=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
const out=path.resolve('content/articles.json');
const data=JSON.parse(fs.readFileSync(out,'utf8'));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const check=(cond,msg)=>{if(!cond)throw Error(msg)};
check(typeof source.title==='string'&&source.title.length>=10,'Add a descriptive article title of at least 10 characters.');
check(typeof source.category==='string'&&source.category.length>1,'Category required');
check(Array.isArray(source.sections)&&source.sections.length>0,'At least one article section required.');
check(source.sections.every(x=>typeof x.heading==='string'&&Array.isArray(x.paragraphs)&&x.paragraphs.every(p=>typeof p==='string')),'Invalid section formatting');
check(Array.isArray(source.sources)&&source.sources.every(x=>typeof x.label==='string'&&/^https?:\/\//i.test(x.url)),'Sources must have labels and valid URLs.');
check(/^\d{4}-\d{2}-\d{2}$/.test(source.publishedAt||''),'publishedAt requires YYYY-MM-DD');
check(!Number.isNaN(Date.parse(source.publishedAt)),'Invalid date');
check(typeof source.slug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.slug),'Invalid slug');
check(!data.some(a=>a.slug===source.slug),'Slug already exists: '+source.slug);
if(args.includes('--publish')){
  check(source.excerpt?.length>=15,'Published articles need an excerpt.');
  check(source.sources.length>0,'A published article needs at least one credible reference.');
  check(Array.isArray(source.takeaways)&&source.takeaways.length>0,'Add at least one reviewed takeaway before publishing.');
  source.status='published';
}else source.status='draft';
data.unshift(source);
fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
console.log(`${source.status==='published'?'Published':'Imported draft'}: ${source.title} (${source.slug})`);
console.log('Run npm run build and review the output. Commit content/articles.json to trigger Vercel.');
