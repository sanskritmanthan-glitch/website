"""Build the mantra corpus (Ṛgveda, Atharvaveda, Sāmaveda, Upaniṣads). usage: python3 mantra_ingest.py <GRETIL 1_sanskr dir> <vishvAsa repos dir>"""
import sys, re, os, glob
from ixlib import *
G, VS = sys.argv[1], sys.argv[2]
DIG = str.maketrans('०१२३४५६७८९', '0123456789')
TD = str.maketrans('0123456789', '०१२३४५६७८९')
def m_of(p): return verse_metre(verse_pats(p)) if 2 <= len(p) <= 6 else ''
VED = {(8, 8, 8): 'v:gāyatrī', (8, 8, 8, 8): 'v:anuṣṭubh', (11, 11, 11, 11): 'v:triṣṭubh', (12, 12, 12, 12): 'v:jagatī', (8, 8, 12): 'v:uṣṇih',
       (12, 8, 8): 'v:uṣṇih', (8, 8, 12, 8): 'v:bṛhatī', (8, 8, 8, 12): 'v:bṛhatī', (12, 8, 8, 8): 'v:bṛhatī', (12, 8, 12, 8): 'v:satobṛhatī',
       (8, 8, 8, 8, 8): 'v:paṅkti', (11, 11, 11): 'v:virāj', (12, 12, 12): 'v:virāj', (11, 11): 'v:dvipadā', (8, 8): 'v:dvipadā'}
def vedic(lines):
    lines = [re.sub('ḷ(?=[aāiīuūṛeoh])', 'ḻ', clean_iast_line(l)).strip(' |/.') for l in lines if l.strip(' |/.')]   # Vedic ḷ is the consonant ळ
    if not lines: return [], ''
    if any(len(pattern(iast2slp(l))) > 30 for l in lines): return verse_or_prose(lines)   # prose (yajus, brāhmaṇa-like sūktas)
    p = [re.sub(r'(?<=[aAiIuUfFeEoO])x(?=[aAiIuUfFeEoOh])', 'L', join_sandhi(x)) for x in parts_of(lines) if x.strip()]   # Vedic ḷ is the consonant ळ
    c = tuple(len(pattern(x)) for x in p)
    for k, n in VED.items():
        if len(k) == len(c) and all(abs(a - b) <= 1 for a, b in zip(k, c)): return p, n
    return p, ''

# ---- Ṛgveda (Aufrecht, saṃhitā text): one book per maṇḍala
for mf in sorted(glob.glob(f'{G}/1_veda/1_sam/1_rv/rv_[01][0-9]_u.htm')):
    grp = {}; order = []
    for l in read(mf).splitlines():
        m = re.match(r'\s*RV_(\d+)\.(\d+)\.(\d+)\.(\d+)(?:\{\d+\})?\s+(.*)$', l)
        if not m: continue
        k = (int(m.group(2)), int(m.group(3)))
        if k not in grp: grp[k] = []; order.append(k)
        grp[k].append(m.group(5))
    md = int(re.search(r'rv_(\d+)_u', mf).group(1))
    vs = []
    for k in order:
        p, mt = vedic(grp[k]); vs.append(entry(k[0], k[1], p, mt))
    save('mantra', f'rv{md:02d}', 'rgveda', f'मण्डलम् {str(md).translate(TD)}', ['सूक्तम्'], vs)

# ---- Atharvaveda, Śaunaka (unaccented): one book per kāṇḍa
grp = {}; order = []
for l in read(f'{G}/1_veda/1_sam/avs___u.htm').splitlines():
    m = re.match(r'\s*\(AVŚ_(\d+),(\d+)\.(\d+)([a-z]?)\)\s*(.*)$', l)
    if not m: continue
    k = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
    if k not in grp: grp[k] = []; order.append(k)
    grp[k].append(re.sub(r'\|\|?\s*\d*\s*\|*', '', m.group(5)))
books = {}
for k in order:
    p, mt = vedic(grp[k]); books.setdefault(k[0], []).append(entry(k[1], k[2], p, mt))
for kd, vs in books.items(): save('mantra', f'av{kd:02d}', 'atharvaveda', f'काण्डम् {str(kd).translate(TD)}', ['सूक्तम्'], vs)

# ---- Sāmaveda, Kauthuma: one book per ārcika; chapter = prapāṭhaka.ardha; verse = running number
grp = {}; order = []
for l in read(f'{G}/1_veda/1_sam/samavedu.htm').splitlines():
    m = re.match(r'\s*(\d)\s+(\d+)\s+(\d)\s+(\d\d)(\d\d)([a-f])\s+(.*)$', l)
    if not m: continue
    k = tuple(int(m.group(i)) for i in range(1, 6))
    if k not in grp: grp[k] = []; order.append(k)
    t = m.group(7); n = re.search(r'\.\.\s*(\d+)', t)
    grp[k].append(re.sub(r'\.\.?\s*\d*', '', t).replace('3', ''))
    if n: grp[k] = grp[k]; grp[(k, 'n')] = int(n.group(1))
ARC = {1: 'पूर्वार्चिकः', 2: 'आरण्यकपर्व', 3: 'महानाम्न्यार्चिकः', 4: 'उत्तरार्चिकः'}
books = {}
for k in order:
    p, mt = vedic(grp[k]); n = grp.get((k, 'n')) or len(books.get(k[0], [])) + 1
    books.setdefault(k[0], []).append(entry(f'{k[1]}.{k[2]}', n, p, mt))
for a, vs in books.items(): save('mantra', f'sv{a}', 'samaveda', ARC.get(a, f'आर्चिकः {a}'), ['प्रपाठकः', 'अर्धः'], vs)

# ---- Upaniṣads (GRETIL, IAST with verse markers)
def fullnum(vid):
    n = [int(x) for x in re.findall(r'\d+', vid.split('_', 1)[-1])]
    return ('.'.join(map(str, n[:-1])) or '1', n[-1]) if n else None
ingest.numid = fullnum
ingest.parts_of = lambda lines: verse_or_prose([clean_iast_line(l) for l in lines])[0]
UP = [('isup___u', 'isha', 'ईशोपनिषत्', []), ('kathop_u', 'katha', 'कठोपनिषत्', ['अध्यायः', 'वल्ली']), ('prasup_u', 'prashna', 'प्रश्नोपनिषत्', ['प्रश्नः']),
      ('mandup_u', 'mandukya', 'माण्डूक्योपनिषत्', []), ('aitup__u', 'aitareya', 'ऐतरेयोपनिषत्', ['अध्यायः', 'खण्डः']),
      ('chup___u', 'chandogya', 'छान्दोग्योपनिषत्', ['प्रपाठकः', 'खण्डः']), ('brup___u', 'brihadaranyaka', 'बृहदारण्यकोपनिषत्', ['अध्यायः', 'ब्राह्मणम्']),
      ('svetu_pu', 'shvetashvatara', 'श्वेताश्वतरोपनिषत्', ['अध्यायः']), ('kaivup_u', 'kaivalya', 'कैवल्योपनिषत्', []),
      ('brbiuppu', 'brahmabindu', 'ब्रह्मबिन्दूपनिषत्', []), ('ndbiuppu', 'nadabindu', 'नादबिन्दूपनिषत्', []), ('garbhupu', 'garbha', 'गर्भोपनिषत्', []),
      ('sirup_u', 'atharvashiras', 'अथर्वशिरउपनिषत्', [])]
for f, bid, title, units in UP:
    rows = ingest.gretil(read(f'{G}/1_veda/4_upa/{f}.htm'))
    if rows and all(r[0] == '1' for r in rows) and units:
        sec, last, fx = 1, 0, []
        for _, v, p in rows:
            if v <= last: sec += 1
            fx.append((str(sec), v, p)); last = v
        rows = fx
    if bid == 'katha':   # six vallīs → adhyāya.vallī
        rows = [(f'{(int(s)-1)//3+1}.{(int(s)-1)%3+1}' if '.' not in s else s, v, p) for s, v, p in rows]
    save('mantra', bid, bid, title, units, [entry(s, v, p, m_of(p)) for s, v, p in rows])

# ---- Taittirīya (GRETIL TEI edition: mūla paragraphs only)
s = open(f'{G}/../corpustei/transformations/html/sa_taittirIyopaniSad-zaMkarabhASya.htm', encoding='utf8').read()
vs = []
for m in re.finditer(r'<p id="TaittU_([\d.,]+)">(.*?)</p>', s, re.S):
    n = [int(x) for x in re.findall(r'\d+', m.group(1))]
    t = html.unescape(re.sub(r'<span class="ref">.*?</span>|<[^>]+>', '', m.group(2)))
    t = re.sub(r'\biti [^/]*?(adhyāye|vallyām|anuvākaḥ)[^/]*', '', t)
    segs = [x for x in re.split(r'/+', re.sub(r'\s+', ' ', t)) if x.strip()]
    p, mt = verse_or_prose(segs)
    vs.append(entry(str(n[0]), n[1], p, mt))
save('mantra', 'taittiriya', 'taittiriya', 'तैत्तिरीयोपनिषत्', ['वल्ली'], vs)

# ---- Kena, Muṇḍaka (vishvAsa / sanskritdocuments Devanagari)
def devtext(path, sections):
    t = open(path, encoding='utf8').read().split('---', 2)[-1]
    out = []; sec, last = 1, 0
    for blk in re.split(r'॥\s*([०-९\d]+)\s*॥', t)[:-1:2], re.split(r'॥\s*([०-९\d]+)\s*॥', t)[1::2]:
        pass
    parts = re.split(r'॥\s*([०-९\d]+)\s*॥', t)
    for body, num in zip(parts[0::2], parts[1::2]):
        v = int(num.translate(DIG))
        if v <= last: sec += 1
        last = v
        body = re.split(r'\n\s*\n', body.strip())[-1]
        lines = [l.strip(' ।॥') for l in body.splitlines() if l.strip() and not re.search(r'खण्डः|उपनिषत्|शान्तिः|श्रीः|॥', l)]
        segs = []
        for l in lines: segs += [x for x in re.split(r'।', l) if x.strip()]
        p, mt = dev_or_prose(segs)
        out.append(entry(sections(sec), v, p, mt))
    return out
KN = f'{VS}/vs_vedAH_sAma/jaiminIyam/AraNyakam/upaniShad-brAhmaNam/04/10_kenopaniShat/mUlam.md'
save('mantra', 'kena', 'kena', 'केनोपनिषत्', ['खण्डः'], devtext(KN, lambda s: s))
MU = f'{VS}/vs_vedAH/atharva/paippalAdam/muNDakopaniShat/mUlam.md'
save('mantra', 'mundaka', 'mundaka', 'मुण्डकोपनिषत्', ['मुण्डकम्', 'खण्डः'], devtext(MU, lambda s: f'{(s-1)//2+1}.{(s-1)%2+1}'))
