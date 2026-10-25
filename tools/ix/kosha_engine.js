/* Kośa search page */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let SCRIPT='dv', MODE='paryaya', KO={}, DH=null, REV=null, MW={}, CAT=null;
try{SCRIPT=localStorage.getItem('sl-script')||'dv';MODE=localStorage.getItem('ko-mode')||'paryaya'}catch(e){}
/*TRANSLIT*/
/*I2D*/
/* Devanagari → SLP1 */
const DV={'अ':'a','आ':'A','इ':'i','ई':'I','उ':'u','ऊ':'U','ऋ':'f','ॠ':'F','ऌ':'x','ॡ':'X','ए':'e','ऐ':'E','ओ':'o','औ':'O'};
const DM={'ा':'A','ि':'i','ी':'I','ु':'u','ू':'U','ृ':'f','ॄ':'F','ॢ':'x','ॣ':'X','े':'e','ै':'E','ो':'o','ौ':'O'};
const DC={'क':'k','ख':'K','ग':'g','घ':'G','ङ':'N','च':'c','छ':'C','ज':'j','झ':'J','ञ':'Y','ट':'w','ठ':'W','ड':'q','ढ':'Q','ण':'R','त':'t','थ':'T','द':'d','ध':'D','न':'n','प':'p','फ':'P','ब':'b','भ':'B','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'S','ष':'z','स':'s','ह':'h','ळ':'L'};
function d2s(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(DC[c]){o+=DC[c];if(n==='्'){i++}else if(DM[n]){o+=DM[n];i++}else o+='a'}
  else if(DV[c])o+=DV[c];else if(c==='ं')o+='M';else if(c==='ः')o+='H';else if(c==='ँ')o+='~';else if(c==='ऽ')o+="'";else if(c!==' ')o+=''}return o}
const SV={a:'अ',A:'आ',i:'इ',I:'ई',u:'उ',U:'ऊ',f:'ऋ',F:'ॠ',x:'ऌ',X:'ॡ',e:'ए',E:'ऐ',o:'ओ',O:'औ'}, SM={a:'',A:'ा',i:'ि',I:'ी',u:'ु',U:'ू',f:'ृ',F:'ॄ',x:'ॢ',X:'ॣ',e:'े',E:'ै',o:'ो',O:'ौ'};
const SC=Object.fromEntries(Object.entries(DC).map(([d,s])=>[s,d]));
function s2d(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(SC[c]){o+=SC[c];if(SM[n]!==undefined){o+=SM[n];i++}else o+='्'}
  else if(SV[c])o+=SV[c];else if(c==='M')o+='ं';else if(c==='H')o+='ः';else if(c==='~')o+='ँ';else if(c==="'")o+='ऽ';else o+=c}return o}
const toSLP=q=>d2s(toDev(q.trim()));
const RANKS='a A i I u U f F x X e E o O k K g G N c C j J Y w W q Q R t T d D n p P b B m y r l v S z s h'.split(' ');
const LIN={P:'पुं॰',S:'स्त्री॰',N:'नपुं॰',A:'अव्य॰',T:'त्रि॰'};
const get=u=>fetch(u).then(r=>r.json());
async function kosha(id){if(!KO[id])KO[id]=await get('ko/'+id+'.json');return KO[id]}
/* ---------- modes ---------- */
async function paryaya(q){
  const k=loose(toDev(q));if(k.length<2){$('#out').innerHTML='';return}
  let h='',n=0;
  for(const m of CAT.kosha){const K=await kosha(m.id);if(!K._k)K._k=K.words.map(w=>loose(w[0]));
    const hits=[];K.words.forEach((w,i)=>{if(K._k[i]===k)hits.unshift(i);else if(K._k[i].startsWith(k))hits.push(i)});
    const seen=new Set();
    for(const i of hits){const w=K.words[i];if(seen.has(w[3]+'|'+w[2]))continue;seen.add(w[3]+'|'+w[2]);if(++n>60)break;
      const syn=K.sets[w[3]], v=K.verses[w[4]], lg=Object.fromEntries(K.words.filter(x=>x[3]===w[3]).map(x=>[x[0],x[1]]));
      h+=`<div class="card"><div class="hd"><span>${esc(show(K.title))} · ${esc(v[0])}</span><span>${esc(show(w[2]||''))}</span></div>
        <div class="syn">${syn.map(s=>`<button class="chip${s===w[0]?' on':''}" data-w="${esc(s)}">${esc(show(s))}<small>${esc(show(LIN[lg[s]]||''))}</small></button>`).join('')}</div>
        <details><summary class="note">मूलश्लोकः · source verse</summary><div class="v src">${esc(show(v[1]))}</div></details></div>`}}
  $('#info').textContent=n?`${Math.min(n,60)} synonym groups · “${q}”`:'';
  $('#out').innerHTML=h||`<p class="note">No synonym group for “${esc(q)}” in the kośas. Try the meaning search, or the search by ending.</p>`;
  $$('#out .chip').forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.w;run()});
}
async function shard(c){const r=RANKS.indexOf(c);if(r<0)return[];const f='L'+String(r).padStart(2,'0');if(!MW[f]){try{MW[f]=await get('ko/mw/'+f+'.json')}catch(e){MW[f]=[]}}return MW[f]}
async function artha(q){
  const s=toSLP(q);if(!s){$('#out').innerHTML='';return}
  const rows=await shard(s[0]);const ex=rows.filter(r=>r[0]===s), pre=rows.filter(r=>r[0]!==s&&r[0].startsWith(s)).slice(0,150);
  $('#info').textContent=`${ex.length+pre.length} headwords · Monier-Williams`;
  $('#out').innerHTML='<ul class="res mw">'+ex.concat(pre).map(r=>`<li><span class="pd">${esc(show(s2d(r[0])))}</span><span class="gl">${esc(r[1])}</span></li>`).join('')+'</ul>';
}
async function anta(q){
  if(!REV)REV=await get('ko/rev.json');
  const s=toSLP(q);if(s.length<1){$('#out').innerHTML='';return}
  const hits=REV.filter(h=>h.endsWith(s)&&h!==s);
  $('#info').textContent=`${hits.length} words end in “-${show(s2d(s))}”`;
  $('#out').innerHTML=`<div class="ends">${hits.slice(0,1500).map(h=>`<button class="chip" data-h="${h}">${esc(show(s2d(h)))}</button>`).join('')}</div>${hits.length>1500?`<p class="note">first 1,500 shown — type a longer ending to narrow</p>`:''}`;
  $$('#out .chip').forEach(b=>b.onclick=()=>{setMode('artha',false);$('#q').value=show(s2d(b.dataset.h));run()});
}
async function dhatu(q){
  if(!DH)DH=await get('ko/dhatu.json');
  const g=$('#gana').value, k=loose(toDev(q)), lq=q.trim().toLowerCase();
  let rows=DH.filter(d=>!g||d[3]===g);
  if(q.trim())rows=rows.filter(d=>loose(d[1]).startsWith(k)||loose(d[2]).startsWith(k)||d[6].includes(q.trim())||(lq.length>2&&(d[7].toLowerCase().includes(lq)||d[8].includes(q.trim()))));
  const GN=['','भ्वादिः','अदादिः','जुहोत्यादिः','दिवादिः','स्वादिः','तुदादिः','रुधादिः','तनादिः','क्र्यादिः','चुरादिः'], PD={P:'परस्मैपदी',A:'आत्मनेपदी',U:'उभयपदी'}, ST={S:'सेट्',A:'अनिट्',V:'वेट्'};
  $('#info').textContent=`${rows.length} dhātus`;
  $('#out').innerHTML='<div class="dh">'+rows.slice(0,400).map(d=>`<div class="card dk"><div class="hd"><span>${esc(show(GN[+d[3]]||''))} · ${esc(d[0])}</span><span>${esc(show(PD[d[4]]||d[4]))} · ${esc(show(ST[d[5]]||d[5]))}</span></div>
     <h2 class="nm">${esc(show(d[1]))} <small class="mt">${esc(show(d[2]))}</small></h2><div class="v">${esc(show(d[6]))}</div><div class="note">${esc(d[7])}${d[8]?' · '+esc(d[8]):''}</div>
     ${d[9]&&d[9].length?`<details><summary class="note">उपसर्गाः · with prefixes (${d[9].length})</summary><div class="note">${d[9].map(u=>`<b>${esc(show(u[0]))}</b> ${esc(u[1])}`).join(' · ')}</div></details>`:''}</div>`).join('')+'</div>';
}
async function browse(){
  const id=$('#kb').value||'amara', K=await kosha(id), sec=$('#ks').value;
  const secs=[...new Set(K.verses.map(v=>v[0].split('.').slice(0,K.units.length).join('.')))];
  if(!$('#ks').dataset.k||$('#ks').dataset.k!==id){$('#ks').innerHTML=secs.map(s=>`<option value="${s}">${esc(show(K.units.map((u,i)=>u+' '+s.split('.')[i]).join(' · ')))}</option>`).join('');$('#ks').dataset.k=id}
  const cur=$('#ks').value||secs[0], vs=K.verses.map((v,i)=>[v,i]).filter(([v])=>v[0].startsWith(cur+'.'));
  $('#info').textContent=`${K.title} · ${K.author} · ${vs.length} verses`;
  $('#out').innerHTML='<div class="sarga">'+vs.map(([v,i])=>{const ws=K.words.filter(w=>w[4]===i);
    return `<div class="vs"><div class="n">${esc(v[0])}</div><div><div class="v">${esc(show(v[1]))}</div>${ws.length?`<div class="syn sm">${[...new Map(ws.map(w=>[w[3]+w[2],w])).values()].map(w=>`<span class="tag">${esc(show(w[2]))}</span>`).join(' ')}</div>`:''}</div></div>`}).join('')+'</div>';
}
const MODES={paryaya:[paryaya,'पर्यायशब्दान्वेषणम् · find synonyms — type a word: देव, agni, సూర్య','synonyms of a word in the Amarakośa, Halāyudha’s Abhidhānaratnamālā and Yādava’s Vaijayantī, with gender and the source verse'],
  artha:[artha,'शब्दार्थः · meaning — type a word: dharma, अग्नि','headwords of the Monier-Williams Sanskrit–English Dictionary with a short meaning; type the beginning of a word'],
  anta:[anta,'अन्त्यानुक्रमः · words ending in — type an ending: आयन, tva, ఆకర','every dictionary word that ends in the letters you type, in reverse alphabetical order (like a pratiloma kośa)'],
  dhatu:[dhatu,'धातुपाठः · roots — type a root or a meaning: भू, गम्, to go','the Pāṇinian Dhātupāṭha: gaṇa, pada, seṭ/aniṭ, meaning, and meanings with upasargas'],
  browse:[browse,'','read the kośas verse by verse, kāṇḍa and varga']};
function setMode(m,go=true){MODE=m;try{localStorage.setItem('ko-mode',m)}catch(e){}
  $$('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
  $('#q').placeholder=MODES[m][1];$('#mdesc').textContent=MODES[m][2];
  $('#q').hidden=m==='browse';$('#gana').hidden=m!=='dhatu';$('#kb').hidden=$('#ks').hidden=m!=='browse';
  if(go)run()}
let tm;function run(){const q=$('#q').value;if(MODE==='browse')return browse();if(!q.trim()&&MODE!=='dhatu'){$('#out').innerHTML='';$('#info').textContent='';return}MODES[MODE][0](q)}
function setScript(s){SCRIPT=s;try{localStorage.setItem('sl-script',s)}catch(e){}document.body.className='s-'+s;$$('#script button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s));run()}
(async()=>{CAT=await get('ko/catalog.json');
  $('#kb').innerHTML=CAT.kosha.map(k=>`<option value="${k.id}">${k.title} · ${k.author}</option>`).join('');
  $('#gana').innerHTML='<option value="">सर्वे गणाः · all gaṇas</option>'+['भ्वादिः','अदादिः','जुहोत्यादिः','दिवादिः','स्वादिः','तुदादिः','रुधादिः','तनादिः','क्र्यादिः','चुरादिः'].map((g,i)=>`<option value="${i+1}">${i+1} ${g}</option>`).join('');
  $('#stats').textContent=`${CAT.kosha.map(k=>`${k.title} ${k.words.toLocaleString('en-IN')} words`).join(' · ')} · Dhātupāṭha ${CAT.dhatu} roots · Monier-Williams ${CAT.mw.toLocaleString('en-IN')} headwords`;
  $$('#modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  $$('#script button').forEach(b=>b.onclick=()=>setScript(b.dataset.s));
  $('#q').addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(run,300)});
  $('#gana').onchange=run;$('#kb').onchange=()=>{$('#ks').dataset.k='';browse()};$('#ks').onchange=browse;
  const h=new URLSearchParams(location.search);if(h.get('m'))MODE=h.get('m');if(h.get('q'))$('#q').value=h.get('q');
  setMode(MODE,false);setScript(SCRIPT);
})();
