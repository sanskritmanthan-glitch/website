# Builds sri-books.json — compact book list for the Sri chat helper
import json,re,os
W='/home/claude/website'
C=json.load(open('/home/claude/site/catalogue.json',encoding='utf8'))
PM=json.load(open('/home/claude/site/play_meta.json',encoding='utf8'))
# archive.org samples already live (identifier = sanskritmanthan-<slug>-sample)
ARCH=set(open('/home/claude/site/archive_live.txt').read().split())
out=[]
for c in C:
    p=f"{W}/b/{c['slug']}.html"; cv=''
    if os.path.exists(p):
        m=re.search(r'cv/([^"\' )]+\.jpg)',open(p,encoding='utf8').read()); cv=m.group(1) if m else ''
    d=re.sub(r'\s+',' ',(c.get('desc') or '')).strip()
    if len(d)>260: d=d[:257].rsplit(' ',1)[0]+'…'
    m=PM.get(c['id'],{});lg=c['lang']
    if re.search('[\u0c00-\u0c7f]',c['title']): lg='tel'
    elif re.search('[\u0900-\u097f]',c['title'].split('(')[0]) and lg=='tel': lg='san'
    o=dict(t=c['title'],s=c.get('sub') or '',l=lg,h=c['shelf'],u=c['slug'],p=c['play'],c=cv,d=d,n=c.get('pages') or m.get('pages') or '')
    if m.get('date'): o['dt']=m['date'][2:]
    if c['slug'] in ARCH: o['a']=1
    out.append(o)
json.dump(out,open(f'{W}/sri-books.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(out),os.path.getsize(f'{W}/sri-books.json')//1024,'KB')
