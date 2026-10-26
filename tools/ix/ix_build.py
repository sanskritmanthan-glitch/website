"""Build site data for a large index collection: python3 ix_build.py <collection>  → website/<dir>/"""
import json, glob, os, sys, re
from ixlib import *
from metres import info as minfo
C = sys.argv[1]; HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(f'{HERE}/{C}/collection.json'))
OUT = os.path.join(HERE, '..', '..', cfg['dir'])
TD = str.maketrans('0123456789', '०१२३४५६७८९')
chkey = lambda s: [int(x) for x in s.split('.')]
books = {}
for f in glob.glob(f'{HERE}/{C}/corpus/*.json'):
    b = json.load(open(f)); books[b['id']] = b
order = [w for _, ws in cfg['groups'] for w in ws]
bks = sorted(books.values(), key=lambda b: (order.index(b['work']) if b['work'] in order else 999, b.get('n', 0), b['id']))
for d in ('t', 'k', 'a', 'm'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
for f in glob.glob(f'{OUT}/a/**/*.json', recursive=True) + glob.glob(f'{OUT}/m/*.json'): os.remove(f)
try: SLM = {d['slug'] for d in json.load(open(os.path.join(HERE, '..', '..', 'sl', 'metres.json')))}
except Exception: SLM = set()
slug = lambda m: re.sub(r'[^a-z]', '', loose(iast2slp(m.replace('v:', 'v '))))
MD = {}
def mdev(m):
    if not m: return ''
    if m not in MD: MD[m] = minfo(m)['dev']
    return MD[m]
# cross-references: the same verse (first two pādas) elsewhere on the site
XR = {}
def xkey(v): return (v['k'][0] + '|' + v['k'][1]) if len(v.get('k', [])) >= 2 and len(v['k'][0]) > 6 else None
if cfg.get('xref'):
    SH = os.path.join(HERE, '..', 'shloka')
    for page, pat in (('shloka.html', f'{SH}/corpus/*.json'), ('sutranveshanam.html', f'{SH}/sutra_corpus/*.json'), ('itihasa.html', f'{HERE}/itihasa/corpus/*.json'), (cfg['page'], f'{HERE}/{C}/corpus/*.json')):
        for f in glob.glob(pat):
            d = json.load(open(f)); title = d['title']
            if page == 'itihasa.html':
                wc = json.load(open(f'{HERE}/itihasa/collection.json'))['works'].get(d['work'], {}); title = wc.get('title', title) + ' · ' + d['title']
            for v in d['verses']:
                k = xkey(v)
                if k: XR.setdefault(k, []).append([f"{title} {str(v['s']) + '.' if str(v['s']) not in ('1', '0') or page != cfg['page'] else ''}{v['v']}", f"{page}#{d['id']}/{v['s']}/{v['v']}"])
works = {}; booklist = []; alpha = {}; metres = {}
for bi, b in enumerate(bks):
    w = b['work']; wc = cfg['works'].get(w, {})
    if w not in works:
        works[w] = dict(id=w, title=wc.get('title', b['title']), abbr=wc.get('abbr', wc.get('title', b['title'])), note=wc.get('note', ''),
                        author=wc.get('author', ''), bunit=wc.get('bunit', ''), books=[], verses=0,
                        aliases=sorted(set(wc.get('alias', []) + [loose(dev2slp(wc.get('title', b['title'])))[:6]])))
    works[w]['books'].append(b['id'])
    ch = {}
    for v in b['verses']: ch[v['s']] = ch.get(v['s'], 0) + 1
    b['verses'].sort(key=lambda v: (chkey(v['s']), v['v']))
    num = b.get('num') or (re.search(r'(\d+)$', b['id']).group(1).lstrip('0') if re.search(r'\d+$', b['id']) and len(works[w]['books']) >= 1 and b['work'] != b['id'] else '')
    booklist.append(dict(id=b['id'], work=w, title=b['title'], num=num, units=b['units'], sargas=[[s, n] for s, n in sorted(ch.items(), key=lambda x: chkey(x[0]))],
                         verses=len(b['verses'])))
    works[w]['verses'] += len(b['verses'])
    if cfg.get('slp'):   # big collections: store text in SLP1 (one byte a letter); the page turns it into Devanagari
        for v in b['verses']: v['p'] = [dev2slp(x) for x in v['p']]
    rows = []; prevpoet = ''
    for v in b['verses']:
        r = [v['s'], v['v'], v['p'], mdev(v['m'])]
        if cfg.get('poets') or cfg.get('xref'):
            a = v.get('a', '') or ''
            if a in ('तस्यैव', 'तेषामेव') and prevpoet: a = prevpoet
            if a and a not in ('कस्यचित्', 'केषांचित्', 'कस्यापि'): prevpoet = a
            here = f"{cfg['page']}#{b['id']}/{v['s']}/{v['v']}"
            xs = [x for x in XR.get(xkey(v), []) if x[1] != here][:8] if cfg.get('xref') else []
            r += [a, xs]
        rows.append(r)
    json.dump(dict(id=b['id'], v=rows), open(f"{OUT}/t/{b['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump([v['k'] for v in b['verses']], open(f"{OUT}/k/{b['id']}.json", 'w'), separators=(',', ':'))
    for v in b['verses']:
        if v['m']: metres.setdefault(v['m'], []).append([v['p'][0], b['id'], v['s'], v['v']])
        for pi, (p, o, ini) in enumerate(zip(v['p'], v['o'], v['i'])):
            alpha.setdefault(w, {}).setdefault(ini, []).append((o, p, b['id'], v['s'], v['v'], pi, bi))
def write_alpha(scope, rowsets):
    os.makedirs(f'{OUT}/a/{scope}', exist_ok=True); letters = []
    for ini in sorted(rowsets, key=lambda c: RANK.get(c, 99)):
        rows = sorted(rowsets[ini], key=lambda r: (r[0], r[6], chkey(r[3]), r[4]))
        lab = slp2dev(ini + 'a') if ini in 'kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh' else slp2dev(ini)
        fn = 'L%02d' % RANK.get(ini, 99); letters.append([fn, lab, len(rows)])
        json.dump([[p, bid, s, v, pi] for _, p, bid, s, v, pi, _ in rows], open(f'{OUT}/a/{scope}/{fn}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    return letters
letters = {w: write_alpha(w, a) for w, a in alpha.items()}
if cfg.get('small'):
    allr = {}
    for a in alpha.values():
        for ini, rows in a.items(): allr.setdefault(ini, []).extend(rows)
    letters['all'] = write_alpha('all', allr)
mlist = []
for m, rows in metres.items():
    d = minfo(m); d['slug'] = slug(m); d['n'] = len(rows); d['link'] = d['slug'] if d['slug'] in SLM else ''
    if cfg.get('small') or len(rows) < 20000:
        rows.sort(key=lambda r: [i for i, b in enumerate(bks) if b['id'] == r[1]][0])
        json.dump(rows, open(f"{OUT}/m/{d['slug']}.json", 'w'), ensure_ascii=False, separators=(',', ':')); d['file'] = 1
    mlist.append(dict(dev=d['dev'], slug=d['slug'], n=d['n'], link=d['link'], kind=d.get('kind', ''), file=d.get('file', 0), note=d.get('note', '')))
mlist.sort(key=lambda d: -d['n'])
groups = [[g, [w for w in ws if w in works]] for g, ws in cfg['groups']]
json.dump(dict(works=[works[w] for _, ws in groups for w in ws], books=booklist, groups=groups, letters=letters, metres=mlist,
               small=bool(cfg.get('small')), slp=bool(cfg.get('slp')), total=sum(b['verses'] for b in booklist), mdev=MD),
          open(f'{OUT}/catalog.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(C, len(works), 'works', len(booklist), 'books', sum(b['verses'] for b in booklist), 'entries', len(mlist), 'metres')
