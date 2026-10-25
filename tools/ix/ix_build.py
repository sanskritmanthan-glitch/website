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
    json.dump(dict(id=b['id'], v=[[v['s'], v['v'], v['p'], mdev(v['m'])] for v in b['verses']]), open(f"{OUT}/t/{b['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
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
               small=bool(cfg.get('small')), total=sum(b['verses'] for b in booklist), mdev=MD),
          open(f'{OUT}/catalog.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(C, len(works), 'works', len(booklist), 'books', sum(b['verses'] for b in booklist), 'entries', len(mlist), 'metres')
