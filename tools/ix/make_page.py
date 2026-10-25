"""Write <page>.html for an index collection, ix.js (shared engine) and refresh the index nav on every index page."""
import re, sys, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, '..', '..')
# two separate families of pages, each with its own menu
NAV_A = [('shloka.html', 'श्लोकाः'), ('sutra.html', 'सूत्राणि'), ('mantra.html', 'मन्त्राः'), ('chandas.html', 'छन्दः')]
NAV_B = [('granthalaya.html', 'ग्रन्थालयः'), ('itihasa.html', 'इतिहासपुराणम्'), ('subhashita.html', 'सुभाषितम्'), ('kosha.html', 'कोशः'), ('shastra.html', 'शास्त्राणि')]
PAGES = {
 'mantra': dict(dir='mn', unitWord='mantras', title='मन्त्रान्वेषणम्', en='Mantra Index', tabs=[('works', 'ग्रन्थाः A–Z'), ('metres', 'छन्दांसि')],
   sub='Mantra Index of the Vedas and Upaniṣads · every pāda of Ṛgveda, Atharvaveda and Sāmaveda, every mantra of the principal Upaniṣads, in varṇamālā order',
   ph='अग्निमीळे पुरोहितं · asato ma · ऋग्वेद 10.129.1 · katha 1.2.23 · isha 1',
   hint='Type any part of any mantra in Devanagari, Telugu or Roman (diacritics optional), or a reference: ऋग्वेद 1.1.1 (maṇḍala.sūkta.ṛk), atharva 19.53.1, katha 1.2.23, chandogya 6.8.7, isha 1.',
   desc='Alphabetical pāda index and search for the Vedic Saṃhitās (Ṛgveda, Atharvaveda, Sāmaveda) and the principal Upaniṣads (Īśa, Kena, Kaṭha, Praśna, Muṇḍaka, Māṇḍūkya, Taittirīya, Aitareya, Chāndogya, Bṛhadāraṇyaka, Śvetāśvatara and more), with Vedic metres.',
   foot='Texts: Ṛgveda (Aufrecht), Atharvaveda Śaunaka and Sāmaveda Kauthuma, and the Upaniṣads from GRETIL; Kena and Muṇḍaka from the vishvAsa / sanskritdocuments Devanagari texts. Accents are not shown. Prose passages of the Upaniṣads are indexed by sentence. Vedic metres are recognised by syllable count only.'),
 'itihasa': dict(dir='ip', unitWord='verses', title='इतिहासपुराणान्वेषणम्', en='Itihāsa–Purāṇa Index', tabs=[('works', 'ग्रन्थाः A–Z'), ('metres', 'छन्दांसि')],
   sub='Itihāsa–Purāṇa Index · Vyāsa’s Mahābhārata, Harivaṃśa and the Mahāpurāṇas, with Vālmīki’s Rāmāyaṇa · every pāda in varṇamālā order',
   ph='धर्मक्षेत्रे कुरुक्षेत्रे · tapah svadhyaya · mbh 6.23.1 · bhagavata 1.1.1',
   hint='Choose a text, then type any part of any line in Devanagari, Telugu or Roman, or a reference such as mbh 6.23.47 (parvan.adhyāya.śloka), ramayana 1.1.1, bhagavata 10.29.1, vishnu 1.1.1.',
   desc='Alphabetical pāda index and search for the Mahābhārata, Harivaṃśa, Vālmīki Rāmāyaṇa and the Mahāpurāṇas (Bhāgavata, Viṣṇu, Śiva, Mārkaṇḍeya, Matsya and others).',
   foot='Texts: Mahābhārata and Rāmāyaṇa (critical editions, Pune and Baroda) and the Bhāgavata from GRETIL; the other Purāṇas from the vishvAsa digital texts on GitHub. Numbering follows each source edition.'),
 'subhashita': dict(dir='sb', unitWord='verses', title='सुभाषितान्वेषणम्', en='Subhāṣita Index', tabs=[('works', 'ग्रन्थाः A–Z'), ('metres', 'छन्दांसि')],
   sub='Subhāṣita Index · the great anthologies of Sanskrit verse, every pāda in varṇamālā order, with the poets they name',
   ph='विद्या ददाति विनयं · ayam nijah paro veti · subhashitavali 1',
   hint='Type any part of any verse in Devanagari, Telugu or Roman. Results show which anthology quotes it, and the poet it names.',
   desc='Alphabetical index and search for the Sanskrit subhāṣita anthologies: Subhāṣitaratnakośa, Subhāṣitāvalī, Mahāsubhāṣitasaṃgraha and others, with poet attributions.',
   foot='Texts from GRETIL. Poet names are as given in each anthology; the same verse is often credited to different poets in different anthologies.'),
}
def build(name):
    c = PAGES[name]; s = open(f'{WEB}/shloka.html').read()
    head = s[:s.index('</head>')]
    head = re.sub(r'<title>.*?</title>', f"<title>{c['title']} · {c['en']} · Sanskrit Manthan</title>", head)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{c["desc"]}">', head)
    head = head.replace('</style>', """.prose{font-size:1.08rem;line-height:1.9;text-align:justify}.sarga .prose{font-size:1rem}
.rf2{color:var(--gold);font-size:.95rem;margin-top:4px}a.ml{color:var(--saffron)}
.poet{font-size:1rem;color:var(--saffron);margin:6px 0 0 1.6em}.poet.sm{font-size:.85rem;margin-left:0}
.xr{font-family:var(--la);font-size:.88rem;color:var(--muted);margin-top:10px}.xr b{font-weight:600;color:var(--gold);margin-right:6px}.xr a{color:var(--saffron)}.xr.sm{font-size:.78rem}
</style>""")
    tabs = ''.join(f'<button role="tab" data-tab="{k}" aria-selected="{"true" if i == 0 else "false"}">{v}</button>' for i, (k, v) in enumerate(c['tabs']))
    body = f'''<body>
<header><div class="wrap">
  <a class="brand" href="./">संस्कृतमन्थनम्</a>
  <nav class="seg" aria-label="Index"></nav>
  <div class="seg" id="script" role="group" aria-label="Script">
    <button data-s="dv" aria-pressed="true">देवनागरी</button><button data-s="te" aria-pressed="false">తెలుగు</button><button data-s="la" aria-pressed="false">IAST</button>
  </div>
</div></header>
<div class="wrap">
  <h1>{c['title']}</h1>
  <p class="sub">{c['sub']}</p>
  <div class="bar">
    <input id="q" type="search" placeholder="{c['ph']}" autocomplete="off" aria-label="Search">
    <select id="fw" aria-label="Text"></select>
  </div>
  <div class="hint">{c['hint']}</div>
  <div class="alpha" id="alpha"></div>
  <div class="grid">
    <section class="panel" id="lp"><button class="ph">ग्रन्थाः · Texts <small><span class="tg">▾</span></small></button><div class="pbody" id="texts"></div></section>
    <main id="main"><p class="info" id="info"></p><div id="out"></div></main>
    <section class="panel" id="rp"><button class="ph">अनुक्रमः <small>A–Z · metres <span class="tg">▾</span></small></button>
      <div class="tabs" role="tablist">{tabs}</div><div class="pbody" id="right"></div></section>
  </div>
</div>
<footer><div class="wrap">{c['foot']} · <a href="./">sanskritmanthan.in</a></div></footer>
<script>window.IXC={json.dumps(dict(dir=c['dir'], unitWord=c['unitWord']))};</script>
<script src="ix.js?v=2"></script>
</body>
</html>
'''
    open(f'{WEB}/{name}.html', 'w').write(head + '</head>\n' + body)
def engine():
    s = open(f'{WEB}/shloka.html').read()
    tr = s[s.index("const V={'अ'"):s.index('/* ---------- scansion')]
    open(f'{WEB}/ix.js', 'w').write(open(f'{HERE}/ix_engine.js').read().replace('/*TRANSLIT*/', tr))
def nav():
    for NAV in (NAV_A, NAV_B):
        live = [(f, l) for f, l in NAV if os.path.exists(f'{WEB}/{f}')]
        for f, _ in live:
            p = open(f'{WEB}/{f}').read()
            links = ''.join(f'<a href="{g}"{" aria-current=\"page\"" if g == f else ""}>{l}</a>' for g, l in live)
            p = re.sub(r'<nav class="seg" aria-label="Index">.*?</nav>', f'<nav class="seg" aria-label="Index">{links}</nav>', p, count=1, flags=re.S)
            if 'nav.seg a{' not in p:
                p = p.replace('</style>', 'nav.seg a{padding:4px 12px;font-size:.9rem;text-decoration:none;color:var(--ink)}\nnav.seg a[aria-current="page"]{background:var(--saffron);color:#fff}\n</style>', 1)
            if 'nav.seg{' not in p:
                p = p.replace('</style>', 'nav.seg{flex-wrap:wrap;border-radius:14px}\n</style>', 1)
            open(f'{WEB}/{f}', 'w').write(p)
if __name__ == '__main__':
    for n in sys.argv[1:]:
        if n in PAGES: build(n)
    engine(); nav(); print('pages written')
def kosha_page():
    s = open(f'{WEB}/shloka.html').read(); ch = open(f'{WEB}/chandas.html').read()
    head = s[:s.index('</head>')]
    head = re.sub(r'<title>.*?</title>', '<title>कोशान्वेषणम् · Kośa · Dictionary Search · Sanskrit Manthan</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Sanskrit dictionary search: synonyms from the Amarakośa, Abhidhānaratnamālā and Vaijayantī with gender and source verse; Monier-Williams meanings; words by ending (reverse dictionary); and the Pāṇinian Dhātupāṭha with meanings and upasargas.">', head)
    head = head.replace('</style>', """.narrow{max-width:1100px}
.modes{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.modes button{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:4px 14px;cursor:pointer}
.modes button[aria-pressed="true"]{background:var(--saffron);border-color:var(--saffron);color:#fff}
.syn{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.chip{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:2px 10px;cursor:pointer;font-size:1.05rem}
.chip small{font-size:.7rem;color:var(--muted);margin-left:4px;font-family:var(--la)}.chip.on{border-color:var(--saffron);background:var(--hl)}
.syn.sm .tag{font-size:.8rem}.v.src{font-size:1.05rem;margin-top:6px}
.res.mw li{display:grid;grid-template-columns:minmax(120px,max-content) 1fr;gap:14px;cursor:default}.res.mw .gl{font-family:var(--la);font-size:.92rem;color:var(--ink)}
.ends{display:flex;flex-wrap:wrap;gap:4px}.ends .chip{font-size:.98rem}
.dh{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.card.dk{margin:0}.card.dk h2{font-size:1.4rem}
#mdesc{font-family:var(--la);color:var(--muted);font-size:.85rem;margin:0 0 8px}
</style>""")
    tr = s[s.index("const V={'अ'"):s.index('/* ---------- scansion')]
    i2 = ch[ch.index('const IV='):ch.index('/* ---------- matching')]
    js = open(f'{HERE}/kosha_engine.js').read().replace('/*TRANSLIT*/', tr).replace('/*I2D*/', i2)
    body = '''<body>
<header><div class="wrap">
  <a class="brand" href="./">संस्कृतमन्थनम्</a>
  <nav class="seg" aria-label="Index"></nav>
  <div class="seg" id="script" role="group" aria-label="Script">
    <button data-s="dv" aria-pressed="true">देवनागरी</button><button data-s="te" aria-pressed="false">తెలుగు</button><button data-s="la" aria-pressed="false">IAST</button>
  </div>
</div></header>
<div class="wrap narrow">
  <h1>कोशान्वेषणम्</h1>
  <p class="sub">Kośa · Dictionary Search — synonyms, meanings, words by ending, and the roots of the Dhātupāṭha</p>
  <div class="modes" id="modes"><button data-m="paryaya">पर्यायाः · synonyms</button><button data-m="artha">शब्दार्थः · meaning</button><button data-m="anta">अन्त्यानुक्रमः · by ending</button><button data-m="dhatu">धातवः · roots</button><button data-m="browse">कोशग्रन्थाः · read the kośas</button></div>
  <p id="mdesc"></p>
  <div class="bar"><input id="q" type="search" autocomplete="off" aria-label="Search"><select id="gana" hidden></select><select id="kb" hidden></select><select id="ks" hidden></select></div>
  <p class="hint" id="stats"></p>
  <p class="info" id="info"></p><div id="out"></div>
</div>
<footer><div class="wrap">Data: Amarakośa, Abhidhānaratnamālā, Vaijayantī and the Dhātupāṭha from the ashtadhyayi.com data (github.com/ashtadhyayi-com/data); Monier-Williams from the Cologne Digital Sanskrit Dictionaries (sanskrit-lexicon). Meanings are shortened; see the full dictionaries for detail. · <a href="./">sanskritmanthan.in</a></div></footer>
<script>''' + js + '''</script>
</body>
</html>
'''
    open(f'{WEB}/kosha.html', 'w').write(head + '</head>\n' + body)
if __name__ == '__main__' and 'kosha' in sys.argv: kosha_page(); nav()
