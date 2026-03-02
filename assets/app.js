(function(){
  const fmtSize = n => {
    const u=['B','KB','MB','GB']; let i=0; let x=n||0;
    while(x>=1024 && i<u.length-1){x/=1024;i++;}
    return `${x.toFixed(x>=10||i===0?0:1)} ${u[i]}`;
  };
  const fmtTime = iso => {
    if(!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };
  const copy = async (text, btn) => {
    try{ await navigator.clipboard.writeText(text); const o=btn.textContent; btn.textContent='已复制'; setTimeout(()=>btn.textContent=o,1200);}catch(e){alert('复制失败，请手动复制');}
  };
  const seg = location.pathname.split('/').filter(Boolean);
  const repoBase = seg.length ? `/${seg[0]}/` : '/';

  fetch(repoBase + 'assets/manifest.json').then(r=>r.json()).then(m=>{
    document.querySelectorAll('[data-total]').forEach(el=>el.textContent=m.count);
    ['images','docs','data'].forEach(k=>{
      const n=(m.summary&&m.summary[k])||0;
      const e=document.querySelector(`[data-count="${k}"]`); if(e) e.textContent = `${n} 个文件`;
    });

    const latest = document.querySelector('#latest-list');
    if(latest){
      const top = m.items.slice(0,3);
      latest.innerHTML = top.map(it=>`<li><a href="${repoBase}${it.path}" target="_blank">${it.name}</a> <span class="muted">${fmtSize(it.size)}</span></li>`).join('');
    }

    const table = document.querySelector('#file-table-body');
    if(table){
      const cat = document.body.getAttribute('data-category');
      const allItems = (cat ? m.items.filter(i=>i.category===cat) : m.items).map(it => ({
        ...it,
        href: `${repoBase}${it.path}`
      }));

      const qInput = document.querySelector('#search-input');
      const sortSel = document.querySelector('#sort-select');
      const countEl = document.querySelector('#count-text');
      const clearBtn = document.querySelector('#clear-btn');
      const copyAllBtn = document.querySelector('#copy-visible-btn');
      const empty = document.querySelector('#empty-state');

      const getView = () => {
        let items = [...allItems];
        const q = (qInput?.value || '').trim().toLowerCase();
        if (q) items = items.filter(i => i.name.toLowerCase().includes(q) || i.mime.toLowerCase().includes(q));
        const sort = sortSel?.value || 'latest';
        if (sort === 'latest') items.sort((a,b)=> (b.updatedAt||'').localeCompare(a.updatedAt||''));
        if (sort === 'name') items.sort((a,b)=> a.name.localeCompare(b.name,'zh-CN'));
        if (sort === 'size') items.sort((a,b)=> (b.size||0)-(a.size||0));
        return items;
      };

      const render = () => {
        const items = getView();
        countEl && (countEl.textContent = `显示 ${items.length} / ${allItems.length}`);
        empty && (empty.style.display = items.length ? 'none' : 'block');
        table.innerHTML = items.map(it=>`<tr>
          <td>${it.name}</td>
          <td class="muted">${it.mime}</td>
          <td class="muted">${fmtSize(it.size)}</td>
          <td class="muted">${fmtTime(it.updatedAt)}</td>
          <td>
            <a class="btn" href="${it.href}" target="_blank">打开</a>
            <button class="btn ghost" data-copy="${it.href}">复制链接</button>
          </td>
        </tr>`).join('');
        table.querySelectorAll('button[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copy(btn.getAttribute('data-copy'),btn)));
      };

      qInput && qInput.addEventListener('input', render);
      sortSel && sortSel.addEventListener('change', render);
      clearBtn && clearBtn.addEventListener('click', ()=>{ if(qInput) qInput.value=''; render(); });
      copyAllBtn && copyAllBtn.addEventListener('click', ()=>{
        const urls = getView().map(i=>i.href).join('\n');
        if(!urls){alert('当前没有可复制的文件'); return;}
        copy(urls, copyAllBtn);
      });

      render();
    }
  }).catch(()=>{});
})();
