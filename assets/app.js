(function(){
  const fmtSize = n => {
    const u=['B','KB','MB','GB']; let i=0; let x=n||0;
    while(x>=1024 && i<u.length-1){x/=1024;i++;}
    return `${x.toFixed(x>=10||i===0?0:1)} ${u[i]}`;
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
      const items = cat ? m.items.filter(i=>i.category===cat) : m.items;
      table.innerHTML = items.map(it=>{
        const href = `${repoBase}${it.path}`;
        return `<tr>
          <td>${it.name}</td>
          <td class="muted">${it.mime}</td>
          <td class="muted">${fmtSize(it.size)}</td>
          <td>
            <a class="btn" href="${href}" target="_blank">打开</a>
            <button class="btn ghost" data-copy="${href}">复制链接</button>
          </td>
        </tr>`;
      }).join('');
      table.querySelectorAll('button[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copy(btn.getAttribute('data-copy'),btn)));
    }
  }).catch(()=>{});
})();
