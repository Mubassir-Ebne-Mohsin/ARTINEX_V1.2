/** Restricted, dependency-free RSS/Atom headline parser (not a generic XML processor).
 * Only used with trusted, configured feed URLs. Feed text is never emitted as HTML. */
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',mdash:'—',ndash:'–',hellip:'…',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”'};
export function decode(value=''){
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (full,entity)=>{
    if(entity.startsWith('#')){
      const n=entity[1]?.toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
      return Number.isInteger(n)&&n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'';
    }
    return entities[entity.toLowerCase()]??full;
  }).replace(/\s+/g,' ').trim();
}
function escapeRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function tag(chunk,name){
  const safe=escapeRe(name);
  const match=chunk.match(new RegExp(`<${safe}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safe}\\s*>`,'i'));
  return match?.[1]||'';
}
function safeUrl(raw){
  try{const u=new URL(decode(raw));if(u.protocol!=='https:'&&u.protocol!=='http:')return '';if(u.username||u.password)return '';return u.href;}
  catch{return ''}
}
export function parseFeed(xml,source){
  if(typeof xml!=='string'||xml.length>3_000_000)return [];
  const matches=[...xml.matchAll(/<(?:[a-z0-9_-]+:)?(item|entry)\b[^>]*>([\s\S]*?)<\/(?:[a-z0-9_-]+:)?\1\s*>/gi)];
  const items=[];
  for(const [,kind,block] of matches.slice(0,50)){
    const title=decode(tag(block,'title')).slice(0,240);
    const atomLink=block.match(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*\/?\s*>/i)?.[1];
    const url=safeUrl(atomLink||tag(block,'link')||tag(block,'guid'));
    if(!title||!url)continue;
    const dateRaw=decode(tag(block,'pubDate')||tag(block,'published')||tag(block,'updated')||tag(block,'dc:date'));
    const dt=new Date(dateRaw);
    const validDate=Number.isFinite(dt.getTime())&&dt.getTime()<=Date.now()+172800000&&dt.getTime()>=946684800000;
    items.push({title,url,source:source.name,category:source.category,published:validDate?dt.toISOString():null});
  }
  return items;
}
