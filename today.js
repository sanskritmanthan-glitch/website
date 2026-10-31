/* अद्य · Today panel on the home page: today's śloka (→ greeting card), latest article, Gītā verse and sūtra of the day, greeting-card and app links. Also shows the visitor count in the footer. */
(()=>{const box=document.getElementById('todayp');if(!box)return;
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=u=>fetch(u).then(r=>r.ok?r.json():Promise.reject(u));
const UI={
 te:{h:'నేడు · अद्य',sl:'నేటి శ్లోకం',card:'ఈ శ్లోకంతో శుభాకాంక్షల కార్డు',art:'నేటి వ్యాసం',more:'పూర్తిగా చదవండి',all:'అన్ని వ్యాసాలు',gita:'నేటి గీతా శ్లోకం',sut:'నేటి సూత్రం',gr:'శుభాకాంక్షల కార్డులు',grs:'మీ ఫోటో, పేరుతో సంస్కృత శ్లోకం — 22 భాషల్లో అర్థం',mk:'కార్డు తయారు చేయండి',lis:'వినండి',vis:'సందర్శకులు',nm:'సంస్కృత పేర్లు',nms:'శిశువుకు పేరు — మొదటి అక్షరం, జన్మ నక్షత్రం లేదా పుట్టిన తేదీ-సమయం ప్రకారం; పేరు అర్థం కూడా',nmb:'పేర్లు చూడండి'},
 sa:{h:'अद्य',sl:'अद्यतनः श्लोकः',card:'अनेन श्लोकेन शुभकामनापत्रम्',art:'अद्यतनः लेखः',more:'सम्पूर्णं पठतु',all:'सर्वे लेखाः',gita:'अद्यतनः गीताश्लोकः',sut:'अद्यतनं सूत्रम्',gr:'शुभकामनापत्राणि',grs:'स्वचित्रेण नाम्ना च संस्कृतश्लोकः — द्वाविंशतिभाषासु अर्थः',mk:'पत्रं रचयतु',lis:'शृणोतु',vis:'आगन्तारः',nm:'संस्कृतनामानि',nms:'शिशोः नाम — आद्याक्षरेण, जन्मनक्षत्रेण, जन्मसमयेन वा; नाम्नः अर्थः अपि',nmb:'नामानि पश्यतु'},
 hi:{h:'आज · अद्य',sl:'आज का श्लोक',card:'इस श्लोक से शुभकामना कार्ड',art:'आज का लेख',more:'पूरा पढ़ें',all:'सभी लेख',gita:'आज का गीता श्लोक',sut:'आज का सूत्र',gr:'शुभकामना कार्ड',grs:'अपनी फ़ोटो और नाम के साथ संस्कृत श्लोक — 22 भाषाओं में अर्थ',mk:'कार्ड बनाएँ',lis:'सुनें',vis:'आगंतुक',nm:'संस्कृत नाम',nms:'शिशु का नाम — पहले अक्षर, जन्म नक्षत्र या जन्म तिथि-समय से; नाम का अर्थ भी',nmb:'नाम देखें'},
 en:{h:'Today · अद्य',sl:"Today's śloka",card:'Make a greeting card with this śloka',art:"Today's article",more:'Read more',all:'All articles',gita:'Gītā verse of the day',sut:'Sūtra of the day',gr:'Greeting cards',grs:'A Sanskrit śloka with your photo and names — meaning in 22 Indian languages',mk:'Make a card',lis:'Listen',vis:'Visitors',nm:'Sanskrit baby names',nms:'Choose a name by first letter, birth star, or date and time of birth — and find the meaning of any name',nmb:'Find a name'}};
const lang=()=>{const l=document.documentElement.lang;return UI[l]?l:'en'};
const day=Math.floor((Date.now()-new Date(2026,0,1))/864e5), iso=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const FAV=['2.47','2.20','2.14','2.62','2.63','3.21','3.35','4.7','4.8','4.38','6.5','6.6','9.22','9.26','12.13','12.14','18.66','18.78','2.48','2.50','3.19','5.18','6.17','6.35','7.19','10.20','11.32','13.28','15.7','16.21','17.20'];
const SV={a:'अ',A:'आ',i:'इ',I:'ई',u:'उ',U:'ऊ',f:'ऋ',F:'ॠ',x:'ऌ',e:'ए',E:'ऐ',o:'ओ',O:'औ'},SM={a:'',A:'ा',i:'ि',I:'ी',u:'ु',U:'ू',f:'ृ',F:'ॄ',x:'ॢ',e:'े',E:'ै',o:'ो',O:'ौ'},
 SC={k:'क',K:'ख',g:'ग',G:'घ',N:'ङ',c:'च',C:'छ',j:'ज',J:'झ',Y:'ञ',w:'ट',W:'ठ',q:'ड',Q:'ढ',R:'ण',t:'त',T:'थ',d:'द',D:'ध',n:'न',p:'प',P:'फ',b:'ब',B:'भ',m:'म',y:'य',r:'र',l:'ल',v:'व',S:'श',z:'ष',s:'स',h:'ह'};
const s2d=s=>{let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(SC[c]){o+=SC[c];if(SM[n]!==undefined){o+=SM[n];i++}else o+='्'}else if(SV[c])o+=SV[c];else if(c==='M')o+='ं';else if(c==='H')o+='ः';else if(c==="'")o+='ऽ';else if(c!=='~'&&c!=='^'&&c!=='\\')o+=c}return o};
const verse=lines=>lines.map((x,i)=>esc(x)+((lines.length===2?i===0:i%2&&i!==lines.length-1)?' ।':'')).join('<br>')+' ॥';
const VMAP=[[/[ऀ-ॿ]/,['hi-IN','hi','mr','ne','sa']],[/[ఀ-౿]/,['te-IN','te']],[/[ಀ-೿]/,['kn-IN','kn']],[/[஀-௿]/,['ta-IN','ta']],[/[ഀ-ൿ]/,['ml-IN','ml']],[/[ঀ-৿]/,['bn-IN','bn','as']],[/[઀-૿]/,['gu-IN','gu']],[/[଀-୿]/,['or-IN','or']],[/[਀-੿]/,['pa-IN','pa']],[/[؀-ۿ]/,['ur-IN','ur','ur-PK']]];
function voiceFor(text){const vs=speechSynthesis.getVoices();const m=VMAP.find(([re])=>re.test(text));const want=m?m[1]:['en-IN','en-GB','en-US','en'];
  for(const w of want){const v=vs.find(v=>v.lang.replace('_','-').toLowerCase()===w.toLowerCase())||vs.find(v=>v.lang.toLowerCase().startsWith(w.toLowerCase()));if(v)return [v,want[0]]}return [null,want[0]]}
function speak(t,note){try{const S=speechSynthesis;S.cancel();const go=()=>{let missing=false;
    // read each script with its own voice: Sanskrit/Hindi, Telugu, English…
    const runs=t.replace(/\s+/g,' ').match(/[ऀ-ॿ।॥][ऀ-ॿ।॥\s,.;!?'’ऽ-]*|[ఀ-౿][ఀ-౿\s,.;!?-]*|[^ऀ-ॿఀ-౿]+/g)||[t];
    for(const r of runs){if(!/\p{L}/u.test(r))continue;const [v,lang]=voiceFor(r);if(!v&&lang!=='en-IN')missing=true;const u=new SpeechSynthesisUtterance(r.trim());u.lang=lang;if(v)u.voice=v;u.rate=.85;S.speak(u)}
    if(missing&&note)note.innerHTML='🔇 This browser has no Sanskrit/Hindi voice installed. Use <b>Google Chrome</b> or <b>Microsoft Edge</b>, or on Windows add one: <i>Settings ▸ Time &amp; language ▸ Speech ▸ Add voices ▸ Hindi</i>; on Android: <i>Settings ▸ Text-to-speech ▸ Install voice data ▸ Hindi</i>.'};
  if(S.getVoices().length)go();else{S.onvoiceschanged=()=>{S.onvoiceschanged=null;go()};setTimeout(go,700)}}catch(e){}}
let DATA={};
const LANGS=[['as','অসমীয়া'],['bn','বাংলা'],['brx','बड़ो'],['doi','डोगरी'],['en','English'],['gu','ગુજરાતી'],['hi','हिन्दी'],['kn','ಕನ್ನಡ'],['ks','کٲشُر'],['gom','कोंकणी'],['mai','मैथिली'],['ml','മലയാളം'],['mni','ꯃꯩꯇꯩꯂꯣꯟ'],['mr','मराठी'],['ne','नेपाली'],['or','ଓଡ଼ିଆ'],['pa','ਪੰਜਾਬੀ'],['sa','संस्कृतम्'],['sat','ᱥᱟᱱᱛᱟᱲᱤ'],['sd','سنڌي'],['ta','தமிழ்'],['te','తెలుగు'],['ur','اردو']];
let ML=null;try{ML=localStorage.getItem('sm-mlang')}catch(e){}
const mlang=()=>{const D=DATA,L=lang();if(ML&&D.sl.tr[ML])return ML;if(D.sl.tr[L])return L;return 'en'};
const mm=()=>(DATA.sl.tr[mlang()]||DATA.sl.tr.en||{}).m||'';
async function load(){const [g,tr,arts,gt,su]=await Promise.all([get('g/slokas.json'),get('g/tr.json').catch(()=>({})),get('articles.json').catch(()=>[]),get('su/t/bhagavadgita.json').catch(()=>null),get('vy/sutras.json').catch(()=>null)]);
  const sl=g.slokas.find(s=>s.date===iso)||g.slokas[day%g.slokas.length];const t=(tr.occ||{})[sl.occ]||{};sl.tr=Object.assign({},t,sl.tr);
  const [a,b]=FAV[new Date().getDate()-1].split('.'),gv=gt&&gt.v.find(x=>x[0]===a&&+x[1]===+b);
  let sut=null;if(su){const ks=Object.keys(su).filter(k=>k.startsWith('ashtadhyayi:'));const k=ks[(day*37)%ks.length];sut=[k.split(':')[1],s2d(su[k])]}
  DATA={sl,occ:g.occasions.find(o=>o.id===sl.occ),art:arts[0],gv:gv&&{ref:a+'.'+b,lines:gv[2]},sut};render()}
(()=>{const sc=document.createElement('script');sc.src='/g/script.js';sc.onload=()=>{try{render()}catch(e){}};document.head.appendChild(sc)})();
function render(){const u=UI[lang()],L=lang(),D=DATA;if(!D.sl)return;const m=mm(),cur=mlang();
  box.innerHTML=`<div class="tdh"><h2>${u.h}</h2><span>${new Date().toLocaleDateString(L==='en'?'en-IN':L+'-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
  <div class="tdg">
   <article class="tdc big"><span class="lab">📜 ${u.sl}</span><div class="v">${verse(D.sl.sl.split(/[।॥]/).map(x=>x.trim()).filter(Boolean).map(x=>window.SMScript&&SMScript.has(cur)?SMScript.to(x,cur):x))}</div><p class="mn" dir="auto">${esc(m)}</p><label class="tl">🌐 <select>${LANGS.filter(([k])=>D.sl.tr[k]).map(([k,n])=>`<option value="${k}"${k===cur?' selected':''}>${n}</option>`).join('')}</select></label><div class="vnote"></div>
     <div class="acts"><a class="btn" href="greetings.html?s=${D.sl.id}">🎴 ${u.card}</a><button class="btn ghost" type="button" data-say="sl">🔊 ${u.lis}</button></div></article>
   ${D.art?`<article class="tdc"><span class="lab">📰 ${u.art}</span><h3><a href="a/${D.art.slug}">${esc(D.art.title)}</a></h3><small>${D.art.date}</small><p>${esc(D.art.excerpt)}</p><div class="acts"><a class="btn ghost" href="a/${D.art.slug}">${u.more} →</a><a class="lk" href="articles">${u.all}</a></div></article>`:''}
   ${D.gv?`<article class="tdc"><span class="lab">🕉 ${u.gita}</span><div class="v sm">${verse(D.gv.lines)}</div><a class="lk" href="sutra.html#bhagavadgita/${D.gv.ref.replace('.','/')}">भगवद्गीता ${D.gv.ref} →</a> <button class="lk" type="button" data-say="gv">🔊</button></article>`:''}
   ${D.sut?`<article class="tdc"><span class="lab">📐 ${u.sut}</span><div class="v">${esc(D.sut[1])} ।</div><a class="lk" href="sutra.html#ashtadhyayi/${D.sut[0].split('.').slice(0,2).join('.')}/${D.sut[0].split('.')[2]}">अष्टाध्यायी ${D.sut[0]} →</a></article>`:''}
   <article class="tdc nmc"><span class="lab">👶 ${u.nm}</span><p>${u.nms}</p><div class="acts"><a class="btn" href="names.html">${u.nmb} →</a><a class="lk" href="names.html#dob">⭐ नक्षत्रम्</a></div></article>
   <article class="tdc gr"><span class="lab">🎴 ${u.gr}</span><p>${u.grs}</p><a class="btn" href="greetings.html">${u.mk} →</a></article>
  </div>`;
  const nt=box.querySelector('.vnote');box.querySelector('[data-say="sl"]').onclick=()=>speak(D.sl.sl.replace(/[।॥]/g,', ')+' . '+mm(),nt);const g=box.querySelector('[data-say="gv"]');if(g)g.onclick=()=>speak(D.gv.lines.join(', '),nt);
  const sel=box.querySelector('.tl select');if(sel)sel.onchange=()=>{ML=sel.value;try{localStorage.setItem('sm-mlang',ML)}catch(e){}render()};
  const v=document.getElementById('visits');if(v&&VIS)v.innerHTML=`👁 ${u.vis}: <b>${VIS.toLocaleString('en-IN')}</b>`}
const css=document.createElement('style');css.textContent=`#today{padding-block:10px 30px}.tdh{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px;margin-bottom:12px}.tdh h2{margin:0;font-size:1.7rem}.tdh span{color:var(--muted);font-size:.95rem}
.tdg{display:grid;grid-template-columns:2fr 1.3fr 1.3fr;gap:16px}.tdc{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:6px}
.tdc.big{grid-row:span 2;border-top:3px solid var(--saffron)}.tdc .lab{font-size:.85rem;color:var(--saffron);font-weight:600}.tdc .v{font-size:1.25rem;line-height:1.8}.tdc .v.sm{font-size:1.05rem}.tdc .mn{color:var(--muted);margin:2px 0}.tdc .tl{font-size:.85rem;color:var(--muted)}.tdc .tl select{font:inherit;font-size:.85rem;padding:2px 6px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink)}.tdc .vnote{font-size:.82rem;color:#a15c00}
.tdc h3{margin:0;font-size:1.15rem}.tdc h3 a{color:var(--ink);text-decoration:none}.tdc small{color:var(--muted)}.tdc p{margin:0}.tdc .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;align-items:center}
.tdc .btn{display:inline-block;background:var(--saffron);color:#fff;border:0;border-radius:20px;padding:7px 14px;text-decoration:none;font:inherit;font-size:.9rem;cursor:pointer}.tdc .btn.ghost{background:none;color:var(--saffron);border:1px solid var(--saffron)}
.tdc .lk{color:var(--saffron);text-decoration:none;font-size:.92rem;background:none;border:0;cursor:pointer;padding:0;font-family:inherit}.tdc.nmc{border-top:3px solid #1a7f37}.tdc.nmc .lab{color:#1a7f37}.tdc.nmc .btn{background:#1a7f37}
.tdc.gr{grid-column:1/-1;background:linear-gradient(135deg,#7a1730,#b4531f);color:#fff6e6;border:0}.tdc.gr .lab{color:#ffd36b}.tdc.gr .btn{background:#fff6e6;color:#7a1730;align-self:flex-start}
@media(max-width:900px){.tdg{grid-template-columns:1fr 1fr}.tdc.big{grid-column:1/-1;grid-row:auto}}@media(max-width:560px){.tdg{grid-template-columns:1fr}}`;document.head.appendChild(css);
/* re-render when the site language buttons are used */
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
/* visitor count (needs the D1 binding in Cloudflare; hidden until it works) */
let VIS=0;(async()=>{try{await new Promise(r=>setTimeout(r,1500));const r=await fetch('/api/visits');if(!r.ok)return;const j=await r.json();if(!j.ok)return;
  VIS=j.n;const v=document.getElementById('visits');if(v){v.hidden=false;render()}}catch(e){}})();
load().catch(e=>console.warn('today',e));
})();
