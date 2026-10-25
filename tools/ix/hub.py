"""Write granthalaya.html (hub of the second family) and shastra.html (hub of the śāstra indexes)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, '..', '..')
def count(d):
    try: c = json.load(open(f'{WEB}/{d}/catalog.json')); return c['total'], len(c['works'])
    except Exception: return None
def head(title, desc):
    s = open(f'{WEB}/shloka.html').read(); h = s[:s.index('</head>')]
    h = re.sub(r'<title>.*?</title>', f'<title>{title} · Sanskrit Manthan</title>', h)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    return h.replace('</style>', """.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:20px 0 40px}
.cd{border:1px solid var(--line);border-radius:14px;background:var(--card);padding:18px 20px;text-decoration:none;color:var(--ink);display:block;transition:transform .15s,border-color .15s}
a.cd:hover{border-color:var(--saffron);transform:translateY(-2px)}
.cd h2{font-weight:400;font-size:1.45rem;margin:0 0 2px}.cd .en{font-family:var(--la);color:var(--muted);font-size:.9rem}
.cd p{font-family:var(--la);font-size:.92rem;color:var(--ink);margin:10px 0 8px;line-height:1.55}
.cd .ct{font-size:.85rem;color:var(--saffron)}.cd.wait{opacity:.8;border-style:dashed}.cd.wait .ct{color:var(--muted)}
.sec{font-size:1.1rem;color:var(--gold);margin:26px 0 0;border-bottom:1px solid var(--line);padding-bottom:4px}
</style>""") + '</head>\n'
def header():
    return '''<body><header><div class="wrap"><a class="brand" href="./">संस्कृतमन्थनम्</a><nav class="seg" aria-label="Index"></nav>
<div class="seg" id="script" role="group" aria-label="Script" style="visibility:hidden"></div></div></header><div class="wrap">'''
def card(href, dev, en, desc, d, wait_note=None):
    c = count(d) if d else None
    if c: return f'<a class="cd" href="{href}"><h2>{dev}</h2><div class="en">{en}</div><p>{desc}</p><div class="ct">{c[0]:,} entries · {c[1]} texts ›</div></a>'
    return f'<div class="cd wait"><h2>{dev}</h2><div class="en">{en}</div><p>{desc}</p><div class="ct">{wait_note or "निर्माणे · in preparation"}</div></div>'
def granthalaya():
    h = head('ग्रन्थालयः · Text Library', 'Searchable alphabetical indexes of Sanskrit literature: Itihāsa–Purāṇa, Subhāṣita anthologies, Kośa dictionaries and the śāstras of Indian knowledge systems.')
    h += header() + '''<h1>ग्रन्थालयः</h1><p class="sub">Text Library · searchable alphabetical indexes of the Itihāsa–Purāṇa, the subhāṣita anthologies, the kośas and the śāstras of Indian knowledge systems</p><div class="cards">'''
    h += card('itihasa.html', 'इतिहासपुराणम्', 'Itihāsa–Purāṇa Index', 'Vyāsa’s Mahābhārata, Harivaṃśa and the Mahāpurāṇas, with Vālmīki’s Rāmāyaṇa: every pāda in varṇamālā order, by parvan, kāṇḍa, skandha and adhyāya.', 'ip')
    h += card('subhashita.html', 'सुभाषितम्', 'Subhāṣita Index', 'The great anthologies of Sanskrit verse, with the poets they name — find where a verse is quoted and to whom it is credited.', 'sb')
    h += card('kosha.html', 'कोशः', 'Kośa · Dictionary Search', 'Amarakośa and the other kośas: synonyms of a word, its varga and gender; dhātu lookup; and search by word ending.', 'ko')
    h += card('shastra.html', 'शास्त्राणि', 'Śāstra Indexes', 'Dharmaśāstra, Āyurveda, Rasaśāstra, Vāstu-Śilpa, Gaṇita-Jyotiṣa, Artha, Nāṭya, Saṅgīta and more — one index page for each discipline.', 'shastra_dummy' if not os.path.exists(f'{WEB}/shastra.html') else None, 'निर्माणे · in preparation') if not os.path.exists(f'{WEB}/shastra.html') else '<a class="cd" href="shastra.html"><h2>शास्त्राणि</h2><div class="en">Śāstra Indexes</div><p>Dharmaśāstra, Āyurveda, Rasaśāstra, Vāstu-Śilpa, Gaṇita-Jyotiṣa, Artha, Nāṭya, Saṅgīta and more — one index page for each discipline.</p><div class="ct">open ›</div></a>'
    h += '</div></div><footer><div class="wrap">Texts from GRETIL (Göttingen) and the vishvAsa digital library, shown for study and reference. · <a href="./">sanskritmanthan.in</a></div></footer></body></html>'
    open(f'{WEB}/granthalaya.html', 'w').write(h)
if __name__ == '__main__':
    granthalaya(); print('hub written')
