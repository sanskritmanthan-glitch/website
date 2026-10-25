/* Generic index page engine (mantra, itihāsa-purāṇa, subhāṣita). Page sets window.IXC = {dir, unitWord, kind} */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C=window.IXC;let CAT=null, TX={}, KEYS={}, SCRIPT='dv', LIMIT=200, TAB='works';
const SEL={book:null,s:null,v:null,work:null,metre:null}, OPEN={work:null,book:null};
try{SCRIPT=localStorage.getItem('sl-script')||'dv';TAB=localStorage.getItem(C.dir+'-tab')||'works'}catch(e){}
/*TRANSLIT*/
const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
async function text(id){if(!TX[id])TX[id]=await get(C.dir+'/t/'+id+'.json');return TX[id]}
async function keys(id){if(!KEYS[id])KEYS[id]=await get(C.dir+'/k/'+id+'.json');return KEYS[id]}
const B=id=>CAT.books.find(b=>b.id===id), W=id=>CAT.works.find(w=>w.id===id);
const wb=w=>w.books.map(B), multiB=w=>w.books.length>1, multiS=b=>b.sargas.length>1;
const unitN=(b,s)=>{if(!b.units.length)return s;const n=String(s).split('.');return n.map((x,i)=>`${b.units[Math.min(i,b.units.length-1)]} ${x}`).join(' · ')};
const bookName=b=>{const w=W(b.work);return multiB(w)?`${w.title} · ${b.title}`:w.title};
const ref=(bid,s,v)=>{const b=B(bid),w=W(b.work);const num=[multiB(w)?b.num:null,multiS(b)?s:null,v].filter(x=>x!==null&&x!=='').join('.');return `${show(w.abbr)} ${num}`};
const isVerse=m=>!!m;
function bodyHTML(p,m){if(isVerse(m)||p.length<=1&&p[0]&&p[0].length<60)return p.map((x,i)=>`<div class="${i%2?'l2':''}">${esc(show(x))}${i%2&&i!==p.length-1?' ।':''}</div>`).join('');
  return `<div class="prose">${p.map(x=>esc(show(x))).join(' । ')}</div>`}
function metreLink(m){if(!m)return'';const d=CAT.metres.find(x=>x.dev===m);if(d&&d.link)return `<a class="ml" href="shloka.html#m/${d.link}">${esc(show(m))}</a>`;
  return `<button class="ml" data-mt="${d?d.slug:''}" title="${d?esc(d.note):''}">${esc(show(m))}</button>`}
function wireMetres(root){root.querySelectorAll('button.ml[data-mt]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.dataset.mt)openMetre(b.dataset.mt)})}
/* ---------- views ---------- */
async function openVerse(bid,s,v,push=true){
  const t=await text(bid), all=t.v, ix=all.findIndex(x=>x[0]===s&&x[1]===v); if(ix<0)return;
  const [S,Vn,P,m]=all[ix], b=B(bid), w=W(b.work);
  Object.assign(SEL,{book:bid,s:S,v:Vn,work:b.work,metre:null});
  $('#out').innerHTML=`<div class="card"><div class="hd"><span>${esc(show(bookName(b)))}${multiS(b)?` · ${esc(show(unitN(b,S)))}`:''} · ${Vn}</span><span class="mt">${metreLink(m)}</span></div>
   <div class="v">${bodyHTML(P,m)}<div class="rf2">॥ ${esc(ref(bid,S,Vn))} ॥</div></div>
   <div class="nav"><button id="pv" ${ix?'':'disabled'}>‹ पूर्वम्</button><button id="nx" ${ix<all.length-1?'':'disabled'}>परम् ›</button>
   <button id="sg">${multiS(b)?esc(show(unitN(b,S).split(' · ').pop())):'सम्पूर्णम्'}</button><button id="cp">लिङ्कं प्रतिलिखतु · copy link</button></div></div>`;
  $('#info').textContent='';wireMetres($('#out'));
  $('#pv').onclick=()=>openVerse(bid,all[ix-1][0],all[ix-1][1]);$('#nx').onclick=()=>openVerse(bid,all[ix+1][0],all[ix+1][1]);
  $('#sg').onclick=()=>openSarga(bid,S,Vn);$('#cp').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(location.href);$('#cp').textContent='✓'};
  if(push)history.replaceState(null,'',`#${bid}/${S}/${Vn}`);syncNav();window.scrollTo({top:0,behavior:'smooth'});
}
async function openSarga(bid,s,hl,push=true){
  const t=await text(bid), b=B(bid), vs=t.v.filter(x=>x[0]===s), sg=b.sargas.map(x=>x[0]), k=sg.indexOf(s);
  Object.assign(SEL,{book:bid,s,v:hl||null,work:b.work,metre:null});
  $('#info').textContent=`${show(bookName(b))} · ${multiS(b)?show(unitN(b,s))+' · ':''}${vs.length}`;
  $('#out').innerHTML=`<div class="nav" style="margin:0 0 8px"><button id="ov">‹ ${esc(show(bookName(b)))}</button>${k>0?`<button id="ps">‹ ${esc(show(unitN(b,sg[k-1])))}</button>`:''}${k<sg.length-1?`<button id="ns">${esc(show(unitN(b,sg[k+1])))} ›</button>`:''}</div>
   <div class="sarga">`+vs.map(x=>`<div class="vs${x[1]===hl?' on':''}" id="v${x[1]}"><div class="n" title="open">${x[1]}</div><div><div class="v">${bodyHTML(x[2],x[3])}</div>${x[3]?`<div class="mt">${metreLink(x[3])}</div>`:''}</div></div>`).join('')+`</div>`;
  wireMetres($('#out'));$('#ov').onclick=()=>openBook(bid);
  if($('#ps'))$('#ps').onclick=()=>openSarga(bid,sg[k-1]);if($('#ns'))$('#ns').onclick=()=>openSarga(bid,sg[k+1]);
  $$('.sarga .vs').forEach(el=>{el.ondblclick=()=>openVerse(bid,s,+el.id.slice(1));el.querySelector('.n').onclick=()=>openVerse(bid,s,+el.id.slice(1))});
  if(push)history.replaceState(null,'',`#${bid}/${s}`);syncNav();
  if(hl&&$('#v'+hl))$('#v'+hl).scrollIntoView({block:'center'});else window.scrollTo({top:0});
}
async function openBook(bid,push=true){
  const b=B(bid);if(!multiS(b))return openSarga(bid,b.sargas[0][0],0,push);
  const t=await text(bid);Object.assign(SEL,{book:bid,s:null,v:null,work:b.work,metre:null});
  const first={};t.v.forEach(x=>{if(!first[x[0]])first[x[0]]=x[2][0]});
  $('#info').textContent='';
  $('#out').innerHTML=`<div class="card"><div class="hd"><span>${esc(show(W(b.work).title))}</span><span>${b.verses}</span></div><h2 class="nm">${esc(show(bookName(b)))}</h2>
   <ul class="sgl">${b.sargas.map(([s,n])=>`<li data-s="${s}"><span class="n">${esc(show(unitN(b,s)))}</span><span class="pd">${esc(show(first[s]||''))} …</span><span class="mt">${n}</span></li>`).join('')}</ul></div>`;
  $$('.sgl li').forEach(li=>li.onclick=()=>openSarga(bid,li.dataset.s));
  if(push)history.replaceState(null,'',`#${bid}`);syncNav();window.scrollTo({top:0});
}
function openWork(wid,push=true){
  const w=W(wid);if(!multiB(w))return openBook(w.books[0],push);
  Object.assign(SEL,{book:null,s:null,v:null,work:wid,metre:null});OPEN.work=wid;
  $('#info').textContent='';
  $('#out').innerHTML=`<div class="card"><div class="hd"><span>${esc(show(w.note||''))}</span><span>${w.verses}</span></div><h2 class="nm">${esc(show(w.title))}</h2>
   <ul class="sgl">${wb(w).map(b=>`<li data-b="${b.id}"><span class="n">${esc(show(b.title))}</span><span class="pd">${b.sargas.length>1?`${b.sargas.length} ${esc(show(b.units[0]||''))}`:''}</span><span class="mt">${b.verses}</span></li>`).join('')}</ul></div>`;
  $$('.sgl li').forEach(li=>li.onclick=()=>openBook(li.dataset.b));
  if(push)history.replaceState(null,'',`#w/${wid}`);syncNav();window.scrollTo({top:0});
}
async function openMetre(slug,push=true){
  const d=CAT.metres.find(x=>x.slug===slug);if(!d)return;SEL.metre=slug;if(TAB!=='metres')setTab('metres',false);
  $('#info').textContent='';
  $('#out').innerHTML=`<div class="card"><div class="hd"><span>छन्दः · metre</span><span>${d.n}</span></div><h2 class="nm">${esc(show(d.dev))}</h2>${d.note?`<p class="note">${esc(d.note)}</p>`:''}${d.link?`<p><a class="ml" href="shloka.html#m/${d.link}">छन्दःपरिचयः · lakṣaṇa and gaṇas ›</a></p>`:''}</div><div id="mlist"></div>`;
  if(d.file){const rows=await get(C.dir+'/m/'+slug+'.json');listInto($('#mlist'),rows.filter(r=>okScope(r[1])).map(r=>[r[0],r[1],r[2],r[3],0]))}
  if(push)history.replaceState(null,'','#m/'+slug);syncNav();
}
function listInto(el,rows){let n=LIMIT;const draw=()=>{
    el.innerHTML='<ul class="res">'+rows.slice(0,n).map((r,i)=>`<li data-i="${i}"><span class="pd">${esc(show(r[0]))}</span><span class="rf">${esc(ref(r[1],r[2],r[3]))}${r[4]?' · '+'abcdef'[r[4]]:''}</span></li>`).join('')+'</ul>'+(rows.length>n?`<button class="more">+ ${rows.length-n}</button>`:'');
    el.querySelectorAll('.res li').forEach(li=>li.onclick=()=>{const r=rows[+li.dataset.i];openVerse(r[1],r[2],r[3])});
    const mb=el.querySelector('.more');if(mb)mb.onclick=()=>{n+=LIMIT;draw()}};draw()}
function list(rows){$('#out').innerHTML='<div id="lst"></div>';listInto($('#lst'),rows)}
const scope=()=>$('#fw').value;
const okScope=bid=>{const s=scope();return !s||B(bid).work===s};
async function byLetter(fn,lab){
  $$('.alpha button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===fn));
  const sc=scope()||(CAT.small?'all':null);
  if(!sc){$('#info').textContent='';$('#out').innerHTML='<p class="note">Choose a text in the box above to list its lines by letter.</p>';return}
  let rows;try{rows=await get(`${C.dir}/a/${sc}/${fn}.json`)}catch(e){rows=[]}
  $('#info').textContent=`${lab} · ${rows.length}`;list(rows);history.replaceState(null,'','#'+fn);
}
async function search(){
  const raw=$('#q').value.trim(); if(!raw){$('#out').innerHTML='';$('#info').textContent=intro();return}
  const r2=raw.replace(/[०-९]/g,d=>'०१२३४५६७८९'.indexOf(d)).replace(/[౦-౯]/g,d=>'౦౧౨౩౪౫౬౭౮౯'.indexOf(d));
  const m=r2.match(/^(.+?)\s*(\d+(?:\s*[.:,]\s*\d+)*)$/);
  if(m){const k=loose(m[1]);const w=CAT.works.find(w=>w.aliases.some(a=>a===k))||CAT.works.find(w=>k.length>=3&&w.aliases.some(a=>a.length>=3&&(a.startsWith(k)||k.startsWith(a))));
    if(w){let n=m[2].split(/\s*[.:,]\s*/).map(Number);let b=B(w.books[0]);
      if(multiB(w)){b=wb(w).find(x=>+x.num===n[0]);n=n.slice(1);if(!b)return}
      if(!n.length)return openBook(b.id);
      if(!multiS(b))return openVerse(b.id,b.sargas[0][0],n[n.length-1]);
      const ss=n.slice(0,-1).join('.');if(n.length>1&&b.sargas.some(x=>x[0]===ss))return openVerse(b.id,ss,n[n.length-1]);
      const s2=n.join('.');if(b.sargas.some(x=>x[0]===s2))return openSarga(b.id,s2);
      const s3=b.sargas.find(x=>x[0].startsWith(s2+'.'));if(s3)return openSarga(b.id,s3[0])}}
  const q=loose(raw); if(q.length<2)return;
  const ids=CAT.books.map(b=>b.id).filter(okScope), my=++SEARCHN;const starts=[],inside=[];
  for(let i=0;i<ids.length;i++){const id=ids[i];if(my!==SEARCHN)return;
    if(ids.length>8)$('#info').textContent=`… ${Math.round(100*i/ids.length)}%`;
    const k=await keys(id),t=await text(id);
    k.forEach((pk,vi)=>{const vv=t.v[vi];pk.forEach((key,pi)=>{if(key.startsWith(q))starts.push([vv[2][pi],id,vv[0],vv[1],pi]);else if(key.includes(q))inside.push([vv[2][pi],id,vv[0],vv[1],pi])})});
    if(starts.length+inside.length>5000)break}
  $('#info').textContent=`${starts.length+inside.length}${starts.length+inside.length>5000?'+':''} · “${raw}”`;list(starts.concat(inside));
}
let SEARCHN=0;
const intro=()=>`${CAT.total.toLocaleString('en-IN')} ${C.unitWord} · ${CAT.works.length} texts — choose a letter, a text or a chapter, or search`;
/* ---------- side panels ---------- */
function panelTo(box,el){const b=box.getBoundingClientRect(),r=el.getBoundingClientRect(),top=Math.max(b.top,0),bot=Math.min(b.bottom,innerHeight);if(r.top<top||r.bottom>bot)box.scrollTop+=r.top-top-Math.max(40,(bot-top)/3)}
function chips(b){const vn=SEL.book===b.id&&TX[b.id]?(()=>{const s=multiS(b)?SEL.s:b.sargas[0][0];if(s==null)return'';const vs=TX[b.id].v.filter(x=>x[0]===s);
    return `<div class="chips vn"><span class="lab">${multiS(b)?esc(show(unitN(b,s))):''}</span>${vs.map(x=>`<button class="${SEL.v===x[1]?'on':''}" data-b="${b.id}" data-s="${s}" data-v="${x[1]}">${x[1]}</button>`).join('')}</div>`})():'';
  return (multiS(b)?`<div class="chips"><span class="lab">${esc(show(b.units.join(' · ')))}</span>${b.sargas.map(([s,n])=>`<button class="${SEL.book===b.id&&SEL.s===s?'on':''}" data-b="${b.id}" data-s="${s}" title="${n}">${s}</button>`).join('')}</div>`:'')+vn}
function drawLeft(){
  const box=$('#texts');let h='';
  for(const [g,ws] of CAT.groups){h+=`<div class="ldiv">${esc(show(g))}</div>`;
    for(const wid of ws){const w=W(wid),open=OPEN.work===wid,on=SEL.work===wid;let inner='';
      if(open){if(multiB(w))inner='<div class="sub2">'+wb(w).map(b=>`<div class="it${SEL.book===b.id?' on':''}"><button class="ttl" data-b="${b.id}"><span class="nm">${esc(show(b.title))}</span><small>${b.verses}</small></button>${OPEN.book===b.id?`<div class="sub2">${chips(b)}</div>`:''}</div>`).join('')+'</div>';
        else inner=`<div class="sub2">${chips(B(w.books[0]))}</div>`}
      h+=`<div class="it${on?' on':''}"><button class="ttl" data-w="${wid}"><span class="nm">${esc(show(w.title))}</span><small>${w.note?esc(show(w.note))+' · ':''}${w.verses}</small></button>${inner}</div>`}}
  box.innerHTML=h;
  box.querySelectorAll('button.ttl[data-w]').forEach(x=>x.onclick=()=>{const wid=x.dataset.w;if(OPEN.work===wid&&!SEL.book){OPEN.work=null;SEL.work=null;drawLeft();return}OPEN.work=wid;OPEN.book=null;openWork(wid)});
  box.querySelectorAll('button.ttl[data-b]').forEach(x=>x.onclick=()=>{OPEN.book=x.dataset.b;openBook(x.dataset.b)});
  box.querySelectorAll('.chips button[data-s]').forEach(x=>x.onclick=()=>x.dataset.v?openVerse(x.dataset.b,x.dataset.s,+x.dataset.v):openSarga(x.dataset.b,x.dataset.s));
  const act=box.querySelector('.vn button.on')||box.querySelector('.chips button.on')||[...box.querySelectorAll('.it.on')].pop();if(act)panelTo(box,act);
}
function drawRight(){
  $$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===TAB));
  const box=$('#right');
  if(TAB==='metres'){box.innerHTML=CAT.metres.map(d=>`<div class="it${SEL.metre===d.slug?' on':''}"><button class="ttl" data-m="${d.slug}"><span class="nm">${esc(show(d.dev))}</span><small>${esc(show(d.kind||''))} · ${d.n}</small></button></div>`).join('');
    box.querySelectorAll('button.ttl').forEach(b=>b.onclick=()=>openMetre(b.dataset.m))}
  else{const az=[...CAT.works].sort((a,b)=>a.title.localeCompare(b.title,'hi'));let last='',h='';
    for(const w of az){const L=w.title[0];if(L!==last){h+=`<div class="ldiv">${esc(show(L))}</div>`;last=L}
      h+=`<div class="it${SEL.work===w.id?' on':''}"><button class="ttl" data-w="${w.id}"><span class="nm">${esc(show(w.title))}</span><small>${w.verses}</small></button></div>`}
    box.innerHTML=h;box.querySelectorAll('button.ttl').forEach(b=>b.onclick=()=>{OPEN.work=b.dataset.w;openWork(b.dataset.w)})}
  const act=[...box.querySelectorAll('.it.on')].pop();if(act)panelTo(box,act);
}
function syncNav(){if(SEL.book){OPEN.work=B(SEL.book).work;OPEN.book=SEL.book}drawLeft();drawRight()}
function setTab(t,draw=true){TAB=t;try{localStorage.setItem(C.dir+'-tab',t)}catch(e){}if(draw)drawRight();else $$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===TAB))}
function drawStatic(){
  const sc=scope()||(CAT.small?'all':CAT.works[0].id), L=CAT.letters[sc]||[];
  $('#alpha').innerHTML=L.map(([f,l,n])=>`<button data-f="${f}" title="${n}">${esc(show(l))}</button>`).join('');
  $$('.alpha button').forEach(b=>b.onclick=()=>byLetter(b.dataset.f,b.textContent));
}
function fillScope(){const v=$('#fw').value;$('#fw').innerHTML=(CAT.small?'<option value="">सर्वे ग्रन्थाः · all texts</option>':'')+CAT.groups.map(([g,ws])=>`<optgroup label="${esc(show(g))}">${ws.map(w=>`<option value="${w}">${esc(show(W(w).title))}</option>`).join('')}</optgroup>`).join('');if(v)$('#fw').value=v}
function setScript(s){SCRIPT=s;try{localStorage.setItem('sl-script',s)}catch(e){}
  document.body.className='s-'+s;$$('#script button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s));fillScope();drawStatic();drawLeft();drawRight();route()}
async function route(){const h=decodeURIComponent(location.hash.slice(1));if(!h){$('#info').textContent=intro();return}
  const p=h.split('/');
  if(/^L\d\d$/.test(p[0])){const L=(CAT.letters[scope()||(CAT.small?'all':CAT.works[0].id)]||[]).find(x=>x[0]===p[0]);return byLetter(p[0],L?show(L[1]):'')}
  if(p[0]==='m'&&p[1])return openMetre(p[1],false);
  if(p[0]==='w'&&p[1])return openWork(p[1],false);
  if(B(p[0])){if(p[2])return openVerse(p[0],p[1],+p[2],false);if(p[1])return openSarga(p[0],p[1],0,false);return openBook(p[0],false)}
  if(W(p[0]))return openWork(p[0],false)}
(async()=>{CAT=await get(C.dir+'/catalog.json');
  $$('#script button').forEach(b=>b.onclick=()=>setScript(b.dataset.s));
  $$('.tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  if(matchMedia('(max-width:1080px)').matches){$('#lp').classList.add('shut');$('#rp').classList.add('shut')}
  $$('.panel>.ph').forEach(h=>h.onclick=()=>{if(matchMedia('(max-width:1080px)').matches)h.parentElement.classList.toggle('shut')});
  let tm;$('#q').addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(search,350)});
  $('#fw').onchange=()=>{drawStatic();$('#q').value?search():(location.hash.match(/^#L\d\d/)?route():$('#fw').value?openWork($('#fw').value):null)};
  window.addEventListener('hashchange',route);
  setScript(SCRIPT);
})();
