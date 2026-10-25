// External sandhi between two words (SLP1), with the rule that applies — for the sandhi game and lessons.
const V='aAiIuUfFxXeEoO', VOICED=new Set((V+'gGjJqQdDbBNYRnmyrlvh').split(''));
export const RULES={
  dirgha:['अकः सवर्णे दीर्घः','6.1.101','a/ā + a/ā → ā, i + i → ī …'],
  guna:['आद्गुणः','6.1.87','a/ā + i/u/ṛ → e/o/ar'],
  vrddhi:['वृद्धिरेचि','6.1.88','a/ā + e/ai/o/au → ai/au'],
  yan:['इको यणचि','6.1.77','i/u/ṛ + unlike vowel → y/v/r'],
  ayadi:['एचोऽयवायावः','6.1.78','e/ai/o/au + vowel → ay/āy/av/āv'],
  purvarupa:['एङः पदान्तादति','6.1.109','e/o + a → e/o + ऽ'],
  rutva:['ससजुषो रुः','8.2.66','final s → r (visarga)'],
  utva:['हशि च','6.1.114','aḥ + soft consonant → o'],
  atorutva:['अतो रोरप्लुतादप्लुते','6.1.113','aḥ + a → o ऽ'],
  lopa:['भोभगोअघोअपूर्वस्य योऽशि · लोपः शाकल्यस्य','8.3.17','aḥ/āḥ + vowel/soft → the ḥ drops'],
  ro:['रोऽसुपि / हशि (र्)','8.2.66','iḥ/uḥ + soft → ir/ur'],
  stoh:['स्तोः श्चुना श्चुः','8.4.40','s/t-group + ś/c-group → ś/c-group'],
  satva:['विसर्जनीयस्य सः','8.3.34','ḥ + t/th → s, + c/ch → ś'],
  visarga:['खरवसानयोर्विसर्जनीयः','8.3.15','final r/s → ḥ before hard consonants'],
  jas:['झलां जशोऽन्ते','8.2.39','final k/t/p → g/d/b before voiced sounds'],
  anunasika:['यरोऽनुनासिकेऽनुनासिको वा','8.4.45','final t/k + nasal → n/ṅ'],
  anusvara:['मोऽनुस्वारः','8.3.23','final m + consonant → ṃ'],
  parasavarna:['तोर्लि','8.4.60','t + l → l'],
  chatva:['शश्छोऽटि','8.4.63','t + ś → c ch'],
  none:['प्रकृतिभावः / सन्धिः नास्ति','','no change'],
};
export function join(L,R){
  const a=L.slice(-1),b=R[0];
  const out=(x,rule,sp=true)=>({out:x,rule,sp});
  if(V.includes(a)&&V.includes(b)){
    if('aA'.includes(a)){
      if('aA'.includes(b))return out(L.slice(0,-1)+'A'+R.slice(1),'dirgha',false);
      if('iI'.includes(b))return out(L.slice(0,-1)+'e'+R.slice(1),'guna',false);
      if('uU'.includes(b))return out(L.slice(0,-1)+'o'+R.slice(1),'guna',false);
      if('fF'.includes(b))return out(L.slice(0,-1)+'ar'+R.slice(1),'guna',false);
      if('eE'.includes(b))return out(L.slice(0,-1)+'E'+R.slice(1),'vrddhi',false);
      if('oO'.includes(b))return out(L.slice(0,-1)+'O'+R.slice(1),'vrddhi',false);}
    if('iI'.includes(a))return 'iI'.includes(b)?out(L.slice(0,-1)+'I'+R.slice(1),'dirgha',false):out(L.slice(0,-1)+'y'+R,'yan',false);
    if('uU'.includes(a))return 'uU'.includes(b)?out(L.slice(0,-1)+'U'+R.slice(1),'dirgha',false):out(L.slice(0,-1)+'v'+R,'yan',false);
    if('fF'.includes(a))return out(L.slice(0,-1)+'r'+R,'yan',false);
    if(a==='e')return b==='a'?out(L+"'"+R.slice(1),'purvarupa',false):out(L.slice(0,-1)+'a '+R,'ayadi');
    if(a==='o')return b==='a'?out(L+"'"+R.slice(1),'purvarupa',false):out(L.slice(0,-1)+'av'+R,'ayadi',false);
    if(a==='E')return out(L.slice(0,-1)+'A '+R,'ayadi');
    if(a==='O')return out(L.slice(0,-1)+'Av'+R,'ayadi',false);
  }
  if(a==='H'){const st=L.slice(0,-1);
    if(st==='sa'||st==='eza'){if(!V.includes(b))return out(st+' '+R,'lopa')}
    if(/[^A]a$/.test(st)||st==='a'){
      if(b==='a')return out(st.slice(0,-1)+"o '"+R.slice(1),'atorutva');
      if(V.includes(b))return out(st+' '+R,'lopa');
      if(VOICED.has(b))return out(st.slice(0,-1)+'o '+R,'utva');}
    else if(st.endsWith('A')){if(VOICED.has(b))return out(st+' '+R,'lopa')}
    else if(VOICED.has(b))return out(st+'r'+(V.includes(b)?'':' ')+R,'ro',!V.includes(b));
    if('cC'.includes(b))return out(st+'S '+R,'satva');
    if('tT'.includes(b))return out(st+'s '+R,'satva');
    return out(L+' '+R,'visarga');}
  if(a==='t'){const st=L.slice(0,-1);
    if('nm'.includes(b))return out(st+'n '+R,'anunasika');
    if(b==='l')return out(st+'l '+R,'parasavarna');
    if('cCjJ'.includes(b))return out(st+('jJ'.includes(b)?'j':'c')+R,'stoh',false);
    if(b==='S')return out(st+'cC'+R.slice(1),'chatva',false);
    if(VOICED.has(b))return out(st+'d'+(V.includes(b)?'':'')+R,'jas',false);
    return out(L+R,'none',false);}
  if(a==='k'&&VOICED.has(b))return out(L.slice(0,-1)+('nm'.includes(b)?'N':'g')+R,'nm'.includes(b)?'anunasika':'jas',false);
  if(a==='m'&&!V.includes(b))return out(L.slice(0,-1)+'M '+R,'anusvara');
  return out(L+' '+R,'none');
}
