# Builds sri-books.json — compact book list for the Sri chat helper
import json,re,os
W='/home/claude/website'
C=json.load(open('/home/claude/site/catalogue.json',encoding='utf8'))
out=[]
for c in C:
    p=f"{W}/b/{c['slug']}.html"; cv=''
    if os.path.exists(p):
        m=re.search(r'cv/([^"\' )]+\.jpg)',open(p,encoding='utf8').read()); cv=m.group(1) if m else ''
    d=re.sub(r'\s+',' ',(c.get('desc') or '')).strip()
    if len(d)>260: d=d[:257].rsplit(' ',1)[0]+'…'
    out.append(dict(t=c['title'],s=c.get('sub') or '',l=c['lang'],h=c['shelf'],u=c['slug'],p=c['play'],c=cv,d=d,n=c.get('pages') or ''))
json.dump(out,open(f'{W}/sri-books.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(out),os.path.getsize(f'{W}/sri-books.json')//1024,'KB')
