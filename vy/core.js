// Sanskrit Manthan · grammar core: transliteration, the Pāṇinian engine (vidyut-prakriya, MIT, via WebAssembly),
// dhātu/sūtra data, and the token wallet shared by the games and lessons.
import init, { Vidyut } from './wasm/vidyut_prakriya.js';

/* ---------------- transliteration (SLP1 is the internal form) ---------------- */
const SV = {a:'अ',A:'आ',i:'इ',I:'ई',u:'उ',U:'ऊ',f:'ऋ',F:'ॠ',x:'ऌ',X:'ॡ',e:'ए',E:'ऐ',o:'ओ',O:'औ'};
const SM = {a:'',A:'ा',i:'ि',I:'ी',u:'ु',U:'ू',f:'ृ',F:'ॄ',x:'ॢ',X:'ॣ',e:'े',E:'ै',o:'ो',O:'ौ'};
const SC = {k:'क',K:'ख',g:'ग',G:'घ',N:'ङ',c:'च',C:'छ',j:'ज',J:'झ',Y:'ञ',w:'ट',W:'ठ',q:'ड',Q:'ढ',R:'ण',t:'त',T:'थ',d:'द',D:'ध',n:'न',
  p:'प',P:'फ',b:'ब',B:'भ',m:'म',y:'य',r:'र',l:'ल',v:'व',S:'श',z:'ष',s:'स',h:'ह',L:'ळ'};
const SO = {M:'ं',H:'ः','~':'ँ',"'":'ऽ'};
export function s2d(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
  if(SC[c]){o+=SC[c];if(n!==undefined&&SM[n]!==undefined){o+=SM[n];i++}else o+='्'}
  else if(SV[c])o+=SV[c];else if(SO[c])o+=SO[c];else if(c==='^'||c==='\\')continue;else o+=c}return o}
const DV={},DM={},DC={};for(const k in SV)DV[SV[k]]=k;for(const k in SM)if(SM[k])DM[SM[k]]=k;for(const k in SC)DC[SC[k]]=k;
const DO={'ं':'M','ः':'H','ँ':'~','ऽ':"'"};
export function d2s(s){let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
  if(DC[c]){o+=DC[c];if(n==='्'){i++}else if(DM[n]!==undefined){o+=DM[n];i++}else o+='a'}
  else if(DV[c])o+=DV[c];else if(DO[c])o+=DO[c];else if(c==='़')continue;else o+=c}return o}
const IA={a:'a',A:'ā',i:'i',I:'ī',u:'u',U:'ū',f:'ṛ',F:'ṝ',x:'ḷ',X:'ḹ',e:'e',E:'ai',o:'o',O:'au',k:'k',K:'kh',g:'g',G:'gh',N:'ṅ',c:'c',C:'ch',j:'j',J:'jh',
  Y:'ñ',w:'ṭ',W:'ṭh',q:'ḍ',Q:'ḍh',R:'ṇ',t:'t',T:'th',d:'d',D:'dh',n:'n',p:'p',P:'ph',b:'b',B:'bh',m:'m',y:'y',r:'r',l:'l',v:'v',S:'ś',z:'ṣ',s:'s',h:'h',
  M:'ṃ',H:'ḥ','~':'m̐',"'":"'",L:'ḷ'};
export const s2i=s=>[...s].map(c=>IA[c]??(c==='^'||c==='\\'?'':c)).join('');
export const d2t=s=>[...s].map(c=>{const n=c.codePointAt(0);return n>=0x900&&n<=0x97f&&c!=='ऽ'&&c!=='।'&&c!=='॥'?String.fromCodePoint(n+0x300):c}).join('');
const t2d=s=>[...s].map(c=>{const n=c.codePointAt(0);return n>=0xc00&&n<=0xc7f?String.fromCodePoint(n-0x300):c}).join('');
// Roman input: IAST, ISO-ish or Harvard-Kyoto / ITRANS-style ASCII
const I2S=[['ai','E'],['au','O'],['kh','K'],['gh','G'],['ch','C'],['jh','J'],['ṭh','W'],['ḍh','Q'],['th','T'],['dh','D'],['ph','P'],['bh','B'],
  ['ā','A'],['ī','I'],['ū','U'],['ṛ','f'],['ṝ','F'],['ḷ','x'],['ḹ','X'],['ṅ','N'],['ñ','Y'],['ṭ','w'],['ḍ','q'],['ṇ','R'],['ś','S'],['ṣ','z'],['ṃ','M'],['ṁ','M'],['ḥ','H']];
const H2S=[['cch','cC'],['aa','A'],['ii','I'],['uu','U'],['RRi','f'],['R^i','f'],['Ri','f'],['RR','f'],['lRi','x'],['ai','E'],['au','O'],['kh','K'],['gh','G'],['~N','N'],['N^','N'],
  ['chh','C'],['Ch','C'],['ch','c'],['jh','J'],['~n','Y'],['JN','Y'],['Th','W'],['Dh','Q'],['th','T'],['dh','D'],['ph','P'],['bh','B'],['sh','S'],['Sh','z'],
  ['shh','z'],['.n','M'],['.m','M'],['.h','H'],['T','w'],['D','q'],['N','R'],['G','N'],['J','Y'],['z','S'],['S','z'],['M','M'],['H','H'],['A','A'],['I','I'],['U','U'],['R','f'],['x','x']];
export function toSLP(raw){
  let s=(raw||'').normalize('NFC').trim();
  if(/[ఀ-౿]/.test(s))s=t2d(s);
  if(/[ऀ-ॿ]/.test(s))return d2s(s).replace(/[।॥\s]+/g,' ').trim();
  s=s.normalize('NFD').replace(/[̀-ͯ]/g,m=>m).normalize('NFC');
  if(/[āīūṛṝḷṅñṭḍṇśṣṃṁḥ]/i.test(s)){s=s.toLowerCase();for(const [a,b] of I2S)s=s.split(a).join(b);return s}
  // ASCII: HK / ITRANS, case-sensitive; a longest-first scan
  const keys=H2S.map(x=>x[0]).sort((a,b)=>b.length-a.length);let o='';
  for(let i=0;i<s.length;){const k=keys.find(k=>s.startsWith(k,i));if(k){o+=H2S.find(x=>x[0]===k)[1];i+=k.length}else{o+=s[i];i++}}
  return o.replace(/c(?=C)/g,'c');
}
// equality that forgives anusvāra vs. homorganic nasal and final m/M
const NAS={k:'N',K:'N',g:'N',G:'N',c:'Y',C:'Y',j:'Y',J:'Y',w:'R',W:'R',q:'R',Q:'R',t:'n',T:'n',d:'n',D:'n',p:'m',P:'m',b:'m',B:'m'};
export const norm=s=>(s||'').replace(/\s+/g,'').replace(/[NYRnm](?=[kKgGcCjJwWqQtTdDpPbB])/g,'M').replace(/M(?=[kKgGcCjJwWqQtTdDpPbB])/g,'M').replace(/m$/,'M');
export const same=(a,b)=>norm(a)===norm(b);

/* ---------------- script preference (shared with the index pages) ---------------- */
export let SCRIPT='dv';try{SCRIPT=localStorage.getItem('sl-script')||'dv'}catch(e){}
export const show=slp=>{const d=s2d(slp);return SCRIPT==='te'?d2t(d):SCRIPT==='la'?s2i(slp):d};
export const showD=dev=>SCRIPT==='te'?d2t(dev):SCRIPT==='la'?s2i(d2s(dev)):dev;
export function setScript(s){SCRIPT=s;try{localStorage.setItem('sl-script',s)}catch(e){}document.body.className='s-'+s}

/* ---------------- labels ---------------- */
export const LAK=['Lat','Lit','Lut','Lrt','Let','Lot','Lan','VidhiLin','AshirLin','Lun','Lrn'];
export const LAKD=['लट्','लिट्','लुट्','लृट्','लेट्','लोट्','लङ्','विधिलिङ्','आशीर्लिङ्','लुङ्','लृङ्'];
export const LAKE=['present','perfect','periphrastic future','simple future','subjunctive','imperative','imperfect','optative','benedictive','aorist','conditional'];
export const PUR=['Prathama','Madhyama','Uttama'],PURD=['प्रथमपुरुषः','मध्यमपुरुषः','उत्तमपुरुषः'],PURS=['प्र॰','म॰','उ॰'];
export const VAC=['Eka','Dvi','Bahu'],VACD=['एकवचनम्','द्विवचनम्','बहुवचनम्'],VACS=['एक॰','द्वि॰','बहु॰'];
export const PRA=['Kartari','Karmani','Bhave'],PRAD=['कर्तरि','कर्मणि','भावे'];
export const VIB=['Prathama','Dvitiya','Trtiya','Caturthi','Panchami','Sasthi','Saptami','Sambodhana'];
export const VIBD=['प्रथमा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी','षष्ठी','सप्तमी','सम्बोधनम्'];
export const LIN={P:'Pum',S:'Stri',N:'Napumsaka'},LIND={P:'पुंलिङ्गम्',S:'स्त्रीलिङ्गम्',N:'नपुंसकलिङ्गम्'};
export const GANAD=['भ्वादिः','अदादिः','जुहोत्यादिः','दिवादिः','स्वादिः','तुदादिः','रुधादिः','तनादिः','क्र्यादिः','चुरादिः','कण्ड्वादिः'];
export const UPASARGA=['pra','parA','apa','sam','anu','ava','nis','nir','dus','dur','vi','AN','ni','aDi','api','ati','su','ud','aBi','prati','pari','upa'];

/* ---------------- data ---------------- */
const J={};export const getJSON=async u=>J[u]||(J[u]=fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json()}));
const BASE=new URL('.',import.meta.url).href;   // …/vy/
export let DH=null,GANAS=null;
export async function dhatus(){if(!DH){const d=await getJSON(BASE+'dhatus.json');DH=d.dhatus;GANAS=d.gana}return DH}
// a dhātu as shown to people: drop accent marks, show the nasalised it-vowel
export const dhatuLabel=up=>s2d(up.replace(/[\\^]/g,'').replace(/~/g,'~'));
export function dhatuPlain(up){let s=up.replace(/[\\^]/g,'').replace(/^(qu|wu|Yi)/,'');
  if(/^z/.test(s))s='s'+s.slice(1).replace(/^W/,'T').replace(/^w/,'t').replace(/^R/,'n');else if(/^R/.test(s))s='n'+s.slice(1);
  if(/i~r$/.test(s))return s2d(s.replace(/i~r$/,''));
  s=s.replace(/([^aAiIuUfFxXeEoO~])$/,'');
  const idit=/i~$/.test(s);s=s.replace(/[aAiIuUfFxXeEoO]~$/,'').replace(/~/g,'');
  if(idit){const m=s.match(/([kKgGcCjJwWqQtTdDpPbB])$/);if(m)s=s.slice(0,-1)+(NAS[m[1]]||'M')+m[1]}
  return s2d(s)}
export async function sutraText(source,code){const s=await getJSON(BASE+'sutras.json');return s[`${source}:${code}`]||''}
export const sutraHref=(source,code)=>source==='ashtadhyayi'&&/^\d\.\d\.\d+$/.test(code)?`sutra.html#ashtadhyayi/${code.split('.').slice(0,2).join('.')}/${code.split('.')[2]}`:null;
export const SRCD={ashtadhyayi:'',varttika:'वार्तिकम्',dhatupatha:'धातुपाठः',kashika:'काशिका',linganushasanam:'लिङ्गानुशासनम्',kaumudi:'कौमुदी',unadi:'उणादिः',phit:'फिट्',anyatra:''};

/* ---------------- the engine ---------------- */
let V=null,READY=null;
export function engine(){return READY||(READY=(async()=>{await init({module_or_path:BASE+'wasm/vidyut_prakriya_bg.wasm'});V=Vidyut.init();await dhatus();return V})())}
function dhatuArgs(di,{pre=[],san=[]}={}){const e=DH[di];return{aupadeshika:e[1],gana:GANAS[e[2]],antargana:e[3]?AGN[e[3]]:null,sanadi:san,prefixes:pre}}
const AGN={GawAdi:'Ghatadi',AsvadIya:'Asvadiya',ADfzIya:'Adhrshiya',kuwAdi:'Kutadi',AkusmIya:'Akusmiya'};
export function tin(di,la,pr,pu,va,opt={}){
  const a={dhatu:dhatuArgs(di,opt),lakara:typeof la==='number'?LAK[la]:la,prayoga:typeof pr==='number'?PRA[pr]:pr,purusha:PUR[pu],vacana:VAC[va],skip_at_agama:false,pada:opt.pada||null};
  try{return V.deriveTinantas(a)}catch(e){return[]}}
export const tinForms=(...a)=>[...new Set(tin(...a).map(p=>p.text))];
const NOT_NYAP=new Set(['lakzmI','tarI','tantrI','avI','starI']);
export function pratipadika(stem,lg){const vow=(stem.match(/[aAiIuUfFxXeEoO]/g)||[]).length;
  if(lg==='S'&&(stem.endsWith('A')||(stem.endsWith('I')&&vow>1&&!NOT_NYAP.has(stem))||stem==='strI'))return{nyap:stem};return{basic:stem}}
export function sup(stem,lg,vi,va){try{return V.deriveSubantas({pratipadika:pratipadika(stem,lg),linga:LIN[lg],vibhakti:VIB[vi],vacana:VAC[va]})}catch(e){return[]}}
export const supForms=(...a)=>[...new Set(sup(...a).map(p=>p.text))];
export function krt(di,k,opt={}){try{return V.deriveKrdantas({dhatu:dhatuArgs(di,opt),krt:k,unadi:null,lakara:null,prayoga:null,upapada:null})}catch(e){return[]}}

/* derivation (prakriyā) as HTML: each step with its sūtra */
export async function prakriyaHTML(p){
  const rows=[];
  for(const st of p.history){const {source,code}=st.rule;const txt=await sutraText(source,code);const href=sutraHref(source,code);
    const res=st.result.map(t=>`<span class="${t.wasChanged?'ch':''}">${esc(show(t.text))}</span>`).join(' + ');
    rows.push(`<li><span class="sc">${href?`<a href="${href}" target="_blank" rel="noopener">${code}</a>`:`${esc(SRCD[source]||source)} ${code}`}</span><span class="st">${txt?esc(show(txt.replace(/[\\^]/g,''))):''}</span><span class="rs">${res}</span></li>`)}
  return `<ol class="pk">${rows.join('')}</ol>`}
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- form search (reverse index) ---------------- */
export async function lookup(slp){
  const k=[...slp.slice(0,2)].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
  try{const d=await getJSON(BASE+'f/'+k+'.json');return d[slp]||[]}catch(e){return[]}}

/* ---------------- token wallet ---------------- */
const WK='sm-wallet';
export const REWARD={every:100,value:'₹10',code:null};   // the voucher code is set by the author when a Google Play promotion is live
export function wallet(){try{return JSON.parse(localStorage.getItem(WK))||{tokens:0,total:0,levels:{},claimed:0,best:{}}}catch(e){return{tokens:0,total:0,levels:{},claimed:0,best:{}}}}
export function saveWallet(w){try{localStorage.setItem(WK,JSON.stringify(w))}catch(e){}document.dispatchEvent(new CustomEvent('wallet',{detail:w}))}
export function award(n){const w=wallet();w.tokens+=n;w.total+=n;saveWallet(w);return w}
export const rand=n=>Math.floor(Math.random()*n);
export const pick=a=>a[rand(a.length)];
export const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------------- more of the engine ---------------- */
export function tinP(di, la, pr, pu, va, pada, opt = {}) { return tin(di, la, pr, pu, va, { ...opt, pada }) }
export function tad(stem, t) { try { return V.deriveTaddhitantas({ pratipadika: { basic: stem }, taddhita: t }) } catch (e) { return [] } }
export function supKrt(di, k, lg, vi, va, opt = {}) {
  try { return V.deriveSubantas({ pratipadika: { krdanta: { dhatu: dhatuArgs(di, opt), krt: k, unadi: null, lakara: null, prayoga: null } }, linga: LIN[lg], vibhakti: VIB[vi], vacana: VAC[va] }) } catch (e) { return [] }
}
export const byCode = code => DH.findIndex(e => e[0] === code);
// decode a reverse-index reference
export function decode(ref) {
  const t = ref[0], p = ref.slice(1).split('.');
  if (t === 't') return { kind: 'tin', di: +p[0], la: +p[1], pr: +p[2], pu: Math.floor(+p[3] / 3), va: +p[3] % 3, pada: p[4] === undefined || p[4] === '' ? null : +p[4], san: p[5] || '' };
  if (t === 'k') return { kind: 'krt', di: +p[0], krt: p[1] };
  if (t === 's') return { kind: 'sup', stem: p[0], g: p[1], vi: Math.floor(+p[2] / 3), va: +p[2] % 3 };
}
// upasarga spellings as they appear before a verb (after sandhi)
export const UPV = { pra: ['pra'], parA: ['parA'], apa: ['apa'], sam: ['sam', 'saM', 'saY', 'san', 'saR'], anu: ['anu', 'anv'], ava: ['ava'], nis: ['niH', 'nir', 'niz', 'niS', 'nis'], dus: ['duH', 'dur', 'duz', 'duS', 'dus'],
  vi: ['vi', 'vy'], AN: ['A'], ni: ['ni', 'ny'], aDi: ['aDi', 'aDy'], api: ['api', 'apy'], ati: ['ati', 'aty'], su: ['su', 'sv'], ud: ['ud', 'ut', 'uc', 'uj', 'ul', 'un', 'uq'], aBi: ['aBi', 'aBy'], prati: ['prati', 'praty'], pari: ['pari', 'pary'], upa: ['upa'] };
export const UPD = { pra: 'प्र', parA: 'परा', apa: 'अप', sam: 'सम्', anu: 'अनु', ava: 'अव', nis: 'निस्', dus: 'दुस्', vi: 'वि', AN: 'आङ्', ni: 'नि', aDi: 'अधि', api: 'अपि', ati: 'अति', su: 'सु', ud: 'उद्', aBi: 'अभि', prati: 'प्रति', pari: 'परि', upa: 'उप' };
export const KRTL = [
  ['kta', 'क्त', 'past passive participle', '3.2.102'], ['ktavatu', 'क्तवतु', 'past active participle', '3.2.102'], ['Satf', 'शतृ', 'present participle (P)', '3.2.124'], ['SAnac', 'शानच्', 'present participle (Ā)', '3.2.124'],
  ['ktvA', 'क्त्वा', 'having done (gerund)', '3.4.21'], ['tumun', 'तुमुन्', 'to do (infinitive)', '3.3.10'], ['tavya', 'तव्य', 'should be done', '3.1.96'], ['anIyar', 'अनीयर्', 'should be done', '3.1.96'],
  ['yat', 'यत्', 'to be done', '3.1.97'], ['Ryat', 'ण्यत्', 'to be done', '3.1.124'], ['kyap', 'क्यप्', 'to be done', '3.1.106'], ['Rvul', 'ण्वुल्', 'doer (-aka)', '3.1.133'], ['tfc', 'तृच्', 'doer (-tṛ)', '3.1.133'],
  ['lyuw', 'ल्युट्', 'action noun (-ana)', '3.3.115'], ['GaY', 'घञ्', 'action noun', '3.3.18'], ['ktin', 'क्तिन्', 'feminine action noun (-ti)', '3.3.94'], ['ac', 'अच्', 'agent (pacādi)', '3.1.134'], ['ka', 'क', 'agent', '3.1.135'],
  ['Rini', 'णिनि', 'habitual agent', '3.2.78'], ['kvip', 'क्विप्', 'agent (zero suffix)', '3.2.76'], ['kvasu', 'क्वसु', 'perfect participle (P)', '3.2.107'], ['kAnac', 'कानच्', 'perfect participle (Ā)', '3.2.106'], ['Ramul', 'णमुल्', 'repeated action', '3.4.22'],
];
