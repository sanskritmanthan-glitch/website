"""Parsers for the śāstra collections (GRETIL files): trailing-id texts (… // Mn_7.148 //), leading-id sūtra texts
(KAZ04.6.13/ …), and plain-numbered texts (… || 13 || with chapter headings). Analytic (pausa) editions are put
back into saṃhitā with sandhi.py."""
import re, os, sys
from collections import Counter
from ixlib import *
from sandhi import pausa_line
G = '/home/claude/corpus/gretil/gretil.sub.uni-goettingen.de/gretil/1_sanskr'
JUNK = re.compile(r'^\s*([\[<{*(#@%]|START|END|COMM|\.\.\.|https?:|note\s*:|_{3,}|-{3,})', re.I)

def nums(idstr):
    idstr = re.sub(r'\[[^\]]*\]|\([^)]*\)|\{[^}]*\}', '', idstr)
    return [int(x) for x in re.findall(r'\d+', idstr)]

def to_slp_segs(lines, pausa=False, marks='-'):
    """IAST lines of one unit → SLP segments (pādas or half-verses or prose pieces)"""
    segs = []
    for l in lines:
        l = re.sub(r'\[[^\]]*\]|\([^)]*\)|\{[^}]*\}|<[^>]*>', ' ', l)
        if not pausa: l = re.sub(r"(?<=[a-zāīūṛeo])\.a", "'", l)
        l = re.sub(r'(?<=[^\W\d_])\d+(?=[^\W\d_]|[\s-]|$)', '', l)
        l = l.replace('ū̆', '').replace(':', '')
        for x in re.split(r'[|/$&%\\#!]+', l):
            x = re.sub('[' + re.escape(''.join(c for c in '*+@=^"“”' if not (pausa and c in marks))) + ']', ' ', x).strip(' ,.;-–—')
            x = re.sub(r'\s+', ' ', x)
            if not x or re.match(r'^[KUC]\s', x): continue                # variant readings
            x = re.sub(r'ḷ(?=[aāiīuūeo])', 'ḻ', x)
            if pausa: segs.append(pausa_line(x, marks))
            else: segs.append(iast2slp(x.replace('-', '')))
    return [s for s in segs if pattern(s)]

def unit(segs):
    """SLP segments → (pādas, metre) — verse if it scans, else prose pieces"""
    p = [join_sandhi(x) for x in segs]
    if not p: return [], ''
    tries = [p]
    if len(p) < 4:
        q = []
        for x in p: q += [y for y in (split_half(x) if len(pattern(x)) > 12 else [x]) if y]
        tries.append(q)
    for t in tries:
        if 2 <= len(t) <= 6:
            m = verse_metre(verse_pats(t))
            if m: return t, m
    return p, ''

def mk(s, v, segs):
    p, m = unit(segs)
    return entry(s, v, p, m) if p else None

def drop_heads(lines):
    """leading heading lines (no daṇḍa) in front of a verse whose lines carry daṇḍas"""
    sep = re.compile(r'[|/$&%]')
    while len(lines) > 1 and not sep.search(lines[0]) and any(sep.search(x) for x in lines[1:-1]): lines = lines[1:]
    while len(lines) > 1 and re.match(r'^\s*\d+[.)]?\s*[^\s/|]*\s*$', lines[0]): lines = lines[1:]
    return lines

COLO = re.compile(r'^\s*iti\b.*(adhyāy|śāstre|samāpt|prakaraṇ|paṭal|ullāsa|sthāne|nāma\b)', re.I)
TRAIL = re.compile(r'(?:/{1,2}|\|{1,2})\s*([^\s/|]*?\d[^\s/|]*)\s*(?:/{1,2}|\|{1,2})?\s*$')
def trail(path, prefix=None, keep=None, s_of=None, pausa=False, indent_is_comm=False, maxlines=8):
    """verses closed by a line-final id marker. returns [(nums, lines)]"""
    txt = read(path).split('\n')
    if indent_is_comm: txt = [l for l in txt if not re.match(r'^\s{3,}\S', l)]
    if prefix is None:
        c = Counter(re.match(r'\D*', m.group(1)).group(0) for l in txt for m in [TRAIL.search(l)] if m)
        prefix = c.most_common(1)[0][0] if c else ''
    out = []; buf = []
    for l in txt:
        if not l.strip(): continue
        m = TRAIL.search(l)
        if m and m.group(1).startswith(prefix) and re.match(re.escape(prefix) + r'\d', m.group(1)):
            body = l[:m.start()]
            lines = [x for x in buf if not JUNK.match(x) and not COLO.match(x)] + ([body] if body.strip() else [])
            lines = drop_heads(lines[-maxlines:])
            n = nums(m.group(1)[len(prefix):])
            if n and lines and (keep is None or keep(m.group(1))): out.append((n, lines))
            buf = []
        elif m and re.match(r'\D*_\d', m.group(1)) and not m.group(1).startswith(prefix):
            buf = []                                       # a commentary's own numbered line closes the unit
        else:
            buf.append(l)
    return out

def headed(path, rx, maxlines=8):
    """kārikās introduced by an id line (Dhv_1.2:) and closed by a line ending in // → [(nums, lines)]"""
    R = re.compile(rx); out = []; cur = None
    for l in read(path).split('\n'):
        m = R.match(l.strip())
        if m: cur = ([int(x) for x in m.groups()], []); continue
        if cur is None or not l.strip(): continue
        cur[1].append(l)
        if re.search(r'//\s*$', l) or len(cur[1]) >= maxlines:
            out.append(cur); cur = None
    return out

def by_id(rows, s_fn=None, pausa=False, marks='-'):
    """[(nums, lines)] → entries, merging lines that share an id"""
    grp = {}; order = []
    for n, lines in rows:
        s, v = s_fn(n) if s_fn else (('.'.join(map(str, n[:-1])) or '1'), n[-1])
        k = (str(s), v)
        if k not in grp: grp[k] = []; order.append(k)
        grp[k] += lines
    out = []
    for k in order:
        e = mk(k[0], k[1], to_slp_segs(grp[k], pausa, marks))
        if e: out.append(e)
    return out

def lead(path, rx, pausa=False, marks='-', clean=None, keep=None):
    """sūtra texts with an id at the start of each line: rx groups → (nums..., text) — last group is the text"""
    R = re.compile(rx); rows = []
    for l in read(path).split('\n'):
        m = R.match(l.strip())
        if not m: continue
        g = m.groups(); t = g[-1]
        if keep and not keep(m): continue
        if clean: t = clean(t)
        rows.append(([int(x) for x in g[:-1] if x is not None and x.isdigit()], [t]))
    return rows

def numbered(path, head_rx, num_rx=r'(?://|\|\|)\s*(\d+)\s*(?://|\|\|)?\s*$', skip_indented=True, maxlines=8):
    """plain-numbered verses (|| 13 ||) whose numbering restarts under each chapter heading → [(nums, lines)]"""
    H = re.compile(head_rx); N = re.compile(num_rx); ch = 0; out = []; buf = []
    for l in read(path).split('\n'):
        if not l.strip(): continue
        if skip_indented and re.match(r'^\s{3,}\S', l): continue
        if H.search(l): ch += 1; buf = []; continue
        m = N.search(l)
        if m and ch:
            lines = drop_heads([x for x in buf if not JUNK.match(x)][-maxlines:] + [l[:m.start()]])
            out.append(([ch, int(m.group(1))], lines)); buf = []
        else: buf.append(l)
    return out
