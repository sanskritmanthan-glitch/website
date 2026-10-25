"""Chandas information for the metres the engine recognises (used by build.py → sl/metres.json)."""
from skt import MET, ARDHA

GANA = {'LGG': 'य', 'GGG': 'म', 'GGL': 'त', 'GLG': 'र', 'LGL': 'ज', 'GLL': 'भ', 'LLL': 'न', 'LLG': 'स'}
CLASS = ['', 'उक्ता', 'अत्युक्ता', 'मध्या', 'प्रतिष्ठा', 'सुप्रतिष्ठा', 'गायत्री', 'उष्णिक्', 'अनुष्टुभ्', 'बृहती', 'पङ्क्तिः',
         'त्रिष्टुभ्', 'जगती', 'अतिजगती', 'शक्वरी', 'अतिशक्वरी', 'अष्टिः', 'अत्यष्टिः', 'धृतिः', 'अतिधृतिः', 'कृतिः',
         'प्रकृतिः', 'आकृतिः', 'विकृतिः', 'संकृतिः', 'अतिकृतिः', 'उत्कृतिः']


def ganas(pat):
    g = [GANA[pat[i:i + 3]] for i in range(0, len(pat) - len(pat) % 3, 3)]
    g += ['ग' if c == 'G' else 'ल' for c in pat[len(pat) - len(pat) % 3:]]
    return g


# iast name → (Devanagari name, lakṣaṇa (Vṛttaratnākara / Śrutabodha), yati as list of pāda cut points, note)
INFO = {
    'anuṣṭubh': ('अनुष्टुभ् (श्लोकः)', 'श्लोके षष्ठं गुरु ज्ञेयं सर्वत्र लघु पञ्चमम्। द्विचतुष्पादयोर्ह्रस्वं सप्तमं दीर्घमन्ययोः॥', [],
                 'Eight syllables a pāda; fixed only at the 5th–7th syllables, so it is described by rule, not by gaṇas.'),
    'indravajrā': ('इन्द्रवज्रा', 'स्यादिन्द्रवज्रा यदि तौ जगौ गः।', [], ''),
    'upendravajrā': ('उपेन्द्रवज्रा', 'उपेन्द्रवज्रा जतजास्ततो गौ।', [], ''),
    'upajāti': ('उपजातिः', 'अनन्तरोदीरितलक्ष्मभाजौ पादौ यदीयावुपजातयस्ताः।', [],
                'Pādas of indravajrā and upendravajrā mixed in one verse; they differ only in the first syllable.'),
    'vaṃśastha': ('वंशस्थम्', 'जतौ तु वंशस्थमुदीरितं जरौ।', [], ''),
    'indravaṃśā': ('इन्द्रवंशा', 'स्यादिन्द्रवंशा ततजैरसंयुतैः।', [], ''),
    'upajāti (vaṃśastha)': ('उपजातिः (वंशस्थ-इन्द्रवंशयोः)', '', [],
                            'Pādas of vaṃśastha and indravaṃśā mixed in one verse; they differ only in the first syllable.'),
    'drutavilambita': ('द्रुतविलम्बितम्', 'द्रुतविलम्बितमाह नभौ भरौ।', [], ''),
    'toṭaka': ('तोटकम्', 'इह तोटकमम्बुधिसैः प्रथितम्।', [], ''),
    'bhujaṅgaprayāta': ('भुजङ्गप्रयातम्', 'भुजङ्गप्रयातं भवेद्यैश्चतुर्भिः।', [], ''),
    'sragviṇī': ('स्रग्विणी', 'रैश्चतुर्भिर्युता स्रग्विणी सम्मता।', [], ''),
    'rathoddhatā': ('रथोद्धता', 'रान्नराविह रथोद्धता लगौ।', [], ''),
    'svāgatā': ('स्वागता', 'स्वागतेति रनभाद्गुरुयुग्मम्।', [], ''),
    'śālinī': ('शालिनी', 'मात्तौ गौ चेच्छालिनी वेदलोकैः।', [4], ''),
    'vasantatilakā': ('वसन्ततिलका', 'उक्ता वसन्ततिलका तभजा जगौ गः।', [], ''),
    'praharṣiṇī': ('प्रहर्षिणी', 'त्र्याशाभिर्मनजरगाः प्रहर्षिणीयम्।', [3], ''),
    'mañjubhāṣiṇī': ('मञ्जुभाषिणी', 'सजसा जगौ भवति मञ्जुभाषिणी।', [], ''),
    'mālinī': ('मालिनी', 'ननमयययुतेयं मालिनी भोगिलोकैः।', [8], ''),
    'pṛthvī': ('पृथ्वी', 'जसौ जसयला वसुग्रहयतिश्च पृथ्वी गुरुः।', [8], ''),
    'mandākrāntā': ('मन्दाक्रान्ता', 'मन्दाक्रान्ता जलधिषडगैर्म्भौ नतौ ताद्गुरू चेत्।', [4, 10], ''),
    'śikhariṇī': ('शिखरिणी', 'रसै रुद्रैश्छिन्ना यमनसभला गः शिखरिणी।', [6], ''),
    'hariṇī': ('हरिणी', 'रसयुगहयैर्न्सौ म्रौ स्लौ गो यदा हरिणी तदा।', [6, 10], ''),
    'śārdūlavikrīḍita': ('शार्दूलविक्रीडितम्', 'सूर्याश्वैर्मसजस्तताः सगुरवः शार्दूलविक्रीडितम्।', [12], ''),
    'sragdharā': ('स्रग्धरा', 'म्रभ्नैर्यानां त्रयेण त्रिमुनियतियुता स्रग्धरा कीर्तितेयम्।', [7, 14], ''),
    'pramitākṣarā': ('प्रमिताक्षरा', 'प्रमिताक्षरा सजससैरुदिता।', [], ''),
    'mattamayūra': ('मत्तमयूरम्', 'वेदै रन्ध्रैर्म्तौ यसगा मत्तमयूरम्।', [4], ''),
    'rucirā': ('रुचिरा', 'चतुर्ग्रहैरतिरुचिरा जभस्जगाः।', [4], ''),
    'kusumitalatāvellitā': ('कुसुमितलतावेल्लिता', '', [5, 11], ''),
    'aśvadhāṭī': ('अश्वधाटी', '', [], ''),
    'viyoginī': ('वियोगिनी (सुन्दरी)', 'विषमे ससजा गुरुः समे सभरा लोऽथ गुरुर्वियोगिनी।', [],
                 'The syllabic form of the vaitālīya: odd and even pādas differ.'),
    'puṣpitāgrā': ('पुष्पिताग्रा', 'अयुजि नयुगरेफतो यकारो युजि च नजौ जरगाश्च पुष्पिताग्रा।', [], ''),
    'aupacchandasika': ('औपच्छन्दसिकम्', '', [],
                        'A vaitālīya-type metre counted in mātrās: odd pādas 16, even pādas 18, each closing with ra-gaṇa and ya-gaṇa (– ⏑ – ⏑ – –). The pattern shown is one common realisation.'),
    'vegavatī': ('वेगवती', '', [], ''),
    'udgatā': ('उद्गता', '', [],
               'A viṣama-vṛtta: every pāda has its own scheme — 1 sa ja sa la · 2 na sa ja ga · 3 bha na ja la ga · 4 sa ja sa ja ga.'),
    'āryā': ('आर्या', 'यस्याः पादे प्रथमे द्वादश मात्रास्तथा तृतीयेऽपि। अष्टादश द्वितीये चतुर्थके पञ्चदश साऽऽर्या॥', [],
             'Counted in mātrās, not syllables: 12 + 18 | 12 + 15. Each half is built of four-mātrā gaṇas (⏑⏑⏑⏑, – –, ⏑⏑ –, – ⏑⏑, ⏑ – ⏑); ja-gaṇa (⏑ – ⏑) may not stand in an odd place.'),
    'gīti': ('गीतिः', 'आर्याप्रथमदलोक्तं यदि कथमपि लक्षणं भवेदुभयोः। दलयोः कृतयतिशोभां तां गीतिं गीतवान् भुजङ्गेशः॥', [],
             'Both halves like the first half of the āryā: 12 + 18 | 12 + 18 mātrās.'),
    'upagīti': ('उपगीतिः', '', [], 'Both halves like the second half of the āryā: 12 + 15 | 12 + 15 mātrās.'),
    'udgīti': ('उद्गीतिः', '', [], 'The āryā with its halves reversed: 12 + 15 | 12 + 18 mātrās.'),
    'āryāgīti': ('आर्यागीतिः (स्कन्धकम्)', '', [], 'Each half of 32 mātrās: 12 + 20 | 12 + 20.'),
}
JATIM = {'āryā': (12, 18, 12, 15), 'gīti': (12, 18, 12, 18), 'upagīti': (12, 15, 12, 15), 'udgīti': (12, 15, 12, 18), 'āryāgīti': (12, 20, 12, 20)}
UDGATA = ['LLGLGLLLGL', 'LLLLLGLGLG', 'GLLLLLLGLLG', 'LLGLGLLLGLGLG']


def info(name):
    dev, lak, yati, note = INFO.get(name, (name, '', [], ''))
    d = dict(iast=name, dev=dev, lak=lak, note=note, yati=yati)
    if name == 'anuṣṭubh':
        d.update(kind='वर्णवृत्तम्', sub='समवृत्तम् (श्लोकः)', syl=[8], cls='अनुष्टुभ्',
                 rule=[['x', 'x', 'x', 'x', 'L', 'G', 'G', 'x'], ['x', 'x', 'x', 'x', 'L', 'G', 'L', 'x']])
        return d
    if name in JATIM:
        d.update(kind='मात्रावृत्तम् (जातिः)', sub='आर्यावर्गः', mat=list(JATIM[name]))
        return d
    if name == 'aupacchandasika':
        o, e = ARDHA[name]
        d.update(kind='मात्रावृत्तम् (वैतालीयवर्गः)', sub='अर्धसमवृत्तम्', mat=[16, 18, 16, 18],
                 pads=[[o, ganas(o)], [e, ganas(e)]])
        return d
    if name == 'udgatā':
        d.update(kind='वर्णवृत्तम्', sub='विषमवृत्तम्', syl=[len(p) for p in UDGATA], pads=[[p, ganas(p)] for p in UDGATA])
        return d
    if name in ARDHA:
        o, e = ARDHA[name]
        d.update(kind='वर्णवृत्तम्', sub='अर्धसमवृत्तम्', syl=[len(o), len(e)], pads=[[o, ganas(o)], [e, ganas(e)]])
        return d
    if name == 'upajāti':
        a, b = MET['indravajrā'], MET['upendravajrā']
        d.update(kind='वर्णवृत्तम्', sub='समवृत्तम् (मिश्रम्)', syl=[11], cls=CLASS[11], pads=[[a, ganas(a)], [b, ganas(b)]],
                 padlab=['इन्द्रवज्रा', 'उपेन्द्रवज्रा'])
        return d
    if name == 'upajāti (vaṃśastha)':
        a, b = MET['vaṃśastha'], MET['indravaṃśā']
        d.update(kind='वर्णवृत्तम्', sub='समवृत्तम् (मिश्रम्)', syl=[12], cls=CLASS[12], pads=[[a, ganas(a)], [b, ganas(b)]],
                 padlab=['वंशस्थम्', 'इन्द्रवंशा'])
        return d
    if name in MET:
        p = MET[name]
        d.update(kind='वर्णवृत्तम्', sub='समवृत्तम्', syl=[len(p)], cls=CLASS[len(p)] if len(p) < len(CLASS) else '', pads=[[p, ganas(p)]])
    return d
