"""Pick the everyday dhātus for the games (by their लट् प्रथमपुरुष एकवचन form) and the model nouns."""
import json, os, sys
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'vy')
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shloka'))
from skt import iast2slp
FORMS = '''bhavati gacchati paṭhati likhati vadati pibati tiṣṭhati paśyati karoti asti eti hanti śṛṇoti jānāti dadāti nayati labhate sevate vardhate rocate
bhāṣate edhate manyate yudhyate krīṇāti cinoti tudati pṛcchati ruṇaddhi tanoti kupyati bhakṣayati corayati khādati jāyate nṛtyati khelati smarati harati
jayati tarati yāti vasati kṣipati muñcati śocati krudhyati dīpyate kampate śikṣate bhinatti chinatti pūjayati cintayati kathayati gaṇayati arcati carati
patati spṛśati sṛjati dhāvati naśyati tyajati dahati śaṃsati rakṣati bodhati āste śete bravīti roditi svapiti bibheti juhoti pacati bhramati śāmyati icchati
prīṇāti vetti hvayati sīdati dhyāyati gāyati jighrati yacchati nindati vandate kṣamate śaknoti āpnoti dīvyati sīvyati mriyate kṣālayati tāḍayati'''.split()
found = []; miss = []
shard = {}
def look(f):
    k = ''.join('%02x' % ord(c) for c in f[:2]); p = f'{OUT}/f/{k}.json'
    if p not in shard: shard[p] = json.load(open(p)) if os.path.exists(p) else {}
    return shard[p].get(f, [])
for w in FORMS:
    s = iast2slp(w)
    refs = [r for r in look(s) if r.startswith('t') and r.split('.')[1:4] == ['0', '0', '0']]
    if refs: found.append(int(refs[0][1:].split('.')[0]))
    else: miss.append(w)
found = list(dict.fromkeys(found))
json.dump(found, open(f'{OUT}/game_dhatus.json', 'w'))
print(len(found), 'dhātus; missing', miss)
