"""Subhāṣita anthologies. usage: python3 subhashita_ingest.py <GRETIL 1_sanskr dir>"""
import sys, re, os, glob, json
from ixlib import *
G = sys.argv[1] + '/5_poetry'
def poetdev(t):
    t = re.sub(r'\(.*', '', t).strip(' -|')
    return slp2dev(iast2slp(t.replace('-', ''))) if t else ''
# ---- Vidyākara: Subhāṣitaratnakośa (poet line before each verse: "aśvaghoṣasya --")
lines = read(f'{G}/5_subhas/vidsrgau.htm').splitlines()
vs = []; buf = []; poet = ''
for l in lines:
    l = l.strip()
    if not l: continue
    m = re.search(r'//\s*VidSrk_(\d+)\.(\d+)', l)
    if m:
        buf.append(l[:m.start()])
        segs = [x for x in re.split(r'[$&%]', ' '.join(buf)) if x.strip()]
        p, mt = verse_or_prose([clean_iast_line(x) for x in segs])
        e = entry(m.group(1), int(m.group(2)), p, mt); e['a'] = poet; vs.append(e); buf = []; poet = ''
        continue
    if re.search(r'--\s*$|^\S[^$&%]{0,60}\|\s*(\(.*\))?\s*$', l) and '$' not in l and '&' not in l:
        poet = poetdev(re.sub(r'--\s*$|\|.*$', '', l)); buf = []; continue
    if '$' in l or '&' in l or '%' in l: buf.append(l)
save('subhashita', 'vidyakara', 'vidyakara', 'सुभाषितरत्नकोशः', ['व्रज्या'], vs)
# ---- Vallabhadeva: Subhāṣitāvalī and the Mahāsubhāṣitasaṃgraha (one line a half-verse; grouped by hundreds)
for f, bid, title in (('valsubhu', 'subhashitavali', 'सुभाषितावलिः'), ('msubhs_u', 'mahasubhashita', 'महासुभाषितसंग्रहः')):
    grp = {}; order = []
    for l in read(f'{G}/5_subhas/{f}.htm').splitlines():
        m = re.match(r'^\s*(?:Subhv|MSS)_(\d+)-(\d)\s+(.*)$', l)
        if not m: continue
        k = int(m.group(1))
        if k not in grp: grp[k] = []; order.append(k)
        grp[k].append(m.group(3))
    vs = []
    for k in order:
        p, mt = verse_or_prose([clean_iast_line(x) for x in grp[k]]); vs.append(entry(str((k - 1) // 100 + 1), k, p, mt))
    save('subhashita', bid, bid, title, ['शतकम्'], vs)
# ---- Rūpa Gosvāmin: Padyāvalī (poet line after each verse: "śrī-dākṣiṇātyasya ||")
t = read(f'{G}/2_kavya/padyavlu.htm')
t = t[t.find('||'):] if '||' in t else t
parts = re.split(r'\|\|\s*(\d+)\s*\|\|', t)
vs = []
for i in range(1, len(parts), 2):
    body = parts[i - 1]; num = int(parts[i])
    ls = [l.strip() for l in body.splitlines() if l.strip()]
    if vs and ls and re.match(r'^[^|]{2,60}\|\|\s*$', ls[0]):
        vs[-1]['a'] = poetdev(ls[0].strip(' |')); ls = ls[1:]
    ls = [l for l in ls if not re.match(r'^[^|]{2,60}\|\|\s*$', l)]
    ls = ls[-4:] if len(ls) > 4 else ls
    if not ls: continue
    p, mt = verse_or_prose([clean_iast_line(x) for x in ls]); e = entry('1', num, p, mt); e['a'] = ''; vs.append(e)
save('subhashita', 'padyavali', 'padyavali', 'पद्यावली', [], vs)
