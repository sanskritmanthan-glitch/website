"""Write the grammar-family pages (krida.html …) from the shared head of shloka.html."""
import re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, '..', '..')
NAV_D = [('vyakarana.html', 'व्याकरणम्'), ('krida.html', 'क्रीडाङ्गणम्'), ('dhatu.html', 'धातुरूपाणि'), ('shabda.html', 'शब्दरूपाणि'), ('pratyaya.html', 'प्रत्ययाः · उपसर्गाः')]
CSS = """
.sub{color:var(--muted);font-family:var(--la)}.mut{color:var(--muted)}.small{font-size:.85rem}.center{text-align:center}
.crumb{margin:14px 0 0;font-family:var(--la);font-size:.9rem}.crumb a{color:var(--saffron);text-decoration:none}
.wallet{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 16px;margin:12px 0;font-family:var(--la)}
.coin{font-size:1.25rem;transition:transform .2s}.coin.pop{animation:pop .5s}@keyframes pop{50%{transform:scale(1.35)}}
.rank .rk{font-family:var(--dv);font-size:1.1rem;color:var(--saffron)}.goal{flex:1;min-width:180px}.gbar{height:8px;background:var(--soft);border-radius:8px;overflow:hidden}.gbar i{display:block;height:100%;background:linear-gradient(90deg,#e0a43a,#b4531f);transition:width .5s}
.claim{border:0;background:#2f7d32;color:#fff;border-radius:999px;padding:3px 12px;cursor:pointer;animation:pop 1.2s infinite}
.snd{border:0;background:none;font-size:1.1rem;cursor:pointer}
.games{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin:8px 0 24px}
.gc{display:flex;gap:14px;border:1px solid var(--line);border-radius:16px;background:var(--card);padding:16px;text-decoration:none;color:var(--ink);transition:transform .15s,border-color .15s,box-shadow .15s}
.gc:hover{transform:translateY(-3px);border-color:var(--saffron);box-shadow:0 8px 20px -12px rgba(120,60,20,.5)}
.gi{flex:none;width:58px;height:58px;border-radius:14px;display:grid;place-items:center;font-size:1.8rem;color:#fff;background:linear-gradient(135deg,#e0a43a,#b4531f)}
.gc h2{margin:0;font-weight:500;font-size:1.3rem}.gc .en{font-family:var(--la);color:var(--muted);font-size:.85rem}.gc p{font-family:var(--la);font-size:.9rem;margin:6px 0}
.gp{display:flex;justify-content:space-between;font-family:var(--la);font-size:.82rem;color:var(--saffron)}
.lv{display:grid;gap:10px;margin:10px 0 30px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.lc{display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);text-decoration:none;color:var(--ink)}
.lc:hover:not(.lock){border-color:var(--saffron)}.lc.lock{opacity:.5;cursor:not-allowed}.lc.done{border-color:var(--gold)}
.lc .ln{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--soft);font-family:var(--la);font-weight:600}.lc.done .ln{background:var(--gold);color:#fff}
.lc small{display:block;font-family:var(--la);color:var(--muted);font-size:.8rem;line-height:1.3}.lc .st{color:#e0a43a;letter-spacing:2px}
.hud{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;font-family:var(--la);margin-top:6px}.hud .wallet{margin:6px 0;padding:6px 12px;flex:1}.lvn{font-family:var(--dv);font-weight:600}
.tbar{height:6px;background:var(--soft);border-radius:6px;overflow:hidden;margin:4px 0 10px}.tbar i{display:block;height:100%;width:100%;background:#2f7d32;transition:width .1s linear}.tbar i.low{background:#c62828}
.qcard{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px 20px;min-height:280px;max-width:820px;margin:0 auto 30px}.qcard.wide{max-width:1200px}
.prompt{text-align:center}.prompt .big{font-size:2rem;margin:6px 0}.prompt .sub{font-size:1.1rem}.prompt .ask{color:var(--muted);margin-top:4px}.dh{font-size:1.3rem;color:var(--saffron)}.up{color:var(--gold)}
.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:18px 0 6px}
.opt{position:relative;padding:14px 10px;border:2px solid var(--line);border-radius:14px;background:var(--paper);font-size:1.25rem;cursor:pointer;transition:transform .1s,border-color .1s}
.opt:hover:not(:disabled){border-color:var(--saffron);transform:translateY(-2px)}.opt .kb{position:absolute;left:8px;top:4px;font:600 .7rem var(--la);color:var(--muted)}
.opt.right,input.right{border-color:#2f7d32;background:rgba(47,125,50,.12)}.opt.wrong,input.wrong{border-color:#c62828;background:rgba(198,40,40,.1);animation:shake .3s}
@keyframes shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.typ{display:flex;gap:8px;max-width:520px;margin:18px auto 4px}.typ input{flex:1;font:1.3rem var(--dv);padding:10px 14px;border:2px solid var(--line);border-radius:12px;background:var(--paper);color:var(--ink)}
.pv{text-align:center;color:var(--muted);min-height:1.6em}
.btn{border:0;border-radius:12px;background:var(--saffron);color:#fff;padding:9px 18px;cursor:pointer;font-family:var(--dv);text-decoration:none;display:inline-block}.btn.ghost{background:transparent;color:var(--saffron);border:1px solid var(--saffron)}
.lnk{border:0;background:none;color:var(--saffron);cursor:pointer;font-family:var(--la);text-decoration:underline}
.fb{margin-top:12px;text-align:center}.fb .good{color:#2f7d32;font-size:1.3rem}.fb .bad{color:#c62828;font-size:1.1rem}.fa{display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;margin:10px 0}
.pk{text-align:left;font-size:.95rem;margin:10px auto;max-width:720px;padding-left:1.4em}.pk li{display:grid;grid-template-columns:70px 1fr;gap:2px 10px;padding:4px 0;border-bottom:1px dashed var(--line)}
.pk .sc{font-family:var(--la);font-size:.8rem;color:var(--gold)}.pk .sc a{color:var(--gold)}.pk .st{color:var(--muted);font-size:.9rem}.pk .rs{grid-column:2}.pk .ch{color:var(--saffron);font-weight:600}
.res{text-align:center;padding:10px}.stars{font-size:2.6rem;color:#e0a43a;letter-spacing:6px;animation:pop .6s}
.toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#2b2118;color:#fff;padding:8px 16px;border-radius:999px;font-family:var(--la);z-index:30;transition:opacity .5s}.toast.out{opacity:0}
#modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:40}#modal[hidden]{display:none}.mbox{background:var(--card);border-radius:18px;padding:22px 26px;max-width:460px;font-family:var(--la)}.mbox h2{font-family:var(--dv)}
.code{font:600 1.5rem monospace;text-align:center;background:var(--soft);padding:8px;border-radius:10px;user-select:all}
.verse{font-size:1.25rem;line-height:1.9;text-align:center;margin:8px 0}.verse.sm{font-size:1.05rem}.cpu{border-left:3px solid var(--gold);padding-left:12px;margin-bottom:10px}.cpu small{font-family:var(--la);color:var(--muted)}
.need{text-align:center;font-size:1.1rem;margin:12px 0}.need .lt{font-size:1.8rem;color:var(--saffron)}.rule a{color:var(--gold)}
.sdk-wrap,.xw-wrap{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}.sdk{display:grid;grid-template-columns:repeat(9,1fr);width:min(560px,94vw);aspect-ratio:1;border:2px solid var(--ink)}
.cell{border:1px solid var(--line);background:var(--paper);font-size:clamp(.55rem,1.9vw,.95rem);padding:0;cursor:pointer;overflow:hidden;line-height:1.1}
.cell:nth-child(9n+3),.cell:nth-child(9n+6){border-right:2px solid var(--ink)}.cell:nth-child(n+19):nth-child(-n+27),.cell:nth-child(n+46):nth-child(-n+54){border-bottom:2px solid var(--ink)}
.cell.giv{font-weight:700;background:var(--soft)}.cell.hl{background:var(--hl)}.cell.sel{outline:3px solid var(--saffron);outline-offset:-3px}.cell.bad{color:#c62828;background:rgba(198,40,40,.15)}
.side{flex:1;min-width:260px;max-width:420px}.pal{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}.pal button{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:6px 4px;cursor:pointer}
.pal button small{display:block;font-family:var(--la);font-size:.65rem;color:var(--muted)}.pal .er{background:var(--soft)}.pal.ak{grid-template-columns:repeat(5,1fr)}.pal.ak button{font-size:1.2rem}
.xw{display:grid;gap:2px;align-content:start}.xb{aspect-ratio:1}.xc{position:relative;aspect-ratio:1;border:1px solid var(--ink);background:var(--paper);font-size:1.1rem;cursor:pointer;padding:0}
.xc i{position:absolute;left:2px;top:0;font:600 .6rem var(--la);color:var(--muted)}.xc.hl{background:var(--hl)}.xc.sel{outline:3px solid var(--saffron)}.xc.bad{color:#c62828}
.clues{font-size:1rem;padding-left:0;list-style:none}.clues li{padding:3px 0;cursor:pointer}.clues b{color:var(--saffron);margin-right:4px}.side h3{margin:8px 0 2px;font-size:1rem;color:var(--gold)}.ans{text-align:center;margin-top:10px}
.mem{display:grid;gap:10px;max-width:760px;margin:auto}.mc{position:relative;height:96px;border:0;background:none;perspective:600px;cursor:pointer;padding:0}
.mc span{position:absolute;inset:0;display:grid;place-items:center;border-radius:12px;backface-visibility:hidden;transition:transform .35s;padding:4px;font-size:.95rem}
.mc .back{background:linear-gradient(135deg,#e0a43a,#b4531f);color:#fff;font-size:1.8rem}.mc .face{background:var(--paper);border:2px solid var(--line);transform:rotateY(180deg)}.mc .face.form{font-size:1.2rem;color:var(--saffron)}
.mc.up .back{transform:rotateY(180deg)}.mc.up .face{transform:rotateY(0)}.mc.got .face{border-color:#2f7d32;background:rgba(47,125,50,.1)}
.load{text-align:center;color:var(--muted);padding:60px}
@media (max-width:600px){.prompt .big{font-size:1.5rem}.opt{font-size:1.05rem;padding:12px 6px}.qcard{padding:16px 12px}.mc{height:80px}}
"""
def page(name, title, en, desc, body, script):
    s = open(f'{WEB}/shloka.html').read(); h = s[:s.index('</head>')]
    h = re.sub(r'<title>.*?</title>', f'<title>{title} · {en} · Sanskrit Manthan</title>', h)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    h = h.replace('</style>', CSS + '</style>')
    out = h + f'''</head>
<body class="s-dv"><header><div class="wrap"><a class="brand" href="./">संस्कृतमन्थनम्</a><nav class="seg" aria-label="Index"></nav>
<div class="seg" id="script" role="group" aria-label="Script"><button data-s="dv">देवनागरी</button><button data-s="te">తెలుగు</button><button data-s="la">IAST</button></div></div></header>
<div class="wrap"><main id="app"><div class="load">…</div></main></div>
<footer><div class="wrap">Word forms and derivations are generated by <a href="https://github.com/ambuda-org/vidyut">vidyut-prakriya</a> (Ambuda, MIT licence), which applies the rules of the Aṣṭādhyāyī step by step; dhātupāṭha and sūtra texts from ashtadhyayi.com via vidyut. · <a href="sources.html">आधारग्रन्थाः · Sources and licences</a> · <a href="./">sanskritmanthan.in</a></div></footer>
<script type="module">
import * as C from './vy/core.js';
{script}
const sb=[...document.querySelectorAll('#script button')];const mark=()=>sb.forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===C.SCRIPT));
document.body.className='s-'+C.SCRIPT;mark();sb.forEach(b=>b.onclick=()=>{{C.setScript(b.dataset.s);mark();window.dispatchEvent(new HashChangeEvent('hashchange'))}});
</script>
</body>
</html>
'''
    open(f'{WEB}/{name}', 'w').write(out)
def nav():
    live = [(f, l) for f, l in NAV_D if os.path.exists(f'{WEB}/{f}')]
    for f, _ in live:
        p = open(f'{WEB}/{f}').read()
        links = ''.join(f'<a href="{g}"{" aria-current=\"page\"" if g == f else ""}>{l}</a>' for g, l in live)
        p = re.sub(r'<nav class="seg" aria-label="Index">.*?</nav>', f'<nav class="seg" aria-label="Index">{links}</nav>', p, count=1, flags=re.S)
        if 'nav.seg a{' not in p:
            p = p.replace('</style>', 'nav.seg a{padding:4px 12px;font-size:.9rem;text-decoration:none;color:var(--ink)}\nnav.seg a[aria-current="page"]{background:var(--saffron);color:#fff}\nnav.seg{flex-wrap:wrap;border-radius:14px}\n</style>', 1)
        open(f'{WEB}/{f}', 'w').write(p)
if __name__ == '__main__':
    page('krida.html', 'क्रीडाङ्गणम्', 'Sanskrit Grammar Games', 'Learn Sanskrit grammar by playing: verb and noun forms, sandhi, metres, antyākṣarī, Sudoku of verb endings, crosswords and memory cards — every answer checked by Pāṇini’s rules, with levels from slow to fast and tokens to earn.',
         '', "import { route } from './vy/games.js';\nwindow.addEventListener('hashchange', route); route();")
    nav(); print('grammar pages written')
