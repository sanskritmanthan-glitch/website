"""Add Open Graph / Twitter tags (for WhatsApp etc. link previews) to every page that has <title> + description but no og: tags."""
import glob, os, re, html
BASE = 'https://sanskritmanthan.in'
for p in glob.glob('/home/claude/website/*.html'):
    n = os.path.basename(p)
    if n == 'index.html': continue
    s = open(p, encoding='utf8').read()
    if 'property="og:title"' in s: continue
    t = re.search(r'<title>(.*?)</title>', s); d = re.search(r'<meta name="description" content="(.*?)">', s)
    if not t: continue
    url = f'{BASE}/{n[:-5]}'
    tags = (f'\n<meta property="og:type" content="website"><meta property="og:site_name" content="Sanskrit Manthan">'
            f'<meta property="og:title" content="{t.group(1)}">' + (f'<meta property="og:description" content="{d.group(1)}">' if d else '') +
            f'<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/og.jpg"><meta name="twitter:card" content="summary_large_image">'
            f'<link rel="canonical" href="{url}">')
    s = s.replace('</title>', '</title>' + tags, 1)
    open(p, 'w', encoding='utf8').write(s); print('og', n)
