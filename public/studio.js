(() => {
  const form=document.querySelector('#draft-form');if(!form)return;
  const status=document.querySelector('#studio-status');
  const key='artinex-editorial-draft-v1';
  const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const create=()=>{
    const values=Object.fromEntries(new FormData(form));
    const parts=String(values.body||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
    const sections=[];
    for(let i=0;i<parts.length;i+=2){sections.push({heading:(parts[i]||'Overview').slice(0,120),paragraphs:[parts[i+1]||'Draft section pending editorial review.']});}
    return {slug:slug(String(values.title||'article')),title:values.title,subtitle:values.subtitle||'',excerpt:values.excerpt,
      category:values.category,tags:String(values.tags||'').split(',').map(x=>x.trim()).filter(Boolean),author:values.author,
      publishedAt:values.publishedAt,status:'draft',kind:'Editorial draft',featured:false,image:values.image||'',
      takeaways:String(values.takeaways||'').split(/\n+/).map(x=>x.trim()).filter(Boolean),sections,sources:String(values.sources||'').split(/\n+/).map(s=>s.trim()).flatMap(u=>{try{const url=new URL(u);return ['https:','http:'].includes(url.protocol)?[{label:url.hostname,url:url.href}]:[]}catch{return []}})};
  };
  const update=()=>{try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)for(let [k,v] of Object.entries(saved)){if(form.elements.namedItem(k))form.elements.namedItem(k).value=v};}catch{}};
  update();
  if(!form.elements.namedItem('publishedAt').value)form.elements.namedItem('publishedAt').value=new Date().toISOString().slice(0,10);
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(new FormData(form))));status.textContent='Saved locally in this browser.';return true}catch{status.textContent='Unable to save locally. Check browser storage permissions.';return false}};
  form.addEventListener('submit',e=>{e.preventDefault();if(form.reportValidity())save()});
  document.querySelector('#export-draft').addEventListener('click',()=>{
    if(!form.reportValidity())return;save();
    const blob=new Blob([JSON.stringify(create(),null,2)+'\n'],{type:'application/json'}),link=document.createElement('a');
    link.href=URL.createObjectURL(blob);link.download=create().slug+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2000);
    status.textContent='Draft exported. Review sources and publish through the repository (see docs).';
  });
  document.querySelector('#clear-draft').addEventListener('click',()=>{if(!confirm('Clear this browser-local draft?'))return;form.reset();try{localStorage.removeItem(key)}catch{}status.textContent='Local draft cleared.';});
})();
