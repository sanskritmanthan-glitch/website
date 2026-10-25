"""Kośa search data → website/ko/. usage: python3 kosha_build.py <ashtadhyayi-data dir> <csl-orig dir>"""
import sys, os, re, json
from ixlib import *
A, CSL = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'ko'); os.makedirs(f'{OUT}/mw', exist_ok=True)
# ---- synonym kośas (Amarakośa, Halāyudha, Vaijayantī): verses, words with liṅga and artha, synonym sets
KOS = [('amara', 'amara.json', 'अमरकोशः', 'अमरसिंहः', ['काण्डः', 'वर्गः']), ('halayudha', 'halayudha.json', 'अभिधानरत्नमाला', 'हलायुधः', ['काण्डः']),
       ('vaijayanti', 'yaadavakosha.json', 'वैजयन्ती', 'यादवप्रकाशः', ['काण्डः', 'अध्यायः'])]
meta = []; allwords = {}
for kid, f, title, author, units in KOS:
    d = json.load(open(f'{A}/kosha/{f}'))['data']
    verses = []; words = []; sets = {}; setlist = []
    for vi, e in enumerate(d):
        verses.append([e['num'], e['text']])
        for w in e.get('words', []):
            key = '|'.join(w.get('synonyms') or [w['word']])
            if key not in sets: sets[key] = len(setlist); setlist.append(w.get('synonyms') or [w['word']])
            words.append([w['word'], w.get('linga', ''), w.get('artha', ''), sets[key], vi])
            allwords.setdefault(dev2slp(w['word']), set()).add(kid)
    json.dump(dict(id=kid, title=title, author=author, units=units, verses=verses, words=words, sets=setlist),
              open(f'{OUT}/{kid}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    meta.append(dict(id=kid, title=title, author=author, verses=len(verses), words=len(words)))
    print(kid, len(verses), 'verses', len(words), 'words', len(setlist), 'sets')
# ---- Dhātupāṭha (ashtadhyayi.com data)
d = json.load(open(f'{A}/dhatu/data.txt'))['data']
dh = []
for e in d:
    dh.append([e.get('baseindex', ''), e.get('dhatu', ''), e.get('aupadeshik', ''), e.get('gana', ''), e.get('pada', ''), e.get('settva', ''),
               e.get('artha', ''), e.get('artha_english', ''), e.get('artha_hindi', ''), [[u.get('name', ''), u.get('artha_hindi', '')] for u in e.get('upasargas', []) or []]])
json.dump(dh, open(f'{OUT}/dhatu.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('dhatu', len(dh))
# ---- Monier-Williams headwords with a short gloss (for word lookup and the search by ending)
mw = {}; cur = None; buf = []
def flush():
    if cur and cur not in mw:
        t = ' '.join(buf); t = t.split('¦', 1)[-1]
        t = re.sub(r'<s>(.*?)</s>', lambda m: slp2dev(re.sub(r'[/^\\—]', '', m.group(1))), t)
        t = re.sub(r'<lex>(.*?)</lex>', r'\1', t); t = re.sub(r'<[^>]+>|\{[^}]*\}|\[Page.*?\]', '', t)
        t = re.sub(r'\s+', ' ', t).strip(' ,;')
        mw[cur] = t[:110] + ('…' if len(t) > 110 else '')
for l in open(f'{CSL}/v02/mw/mw.txt', encoding='utf8'):
    if l.startswith('<L>'):
        flush(); m = re.search(r'<k1>([^<]+)', l); cur = m.group(1) if m else None; buf = []
    elif l.startswith('<LEND>'): flush(); cur = None
    else: buf.append(l.strip())
hws = sorted(mw)
shards = {}
for h in hws:
    if not re.fullmatch(r'[a-zA-Z~]+', h): continue
    shards.setdefault('L%02d' % RANK.get(h[0], 99), []).append([h, mw[h]])
for k, rows in shards.items():
    rows.sort(key=lambda r: sortkey(r[0])); json.dump(rows, open(f'{OUT}/mw/{k}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
allh = sorted(set(h for h in mw if re.fullmatch(r'[a-zA-Z]+', h)) | set(w for w in allwords if re.fullmatch(r'[a-zA-Z]+', w)))
rev = sorted(allh, key=lambda h: sortkey(h[::-1]))
json.dump(rev, open(f'{OUT}/rev.json', 'w'), separators=(',', ':'))
json.dump(dict(kosha=meta, dhatu=len(dh), mw=len(mw), rev=len(rev)), open(f'{OUT}/catalog.json', 'w'), ensure_ascii=False)
print('mw', len(mw), 'rev', len(rev))
