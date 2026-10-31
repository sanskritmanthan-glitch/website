# Injects the extra Indian-language strings for Bodhinī (site/ui_tr.json) into sri.js between the /*XL*/ markers
import json,re
s=open('/home/claude/website/sri.js',encoding='utf8').read()
d=json.load(open('/home/claude/site/ui_tr.json',encoding='utf8'))
s=re.sub(r'/\*XL\*/.*?/\*XL\*/','/*XL*/'+json.dumps(d,ensure_ascii=False,separators=(',',':'))+'/*XL*/',s,count=1,flags=re.S)
open('/home/claude/website/sri.js','w',encoding='utf8').write(s);print('langs',list(d))
