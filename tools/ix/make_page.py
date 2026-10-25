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
    for n in sys.argv[1:]: build(n)
    engine(); nav(); print('pages written')
