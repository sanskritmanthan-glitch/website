/* बोधिनी · Bodhinī — the Sanskrit Manthan helper. Free, rule-based, runs entirely in the browser:
   answers from the site's own data (books, ślokas, sūtras, kośa, dhātus), converts scripts,
   and can speak / listen using the browser's built-in speech (Web Speech API). */
(()=>{if(window.__sri)return;window.__sri=1;
const ROOT=(document.currentScript&&document.currentScript.src||'/sri.js').replace(/sri\.js.*$/,'');
const $=(s,r=document)=>r.querySelector(s), esc=t=>String(t??'').replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=u=>fetch(ROOT+u).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
const CACHE={};const once=u=>CACHE[u]||(CACHE[u]=get(u));
const LS={g(k,d){try{return localStorage.getItem('sri-'+k)??d}catch(e){return d}},s(k,v){try{localStorage.setItem('sri-'+k,v)}catch(e){}}};

/* ---------- transliteration (SLP1 internal; same rules as vy/core.js) ---------- */
const SV={a:'अ',A:'आ',i:'इ',I:'ई',u:'उ',U:'ऊ',f:'ऋ',F:'ॠ',x:'ऌ',X:'ॡ',e:'ए',E:'ऐ',o:'ओ',O:'औ'},SM={a:'',A:'ा',i:'ि',I:'ी',u:'ु',U:'ू',f:'ृ',F:'ॄ',x:'ॢ',X:'ॣ',e:'े',E:'ै',o:'ो',O:'ौ'};
const SC={k:'क',K:'ख',g:'ग',G:'घ',N:'ङ',c:'च',C:'छ',j:'ज',J:'झ',Y:'ञ',w:'ट',W:'ठ',q:'ड',Q:'ढ',R:'ण',t:'त',T:'थ',d:'द',D:'ध',n:'न',p:'प',P:'फ',b:'ब',B:'भ',m:'म',y:'य',r:'र',l:'ल',v:'व',S:'श',z:'ष',s:'स',h:'ह',L:'ळ'};
const SO={M:'ं',H:'ः','~':'ँ',"'":'ऽ'};
function s2d(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(SC[c]){o+=SC[c];if(n!==undefined&&SM[n]!==undefined){o+=SM[n];i++}else o+='्'}else if(SV[c])o+=SV[c];else if(SO[c])o+=SO[c];else if(c==='^'||c==='\\')continue;else o+=c}return o}
const DV={},DM={},DC={};for(const k in SV)DV[SV[k]]=k;for(const k in SM)if(SM[k])DM[SM[k]]=k;for(const k in SC)DC[SC[k]]=k;const DO={'ं':'M','ः':'H','ँ':'~','ऽ':"'"};
function d2s(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(DC[c]){o+=DC[c];if(n==='्'){i++}else if(DM[n]!==undefined){o+=DM[n];i++}else o+='a'}else if(DV[c])o+=DV[c];else if(DO[c])o+=DO[c];else if(c==='़')continue;else o+=c}return o}
const IA={a:'a',A:'ā',i:'i',I:'ī',u:'u',U:'ū',f:'ṛ',F:'ṝ',x:'ḷ',X:'ḹ',e:'e',E:'ai',o:'o',O:'au',k:'k',K:'kh',g:'g',G:'gh',N:'ṅ',c:'c',C:'ch',j:'j',J:'jh',Y:'ñ',w:'ṭ',W:'ṭh',q:'ḍ',Q:'ḍh',R:'ṇ',t:'t',T:'th',d:'d',D:'dh',n:'n',p:'p',P:'ph',b:'b',B:'bh',m:'m',y:'y',r:'r',l:'l',v:'v',S:'ś',z:'ṣ',s:'s',h:'h',M:'ṃ',H:'ḥ','~':'m̐',"'":"'",L:'ḷ'};
const s2i=s=>[...s].map(c=>IA[c]??(c==='^'||c==='\\'?'':c)).join('');
const shift=(s,off)=>[...s].map(c=>{const n=c.codePointAt(0);return n>=0x900&&n<=0x97f&&c!=='ऽ'&&c!=='।'&&c!=='॥'?String.fromCodePoint(n+off):c}).join('');
const t2d=s=>[...s].map(c=>{const n=c.codePointAt(0);return n>=0xc00&&n<=0xc7f?String.fromCodePoint(n-0x300):c}).join('');
const I2S=[['ai','E'],['au','O'],['kh','K'],['gh','G'],['ch','C'],['jh','J'],['ṭh','W'],['ḍh','Q'],['th','T'],['dh','D'],['ph','P'],['bh','B'],['ā','A'],['ī','I'],['ū','U'],['ṛ','f'],['ṝ','F'],['ḷ','x'],['ḹ','X'],['ṅ','N'],['ñ','Y'],['ṭ','w'],['ḍ','q'],['ṇ','R'],['ś','S'],['ṣ','z'],['ṃ','M'],['ṁ','M'],['ḥ','H']];
const H2S=[['cch','cC'],['aa','A'],['ii','I'],['uu','U'],['RRi','f'],['R^i','f'],['Ri','f'],['RR','f'],['lRi','x'],['ai','E'],['au','O'],['kh','K'],['gh','G'],['~N','N'],['N^','N'],['chh','C'],['Ch','C'],['ch','c'],['jh','J'],['~n','Y'],['JN','Y'],['Th','W'],['Dh','Q'],['th','T'],['dh','D'],['ph','P'],['bh','B'],['sh','S'],['Sh','z'],['shh','z'],['.n','M'],['.m','M'],['.h','H'],['T','w'],['D','q'],['N','R'],['G','N'],['J','Y'],['z','S'],['S','z'],['M','M'],['H','H'],['A','A'],['I','I'],['U','U'],['R','f'],['x','x']];
const HK=H2S.map(x=>x[0]).sort((a,b)=>b.length-a.length);
function toSLP(raw){let s=(raw||'').normalize('NFC').trim();if(/[ఀ-౿]/.test(s))s=t2d(s);
  if(/[ऀ-ॿ]/.test(s))return d2s(s).replace(/[।॥\s]+/g,' ').trim();
  if(/[āīūṛṝḷṅñṭḍṇśṣṃṁḥ]/i.test(s)){s=s.toLowerCase();for(const [a,b] of I2S)s=s.split(a).join(b);return s}
  let o='';for(let i=0;i<s.length;){const k=HK.find(k=>s.startsWith(k,i));if(k){o+=H2S.find(x=>x[0]===k)[1];i+=k.length}else{o+=s[i];i++}}return o.replace(/c(?=C)/g,'c')}
const toDev=s=>/[ऀ-ॿ]/.test(s)?s:s2d(toSLP(s));
function loose(s){if(/[ఀ-౿]/.test(s))s=t2d(s);if(/[ऀ-ॿ]/.test(s))s=s2i(d2s(s));
  s=s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'').replace(/sh/g,'s');return s.replace(/[nm](?=[kgcjtdpb])/g,'n')}
const isIndic=s=>/[ऀ-ॿఀ-౿]/.test(s);
const digits=s=>s.replace(/[०-९]/g,d=>'०१२३४५६७८९'.indexOf(d)).replace(/[౦-౯]/g,d=>'౦౧౨౩౪౫౬౭౮౯'.indexOf(d));
/* first-letter shard codes used by every index on the site */
const ALPHA='अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह';
const code=ch=>{const i=ALPHA.indexOf(ch);return i<0?null:'L'+String(i).padStart(2,'0')};
const ROMAN1={a:'अआऐऔ',i:'इई',u:'उऊ',e:'एऐ',o:'ओऔ',r:'ऋरॠ',l:'लऌ',k:'कख',g:'गघ',c:'चछ',j:'जझ',t:'तथटठ',d:'दधडढ',n:'नण',p:'पफ',b:'बभ',m:'म',y:'य',v:'व',w:'व',s:'सशष',h:'ह'};
function codesFor(q){let s=q.trim();if(/[ఀ-౿]/.test(s))s=t2d(s);
  if(/[ऀ-ॿ]/.test(s)){const ch=[...s].find(c=>ALPHA.includes(c));return ch?[code(ch)]:[]}
  const l=loose(s);return [...(ROMAN1[l[0]]||'')].map(code)}

/* ---------- avatar: an original illustration — a young Indian woman in a saree ---------- */
const AV=`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="sriBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7c4"/><stop offset="1" stop-color="#f3c98a"/></linearGradient></defs>
<circle cx="32" cy="32" r="32" fill="url(#sriBg)"/>
<path d="M14 64c1-11 8-17 18-17s17 6 18 17z" fill="#8f1d3a"/>
<path d="M33 47c6 1 12 5 15 12l-3 5H40c-1-7-4-12-7-17z" fill="#e0a12c"/><path d="M34 47.5c5 1.5 9 5 11.5 10" stroke="#fff3c9" stroke-width="1.2" fill="none"/>
<rect x="28" y="40" width="8" height="8" rx="3" fill="#c98a5c"/>
<ellipse cx="32" cy="27" rx="15" ry="16" fill="#1d1414"/><circle cx="44" cy="18" r="6" fill="#1d1414"/><circle cx="44.5" cy="17" r="1.6" fill="#f4f0e6"/><circle cx="46.5" cy="19.5" r="1.3" fill="#f4f0e6"/>
<ellipse cx="32" cy="30" rx="10.5" ry="12" fill="#d39a6a"/>
<path d="M21.5 27c1-8 6-12 10.5-12s9.5 4 10.5 12c-3-5-6.5-7-10.5-7.5C28 20 24.5 22 21.5 27z" fill="#1d1414"/>
<path d="M32 15.2v3.6" stroke="#b5121b" stroke-width="1.1" stroke-linecap="round"/>
<circle cx="32" cy="24.6" r="1.25" fill="#b5121b"/>
<path d="M25.5 28.2q2.3-1.5 4.4 0M34.1 28.2q2.3-1.5 4.4 0" stroke="#2a1a14" stroke-width=".9" fill="none" stroke-linecap="round"/>
<ellipse cx="27.7" cy="30.4" rx="1.6" ry="1.2" fill="#2a1a14"/><ellipse cx="36.3" cy="30.4" rx="1.6" ry="1.2" fill="#2a1a14"/>
<path d="M32 31.5v3.4l-1.2 .8" stroke="#a8724a" stroke-width=".8" fill="none" stroke-linecap="round"/>
<circle cx="33.4" cy="34.7" r=".55" fill="#f4f0e6"/>
<path class="sri-mouth" d="M28.8 37.4q3.2 2.4 6.4 0" stroke="#9c2b33" stroke-width="1.3" fill="none" stroke-linecap="round"/>
<circle cx="21.6" cy="33.5" r="1.4" fill="#e0a12c"/><circle cx="42.4" cy="33.5" r="1.4" fill="#e0a12c"/>
<path d="M25 44q7 4 14 0" stroke="#e0a12c" stroke-width="1.3" fill="none"/></svg>`;

/* ---------- styles ---------- */
const CSS=`
#sri-fab{position:fixed;right:16px;bottom:16px;z-index:9998;width:62px;height:62px;border-radius:50%;border:3px solid #fff;padding:0;cursor:pointer;
 box-shadow:0 6px 18px rgba(80,30,10,.35);background:#f3c98a;overflow:hidden;transition:transform .15s}
#sri-fab:hover{transform:scale(1.06)}#sri-fab svg{width:100%;height:100%;display:block}
#sri-sel{position:fixed;z-index:9999;border:0;border-radius:18px;padding:7px 13px;background:#b4531f;color:#fff;font:600 14px system-ui,'Noto Sans Devanagari','Noto Sans Telugu',sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}#sri-sel[hidden]{display:none}
#sri-tip{position:fixed;right:86px;bottom:30px;z-index:9998;background:#fff;color:#4a2a14;border-radius:14px 14px 2px 14px;padding:7px 11px;font:14px/1.3 system-ui,'Noto Sans Devanagari','Noto Sans Telugu',sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.18);max-width:200px}
#sri{margin:0;padding:0;border:0;position:fixed;right:16px;bottom:16px;z-index:9999;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;
 border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(60,20,5,.35);background:#efe5d4;font:15px/1.45 system-ui,'Noto Sans Devanagari','Noto Sans Telugu',sans-serif;color:#2b2118}
#sri[hidden],#sri-fab[hidden],#sri-tip[hidden]{display:none!important}
#sri .hd{display:flex;align-items:center;gap:10px;padding:10px 10px 10px 12px;background:linear-gradient(90deg,#9c3d16,#b4531f);color:#fff}
#sri .hd .av{width:42px;height:42px;border-radius:50%;overflow:hidden;flex:none;border:2px solid #f3c98a;background:#f3c98a}#sri .hd .av svg{width:100%;height:100%;display:block}
#sri .hd .nm{flex:1;min-width:0}#sri .hd b{display:block;font-size:16px}#sri .hd small{opacity:.88;font-size:12px}
#sri .hd button{background:none;border:0;color:#fff;font-size:19px;cursor:pointer;padding:6px;border-radius:8px;line-height:1}#sri .hd button:hover{background:rgba(255,255,255,.15)}
#sri .hd button[aria-pressed=false]{opacity:.55}
#sri .log{flex:1;overflow-y:auto;padding:12px 10px;background:#efe5d4 radial-gradient(rgba(156,61,22,.07) 1px,transparent 1px) 0 0/16px 16px}
#sri .m{max-width:86%;margin:4px 0;padding:7px 10px 6px;border-radius:12px;box-shadow:0 1px 1px rgba(0,0,0,.08);word-wrap:break-word;position:relative}
#sri .b{background:#fff;border-top-left-radius:3px}#sri .u{background:#fbdcb6;margin-left:auto;border-top-right-radius:3px}
#sri .m .tm{display:block;text-align:right;font-size:10.5px;color:#8a7a68;margin-top:2px}
#sri .m a{color:#9c3d16}#sri .m .v{font-size:16px;margin:4px 0;color:#23295e}#sri .m .ref{font-size:12.5px;color:#6b5b48}
#sri .lesson{font-size:14px}#sri .lesson p{margin:4px 0}#sri .lesson table{display:block;overflow-x:auto;max-width:100%;font-size:12.5px}#sri .lesson th,#sri .lesson td{padding:2px 6px;border-bottom:1px solid #eadbc3}
#sri .m .lk.big{display:block;text-align:center;background:#b4531f;color:#fff;font-weight:600;padding:7px 12px;margin-top:8px}
#sri .m .lk.buy{background:#1a7f37;color:#fff}#sri .card .mt{color:#9c3d16;font-size:12px;margin:1px 0 3px}
#sri .m .lk{display:inline-block;margin:4px 6px 0 0;padding:3px 9px;border-radius:12px;background:#f6ead8;text-decoration:none;font-size:13px}
#sri .card{display:flex;gap:8px;margin:6px 0;padding:6px;border:1px solid #eadbc3;border-radius:10px;background:#fffaf2}
#sri .card img{width:52px;height:80px;object-fit:cover;border-radius:4px;flex:none;background:#eee}#sri .card b{font-size:14px;display:block}#sri .card p{margin:2px 0;font-size:12.5px;color:#5a4a38}
#sri .chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}#sri .chips button{border:1px solid #d6b48a;background:#fff8ee;color:#7a3010;border-radius:16px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}
#sri .chips button:hover{background:#fbe7c4}
#sri table{border-collapse:collapse;font-size:14px;margin-top:4px}#sri td{padding:2px 8px 2px 0;vertical-align:top}#sri td:first-child{color:#8a7a68;font-size:12px;white-space:nowrap}
#sri .typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#b39a7c;animation:sriB 1s infinite}#sri .typing span:nth-child(2){animation-delay:.15s}#sri .typing span:nth-child(3){animation-delay:.3s}
@keyframes sriB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
#sri form{margin:0;display:flex;gap:6px;padding:8px;background:#f6efe3;align-items:center}
#sri form input{flex:1;min-width:0;border:0;border-radius:20px;padding:10px 14px;font:inherit;background:#fff;outline:none}
#sri form button{flex:none;width:42px;height:42px;border-radius:50%;border:0;background:#b4531f;color:#fff;font-size:18px;cursor:pointer}
#sri form button.mic{background:#fff;color:#b4531f;border:1px solid #e0c9a8}#sri form button.mic.on{background:#c62828;color:#fff;animation:sriP 1s infinite}
#sri form select{border:0;background:#fff;border-radius:14px;padding:6px 4px;font-size:12px;color:#7a3010}
@keyframes sriP{50%{box-shadow:0 0 0 6px rgba(198,40,40,.2)}}
.sri-talk .sri-mouth{animation:sriM .28s infinite alternate}@keyframes sriM{from{d:path("M28.8 37.4q3.2 2.4 6.4 0")}to{d:path("M29.4 37q2.6 3.6 5.2 0")}}
@media (max-width:480px){#sri{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* ---------- UI ---------- */
const fab=document.createElement('button');fab.id='sri-fab';fab.title='बोधिनी · Ask Bodhinī';fab.setAttribute('aria-label','Open Bodhinī, the helper');fab.innerHTML=AV;
const tip=document.createElement('div');tip.id='sri-tip';tip.innerHTML='नमस्ते! I am <b>Bodhinī</b> · बोधिनी — ask me anything 🙏';tip.hidden=LS.g('tip','')==='0';
const box=document.createElement('div');box.id='sri';box.hidden=true;box.setAttribute('aria-label','Bodhinī helper');
box.innerHTML=`<div class="hd"><div class="av">${AV}</div><div class="nm"><b>बोधिनी · Bodhinī</b><small>संस्कृतमन्थनम् सहायिका · online</small></div>
<button class="spk" title="Speak replies aloud" aria-pressed="false">🔊</button><button class="home" title="Menu">☰</button><button class="x" title="Close">✕</button></div>
<div class="log" role="log" aria-live="polite"></div>
<form><input placeholder="Type or speak — śloka, book, word…" aria-label="Message" autocomplete="off"><select class="ml" title="Voice language"><option value="en-IN">EN</option><option value="hi-IN">सं/हि</option><option value="te-IN">తె</option></select><button type="button" class="mic" title="Speak your question">🎤</button><button type="submit" title="Send">➤</button></form>`;
document.body.append(fab,tip,box);if(!tip.hidden)setTimeout(()=>{tip.hidden=true},9000);
const log=$('.log',box),inp=$('input',box),spkB=$('.spk',box),micB=$('.mic',box),mlS=$('.ml',box);
const now=()=>new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const scroll=()=>{log.scrollTop=log.scrollHeight};
const SS={g(k){try{return sessionStorage.getItem('sri-'+k)}catch(e){return null}},s(k,v){try{sessionStorage.setItem('sri-'+k,v)}catch(e){}}};
function save(){while(log.children.length>60)log.removeChild(log.firstChild);SS.s('log',log.innerHTML);SS.s('open',box.hidden?'0':'1')}
function add(html,who='b'){const d=document.createElement('div');d.className='m '+who;d.dir='auto';d.innerHTML=html+`<span class="tm">${now()}</span>`;log.appendChild(d);scroll();save();
  d.querySelectorAll('[data-aud]').forEach(async el=>{const u=await audioFor(el.dataset.aud);if(!u){el.remove();return}el.outerHTML=`<button type="button" class="lk big" data-play="${esc(u)}">▶ ${AUTHV[LANG]||AUTHV.en}</button>`;if(SPEAK&&who==='b'){stopSpeak();playRec(u)}});return d}
/* the author's own recordings (audio.json: key → file); shown wherever a recording exists */
const AUTHV={sa:'लेखकस्य स्वरेण',te:'రచయిత స్వరంలో',hi:'लेखक की आवाज़ में',en:"In the author's voice"};
let AUD=null,REC=null;async function audioFor(k){if(!AUD){try{AUD=await (await fetch(ROOT+'audio.json')).json()}catch(e){AUD={}}}return AUD[k]?ROOT+AUD[k]:null}
function playRec(u){try{if(REC){REC.pause()}REC=new Audio(u);REC.onplay=()=>box.classList.add('sri-talk');REC.onended=REC.onpause=()=>box.classList.remove('sri-talk');REC.play()}catch(e){}}
log.addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(b){stopSpeak();playRec(b.dataset.play)}});
log.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b)handle(b.dataset.say,b.textContent)});
function typing(){const d=document.createElement('div');d.className='m b typing';d.innerHTML='<span></span><span></span><span></span>';log.appendChild(d);scroll();return d}
const chips=a=>`<div class="chips">${a.map(([l,s])=>`<button type="button" data-say="${esc(s)}">${l}</button>`).join('')}</div>`;
let LANG=LS.g('lang','');
const T={
 sa:{menu:[['🎴 शुभकामनापत्रम्','greeting card'],['📜 अद्यतनः श्लोकः',"today's shloka"],['📲 अनुप्रयोगः','install app'],['📚 ग्रन्थाः','show me books'],['🔎 श्लोकान्वेषणम्','how to find a shloka'],['📜 सूत्रम् १.१.१','1.1.1'],['🕉 अद्यतनः गीताश्लोकः','verse of the day'],['📖 शब्दार्थः','meaning of dharma'],['🔤 लिप्यन्तरणम्','convert रामः'],['🧮 शब्दरूपाणि','forms of राम'],['ℹ️ परिचयः क्रयणं च','how to buy'],['🎮 क्रीडाः','games'],['📘 व्याकरणपाठाः','lessons'],['📖 पठनम्','read gita'],['🔊 पाठकः','sr:help'],['🌐 भाषा','language']],
   ok:'उत्तमम्! अहं बोधिनी। कथं भवतः साहाय्यं करवाणि?',ask:'किं करवाणि?',thx:'🙏 स्वागतम्! अन्यत् किमपि पृच्छतु।',nf:'क्षम्यताम्, तत् ग्रन्थालये न लब्धम्। श्लोकस्य आदिपदानि ग्रन्थविषयं वा लिखतु, अथवा एतेषु चिनोतु —',voice:'hi-IN'},
 te:{menu:[['🎴 శుభాకాంక్షల కార్డు','greeting card'],['📜 నేటి శ్లోకం',"today's shloka"],['📲 యాప్‌గా పెట్టుకోండి','install app'],['📚 పుస్తకాలు','show me books'],['🔎 శ్లోకం వెతకండి','how to find a shloka'],['📜 సూత్రం 1.1.1','1.1.1'],['🕉 నేటి గీతా శ్లోకం','verse of the day'],['📖 పదార్థం','meaning of dharma'],['🔤 లిపి మార్పిడి','convert రామః'],['🧮 పద రూపాలు','forms of राम'],['ℹ️ పరిచయం · కొనుగోలు','how to buy'],['🎮 ఆటలు','games'],['📘 వ్యాకరణ పాఠాలు','lessons'],['📖 శ్లోక పఠనం','read gita'],['🔊 స్క్రీన్ రీడర్','sr:help'],['🌐 భాష','language']],
   ok:'సరే! నేను బోధిని. మీకు ఎలా సహాయం చేయగలను?',ask:'మీకు ఏమి కావాలి?',thx:'🙏 సంతోషం! ఇంకేమైనా అడగండి.',nf:'క్షమించండి, అది దొరకలేదు. శ్లోకం మొదటి పదాలు లేదా పుస్తక విషయం టైప్ చేయండి, లేదా వీటిలో ఎంచుకోండి —',voice:'te-IN'},
 hi:{menu:[['🎴 शुभकामना कार्ड','greeting card'],['📜 आज का श्लोक',"today's shloka"],['📲 ऐप इंस्टॉल करें','install app'],['📚 पुस्तकें','show me books'],['🔎 श्लोक खोजें','how to find a shloka'],['📜 सूत्र 1.1.1','1.1.1'],['🕉 आज का गीता श्लोक','verse of the day'],['📖 शब्द का अर्थ','meaning of dharma'],['🔤 लिपि परिवर्तन','convert रामः'],['🧮 शब्द रूप','forms of राम'],['ℹ️ परिचय और खरीद','how to buy'],['🎮 खेल','games'],['📘 व्याकरण पाठ','lessons'],['📖 श्लोक पाठ','read gita'],['🔊 स्क्रीन रीडर','sr:help'],['🌐 भाषा','language']],
   ok:'बहुत अच्छा! मैं बोधिनी हूँ। मैं आपकी कैसे सहायता कर सकती हूँ?',ask:'आपको क्या चाहिए?',thx:'🙏 स्वागत है! और कुछ पूछिए।',nf:'क्षमा करें, यह नहीं मिला। श्लोक के आरंभिक शब्द या पुस्तक का विषय लिखें, या इनमें से चुनें —',voice:'hi-IN'},
 en:{menu:[['🎴 Greeting card','greeting card'],["📜 Today's śloka","today's shloka"],['📲 Install app','install app'],['📚 Books','show me books'],['🔎 Find a śloka','how to find a shloka'],['📜 Sūtra 1.1.1','1.1.1'],['🕉 Gītā verse of the day','verse of the day'],['📖 Word meaning','meaning of dharma'],['🔤 Script converter','convert रामः'],['🧮 Word forms','forms of राम'],['ℹ️ About & buying','how to buy'],['🎮 Games','games'],['📘 Grammar lessons','lessons'],['📖 Read aloud','read gita'],['🔊 Screen reader','sr:help'],['🌐 Language','language']],
   ok:'Wonderful! I am Bodhinī. How can I assist you?',ask:'What would you like?',thx:'🙏 You are welcome! Ask me anything else.',nf:"Sorry, I couldn't find that. Try the opening words of a verse, a book topic (e.g. Purāṇa, grammar, Telugu), or one of these —",voice:'en-IN'}};
const L_=()=>T[LANG]||T.en;
let LANGQ=`Which language do you prefer?<br>भवतः प्रियभाषा का? · మీకు ఏ భాష ఇష్టం? · आपको कौन-सी भाषा पसंद है?`+'<div class="chips"><button type="button" data-say="lang:sa">संस्कृतम्</button><button type="button" data-say="lang:te">తెలుగు</button><button type="button" data-say="lang:hi">हिन्दी</button><button type="button" data-say="lang:en">English</button></div>';
function open(){box.hidden=false;fab.hidden=true;tip.hidden=true;LS.s('tip','0');if(!log.children.length)hello();save();scroll();setTimeout(()=>inp.focus(),50)}
function close(){box.hidden=true;fab.hidden=false;stopSpeak();save()}
fab.onclick=open;tip.onclick=open;$('.x',box).onclick=close;$('.home',box).onclick=()=>reply(menuMsg());
const WEL=`<b>नमस्ते! 🙏</b> Welcome to <b>संस्कृतमन्थनम् · Sanskrit Manthan</b> — <i>भारतीयज्ञानपरम्पराकार्यशाला</i>, a workshop of Indian Knowledge Systems.<br>I am <b>बोधिनी (Bodhinī)</b> — “she who awakens understanding”.`;
function hello(){if(!LANG)reply(WEL+'<br><br>'+LANGQ,'Namaste! Welcome to Sanskrit Manthan, a workshop of Indian Knowledge Systems. I am Bodhini. Which language do you prefer?');
  else reply(WEL+'<br><br>'+L_().ok+chips(L_().menu),'Namaste! Welcome to Sanskrit Manthan. '+L_().ok)}
function setLang(l){LANG=l;LS.s('lang',l);if(![...mlS.options].some(o=>o.value===T[l].voice)){const o=document.createElement('option');o.value=T[l].voice;o.textContent=l;mlS.appendChild(o)}mlS.value=T[l].voice;LS.s('ml',mlS.value);return [L_().ok+chips(L_().menu),L_().ok]}
const menuMsg=()=>L_().ask+chips(L_().menu);
/* carry the conversation across pages (this browser tab only) */
{const old=SS.g('log');if(old){log.innerHTML=old;if(SS.g('open')==='1'){box.hidden=false;fab.hidden=true;tip.hidden=true;setTimeout(scroll,0)}}}

/* ---------- speech (browser built-in, free) ---------- */
let SPEAK=LS.g('speak','1')==='1';spkB.setAttribute('aria-pressed',SPEAK);
mlS.value=LS.g('ml',(T[LANG]||T.en).voice);mlS.onchange=()=>LS.s('ml',mlS.value);
spkB.onclick=()=>{SPEAK=!SPEAK;LS.s('speak',SPEAK?'1':'0');spkB.setAttribute('aria-pressed',SPEAK);if(!SPEAK)stopSpeak();else say('Voice on.')};
const synth=window.speechSynthesis;
function pickVoice(lang){if(!synth)return null;const vs=synth.getVoices();return vs.find(v=>v.lang===lang)||vs.find(v=>v.lang.startsWith(lang.slice(0,2)))||(lang==='en-IN'?vs.find(v=>v.lang.startsWith('en')):null)}
function stopSpeak(){try{synth&&synth.cancel()}catch(e){}box.classList.remove('sri-talk');fab.classList.remove('sri-talk')}
function say(text,force,max){if((!SPEAK&&!force)||!synth||!text)return;stopSpeak();
  if(max){// long text (screen reader): speak in short sentence-sized pieces so browsers don't cut off
    const chunks=[];text.replace(/\s+/g,' ').slice(0,max).split(/(?<=[।॥.!?;:,])\s+/).forEach(c=>{while(c.length>180){const k=c.lastIndexOf(' ',180);chunks.push(c.slice(0,k>40?k:180));c=c.slice(k>40?k:180)}if(c.trim())chunks.push(c)});
    chunks.forEach(c=>sayPart(c));return}
  // split into runs by script so Telugu, Devanagari and English each get a fitting voice
  const parts=text.replace(/\s+/g,' ').slice(0,600).match(/[ఀ-౿][ఀ-౿\s,.।॥!?0-9-]*|[ऀ-ॿ][ऀ-ॿ\s,.!?0-9-]*|[^ऀ-ॿఀ-౿]+/g)||[];
  parts.forEach(p=>sayPart(p))}
const SCR=[[0x0900,0x097F,()=>LANG==='mr'?'mr-IN':LANG==='ne'?'ne-NP':'hi-IN'],[0x0980,0x09FF,()=>'bn-IN'],[0x0A00,0x0A7F,()=>'pa-IN'],[0x0A80,0x0AFF,()=>'gu-IN'],[0x0B00,0x0B7F,()=>'or-IN'],[0x0B80,0x0BFF,()=>'ta-IN'],
 [0x0C00,0x0C7F,()=>'te-IN'],[0x0C80,0x0CFF,()=>'kn-IN'],[0x0D00,0x0D7F,()=>'ml-IN'],[0x0600,0x06FF,()=>'ur-IN']];
const scriptOf=ch=>{const n=ch.codePointAt(0);const r=SCR.find(([a,b])=>n>=a&&n<=b);return r?r[2]():null};
function sayPart(text){// split into runs of one script, each read with a fitting voice
  const runs=[];let cur='',lang='en-IN';for(const ch of text){const l=/[\p{L}\p{M}]/u.test(ch)?(scriptOf(ch)||'en-IN'):null;if(l&&l!==lang&&cur.trim()){runs.push([cur,lang]);cur=''}if(l)lang=l;cur+=ch}if(cur.trim())runs.push([cur,lang]);
  runs.forEach(([p,lang])=>{p=p.trim();if(!p||!/[\p{L}]/u.test(p))return;
    const u=new SpeechSynthesisUtterance(p);u.lang=lang;const v=pickVoice(lang);if(v)u.voice=v;u.rate=.95;
    u.onstart=()=>box.classList.add('sri-talk');u.onend=()=>{if(!synth.speaking)box.classList.remove('sri-talk')};synth.speak(u)})}
if(synth)synth.onvoiceschanged=()=>synth.getVoices();
/* ---------- screen reader: select any text or śloka on the page → 🔊 ---------- */
const SELB={sa:'🔊 श्रावयतु',te:'🔊 చదివి వినిపించు',hi:'🔊 पढ़कर सुनाओ',en:'🔊 Read aloud'};
const selB=document.createElement('button');selB.id='sri-sel';selB.hidden=true;document.body.appendChild(selB);
let LASTSEL='';
function pageSel(){const sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return '';const n=sel.anchorNode;if(n&&box.contains(n.nodeType===1?n:n.parentNode))return '';return sel.toString().trim()}
document.addEventListener('selectionchange',()=>{clearTimeout(selB._t);selB._t=setTimeout(()=>{const t=pageSel();if(t.length<2||!synth){selB.hidden=true;return}
  LASTSEL=t;const r=getSelection().getRangeAt(0).getBoundingClientRect();selB.textContent=SELB[LANG]||SELB.en;selB.hidden=false;
  const top=r.top>48?r.top-42:r.bottom+8;selB.style.top=Math.min(innerHeight-46,Math.max(6,top))+'px';selB.style.left=Math.min(innerWidth-170,Math.max(6,r.left))+'px'},250)});
selB.addEventListener('mousedown',e=>e.preventDefault());
selB.onclick=()=>{if(synth.speaking){stopSpeak();selB.hidden=true;return}readText(LASTSEL)};
function readText(t){if(!t)return false;say(t,true,6000);selB.textContent='⏹';return true}
function pageText(){const root=document.querySelector('main, article, #out, .verse, #app')||document.body;const c=root.cloneNode(true);
  c.querySelectorAll('script,style,nav,header,footer,#sri,#sri-fab,#sri-tip,#sri-sel,button,select,input').forEach(x=>x.remove());return c.innerText.replace(/\s+/g,' ').trim()}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
if(!SR){micB.hidden=true;mlS.hidden=true}
micB.onclick=()=>{if(rec){rec.stop();return}rec=new SR();rec.lang=mlS.value;rec.interimResults=true;rec.maxAlternatives=1;micB.classList.add('on');
  rec.onresult=e=>{inp.value=[...e.results].map(r=>r[0].transcript).join('');if(e.results[e.results.length-1].isFinal){const t=inp.value;inp.value='';handle(t,undefined,true)}};
  rec.onerror=e=>{if(e.error==='not-allowed')reply('Microphone permission was blocked. Allow the microphone for this site in your browser settings, or type instead.')};
  rec.onend=()=>{rec=null;micB.classList.remove('on')};rec.start()};
$('form',box).onsubmit=e=>{e.preventDefault();const t=inp.value.trim();if(!t)return;inp.value='';handle(t)};

/* ---------- conversation ---------- */
function reply(html,spoken){add(html,'b');say(spoken!==undefined?spoken:html.replace(/<div class="chips">[\s\S]*$/,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' '))}
let NAV=false;
async function handle(text,label,voice){add(esc(typeof label==='string'?label:text),'u');const t=typing();let out;NAV=false;
  try{out=await answer(text.trim())}catch(e){console.error(e);out=['Sorry, something went wrong while looking that up. Please try again.'+chips(L_().menu)]}
  await new Promise(r=>setTimeout(r,250));t.remove();if(typeof out==='string')out=[out];
  const url=out[2];
  if(url){const here=location.pathname.replace(/\/$/,'/index.html')+location.hash, there=new URL(url,location.href);
    const go=(NAV||voice)&&(there.pathname+there.hash)!==here;
    reply(out[0]+(go?`<div class="ref">↪ ${OPENING[LANG]||OPENING.en}</div>`:`<a class="lk big" href="${esc(url)}">📖 ${OPENW[LANG]||OPENW.en}</a>`),(out[1]||'')+(go?' '+(OPENING[LANG]||OPENING.en):''));
    if(go){save();const t0=Date.now();const wait=()=>{if(SPEAK&&synth&&synth.speaking&&Date.now()-t0<7000)return setTimeout(wait,300);location.href=url};setTimeout(wait,1200)}}
  else reply(out[0],out[1])}
const SRH={sa:'🔊 <b>पाठकः</b> — अस्मिन् पृष्ठे कमपि पाठं श्लोकं वा <b>चिनोतु</b> (मूषकेण कर्षतु / दूरभाषे दीर्घं स्पृशतु)। तदा “🔊 श्रावयतु” इति गण्डः दृश्यते — तं स्पृशतु। सम्पूर्णपृष्ठाय “read this page” इति वदतु।',te:'🔊 <b>స్క్రీన్ రీడర్</b> — ఈ పేజీలో ఏదైనా పాఠ్యాన్ని లేదా శ్లోకాన్ని <b>ఎంచుకోండి</b> (మౌస్‌తో లాగండి / ఫోన్‌లో ఎక్కువసేపు నొక్కండి). అప్పుడు “🔊 చదివి వినిపించు” బటన్ కనిపిస్తుంది — దాన్ని నొక్కండి. మొత్తం పేజీ కోసం “ఈ పేజీ చదువు” అనండి.',hi:'🔊 <b>स्क्रीन रीडर</b> — इस पृष्ठ पर कोई भी पाठ या श्लोक <b>चुनें</b> (माउस से खींचें / फ़ोन पर देर तक दबाएँ)। तब “🔊 पढ़कर सुनाओ” बटन दिखेगा — उसे दबाएँ। पूरे पृष्ठ के लिए “यह पृष्ठ पढ़ो” कहें।',en:'🔊 <b>Screen reader</b> — please <b>select</b> any text or śloka on this page (drag with the mouse, or long-press on a phone). A “🔊 Read aloud” button appears — tap it and I will read it out. To hear the whole page, say “read this page”.'};
const OPENING={sa:'पृष्ठम् उद्घाट्यते…',te:'పేజీ తెరుస్తున్నాను…',hi:'पृष्ठ खोल रही हूँ…',en:'Opening the page…'};
const OPENW={sa:'पृष्ठम् उद्घाटयतु',te:'పేజీ తెరవండి',hi:'पृष्ठ खोलें',en:'Open the page'};

const has=(s,...w)=>w.some(x=>s.includes(x));
async function answer(q){q=speechNorm(digits(q));const raw=q,lo=raw.toLowerCase(),L=loose(raw);let m0;
  if(!raw||/^(hi|hello|hey|namaste|namaskar|namaskaram|menu|help|start|\?)\W*$/i.test(raw)||/^(नमस्ते|नमस्कारः?|నమస్తే|నమస్కారం)/.test(raw))return [menuMsg(),L_().ask];
  {const r=readCmd(raw);if(r){if(READ&&READ.auto)setTimeout(autoNext,0);return r}}
  m0=raw.match(/^lang:([a-z]{2,3})$/);if(m0&&T[m0[1]])return setLang(m0[1]);
  if(/^(language|lang|भाषा|భాష)$/i.test(raw))return [LANGQ,'Which language do you prefer?'];
  if(/^(thank|thanks|dhanyavad|धन्यवाद|ధన్యవాద)/i.test(raw))return [L_().thx+chips(L_().menu)];
  if(has(lo,'how to find a shloka','find shloka','find a shloka','search shloka'))return [`Just type the <b>opening words</b> of any verse — in Devanagari, Telugu or Roman, e.g. <i>धर्मक्षेत्रे कुरुक्षेत्रे</i>, <i>yada yada hi</i>, <i>వాగర్థావివ</i>.<br>Or a reference like <i>gita 2.47</i>, <i>megha 1</i>, <i>raghu 1.1</i>, <i>yogasutra 1.2</i>, or a Pāṇini sūtra number <i>1.1.1</i>.`+chips([['धर्मक्षेत्रे','धर्मक्षेत्रे कुरुक्षेत्रे'],['gita 2.47','gita 2.47'],['yogasutra 1.2','yogasutra 1.2'],['vagarthaviva','vagarthaviva']])];
  // learn by heart, worksheets, certificate
  {const m=raw.match(/^(?:memori[sz]e|learn by heart|by heart|kanthapatha|kanthapath|कण्ठपाठः?|कंठस्थ|కంఠస్థం)\s*(.*)$/i);if(m){const r=m[1].trim();return [`🧠 <b>कण्ठपाठः · Learn by heart</b>${r?' — '+esc(r):''}: listen, hide words step by step, then recite to check yourself.`,'Learn by heart',ROOT+'kanthapatha.html'+(r?'?t='+encodeURIComponent(r):'')]}}
  if(/\b(worksheets?|exercise sheet|practice sheet|printable)\b|अभ्यासपत्र|వర్క్‌షీట్/i.test(raw))return [`📝 <b>अभ्यासपत्रम् · Worksheets</b> — printable sandhi, noun-form and verb-form exercises with an answer key, new every time.`+chips([['Sandhi','open worksheet sandhi'],['Noun forms','open worksheet shabda'],['Verb forms','open worksheet dhatu']]),'Printable worksheets',ROOT+'worksheet.html'+((raw.match(/sandhi|shabda|dhatu/i)||[''])[0]?'?k='+raw.match(/sandhi|shabda|dhatu/i)[0].toLowerCase():'')];
  if(/\b(certificate|pramanapatra)\b|प्रमाणपत्र|సర్టిఫికేట్|ధ్రువపత్రం/i.test(raw))return [`🎓 <b>Certificate</b> — finish the 23 grammar lessons and earn 12 stars in the games, then download your Vyākaraṇa-praveśa certificate.`,'Certificate',ROOT+'certificate.html'];
  // app, offline, greetings, today, articles
  if(/^(install|install app|app|add to home ?screen|ఇన్‌స్టాల్|इंस्टॉल)\b/i.test(raw))return await installMsg();
  if(/^(offline|use offline|save offline|download for offline)$/i.test(raw))return await offlineMsg();
  {const m=raw.match(/^save:(\w+)$/);if(m){const r=await saveBundle(m[1]);if(r)return r}}
  if(/^articles list$/i.test(raw)){const A=await once('articles.json').catch(()=>[]);return ['📰 Articles:'+A.map(a=>`<div><a class="lk" href="${ROOT}a/${a.slug}">${esc(a.title)}</a> <span class="ref">${a.date}</span></div>`).join(''),'',ROOT+'articles']}
  if(/today'?s (shloka|sloka|verse)|shloka of the day|daily shloka|अद्यतनः श्लोकः|आज का श्लोक|నేటి శ్లోకం/i.test(raw))return await todayMsg();
  {const r=await greetIntent(raw,lo);if(r)return r}
  {const r=await articleIntent(raw,lo);if(r)return r}
  // screen reader
  if(/^(screen ?reader|read selected|read selection|read (the )?selected text|read this|read it|selection|पठ्यताम्|चयनित पढ़ो|ఎంచుకున్నది చదువు|screenreader)$/i.test(raw)||raw==='sr:help'){
    if(raw!=='sr:help'&&LASTSEL){readText(LASTSEL);return [`🔊 “${esc(LASTSEL.slice(0,120))}${LASTSEL.length>120?'…':''}”`,'']}
    return [SRH[LANG]||SRH.en,(SRH[LANG]||SRH.en).replace(/<[^>]+>/g,' ')]}
  if(/^(read (this|the) page|read page|read aloud this page|पृष्ठं पठ|यह पृष्ठ पढ़ो|ఈ పేజీ చదువు)$/i.test(raw)){const t=pageText();if(t){readText(t);return ['🔊 '+(OPENING[LANG]?{sa:'पृष्ठं पठ्यते…',te:'పేజీ చదువుతున్నాను…',hi:'पृष्ठ पढ़ रही हूँ…',en:'Reading this page…'}[LANG]||'Reading this page…':'Reading this page…')+chips([['⏹ Stop','stop reading']]),'']}}
  if(/^(stop reading|stop|silence|चुप|విరమించు)$/i.test(raw)&&!READ){stopSpeak();return ['⏹','']}
  // reading a text aloud: "read Meghadūta", "recite gita 2", "पठतु रघुवंशम्"
  {const m=raw.match(/^(?:read|recite|chant|read out|पठ|पठतु|पढ़ो|पढ़िए|सुनाओ|చదువు|చదవండి|వినిపించు)\s+(.+?)(?:\s+(\d+(?:\.\d+)*))?$/i);if(m){const r=await readStart(m[1],m[2]);if(r)return r}}
  // grammar lessons and game rules
  {const r=await learnIntent(raw,lo);if(r)return r}
  // the author's books: buy / price / details / share / sample / similar / new / short
  {const r=await bookIntent(raw,lo);if(r)return r}
  // FAQ
  if(/\b(buy|purchase|price|cost|pay|payment|order|kharid)\b/.test(lo)||has(raw,'खरीद','क्रय','కొన','ధర'))return [`All books are <b>e-books on Google Play Books</b>. Open any book (ask me e.g. “Telugu Purāṇa books”) and tap <b>Google Play</b> — you can buy with your Google account and read on phone, tablet or computer. Google Play also shows a <b>free preview</b> of every book.`+chips([['📚 Show books','show me books'],['✉️ Contact','contact']])];
  if(/\b(print|paper ?back|hard ?copy|physical)\b/.test(lo))return [`The books are currently published as e-books on Google Play. For print copies or bulk/library orders, please write to <a href="mailto:sanskritmanthan@gmail.com">sanskritmanthan@gmail.com</a>.`];
  if(/\b(contact|email|mail|reach|phone)\b/.test(lo)||has(raw,'సంప్రదింప','सम्पर्क'))return [`You can write to <a href="mailto:sanskritmanthan@gmail.com">sanskritmanthan@gmail.com</a> 🙏`];
  if(/\b(author|who wrote|who is|about (the )?(site|author|you))\b/.test(lo)||has(raw,'लेखक','రచయిత'))return [`The books are written by <b>Dr. Mantha Srinivasu</b> (डॉ. मन्था-श्रीनिवासुः · డా. మంథా శ్రీనివాసు) — a scholar of Sanskrit and Education, with 150+ works in Sanskrit and Telugu: Geya Purāṇas, Rāmāyaṇa and Mahābhārata in song, śāstra and grammar kāvyas, Nāṭyaśāstra, kośas, stotras and vacana-kāvyas.<br>This site also offers free tools: śloka and sūtra search, kośa, grammar games and word forms.`+chips([['📚 Books','show me books'],['🔎 Find a śloka','how to find a shloka']])];
  if(/\b(who are you|your name|what are you)\b/.test(lo))return [`I am <b>बोधिनी (Bodhinī)</b> — “she who awakens understanding” — the helper of Sanskrit Manthan. I answer from this site's own library — I am not a general AI, so I may not understand everything, but I try! 🙂`+chips(L_().menu)];
  if(/\b(sample|preview|archive)\b|free (sample|preview|copy|read)/.test(lo))return [`Every book has a <b>free preview on Google Play</b> (tap the book, then “Free sample”). Short samples are also being added on archive.org. The tools on this site — śloka search, kośa, grammar — are completely free.`];
  if(has(lo,'verse of the day','shloka of the day','today')||has(raw,'आजचा','अद्य','నేటి'))return await gitaDay();
  // script conversion
  let m=raw.match(/^(?:convert|transliterate|script|lipi|लिपि[ः]?|లిపి|in telugu|in devanagari|to telugu|to devanagari)\s*[:\-]?\s*(.+)$/i);
  if(m)return convert(m[1]);
  // forms
  if(!/\b(books?|grantha)\b/.test(lo)&&(/\b(forms?|declension|declen\w*|decline|conjugat\w*|dhatu|shabda|roopa|rupa)\b/i.test(raw)||/रूपाणि|రూపాలు|धातु|ధాతు|शब्दरूप/.test(raw))){
    const word=raw.replace(/\b(forms?|of|the|declension|declen\w*|decline|conjugat\w*|dhatu|shabda|roopa|rupa|verb|root|noun|word|show|me|give)\b/gi,' ').replace(/रूपाणि|రూపాలు|धातुः?|ధాతువు|ధాతు|शब्दरूपाणि|शब्दः?/g,' ').replace(/\s+/g,' ').trim();
    if(!word)return [`Tell me the word too — e.g. <i>forms of राम</i> or <i>forms of verb गम्</i>.`];
    if(/\b(verb|root|dhatu|conjugat\w*)\b/i.test(raw)||/धातु|ధాతు/.test(raw))return await dhatu(word);
    return shabda(word)}
  // meaning
  m=raw.match(/^(?:meaning of|what is the meaning of|what does|define|अर्थः?|అర్థం)\s+(.+?)(?:\s+mean)?\??$/i)||raw.match(/^(.+?)\s+(?:meaning|means|का अर्थ|अर्थः?|అర్థం)\??$/i);
  if(m)return await meaning(m[1].trim());
  // Pāṇini sūtra by number (also spoken: "panini sutra one two three")
  m=raw.match(/^(.*?)\s*([1-8])\s*[.:,]\s*([1-4])\s*[.:,]\s*(\d{1,3})$/);
  if(m){const pre=loose(m[1]);if(!m[1].trim()||/^(p|panini|paniniya|sutra|sutram|astadhyayi|astadhyay)/.test(pre)||/पाणिनि|अष्टाध्यायी|सूत्र|పాణిని|అష్టాధ్యాయి|సూత్ర/.test(m[1]))return await panini(m[2],m[3],m[4])}
  // work + reference: gita 2.47, megha 5, raghu 1.1
  m=raw.match(/^(.+?)\s*(\d+(?:\s*[.:,]\s*\d+)*)$/);
  if(m){const r=await reference(m[1],m[2]);if(r)return r}
  // a text, a book or a page by its name ("open Meghadūta", "Rudrāntaram", "kośa page")
  {const r=await byName(raw);if(r)return r}
  // books
  const wantBooks=/\b(book|books|grantha|kavya|kavyas|purana|puranas|novel|publication|e-?book|telugu books|sanskrit books)\b/.test(lo)||has(raw,'ग्रन्थ','पुस्तक','పుస్తక','గ్రంథ');
  const bk=await books(raw);
  if(bk&&(wantBooks||(!isIndic(raw)&&bk.strong)))return bk;
  // verses by opening words
  if(L.length>=5||isIndic(raw)){const v=await verses(raw);if(v)return v}
  if(bk)return bk;
  return [L_().nf+chips(L_().menu),L_().nf]}

/* ---------- grammar: lessons and game rules ---------- */
const GAMES=[
 {id:'rupa',t:'धातुरूपचक्रम्',en:'Verb-form wheel',k:'verb form wheel dhatu rupa conjugation lakara tense',r:'A root is shown with a lakāra, person and number — pick the correct verb form. Early levels: the present tense (लट्) with 10 common roots and 3 choices; later levels add लङ्, लोट्, लृट्, विधिलिङ् and more roots; then you see a form and must name its lakāra, person and number; the top levels ask you to <b>type</b> the form yourself, against a timer.'},
 {id:'shabda',t:'शब्दरूपचक्रम्',en:'Noun-form wheel',k:'noun form wheel shabda declension vibhakti case',r:'A noun is shown with a case (vibhakti) and number — choose its correct form. Levels move from अ-stems (राम, फल, लता) to other vowel and consonant stems, all three genders, pronouns, and finally any Amarakośa word.'},
 {id:'sandhi',t:'सन्धिशीघ्रम्',en:'Sandhi quick-fire',k:'sandhi quick fire join words',r:'Two words appear — choose (later, type) the joined form. After every answer the Pāṇini sūtra that applies is shown. Levels: सवर्णदीर्घः (a+a→ā), गुणः (a+i→e), वृद्धिः (a+e→ai), यण् and अयादिः, then visarga and consonant sandhi, then mixed quick-fire.'},
 {id:'chandas',t:'छन्दःपरिचयः',en:'Name the metre',k:'chandas metre meter name the metre',r:'A real verse from the Śloka Index is shown — name its metre. Level 1: अनुष्टुभ्, इन्द्रवज्रा, वसन्ततिलका; then उपजाति, वंशस्थ, रथोद्धता; then the āryā family (counted by mātrās); then long metres — मन्दाक्रान्ता, शिखरिणी, शार्दूलविक्रीडित, स्रग्धरा, मालिनी, हरिणी, पृथ्वी.'},
 {id:'antya',t:'अन्त्याक्षरी',en:'Verse chain',k:'antyakshari antakshari verse chain',r:'A verse is given; answer with a verse that <b>begins with the syllable it ended on</b>. Type the opening of your verse — it is checked against the Śloka Index. Keep the chain going as long as you can.'},
 {id:'sudoku',t:'तिङ्सुडोकु',en:'Sudoku of endings',k:'sudoku tin endings',r:'A Sudoku where the nine symbols are the nine verb endings (or forms) of one lakāra instead of numbers 1–9. Every row, column and 3×3 box must contain each ending exactly once.'},
 {id:'jala',t:'शब्दजालम्',en:'Crossword',k:'crossword shabdajalam',r:'A fresh crossword every time: the clues are Amarakośa synonyms or verb analyses, the answers are Sanskrit words or forms. Type each answer into the grid.'},
 {id:'mela',t:'रूपमेलनम्',en:'Memory cards',k:'memory cards match pairs',r:'Cards are face down. Flip two at a time — match each form with its grammatical analysis. Clear the board in as few moves as you can.'}];
const GAME_COMMON=`<div class="ref">🏆 Every quiz level has 10 questions (speed levels: as many as you can before time runs out). Stars: all correct = ★★★, 90% = ★★, 70% = ★ — a star opens the next level. Each correct answer earns tokens (+2 bonus for every 5 in a row); every 100 tokens = a ₹10 voucher for a Sanskrit Manthan book when a promotion is live. Progress is kept in your browser. Answers can be typed in Devanagari, Telugu, IAST or simple Roman.</div>`;
function gameMsg(g){return [`🎮 <b>${g.t}</b> · ${g.en}<br>${g.r}`+GAME_COMMON,g.en+'. '+g.r.replace(/<[^>]+>/g,''),ROOT+'krida.html#'+g.id]}
function gamesList(){return [`🎮 <b>क्रीडाङ्गणम् · Grammar games</b> — learn Pāṇini's grammar by playing; every answer is checked by the rules.`+chips(GAMES.map(g=>[g.t,'how to play '+g.en]))+`<a class="lk" href="${ROOT}krida.html">Open the games →</a>`,'Here are the grammar games. Which one shall I explain?']}
let LEARN=null;
async function lessonFind(q){LEARN=LEARN||await once('sri-learn.json');const k=fz(q);if(k.length<3)return null;
  const sc=l=>{const keys=[l.id,fz(l.t),...l.t.split(/[\s·]+/).map(fz),...l.en.toLowerCase().split(/[^a-zāīūṛṣśṇṭḍṃḥ]+/).filter(w=>w.length>3).map(fz)].filter(Boolean);
    return keys.some(x=>x===k)?3:keys.some(x=>x.length>=4&&(x.startsWith(k)||k.startsWith(x)))?2:keys.some(x=>x.length>=5&&k.includes(x))?1:0};
  const r=LEARN.lessons.map(l=>[l,sc(l)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);return r.length?r[0][0]:null}
function lessonMsg(l){const i=LEARN.lessons.indexOf(l),nx=LEARN.lessons[i+1];
  const sut=l.s.length?`<div class="ref"><b>Key sūtras:</b><br>${l.s.map(([n,t])=>`<a href="${ROOT}sutra.html#ashtadhyayi/${n.split('.').slice(0,2).join('.')}/${n.split('.')[2]}">${n}</a> ${esc(s2d(t))}`).join('<br>')}</div>`:'';
  const ch=[];if(l.play)ch.push(['🎮 Practise',`how to play ${(GAMES.find(g=>l.play.startsWith(g.id))||GAMES[0]).en}`]);if(nx)ch.push([`Next: ${nx.t}`,`teach ${nx.id}`]);ch.push(['All lessons','grammar lessons']);
  return [`📘 <b>${l.t}</b> · ${esc(l.en)}<div class="lesson">${l.b}</div>`+sut+chips(ch),l.en+'. '+l.b.replace(/<table[\s\S]*?<\/table>/g,'').replace(/<[^>]+>/g,' ').slice(0,500),ROOT+'vyakarana.html#l/'+l.id]}
async function lessonsList(){LEARN=LEARN||await once('sri-learn.json');
  return [`📘 <b>व्याकरणपाठाः · Grammar lessons</b> — ${LEARN.lessons.length} short lessons, each with its sūtras and a game to practise:`+LEARN.units.map((u,ui)=>`<div class="ref"><b>${u[0]}</b> · ${u[1]}</div>`+chips(LEARN.lessons.filter(l=>l.u===ui).map(l=>[l.t,'teach '+l.id]))).join('')+chips([['📝 Worksheets','worksheet'],['🎓 Certificate','certificate'],['🧠 Learn a śloka by heart','memorize gita 2.47']]),'Here are the grammar lessons. Which one shall I teach?']}
async function learnIntent(raw,lo){let m;
  if(/^(games?|grammar games?|krida|क्रीडा|ఆటలు|game rules|rules of (the )?games?|how to play)\??$/i.test(raw))return gamesList();
  if((m=raw.match(/^(?:how (?:to|do i) play|rules of|rules for|game)\s+(.+?)(?:\s+game)?\??$/i))||(m=raw.match(/^(.+?)\s+(?:game rules|rules|game)\??$/i))){const k=fz(m[1].replace(/^(explain|the|play)\s+/i,''));const g=GAMES.find(g=>fz(g.en)===k||fz(g.t)===k||g.id===k||g.k.split(' ').some(w=>w.length>=4&&fz(w)===k)||fz(g.en).includes(k)&&k.length>=4);if(g)return gameMsg(g)}
  if(/^(lessons?|grammar lessons?|teach (me )?grammar|learn grammar|vyakarana lessons?|पाठाः|పాఠాలు)\??$/i.test(raw))return await lessonsList();
  if((m=raw.match(/^(?:teach(?: me)?|explain|lesson on|lesson|what is|what are|learn|पाठय|బోధించు|నేర్పు|समझाओ|सिखाओ)\s+(.+?)\??$/i))){const l=await lessonFind(m[1]);if(l)return lessonMsg(l)}
  return null}

/* ---------- reading a text aloud, verse by verse ---------- */
let READ=null;
async function readStart(name,ref){for(const [d,page] of [['su','sutra.html'],['sl','shloka.html']]){const c=await cat(d);const k=fz(name);
    const t=c.texts.find(w=>w.aliases.some(a=>fz(a)===k)||fz(w.title)===k||(k.length>=4&&(fz(w.title).startsWith(k)||w.aliases.some(a=>a.length>=4&&(fz(a).startsWith(k)||k.startsWith(fz(a)))))));
    if(!t)continue;const tx=await once(`${d}/t/${t.id}.json`);let i=0;
    if(ref){const n=ref.split('.');const v=n.length>1?+n[n.length-1]:0,s=n.length>1?n.slice(0,-1).join('.'):n[0];i=tx.v.findIndex(x=>String(x[0])===s&&(!v||+x[1]===v));if(i<0)i=tx.v.findIndex(x=>String(x[0])===s);if(i<0)i=0}
    READ={d,page,id:t.id,title:t.title,v:tx.v,i,auto:false};return readShow()}
  return null}
const RD={sa:['पूर्वम्','अग्रिमम्','पुनः','निरन्तरं पठ','विरम'],te:['ముందుది','తరువాత','మళ్ళీ','వరుసగా చదువు','ఆపు'],hi:['पिछला','अगला','फिर से','लगातार पढ़ो','रुको'],en:['Previous','Next','Repeat','Read on','Stop']};
function readShow(){const R=READ,e=R.v[R.i];if(!e){READ=null;return ['✅ End of the text. 🙏']}const lab=RD[LANG]||RD.en;
  const lines=e[2];return [`📖 <b>${esc(R.title)} ${esc(e[0])}.${e[1]}</b> <span class="ref">(${R.i+1}/${R.v.length})</span><div class="v">${lines.map((x,i)=>esc(x)+(i%2&&i!==lines.length-1?' ।':'')).join('<br>')} ॥</div>`+
    `<div class="chips"><button type="button" data-say="read:prev">⏮ ${lab[0]}</button><button type="button" data-say="read:next">⏭ ${lab[1]}</button><button type="button" data-say="read:again">🔁 ${lab[2]}</button><button type="button" data-say="read:auto">▶ ${lab[3]}</button><button type="button" data-say="read:stop">⏹ ${lab[4]}</button></div>`+
    `<span data-aud="${R.d}/${R.id}/${e[0]}/${e[1]}"></span><a class="lk" href="${ROOT}${R.page}#${R.id}/${encodeURIComponent(e[0])}/${e[1]}">Open on the page →</a>`,lines.join(' ')]}
function readCmd(raw){if(!READ)return null;const l=raw.toLowerCase().trim();
  if(/^(read:next|next|next verse|aage|आगे|अगला|अग्रिमम्|తరువాత|తర్వాత)$/.test(l)){READ.i++;return readShow()}
  if(/^(read:prev|previous|back|prev|पिछला|पूर्वम्|ముందుది|వెనుక)$/.test(l)){READ.i=Math.max(0,READ.i-1);return readShow()}
  if(/^(read:again|again|repeat|फिर से|पुनः|మళ్ళీ)$/.test(l))return readShow();
  if(/^(read:auto|read on|keep reading|continue|continuous|लगातार पढ़ो|निरन्तरं पठ|వరుసగా చదువు)$/.test(l)){READ.auto=true;return readShow()}
  if(/^(read:stop|stop|enough|रुको|विरम|ఆపు)$/.test(l)){READ.auto=false;READ=null;stopSpeak();return ['⏹ OK. '+L_().ask+chips(L_().menu)]}
  return null}
function autoNext(){if(!READ||!READ.auto)return;const go=()=>{if(!READ||!READ.auto)return;if(SPEAK&&synth&&synth.speaking)return setTimeout(go,400);setTimeout(()=>{if(READ&&READ.auto){READ.i++;const o=readShow();reply(o[0],o[1]);autoNext()}},1200)};setTimeout(go,800)}

/* ---------- spoken commands ---------- */
const NUMW={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,
 first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10,eleventh:11,twelfth:12,
 'एक':1,'दो':2,'तीन':3,'चार':4,'पाँच':5,'पांच':5,'छह':6,'छः':6,'सात':7,'आठ':8,'नौ':9,'दस':10,'पहला':1,'पहले':1,'दूसरा':2,'दूसरे':2,'तीसरा':3,'तीसरे':3,'चौथा':4,'चौथे':4,
 'एकम्':1,'द्वे':2,'त्रीणि':3,'चत्वारि':4,'पञ्च':5,'षट्':6,'सप्त':7,'अष्ट':8,'दश':10,'प्रथम':1,'प्रथमः':1,'प्रथमे':1,'द्वितीय':2,'द्वितीयः':2,'द्वितीये':2,'तृतीय':3,'तृतीयः':3,'तृतीये':3,'चतुर्थ':4,'चतुर्थः':4,'चतुर्थे':4,
 'ఒకటి':1,'రెండు':2,'మూడు':3,'నాలుగు':4,'ఐదు':5,'ఆరు':6,'ఏడు':7,'ఎనిమిది':8,'తొమ్మిది':9,'పది':10,'మొదటి':1,'రెండవ':2,'రెండో':2,'మూడవ':3,'మూడో':3,'నాలుగవ':4,'నాలుగో':4,'ఐదవ':5,'ఐదో':5};
const NAVW=/^(please\s+)?(open|go to|goto|take me to|navigate to|visit|show me the|show me|show|bring up|load)\s+|\s+(page|kholo|खोलो|खोलिए|खोलें|दिखाओ|दिखाइए|पर जाओ|उद्घाटय|दर्शय|తెరువు|తెరవండి|చూపించు|చూపించండి|కి వెళ్ళు)$|^(खोलो|उद्घाटय|दर्शय|తెరువు|తెరవండి)\s+/i;
const CTX=/(chapter|verse|sloka|shloka|adhyay|sarga|canto|sutra|panini|point|dot|number|अध्याय|श्लोक|सूत्र|सर्ग|पाणिनि|అధ్యాయ|శ్లోక|సూత్ర|సర్గ|పాణిని|\d)/i;
const FILL=/\b(chapter|chapters|adhyaya|adhyayam|adhyay|canto|sarga|verse|verses|shloka|sloka|number|no|part|pada|of|the|from)\b|अध्यायः?|अध्याय|श्लोकः?|सर्गः?|पादः?|संख्या|का|की|के|అధ్యాయం|అధ్యాయము|శ్లోకం|సర్గ|పాదం|లో/gi;
function speechNorm(q){let s=q.replace(/[?!।]+$/,'').trim();
  const t0=s;s=s.replace(NAVW,()=>{NAV=true;return ' '}).trim();if(NAV){s=s.replace(NAVW,' ').trim()}
  if(!CTX.test(s))return s||t0;
  // number words → digits ("twenty one" → 21)
  s=s.split(/\s+/).map(w=>{const k=w.toLowerCase().replace(/[,.]$/,'');return NUMW[k]!==undefined?String(NUMW[k]):w}).join(' ').replace(/\b([2-9]0) ([1-9])\b/g,(m,a,b)=>String(+a+ +b));
  s=s.replace(/\b(point|dot)\b/gi,'.').replace(/(\d+)\s*(st|nd|rd|th|వ|వది|వా)\b/gi,'$1');
  const nums=s.match(/\d+/g);if(!nums||nums.length>3)return s;
  if(/^\s*\d+(\s*[.:,]\s*\d+)*\s*$/.test(s))return s.replace(/\s*[.:, ]\s*/g,'.');
  const name=s.replace(/\d+/g,' ').replace(/[.:,]/g,' ').replace(FILL,' ').replace(/\s+/g,' ').trim();
  return name?name+' '+nums.join('.'):nums.join('.')}
/* names of texts on the site, the author's books, and site pages */
const IXP={mn:'mantra.html',sb:'subhashita.html',ip:'itihasa.html',dh:'dharma.html',ak:'artha.html',ay:'ayurveda.html',rs:'rasa.html',jy:'jyotisha.html',kv:'sahitya.html'};
const PAGES=[['kosha.html','kosha kosa dictionary nighantu lexicon amarakosha कोश कोशः శబ్దకోశం నిఘంటువు शब्दकोश'],['vyakarana.html','grammar vyakarana व्याकरणम् వ్యాకరణం'],['krida.html','games game krida क्रीडा ఆటలు'],
 ['shabda.html','shabdarupa shabda noun forms declension शब्दरूपाणि శబ్దరూపాలు'],['dhatu.html','dhaturupa dhatu verb forms conjugation धातुरूपाणि ధాతురూపాలు'],['chandas.html','chandas metre meter छन्दः ఛందస్సు'],['pratyaya.html','pratyaya suffix prefix upasarga प्रत्ययाः'],
 ['shloka.html','shloka index sloka index kavya index श्लोकान्वेषणम्'],['sutra.html','sutra index sutras सूत्रान्वेषणम्'],['mantra.html','mantra veda vedas upanishad मन्त्राः'],['subhashita.html','subhashita सुभाषितम्'],['itihasa.html','itihasa purana index itihasa purana इतिहासपुराणम्'],
 ['shastra.html','shastra shastras शास्त्राणि'],['granthalaya.html','library granthalaya text library ग्रन्थालयः గ్రంథాలయం'],['books.html','all books books list catalogue catalog author books पुस्तकें పుస్తకాలు'],['greetings.html','greetings greeting cards shubhakamana शुभकामनाः'],['articles.html','articles blog लेखाः'],['kanthapatha.html','kanthapatha memorise memorize कण्ठपाठः'],['worksheet.html','worksheet worksheets अभ्यासपत्रम्'],['certificate.html','certificate प्रमाणपत्रम्'],['index.html','home homepage main page मुखपृष्ठम्'],['sources.html','sources licences license'],
 ['ayurveda.html','ayurveda आयुर्वेदः'],['dharma.html','dharmashastra dharma shastra'],['artha.html','arthashastra kamasutra'],['jyotisha.html','jyotisha astronomy ganita'],['rasa.html','rasashastra alchemy'],['sahitya.html','alankara sahitya natya poetics']];
const fz=s=>loose(s).replace(/([aiu])\1/g,'$1').replace(/ee/g,'i').replace(/oo/g,'u').replace(/([kgcjtdpb])h/g,'$1').replace(/w/g,'v').replace(/m$/,'');
async function byName(q){const k=fz(q);if(k.length<3)return null;const pageWord=/\b(page|index|tool)\b|पृष्ठ|పేజీ/i.test(q);
  // 1) the author's books — exact or leading title match
  BOOKS=BOOKS||await loadBooks();
  const bk=BOOKS.filter(b=>{const t1=fz(b.t.replace(/\(.*$/,'')),t2=fz((b.t.match(/\(([^)]*)\)/)||[,''])[1]);return t1===k||t2===k||(k.length>=6&&(t1.startsWith(k)||t2.startsWith(k)))});
  // 2) texts in the site's indexes
  let tx=null;
  for(const [d,page] of [['su','sutra.html'],['sl','shloka.html']]){const c=await cat(d);const t=c.texts.find(w=>w.aliases.some(a=>fz(a)===k)||fz(w.title)===k||(k.length>=5&&(fz(w.title).startsWith(k)||w.aliases.some(a=>a.length>=5&&k.startsWith(fz(a))))));if(t){tx={title:t.title,url:ROOT+page+'#'+t.id,n:t.verses};break}}
  if(!tx&&!bk.length)for(const d in IXP){let c;try{c=await cat(d)}catch(e){continue}const w=c.works.find(w=>(w.aliases||[]).some(a=>fz(a)===k)||fz(w.title)===k||(k.length>=5&&fz(w.title).startsWith(k)));if(w){tx={title:w.title,url:ROOT+IXP[d]+'#'+w.id,n:w.verses};break}}
  // 3) site pages
  const pg=PAGES.find(([u,w])=>w.split(' ').some(x=>x.length>=4&&fz(x)===k)||(pageWord&&w.split(' ').some(x=>x.length>=4&&k.startsWith(fz(x)))));
  if(bk.length===1&&!(tx&&!NAV&&false)){const b=bk[0];return [card(b)+(tx?`<div class="ref">Also in the library: <a href="${tx.url}">${esc(tx.title)} (original text) →</a></div>`:''),b.t.replace(/\(.*?\)/g,''),ROOT+'b/'+b.u]}
  if(bk.length>1&&!tx){const r=['📘 '+bk.slice(0,4).map(card).join(''),bk.slice(0,3).map(b=>b.t.replace(/\(.*?\)/g,'')).join(', ')];return r}
  if(tx)return [`📜 <b>${esc(tx.title)}</b> — ${tx.n?tx.n.toLocaleString('en-IN')+' verses, ':''}in the site's library.`+(bk.length?`<div class="ref">The author's book: ${bk.slice(0,2).map(b=>`<a href="${ROOT}b/${b.u}">${esc(b.t)}</a>`).join(' · ')}</div>`:''),tx.title,tx.url];
  if(pg)return [`🧭 ${esc(pg[1].split(' ').filter(x=>/[ऀ-ॿ]/.test(x))[0]||pg[0].replace('.html',''))}`,'',ROOT+pg[0]];
  return null}

/* ---------- books ---------- */
const SHELF={'geya-sa':'purana puranam geya mahapurana purāṇa पुराण పురాణ sanskrit','geya-te':'purana puranam geya mahapurana purāṇa पुराण పురాణ telugu',itihasa:'itihasa ramayana ramayanam mahabharata mahabharatam bharata epic रामायण महाभारत రామాయణ మహాభారత',
 vyak:'grammar vyakarana panini sandhi samasa karaka dhatu pratyaya व्याकरण వ్యాకరణ',natya:'natya natyashastra dance drama abhinaya rasa bharata नाट्य నాట్య',shk:'shastra science ayurveda vastu jyotisha dharma niti yantra annamaya शास्त्र శాస్త్ర',
 kosha:'dictionary kosha kosa lexicon reverse कोश కోశ',stotra:'stotra hymn devotional devi durga kali स्तोत्र స్తోత్ర',shiksha:'education shiksha pedagogy teacher शिक्षा శిక్ష',
 'edu-sa':'education psychology iks shiksha learning शिक्षा','edu-en':'education darshana philosophy sadhana niti english',
 'vk-sa':'kavya poetry poem vachana free verse काव्य కావ్య','vk-te':'kavya poetry poem vachana free verse కావ్య కవిత్వం','new-sa':'kavya poetry sahasranama vachana new','new-te':'kavya poetry sahasranama vachana new',
 rudra:'rudra rudram namakam chamakam shiva కావ్య',misc:'poetry kavya gaganakusuma'};
const LANGW={telugu:'tel','తెలుగు':'tel',sanskrit:'san','संस्कृत':'san','సంస్కృత':'san',english:'eng',hindi:'hin','हिन्दी':'hin'};
const STOP=new Set('show me any some all the a an of on in for about book books please give list want need i to and or with by from your his author grantha granthas kavya kavyas new latest what which is are there do you have'.split(' '));
let BOOKS=null;
const loadBooks=async()=>(await once('sri-books.json')).map(b=>({...b,hay:loose(b.t+' '+b.s+' '+b.d+' '+(SHELF[b.h]||''))+' '+(SHELF[b.h]||'')}));
async function books(q){BOOKS=BOOKS||await loadBooks();
  let lang=null;const toks=[];for(const w of q.toLowerCase().split(/[\s,?.!]+/)){if(!w)continue;if(LANGW[w]||LANGW[w.replace(/[ంम्]$/,'')]){lang=LANGW[w]||LANGW[w.replace(/[ంम्]$/,'')];continue}if(STOP.has(w))continue;const l=loose(w);if(l.length>=3)toks.push(l)}
  let list=BOOKS.filter(b=>!lang||b.l===lang);
  if(toks.length){list=list.map(b=>[b,toks.reduce((n,t)=>n+(b.hay.includes(t)?(loose(b.t).includes(t)?3:1):0),0)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
  else if(!lang&&!/book|grantha|पुस्तक|ग्रन्थ|పుస్తక/.test(q.toLowerCase()))return null;
  if(!list.length)return null;
  const top=list.slice(0,5);
  const h=`${list.length>5?`I found <b>${list.length}</b> books — here are the first 5:`:`Here ${list.length>1?`are ${list.length} books`:'is the book'}:`}`+top.map(card).join('')+
    (list.length>5?`<a class="lk" href="${ROOT}books.html">See all books →</a>`:'')+chips([['Telugu books','telugu books'],['Purāṇas','purana books'],['Grammar','grammar books'],['Nāṭya','natya books']]);
  const r=[h,`I found ${list.length} book${list.length>1?'s':''}. ${top.slice(0,3).map(b=>b.t.replace(/\(.*?\)/g,'')).join(', ')}.`];
  r.strong=!!lang||toks.some(t=>SHW.includes(t)||loose(top[0].t).includes(t));return r}
const SHW=loose(Object.values(SHELF).join(' '))+' '+Object.values(SHELF).join(' ').toLowerCase();
const LNAME={san:'संस्कृतम्',tel:'తెలుగు',eng:'English',hin:'हिन्दी'};
const SITE='https://sanskritmanthan.in/';
const plain=b=>b.t.replace(/\s*\(.*?\)\s*/g,' ').trim();
const shareUrl=b=>`https://wa.me/?text=${encodeURIComponent('📖 '+plain(b)+' — Dr. Mantha Srinivasu\n'+SITE+'b/'+b.u)}`;
const UI={buy:{sa:'🛒 क्रीणातु (Google Play)',te:'🛒 కొనండి (Google Play)',hi:'🛒 खरीदें (Google Play)',en:'🛒 Buy on Google Play'},det:{sa:'विवरणम्',te:'వివరాలు',hi:'विवरण',en:'Details'},sh:{sa:'📲 प्रेषयतु',te:'📲 షేర్ చేయండి',hi:'📲 शेयर करें',en:'📲 Share'},pg:{sa:'पृष्ठानि',te:'పేజీలు',hi:'पृष्ठ',en:'pages'}};
const ui=k=>UI[k][LANG]||UI[k].en;
const card=b=>`<div class="card">${b.c?`<img loading="lazy" src="${ROOT}cv/${esc(b.c)}" alt="">`:''}<div><b>${esc(b.t)}</b><p class="mt">${b.n?`📄 ${esc(b.n)} ${ui('pg')} · `:''}${LNAME[b.l]||''}${b.pr?` · 💰 ${esc(b.pr)}`:''}</p><p>${esc(b.d.slice(0,140))}${b.d.length>140?'…':''}</p>
<a class="lk buy" href="${esc(b.p)}" target="_blank" rel="noopener">${ui('buy')}</a><a class="lk" href="${ROOT}b/${esc(b.u)}">${ui('det')}</a><a class="lk" href="${shareUrl(b)}" target="_blank" rel="noopener">${ui('sh')}</a></div></div>`;
/* ---------- book helpers: find by name, twin edition, details, buying ---------- */
const bkey=b=>fz(b.t.replace(/\(.*$/,'').replace(/[—–-]\s*(sanskrit|telugu|english|hindi)\s*$/i,''));
async function findBooks(name){BOOKS=BOOKS||await loadBooks();const k=fz(name.replace(/\b(book|books|the|edition|version)\b/gi,'').replace(/पुस्तक|గ్రంథం|పుస్తకం/g,''));if(k.length<3)return [];
  const sc=b=>{const t1=fz(b.t.replace(/\(.*$/,'')),t2=fz((b.t.match(/\(([^)]*)\)/)||[,''])[1]),L=[t1,t2];
    if(L.some(t=>t===k))return 4;if(L.some(t=>t.startsWith(k)))return 3;if(k.length>=4&&L.some(t=>t.includes(k)))return 2;if(k.length>=5&&b.hay.includes(loose(name)))return 1;return 0};
  let wantL=null;for(const [w,l] of Object.entries(LANGW))if(name.toLowerCase().includes(w))wantL=l;
  let r=BOOKS.map(b=>[b,sc(b)]).filter(x=>x[1]>0);
  if(!r.length&&wantL){const k2=fz(name.replace(new RegExp(Object.keys(LANGW).join('|'),'gi'),''));if(k2.length>=3)r=BOOKS.map(b=>{const t1=fz(b.t.replace(/\(.*$/,'')),t2=fz((b.t.match(/\(([^)]*)\)/)||[,''])[1]);return [b,[t1,t2].some(t=>t.includes(k2))?2:0]}).filter(x=>x[1]>0)}
  if(wantL)r=r.filter(x=>x[0].l===wantL).concat(r.filter(x=>x[0].l!==wantL).map(x=>[x[0],x[1]-0.5]));
  const top=Math.max(0,...r.map(x=>x[1]));return r.filter(x=>x[1]>=top-0.5&&top>=2||x[1]===top).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
function twin(b){const k=bkey(b);return BOOKS.find(x=>x!==b&&x.l!==b.l&&bkey(x)===k)}
function detail(b,focus){const tw=twin(b),dt=b.dt?new Date(b.dt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';
  const extra=[dt?`📅 Published ${dt}`:'',`🔎 Free sample: open it on Google Play and tap “Free sample”`+(b.a?` · <a href="https://archive.org/details/sanskritmanthan-${esc(b.u)}-sample" target="_blank" rel="noopener">sample on archive.org</a>`:''),
    `💰 Price: shown on Google Play in your own currency${b.pr?` (${esc(b.pr)})`:''}.`].filter(Boolean).map(x=>`<div class="ref">${x}</div>`).join('');
  const ch=[];if(tw)ch.push([`${LNAME[tw.l]} edition`,`details of ${plain(tw)}`]);ch.push(['More like this',`more like ${plain(b)}`]);
  return [(focus==='buy'?`🛒 <b>${esc(plain(b))}</b> — tap below to buy on Google Play:`:'')+card(b)+extra+`<span data-aud="book:${b.u}"></span>`+chips(ch),plain(b)+(b.n?`, ${b.n} pages`:''),undefined]}
async function bookIntent(raw,lo){let m;
  const one=async(name,focus)=>{const r=await findBooks(name);if(!r.length)return null;if(r.length===2&&twin(r[0])===r[1]&&LANG!=='en'){const want=LANG==='te'?'tel':'san';const one1=r.find(b=>b.l===want);if(one1)r.splice(0,2,one1)}
    if(r.length===1)return focus==='share'?shareMsg(r[0]):focus==='sample'?sampleMsg(r[0]):detail(r[0],focus);
    return [`I found ${r.length} matching books:`+r.slice(0,5).map(card).join(''),plain(r[0])]};
  if((m=raw.match(/^(?:buy|purchase|order|price of|cost of|how much (?:is|does|for)|price|cost|rate of|खरीदें|खरीदना|खरीदो|मूल्य|క్రీణాతు|కొనండి|కొనాలి|ధర)\s+(.+?)(?:\s+(?:cost|costs|book))?\??$/i)||raw.match(/^(.+?)\s+(?:price|cost|rate|ధర|ఎంత|की कीमत|कीमत|का मूल्य|मूल्यम्|कितने का है)\??$/i)))return await one(m[1],'buy');
  if((m=raw.match(/^(?:details? (?:of|about)|tell me about|about|information (?:on|about)|info (?:on|about)|describe|विवरण|వివరాలు)\s+(.+)$/i)||raw.match(/^(.+?)\s+(?:details|book details|వివరాలు|विवरण)$/i)))return await one(m[1]);
  if((m=raw.match(/^how many pages(?: (?:in|does|has|of))?\s+(.+?)(?: have)?\??$/i)))return await one(m[1]);
  if((m=raw.match(/^(?:share|send|whatsapp)\s+(.+)$/i)))return await one(m[1],'share');
  if((m=raw.match(/^(?:free )?(?:sample|preview|read sample)(?: of)?\s+(.+)$/i)))return await one(m[1],'sample');
  if((m=raw.match(/^(telugu|sanskrit|english|hindi)\s+(?:version|edition|translation)\s+of\s+(.+)$/i)))return await one(m[2]+' '+m[1]);
  if((m=raw.match(/^more like\s+(.+)$/i))){const r=await findBooks(m[1]);if(r.length){const b=r[0],sim=BOOKS.filter(x=>x!==b&&x.h===b.h&&x.l===b.l);const pick=sim.sort(()=>Math.random()-.5).slice(0,4);if(pick.length)return [`Books like <b>${esc(plain(b))}</b>:`+pick.map(card).join(''),pick.map(plain).join(', ')]}}
  if(/\b(suggest|recommend|random|surprise me)\b/.test(lo)||/सुझाव|సూచించు|సూచన/.test(raw)){BOOKS=BOOKS||await loadBooks();const b=BOOKS[Math.floor(Math.random()*BOOKS.length)];return [`✨ Here is a book for you:`+card(b)+chips([['Another one','suggest a book'],['☰ Menu','menu']]),plain(b)]}
  if(/how many books|number of books|total books|कितनी पुस्तक|ఎన్ని పుస్తకాలు/.test(lo)){BOOKS=BOOKS||await loadBooks();const by=l=>BOOKS.filter(b=>b.l===l).length;
    return [`📚 <b>${BOOKS.length}</b> books on Google Play — ${by('san')} in Sanskrit, ${by('tel')} in Telugu, ${by('eng')} in English, ${by('hin')} in Hindi.<br>Purāṇas & Itihāsas, śāstra and grammar kāvyas, Nāṭya, kośas, stotras, education and vacana-kāvyas.`+chips([['Telugu books','telugu books'],['Sanskrit books','sanskrit books'],['Newest','new books']]),`${BOOKS.length} books`]}
  if(/\b(new|latest|recent|newest)\b.*\bbooks?\b|new arrivals|नई पुस्तक|కొత్త పుస్తకాలు/.test(lo)){BOOKS=BOOKS||await loadBooks();const r=BOOKS.filter(b=>b.dt).sort((a,b)=>b.dt.localeCompare(a.dt)).slice(0,5);
    return [`🆕 Newest books:`+r.map(card).join(''),r.map(plain).slice(0,3).join(', ')]}
  if((m=lo.match(/\b(short|small|quick|under|less than|below)\b\s*(\d+)?\s*(pages?)?/))&&/book|read|pages/.test(lo)){BOOKS=BOOKS||await loadBooks();const lim=+(m[2]||100);const r=BOOKS.filter(b=>+b.n&&+b.n<=lim).sort((a,b)=>a.n-b.n);
    if(r.length)return [`📗 ${r.length} books of ${lim} pages or fewer — the shortest:`+r.slice(0,5).map(card).join(''),`${r.length} short books`]}
  return null}
function shareMsg(b){return [`Share <b>${esc(plain(b))}</b>:<br><a class="lk big" href="${shareUrl(b)}" target="_blank" rel="noopener">📲 WhatsApp</a><div class="ref">Link: ${SITE}b/${esc(b.u)}</div>`,'Tap WhatsApp to share']}
function sampleMsg(b){return [`🔎 Free sample of <b>${esc(plain(b))}</b>:<br><a class="lk big" href="${esc(b.p)}" target="_blank" rel="noopener">Google Play → “Free sample”</a>`+(b.a?`<a class="lk" href="https://archive.org/details/sanskritmanthan-${esc(b.u)}-sample" target="_blank" rel="noopener">Read sample on archive.org</a>`:''),'Open Google Play and tap Free sample']}

/* ---------- verses by opening words ---------- */
const DS=[{d:'su',page:'sutra.html',lab:'सूत्र-/दर्शनग्रन्थाः'},{d:'sl',page:'shloka.html',lab:'काव्यम्'},{d:'sb',page:'subhashita.html',lab:'सुभाषितम्',all:1},{d:'mn',page:'mantra.html',lab:'वेदाः/उपनिषदः',all:1}];
async function cat(d){return once(d+'/catalog.json')}
async function titleOf(ds,id){const c=await cat(ds.d);if(c.texts){const t=c.texts.find(x=>x.id===id);return t?t.title:id}
  const b=c.books.find(x=>x.id===id);if(!b)return id;const w=c.works.find(x=>x.id===b.work);return w?(w.books.length>1?`${w.title} · ${b.title}`:w.title):b.title}
async function verses(q){const codes=codesFor(q);if(!codes.length)return null;const lq=loose(q);if(lq.length<3)return null;
  const hits=[];
  for(const ds of DS){for(const c of codes){let rows;try{rows=await once(`${ds.d}/a/${ds.all?'all/':''}${c}.json`)}catch(e){continue}
      for(const r of rows){const k=r._k||(r._k=loose(r[0]));if(k.startsWith(lq))hits.push([ds,r])}}
    if(hits.length>=12)break}
  if(!hits.length){if(isIndic(q)||lq.length>=6)return [`I could not find a verse beginning “${esc(q)}” in the śloka, sūtra, subhāṣita and mantra collections. You can also search the large Itihāsa–Purāṇa index:`+
      `<br><a class="lk" href="${ROOT}itihasa.html?q=${encodeURIComponent(q)}">Search Itihāsa–Purāṇa →</a><a class="lk" href="${ROOT}shloka.html?q=${encodeURIComponent(q)}">Śloka index →</a>`];return null}
  const seen=new Set(),out=[];for(const [ds,r] of hits){const key=ds.d+r[1]+r[2]+r[3];if(seen.has(key))continue;seen.add(key);out.push([ds,r]);if(out.length>=6)break}
  let h=`Verses beginning <b>“${esc(q)}”</b>:`;
  for(const [ds,r] of out){const t=await titleOf(ds,r[1]);h+=`<div class="v">${esc(r[0])}…</div><div class="ref">${esc(t)} ${esc(r[2])}.${esc(r[3])} · <a href="${ROOT}${ds.page}#${encodeURIComponent(r[1])}/${encodeURIComponent(r[2])}/${r[3]}">read full verse →</a></div>`}
  h+=`<a class="lk" href="${ROOT}shloka.html?q=${encodeURIComponent(q)}">More in Śloka index →</a>`;
  const [ds0,r0]=out[0];return [h,`${r0[0]}. From ${await titleOf(ds0,r0[1])}.`,out.length===1?`${ROOT}${ds0.page}#${encodeURIComponent(r0[1])}/${encodeURIComponent(r0[2])}/${r0[3]}`:undefined]}

/* ---------- references: gita 2.47, raghu 1.1, megha 5 ---------- */
async function reference(name,nums){const k=loose(name),k0=name.trim().toLowerCase();if(k.length<2)return null;
  for(const ds of [{d:'su',page:'sutra.html'},{d:'sl',page:'shloka.html'}]){const c=await cat(ds.d);
    const t=c.texts.find(w=>w.aliases.some(a=>a===k||a===k0))||c.texts.find(w=>k.length>=3&&w.aliases.some(a=>a.length>=3&&(a.startsWith(k)||k.startsWith(a))));
    if(!t)continue;const n=nums.split(/\s*[.:,]\s*/);let s,v;
    if(t.sargas.length===1){s=String(t.sargas[0][0]);v=+n[n.length-1]}else{v=+n[n.length-1];s=n.slice(0,-1).join('.');if(!s){return [`<b>${esc(t.title)}</b> has ${t.sargas.length} parts. Give a verse too, e.g. <i>${esc(name)} ${n[0]}.1</i>.`,'',`${ROOT}${ds.page}#${t.id}/${n[0]}`]}}
    const tx=await once(`${ds.d}/t/${t.id}.json`);const e=tx.v.find(x=>String(x[0])===s&&+x[1]===v);
    if(!e)return [`${esc(t.title)} ${esc(s)}.${v} — I couldn't find that verse number. <a class="lk" href="${ROOT}${ds.page}#${t.id}">Open ${esc(t.title)} →</a>`];
    const lines=e[2];return [`<b>${esc(t.title)} ${esc(s)}.${v}</b><div class="v">${lines.map((x,i)=>esc(x)+(i%2&&i!==lines.length-1?' ।':'')).join('<br>')} ॥</div>`+(e[3]?`<div class="ref">छन्दः: ${esc(e[3])}</div>`:'')+
      `<span data-aud="${ds.d}/${t.id}/${s}/${v}"></span>`+chips([['Next verse',`${name} ${s}.${v+1}`]]),lines.join(' '),`${ROOT}${ds.page}#${t.id}/${encodeURIComponent(s)}/${v}`]}
  return null}
const FAV=['2.47','2.20','2.14','2.62','2.63','3.21','3.35','4.7','4.8','4.38','6.5','6.6','9.22','9.26','12.13','12.14','18.66','18.78','2.48','2.50','3.19','5.18','6.17','6.35','7.19','10.20','11.32','13.28','15.7','16.21','17.20'];
async function gitaDay(){const tx=await once('su/t/bhagavadgita.json');const [a,b]=FAV[new Date().getDate()-1].split('.');const e=tx.v.find(x=>x[0]===a&&+x[1]===+b)||tx.v[0];
  return [`🕉 <b>भगवद्गीता ${e[0]}.${e[1]}</b> — today's verse<div class="v">${e[2].map((x,i)=>esc(x)+(i%2&&i!==e[2].length-1?' ।':'')).join('<br>')} ॥</div><span data-aud="su/bhagavadgita/${e[0]}/${e[1]}"></span>`+chips([['Next verse',`gita ${e[0]}.${e[1]+1}`],['☰ Menu','menu']]),e[2].join(' '),`${ROOT}sutra.html#bhagavadgita/${e[0]}/${e[1]}`]}

/* ---------- Pāṇini ---------- */
async function panini(a,p,n){const S=await once('vy/sutras.json');const k=`ashtadhyayi:${a}.${p}.${+n}`;const s=S[k];
  if(!s)return [`Aṣṭādhyāyī ${a}.${p}.${n} — no such sūtra (pāda ${a}.${p} may have fewer sūtras).`];const dv=s2d(s);
  return [`<b>अष्टाध्यायी ${a}.${p}.${+n}</b><div class="v">${esc(dv)} ।</div><div class="ref">${esc(s2i(s))}</div>`+
    chips([['Next sūtra',`${a}.${p}.${+n+1}`],['Grammar tools','forms of राम']]),dv,`${ROOT}sutra.html#ashtadhyayi/${a}.${p}/${+n}`]}

/* ---------- kośa (Monier-Williams, on the site) ---------- */
async function meaning(w){const slp=toSLP(w).replace(/\s/g,'');const dv=s2d(slp);const c=code([...dv].find(x=>ALPHA.includes(x))||'');
  const alt=new Set([slp,slp.replace(/[HM]$/,''),slp.replace(/aH$/,'a'),slp.replace(/am$/,'a'),slp.replace(/A$/,'A'),slp.replace(/i[H]$/,'i')]);
  let ent=[];if(c){try{const rows=await once(`ko/mw/${c}.json`);for(const a of alt){ent=rows.filter(r=>r[0]===a);if(ent.length)break}}catch(e){}}
  const link=`<a class="lk" href="${ROOT}kosha.html?q=${encodeURIComponent(dv)}">Search all kośas →</a>`;
  if(!ent.length)return [`I didn't find <b>${esc(dv)}</b> as a headword. Try the stem form (e.g. <i>धर्म</i> not <i>धर्मः</i>).`+link];
  return [`<b>${esc(s2d(ent[0][0]))}</b> <span class="ref">(${esc(s2i(ent[0][0]))}) — Monier-Williams:</span><ol style="margin:4px 0;padding-left:18px">${ent.slice(0,4).map(r=>`<li>${esc(r[1])}</li>`).join('')}</ol>`+link,
    `${s2d(ent[0][0])}: ${ent[0][1]}`]}

/* ---------- script converter ---------- */
function convert(text){const slp=toSLP(text),dv=/[ऀ-ॿ]/.test(text)?text:/[ఀ-౿]/.test(text)?t2d(text):s2d(slp);
  const rows=[['देवनागरी',dv],['తెలుగు',shift(dv,0x300)],['IAST',s2i(d2s(dv))],['ಕನ್ನಡ',shift(dv,0x380)],['മലയാളം',shift(dv,0x400)],['ગુજરાતી',shift(dv,0x180)],['বাংলা',shift(dv,0x80)],['ଓଡ଼ିଆ',shift(dv,0x200)]];
  return [`🔤 <table>${rows.map(([a,b])=>`<tr><td>${a}</td><td>${esc(b)}</td></tr>`).join('')}</table>`,dv]}

/* ---------- word forms ---------- */
function shabda(w){const dv=toDev(w).replace(/[ःं]$/,'');return [`Noun forms of <b>${esc(dv)}</b> — all cases and numbers:<br><a class="lk" href="${ROOT}shabda.html#${encodeURIComponent(dv)}/P">Masculine →</a><a class="lk" href="${ROOT}shabda.html#${encodeURIComponent(dv)}/S">Feminine →</a><a class="lk" href="${ROOT}shabda.html#${encodeURIComponent(dv)}/N">Neuter →</a>`+chips([['Verb forms of गम्','forms of verb गम्']])]}
async function dhatu(w){const D=(await once('vy/dhatus.json')).dhatus;const q=toSLP(w).replace(/\s/g,'').replace(/a$/,'');
  const plain=up=>{let s=up.replace(/[\\^]/g,'').replace(/^(qu|wu|Yi)/,'');s=s.replace(/[aAiIuUfFxXeEoO]~$/,'').replace(/~$/,'');if(/^z/.test(s))s='s'+s.slice(1);if(/^R/.test(s))s='n'+s.slice(1);return s};
  const hits=D.filter(e=>plain(e[1])===q||plain(e[1])===q+'a').slice(0,6);
  if(!hits.length)return [`I didn't find the root <b>${esc(toDev(w))}</b>. <a class="lk" href="${ROOT}dhatu.html">Browse all dhātus →</a>`];
  return [`Verb root <b>${esc(toDev(w))}</b>:`+hits.map(e=>`<div><a class="lk" href="${ROOT}dhatu.html#${e[0]}">${esc(s2d(e[1].replace(/[\\^]/g,'')))} · ${esc(s2d(e[4]))} · gaṇa ${e[2]+1} →</a></div>`).join('')+`<div class="ref">Each link shows every lakāra, with derivation.</div>`]}

/* ---------- app: install, offline bundles, visitor ping ---------- */
let PROMPT=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();PROMPT=e});
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
{const iso=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);try{if(localStorage.getItem('sm-vday')!==iso&&location.protocol==='https:'){fetch('/api/visits',{method:'POST'}).then(r=>{if(r.ok)localStorage.setItem('sm-vday',iso)}).catch(()=>{})}}catch(e){}}
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
async function installMsg(){if(standalone())return ['✅ You are already using the Sanskrit Manthan app.'+chips([['📥 Use offline','offline']])];
  if(PROMPT){PROMPT.prompt();const r=await PROMPT.userChoice.catch(()=>({}));PROMPT=null;return [r&&r.outcome==='accepted'?'✅ Installed! Find “Sanskrit Manthan” on your home screen.':'OK — you can install any time from this menu.']}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  return [ios?'📲 On iPhone/iPad: tap the <b>Share</b> button (□↑) in Safari, then <b>“Add to Home Screen”</b>.':'📲 In Chrome: open the <b>⋮ menu</b> and choose <b>“Install app”</b> or <b>“Add to Home screen”</b>. Sanskrit Manthan then opens like an app, with its own icon.','How to install the app']}
async function offlineMsg(){const B=await once('offline.json');
  return [`📥 <b>Use offline</b> — save parts of the library on this device. Pages you have opened are kept automatically.`+B.map(b=>`<div class="ref">${esc(b.n)} · ${b.mb} MB</div>`).join('')+
    chips(B.filter(b=>b.id!=='itihasa').map(b=>[`📥 ${b.n.split(/[,(]/)[0]} (${b.mb} MB)`,'save:'+b.id]).concat([[`📥 Itihāsa–Purāṇa (${B.find(b=>b.id==='itihasa').mb} MB)`,'save:itihasa']])),'Choose what to save for offline use.']}
async function saveBundle(id){const B=(await once('offline.json')).find(b=>b.id===id);if(!B)return null;
  if(!('serviceWorker' in navigator)||!navigator.serviceWorker.controller)return ['Offline saving needs the site to be opened once over the internet in Chrome, Edge or Safari. Please reload the page and try again.'];
  const msg=add(`⏳ Saving <b>${esc(B.n)}</b> — 0 / ${B.f.length}`,'b');
  const on=e=>{const d=e.data||{};if(d.type!=='bundle-progress'||d.name!==id)return;msg.innerHTML=(d.done<d.total?`⏳ Saving <b>${esc(B.n)}</b> — ${d.done} / ${d.total}`:`✅ <b>${esc(B.n)}</b> is saved for offline use.`)+`<span class="tm">${now()}</span>`;if(d.done>=d.total)navigator.serviceWorker.removeEventListener('message',on);save()};
  navigator.serviceWorker.addEventListener('message',on);navigator.serviceWorker.controller.postMessage({type:'bundle',name:id,urls:B.f});return ['Saving in the background — you can keep using the site.','']}
/* ---------- greetings, today's śloka, articles ---------- */
let GD=null;async function greetData(){if(GD)return GD;GD=await once('g/slokas.json');try{const t=await once('g/tr.json');for(const s of GD.slokas){const x=(t.occ||{})[s.occ];if(x)s.tr=Object.assign({},x,s.tr)}}catch(e){}return GD}
const GLANG={assamese:'as',bengali:'bn',bangla:'bn',bodo:'brx',dogri:'doi',english:'en',gujarati:'gu',hindi:'hi',kannada:'kn',kashmiri:'ks',konkani:'gom',maithili:'mai',malayalam:'ml',manipuri:'mni',meitei:'mni',marathi:'mr',nepali:'ne',odia:'or',oriya:'or',punjabi:'pa',sanskrit:'sa',santali:'sat',sindhi:'sd',tamil:'ta',telugu:'te',urdu:'ur'};
async function greetIntent(raw,lo){if(!/greeting|greet|wish|card|शुभकामना|शुभाशय|శుభాకాంక్ష|కార్డు|कार्ड/i.test(raw))return null;const D=await greetData();
  const w=fz(raw);const OAL={deepavali:'diwali deepavali dipawali deepawali दीपावली दिवाली దీపావళి',birthday:'birthday janmadin जन्मदिन పుట్టినరోజు జన్మదిన',newyear:'newyear ugadi yugadi gudi नववर्ष उगादि ఉగాది',sankranti:'sankranti pongal lohri bihu संक्रान्ति సంక్రాంతి',
 wedding:'wedding marriage anniversary vivah विवाह పెళ్ళి వివాహ',guru:'guru teacher purnima गुरु గురు',ganesha:'ganesha ganesh ganapati vinayaka गणेश వినాయక',navaratri:'navaratri dasara dussehra dasera vijayadashami durga दशहरा దసరా',
 raksha:'raksha rakhi rakshabandhan राखी రాఖీ',holi:'holi होली హోళీ',success:'success exam exams examination परीक्षा పరీక్ష',general:'blessing general blessings आशीर्वाद ఆశీర్వాద'};
  const o=D.occasions.find(o=>(OAL[o.id]||o.id).split(' ').some(k=>fz(k).length>=3&&w.includes(fz(k))))||null;
  let gl=LANG==='sa'?'sa':LANG||'en';for(const [k,v] of Object.entries(GLANG))if(lo.includes(k))gl=v;
  if(!o)return ['🎴 <b>Greeting cards</b> — choose an occasion:'+chips(D.occasions.map(o=>[`${o.icon} ${o.name}`,`${o.id} greeting`]))+`<a class="lk" href="${ROOT}greetings.html">Open the card maker →</a>`,'Choose an occasion for the greeting card.'];
  const s=D.slokas.find(s=>s.occ===o.id),t=s.tr[gl]||s.tr.en;
  return [`🎴 <b>${esc(o.sa)}</b> · ${esc(t.g)}<div class="v">${s.sl.split(/[।॥]/).map(x=>x.trim()).filter(Boolean).map(esc).join(' ।<br>')} ॥</div><div class="ref">${esc(t.m)}</div><span data-aud="greet:${o.id}"></span>`,t.g+'. '+s.sl+' '+t.m,`${ROOT}greetings.html?o=${o.id}&lang=${gl}`]}
async function todayMsg(){const D=await greetData();const iso=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),day=Math.floor((Date.now()-new Date(2026,0,1))/864e5);
  const s=D.slokas.find(x=>x.date===iso)||D.slokas[day%D.slokas.length],t=s.tr[LANG]||s.tr.en;
  return [`📜 <b>Today's śloka</b><div class="v">${s.sl.split(/[।॥]/).map(x=>x.trim()).filter(Boolean).map(esc).join(' ।<br>')} ॥</div><div class="ref">${esc(t.m)}</div>`+chips([['🎴 Make a card',`${s.occ} greeting`],["📰 Today's article",'article'],['🕉 Gītā verse','verse of the day']]),s.sl+' '+t.m]}
async function articleIntent(raw,lo){if(!/\b(articles?|blog|lekha)\b|लेख|వ్యాసం|వ్యాసాలు/i.test(raw))return null;let A=[];try{A=await once('articles.json')}catch(e){}
  if(!A.length)return ['No articles yet — the first one is coming soon. 🙏'];const q=raw.replace(/\b(today'?s|latest|new|read|the|articles?|on|about|show|me|open)\b|लेख[ाः]*|వ్యాసం|వ్యాసాలు|आज का|నేటి/gi,' ').trim();
  let hit=A[0];if(q.length>=3){const k=loose(q);const f=A.find(a=>loose(a.title+' '+a.t).includes(k));if(f)hit=f;else return [`I found no article on “${esc(q)}”. Latest:`+A.slice(0,5).map(a=>`<div><a class="lk" href="${ROOT}a/${a.slug}">${esc(a.title)}</a> <span class="ref">${a.date}</span></div>`).join('')]}
  const read=/\bread\b|पढ़|చదువు|पठ/i.test(raw);if(read){say(hit.t,true,6000)}
  return [`📰 <b>${esc(hit.title)}</b> <span class="ref">${hit.date}</span><div class="ref">${esc(hit.excerpt)}</div>`+chips([['🔊 Read it to me',`read article ${hit.title.split(/[—\-]/)[0].trim()}`],['📰 All articles','articles list']]),read?'':hit.title,`${ROOT}a/${hit.slug}`]}

/* ---------- more Indian languages for Bodhinī's own words (generated by tools/sri_langs.py) ---------- */
const XL=/*XL*/{"kn":{"menu":["ಶುಭಾಶಯ ಪತ್ರ","ಇಂದಿನ ಶ್ಲೋಕ","ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ","ಪುಸ್ತಕಗಳು","ಶ್ಲೋಕ ಹುಡುಕಿ","ಸೂತ್ರ 1.1.1","ಇಂದಿನ ಗೀತಾ ಶ್ಲೋಕ","ಪದದ ಅರ್ಥ","ಲಿಪಿ ಪರಿವರ್ತಕ","ಪದ ರೂಪಗಳು","ಪರಿಚಯ ಮತ್ತು ಖರೀದಿ","ಆಟಗಳು","ವ್ಯಾಕರಣ ಪಾಠಗಳು","ಗಟ್ಟಿಯಾಗಿ ಓದಿ","ಸ್ಕ್ರೀನ್ ರೀಡರ್","ಭಾಷೆ"],"ok":"ಅದ್ಭುತ! ನಾನು ಬೋಧಿನೀ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?","ask":"ನಿಮಗೆ ಏನು ಬೇಕು?","thx":"ಸಂತೋಷ! ಇನ್ನೇನಾದರೂ ಕೇಳಿ.","nf":"ಕ್ಷಮಿಸಿ, ಅದು ಸಿಗಲಿಲ್ಲ. ಶ್ಲೋಕದ ಆರಂಭದ ಪದಗಳು, ಪುಸ್ತಕದ ವಿಷಯ (ಉದಾ. ಪುರಾಣ, ವ್ಯಾಕರಣ, ತೆಲುಗು), ಅಥವಾ ಇವುಗಳಲ್ಲಿ ಒಂದನ್ನು ಪ್ರಯತ್ನಿಸಿ —","rd":["ಹಿಂದಿನದು","ಮುಂದಿನದು","ಮತ್ತೆ ಓದಿ","ಮುಂದುವರಿಸಿ","ನಿಲ್ಲಿಸಿ"],"buy":"ಖರೀದಿಸಿ (Google Play)","det":"ವಿವರಗಳು","sh":"ಹಂಚಿಕೊಳ್ಳಿ","pg":"ಪುಟಗಳು","opening":"ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ…","openw":"ಪುಟ ತೆರೆಯಿರಿ","selb":"ಗಟ್ಟಿಯಾಗಿ ಓದಿ","srh":"ಸ್ಕ್ರೀನ್ ರೀಡರ್ — ದಯವಿಟ್ಟು ಈ ಪುಟದಲ್ಲಿನ ಯಾವುದೇ ಪಠ್ಯ ಅಥವಾ ಶ್ಲೋಕವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (ಮೌಸ್‌ನಿಂದ ಎಳೆಯಿರಿ, ಅಥವಾ ಫೋನ್‌ನಲ್ಲಿ ದೀರ್ಘವಾಗಿ ಒತ್ತಿ). “ಗಟ್ಟಿಯಾಗಿ ಓದಿ” ಬಟನ್ ಕಾಣಿಸುತ್ತದೆ — ಅದನ್ನು ಒತ್ತಿದರೆ ನಾನು ಓದಿ ಹೇಳುತ್ತೇನೆ. ಇಡೀ ಪುಟವನ್ನು ಕೇಳಲು “ಈ ಪುಟ ಓದು” ಎಂದು ಹೇಳಿ.","name":"ಕನ್ನಡ"},"ta":{"menu":["வாழ்த்து அட்டை","இன்றைய ஸ்லோகம்","செயலியை நிறுவுக","நூல்கள்","ஸ்லோகம் தேடுக","சூத்திரம் 1.1.1","இன்றைய கீதை ஸ்லோகம்","சொல்லின் பொருள்","எழுத்து மாற்றி","சொல் வடிவங்கள்","அறிமுகம் & வாங்குதல்","விளையாட்டுகள்","இலக்கணப் பாடங்கள்","உரக்கப் படிக்கவும்","திரை வாசிப்பான்","மொழி"],"ok":"அருமை! நான் போதினீ. நான் உங்களுக்கு எப்படி உதவலாம்?","ask":"உங்களுக்கு என்ன வேண்டும்?","thx":"மகிழ்ச்சி! வேறு ஏதாவது கேளுங்கள்.","nf":"மன்னிக்கவும், அது கிடைக்கவில்லை. ஒரு ஸ்லோகத்தின் தொடக்கச் சொற்கள், ஒரு நூலின் தலைப்பு (எ.கா. புராணம், இலக்கணம், தெலுங்கு), அல்லது இவற்றில் ஒன்றை முயற்சிக்கவும் —","rd":["முந்தையது","அடுத்தது","மீண்டும்","தொடர்ந்து படி","நிறுத்து"],"buy":"வாங்குக (Google Play)","det":"விவரங்கள்","sh":"பகிர்","pg":"பக்கங்கள்","opening":"பக்கம் திறக்கப்படுகிறது…","openw":"பக்கத்தைத் திறக்கவும்","selb":"உரக்கப் படிக்கவும்","srh":"திரை வாசிப்பான் — இந்தப் பக்கத்தில் உள்ள எந்த உரையையோ ஸ்லோகத்தையோ தேர்ந்தெடுக்கவும் (மவுஸால் இழுக்கவும், அல்லது தொலைபேசியில் நீண்ட நேரம் அழுத்தவும்). “உரக்கப் படிக்கவும்” பொத்தான் தோன்றும் — அதைத் தட்டினால் நான் படித்துக் காட்டுவேன். முழுப் பக்கத்தையும் கேட்க “இந்தப் பக்கத்தைப் படி” என்று சொல்லுங்கள்.","name":"தமிழ்"},"ml":{"menu":["ആശംസാ കാർഡ്","ഇന്നത്തെ ശ്ലോകം","ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക","പുസ്തകങ്ങൾ","ശ്ലോകം തിരയുക","സൂത്രം 1.1.1","ഇന്നത്തെ ഗീതാശ്ലോകം","വാക്കിന്റെ അർത്ഥം","ലിപി മാറ്റം","പദരൂപങ്ങൾ","പരിചയവും വാങ്ങലും","കളികൾ","വ്യാകരണ പാഠങ്ങൾ","ഉറക്കെ വായിക്കുക","സ്ക്രീൻ റീഡർ","ഭാഷ"],"ok":"കൊള്ളാം! ഞാൻ ബോധിനി. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?","ask":"നിങ്ങൾക്ക് എന്താണ് വേണ്ടത്?","thx":"സന്തോഷം! മറ്റെന്തെങ്കിലും ചോദിച്ചോളൂ.","nf":"ക്ഷമിക്കണം, അത് കണ്ടെത്താനായില്ല. ഒരു ശ്ലോകത്തിന്റെ ആദ്യ വാക്കുകൾ, ഒരു പുസ്തക വിഷയം (ഉദാ. പുരാണം, വ്യാകരണം, തെലുങ്ക്), അല്ലെങ്കിൽ ഇവയിലൊന്ന് പരീക്ഷിക്കൂ —","rd":["മുമ്പത്തേത്","അടുത്തത്","വീണ്ടും","തുടർന്ന് വായിക്കുക","നിർത്തുക"],"buy":"വാങ്ങുക (Google Play)","det":"വിശദാംശങ്ങൾ","sh":"പങ്കിടുക","pg":"പേജുകൾ","opening":"പേജ് തുറക്കുന്നു…","openw":"പേജ് തുറക്കുക","selb":"ഉറക്കെ വായിക്കുക","srh":"സ്ക്രീൻ റീഡർ — ഈ പേജിലെ ഏതെങ്കിലും വാചകമോ ശ്ലോകമോ തിരഞ്ഞെടുക്കൂ (മൗസ് കൊണ്ട് വലിച്ചോ, ഫോണിൽ അമർത്തിപ്പിടിച്ചോ). “ഉറക്കെ വായിക്കുക” എന്ന ബട്ടൺ പ്രത്യക്ഷപ്പെടും — അതിൽ തൊട്ടാൽ ഞാൻ വായിച്ചു കേൾപ്പിക്കാം. പേജ് മുഴുവൻ കേൾക്കാൻ “ഈ പേജ് വായിക്കൂ” എന്ന് പറയൂ.","name":"മലയാളം"},"mr":{"menu":["शुभेच्छा पत्र","आजचा श्लोक","ॲप इन्स्टॉल करा","पुस्तके","श्लोक शोधा","सूत्र 1.1.1","आजचा गीता श्लोक","शब्दाचा अर्थ","लिपी परिवर्तक","शब्दरूपे","माहिती व खरेदी","खेळ","व्याकरण पाठ","मोठ्याने वाचा","स्क्रीन रीडर","भाषा"],"ok":"छान! मी बोधिनी आहे. मी तुमची कशी मदत करू शकते?","ask":"तुम्हाला काय हवे आहे?","thx":"आनंद झाला! आणखी काहीही विचारा.","nf":"क्षमस्व, ते मला सापडले नाही. श्लोकाचे सुरुवातीचे शब्द, पुस्तकाचा विषय (उदा. पुराण, व्याकरण, तेलुगू), किंवा यांपैकी एक वापरून पाहा —","rd":["मागील","पुढील","पुन्हा","पुढे वाचा","थांबा"],"buy":"खरेदी करा (Google Play)","det":"तपशील","sh":"शेअर करा","pg":"पृष्ठे","opening":"पृष्ठ उघडत आहे…","openw":"पृष्ठ उघडा","selb":"मोठ्याने वाचा","srh":"स्क्रीन रीडर — कृपया या पृष्ठावरील कोणताही मजकूर किंवा श्लोक निवडा (माउसने ओढून, किंवा फोनवर दीर्घ दाबून). “मोठ्याने वाचा” बटण दिसेल — त्यावर टॅप करा, मी तो वाचून दाखवेन. संपूर्ण पृष्ठ ऐकण्यासाठी “हे पृष्ठ वाचा” असे म्हणा.","name":"मराठी"},"bn":{"menu":["শুভেচ্ছা কার্ড","আজকের শ্লোক","অ্যাপ ইনস্টল করুন","বইসমূহ","শ্লোক খুঁজুন","সূত্র 1.1.1","আজকের গীতা শ্লোক","শব্দের অর্থ","লিপি রূপান্তর","শব্দরূপ","পরিচিতি ও কেনা","খেলা","ব্যাকরণ পাঠ","জোরে পড়ুন","স্ক্রিন রিডার","ভাষা"],"ok":"চমৎকার! আমি বোধিনী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?","ask":"আপনি কী চান?","thx":"আনন্দের সঙ্গে! আর যা খুশি জিজ্ঞেস করুন।","nf":"দুঃখিত, এটি খুঁজে পেলাম না। কোনো শ্লোকের প্রথম কয়েকটি শব্দ, বইয়ের বিষয় (যেমন পুরাণ, ব্যাকরণ, তেলুগু), অথবা এগুলোর একটি চেষ্টা করুন —","rd":["আগের","পরের","আবার","পড়তে থাকুন","থামুন"],"buy":"কিনুন (Google Play)","det":"বিস্তারিত","sh":"শেয়ার করুন","pg":"পৃষ্ঠা","opening":"পৃষ্ঠা খোলা হচ্ছে…","openw":"পৃষ্ঠা খুলুন","selb":"জোরে পড়ুন","srh":"স্ক্রিন রিডার — এই পৃষ্ঠার যেকোনো লেখা বা শ্লোক নির্বাচন করুন (মাউস দিয়ে টেনে, অথবা ফোনে কিছুক্ষণ চেপে ধরে)। একটি “জোরে পড়ুন” বোতাম দেখা যাবে — সেটিতে চাপ দিলে আমি পড়ে শোনাব। পুরো পৃষ্ঠা শুনতে বলুন “এই পৃষ্ঠাটি পড়ো”।","name":"বাংলা"},"gu":{"menu":["શુભેચ્છા કાર્ડ","આજનો શ્લોક","ઍપ ઇન્સ્ટોલ કરો","પુસ્તકો","શ્લોક શોધો","સૂત્ર 1.1.1","આજનો ગીતા શ્લોક","શબ્દનો અર્થ","લિપિ પરિવર્તક","શબ્દરૂપો","પરિચય અને ખરીદી","રમતો","વ્યાકરણ પાઠ","મોટેથી વાંચો","સ્ક્રીન રીડર","ભાષા"],"ok":"અદ્ભુત! હું બોધિની છું. હું તમારી કેવી રીતે મદદ કરી શકું?","ask":"તમને શું જોઈએ છે?","thx":"આનંદ થયો! બીજું કંઈ પણ પૂછો.","nf":"માફ કરશો, મને તે મળ્યું નહીં. શ્લોકના શરૂઆતના શબ્દો, પુસ્તકનો વિષય (દા.ત. પુરાણ, વ્યાકરણ, તેલુગુ), અથવા આમાંથી કોઈ એક અજમાવો —","rd":["પાછલું","આગળનું","ફરીથી","આગળ વાંચો","બંધ કરો"],"buy":"ખરીદો (Google Play)","det":"વિગતો","sh":"શેર કરો","pg":"પાનાં","opening":"પાનું ખૂલી રહ્યું છે…","openw":"પાનું ખોલો","selb":"મોટેથી વાંચો","srh":"સ્ક્રીન રીડર — કૃપા કરીને આ પાના પરનું કોઈ પણ લખાણ કે શ્લોક પસંદ કરો (માઉસથી ખેંચીને, અથવા ફોન પર લાંબું દબાવીને). “મોટેથી વાંચો” બટન દેખાશે — તેના પર ટૅપ કરો, હું વાંચી સંભળાવીશ. આખું પાનું સાંભળવા માટે “આ પાનું વાંચો” કહો.","name":"ગુજરાતી"},"or":{"menu":["ଶୁଭେଚ୍ଛା କାର୍ଡ","ଆଜିର ଶ୍ଳୋକ","ଆପ୍ ଇନଷ୍ଟଲ କରନ୍ତୁ","ପୁସ୍ତକଗୁଡ଼ିକ","ଶ୍ଳୋକ ଖୋଜନ୍ତୁ","ସୂତ୍ର 1.1.1","ଆଜିର ଗୀତା ଶ୍ଳୋକ","ଶବ୍ଦର ଅର୍ଥ","ଲିପି ପରିବର୍ତ୍ତକ","ଶବ୍ଦରୂପ","ପରିଚୟ ଓ କ୍ରୟ","ଖେଳ","ବ୍ୟାକରଣ ପାଠ","ଜୋରରେ ପଢ଼ନ୍ତୁ","ସ୍କ୍ରିନ୍ ରିଡର୍","ଭାଷା"],"ok":"ଚମତ୍କାର! ମୁଁ ବୋଧିନୀ। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?","ask":"ଆପଣ କ'ଣ ଚାହୁଁଛନ୍ତି?","thx":"ଖୁସି ହେଲି! ଆଉ କିଛି ବି ପଚାରନ୍ତୁ।","nf":"କ୍ଷମା କରିବେ, ମୁଁ ତାହା ପାଇଲି ନାହିଁ। ଶ୍ଳୋକର ପ୍ରଥମ ଶବ୍ଦଗୁଡ଼ିକ, ପୁସ୍ତକର ବିଷୟ (ଯେପରି ପୁରାଣ, ବ୍ୟାକରଣ, ତେଲୁଗୁ), କିମ୍ବା ଏଥିମଧ୍ୟରୁ ଗୋଟିଏ ଚେଷ୍ଟା କରନ୍ତୁ —","rd":["ପୂର୍ବବର୍ତ୍ତୀ","ପରବର୍ତ୍ତୀ","ପୁଣି","ପଢ଼ିଚାଲନ୍ତୁ","ବନ୍ଦ କରନ୍ତୁ"],"buy":"କିଣନ୍ତୁ (Google Play)","det":"ବିବରଣୀ","sh":"ସେୟାର କରନ୍ତୁ","pg":"ପୃଷ୍ଠା","opening":"ପୃଷ୍ଠା ଖୋଲୁଛି…","openw":"ପୃଷ୍ଠା ଖୋଲନ୍ତୁ","selb":"ଜୋରରେ ପଢ଼ନ୍ତୁ","srh":"ସ୍କ୍ରିନ୍ ରିଡର୍ — ଦୟାକରି ଏହି ପୃଷ୍ଠାର ଯେକୌଣସି ଲେଖା ବା ଶ୍ଳୋକ ବାଛନ୍ତୁ (ମାଉସ୍‌ରେ ଟାଣି, କିମ୍ବା ଫୋନରେ ଦବାଇ ଧରି)। ଏକ “ଜୋରରେ ପଢ଼ନ୍ତୁ” ବଟନ୍ ଦେଖାଯିବ — ସେଥିରେ ଟ୍ୟାପ୍ କଲେ ମୁଁ ପଢ଼ି ଶୁଣାଇବି। ପୂରା ପୃଷ୍ଠା ଶୁଣିବାକୁ “ଏହି ପୃଷ୍ଠା ପଢ଼” କୁହନ୍ତୁ।","name":"ଓଡ଼ିଆ"},"pa":{"menu":["ਸ਼ੁਭਕਾਮਨਾ ਕਾਰਡ","ਅੱਜ ਦਾ ਸ਼ਲੋਕ","ਐਪ ਇੰਸਟਾਲ ਕਰੋ","ਕਿਤਾਬਾਂ","ਸ਼ਲੋਕ ਲੱਭੋ","ਸੂਤਰ 1.1.1","ਅੱਜ ਦਾ ਗੀਤਾ ਸ਼ਲੋਕ","ਸ਼ਬਦ ਦਾ ਅਰਥ","ਲਿਪੀ ਪਰਿਵਰਤਕ","ਸ਼ਬਦ ਰੂਪ","ਜਾਣ-ਪਛਾਣ ਅਤੇ ਖਰੀਦ","ਖੇਡਾਂ","ਵਿਆਕਰਣ ਪਾਠ","ਉੱਚੀ ਪੜ੍ਹੋ","ਸਕ੍ਰੀਨ ਰੀਡਰ","ਭਾਸ਼ਾ"],"ok":"ਬਹੁਤ ਵਧੀਆ! ਮੈਂ ਬੋਧਿਨੀ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?","ask":"ਤੁਸੀਂ ਕੀ ਚਾਹੁੰਦੇ ਹੋ?","thx":"ਕੋਈ ਗੱਲ ਨਹੀਂ! ਹੋਰ ਕੁਝ ਵੀ ਪੁੱਛੋ।","nf":"ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਇਹ ਨਹੀਂ ਲੱਭਿਆ। ਕਿਸੇ ਸ਼ਲੋਕ ਦੇ ਸ਼ੁਰੂਆਤੀ ਸ਼ਬਦ, ਕਿਤਾਬ ਦਾ ਵਿਸ਼ਾ (ਜਿਵੇਂ ਪੁਰਾਣ, ਵਿਆਕਰਣ, ਤੇਲਗੂ), ਜਾਂ ਇਹਨਾਂ ਵਿੱਚੋਂ ਕੋਈ ਇੱਕ ਅਜ਼ਮਾਓ —","rd":["ਪਿਛਲਾ","ਅਗਲਾ","ਦੁਬਾਰਾ","ਪੜ੍ਹਦੇ ਜਾਓ","ਰੁਕੋ"],"buy":"ਖਰੀਦੋ (Google Play)","det":"ਵੇਰਵੇ","sh":"ਸਾਂਝਾ ਕਰੋ","pg":"ਪੰਨੇ","opening":"ਪੰਨਾ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ…","openw":"ਪੰਨਾ ਖੋਲ੍ਹੋ","selb":"ਉੱਚੀ ਪੜ੍ਹੋ","srh":"ਸਕ੍ਰੀਨ ਰੀਡਰ — ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਪੰਨੇ 'ਤੇ ਕੋਈ ਵੀ ਲਿਖਤ ਜਾਂ ਸ਼ਲੋਕ ਚੁਣੋ (ਮਾਊਸ ਨਾਲ ਖਿੱਚ ਕੇ, ਜਾਂ ਫ਼ੋਨ 'ਤੇ ਦੇਰ ਤੱਕ ਦਬਾ ਕੇ)। ਇੱਕ “ਉੱਚੀ ਪੜ੍ਹੋ” ਬਟਨ ਦਿਖਾਈ ਦੇਵੇਗਾ — ਉਸ ਨੂੰ ਦਬਾਓ, ਮੈਂ ਪੜ੍ਹ ਕੇ ਸੁਣਾਵਾਂਗੀ। ਪੂਰਾ ਪੰਨਾ ਸੁਣਨ ਲਈ “ਇਹ ਪੰਨਾ ਪੜ੍ਹੋ” ਕਹੋ।","name":"ਪੰਜਾਬੀ"},"ur":{"menu":["تہنیتی کارڈ","آج کا شلوک","ایپ انسٹال کریں","کتابیں","شلوک تلاش کریں","سوتر 1.1.1","آج کا گیتا شلوک","لفظ کا معنی","رسم الخط بدلیں","لفظ کی صورتیں","تعارف اور خریداری","کھیل","قواعد کے اسباق","بلند آواز سے پڑھیں","اسکرین ریڈر","زبان"],"ok":"بہت خوب! میں بودھنی ہوں۔ میں آپ کی کیا مدد کر سکتی ہوں؟","ask":"آپ کیا چاہیں گے؟","thx":"کوئی بات نہیں! مجھ سے کچھ اور بھی پوچھیں۔","nf":"معذرت، مجھے یہ نہیں ملا۔ کسی شلوک کے ابتدائی الفاظ، کتاب کا کوئی موضوع (مثلاً پُران، قواعد، تیلگو)، یا ان میں سے کوئی ایک آزمائیں —","rd":["پچھلا","اگلا","دوبارہ","پڑھتے جائیں","روکیں"],"buy":"خریدیں (Google Play)","det":"تفصیلات","sh":"شیئر کریں","pg":"صفحات","opening":"صفحہ کھل رہا ہے…","openw":"صفحہ کھولیں","selb":"بلند آواز سے پڑھیں","srh":"اسکرین ریڈر — براہِ کرم اس صفحے پر کوئی بھی متن یا شلوک منتخب کریں (ماؤس سے کھینچ کر، یا فون پر دیر تک دبا کر)۔ ایک “بلند آواز سے پڑھیں” بٹن ظاہر ہوگا — اسے دبائیں، میں پڑھ کر سناؤں گی۔ پورا صفحہ سننے کے لیے کہیں “یہ صفحہ پڑھو”۔","name":"اردو"}}/*XL*/;
for(const [k,v] of Object.entries(XL)){T[k]={menu:T.en.menu.map((m,i)=>[m[0].split(' ')[0]+' '+v.menu[i],m[1]]),ok:v.ok,ask:v.ask,thx:'🙏 '+v.thx,nf:v.nf,voice:k==='ur'?'ur-IN':k+'-IN'};
  RD[k]=v.rd;UI.buy[k]='🛒 '+v.buy;UI.det[k]=v.det;UI.sh[k]='📲 '+v.sh;UI.pg[k]=v.pg;OPENING[k]=v.opening;OPENW[k]=v.openw;SRH[k]='🔊 '+v.srh;SELB[k]='🔊 '+v.selb;
  LANGQ=LANGQ.replace('</div>',`<button type="button" data-say="lang:${k}">${v.name}</button></div>`)}
if(LANG&&T[LANG]){mlS.value=LS.g('ml',T[LANG].voice);if(![...mlS.options].some(o=>o.value===mlS.value)){const o=document.createElement('option');o.value=T[LANG].voice;o.textContent=LANG;mlS.appendChild(o);mlS.value=T[LANG].voice}}

/* ---------- arriving with ?q= : fill the page's own search box ---------- */
const pq=new URLSearchParams(location.search).get('q');
if(pq){const go=()=>{const i=document.getElementById('q');if(!i)return;i.value=pq;i.dispatchEvent(new Event('input',{bubbles:true}))};
  if(document.readyState==='complete')setTimeout(go,900);else addEventListener('load',()=>setTimeout(go,900))}
})();
