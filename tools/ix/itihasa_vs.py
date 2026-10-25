"""Purāṇas from the vishvAsa markdown texts (Devanagari). usage: python3 itihasa_vs.py <vishvAsa dir> [only works]"""
import sys, re, os, glob
from ixlib import *
VS = sys.argv[1]; ONLY = set(sys.argv[2:])
DIG = str.maketrans('०१२३४५६७८९', '0123456789')
def fnum(path):
    m = re.match(r'(\d+)', os.path.basename(path)); return int(m.group(1)) if m else None
HEAD = re.compile(r'वर्णन|कथन|माहात्म्य|पुराणम्|परिष्करणीय|विभागः|खण्डः|आख्यान|निरूपण|^अथ\s|प्रारम्भः|समाप्त')
def scans(lines):
    segs = [re.sub(r'[^ऀ-ॿ ]', '', x).strip() for l in lines for x in re.split(r'[।|]', l) if re.search(r'[क-ह]', x)]
    return bool(dev_or_prose(segs)[1]) if segs else False
def md_verses(path):
    t = open(path, encoding='utf8').read()
    t = re.sub(r'(?s)^(---|\+\+\+).*?\1', '', t)
    if '<summary>मूलम्</summary>' in t:
        blocks = re.findall(r'(?s)<summary>मूलम्</summary>(.*?)</details>', t)
    else:
        t = re.sub(r'(?s)<details[^>]*>\s*<summary>[^<]*</summary>', '', t).replace('</details>', '')
        # verse ends: ॥ n ॥, or ॥ n at the end of a line (some chapters omit the closing daṇḍa)
        parts = re.split(r'॥[ \t]*(?:[^॥\n]{0,24}?[ \t]*॥|[०-९\d][०-९\d.\-]*[ \t]*(?=\n|$))', t)
        blocks = parts[:-1]
    out = []
    for b in blocks:
        b = re.sub(r'\+\+\+\(.*?\)\+\+\+|<[^>]+>|\{[^}]*\}|\[[^\]]*\]', '', b)
        lines = [l.strip(' >*_') for l in b.splitlines() if l.strip()]
        lines = [l for l in lines if not re.search(r'उवाच\s*[।॥]?\s*$|अध्यायः|^ॐ|^श्री.{0,20}नमः|^\d+$', l)]
        if not lines: continue
        if not out:   # chapter headings in front of the first verse (क्षीरोदमथनवर्णनम्, श्रीगरुडमहापुराणम् २३ …)
            while len(lines) > 1 and len(lines[0].split()) <= 4 and ((HEAD.search(lines[0]) and len(lines[0].split()) <= 3) or (not scans(lines) and scans(lines[1:]))): lines = lines[1:]
        segs = []
        for l in lines: segs += [x for x in re.split(r'[।|]', l) if re.search(r'[क-ह]', x)]
        p, m = dev_or_prose([re.sub(r'[^ऀ-ॿ ]', '', x).strip() for x in segs])
        if p: out.append((p, m))
    return out
def book(work, bid, title, units, files, num=None, chapter=fnum):
    vs = []; used = set()
    for f in sorted(files):
        if os.path.basename(f) == '_index.md': continue
        c = chapter(f)
        if c is None or c in used: continue
        used.add(c)
        for i, (p, m) in enumerate(md_verses(f), 1): vs.append(entry(c, i, p, m))
    if vs: save('itihasa', bid, work, title, units, vs, {'num': str(num)} if num else None)
P, V = f'{VS}/vs_purANam', f'{VS}/vs_vai'
def want(w): return not ONLY or w in ONLY
if want('markandeya'): book('markandeya', 'markandeya', 'मार्कण्डेयपुराणम्', ['अध्यायः'], glob.glob(f'{P}/mArkaNDeya-purANam/*.md'))
if want('agni'): book('agni', 'agni', 'अग्निपुराणम्', ['अध्यायः'], glob.glob(f'{P}/agni-purANam/pariShkRtatara-mUlam/*.md'))
if want('matsya'): book('matsya', 'matsya', 'मत्स्यपुराणम्', ['अध्यायः'], glob.glob(f'{V}/matsya-purANam/*.md'))
if want('varaha'): book('varaha', 'varaha', 'वराहपुराणम्', ['अध्यायः'], glob.glob(f'{V}/varAha-purANam/*.md'))
PADMA = ['सृष्टिखण्डम्', 'भूमिखण्डम्', 'स्वर्गखण्डम्', 'ब्रह्मखण्डम्', 'पातालखण्डम्', 'उत्तरखण्डम्']
if want('padma'):
    for k in range(1, 7): book('padma', f'padma{k}', 'padma' and PADMA[k - 1], ['अध्यायः'], glob.glob(f'{V}/padma-purANam/sarva-prastutiH/{k:02d}/*.md'), k)
BVP = ['ब्रह्मखण्डम्', 'प्रकृतिखण्डम्', 'गणपतिखण्डम्', 'श्रीकृष्णजन्मखण्डम्']
if want('brahmavaivarta'):
    for k in range(1, 5): book('brahmavaivarta', f'bvp{k}', BVP[k - 1], ['अध्यायः'], glob.glob(f'{V}/brahma-vaivarta-purANam/{k:02d}/*.md'), k)
HV = {1: 'हरिवंशपर्व', 2: 'विष्णुपर्व', 3: 'भविष्यपर्व'}
if want('harivamsha'):
    for d in sorted(glob.glob(f'{V}/hari-vaMshaH/bhaNDArkar_1969/[0-9]_*')):
        k = int(os.path.basename(d)[0]); book('harivamsha', f'hv{k}', HV.get(k, f'पर्व {k}'), ['अध्यायः'], glob.glob(f'{d}/*.md'), k)
if want('vayu'):
    for k in (1, 2):
        book('vayu', f'vayu{k}', ['पूर्वार्धम्', 'उत्तरार्धम्'][k - 1], ['अध्यायः'], glob.glob(f'{P}/vAyu-purANam/dvi-khaNDa-saMskaraNam/{k}/**/*.md', recursive=True), k)
SIVA = {1: 'विद्येश्वरसंहिता', 2: 'रुद्रसंहिता', 7: 'वायवीयसंहिता'}
if want('shiva'):
    for d in sorted(glob.glob(f'{P}/shaivam/shiva-purANam/[0-9]_*')):
        k = int(os.path.basename(d)[0]); fs = glob.glob(f'{d}/**/*.md', recursive=True)
        # chapters within sub-khaṇḍas: number them khaṇḍa.adhyāya
        def ch(f, d=d):
            rel = os.path.relpath(f, d).split(os.sep); n = [int(re.match(r'\d+', x).group()) for x in rel if re.match(r'\d+', x)]
            return '.'.join(map(str, n)) if n else None
        book('shiva', f'shiva{k}', SIVA.get(k, f'संहिता {k}'), ['खण्डः', 'अध्यायः'] if k == 2 else ['अध्यायः'], fs, k, chapter=ch)
if want('devibhagavata'):
    def ch(f):
        rel = os.path.relpath(f, f'{P}/shAktam/devI-bhAgavatam').split(os.sep); n = [int(re.match(r'\d+', x).group()) for x in rel if re.match(r'\d+', x)]
        return '.'.join(map(str, n)) if len(n) >= 2 else None
    fs = glob.glob(f'{P}/shAktam/devI-bhAgavatam/**/*.md', recursive=True)
    for k in range(1, 13):
        sub = [f for f in fs if (ch(f) or '').startswith(f'{k}.')]
        if sub: book('devibhagavata', f'dbh{k:02d}', f'स्कन्धः {k}', ['अध्यायः'], sub, k, chapter=lambda f: (ch(f) or '').split('.', 1)[-1] or None)
SKANDA = ['माहेश्वरखण्डः', 'वैष्णवखण्डः', 'ब्रह्मखण्डः', 'काशीखण्डः', 'अवन्तीखण्डः', 'नागरखण्डः', 'प्रभासखण्डः', 'अम्बिकाखण्डः', 'हिमवत्खण्डः']
if want('skanda'):
    for d in sorted(glob.glob(f'{P}/skanda-purANam/sarva-prastutiH/[0-9][0-9]_*')):
        k = int(os.path.basename(d)[:2]); fs = glob.glob(f'{d}/**/*.md', recursive=True)
        def ch(f, d=d):
            rel = os.path.relpath(f, d).split(os.sep); n = [int(re.match(r'\d+', x).group()) for x in rel if re.match(r'\d+', x)]
            return '.'.join(map(str, n)) if n else None
        nested = any(os.sep in os.path.relpath(f, d) for f in fs)
        book('skanda', f'skanda{k}', SKANDA[k - 1], ['भागः', 'अध्यायः'] if nested else ['अध्यायः'], fs, k, chapter=ch)
