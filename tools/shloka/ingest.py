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
def gretil(s):
    out=[]; last=0
    for m in re.finditer(r'//\s*([^/\n]+?)\s*//',s):
        vid=m.group(1); body=s[last:m.start()]; last=m.end()
        if '*' in vid or not re.search(r'\d',vid): continue
        body='\n'.join(l for l in body.splitlines() if not l.strip().startswith('#'))
        # keep only the verse lines immediately before the marker
        blocks=re.split(r'\n\s*\n',body.strip()); body=blocks[-1] if blocks else ''
        num=re.findall(r'\d+',vid.split('_')[-1]); sarga,verse=(int(num[0]),int(num[1])) if len(num)>=2 else (1,int(num[0]))
        if '$' in body or '&' in body or '%' in body:
            pads=[p.strip() for p in re.split(r'[$&%\\#]',body) if p.strip()]
            slps=[iast2slp(p) for p in pads]
        else:
            halves=[h.strip() for h in re.split(r'\s/\s*\n|\s/$|\s/\s',body) if h.strip()]
            slps=[]
            for h in halves: slps+= [x for x in split_half(iast2slp(h)) if x]
        out.append((sarga,verse,slps))
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
    verses=gretil(s) if '//' in s and re.search(r'//\s*\w+_\d',s) else devanagari(s,o.unit)
    data=dict(id=o.id,title=o.title,poet=o.poet,genre=o.genre,unit=o.unit,source=o.source,verses=[])
    for sg,v,slps in verses:
        slps=[join_sandhi(x) for x in slps if x.strip()]
        pats=[pattern(x) for x in slps]
        data['verses'].append(dict(s=sg,v=v,p=[slp2dev(x) for x in slps],k=[loose(x) for x in slps],o=[sortkey(x) for x in slps],i=[initial(x) for x in slps],m=verse_metre(pats)))
    os.makedirs('corpus',exist_ok=True); json.dump(data,open(f'corpus/{o.id}.json','w'),ensure_ascii=False)
    from collections import Counter
    print(o.id,len(data['verses']),'verses; sargas',len(set(x['s'] for x in data['verses'])),Counter(x['m'] for x in data['verses']).most_common(5))
