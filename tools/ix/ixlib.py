"""Shared helpers for the large indexes (mantra, itihāsa-purāṇa, subhāṣita): each 'book' is saved as
tools/ix/<collection>/corpus/<book id>.json = {id, work, title, units, verses:[{s, v, p, k, o, i, m}]}"""
import re, os, sys, json, html
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'shloka'))
from skt import *
import ingest
from ingest import join_sandhi, parts_of

def read(path):
    s = open(path, encoding='utf8', errors='replace').read()
    if path.endswith(('.htm', '.html')):
        s = re.sub(r'(?s)<style.*?</style>|<script.*?</script>', '', s)
        s = html.unescape(re.sub(r'<[^>]+>', '', s))
    return s

def clean_iast_line(l):
    l = re.sub(r'\(([^()\[\]]*)\[[^\]]*\][^()]*\)', r'\1', l)
    l = re.sub(r'\([^)]*\)|\[[^\]]*\]|\{[^}]*\}', '', l)
    l = re.sub(r"(?<=[a-zāīūṛeo])\.a", "'", l)
    l = re.sub(r'(?<=[^\W\d_])\d+(?=[^\W\d_]|[\s-]|$)', '', l)
    return l

def verse_or_prose(segs):
    """segs: IAST text pieces (lines / daṇḍa pieces) of one mantra → (list of SLP pādas, metre)"""
    segs = [s.strip(' ,.;|/') for s in segs if s.strip(' ,.;|/-')]
    if not segs: return [], ''
    p = parts_of(segs)
    p = [join_sandhi(x) for x in p if x.strip()]
    m = verse_metre(verse_pats(p)) if 2 <= len(p) <= 6 else ''
    if m: return p, m
    raw = [join_sandhi(iast2slp(x)) for x in segs]
    return [x for x in raw if pattern(x)], ''

def dev_or_prose(segs):
    """segs: Devanagari pieces → (SLP pādas, metre)"""
    slps = [dev2slp(x) for x in segs if x.strip()]
    slps = [x for x in slps if pattern(x)]
    if not slps: return [], ''
    p = slps
    if len(p) < 4:
        q = []
        for x in p: q += [y for y in (split_half(x) if len(pattern(x)) > 12 else [x]) if y]
        if 2 <= len(q) <= 6 and verse_metre(verse_pats(q)): return q, verse_metre(verse_pats(q))
    m = verse_metre(verse_pats(p)) if 2 <= len(p) <= 6 else ''
    return p, m

def entry(s, v, slps, m=''):
    slps = [re.sub(r'\s+', ' ', re.sub(r'[0-9.|]+', ' ', x)).strip() for x in slps]   # stray daṇḍas and verse numbers
    slps = [x for x in slps if pattern(x)]
    return dict(s=str(s), v=v, p=[slp2dev(x) for x in slps], k=[loose(x) for x in slps],
                o=[sortkey(x) for x in slps], i=[initial(x) for x in slps], m=m)

def save(coll, bid, work, title, units, verses, extra=None):
    D = os.path.join(HERE, coll, 'corpus'); os.makedirs(D, exist_ok=True)
    seen = set(); vs = []
    for e in verses:
        if not e['p'] or (e['s'], e['v']) in seen: continue
        seen.add((e['s'], e['v'])); vs.append(e)
    d = dict(id=bid, work=work, title=title, units=units, verses=vs, **(extra or {}))
    json.dump(d, open(f'{D}/{bid}.json', 'w'), ensure_ascii=False)
    from collections import Counter
    print(bid, len(vs), 'entries', len(set(e['s'] for e in vs)), 'chapters', Counter(e['m'] for e in vs).most_common(3))
    return d
