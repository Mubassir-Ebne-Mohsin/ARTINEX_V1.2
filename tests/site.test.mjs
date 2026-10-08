import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFeed,decode } from '../api/_rss.js';
import { POST } from '../api/newsletter.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const read = p=>fs.readFileSync(path.join(dist,p),'utf8');
const articles=JSON.parse(fs.readFileSync(path.join(root,'content/articles.json'),'utf8'));
const ent=JSON.parse(fs.readFileSync(path.join(root,'content/entities.json'),'utf8'));

test('Homepage, site map, articles, directories and essential routes are generated',()=>{
  for(const file of ['index.html','news.html','articles.html','search.html','studio.html','companies.html','models.html','tools.html','404.html','sitemap.xml','robots.txt','rss.xml','styles.css','app.js']){
    assert.ok(fs.existsSync(path.join(dist,file)),`Missing ${file}`);
  }
  assert.match(read('index.html'),/ARTINEX/);
  assert.match(read('index.html'),/data-news-feed/);
  assert.equal(articles.filter(a=>a.status==='published').length,12);
  for(const a of articles.filter(a=>a.status==='published')){
    const page=read(`articles/${a.slug}.html`);
    assert.ok(page.includes(a.title.replace(/&/g,'&amp;')));
    assert.match(page,/Key takeaways/);
    assert.match(page,/Sources & further reading/);
    assert.match(page,/type="application\/ld\+json"/);
    assert.ok(fs.existsSync(path.join(dist,'category',a.category.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.html')));
  }
  for(const [key,items] of Object.entries(ent))for(const item of items){assert.ok(fs.existsSync(path.join(dist,key,item.slug+'.html')))};
});

test('Every internal navigation, image and stylesheet path resolves to generated content',()=>{
  const htmlFiles=[];
  function crawl(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,item.name);if(item.isDirectory())crawl(full);else if(full.endsWith('.html'))htmlFiles.push(full)}}
  crawl(dist);let checked=0;
  for(const file of htmlFiles){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
    let target=match[1];if(target==='/')target='/index.html';else if(!path.extname(target))target+='.html';
    assert.ok(fs.existsSync(path.join(dist,target)),`Broken link ${match[1]} from ${path.relative(dist,file)}`);checked++;
  }}
  assert.ok(checked>500,`Too few links checked: ${checked}`);
});

test('RSS parser extracts RSS and Atom titles, dates and safe external URLs',()=>{
  const src={name:'Lab',category:'Research'};
  const rss=`<?xml version="1.0"?><rss><channel><item><title><![CDATA[AI &amp; science]]></title><link>https://research.example/paper?id=1&amp;x=2</link><pubDate>Wed, 07 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`;
  let rows=parseFeed(rss,src);
  assert.equal(rows.length,1);assert.equal(rows[0].title,'AI & science');assert.equal(rows[0].url,'https://research.example/paper?id=1&x=2');
  assert.equal(rows[0].published,'2026-10-07T10:00:00.000Z');
  const atom=`<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Model &lt;guide&gt;</title><link rel="alternate" href="https://example.com/atom"/><updated>2026-10-07T08:00:00Z</updated></entry></feed>`;
  rows=parseFeed(atom,src);assert.equal(rows.length,1);assert.equal(rows[0].title,'Model <guide>');
  assert.equal(rows[0].url,'https://example.com/atom');
  assert.equal(parseFeed(`<rss><item><title>Bad</title><link>javascript:alert(1)</link></item></rss>`,src).length,0);
  assert.equal(decode('One &#x26; two'),'One & two');
});

test('Newsletter rejects invalid or unauthorized requests and never claims unconfigured success',async()=>{
  const request=(payload,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify(payload)});
  let resp=await POST(request({email:'invalid',consent:true}));assert.equal(resp.status,400);
  resp=await POST(request({email:'person@example.com',consent:true},'https://untrusted.example'));assert.equal(resp.status,403);
  resp=await POST(request({email:'person@example.com',consent:false}));assert.equal(resp.status,400);
  // External provider is never called in tests without configuration.
  if(!process.env.RESEND_API_KEY||!process.env.RESEND_AUDIENCE_ID){resp=await POST(request({email:'person@example.com',consent:true}));assert.equal(resp.status,503)}
});

test('Allowlisted external headlines are fetched, deduplicated and attributed by API',async()=>{
  const {GET}=await import('../api/news.js');
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async url=>{
      const host=new URL(url).host;
      return new Response(`<rss><channel><item><title>Real publisher headline</title><link>https://${host}/story</link><pubDate>Wed, 07 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`,{status:200,headers:{'Content-Type':'application/rss+xml'}});
    };
    const response=await GET();assert.equal(response.status,200);
    const result=await response.json();
    assert.equal(result.items.length,7);
    assert.equal(result.sources.length,7);
    assert.ok(result.items.every(x=>x.source&&x.url.startsWith('https://')));
    assert.ok(result.sources.every(x=>x.ok===true));
    const cached=(await (await GET()).json());assert.equal(cached.cached,true);
  }finally{globalThis.fetch=original}
});
