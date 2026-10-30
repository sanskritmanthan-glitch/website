"""Generate one static, indexable page per book (b/<slug>.html) plus a full catalogue (books.html).
Data: /home/claude/site/books.json (built by build3.py) + play_full.json (Partner Center export)."""
import json, re, html, os, unicodedata
from indic_transliteration import sanscript as sc
BASE = 'https://sanskritmanthan.in'
W = '/home/claude/website'
d = json.load(open('/home/claude/site/books.json', encoding='utf8'))
PF = json.load(open('/home/claude/site/play_full.json', encoding='utf8'))
SH = {s['id']: s for s in d['shelves']}
B = d['books']
e = html.escape
LN = {'sa': ('Sanskrit', 'संस्कृतम्'), 'te': ('Telugu', 'తెలుగు'), 'hi': ('Hindi', 'हिन्दी'), 'en': ('English', 'English')}
gid = lambda l: (re.search(r'id=([\w-]+)', l or '') or [None, None])[1]

def iast(t):
    if re.search('[ఀ-౿]', t): return sc.transliterate(t, sc.TELUGU, sc.IAST)
    if re.search('[ऀ-ॿ]', t): return sc.transliterate(t, sc.DEVANAGARI, sc.IAST)
    return t
def slugify(t):
    t = unicodedata.normalize('NFKD', iast(t)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:60] or 'book'

seen = set()
for b in B:
    s = slugify(b['title']) + '-' + b['lang']
    if b.get('vol'): s += f"-{b['vol']}"
    while s in seen: s += '-2'
    seen.add(s); b['slug'] = s
    pf = PF.get(gid(b.get('play'))) or PF.get('t:' + b['title']) or {}
    b['desc'] = pf.get('desc') or ([b['blurbAny']] if b.get('blurbAny') else [])
    b['pages'] = pf.get('pages'); b['date'] = pf.get('date')
    b['iast'] = iast(b['title'])
    sh = SH[b['shelf']]['name']
    b['shelf_en'] = sh['en'][0]; b['shelf_sa'] = sh['sa'][0]

CSS = """:root{--paper:#f6f1e7;--ink:#2b2118;--muted:#6f6152;--line:#ddd2bf;--card:#fffaf1;--saffron:#b4531f;--gold:#a07a2c}
@media (prefers-color-scheme:dark){:root{--paper:#17130f;--ink:#efe5d4;--muted:#b3a591;--line:#3a3128;--card:#211b15;--saffron:#e08a55;--gold:#d2ad62}}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.75 "Tiro Devanagari Sanskrit","Noto Serif Devanagari","Tiro Telugu","Noto Serif Telugu","Spectral",Georgia,serif}
a{color:var(--saffron)}.wrap{max-width:1040px;margin:0 auto;padding:0 16px}
header{border-bottom:1px solid var(--line);padding:10px 0}header .wrap{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.br{display:flex;flex-direction:column;align-items:center;text-decoration:none}.br b{font-size:1.5rem;color:var(--saffron)}.br small{color:var(--gold);font-weight:600}
nav a{margin-left:14px;text-decoration:none;color:var(--muted);font-size:.95rem}
.crumb{font-size:.85rem;color:var(--muted);margin:18px 0 6px}.crumb a{color:var(--muted)}
.bk{display:grid;grid-template-columns:260px 1fr;gap:34px;margin:10px 0 30px}
.bk img{width:100%;border-radius:3px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
h1{font-size:2.2rem;line-height:1.3;margin:0}.ia{color:var(--muted);font-style:italic;margin:2px 0 8px}
.sub{color:var(--saffron);font-size:1.1rem;margin:0 0 10px}.meta{color:var(--muted);font-size:.9rem;margin-bottom:14px}
.btn{display:inline-block;background:var(--saffron);color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;margin:4px 8px 12px 0}
.btn.o{background:none;color:var(--saffron);border:1px solid var(--saffron)}
.ds p{text-align:justify;margin:0 0 12px}h2{font-size:1.3rem;margin:28px 0 10px}
.rel{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:16px}.rel a{text-decoration:none;color:var(--ink);font-size:.9rem}.rel img{width:100%;border-radius:2px;display:block;margin-bottom:4px}
footer{border-top:1px solid var(--line);margin-top:40px;padding:18px 0;color:var(--muted);font-size:.85rem}
.cat h2{border-left:4px solid var(--saffron);padding-left:10px}.cat ul{list-style:none;padding:0;columns:2 300px}.cat li{break-inside:avoid;margin:0 0 8px}.cat small{color:var(--muted)}
@media(max-width:640px){.bk{grid-template-columns:1fr}.bk img{max-width:220px}nav a{margin:0 10px 0 0}}"""
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Telugu&family=Noto+Serif+Telugu:wght@400;600&family=Tiro+Devanagari+Sanskrit&family=Noto+Serif+Devanagari:wght@400;600&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap">'
def head(title, desc, url, img, ld, pre=''):
    return f'''<!doctype html><html lang="sa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{url}">
<meta property="og:type" content="{'book' if ld.get('@type')=='Book' else 'website'}"><meta property="og:site_name" content="Sanskrit Manthan · भारतीयज्ञानपरम्पराकार्यशाला">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="{pre}cv/author.jpg">{FONTS}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script><style>{CSS}</style></head><body>
<header><div class="wrap"><a class="br" href="{pre}index.html"><b>संस्कृतमन्थनम्</b><small>भारतीयज्ञानपरम्पराकार्यशाला</small></a>
<nav><a href="{pre}index.html#library">Library</a><a href="{pre}books.html">All books</a><a href="{pre}shloka.html">Śloka</a><a href="{pre}shastra.html">Śāstras</a><a href="{pre}vyakarana.html">Grammar</a></nav></div></header><main class="wrap">'''
FOOT = lambda pre='': f'</main><footer><div class="wrap">© 2026 Dr. Mantha Srinivasu · <a href="{pre}index.html">sanskritmanthan.in</a> · Indian Knowledge Systems — Sanskrit, Telugu, Hindi, English · Books via Google Play</div></footer></body></html>'

os.makedirs(f'{W}/b', exist_ok=True)
for f in os.listdir(f'{W}/b'):
    if f.endswith('.html'): os.remove(f'{W}/b/{f}')
by_shelf = {}
for b in B: by_shelf.setdefault(b['shelf'], []).append(b)
for b in B:
    url = f"{BASE}/b/{b['slug']}"
    img = f"{BASE}/cv/{b['cover']}.jpg" if b.get('cover') else f'{BASE}/og.jpg'
    en, nat = LN[b['lang']]
    first = ' '.join(b['desc'])[:300]
    desc = re.sub(r'\s+', ' ', first)[:158].rsplit(' ', 1)[0] + '…' if len(first) > 158 else first
    title = f"{b['title']} ({b['iast']}) — {b['shelf_en'].replace('New arrivals · ', '')} · {en} · Sanskrit Manthan"
    ld = {"@context": "https://schema.org", "@type": "Book", "name": b['title'], "alternateName": [b['iast']] + ([b['en']] if b.get('en') and b['en'] != b['title'] else []),
          "author": {"@type": "Person", "name": "Dr. Mantha Srinivasu", "alternateName": ["डॉ. मन्था-श्रीनिवासुः", "డా. మంథా శ్రీనివాసు"], "url": BASE + "/"},
          "inLanguage": b['lang'], "url": url, "image": img, "description": ' '.join(b['desc'])[:1500], "genre": b['shelf_en'].replace('New arrivals · ', ''),
          "isPartOf": {"@type": "WebSite", "name": "Sanskrit Manthan", "url": BASE + "/"}, "bookFormat": "https://schema.org/EBook"}
    if b.get('sub'): ld['alternativeHeadline'] = b['sub']
    if b.get('pages') and str(b['pages']).isdigit(): ld['numberOfPages'] = int(b['pages'])
    if b.get('date'): ld['datePublished'] = b['date']
    if b.get('play'): ld['sameAs'] = b['play']; ld['offers'] = {"@type": "Offer", "url": b['play'], "availability": "https://schema.org/InStock", "seller": {"@type": "Organization", "name": "Google Play"}}
    rel = [x for x in by_shelf[b['shelf']] if x is not b]
    h = head(title, desc, url, img, ld, '../')
    h += f'<div class="crumb"><a href="../index.html">संस्कृतमन्थनम्</a> › <a href="../books.html#{b["shelf"]}">{e(b["shelf_sa"])}</a> › {e(b["title"])}</div>'
    h += f'<div class="bk"><div>' + (f'<img src="../cv/{b["cover"]}.jpg" alt="{e(b["title"])} — cover">' if b.get('cover') else '') + '</div><div>'
    h += f'<h1>{e(b["title"])}</h1><div class="ia">{e(b["iast"])}</div>' + (f'<p class="sub">{e(b["sub"])}</p>' if b.get('sub') else '')
    h += f'<div class="meta">{e(nat)} · {e(en)} · {e(b["shelf_en"].replace("New arrivals · ", ""))}' + (f' · {b["pages"]} pp.' if b.get('pages') else '') + ' · Dr. Mantha Srinivasu</div>'
    h += (f'<a class="btn" href="{b["play"]}" rel="noopener">Google Play</a>' if b.get('play') else '') + f'<a class="btn o" href="../index.html#b-{e(b["id"])}">Library</a>'
    h += '<div class="ds">' + ''.join(f'<p>{e(p)}</p>' for p in b['desc']) + '</div></div></div>'
    if rel:
        h += f'<h2>{e(b["shelf_sa"])} · {e(b["shelf_en"].replace("New arrivals · ", ""))}</h2><div class="rel">' + ''.join(
            f'<a href="{x["slug"]}.html">' + (f'<img src="../cv/{x["cover"]}.jpg" alt="" loading="lazy">' if x.get('cover') else '') + f'{e(x["title"])}<br><small>{LN[x["lang"]][0]}</small></a>' for x in rel) + '</div>'
    open(f'{W}/b/{b["slug"]}.html', 'w', encoding='utf8').write(h + FOOT('../'))

# catalogue
ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "All books · Sanskrit Manthan", "url": BASE + "/books",
      "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{BASE}/b/{b['slug']}", "name": b['title']} for i, b in enumerate(B)]}}
h = head('All books — Sanskrit, IKS, Purāṇa, Rāmāyaṇa, Mahābhārata, Śāstra, Kāvya · Sanskrit Manthan',
         f'Catalogue of {len(B)} books of Sanskrit Manthan, a workshop of Indian Knowledge Systems: Sung Mahāpurāṇas, Rāmāyaṇa and Mahābhārata, IKS education compendia, śāstra-, vyākaraṇa- and nāṭya-kāvyas, stotras and lexicons in Sanskrit, Telugu, Hindi and English.',
         BASE + '/books', BASE + '/og.jpg', ld)
h += f'<div class="cat"><h1>ग्रन्थसूची · All books</h1><p>{len(B)} books in Sanskrit, Telugu, Hindi and English — each with its own page, description and Google Play link.</p>'
for sid, s in SH.items():
    lst = by_shelf.get(sid)
    if not lst: continue
    h += f'<h2 id="{sid}">{e(s["name"]["sa"][0])} · {e(s["name"]["en"][0])}</h2><p><small>{e(s["name"]["en"][1])}</small></p><ul>' + ''.join(
        f'<li><a href="b/{b["slug"]}.html">{e(b["title"])}</a> <small>({e(b["iast"])}) · {LN[b["lang"]][0]}' + (f' — {e(b["sub"][:90])}' if b.get('sub') else '') + '</small></li>' for b in lst) + '</ul>'
open(f'{W}/books.html', 'w', encoding='utf8').write(h + '</div>' + FOOT())
json.dump({b['id']: b['slug'] for b in B}, open('/home/claude/site/slugs.json', 'w'), ensure_ascii=False)
print('book pages', len(B))
