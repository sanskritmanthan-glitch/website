# offline.json — file bundles the app can save for offline use (Bodhinī ▸ "Use offline")
import os,json
W='/home/claude/website'
def files(*dirs,ext=('.json','.js','.wasm')):
    out=[]
    for d in dirs:
        for dp,dn,fn in os.walk(f'{W}/{d}'):
            for f in fn:
                if f.endswith(ext): p=os.path.join(dp,f); out.append(['/'+os.path.relpath(p,W).replace(os.sep,'/'),os.path.getsize(p)])
    return sorted(out)
P=lambda *ps:[[p,os.path.getsize(W+p.replace('/','/',1) if os.path.exists(W+p) else W+p)] for p in ps]
B=[
 dict(id='core',n='Pages, Bodhinī, books, greetings',f=[[f'/{p}',os.path.getsize(f'{W}/{p}')] for p in os.listdir(W) if p.endswith('.html')]+files('g')+files('b',ext=('.html',))+[[f'/{p}',os.path.getsize(f'{W}/{p}')] for p in ['sri.js','sri-books.json','sri-learn.json','ix.js']]),
 dict(id='grammar',n='Grammar tools, games and lessons',f=files('vy')),
 dict(id='shloka',n='Śloka, Sūtra, Subhāṣita and Mantra indexes',f=files('sl','su','sb','mn')),
 dict(id='kosha',n='Kośa (dictionaries)',f=files('ko')),
 dict(id='shastra',n='Śāstra indexes (Dharma, Artha, Āyurveda, Rasa, Jyotiṣa, Sāhitya)',f=files('dh','ak','ay','rs','jy','kv')),
 dict(id='itihasa',n='Itihāsa–Purāṇa (very large)',f=files('ip')),
 dict(id='covers',n='Book covers',f=files('cv',ext=('.jpg','.png','.webp'))),
]
for b in B: b['mb']=round(sum(x[1] for x in b['f'])/1048576,1); b['f']=[x[0] for x in b['f']]
json.dump(B,open(f'{W}/offline.json','w'),separators=(',',':'))
print([(b['id'],b['mb'],len(b['f'])) for b in B])
