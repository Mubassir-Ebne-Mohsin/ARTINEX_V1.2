import { createRequire } from 'node:module';
import { parseFeed } from './_rss.js';
const require = createRequire(import.meta.url);
const sources = require('../content/feeds.json');
let cache={until:0,items:[],sources:[],fetchedAt:null};
const cleanItems=(rows) => {
  const seen=new Set();return rows.filter(row=>{const key=row.url.toLowerCase().replace(/\/$/,'');if(seen.has(key))return false;seen.add(key);return true})
    .sort((a,b)=>new Date(b.published||0)-new Date(a.published||0)).slice(0,45);
};
export async function GET(){
  const now=Date.now();
  if(now<cache.until){return Response.json({...cache,cached:true},{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=1800'}})}
  const found=await Promise.all(sources.map(async source=>{
    try{
      const result=await fetch(source.url,{signal:AbortSignal.timeout(5500),redirect:'follow',headers:{'User-Agent':'ArtinexFeedReader/2.0 (+source-attributed-headlines)','Accept':'application/atom+xml, application/rss+xml, application/xml, text/xml, */*'}});
      if(!result.ok)throw Error('status '+result.status);
      const len=Number(result.headers.get('content-length')||0);if(len>2_500_000)throw Error('too large');
      const body=await result.text();if(body.length>2_500_000)throw Error('too large');
      return {name:source.name,ok:true,items:parseFeed(body,source).slice(0,12)};
    }catch {return {name:source.name,ok:false,items:[]}}
  }));
  const rows=cleanItems(found.flatMap(x=>x.items));
  if(rows.length){cache={until:Date.now()+15*60*1000,items:rows,sources:found.map(x=>({name:x.name,ok:x.ok,count:x.items.length})),fetchedAt:new Date().toISOString()}}
  else if(cache.items.length){cache.until=Date.now()+5*60*1000;}
  else{cache={until:Date.now()+3*60*1000,items:[],sources:found.map(x=>({name:x.name,ok:x.ok,count:x.items.length})),fetchedAt:new Date().toISOString()}}
  return Response.json({...cache,cached:false},{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=1800'}});
}
