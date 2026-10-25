"""Build the website data for the śloka index from corpus/*.json (re-run after adding any text)."""
import json, glob, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from skt import *
from metres import info as minfo
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/website/sl'
GEN = {'mahakavya': 'महाकाव्यम्', 'khandakavya': 'खण्डकाव्यम्', 'sandesha': 'सन्देशकाव्यम्', 'muktaka': 'मुक्तककाव्यम्',
       'gitikavya': 'गीतिकाव्यम्', 'rupaka': 'रूपकम्', 'katha': 'कथासाहित्यम्', 'stotra': 'स्तोत्रकाव्यम्', 'itihasa': 'इतिहासः',
       'purana': 'पुराणम्', 'shastra': 'शास्त्रम्'}
HERE = os.path.dirname(os.path.abspath(__file__))
texts = [json.load(open(f)) for f in glob.glob(os.path.join(HERE, 'corpus', '*.json'))]
skey = lambda dev: sortkey(dev2slp(dev))
texts.sort(key=lambda t: skey(t['title']))                      # titles in varṇamālā order
POS = {t['id']: i for i, t in enumerate(texts)}
for d in ('t', 'k', 'a', 'm'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
for f in glob.glob(f'{OUT}/m/*.json') + glob.glob(f'{OUT}/a/*.json'): os.remove(f)
slug = lambda m: re.sub(r'[^a-z]', '', loose(iast2slp(m)))
MD = {}                                                          # iast metre → Devanagari label
def mdev(m):
    if not m: return ''
    if m not in MD: MD[m] = minfo(m)['dev']
    return MD[m]
cat = []; alpha = {}; metres = {}
for t in texts:
    sarg = {}
    for v in t['verses']: sarg.setdefault(v['s'], 0); sarg[v['s']] += 1
    cat.append(dict(id=t['id'], title=t['title'], poet=t['poet'], genre=t['genre'], gdev=GEN.get(t['genre'], t['genre']),
                    unit=t.get('unit', 'सर्ग'), source=t.get('source', ''), sargas=[[s, n] for s, n in sorted(sarg.items())],
                    verses=len(t['verses']), aliases=[loose(dev2slp(t['title']))[:6], t['id'][:6]]))
    json.dump(dict(id=t['id'], v=[[v['s'], v['v'], v['p'], mdev(v['m'])] for v in t['verses']]),
              open(f"{OUT}/t/{t['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump([v['k'] for v in t['verses']], open(f"{OUT}/k/{t['id']}.json", 'w'), separators=(',', ':'))
    for v in t['verses']:
        if v['m']: metres.setdefault(v['m'], []).append([v['p'][0], t['id'], v['s'], v['v']])
        for pi, (p, o, ini) in enumerate(zip(v['p'], v['o'], v['i'])):
            alpha.setdefault(ini, []).append((o, p, t['id'], v['s'], v['v'], pi))
letters = []
for ini in sorted(alpha, key=lambda c: RANK.get(c, 99)):
    rows = sorted(alpha[ini], key=lambda r: (r[0], POS[r[2]], r[3], r[4]))
    lab = slp2dev(ini + 'a') if ini in 'kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh' else slp2dev(ini)
    fn = 'L%02d' % RANK.get(ini, 99)
    letters.append([fn, lab, len(rows)])
    json.dump([[p, tid, s, v, pi] for _, p, tid, s, v, pi in rows], open(f"{OUT}/a/{fn}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
# metres: information + every verse in that metre
mlist = []
for m, rows in metres.items():
    d = minfo(m); d['slug'] = slug(m); d['n'] = len(rows)
    by = {}
    for r in rows: by[r[1]] = by.get(r[1], 0) + 1
    d['texts'] = sorted(([k, n] for k, n in by.items()), key=lambda x: POS[x[0]])
    rows.sort(key=lambda r: (POS[r[1]], r[2], r[3]))
    json.dump(rows, open(f"{OUT}/m/{d['slug']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    mlist.append(d)
mlist.sort(key=lambda d: skey(re.sub(r'\s*\(.*', '', d['dev'])))
json.dump(mlist, open(f'{OUT}/metres.json', 'w'), ensure_ascii=False, separators=(',', ':'))
# poets in varṇamālā order, each with their texts (in title order)
poets = {}
for c in cat: poets.setdefault(c['poet'], []).append(c['id'])
poets = [[p, ids] for p, ids in sorted(poets.items(), key=lambda x: skey(x[0]))]
json.dump(dict(texts=cat, poets=poets, letters=letters, metres=[[d['dev'], d['slug'], d['n']] for d in mlist],
               total=sum(c['verses'] for c in cat)), open(f'{OUT}/catalog.json', 'w'), ensure_ascii=False, indent=0)
print(len(cat), 'texts', sum(c['verses'] for c in cat), 'verses', len(letters), 'letters', len(poets), 'poets', len(mlist), 'metres')
