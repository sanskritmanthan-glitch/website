"""Itihāsa–Purāṇa corpus. usage: python3 itihasa_ingest.py <GRETIL 1_sanskr dir> <vishvAsa dir> [only ids...]"""
import sys, re, os, glob
from ixlib import *
G, VS = sys.argv[1], sys.argv[2]; ONLY = set(sys.argv[3:])
DIG = str.maketrans('०१२३४५६७८९', '0123456789'); TD = str.maketrans('0123456789', '०१२३४५६७८९')
ORD = ['प्रथमः', 'द्वितीयः', 'तृतीयः', 'चतुर्थः', 'पञ्चमः', 'षष्ठः', 'सप्तमः', 'अष्टमः', 'नवमः', 'दशमः', 'एकादशः', 'द्वादशः']
def want(w): return not ONLY or w in ONLY
def grouped(text, rx, key, body):
    grp = {}; order = []
    for l in text.splitlines():
        m = rx.match(l.strip())
        if not m: continue
        k = key(m)
        if k is None: continue
        if k not in grp: grp[k] = []; order.append(k)
        grp[k].append(body(m))
    return [(k, grp[k]) for k in order]
def ent(s, v, lines):
    p, m = verse_or_prose([clean_iast_line(x) for x in lines]); return entry(s, v, p, m)
def by_book(rows):   # rows: (book, s, v, lines)
    out = {}
    for b, s, v, lines in rows: out.setdefault(b, []).append(ent(s, v, lines))
    return out
def gretil_full(path):
    ingest.numid = lambda vid: (lambda n: ('.'.join(map(str, n[:-1])) or '1', n[-1]) if n else None)([int(x) for x in re.findall(r'\d+', re.sub(r'Mang\.?', '0.', vid.split('_', 1)[-1]))])
    ingest.parts_of = lambda lines: [clean_iast_line(x) for x in lines]
    return ingest.gretil(read(path))

# ---------------- Mahābhārata (critical edition)
PARVA = ['आदिपर्व', 'सभापर्व', 'आरण्यकपर्व', 'विराटपर्व', 'उद्योगपर्व', 'भीष्मपर्व', 'द्रोणपर्व', 'कर्णपर्व', 'शल्यपर्व', 'सौप्तिकपर्व', 'स्त्रीपर्व',
         'शान्तिपर्व', 'अनुशासनपर्व', 'आश्वमेधिकपर्व', 'आश्रमवासिकपर्व', 'मौसलपर्व', 'महाप्रस्थानिकपर्व', 'स्वर्गारोहणपर्व']
if want('mahabharata'):
    for n in range(1, 19):
        rows = grouped(read(f'{G}/2_epic/mbh/mbh_{n:02d}_u.htm'), re.compile(r'^(\d\d),(\d{3})\.(\d{3})([a-fA-F])[\s<>]+(.*)$'),
                       lambda m: (int(m.group(2)), int(m.group(3))), lambda m: m.group(5))
        save('itihasa', f'mbh{n:02d}', 'mahabharata', PARVA[n - 1], ['अध्यायः'], [ent(k[0], k[1], L) for k, L in rows], {'num': str(n)})
# ---------------- Vālmīki Rāmāyaṇa (critical edition)
KANDA = ['बालकाण्डम्', 'अयोध्याकाण्डम्', 'अरण्यकाण्डम्', 'किष्किन्धाकाण्डम्', 'सुन्दरकाण्डम्', 'युद्धकाण्डम्', 'उत्तरकाण्डम्']
if want('ramayana'):
    for n in range(1, 8):
        rows = grouped(read(f'{G}/2_epic/ramayana/ram_{n:02d}_u.htm'), re.compile(r'^(\d)\.(\d{3})\.(\d{3})([a-f])\s+(.*)$'),
                       lambda m: (int(m.group(2)), int(m.group(3))), lambda m: m.group(5))
        save('itihasa', f'ram{n}', 'ramayana', KANDA[n - 1], ['सर्गः'], [ent(k[0], k[1], L) for k, L in rows], {'num': str(n)})
# ---------------- Bhāgavata
if want('bhagavata'):
    for n in range(1, 13):
        rows = grouped(read(f'{G}/3_purana/bhagp/bhp_{n:02d}u.htm'), re.compile(r'^BhP_(\d\d)\.(\d\d)\.(\d{3})/(\d)\s+(.*)$'),
                       lambda m: (int(m.group(2)), int(m.group(3))), lambda m: m.group(5))
        save('itihasa', f'bhp{n:02d}', 'bhagavata', f'{ORD[n-1]} स्कन्धः', ['अध्यायः'], [ent(k[0], k[1], L) for k, L in rows], {'num': str(n)})
# ---------------- GRETIL purāṇas with // id // markers; first number = book where the text has parts
MARKED = [('vishnu', 'visnup_u', ['अंशः', 'अध्यायः'], 'अंशः'), ('brahmanda', 'brndp1_u brndp2_u brndp3_u', ['भागः', 'अध्यायः'], 'भागः'),
          ('garuda', 'garup1_u garup2_u garup3_u', ['खण्डः', 'अध्यायः'], 'खण्डः'), ('kurma', 'kurmp1_u kurmp2_u', ['विभागः', 'अध्यायः'], 'विभागः'),
          ('linga', 'lip_1_pu lip_2__u', ['भागः', 'अध्यायः'], 'भागः'), ('narada', 'nardp1_u nardp2_u', ['भागः', 'अध्यायः'], 'भागः'),
          ('vamana', 'vamp__u', ['अध्यायः'], None), ('brahma', 'brahmap/brahmppu', ['अध्यायः'], None)]
TITLE = {'vamana': 'वामनपुराणम्', 'brahma': 'ब्रह्मपुराणम्'}
BOOKNAME = {'vishnu': ['प्रथमोंऽशः', 'द्वितीयोंऽशः', 'तृतीयोंऽशः', 'चतुर्थोंऽशः', 'पञ्चमोंऽशः', 'षष्ठोंऽशः'], 'brahmanda': ['पूर्वभागः', 'मध्यमभागः', 'उपसंहारभागः'],
            'garuda': ['पूर्वखण्डः (आचारकाण्डः)', 'उत्तरखण्डः (प्रेतकल्पः)', 'ब्रह्मकाण्डः'], 'kurma': ['पूर्वविभागः', 'उपरिविभागः'], 'linga': ['पूर्वभागः', 'उत्तरभागः'],
            'narada': ['पूर्वभागः', 'उत्तरभागः']}
for w, files, units, bunit in MARKED:
    if not want(w): continue
    books = {}
    for fi, f in enumerate(files.split()):
        for s, v, lines in gretil_full(f'{G}/3_purana/{f}.htm'):
            parts = s.split('.')
            if bunit and len(parts) >= 2: b, s2 = int(parts[0]), '.'.join(parts[1:])
            elif bunit: b, s2 = fi + 1, s
            else: b, s2 = 0, s
            if s2 in ('0', ''): s2 = '0'
            books.setdefault(b, []).append(ent(s2, v, lines))
    for b, vs in books.items():
        if bunit:
            nm = BOOKNAME.get(w, []); save('itihasa', f'{w}{b}', w, nm[b - 1] if b - 1 < len(nm) else f'{bunit} {b}', units[1:], vs, {'num': str(b)})
        else: save('itihasa', w, w, TITLE.get(w, w), units, vs)
# ---------------- Śiva (GRETIL: Vidyeśvara and Vāyavīya saṃhitās; one half-verse a line with a trailing id)
if want('shiva'):
    SIV = {1: 'विद्येश्वरसंहिता', 7: 'वायवीयसंहिता'}
    for f in ('sivap1_u', 'sivap7_u'):
        rows = grouped(read(f'{G}/3_purana/{f}.htm'), re.compile(r'^(.*?)\s*//\s*ŚivP_([\d.,]+?)(?:ab|cd|ef)?/?\s*$'),
                       lambda m: tuple(int(x) for x in re.findall(r'\d+', m.group(2))), lambda m: m.group(1))
        bk = {}
        for k, L in rows:
            if len(k) < 3: continue
            bk.setdefault(k[0], []).append(ent('.'.join(map(str, k[1:-1])), k[-1], L))
        for b, vs in bk.items():
            save('itihasa', f'shiva{b}', 'shiva', SIV.get(b, f'संहिता {b}'), ['खण्डः', 'अध्यायः'] if b == 7 else ['अध्यायः'], vs, {'num': str(b)})
# ---------------- Narasiṃha (upapurāṇa)
if want('narasimha'):
    rows = gretil_full(f'{G}/3_purana/narsippu.htm')
    save('itihasa', 'narasimha', 'narasimha', 'नरसिंहपुराणम्', ['अध्यायः'], [ent(s, v, L) for s, v, L in rows])
