/* Devanagari → regional scripts for Sanskrit text (śloka cards, today's śloka). window.SMScript.to(text, lang) */
(function(){
const OFF={bn:0x80,as:0x80,pa:0x100,gu:0x180,or:0x200,te:0x300,kn:0x380,ml:0x400};
const FONT={bn:'Noto Serif Bengali',as:'Noto Serif Bengali',pa:'Noto Sans Gurmukhi',gu:'Noto Serif Gujarati',or:'Noto Sans Oriya',te:'Noto Serif Telugu',kn:'Noto Serif Kannada',ml:'Noto Serif Malayalam',ta:'Noto Serif Tamil'};
// letters missing from a block, mapped by hand
const FIX={bn:{'व':'ব','ळ':'ল'},as:{'व':'ৱ','र':'ৰ','ळ':'ল'},pa:{'ष':'ਸ਼','श':'ਸ਼','ळ':'ਲ਼','ऋ':'ਰਿ','ृ':'੍ਰਿ','ॠ':'ਰੀ','ॄ':'੍ਰੀ','ऽ':''},
  gu:{},or:{},te:{},kn:{},ml:{}};
const KEEP=new Set(['।','॥','॰','ॐ']);
function brahmic(t,l){const o=OFF[l],F=FIX[l]||{};let r='';for(const c of t){if(F[c]!==undefined){r+=F[c];continue}const n=c.codePointAt(0);
  if(n>=0x900&&n<=0x97f&&!KEEP.has(c))r+=String.fromCodePoint(n+o);else r+=c}return r}
// Tamil: Grantha letters for ja ṣa sa ha śa; superscript ²³⁴ for aspirated / voiced stops (the usual convention for Sanskrit in Tamil script)
const TC={'क':'க','ख':'க²','ग':'க³','घ':'க⁴','ङ':'ங','च':'ச','छ':'ச²','ज':'ஜ','झ':'ஜ²','ञ':'ஞ','ट':'ட','ठ':'ட²','ड':'ட³','ढ':'ட⁴','ण':'ண','त':'த','थ':'த²','द':'த³','ध':'த⁴','न':'ந','प':'ப','फ':'ப²','ब':'ப³','भ':'ப⁴','म':'ம','य':'ய','र':'ர','ल':'ல','व':'வ','श':'ஶ','ष':'ஷ','स':'ஸ','ह':'ஹ','ळ':'ள'};
const TV={'अ':'அ','आ':'ஆ','इ':'இ','ई':'ஈ','उ':'உ','ऊ':'ஊ','ऋ':'ரு','ॠ':'ரூ','ए':'ஏ','ऐ':'ஐ','ओ':'ஓ','औ':'ஔ'};
const TM={'ा':'ா','ि':'ி','ी':'ீ','ु':'ு','ू':'ூ','ृ':'்ரு','ॄ':'்ரூ','े':'ே','ै':'ை','ो':'ோ','ौ':'ௌ','्':'்'};
function tamil(t){let r='';const ch=[...t];for(let i=0;i<ch.length;i++){const c=ch[i];
  if(TC[c]){const base=TC[c][0],sup=TC[c].slice(1);let m='';if(TM[ch[i+1]]){m=TM[ch[i+1]];i++}r+=base+m+sup;continue}
  if(TV[c]){r+=TV[c];continue}if(c==='ं'){const nx=ch[i+1];r+=/[कखगघ]/.test(nx)?'ங்':/[चछजझ]/.test(nx)?'ஞ்':/[टठडढ]/.test(nx)?'ண்':/[तथदध]/.test(nx)?'ந்':'ம்';continue}
  if(c==='ः'){r+='ஃ';continue}if(c==='ऽ'){r+='’';continue}if(c==='ँ'){r+='ம்';continue}const n=c.codePointAt(0);if(n>=0x966&&n<=0x96f){r+=String.fromCodePoint(n-0x966+0x0BE6);continue}r+=c}return r}
function to(t,l){if(!t)return t;if(OFF[l])return brahmic(t,l);if(l==='ta')return tamil(t);return t}
function has(l){return !!(OFF[l]||l==='ta')}
window.SMScript={to,has,font:l=>FONT[l]||'Tiro Devanagari Sanskrit'};
})();
