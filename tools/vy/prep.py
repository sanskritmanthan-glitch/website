"""Data for the grammar pages (website/vy/): dhātupāṭha, sūtra texts, and a reverse index of word forms
(tiṅanta, subanta, kṛdanta) so that any form can be searched. Forms are generated with vidyut-prakriya
(github.com/ambuda-org/vidyut, MIT), which follows the Aṣṭādhyāyī rule by rule."""
import json, os, re, sys, collections
from vidyut.prakriya import *
DATA = '/home/claude/vidyut-data/prakriya'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'vy')
os.makedirs(f'{OUT}/f', exist_ok=True)
d = Data(DATA); v = Vyakarana(log_steps=False); vl = Vyakarana(log_steps=True)
GANA = ['BvAdi', 'adAdi', 'juhotyAdi', 'divAdi', 'svAdi', 'tudAdi', 'ruDAdi', 'tanAdi', 'kryAdi', 'curAdi', 'kaRqvAdi']
GJS = ['Bhvadi', 'Adadi', 'Juhotyadi', 'Divadi', 'Svadi', 'Tudadi', 'Rudhadi', 'Tanadi', 'Kryadi', 'Curadi', 'Kandvadi']
AJS = {'Gawa~': None}
entries = d.load_dhatu_entries()
dh = []
for e in entries:
    g = GANA.index(str(e.dhatu.gana)) if str(e.dhatu.gana) in GANA else int(e.code[:2]) - 1
    ag = str(e.dhatu.antargana) if e.dhatu.antargana else ''
    dh.append([e.code, e.dhatu.aupadeshika, g, ag, e.artha])
json.dump(dict(gana=GJS, dhatus=dh), open(f'{OUT}/dhatus.json', 'w'), ensure_ascii=False, separators=(',', ':'))
# sūtra texts, keyed the way the engine reports them (source:code)
SRC = {'azwADyAyI': 'ashtadhyayi', 'vArttikAH': 'varttika', 'DAtupAWaH': 'dhatupatha', 'kASikA': 'kashika', 'liNgAnuSAsanam': 'linganushasanam',
       'kOmudI': 'kaumudi', 'uRAdipAWaH': 'unadi', 'PiwsUtrARi': 'phit'}
su = {}
for s in d.load_sutras(): su[f"{SRC.get(str(s.source), str(s.source))}:{s.code}"] = s.text
json.dump(su, open(f'{OUT}/sutras.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(dh), 'dhātus', len(su), 'sūtras')

LAK = [Lakara.Lat, Lakara.Lit, Lakara.Lut, Lakara.Lrt, Lakara.Let, Lakara.Lot, Lakara.Lan, Lakara.VidhiLin, Lakara.AshirLin, Lakara.Lun, Lakara.Lrn]
PUR = [Purusha.Prathama, Purusha.Madhyama, Purusha.Uttama]; VAC = [Vacana.Eka, Vacana.Dvi, Vacana.Bahu]
ATM = {'ta', 'AtAm', 'Ja', 'TAs', 'ATAm', 'Dvam', 'iw', 'vahi', 'mahiN'}
IDX = collections.defaultdict(list)
def add(form, ref):
    IDX[form].append(ref)
n = 0
for di, e in enumerate(entries):
    for li, la in enumerate(LAK):
        if la == Lakara.Let: continue
        for pi, pr in enumerate([Prayoga.Kartari, Prayoga.Karmani]):
            for pu in range(3):
                for va in range(3):
                    args = dict(dhatu=e.dhatu, prayoga=pr, lakara=la, purusha=PUR[pu], vacana=VAC[va])
                    ps = v.derive(Pada.Tinanta(**args))
                    if not ps: continue
                    if pr == Prayoga.Kartari and len(set(p.text for p in ps)) > 1:
                        # ubhayapadī: find each form's pada from its tiṅ ending
                        for p in vl.derive(Pada.Tinanta(**args)):
                            tin_ = [st.result[-1] for st in p.history if st.code == '3.4.78']
                            atm = bool(tin_) and tin_[0] in ATM
                            add(p.text, f't{di}.{li}.{pi}.{pu * 3 + va}.{1 if atm else 0}'); n += 1
                    else:
                        for p in ps: add(p.text, f't{di}.{li}.{pi}.{pu * 3 + va}'); n += 1
    if di % 300 == 0: print(di, n, file=sys.stderr)
# sanādi roots (causative, desiderative, intensive) in the commonest lakāras
for di, e in enumerate(entries):
    for sn, SN in (('Ric', Sanadi.Ric), ('san', Sanadi.san), ('yaN', Sanadi.yaN)):
        try: dd = e.dhatu.with_sanadi([SN])
        except Exception: continue
        for li in (0, 3, 6):
            for pu in range(3):
                for va in range(3):
                    try: ps = v.derive(Pada.Tinanta(dhatu=dd, prayoga=Prayoga.Kartari, lakara=LAK[li], purusha=PUR[pu], vacana=VAC[va]))
                    except Exception: continue
                    for p in ps: add(p.text, f't{di}.{li}.0.{pu * 3 + va}..{sn}'); n += 1
print('with sanādi', n, file=sys.stderr)
# kṛdantas
KRT = ['kta', 'ktavatu', 'ktvA', 'tumun', 'tavya', 'anIyar', 'yat', 'Ryat', 'Satf', 'SAnac', 'Rvul', 'tfc', 'lyuw', 'GaY', 'ktin']
for di, e in enumerate(entries):
    for k in KRT:
        try: ps = v.derive(Pratipadika.krdanta(e.dhatu, getattr(Krt, k)))
        except Exception: continue
        for p in ps: add(p.text, f'k{di}.{k}'); n += 1
print('verbal forms', n, file=sys.stderr)
# subantas: Amarakośa words, with their gender
HERE = '/home/claude/corpus/ashtadhyayi/kosha/amara.json'
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shloka'))
from skt import dev2slp
words = set()
for ent in json.load(open(HERE))['data']:
    for w in ent.get('words') or []:
        if not isinstance(w, dict): continue
        lg = w.get('linga') or ''
        s = dev2slp(w['word'])
        for c in lg:
            if c in 'PSN': words.add((s, c))
            if c == 'V':
                for c2 in 'PSN': words.add((s, c2))
MODEL = [('rAma', 'P'), ('hari', 'P'), ('guru', 'P'), ('pitf', 'P'), ('dAtf', 'P'), ('rAjan', 'P'), ('Atman', 'P'), ('Bagavat', 'P'), ('sarva', 'P'),
         ('tad', 'P'), ('yad', 'P'), ('idam', 'P'), ('kim', 'P'), ('asmad', 'P'), ('yuzmad', 'P'), ('ramA', 'S'), ('mati', 'S'), ('nadI', 'S'), ('Denu', 'S'),
         ('vaDU', 'S'), ('mAtf', 'S'), ('vAc', 'S'), ('vana', 'N'), ('vAri', 'N'), ('maDu', 'N'), ('manas', 'N'), ('jagat', 'N'), ('nAman', 'N'),
         ('tad', 'S'), ('tad', 'N'), ('yad', 'S'), ('yad', 'N'), ('idam', 'S'), ('idam', 'N'), ('kim', 'S'), ('kim', 'N'), ('sarva', 'S'), ('sarva', 'N')]
words |= set(MODEL)
LG = {'P': Linga.Pum, 'S': Linga.Stri, 'N': Linga.Napumsaka}
VIB = [Vibhakti.Prathama, Vibhakti.Dvitiya, Vibhakti.Trtiya, Vibhakti.Caturthi, Vibhakti.Panchami, Vibhakti.Sasthi, Vibhakti.Saptami, Vibhakti.Sambodhana]
NOT_NYAP = {'lakzmI', 'tarI', 'tantrI', 'avI', 'starI'}
def prati(s, c):
    if c == 'S' and (s.endswith('A') or (s.endswith('I') and len(re.findall('[aAiIuUfFxXeEoO]', s)) > 1 and s not in NOT_NYAP) or s == 'strI'):
        return Pratipadika.nyap(s)
    return Pratipadika.basic(s)
m = 0
for s, c in sorted(words):
    if not re.fullmatch(r'[a-zA-Z]+', s): continue
    try: pr = prati(s, c)
    except Exception: continue
    for vi in range(8):
        for va in range(3):
            try: ps = v.derive(Pada.Subanta(pratipadika=pr, linga=LG[c], vibhakti=VIB[vi], vacana=VAC[va]))
            except Exception: continue
            for p in ps: add(p.text, f's{s}.{c}.{vi * 3 + va}'); m += 1
print('nominal forms', m, 'words', len(words), file=sys.stderr)
json.dump(sorted(f'{s}.{c}' for s, c in MODEL), open(f'{OUT}/models.json', 'w'))
# shard the index by the first two letters of the form
for f in os.listdir(f'{OUT}/f'): os.remove(f'{OUT}/f/{f}')
sh = collections.defaultdict(dict)
for form, refs in IDX.items():
    sh[form[:2]][form] = sorted(set(refs))
key = lambda ch: ''.join('%02x' % ord(c) for c in ch)
for ch, dct in sh.items():
    json.dump(dct, open(f'{OUT}/f/{key(ch)}.json', 'w'), separators=(',', ':'))
print(len(IDX), 'distinct forms', len(sh), 'shards')
