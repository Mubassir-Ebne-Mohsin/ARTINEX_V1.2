/* Artinex front-end enhancements. Pages work without JavaScript except search/news/forms. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const theme = $('[data-theme-toggle]');
  theme?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {localStorage.setItem('artinex-theme',next)} catch {}
    theme.setAttribute('aria-label', `Change color theme (current: ${next})`);
  });
  const menu = $('[data-menu-toggle]');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded',String(open));
    $('#primary-navigation')?.classList.toggle('is-open',open);
  });
  $$('#primary-navigation a').forEach(link=>link.addEventListener('click',()=>{
    menu?.setAttribute('aria-expanded','false');
    $('#primary-navigation')?.classList.remove('is-open');
  }));
  $$('[data-copy-url]').forEach(btn=>btn.addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(location.href);btn.textContent='Link copied ✓';setTimeout(()=>btn.textContent='Copy link ↗',2000)}
    catch {const status=$('[data-share-status]');if(status)status.textContent='Copy this URL: '+location.href;}
  }));
  $$('[data-share]').forEach(btn=>btn.addEventListener('click',()=>{
    const u=encodeURIComponent(location.href), t=encodeURIComponent(document.title);
    const dest=btn.dataset.share==='linkedin'?`https://www.linkedin.com/sharing/share-offsite/?url=${u}`:`https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    window.open(dest,'_blank','noopener,noreferrer');
  }));
  const directoryFilter = $('[data-directory-filter]');
  directoryFilter?.addEventListener('change',()=>$$('[data-directory-category]').forEach(el=>{
    el.hidden=directoryFilter.value!=='all' && el.dataset.directoryCategory!==directoryFilter.value;
  }));
  if(directoryFilter){const style=document.createElement('style');style.textContent='[data-directory-category][hidden]{display:none!important}';document.head.appendChild(style);}

  const dateFmt = (v) => {
    if(!v) return 'Date not provided';
    const d=new Date(v);return isNaN(d)?'Date not provided':d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  };
  const newsViews=$$('[data-news-feed]');
  if(newsViews.length){
    fetch('/api/news',{headers:{'Accept':'application/json'}}).then(async r=>{
      if(!r.ok)throw new Error('News service temporarily unavailable');
      return r.json();
    }).then(payload=>{
      const all = Array.isArray(payload.items)?payload.items:[];
      const selector=$('[data-news-source]');
      const render=()=>{
        const filtered=selector?.value?all.filter(i=>i.source===selector.value):all;
        newsViews.forEach(view=>{
          const max=Math.min(40,Number(view.dataset.limit)||10);
          view.innerHTML=filtered.length?filtered.slice(0,max).map(item=>{
            const u=String(item.url||'');if(!/^https?:\/\//i.test(u))return '';
            return `<article class="news-item"><div class="news-source">${safe(item.source)}</div><div><h3><a href="${safe(u)}" target="_blank" rel="noopener noreferrer">${safe(item.title)}</a></h3><div class="news-topic">${safe(item.category||'External headline')} · Original source</div></div><time datetime="${safe(item.published||'')}">${dateFmt(item.published)}</time><a href="${safe(u)}" class="news-arrow" aria-label="Open original story: ${safe(item.title)}" target="_blank" rel="noopener noreferrer">↗</a></article>`;
          }).join(''):'<div class="empty-message">No headlines available from the selected sources right now. Use the publisher links to read directly.</div>';
        });
      };
      selector?.addEventListener('change',render);render();
      const updated=$('[data-news-updated]');if(updated)updated.textContent=`Fetched ${dateFmt(payload.fetchedAt)} · ${all.length} headlines`;
    }).catch(()=>{
      newsViews.forEach(v=>v.innerHTML='<div class="empty-message">Live headlines are temporarily unavailable. Visit the <a href="/sources">source directory</a> for official publishers.</div>');
      const updated=$('[data-news-updated]');if(updated)updated.textContent='Feed unavailable';
    });
  }

  const newsletter=$('[data-newsletter-form]');
  newsletter?.addEventListener('submit',async(e)=>{
    e.preventDefault();const input=$('input[name=email]',newsletter),consent=$('input[name=consent]',newsletter),out=$('[data-newsletter-status]',newsletter),button=$('button[type=submit]',newsletter);
    if(!input?.validity.valid || !consent?.checked){out.textContent='Enter a valid email and accept the consent checkbox.';return;}
    button.disabled=true;out.textContent='Submitting…';
    try{
      const resp=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:input.value.trim(),consent:true,website:newsletter.elements.namedItem('website')?.value||''})});
      const result=await resp.json();if(!resp.ok)throw Error(result.error||'Unable to subscribe.');
      out.textContent='Subscription request received. Check your inbox for future updates.';newsletter.reset();
    } catch(err){out.textContent=err.message||'Please try again.'}
    finally{button.disabled=false;}
  });

  const searchInput=$('[data-search-input]');
  if(searchInput){
    let records=[],loading=false;
    const results=$('[data-search-results]'),summary=$('[data-search-summary]');
    const draw=()=>{
      const q=searchInput.value.trim().toLowerCase().slice(0,120);
      if(!q){results.innerHTML='';summary.textContent='Type to search articles, models, companies and tools.';return;}
      const terms=q.split(/\s+/).filter(Boolean);
      const ranked=records.map(x=>{
        const t=x.title.toLowerCase(),s=(x.search||'').toLowerCase();
        const all=terms.every(word=>t.includes(word)||s.includes(word));
        return {...x,score:all?(terms.reduce((n,word)=>n+(t.includes(word)?4:0)+(s.includes(word)?1:0),0)):0};
      }).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,40);
      summary.textContent=`${ranked.length} matching results${ranked.length===40?' (showing first 40)':''}`;
      results.innerHTML=ranked.length?ranked.map(x=>`<article class="search-result"><small>${safe(x.type)}</small><h2><a href="${safe(x.url)}">${safe(x.title)}</a></h2><p>${safe(x.description)}</p></article>`).join(''):'<div class="empty-message">No matches. Try a broader term, such as “AI”, “agents” or “model”.</div>';
    };
    const load=async()=>{if(loading||records.length)return;loading=true;try{const res=await fetch('/search-index.json');if(!res.ok)throw Error();records=await res.json();draw();}catch{summary.textContent='Search index unavailable. Please refresh.'}finally{loading=false}};
    searchInput.addEventListener('input',()=>{if(!records.length)load();else draw()});
    $('[data-search-form]')?.addEventListener('submit',e=>{e.preventDefault();draw();});
    const q=new URLSearchParams(location.search).get('q');if(q){searchInput.value=q;load()}else{load();}
  }
})();
