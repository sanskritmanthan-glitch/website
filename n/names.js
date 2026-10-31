/* नामानि — Sanskrit names: meaning finder and suggestions (by letter, birth star, or birth date/time). Shared by names.html and Bodhinī. */
import {nakshatra,NAK,NAKE,PADA,RASHI} from './moon.js';
export {NAK,NAKE,PADA,RASHI,nakshatra};
const BASE=new URL('.',import.meta.url).href;
let N=null,PARTS=null;
export async function load(){if(N)return N;N=await (await fetch(BASE+'names.json')).json();PARTS=new Map();
  for(const x of N){x.k=fz(x.d);x.kr=fz(x.r);x.s=first(x.d);for(const [p,m] of x.p||[]){const k=skel(fz(p));if(k.length>=2&&!PARTS.has(k))PARTS.set(k,[p,m])}}return N}
/* --- normalising any script / spelling to a loose Roman key --- */
const V={'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au'},M={'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au'};
const K={'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'ch','ज':'j','झ':'jh','ञ':'n','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ळ':'l'};
const t2d=s=>[...s].map(c=>{const n=c.codePointAt(0);return n>=0xc00&&n<=0xc7f?String.fromCodePoint(n-0x300):c}).join('');
export function rom(s){if(/[ఀ-౿]/.test(s))s=t2d(s);if(!/[ऀ-ॿ]/.test(s))return s.toLowerCase();let o='';for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
  if(K[c]){o+=K[c];if(n==='्'){i++}else if(M[n]){o+=M[n];i++}else if(n==='़'){i++;o+='a'}else o+='a'}else if(V[c])o+=V[c];else if(c==='ं'||c==='ँ')o+='n';else if(c==='ः')o+='h';else o+=c}
  return o.replace(/a$/,'')}           // modern spelling drops the final a: राम → ram(a)
export function fz(s){return rom(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'')
  .replace(/ee/g,'i').replace(/oo/g,'u').replace(/([aiu])\1+/g,'$1').replace(/w/g,'v').replace(/z/g,'j').replace(/([kgcjtdpbs])h/g,'$1').replace(/ph/g,'f').replace(/f/g,'p').replace(/x/g,'ksh')
  .replace(/sri/g,'shri').replace(/shri/g,'sri').replace(/a$/,'')}
const skel=k=>k.replace(/a/g,'');
/* first syllable (consonant + vowel) in Devanagari, for birth-star matching */
export function first(d){const ch=[...d];const c=ch[0];if(!c)return '';if(V[c])return c;let i=1;while(ch[i]==='्'&&K[ch[i+1]])i+=2;return c+(M[ch[i]]?ch[i]:'')}
function sylMatch(name,syl){const f=first(name.d);if(syl.length===1&&V[syl])return f===syl||(syl==='अ'&&f==='आ');return f===syl||(syl.length===1&&f===syl)}
/* --- meaning --- */
export async function meaning(q){await load();const k=fz(q.trim());if(k.length<2)return null;const vars=new Set([k,k.replace(/u$/,''),k.replace(/udu$/,''),k.replace(/(a|u)$/,''),k+'a']);
  const hit=N.filter(x=>vars.has(x.k)||vars.has(x.kr)||[...vars].some(v=>v===fz(x.r.replace(/u$/,''))));
  if(hit.length)return {exact:hit};
  const sk=new Set([...vars].map(skel));const hit2=N.filter(x=>sk.has(skel(x.k))||sk.has(skel(x.kr)));if(hit2.length)return {exact:hit2};
  // split into known name-parts (longest first, up to 3 parts)
  const s=skel(k);function split(str,depth){if(!str)return [];if(depth>3)return null;for(let i=str.length;i>=2;i--){const p=PARTS.get(str.slice(0,i));if(p){const r=split(str.slice(i),depth+1);if(r)return [p,...r]}}return null}
  const parts=split(s,1);if(parts&&parts.length)return {parts};return null}
/* --- suggestions --- */
export async function byLetter(letter,g){await load();const f=letter.trim();return N.filter(x=>(g==='all'||!g||x.g===g||x.g==='u')&&(x.d.startsWith(f)||first(x.d)===f||(f.length===1&&K[f]&&x.d[0]===f)))}
export async function bySyllables(syls,g){await load();const ok=x=>!g||g==='all'||x.g===g||x.g==='u';
  let out=N.filter(x=>ok(x)&&syls.some(s=>sylMatch(x,s)));
  if(!out.length){const cs=[...new Set(syls.map(s=>[...s][0]))];out=N.filter(x=>ok(x)&&cs.includes(x.d[0])).map(x=>({...x,near:syls.join(' / ')}))}   // no name with these syllables: same first sound
  return out}
/* --- a star's names in widening circles: birth pāda → other pādas → same consonant with any vowel (da, di, du, de…) → the star's other consonants --- */
const VOW=new Set(Object.keys(V));
export const consOf=s=>VOW.has([...s][0])?'V':[...s][0];
const startsC=(x,c)=>c==='V'?VOW.has(x.d[0]):x.d[0]===c;
export const BARA=c=>c==='V'?'अ आ इ ई उ ऊ ए ओ':[c,...'ा ि ी ु ू े ै ो ौ'.split(' ').map(m=>c+m)].join(' ');
export async function starGroups(n,p,g,extra=[]){await load();const ok=x=>!g||g==='all'||x.g===g||x.g==='u';const P=PADA[n],seen=new Set();
  const take=f=>N.filter(x=>ok(x)&&!seen.has(x.d)&&f(x)).map(x=>(seen.add(x.d),x));
  const own=[...new Set((p>=0?[P[p]]:P).concat(extra))],G=[{k:'own',syl:own,list:take(x=>own.some(s=>sylMatch(x,s)))}];
  const oth=P.filter(s=>!own.includes(s));if(oth.length)G.push({k:'pada',syl:oth,list:take(x=>oth.some(s=>sylMatch(x,s)))});
  const c1=[...new Set(own.map(consOf))];G.push({k:'cons',syl:c1,list:take(x=>c1.some(c=>startsC(x,c)))});
  const c2=[...new Set(P.map(consOf))].filter(c=>!c1.includes(c));if(c2.length)G.push({k:'cons2',syl:c2,list:take(x=>c2.some(c=>startsC(x,c)))});
  return G}
/* names whose first consonant sound matches a Roman syllable like "da", "du", "sh" (any vowel) */
const RC={k:'क',kh:'ख',g:'ग',gh:'घ',c:'च',ch:'चछ',chh:'छ',j:'ज',jh:'झ',t:'तट',th:'थठ',d:'दड',dh:'धढ',n:'नण',p:'प',ph:'फ',f:'फ',b:'ब',bh:'भ',m:'म',y:'य',r:'रऋ',l:'ल',v:'व',w:'व',s:'सश',sh:'शष',h:'ह',ksh:'क्ष',x:'क्ष',gy:'ज्ञ',jn:'ज्ञ',tr:'त्र',sr:'श्र',shr:'श्र'};
export async function byRomanCons(q,g){await load();const c=q.toLowerCase().replace(/[^a-z]/g,'').replace(/[aeiou]+$/,'');const key=Object.keys(RC).filter(k=>c===k)[0];if(!key)return [];
  const set=RC[key];const multi=set.includes('्')?[set]:[...set];return N.filter(x=>(!g||g==='all'||x.g===g||x.g==='u')&&multi.some(ch=>x.d.startsWith(ch)))}
export function starOf(dateUTC){return nakshatra(dateUTC)}
/* parse "12 March 2026 10:30 am", "12/03/2026 22:15", "2026-03-12 10:30" (local time at the given UTC offset in hours, default IST) */
const MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
export function parseDT(s,tz=5.5){s=s.toLowerCase();let d,mo,y,h=12,mi=0,m;
  if((m=s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/))){y=+m[1];mo=+m[2];d=+m[3]}
  else if((m=s.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/))){d=+m[1];mo=+m[2];y=+m[3]}
  else if((m=s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/))){d=+m[1];mo=MON.indexOf(m[2])+1;y=+m[3]}
  else if((m=s.match(/([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/))){mo=MON.indexOf(m[1])+1;d=+m[2];y=+m[3]}
  if(!d||!mo||!y||mo<1)return null;const t=s.replace(/\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}/,'').match(/(\d{1,2})[:.](\d{2})\s*(am|pm|a\.m\.|p\.m\.)?|(\d{1,2})\s*(am|pm)/);
  let timeGiven=false;if(t){timeGiven=true;h=+(t[1]||t[4]);mi=+(t[2]||0);const ap=t[3]||t[5];if(ap&&ap.startsWith('p')&&h<12)h+=12;if(ap&&ap.startsWith('a')&&h===12)h=0}
  const utc=new Date(Date.UTC(y,mo-1,d,h,mi)-tz*3600e3);return {date:utc,timeGiven}}
