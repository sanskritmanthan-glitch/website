"""Build the website data for the sūtra–kārikā index (sutranveshanam.html) from sutra_corpus/*.json → su/"""
import json, glob, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from skt import *
from metres import info as minfo
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'su')
DARS = {'vedanta': 'वेदान्तः', 'yoga': 'योगः', 'nyaya': 'न्यायः', 'vaisheshika': 'वैशेषिकम्', 'mimamsa': 'पूर्वमीमांसा',
        'samkhya': 'साङ्ख्यम्', 'vyakarana': 'व्याकरणम्', 'bauddha': 'बौद्धदर्शनम्', 'pratyabhijna': 'प्रत्यभिज्ञा (काश्मीरशैवम्)',
        'pashupata': 'पाशुपतम्', 'jaina': 'जैनदर्शनम्', 'charvaka': 'चार्वाकः', 'alankara': 'अलङ्कारशास्त्रम्'}
ALIAS = {'bhagavadgita': ['gita', 'bhagavad', 'bg'], 'ashtadhyayi': ['panini', 'pan', 'astadhyayi'], 'brahmasutra': ['brahma', 'bs', 'vedantasutra'],
         'yogasutra': ['yoga', 'ys'], 'nyayasutra': ['nyaya', 'ns'], 'vaisheshikasutra': ['vaisesika', 'vs'], 'mimamsasutra': ['mimamsa', 'jaimini'],
         'samkhyasutra': ['sankhyasutra'], 'samkhyakarika': ['sankhyakarika', 'sk'], 'mandukyakarika': ['gaudapada', 'agamasastra'],
         'mulamadhyamakakarika': ['mmk', 'madhyamaka'], 'vakyapadiya': ['vp', 'bhartrhari'], 'shivasutra': ['sivasutra'], 'hathayogapradipika': ['hyp', 'hatha']}
KIND = {'sutra': 'सूत्राणि', 'karika': 'कारिकाः', 'shloka': 'श्लोकाः'}
skey = lambda dev: sortkey(dev2slp(dev))
chkey = lambda s: [int(x) for x in s.split('.')]
texts = [json.load(open(f)) for f in glob.glob(os.path.join(HERE, 'sutra_corpus', '*.json'))]
texts.sort(key=lambda t: skey(t['title']))
POS = {t['id']: i for i, t in enumerate(texts)}
for d in ('t', 'k', 'a'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
for f in glob.glob(f'{OUT}/a/*.json'): os.remove(f)
slug = lambda m: re.sub(r'[^a-z]', '', loose(iast2slp(m)))
MD = {}
def mdev(m):
    if not m: return ''
    if m not in MD: MD[m] = minfo(m)['dev']
    return MD[m]
cat = []; alpha = {}
for t in texts:
    ch = {}
    for v in t['verses']: ch[v['s']] = ch.get(v['s'], 0) + 1
    cat.append(dict(id=t['id'], title=t['title'], author=t['author'], darshana=t['darshana'], ddev=DARS.get(t['darshana'], t['darshana']),
                    kind=t['kind'], kdev=KIND.get(t['kind'], t['kind']), units=t.get('units', []), source=t.get('source', ''),
                    sargas=[[s, n] for s, n in sorted(ch.items(), key=lambda x: chkey(x[0]))], verses=len(t['verses']),
                    aliases=[loose(dev2slp(t['title']))[:6], t['id'][:6]] + ALIAS.get(t['id'], [])))
    t['verses'].sort(key=lambda v: (chkey(v['s']), v['v']))
    json.dump(dict(id=t['id'], v=[[v['s'], v['v'], v['p'], mdev(v['m'])] for v in t['verses']]),
              open(f"{OUT}/t/{t['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump([v['k'] for v in t['verses']], open(f"{OUT}/k/{t['id']}.json", 'w'), separators=(',', ':'))
    for v in t['verses']:
        for pi, (p, o, ini) in enumerate(zip(v['p'], v['o'], v['i'])):
            alpha.setdefault(ini, []).append((o, p, t['id'], v['s'], v['v'], pi))
letters = []
for ini in sorted(alpha, key=lambda c: RANK.get(c, 99)):
    rows = sorted(alpha[ini], key=lambda r: (r[0], POS[r[2]], chkey(r[3]), r[4]))
    lab = slp2dev(ini + 'a') if ini in 'kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh' else slp2dev(ini)
    fn = 'L%02d' % RANK.get(ini, 99)
    letters.append([fn, lab, len(rows)])
    json.dump([[p, tid, s, v, pi] for _, p, tid, s, v, pi in rows], open(f"{OUT}/a/{fn}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
authors = {}
for c in cat: authors.setdefault(c['author'], []).append(c['id'])
authors = [[a, ids] for a, ids in sorted(authors.items(), key=lambda x: (x[0] == '—', skey(x[0]) if x[0] != '—' else []))]
dars = {}
for c in cat: dars.setdefault(c['darshana'], []).append(c['id'])
dars = [[DARS.get(d, d), ids] for d, ids in sorted(dars.items(), key=lambda x: skey(DARS.get(x[0], x[0])))]
json.dump(dict(texts=cat, authors=authors, darshanas=dars, letters=letters, mslug={v: slug(k) for k, v in MD.items()},
               kinds=[[k, KIND[k], sum(c['verses'] for c in cat if c['kind'] == k)] for k in KIND],
               total=sum(c['verses'] for c in cat)), open(f'{OUT}/catalog.json', 'w'), ensure_ascii=False, indent=0)
print(len(cat), 'texts', sum(c['verses'] for c in cat), 'entries', len(letters), 'letters', len(authors), 'authors', len(dars), 'darshanas')
