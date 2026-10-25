"""Sūtra–kārikā index: read a GRETIL śāstra text into sutra_corpus/<id>.json.
Sūtras are indexed whole (one entry per sūtra); kārikās and ślokas by pāda, like the śloka index.
usage: python3 sutra_ingest.py <file> --id --title --author --darshana --kind sutra|karika|shloka --units अध्यायः,पादः
"""
import re, json, sys, os, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ingest
from ingest import read_text, parts_of, join_sandhi, SKIP
from skt import *

def clean(t):
    t = re.sub(r'\(([^()\[\]]*)\[[^\]]*\][^()]*\)', r'\1', t)      # (reading[B:]variant) → reading
    t = re.sub(r'\([^)]*\)|\[[^\]]*\]|\{[^}]*\}', '', t)
    t = re.sub(r"(?<=[a-zāīūṛeo])\.a", "'", t)
    t = re.sub(r'(?<=[^\W\d_])\d+(?=[^\W\d_]|[\s-]|$)', '', t)
    return re.sub(r'\s+', ' ', t).strip(' ,.;|/')

def nums(idtxt):
    n = [int(x) for x in re.findall(r'\d+', idtxt.split('|')[0])]
    return ('.'.join(map(str, n[:-1])) or '1', n[-1]) if n else None

TRAIL = re.compile(r'^(.*?)\s*(?:\|\||\||//|/)\s*([A-Za-z]+_)?(\*?[\d][\d.,:]*)\s*(?:\|\||\||//|/)?\s*$')
LEAD = re.compile(r'^(\d+(?:\.\d+)+)\s*[:.]?\s+(.*)$')
def sutras(s):
    out = []; prev = ''
    for raw in s.splitlines():
        l = raw.strip()
        if not l or l.startswith(('*', '#')) or SKIP.match(l): prev = ''; continue
        m = LEAD.match(l)
        if m and not TRAIL.match(l):
            idt, text = m.group(1), m.group(2)
        else:
            m = TRAIL.match(l)
            if not m: prev = l; continue
            text, idt = m.group(1), m.group(3)
            if '*' in idt: prev = ''; continue
            if not clean(text): text = prev
        n = nums(idt); t = clean(text)
        if n and t and re.search(r'[a-zA-Zāīū]', t): out.append((n[0], n[1], [iast2slp(t)]))
        prev = ''
    return out

HALF = re.compile(r'^(.*?)\s+([A-Za-z]+_[\d.,]+)([a-f])\b')
def halflines(s):            # Bhg_01.004a style: one half-line per line
    grp = {}; order = []
    for l in s.splitlines():
        m = HALF.match(l.strip())
        if not m: continue
        k = m.group(2)
        if k not in grp: grp[k] = []; order.append(k)
        grp[k].append(clean(m.group(1)))
    out = []
    for k in order:
        n = nums(k.split('_', 1)[1])
        p = parts_of(grp[k])
        if p: out.append((n[0], n[1], p))
    return out

def verses(s):
    if sum(1 for l in s.splitlines() if HALF.match(l.strip())) > 50: return halflines(s)
    s = re.sub(r'\(([^()\[\]]*)\[[^\]]*\][^()]*\)', r'\1', s)      # keep the main reading of (reading[B:]variant)
    old = ingest.numid
    ingest.numid = lambda vid: (lambda n: (n[0], n[1]) if n else None)(nums(vid.split('_', 1)[-1]))
    try: return ingest.gretil(s)
    finally: ingest.numid = old

if __name__ == '__main__':
    a = argparse.ArgumentParser(); a.add_argument('file'); a.add_argument('--id', required=True); a.add_argument('--title', required=True)
    a.add_argument('--author', default=''); a.add_argument('--darshana', default=''); a.add_argument('--kind', default='sutra')
    a.add_argument('--units', default=''); a.add_argument('--nojoin', action='store_true'); a.add_argument('--source', default='GRETIL (gretil.sub.uni-goettingen.de)')
    o = a.parse_args(); s = read_text(o.file)
    rows = sutras(s) if o.kind == 'sutra' else verses(s)
    if rows and all(r[0] == '1' for r in rows):          # numbering restarts in each section: count the sections
        sec, last, fixed = 1, 0, []
        for _, v, p in rows:
            if v <= last: sec += 1
            fixed.append((str(sec), v, p)); last = v
        rows = fixed
    data = dict(id=o.id, title=o.title, author=o.author, darshana=o.darshana, kind=o.kind, units=[u for u in o.units.split(',') if u],
                source=o.source, verses=[])
    seen = set()
    for sg, v, slps in rows:
        if (sg, v) in seen: continue
        if any(re.search(r'[0-9]|[A-Z][a-z]{2,}', slp2iast(x)) for x in slps): continue   # headings, bibliography
        seen.add((sg, v))
        if o.kind == 'sutra':
            x = slps[0].strip(); slps = [re.sub(r" '", "'", x) if o.nojoin else join_sandhi(x)]; m = ''
        else:
            slps = [join_sandhi(x) for x in slps if x.strip()]; m = verse_metre(verse_pats(slps))
        data['verses'].append(dict(s=str(sg), v=v, p=[slp2dev(x) for x in slps], k=[loose(x) for x in slps],
                                   o=[sortkey(x) for x in slps], i=[initial(x) for x in slps], m=m))
    D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sutra_corpus'); os.makedirs(D, exist_ok=True)
    json.dump(data, open(f'{D}/{o.id}.json', 'w'), ensure_ascii=False)
    from collections import Counter
    ch = Counter(x['s'] for x in data['verses'])
    print(o.id, len(data['verses']), 'chapters', len(ch), list(ch.items())[:4], Counter(x['m'] for x in data['verses']).most_common(3) if o.kind != 'sutra' else '')
