"""Sanskrit helpers: transliteration, syllables, metre, ordering, search keys."""
import re, unicodedata
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate as T
V='aAiIuUfFxXeEoO'; LONG='AIUFXeEoO'
C='kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh'
def clean_iast(s):
    s=s.replace('’',"'").replace('‘',"'")
    s=re.sub(r"(\w)-(\w)",r"\1\2",s)            # compound hyphens
    s=re.sub(r"\s+"," ",s).strip()
    return s
def iast2slp(s): return T(clean_iast(s),sanscript.IAST,sanscript.SLP1)
def dev2slp(s): return T(s,sanscript.DEVANAGARI,sanscript.SLP1)
def slp2dev(s):
    d=T(s,sanscript.SLP1,sanscript.DEVANAGARI)
    return d.replace("'", "ऽ")
def slp2iast(s): return T(s,sanscript.SLP1,sanscript.IAST)
def sylls(slp):
    """list of (start_index_in_string, weight 'L'/'G') for each syllable; spaces/avagraha ignored for weight"""
    s=slp; idx=[i for i,ch in enumerate(s) if ch in V]
    out=[]
    for k,i in enumerate(idx):
        j=idx[k+1] if k+1<len(idx) else len(s)
        tail=[ch for ch in s[i+1:j] if ch in C or ch in 'MH']
        heavy = s[i] in LONG or (len(tail)>0 and tail[0] in 'MH') or len([c for c in tail if c in C])>=2 or (k+1==len(idx) and len(tail)>=1 and False)
        # onset start for split purposes
        st=i
        while st>0 and (s[st-1] in C or s[st-1] in " '"):
            if s[st-1] in C and (st-1==0 or True): st-=1
            else: st-=1
        out.append((i,'G' if heavy else 'L'))
    return out
def pattern(slp): return ''.join(w for _,w in sylls(slp))
def split_at(slp,k):
    """split string so that the second part starts with syllable k (0-based); prefer a word space in the preceding cluster"""
    idx=[i for i,ch in enumerate(slp) if ch in V]
    if k<=0 or k>=len(idx): return slp,''
    prev=idx[k-1]; cur=idx[k]
    seg=slp[prev+1:cur]
    sp=seg.rfind(' ')
    if sp>=0: cut=prev+1+sp
    else:
        cons=[p for p in range(prev+1,cur) if slp[p] in C]
        # one consonant goes with the next syllable; extra consonants stay (keeps clusters readable)
        cut = cons[-1] if cons else cur
        if slp[prev+1:cut] and all(c in 'MH' for c in slp[prev+1:cut]) : pass
    a,b=slp[:cut].strip(),slp[cut:].strip()
    return a,b
MET={ # sama-vṛtta pāda patterns (last syllable anceps)
'indravajrā':'GGLGGLLGLGG','upendravajrā':'LGLGGLLGLGG','vaṃśastha':'LGLGGLLGLGLG','indravaṃśā':'GGLGGLLGLGLG',
'drutavilambita':'LLLGLLGLLGLG','toṭaka':'LLGLLGLLGLLG','bhujaṅgaprayāta':'LGGLGGLGGLGG','sragviṇī':'GLGGLGGLGGLG',
'rathoddhatā':'GLGLLLGLGLG','svāgatā':'GLGLLLGLLGG','śālinī':'GGGGGLGGLGG','vasantatilakā':'GGLGLLLGLLGLGG',
'praharṣiṇī':'GGGLLLLGLGLGG','mañjubhāṣiṇī':'LLGLGLLLGLGLG','mālinī':'LLLLLLGGGLGGLGG','pṛthvī':'LGLLLGLGLLLGLGGLG',
'mandākrāntā':'GGGGLLLLLGGLGGLGG','śikhariṇī':'LGGGGGLLLLLGGLLLG','hariṇī':'LLLLLGGGGGLGLLGLG',
'śārdūlavikrīḍita':'GGGLLGLGLLLGGGLGGLG','sragdharā':'GGGGLGGLLLLLLGGLGGLGG','pramitākṣarā':'LLGLGLLLGLLG',
'kusumitalatāvellitā':'GGGGGLLLLLGGLGGLGG','mattamayūra':'GGGGLGGLLGGLLG'.ljust(13,'G')[:13],
'rucirā':'LGLGLLLLGLGLG','aśvadhāṭī':'GGLGLLLGGGLGLLLGGGLGLLLG'}
ARDHA={'viyoginī':('LLGLLGLGLG','LLGGLLGLGLG'),'aupacchandasika':('LLGLLGLGLGG','LLGGLLGLGLGG'),
       'puṣpitāgrā':('LLLLLLGLGLGG','LLLLGLLGLGLGG'),'vegavatī':('LLGLLGLLGGG','GLLGLLGLLGG')}
def eq(p,q): return len(p)==len(q) and p[:-1]==q[:-1]
def pada_metre(p):
    if len(p)==8: return 'anuṣṭubh'
    for n,q in MET.items():
        if eq(p,q): return n
    return None
def verse_metre(pats):
    ms=[pada_metre(p) for p in pats]
    if len(pats)==4:
        for n,(o,e) in ARDHA.items():
            if eq(pats[0],o) and eq(pats[1],e) and eq(pats[2],o) and eq(pats[3],e): return n
    if len(pats)==4 and pats[0][:-1]=='LLGLGLLLG' and pats[1][:-1]=='LLLLLGLGL' and pats[3][:-1] in ('LGLGLLLGLGL','LLGLGLLLGLGL'): return 'udgatā'
    if all(m=='anuṣṭubh' for m in ms): return 'anuṣṭubh'
    if ms and all(m in ('indravajrā','upendravajrā') for m in ms):
        return ms[0] if len(set(ms))==1 else 'upajāti'
    if ms and all(m in ('vaṃśastha','indravaṃśā') for m in ms):
        return ms[0] if len(set(ms))==1 else 'upajāti (vaṃśastha)'
    if ms and ms[0] and all(m==ms[0] for m in ms): return ms[0]
    fam=lambda m:'upajāti' if m in ('indravajrā','upendravajrā') else ('vaṃśastha' if m in ('vaṃśastha','indravaṃśā') else m)
    fs=[fam(m) for m in ms if m]
    if len(pats)==4 and fs:
        from collections import Counter
        top,c=Counter(fs).most_common(1)[0]
        if c>=3: return top
    # mātrā āryā check: 12/18/12/15 mātrās
    mat=[sum(2 if w=='G' else 1 for w in p) for p in pats]
    if len(mat)==4 and mat[0] in(12,) and mat[2]==12 and mat[1] in(17,18) and mat[3] in(14,15): return 'āryā'
    return ''
def split_half(slp):
    """split a half-verse (2 pādas) into two pādas, choosing the split that fits a known metre"""
    pat=pattern(slp); n=len(pat)
    cands=[(q,q) for q in MET.values()]+list(ARDHA.values())+[('GGGGGGGG','GGGGGGGG')]
    for o,e in cands:
        k=len(o)
        if len(o)==8 and n==16: return list(split_at(slp,8))
        if n==len(o)+len(e) and eq(pat[:k],o) and eq(pat[k:],e): return list(split_at(slp,k))
    for o,e in cands:   # tolerate one wrong syllable
        k=len(o)
        if n==len(o)+len(e) and sum(a!=b for a,b in zip(pat[:k-1],o[:-1]))<=1: return list(split_at(slp,k))
    if n>=14: return list(split_at(slp,(n+1)//2))
    return [slp]
# ordering
ORD='a A i I u U f F x X e E o O k K g G N c C j J Y w W q Q R t T d D n p P b B m y r l v S z s h'.split()
RANK={c:i for i,c in enumerate(ORD)}
NAS={**{c:'N' for c in 'kKgG'},**{c:'Y' for c in 'cCjJ'},**{c:'R' for c in 'wWqQ'},**{c:'n' for c in 'tTdD'},**{c:'m' for c in 'pPbB'}}
def sortkey(slp):
    s=re.sub(r"[^a-zA-Z]","",slp)
    s=re.sub(r"M(?=([kKgGcCjJwWqQtTdDpPbB]))",lambda m:NAS[m.group(1)],s)
    return [RANK.get(c,60) for c in s.replace('M','m').replace('H','')]
def initial(slp):
    s=re.sub(r"[^a-zA-Z]","",slp)
    return s[:1]
def loose(slp):
    s=slp2iast(slp).lower()
    s=unicodedata.normalize('NFD',s); s=''.join(ch for ch in s if unicodedata.category(ch)!='Mn')
    s=re.sub(r"[^a-z]","",s).replace('sh','s')
    s=re.sub(r"[nm](?=[kgcjtdpb])","n",s)
    return s
