"""Build the website data for the śloka index from corpus/*.json (re-run after adding any text)."""
import json, glob, os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from skt import *
OUT=sys.argv[1] if len(sys.argv)>1 else '/home/claude/website/sl'
GEN={'mahakavya':'महाकाव्यम्','khandakavya':'खण्डकाव्यम्','sandesha':'सन्देशकाव्यम्','muktaka':'मुक्तककाव्यम्','rupaka':'रूपकम्','katha':'कथासाहित्यम्','stotra':'स्तोत्रम्','itihasa':'इतिहासः','purana':'पुराणम्','shastra':'शास्त्रम्'}
ORDER=['raghuvamsha','kumarasambhava','meghaduta','ritusamhara','kiratarjuniya','shishupalavadha','naishadhiya','bhattikavya']
texts=[json.load(open(f)) for f in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'corpus','*.json'))]
texts.sort(key=lambda t:(ORDER.index(t['id']) if t['id'] in ORDER else 99,t['title']))
for d in ('t','k','a'): os.makedirs(f'{OUT}/{d}',exist_ok=True)
cat=[]; alpha={}
mdev=lambda m: T(m,sanscript.IAST,sanscript.DEVANAGARI) if m else ''
for t in texts:
    sarg={}
    for v in t['verses']: sarg.setdefault(v['s'],0); sarg[v['s']]+=1
    cat.append(dict(id=t['id'],title=t['title'],poet=t['poet'],genre=t['genre'],gdev=GEN.get(t['genre'],t['genre']),unit=t.get('unit','सर्ग'),source=t.get('source',''),
                    sargas=[[s,n] for s,n in sorted(sarg.items())],verses=len(t['verses']),aliases=[loose(dev2slp(t['title']))[:6],t['id'][:6]]))
    json.dump(dict(id=t['id'],v=[[v['s'],v['v'],v['p'],mdev(v['m'])] for v in t['verses']]),open(f"{OUT}/t/{t['id']}.json",'w'),ensure_ascii=False,separators=(',',':'))
    json.dump([v['k'] for v in t['verses']],open(f"{OUT}/k/{t['id']}.json",'w'),separators=(',',':'))
    for vi,v in enumerate(t['verses']):
        for pi,(p,o,ini) in enumerate(zip(v['p'],v['o'],v['i'])):
            alpha.setdefault(ini,[]).append((o,p,t['id'],v['s'],v['v'],pi))
letters=[]
for ini in sorted(alpha,key=lambda c:RANK.get(c,99)):
    rows=sorted(alpha[ini],key=lambda r:(r[0],ORDER.index(r[2]) if r[2] in ORDER else 99,r[3],r[4]))
    lab=slp2dev(ini+'a') if ini in 'kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh' else slp2dev(ini)
    fn='L%02d'%RANK.get(ini,99)
    letters.append([fn,lab,len(rows)])
    json.dump([[p,tid,s,v,pi] for _,p,tid,s,v,pi in rows],open(f"{OUT}/a/{fn}.json",'w'),ensure_ascii=False,separators=(',',':'))
json.dump(dict(texts=cat,letters=letters,total=sum(c['verses'] for c in cat)),open(f'{OUT}/catalog.json','w'),ensure_ascii=False,indent=0)
print(len(cat),'texts',sum(c['verses'] for c in cat),'verses',len(letters),'letters', [l[1]+str(l[2]) for l in letters][:12])
