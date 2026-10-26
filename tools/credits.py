"""Write sources.html — the printed edition and digital source behind every text in the indexes, with licences.
Edition details are read from each GRETIL file's own header."""
import os, re, sys, html, glob, json
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(HERE, 'ix'))
from ixlib import read
ROOT = '/home/claude/corpus/gretil/gretil.sub.uni-goettingen.de/gretil/'
FILES = {}
for d, _, fs in os.walk(ROOT):
    for f in fs:
        if f.endswith('.htm'): FILES.setdefault(f[:-4], os.path.join(d, f))

def tokens(text):
    t = set(re.findall(r"['\"/\s]([a-z0-9_\-]{4,12})(?:\.htm)?['\"\s]", text)) | set(re.findall(r'([a-z0-9_\-]{4,12})\.htm', text))
    return [x for x in t if x in FILES]

SKIPLINE = re.compile(r'gretil|unicode|utf-8|font|browser|diacritic|encoding|accents|word search|ASCII|^%?\s*$|^[a-z ]+\s{2,}\S\s*$|http|For further|For a compre|^and$|^\W+$', re.I)
def header(path):
    L = [l.strip(' %') for l in read(path).split('\n') if l.strip(' %')]
    end = next((i for i, l in enumerate(L) if 'THIS GRETIL TEXT FILE' in l or 'Text converted to Unicode' in l), min(len(L), 30))
    title = L[0] if L else os.path.basename(path)
    keep = []
    for l in L[1:end]:
        l = re.sub(r'^[|=\s]+|[|=\s]+$|ü@', '', l)
        if not l or l == title or SKIPLINE.search(l): continue
        keep.append(l)
        if len(keep) >= 8: break
    return title, keep

def gretil_url(path):
    return 'https://gretil.sub.uni-goettingen.de/gretil/' + os.path.relpath(path, ROOT)

PAGES = [
    ('shloka.html', 'श्लोकान्वेषणम् · Śloka Index', [f'{HERE}/shloka/gretil_texts.tsv']),
    ('sutranveshanam.html', 'सूत्रान्वेषणम् · Sūtra Index', [f'{HERE}/shloka/sutra_texts.tsv']),
    ('mantra.html', 'मन्त्रान्वेषणम् · Mantra Index', [f'{HERE}/ix/mantra_ingest.py']),
    ('itihasa.html', 'इतिहासपुराणम् · Itihāsa–Purāṇa', [f'{HERE}/ix/itihasa_ingest.py']),
    ('subhashita.html', 'सुभाषितम् · Subhāṣita', [f'{HERE}/ix/subhashita_ingest.py']),
]
for c, page, title in [('dharma', 'dharma.html', 'धर्मशास्त्रम् · Dharmaśāstra'), ('artha', 'artha.html', 'अर्थकामौ · Artha–Kāma'),
                       ('ayurveda', 'ayurveda.html', 'आयुर्वेदः · Āyurveda'), ('rasa', 'rasa.html', 'रसशास्त्रम् · Rasaśāstra'),
                       ('jyotisha', 'jyotisha.html', 'गणितज्योतिषम् · Gaṇita–Jyotiṣa'), ('sahitya', 'sahitya.html', 'नाट्यालङ्कारौ · Nāṭya–Alaṅkāra')]:
    src = open(f'{HERE}/ix/shastra_ingest.py').read()
    blk = src[src.index(f"if COLL == '{c}'"):]
    nxt = blk.find('\nif COLL ==', 10); blk = blk[:nxt] if nxt > 0 else blk
    PAGES.append((page, title, blk))
# texts read file-by-file with a numbered pattern: list one representative file each
PATTERNS = {'itihasa.html': ['mbh_01_u', 'ram_01_u', 'bhp_01u'], 'mantra.html': ['rv_01_u', 'rv01_u', 'samaveda', 'avs___u']}

OTHER = {
    'mantra.html': ['Kena and Muṇḍaka Upaniṣads: Devanagari texts of the vishvAsa digital library (github.com/vishvAsa).'],
    'itihasa.html': ['Mārkaṇḍeya, Agni, Matsya, Varāha, Padma, Brahmavaivarta, Vāyu, Devībhāgavata, Skanda Purāṇas and the Harivaṃśa (Bhandarkar 1969 critical text): '
                     'the vishvAsa digital library on GitHub (github.com/vishvAsa/purANam, purANam_vaiShNavam), typed from published editions.'],
}

def section(page, title, srcs):
    text = ''.join(open(s).read() if os.path.exists(str(s)) else s for s in srcs)
    toks = sorted(set(tokens(text) + [p for p in PATTERNS.get(page, []) if p in FILES]))
    rows = []
    for t in toks:
        ti, lines = header(FILES[t])
        rows.append(f'<li><b>{html.escape(ti)}</b> <a href="{gretil_url(FILES[t])}" rel="noopener">GRETIL file</a>'
                    + (f'<div class="ed">{"<br>".join(html.escape(l) for l in lines)}</div>' if lines else '') + '</li>')
    rows += [f'<li>{html.escape(o)}</li>' for o in OTHER.get(page, [])]
    return f'<h2 class="sec" id="{page[:-5]}"><a href="{page}">{title}</a></h2><ul class="src">{"".join(rows)}</ul>'

def build():
    s = open(f'{WEB}/shloka.html').read(); h = s[:s.index('</head>')]
    h = re.sub(r'<title>.*?</title>', '<title>Sources and Licences · Sanskrit Manthan</title>', h)
    h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="The printed editions and digital sources behind the Sanskrit Manthan text indexes, with credits and licences.">', h)
    h = h.replace('</style>', '.src{font-family:var(--la);font-size:.9rem;line-height:1.5;padding-left:1.2em}.src li{margin:8px 0}.src .ed{color:var(--muted);font-size:.82rem;margin-top:2px}'
                  '.sec{font-size:1.15rem;color:var(--gold);margin:30px 0 6px;border-bottom:1px solid var(--line);padding-bottom:4px}.sec a{color:inherit;text-decoration:none}'
                  '.lic{font-family:var(--la);font-size:.95rem;line-height:1.65;max-width:900px}.lic p{margin:8px 0}</style>')
    body = '''<body><header><div class="wrap"><a class="brand" href="./">संस्कृतमन्थनम्</a></div></header><div class="wrap">
<h1>आधारग्रन्थाः · Sources and Licences</h1>
<div class="lic">
<p>The texts of ancient and classical Sanskrit works are the common heritage of all. The indexes on this site — the alphabetical pāda and sūtra indexes, references, metre identification,
cross-references, restored sandhi and the arrangement by work, book and chapter — are prepared by Sanskrit Manthan for free, non-commercial study. The digital texts on which they are built
were typed and edited by the scholars and institutions named below, from the printed editions named below. We gratefully acknowledge their work.</p>
<p><b>GRETIL</b> (Göttingen Register of Electronic Texts in Indian Languages, gretil.sub.uni-goettingen.de): each GRETIL file states that it is for reference purposes and that copyright
and terms of use are as for its source edition. The edition and the person who typed each text are listed below, as given in the GRETIL file.
The Mahābhārata electronic text is © Bhandarkar Oriental Research Institute, Pune (1999), on the basis of the text entered by Muneo Tokunaga et al., revised by John Smith.</p>
<p><b>Dictionaries and grammar data.</b> Monier-Williams Sanskrit–English Dictionary (1899), digital edition of the Cologne Digital Sanskrit Dictionaries (sanskrit-lexicon, Universität zu Köln),
licensed CC BY-SA 4.0; the derived word lists on this site are shared under the same licence. Amarakośa, Abhidhānaratnamālā, Vaijayantī and the Dhātupāṭha: data of ashtadhyayi.com
(github.com/ashtadhyayi-com/data), used with credit as its authors request.</p>
<p><b>Rights-holders.</b> If you hold rights in an edition used here and would like its text credited differently, limited to the first-line index, or removed, please write to
<a href="mailto:sanskritmanthan@gmail.com">sanskritmanthan@gmail.com</a>; we will act promptly.</p>
</div>'''
    for page, title, srcs in PAGES:
        if not os.path.exists(f'{WEB}/{page}'): continue
        body += section(page, title, srcs if isinstance(srcs, list) else [srcs])
    body += '</div><footer><div class="wrap"><a href="./">sanskritmanthan.in</a></div></footer></body></html>'
    open(f'{WEB}/sources.html', 'w').write(h + '</head>\n' + body)

def link_footers():
    """a 'Sources and licences' link in the footer of every index page (idempotent)"""
    pages = [p for p, _, _ in PAGES] + ['granthalaya.html', 'shastra.html', 'kosha.html', 'chandas.html']
    for p in pages:
        f = f'{WEB}/{p}'
        if not os.path.exists(f): continue
        s = open(f).read()
        if 'href="sources.html' in s: continue
        anchor = '#' + p[:-5] if any(p == q for q, _, _ in PAGES) else ''
        s2 = re.sub(r'(<footer><div class="wrap">)', r'\1<a href="sources.html' + anchor + r'">आधारग्रन्थाः · Sources and licences</a> · ', s, count=1)
        if s2 != s: open(f, 'w').write(s2)
if __name__ == '__main__':
    build(); link_footers(); print('sources.html written, footers linked')
