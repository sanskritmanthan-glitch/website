"""Ingest the śāstra collections from GRETIL: python3 shastra_ingest.py dharma|artha|ayurveda|rasa|jyotisha|sahitya [work …]"""
import sys, re
from shastra_lib import *
COLL = sys.argv[1]; ONLY = set(sys.argv[2:])
S6, VD, PO = G + '/6_sastra', G + '/1_veda/5_vedang', G + '/5_poetry'
A = lambda n: ('.'.join(map(str, n[:-1])) or '1', n[-1])          # all but last = chapter
FLAT = lambda n: ('1', n[-1])                                        # one running numbering

def go(work, bid, title, units, entries, extra=None):
    if ONLY and work not in ONLY: return
    if not entries: print('!! nothing for', bid); return
    save(COLL, bid, work, title, units, entries, extra)

def T(work, path, title, units, s_fn=A, prefix=None, bid=None, extra=None, **kw):
    """trailing-id text"""
    if ONLY and work not in ONLY: return
    pz = kw.pop('pausa', False); mk_ = kw.pop('marks', '-')
    go(work, bid or work, title, units, by_id(trail(path, prefix, **kw), s_fn, pz, mk_), extra)

def L(work, path, rx, title, units, s_fn=A, bid=None, extra=None, pausa=False, marks='-', clean=None):
    """leading-id text"""
    if ONLY and work not in ONLY: return
    go(work, bid or work, title, units, by_id(lead(path, rx, clean=clean), s_fn, pausa, marks), extra)

def analytic(t):
    """notes, variants and verb/root marks of the analytic editions"""
    t = re.sub(r'\[[^\[\]]*\\[^\[\]]*\]', '', t)                      # [vi.ā\khyā] root notes
    t = re.sub(r'\([^()]*(?:=|\bK\b|\bom\.)[^()]*\)|\[\s*[KU][:.][^\]]*\]|\[K\.[^\]]*\]', '', t)  # variants
    t = re.sub(r'\([^()]*-\)', '', t)                                 # (adhi-gam-) roots
    t = re.sub(r'\((?:c|p\.\s*\d+)\)', '', t)
    t = re.sub(r"(?:-\s*|\s)'a|\s\+a", " '", t)                      # keśo- 'aṃse, mokṣo +arkasya
    t = t.replace('H', 'ḥ')
    return re.sub(r'[\[\(#\\)%@]', '', t)
def dsutra(t): return analytic(t).replace('-', ' ')
def dotted(t):
    """gṛhya/śrauta style: every word and compound member separated by '.', words already in sandhi"""
    t = analytic(t)
    t = re.sub(r'\([^)]*\)\s*$', '', t)
    return re.sub(r'\.{1,2}', ' ', t).strip()

if COLL == 'dharma':
    D = S6 + '/4_dharma/'
    # dharmasūtras
    L('apastamba', D + 'sutra/apastd_u.htm', r'^Ap(\d)\.(\d+)\.(\d+)\.(\d+)/\s*(.*)$', 'आपस्तम्बधर्मसूत्रम्', ['प्रश्नः', 'पटलः', 'खण्डः'], clean=dsutra, pausa=True, marks='.')
    L('baudhayana', D + 'sutra/baudhd_u.htm', r'^Baudh(\d)\.(\d+)\.(\d+)\.(\d+)(?:-\d+)?[a-z]*/\s*(.*)$', 'बौधायनधर्मसूत्रम्', ['प्रश्नः', 'अध्यायः', 'खण्डः'], clean=dsutra, pausa=True, marks='.')
    L('gautama', D + 'sutra/gautdh_u.htm', r'^.*?GautSt_(\d+)\.(\d+):\s*(.*)$', 'गौतमधर्मसूत्रम्', ['अध्यायः'], clean=dsutra, pausa=True, marks='.')
    L('vasishtha', D + 'sutra/vasist_u.htm', r'^Va\.(\d+)\.(\d+)\s+(.*)$', 'वसिष्ठधर्मसूत्रम्', ['अध्यायः'], clean=lambda t: dsutra(t).replace('^', ' '), pausa=True, marks='.')
    if not ONLY or 'vaikhanasa' in ONLY:
        rows = []; cnt = {}
        for n, l in lead(D + 'sutra/vaikhd_u.htm', r'^Vaikh\s*(\d+)\.(\d+)\.\([^)]*\)/\s*(.*)$', clean=lambda t: dsutra(t).rstrip('.')):
            k = (n[0], n[1]); cnt[k] = cnt.get(k, 0) + 1; rows.append(([n[0], n[1], cnt[k]], l))
        go('vaikhanasa', 'vaikhanasa', 'वैखानसधर्मसूत्रम्', ['प्रश्नः', 'खण्डः'], by_id(rows, None, True, '.'))
    # smṛtis
    T('manu', D + 'smrti/manu2p_u.htm', 'मनुस्मृतिः', ['अध्यायः'])
    T('yajnavalkya', D + 'smrti/yajn2_pu.htm', 'याज्ञवल्क्यस्मृतिः', ['अध्यायः'])
    T('narada', D + 'smrti/nars2_pu.htm', 'नारदस्मृतिः', ['पदम्'])
    T('parashara', D + 'smrti/pars2_pu.htm', 'पराशरस्मृतिः', ['अध्यायः'])
    T('vishnu', D + 'smrti/visnu_pu.htm', 'विष्णुस्मृतिः', ['अध्यायः'])
    T('katyayana', D + 'smrti/katy2p_u.htm', 'कात्यायनस्मृतिः', [], FLAT)
    T('brihaspati', D + 'smrti/brhasppu.htm', 'बृहस्पतिस्मृतिः (व्यवहारकाण्डः)', ['काण्डः', 'प्रकरणम्'])
    T('angirasa', D + 'smrti/angirspu.htm', 'आङ्गिरसस्मृतिः', ['अध्यायः'])
    for i, (f, t) in enumerate([('ys-78_pu', 'यमस्मृतिः (७८ श्लोकाः)'), ('ys-99_pu', 'लघुयमस्मृतिः'), ('ys182_pu', 'बृहद्यमस्मृतिः'), ('yssoutpu', 'यमस्मृतिः (दाक्षिणात्यपाठः)')]):
        T('yama', D + f'smrti/{f}.htm', t, ['अध्यायः'], bid=f'yama{i + 1}', extra={'num': str(i + 1)})
    # gṛhya and śrauta sūtras
    L('ashvalayanagrhya', VD + '/2_grhya/asvgs_u.htm', r'^AsvGS_(\d+)\.(\d+)/(\d+):\s*(.*)$', 'आश्वलायनगृह्यसूत्रम्', ['अध्यायः', 'कण्डिका'], clean=dotted, pausa=True)
    L('shankhayanagrhya', VD + '/2_grhya/sankhgsu.htm', r'^ŚGS_(\d+)\.(\d+)\.(\d+):\s*(.*)$', 'शाङ्खायनगृह्यसूत्रम्', ['अध्यायः', 'खण्डः'], clean=dotted, pausa=True)
    T('manavagrhya', VD + '/2_grhya/manavgsu.htm', 'मानवगृह्यसूत्रम्', ['पुरुषः', 'खण्डः'])
    T('varahagrhya', VD + '/2_grhya/vargs_u.htm', 'वाराहगृह्यसूत्रम्', ['खण्डः'])
    L('kaushika', VD + '/2_grhya/kaussu_u.htm', r'^\(KauśS_\d+,\d+\[(\d+)\]\.(\d+)\)\s*(.*)$', 'कौशिकसूत्रम्', ['कण्डिका'])
    L('ashvalayanashrauta', VD + '/1_srauta/asvss_u.htm', r'^AsvSS_(\d+)\.(\d+)/(\d+)[a-z]?:\s*(.*)$', 'आश्वलायनश्रौतसूत्रम्', ['अध्यायः', 'कण्डिका'], clean=dotted, pausa=True)
    L('shankhayanashrauta', VD + '/1_srauta/sankhssu.htm', r'^ŚŚS_(\d+)\.(\d+)\.(\d+):\s*(.*)$', 'शाङ्खायनश्रौतसूत्रम्', ['अध्यायः', 'खण्डः'], clean=dotted, pausa=True)

if COLL == 'artha':
    ADH = ['विनयाधिकारिकम्', 'अध्यक्षप्रचारः', 'धर्मस्थीयम्', 'कण्टकशोधनम्', 'योगवृत्तम्', 'मण्डलयोनिः', 'षाड्गुण्यम्', 'व्यसनाधिकारिकम्',
           'अभियास्यत्कर्म', 'साङ्ग्रामिकम्', 'सङ्घवृत्तम्', 'आबलीयसम्', 'दुर्गलम्भोपायः', 'औपनिषदिकम्', 'तन्त्रयुक्तिः']
    if not ONLY or 'kautilya' in ONLY:
        rows = lead(S6 + '/5_artha/kautil_u.htm', r'^KAZ(\d\d)\.(\d+)\.(\d+)[a-z]?/\s*(.*)$', clean=analytic)
        for b in range(1, 16):
            go('kautilya', f'kautilya{b:02d}', f'{ADH[b - 1]} ({b})', ['अध्यायः'],
               by_id([(n[1:], l) for n, l in rows if n[0] == b], None, True, '.-'), {'num': str(b)})
    L('kamasutra', S6 + '/6_kama/kamasufu.htm', r'^(\d+)\.(\d+)\.(\d+)\s+(.*)$', 'कामसूत्रम्', ['अधिकरणम्', 'अध्यायः'], clean=lambda t: re.sub(r'\[\d+\]', '', t).replace(':', ''))
    T('pancasayaka', S6 + '/6_kama/jyopancu.htm', 'पञ्चसायकः', ['सायकः'])
    T('smaradipika', S6 + '/6_kama/minsmaru.htm', 'स्मरदीपिका', [], FLAT)

if COLL == 'ayurveda':
    Y = S6 + '/7_ayur/'
    T('caraka', Y + 'caraka_u.htm', 'चरकसंहिता', ['स्थानम्', 'अध्यायः'], indent_is_comm=True)
    if not ONLY or 'ashtangahridaya' in ONLY:
        rows = numbered(Y + 'vagaah_u.htm', r'^\s*\S*sthāna\s*$', r'\|\|\s*(\d+)\s*\|\|\s*$')
        go('ashtangahridaya', 'ashtangahridaya', 'अष्टाङ्गहृदयम् (सूत्रस्थानम्)', ['अध्यायः'], by_id(rows))
    if not ONLY or 'bhavaprakasha' in ONLY:
        rows = numbered(Y + 'bhavpr_u.htm', r'^Bhāvaprakāśa,', r'//\s*(\d+)\s*$')
        go('bhavaprakasha', 'bhavaprakasha', 'भावप्रकाशः (वर्गप्रकरणम्)', ['वर्गः'], by_id(rows))
    T('yogashataka', Y + 'yogasatu.htm', 'योगशतकम्', [], FLAT)
    T('rajanighantu', Y + 'rajnighu.htm', 'राजनिघण्टुः', ['वर्गः'], lambda n: (str(n[0]) if len(n) > 1 else '0', n[-1]))
    T('ashtanganighantu', Y + 'vanighpu.htm', 'अष्टाङ्गनिघण्टुः', [], FLAT)
    if not ONLY or 'annapanavidhi' in ONLY:
        rows = numbered(Y + 'samapviu.htm', r'^\s*annapānavidhiḥ', r'//\s*(\d+)\s*//\s*$')
        go('annapanavidhi', 'annapanavidhi', 'आयुर्वेदमहोदधिः · अन्नपानविधिः', [], by_id(rows, FLAT))

if COLL == 'rasa':
    Y = S6 + '/7_ayur/'
    T('anandakanda', Y + 'anandk_u.htm', 'आनन्दकन्दः', ['उल्लासः', 'विश्रान्तिः'])
    T('rasendracintamani', Y + 'dhrasciu.htm', 'रसेन्द्रचिन्तामणिः', ['अध्यायः'])
    T('rasahridaya', Y + 'grasht_u.htm', 'रसहृदयतन्त्रम्', ['अवबोधः'], prefix='GRht_')
    T('rasaratnakara', Y + 'nitrrk_u.htm', 'रसरत्नाकरः', ['खण्डः', 'उपदेशः'])
    T('rasarnava', Y + 'rasarnpu.htm', 'रसार्णवः', ['पटलः'])
    T('rasendracudamani', Y + 'rascum_u.htm', 'रसेन्द्रचूडामणिः', ['अध्यायः'])
    T('rasasanketakalika', Y + 'rassanku.htm', 'रससंकेतकलिका', ['उल्लासः'])
    T('rasamanjari', Y + 'salrasmu.htm', 'रसमञ्जरी', ['पटलः'])
    T('rasaratnasamuccaya', Y + 'vrasrs_u.htm', 'रसरत्नसमुच्चयः', ['अध्यायः'])
    T('rasaprakashasudhakara', Y + 'yrasprpu.htm', 'रसप्रकाशसुधाकरः', ['अध्यायः'])

if COLL == 'jyotisha':
    J = S6 + '/8_jyot/'
    jclean = lambda t: analytic(re.sub(r'\[[^\]]*\]|/\s*(?:āpaṭe|śarma)\s[^/]*|\?', '', t))
    PZ = dict(clean=jclean, pausa=True)
    L('aryabhatiya', J + 'aryabh_u.htm', r'^AB[_ ](\d+)\.(\d+)[a-z]*/\s*(.*)$', 'आर्यभटीयम्', ['पादः'], **PZ)
    L('brahmasphuta', J + 'brsphutu.htm', r'^BSS_(\d+)\.(\d+)[a-z]*/\s*(.*)$', 'ब्राह्मस्फुटसिद्धान्तः', ['अध्यायः'], **PZ)
    L('lilavati', J + 'lilavatu.htm', r'^Lil_(\d+)[a-o]/\s*(.*)$', 'लीलावती', [], FLAT, **PZ)
    L('bijaganita', J + 'bijaganu.htm', r'^BG_(\d+)[a-o]/\s*(.*)$', 'बीजगणितम्', [], FLAT, **PZ)
    L('suryasiddhanta', J + 'surysidu.htm', r'^(\d+)\.(\d+)[a-f]:\s*(.*)$', 'सूर्यसिद्धान्तः', ['अध्यायः'], clean=jclean)
    T('shulba', VD + '/1_srauta/apsulb_u.htm', 'आपस्तम्बशुल्बसूत्रम्', ['पटलः'], lambda n: (str(n[0]), n[1]))
    if not ONLY or 'vedangajyotisha' in ONLY:
        rows = numbered(J + 'lagrvvju.htm', r'^\s*pañcasaṃvatsaramayaṃ', r'//\s*(\d+)\s*$')
        rows = [([1, 1], ['pañcasaṃvatsaramayaṃ yugādhyakṣaṃ prajāpatim /'])] + rows
        go('vedangajyotisha', 'vedangajyotisha', 'ऋग्वेदवेदाङ्गज्योतिषम्', [], by_id(rows, FLAT))
    L('brihatsamhita', J + 'brhats_u.htm', r'^(\d+)\.(\d+)[a-f]+/\s*(.*)$', 'बृहत्संहिता', ['अध्यायः'], clean=jclean, pausa=True, marks='^')
    L('brihajjataka', J + 'brhajj_u.htm', r'^BJ_(\d+)\.(\d+)[a-f]/\.?\s*(.*)$', 'बृहज्जातकम्', ['अध्यायः'], clean=lambda t: jclean(re.sub(r'\([^)]*\)\s*$', '', t)).replace('.', ' '), pausa=True)
    L('yogayatra', J + 'yogay2_u.htm', r'^YY_(\d+)\.(\d+)[a-f]+/\.?\s*(.*)$', 'योगयात्रा', ['अध्यायः'], clean=jclean)
    L('brihadyogayatra', J + 'yogay1_u.htm', r'^BY_(\d+)\.(\d+)[a-f]+/\.?\s*(.*)$', 'बृहद्योगयात्रा', ['अध्यायः'], clean=lambda t: jclean(re.sub(r'//E\d+.*$', '//', t)))
    L('tikkanikayatra', J + 'tikaniku.htm', r'^TY_(\d+)\.(\d+)[a-f]+/\.?\s*(.*)$', 'टिक्कनिकायात्रा', ['अध्यायः'], clean=jclean)
    L('vivahapatala', J + 'vivahapu.htm', r'^VP_(\d+)[a-f]+/\.?\s*(.*)$', 'विवाहपटलम्', [], FLAT, clean=jclean)

if COLL == 'sahitya':
    P = PO + '/1_alam/'
    T('natyashastra', PO + '/1_natya/bharnatu.htm', 'नाट्यशास्त्रम्', ['अध्यायः'], lambda n: (str(n[0]), n[1]))
    T('dasharupaka', PO + '/1_natya/dhandasu.htm', 'दशरूपकम्', ['प्रकाशः'])
    if not ONLY or 'kavyadarsha' in ONLY:
        rows = trail(P + 'dkavy1pu.htm', '') + trail(P + 'dkavy2pu.htm', '') + trail(P + 'dkavy3_u.htm', 'KDd_')
        go('kavyadarsha', 'kavyadarsha', 'काव्यादर्शः', ['परिच्छेदः'], by_id(rows))
    T('bhamaha', P + 'bhakavpu.htm', 'काव्यालङ्कारः (भामहः)', ['परिच्छेदः'])
    T('vamana', P + 'vamkalsu.htm', 'काव्यालङ्कारसूत्राणि', ['अधिकरणम्', 'अध्यायः'])
    T('udbhata', P + 'udkassku.htm', 'काव्यालङ्कारसारसंग्रहः', ['वर्गः'])
    if not ONLY or 'dhvanyaloka' in ONLY:
        go('dhvanyaloka', 'dhvanyaloka', 'ध्वन्यालोकः (कारिकाः)', ['उद्द्योतः'], by_id(headed(P + 'andhvy_u.htm', r'^Dhv_(\d+)\.(\d+):\s*$')))
    T('kavyaprakasha', P + 'mamkprku.htm', 'काव्यप्रकाशः (कारिकाः)', [], FLAT)
    T('candraloka', P + 'jaycndpu.htm', 'चन्द्रालोकः', ['मयूखः'])
    T('sahityadarpana', P + 'visvsdpu.htm', 'साहित्यदर्पणः', ['परिच्छेदः'])
    T('rasarnavasudhakara', P + 'simhrsku.htm', 'रसार्णवसुधाकरः (कारिकाः)', ['विलासः'])
    T('prataparudriya', P + 'viprud_u.htm', 'प्रतापरुद्रीयम्', ['प्रकरणम्'])
    T('natakacandrika', P + 'rnatc__u.htm', 'नाटकचन्द्रिका', [], FLAT)
    T('vrittaratnakara', PO + '/1_chandas/kedvratu.htm', 'वृत्तरत्नाकरः', ['अध्यायः'])
