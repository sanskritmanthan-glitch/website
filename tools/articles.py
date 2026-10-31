# Builds the article pages a/<slug>.html and articles.json (read by the home page "Today" panel and by Bodhinī)
import json,glob,os,re,html
W='/home/claude/website';BASE='https://sanskritmanthan.in'
arts=[json.load(open(p,encoding='utf8')) for p in sorted(glob.glob('/home/claude/site/articles/*.json'))]
arts.sort(key=lambda a:a['date'],reverse=True)
T=open(f'{W}/tools/article_template.html',encoding='utf8').read()
idx=[]
for a in arts:
    text=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',a['body']))).strip()
    desc=(a.get('excerpt') or text)[:155]
    pg=T.replace('{{TITLE}}',html.escape(a['title'])).replace('{{DESC}}',html.escape(desc)).replace('{{URL}}',f"{BASE}/a/{a['slug']}").replace('{{DATE}}',a['date']).replace('{{AUTHOR}}',html.escape(a['author'])).replace('{{BODY}}',a['body']).replace('{{LANG}}',a.get('lang','en'))
    open(f"{W}/a/{a['slug']}.html",'w',encoding='utf8').write(pg)
    idx.append(dict(slug=a['slug'],title=a['title'],date=a['date'],author=a['author'],excerpt=a.get('excerpt',''),t=text[:5000]))
json.dump(idx,open(f'{W}/articles.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
# articles index page
lis=''.join(f'<li><a href="a/{x["slug"]}"><b>{html.escape(x["title"])}</b></a><small>{x["date"]} · {html.escape(x["author"])}</small><p>{html.escape(x["excerpt"])}</p></li>' for x in idx)
open(f'{W}/articles.html','w',encoding='utf8').write(T.replace('{{TITLE}}','लेखाः · Articles').replace('{{DESC}}','Articles on Sanskrit, Indian Knowledge Systems, śāstra and kāvya — Sanskrit Manthan.').replace('{{URL}}',f'{BASE}/articles').replace('{{DATE}}','').replace('{{AUTHOR}}','').replace('{{LANG}}','en').replace('{{BODY}}',f'<ul class="al">{lis}</ul>').replace('href="../','href="').replace('src="../','src="'))
print(len(idx),'articles')
