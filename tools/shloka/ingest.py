"""Add a text to the śloka corpus.
usage: python3 ingest.py <file.htm|.txt|.docx|.pdf> --id raghu --title रघुवंशम् --poet कालिदासः --genre mahakavya [--unit सर्गः]
GRETIL files (IAST with pāda markers $ & % // or half-lines / //) and Devanagari files (verses ending in ॥ n ॥) are both read.
"""
import re, html, json, sys, argparse, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from skt import *
CONS='kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh'
def join_sandhi(slp):
    slp=re.sub(r" '",  "'", slp)
    return re.sub(r"(["+CONS+r"]) (?=\S)", r"\1", slp).strip()
def read_text(path):
    if path.endswith('.docx'):
        from docx import Document
        return '\n'.join(p.text for p in Document(path).paragraphs)
    if path.endswith('.pdf'):
        import pymupdf; return '\n'.join(p.get_text() for p in pymupdf.open(path))
    s=open(path,encoding='utf8',errors='replace').read()
    if path.endswith(('.htm','.html')): s=html.unescape(re.sub(r'<[^>]+>','',s))
    return s
SKIP=re.compile(r'^\s*[#(\[*]|^\s*\.\.\.|https?:|^\s*\{|^\s*note\s*:',re.I)
def parts_of(lines):
    """lines of one verse -> list of pāda SLP strings"""
    segs=[]
    for l in lines:
        l=re.sub(r'^X|\(C|C\)','',l.strip())                 # Buddhacarita editorial marks
        l=re.sub(r"(?<=[a-zāīūṛeo])\.a","'",l)               # ko.api = ko 'pi
        l=re.sub(r'\([^)]*\)|\[[^\]]*\]','',l)
        l=re.sub(r'\{[^}]*\}?|[A-Za-z]+_[\d.]+|[=*{}]','',l)        # notes, stray ids
        l=re.sub(r'(?<=[^\W\d_])\d+(?=[^\W\d_]|[\s-]|$)','',l)    # analytic editions mark sandhi with digits (vo1pamā)
        segs+=[x.strip(' ,.;') for x in re.split(r'[|/$&%\\#]',l) if x.strip(' ,.;-')]
    slps=[iast2slp(x) for x in segs]
    slps=[x for x in slps if pattern(x)]
    # headings that precede the first verse (title, author) are short and not part of the metre
    while len(slps)>2 and len(pattern(slps[0]))<6 and sum(len(pattern(x)) for x in slps[1:])>=28: slps=slps[1:]
    if len(slps)<4:
        out=[]
        for x in slps: out+=[y for y in split_half(x) if y]
        slps=out
    if len(slps)>4:   # stray heading lines: keep the last four if they make a known metre
        last=slps[-4:]
        if verse_metre(verse_pats([join_sandhi(x) for x in last])): slps=last
    if not verse_metre(verse_pats([join_sandhi(x) for x in slps])):
        r=resplit(' '.join(slps))
        if r: slps=r
    return slps
def numid(vid):
    star='*' in vid.split('_')[-1].split('*')[0] or re.search(r'_\*',vid)
    num=[int(x) for x in re.findall(r'\d+',vid.split('_')[-1].split('*')[0] if not re.search(r'_\*',vid) else vid.split('*')[-1])]
    if not num: return None
    if re.search(r'_\*',vid): return (0,num[-1])
    return (num[-2],num[-1]) if len(num)>=2 else (1,num[0])
LINEID=re.compile(r'^([A-Za-z]+_[\d.]+)-(\d+)\s+(.*)$')
def gretil(s):
    lines=s.splitlines()
    if sum(1 for l in lines if LINEID.match(l.strip()))>50:      # Bhk_1.1-1 style: one line per pāda / half
        grp={}; order=[]
        for l in lines:
            m=LINEID.match(l.strip())
            if not m: continue
            if m.group(1) not in grp: grp[m.group(1)]=[]; order.append(m.group(1))
            grp[m.group(1)].append(m.group(3))
        out=[]
        for vid in order:
            n=numid(vid)
            if n: out.append((n[0],n[1],parts_of(grp[vid])))
        return out
    out=[]; last=0
    MARK=re.compile(r'//\s*([^/\n]*?\d[^/\n]*?)\s*//|\|\|\s*([A-Za-z_]*\*?[\d][\w.*-]*)\s*(?:\|\|)?')
    for m in MARK.finditer(s):
        vid=(m.group(1) or m.group(2)).strip(); body=s[last:m.start()]; last=m.end()
        if '*' in vid and not re.search(r'_\*\d+$',vid): continue
        n=numid(vid)
        if not n: continue
        blocks=re.split(r'\n\s*\n',body.strip()); body=blocks[-1] if blocks else ''
        ls=[l for l in body.splitlines() if l.strip() and not SKIP.match(l)]
        if ls and re.match(r"\s*iti\s", ls[0]) and re.search(r"(sarga|aṅka|adhyāya|śataka|prabandha)[ḥṃ]?\b", ' '.join(ls)): continue   # colophon
        p=parts_of(ls)
        if p: out.append((n[0],n[1],p))
    return out
def devanagari(s,unit):
    out=[]; sarga=1
    for blk in re.split(r'(॥\s*[०-९\d.\-]+\s*॥)',s):
        if re.fullmatch(r'॥\s*[०-९\d.\-]+\s*॥',blk.strip() or 'x'):
            continue
        lines=[l.strip() for l in blk.strip().splitlines() if l.strip()]
        # sarga heading inside block
        keep=[]
        for l in lines:
            if re.search(unit,l) and len(l)<60:
                m=re.search(r'([०-९\d]+)',l)
                if m: sarga=int(m.group(1).translate(str.maketrans('०१२३४५६७८९','0123456789')))
                keep=[]; continue
            keep.append(l)
        text=re.sub(r'\([^)]*\)','',' '.join(keep))
        halves=[h.strip() for h in re.split(r'।',text) if h.strip()]
        if not halves: continue
        slps=[]
        for h in halves[-2:]:
            x=dev2slp(h); n=len(pattern(x))
            slps+= [y for y in (split_half(x) if n>12 else [x]) if y]
        out.append((sarga,None,slps))
    # number verses within sargas
    res=[];cnt={}
    for sg,_,sl in out:
        cnt[sg]=cnt.get(sg,0)+1; res.append((sg,cnt[sg],sl))
    return res
if __name__=='__main__':
    a=argparse.ArgumentParser(); a.add_argument('file'); a.add_argument('--id',required=True); a.add_argument('--title',required=True)
    a.add_argument('--poet',default=''); a.add_argument('--genre',default='kavya'); a.add_argument('--unit',default='सर्ग'); a.add_argument('--source',default='')
    o=a.parse_args(); s=read_text(o.file)
    verses=gretil(s) if re.search(r'[a-zA-Z]{4}',s) and not re.search(r'[\u0900-\u097f]{20}',s) else devanagari(s,o.unit)
    data=dict(id=o.id,title=o.title,poet=o.poet,genre=o.genre,unit=o.unit,source=o.source,verses=[])
    seen=set()
    for sg,v,slps in verses:
        if (sg,v) in seen: continue          # repeated numbers (variant verses, a text printed twice): keep the first
        seen.add((sg,v))
        slps=[join_sandhi(x) for x in slps if x.strip()]
        pats=verse_pats(slps)
        data['verses'].append(dict(s=sg,v=v,p=[slp2dev(x) for x in slps],k=[loose(x) for x in slps],o=[sortkey(x) for x in slps],i=[initial(x) for x in slps],m=verse_metre(pats)))
    os.makedirs('corpus',exist_ok=True); json.dump(data,open(f'corpus/{o.id}.json','w'),ensure_ascii=False)
    from collections import Counter
    print(o.id,len(data['verses']),'verses; sargas',len(set(x['s'] for x in data['verses'])),Counter(x['m'] for x in data['verses']).most_common(5))
