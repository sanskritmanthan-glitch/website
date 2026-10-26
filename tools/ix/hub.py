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
def shastra():
    h = head('शास्त्राणि · Śāstra Indexes', 'Alphabetical indexes and search of the śāstras of Indian knowledge systems: Dharmaśāstra, Arthaśāstra, Āyurveda, Rasaśāstra, Gaṇita–Jyotiṣa, Nāṭya and Alaṅkāra, with pages prepared for Vāstu–Śilpa, Saṅgīta and other disciplines.')
    h = h.replace('</style>', '.cd ul{font-family:var(--la);font-size:.85rem;margin:6px 0 8px 1.1em;padding:0;color:var(--muted)}.cd ul a{color:var(--saffron)}.cd .ok{color:var(--gold);font-size:.85rem;font-family:var(--la)}</style>')
    h += header() + '''<h1>शास्त्राणि</h1><p class="sub">Śāstra Indexes · the technical literature of Indian knowledge systems — one searchable alphabetical index for each discipline, every sūtra and every pāda</p>'''
    h += '<h2 class="sec">अन्वेषणयोग्याः · searchable now</h2><div class="cards">'
    for href, d, dev, en, desc in [
        ('dharma.html', 'dh', 'धर्मशास्त्रम्', 'Dharmaśāstra', 'Dharmasūtras of Āpastamba, Baudhāyana, Gautama, Vasiṣṭha and Vaikhānasa; the smṛtis of Manu, Yājñavalkya, Nārada, Parāśara, Viṣṇu, Kātyāyana, Bṛhaspati, Āṅgirasa and Yama; gṛhya and śrauta sūtras.'),
        ('artha.html', 'ak', 'अर्थशास्त्रम् · कामशास्त्रम्', 'Arthaśāstra · Kāmaśāstra', 'Kauṭilya’s Arthaśāstra in its fifteen adhikaraṇas; Vātsyāyana’s Kāmasūtra, Pañcasāyaka and Smaradīpikā.'),
        ('ayurveda.html', 'ay', 'आयुर्वेदः', 'Āyurveda', 'Carakasaṃhitā (selected adhyāyas), Aṣṭāṅgahṛdaya Sūtrasthāna, the nighaṇṭus (Rājanighaṇṭu, Aṣṭāṅganighaṇṭu), Bhāvaprakāśa, Annapānavidhi, Yogaśataka.'),
        ('rasa.html', 'rs', 'रसशास्त्रम्', 'Rasaśāstra · Indian alchemy and chemistry', 'Rasārṇava, Rasahṛdayatantra, Rasendracūḍāmaṇi, Rasaratnākara, Ānandakanda, Rasaratnasamuccaya and other texts on mercury, minerals and metals.'),
        ('jyotisha.html', 'jy', 'गणितम् · ज्योतिषम्', 'Gaṇita · Jyotiṣa', 'Śulbasūtra, Āryabhaṭīya, Brāhmasphuṭasiddhānta, Līlāvatī, Bījagaṇita, Vedāṅgajyotiṣa, Sūryasiddhānta, and Varāhamihira’s Bṛhatsaṃhitā, Bṛhajjātaka and yātrā texts.'),
        ('sahitya.html', 'kv', 'नाट्यशास्त्रम् · अलङ्कारशास्त्रम्', 'Nāṭya · Alaṅkāra · Chandas', 'Bharata’s Nāṭyaśāstra, Daśarūpaka, Nāṭakacandrikā; Bhāmaha, Daṇḍin, Vāmana, Udbhaṭa, Ānandavardhana, Mammaṭa, Jayadeva, Viśvanātha; Vṛttaratnākara.')]:
        h += card(href, dev, en, desc, d)
    h += '''<a class="cd" href="sutra.html"><h2>दर्शनानि · व्याकरणम् · योगः</h2><div class="en">Darśana · Vyākaraṇa · Yoga</div><p>The sūtras and kārikās of the darśanas, Pāṇini’s Aṣṭādhyāyī, Vākyapadīya, Yogasūtra and Haṭhayogapradīpikā are in the Sūtra Index.</p><div class="ct">सूत्राणि ›</div></a>'''
    h += '''<a class="cd" href="mantra.html"><h2>वेदः · उपनिषदः</h2><div class="en">Veda · Upaniṣad</div><p>Ṛgveda, Atharvaveda, Sāmaveda and the principal Upaniṣads, pāda by pāda, in the Mantra Index; metres in the Chandas finder.</p><div class="ct">मन्त्राः ›</div></a>'''
    h += '</div><h2 class="sec">ग्रन्थाः प्रतीक्ष्यन्ते · texts awaited</h2><p class="hint">These pages are prepared; their texts are not yet available in a clean digital form. Texts will be added as they are provided — where a related portion already exists elsewhere on the site, it is linked.</p><div class="cards">'
    for dev, en, want, have in [
        ('वास्तुशास्त्रम् · शिल्पशास्त्रम्', 'Vāstu · Śilpa · Architecture and sculpture', 'Mayamata, Mānasāra, Samarāṅgaṇasūtradhāra, Aparājitapṛcchā, Viśvakarmaprakāśa, Kāśyapaśilpa, Śilparatna, Vāstuvidyā',
         [('jyotisha.html#brihatsamhita/52', 'Bṛhatsaṃhitā 52 · vāstuvidyā'), ('jyotisha.html#brihatsamhita/55', 'Bṛhatsaṃhitā 55 · prāsādalakṣaṇa'), ('jyotisha.html#brihatsamhita/57', 'Bṛhatsaṃhitā 57 · pratimālakṣaṇa'), ('kautilya', '')]),
        ('सङ्गीतशास्त्रम्', 'Saṅgīta · Music', 'Saṅgītaratnākara, Bṛhaddeśī, Dattilam, Saṅgītamakaranda, Saṅgītadarpaṇa, Svaramelakalānidhi, Caturdaṇḍīprakāśikā',
         [('sahitya.html#natyashastra/28', 'Nāṭyaśāstra 28 · ātodya'), ('sahitya.html#natyashastra/29', 'Nāṭyaśāstra 29 · jāti'), ('sahitya.html#natyashastra/33', 'Nāṭyaśāstra 33 · gāna')]),
        ('कृषिशास्त्रम् · वृक्षायुर्वेदः', 'Kṛṣi · Vṛkṣāyurveda · Agriculture and plant science', 'Kṛṣiparāśara, Vṛkṣāyurveda (Surapāla), Upavanavinoda, Kāśyapīyakṛṣisūkti',
         [('jyotisha.html#brihatsamhita/54', 'Bṛhatsaṃhitā 54 · vṛkṣāyurveda'), ('jyotisha.html#brihatsamhita/53', 'Bṛhatsaṃhitā 53 · dakārgala (finding water)')]),
        ('रत्नशास्त्रम्', 'Ratnaśāstra · Gemmology', 'Ratnaparīkṣā (Buddhabhaṭṭa), Agastimata, Navaratnaparīkṣā, Ratnasaṅgraha', []),
        ('धनुर्वेदः · नीतिशास्त्रम्', 'Dhanurveda · Nīti · Polity and warfare', 'Dhanurveda (Vasiṣṭha), Kāmandakīya Nītisāra, Śukranīti, Nītivākyāmṛta, Yuktikalpataru',
         [('artha.html', 'Kauṭilya’s Arthaśāstra')]),
        ('पाकशास्त्रम् · पशु-हस्त्यश्वायुर्वेदः', 'Pāka · Mṛga-, Hasti- and Aśva-āyurveda', 'Kṣemakutūhala, Bhojanakutūhala, Pākadarpaṇa; Hastyāyurveda (Pālakāpya), Aśvaśāstra (Nakula), Mṛgapakṣiśāstra',
         [('ayurveda.html#annapanavidhi', 'Annapānavidhi')]),
        ('शिक्षा · निरुक्तम्', 'Śikṣā · Nirukta · Phonetics and etymology', 'Pāṇinīya Śikṣā, Yājñavalkya Śikṣā, Ṛgveda Prātiśākhya, Yāska’s Nirukta, Nighaṇṭu', [('kosha.html', 'Kośa search')]),
        ('आगमः · तन्त्रम्', 'Āgama · Tantra', 'Śaiva and Vaiṣṇava āgamas, Pāñcarātra saṃhitās, Tantrāloka, Śāradātilaka, Prapañcasāra', [('sutra.html', 'Śivasūtra, Spandakārikā, Pratyabhijñā in the Sūtra Index')]),
    ]:
        links = ''.join(f'<li><a href="{u}">{t}</a></li>' for u, t in have if t)
        h += f'<div class="cd wait"><h2>{dev}</h2><div class="en">{en}</div><p><b>Texts wanted:</b> {want}.</p>' + (f'<div class="ok">Already on the site:</div><ul>{links}</ul>' if links else '') + '<div class="ct">ग्रन्थाः प्रतीक्ष्यन्ते · texts awaited</div></div>'
    h += '</div></div><footer><div class="wrap">Texts from GRETIL (Göttingen) — shown for study and reference. To contribute a text for one of the awaited disciplines, write to the author through <a href="./">sanskritmanthan.in</a>.</div></footer></body></html>'
    open(f'{WEB}/shastra.html', 'w').write(h)
if __name__ == '__main__':
    shastra(); granthalaya(); print('hubs written')
    import sys as _s; _s.path.insert(0, os.path.join(HERE, '..')); import credits; credits.build(); credits.link_footers()

