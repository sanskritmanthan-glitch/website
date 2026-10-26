// व्याकरणम् — hub: search any word / root / sūtra; the course; and small tools (sandhi, pratyāhāra, sūtra).
import * as C from './core.js';
import { $, $$, E, sh, D, cell, tinTable, supTable, bindPK, resetPK, sutraLine, sutraLink, showPK, pkId } from './ui.js';
import { join as sandhiJoin, RULES } from './sandhi.js';
import { UNITS, LESSONS } from './lessons.js';
const DONE_K = 'sm-lessons';
const done = () => { try { return JSON.parse(localStorage.getItem(DONE_K)) || {} } catch (e) { return {} } };
const rootIdx = aup => C.DH.findIndex(e => e[1] === aup);

/* ---------------- Māheśvara-sūtras ---------------- */
const MS = [[['अ', 'इ', 'उ'], 'ण्'], [['ऋ', 'ऌ'], 'क्'], [['ए', 'ओ'], 'ङ्'], [['ऐ', 'औ'], 'च्'], [['ह', 'य', 'व', 'र'], 'ट्'], [['ल'], 'ण्'], [['ञ', 'म', 'ङ', 'ण', 'न'], 'म्'], [['झ', 'भ'], 'ञ्'],
  [['घ', 'ढ', 'ध'], 'ष्'], [['ज', 'ब', 'ग', 'ड', 'द'], 'श्'], [['ख', 'फ', 'छ', 'ठ', 'थ', 'च', 'ट', 'त'], 'व्'], [['क', 'प'], 'य्'], [['श', 'ष', 'स'], 'र्'], [['ह'], 'ल्']];
function pratyahara(p) {
  const d = /[ऀ-ॿ]/.test(p) ? p.trim() : C.s2d(C.toSLP(p).trim());
  const m = d.match(/^([अ-ह])्?अ?(.+्)$/) || d.match(/^([अ-औ])(.+्)$/); if (!m) return null;
  let first = m[1], it = m[2]; if (/^[क-ह]$/.test(first) && d[1] !== '्' && d.length > 2 && !it.startsWith(first)) {}
  const seq = []; MS.forEach(([s, mk], i) => { s.forEach(x => seq.push({ x })); seq.push({ mk, i }) });
  const starts = seq.map((o, i) => o.x === first ? i : -1).filter(i => i >= 0); if (!starts.length) return null;
  const st = starts[0]; let ends = seq.map((o, i) => o.mk === it && i > st ? i : -1).filter(i => i >= 0); if (!ends.length) return null;
  const end = (first === 'इ' || first === 'य') && it === 'ण्' ? ends[ends.length - 1] : ends[0];
  return seq.slice(st, end).filter(o => o.x).map(o => o.x);
}

/* ---------------- widgets inside lessons ---------------- */
async function widget(w) {
  if (w.w === 'pratyahara') return `<div class="tool"><div class="ctl"><input id="pq" value="अच्" style="width:120px"><button class="btn" id="pg">›</button><span class="chipset">${['अच्', 'हल्', 'इक्', 'यण्', 'एच्', 'झल्', 'जश्', 'खर्', 'अल्', 'हश्', 'यर्'].map(x => `<button data-p="${x}">${D(x)}</button>`).join('')}</span></div><div id="po" class="big2"></div>
    <p class="mut small">${MS.map(([s, m]) => D(s.join('') + m)).join(' · ')}</p></div>`;
  if (w.w === 'sandhi') return `<table class="kt"><tr><th>पूर्वम्</th><th>परम्</th><th>सन्धिः</th><th>rule</th></tr>${w.pairs.map(([a, b]) => { const r = sandhiJoin(a, b), R = RULES[r.rule];
    return `<tr><td>${E(sh(a))}</td><td>${E(sh(b))}</td><td><b>${E(sh(r.out.trim()))}</b></td><td><small>${E(D(R[0]))}</small> ${R[1] ? sutraLink(R[1]) : ''}</td></tr>` }).join('')}</table>`;
  if (w.w === 'sup') { const g = []; for (let vi = 0; vi < 8; vi++) { g.push([]); for (let va = 0; va < 3; va++) g[vi].push(C.sup(w.stem, w.g, vi, va)) }
    return supTable((vi, va) => g[vi][va], `${E(sh(w.stem))} · ${D(C.LIND[w.g])} <a class="sl" href="shabda.html#${w.stem}/${w.g}">open ›</a>`) }
  if (w.w === 'tin') { const di = rootIdx(w.root); if (di < 0) return ''; const pr = w.pr || 0, o = { san: w.san ? [w.san] : [] }; let h = '';
    for (const la of w.la) for (const [pada, pl] of [['Parasmaipada', 'परस्मैपदम्'], ['Atmanepada', 'आत्मनेपदम्']]) { if (pr && pada === 'Parasmaipada') continue;
      const grid = [0, 1, 2].map(pu => [0, 1, 2].map(va => C.tinP(di, la, pr, pu, va, pr ? null : pada, o))); if (!grid.flat().some(x => x.length)) continue;
      h += tinTable((pu, va) => grid[pu][va], `${D(C.dhatuPlain(C.DH[di][1]))} · ${D(C.LAKD[la])} · ${pr ? D(C.PRAD[pr]) : D(pl)}`) }
    return `<div class="grid2">${h}</div><p><a class="sl" href="dhatu.html#${C.DH[di][0]}${w.san ? '/sn=' + w.san : ''}${pr ? '/pr=' + pr : ''}">all lakāras of this root ›</a></p>` }
  if (w.w === 'krt') { const di = rootIdx(w.root); return `<table class="kt">${C.KRTL.slice(0, 16).map(([k, kd, en, s]) => `<tr><td>${D(kd)} ${sutraLink(s)}</td>${cell(C.krt(di, k))}<td><small>${en}</small></td></tr>`).join('')}</table>` }
  if (w.w === 'tad') return `<table class="kt">${w.items.map(([s, t]) => `<tr><td>${E(sh(s))} + ${E(t)}</td>${cell(C.tad(s, t))}</tr>`).join('')}</table>`;
  if (w.w === 'gana') { const R = [['BU', 'शप्'], ['a\\da~', '(लुक्)'], ['hu\\', 'श्लु'], ['divu~', 'श्यन्'], ['zu\\Y', 'श्नु'], ['tu\\da~^', 'श'], ['ru\\Di~^r', 'श्नम्'], ['tanu~^', 'उ'], ['qukrI\\Y', 'श्ना'], ['cura~', 'णिच्']];
    return `<table class="kt"><tr><th>गणः</th><th>विकरणम्</th><th>धातुः</th><th>लट् प्र॰ एक॰</th></tr>${R.map(([a, v], i) => { const di = rootIdx(a); return di < 0 ? '' : `<tr><td>${D(C.GANAD[i])}</td><td>${D(v)}</td><td><a href="dhatu.html#${C.DH[di][0]}">${D(C.dhatuPlain(a))}</a></td>${cell(C.tin(di, 0, 0, 0, 0))}</tr>` }).join('')}</table>` }
  if (w.w === 'upa') { const di = rootIdx(w.root); return `<table class="kt">${Object.keys(C.UPD).map(u => `<tr><td>${D(C.UPD[u])}</td>${cell(C.tin(di, 0, 0, 0, 0, { pre: [u] }))}</tr>`).join('')}</table>` }
  return '';
}
function bindWidgets() {
  if ($('#pq')) { const go = () => { const r = pratyahara($('#pq').value); $('#po').innerHTML = r ? r.map(x => `<span>${D(x)}</span>`).join(' ') : '<span class="mut">—</span>' };
    $('#pg').onclick = go; $('#pq').onkeydown = e => { if (e.key === 'Enter') go() }; $$('.tool .chipset button').forEach(b => b.onclick = () => { $('#pq').value = b.dataset.p; go() }); go() }
}

/* ---------------- search: any form, root, stem or sūtra ---------------- */
async function analyse(raw) {
  const s = C.toSLP(raw).replace(/\s+/g, ''); const out = [];
  if (/^\d\.\d\.\d+$/.test(raw.trim())) { out.push(`<div class="rescard"><h3>सूत्रम् ${raw.trim()}</h3><div class="an">${await sutraLine(raw.trim())}</div></div>`); return out }
  if (!s) return out;
  const show = async (refs, pre) => {
    for (const ref of refs.slice(0, 30)) { const r = C.decode(ref); if (!r) continue;
      if (r.kind === 'tin') { const opt = { pre: pre ? [pre] : [], san: r.san ? [r.san] : [] }; const ps = C.tin(r.di, r.la, r.pr, r.pu, r.va, opt).filter(p => C.same(p.text, s)); if (pre && !ps.length) continue;
        const e = C.DH[r.di]; const k = pkId(ps.length ? ps : C.tin(r.di, r.la, r.pr, r.pu, r.va, opt));
        out.push(`<div class="rescard"><h3>${E(sh(s))}</h3><div class="an">${pre ? D(C.UPD[pre]) + ' + ' : ''}<b>${D(C.dhatuPlain(e[1]))}</b> (${E(sh(e[4]))}, ${D(C.GANAD[e[2]])})${r.san ? ' + ' + D({ Ric: 'णिच् (causative)', san: 'सन् (desiderative)', yaN: 'यङ् (intensive)' }[r.san]) : ''} · ${D(C.LAKD[r.la])} <small class="mut">${C.LAKE[r.la]}</small> · ${D(C.PURD[r.pu])} · ${D(C.VACD[r.va])} · ${D(C.PRAD[r.pr])}${r.pada === 1 ? ' · ' + D('आत्मनेपदम्') : r.pada === 0 ? ' · ' + D('परस्मैपदम्') : ''}</div>
          <div class="acts"><button class="lnk" data-pk="${k}">प्रक्रिया · derivation</button><a href="dhatu.html#${e[0]}${pre ? '/up=' + pre : ''}${r.pr ? '/pr=' + r.pr : ''}${r.san ? '/sn=' + r.san : ''}">all forms of this root ›</a></div></div>`) }
      if (r.kind === 'krt') { const opt = pre ? { pre: [pre] } : {}; const ps = C.krt(r.di, r.krt, opt).filter(p => C.same(p.text, s)); if (pre && !ps.length) continue; const e = C.DH[r.di]; const kd = C.KRTL.find(x => x[0] === r.krt);
        out.push(`<div class="rescard"><h3>${E(sh(s))}</h3><div class="an">${pre ? D(C.UPD[pre]) + ' + ' : ''}<b>${D(C.dhatuPlain(e[1]))}</b> (${E(sh(e[4]))}) + ${D(kd ? kd[1] : r.krt)} <small class="mut">${kd ? kd[2] : ''}</small></div>
          <div class="acts"><button class="lnk" data-pk="${pkId(ps.length ? ps : C.krt(r.di, r.krt, opt))}">प्रक्रिया · derivation</button><a href="dhatu.html#${e[0]}/t=krt">kṛdantas of this root ›</a></div></div>`) }
      if (r.kind === 'sup') { const ps = C.sup(r.stem, r.g, r.vi, r.va).filter(p => C.same(p.text, s));
        out.push(`<div class="rescard"><h3>${E(sh(s))}</h3><div class="an"><b>${E(sh(r.stem))}</b> (${D(C.LIND[r.g])}) · ${D(C.VIBD[r.vi])} · ${D(C.VACD[r.va])}</div>
          <div class="acts"><button class="lnk" data-pk="${pkId(ps.length ? ps : C.sup(r.stem, r.g, r.vi, r.va))}">प्रक्रिया · derivation</button><a href="shabda.html#${r.stem}/${r.g}">all forms ›</a></div></div>`) } } };
  const GDS = new Set(await C.getJSON(new URL('game_dhatus.json', import.meta.url).href));
  const rank = ref => { const r = C.decode(ref); if (!r) return 9; if (r.kind === 'sup') return 'PSN'.indexOf(r.g) + (r.stem.length > 1 ? 0 : 5); return GDS.has(r.di) ? 0 : 3 + r.di / 10000 };
  const sorted = refs => refs.slice().sort((a, b) => rank(a) - rank(b));
  await show(sorted(await C.lookup(s)));
  if (!out.length) for (const [u, vs] of Object.entries(C.UPV)) for (const v of vs) if (s.startsWith(v) && s.length > v.length + 2) {
    let rest = s.slice(v.length); const cands = [rest]; if (u === 'AN') cands.push('a' + rest, 'A' + rest);
    for (const c of cands) { const refs = sorted(await C.lookup(c)); await show(refs, u);
      // the gerund with a prefix is -ya (ल्यप्): test every root seen in the remainder
      for (const di of [...new Set(refs.map(C.decode).filter(r => r && r.kind !== 'sup').map(r => r.di))].slice(0, 12)) {
        const ps = C.krt(di, 'ktvA', { pre: [u] }).filter(p => C.same(p.text, s));
        if (ps.length) { const e = C.DH[di]; out.unshift(`<div class="rescard"><h3>${E(sh(s))}</h3><div class="an">${D(C.UPD[u])} + <b>${D(C.dhatuPlain(e[1]))}</b> (${E(sh(e[4]))}) + ${D('क्त्वा → ल्यप्')} <small class="mut">having done (gerund with a prefix, 7.1.37)</small></div><div class="acts"><button class="lnk" data-pk="${pkId(ps)}">प्रक्रिया · derivation</button><a href="dhatu.html#${e[0]}/up=${u}/t=krt">kṛdantas ›</a></div></div>`) } } }
  }
  const roots = C.DH.map((e, i) => [e, i]).filter(([e]) => C.d2s(C.dhatuPlain(e[1])) === s);
  if (roots.length) out.push(`<div class="rescard"><h3>धातुः ${E(sh(s))}</h3><div class="an">${roots.map(([e]) => `<a href="dhatu.html#${e[0]}">${D(C.dhatuPlain(e[1]))} · ${E(sh(e[4]))} · ${D(C.GANAD[e[2]])} (${e[0]})</a>`).join('<br>')}</div></div>`);
  if (!out.length && /[aiuf]$|[nsrt]$|[AI]$/.test(s)) out.push(`<div class="rescard"><h3>${E(sh(s))} — as a noun stem</h3><div class="acts">${['P', 'S', 'N'].map(g => `<a href="shabda.html#${s}/${g}">${D(C.LIND[g])} ›</a>`).join('')}</div></div>`);
  return out;
}

/* ---------------- pages ---------------- */
function hub() {
  const d = done(), n = LESSONS.filter(l => d[l.id]).length;
  $('#app').innerHTML = `<h1>व्याकरणम्</h1><p class="sub">Sanskrit grammar — search any word, learn step by step, and see Pāṇini's rules at work on every form</p>
   <form class="bigsearch" id="sf"><input id="sq" placeholder="any word, root or sūtra · बभूव · गत्वा · रामेण · आगच्छति · गम् · 6.1.87" autocomplete="off"><button class="btn">अन्वेषणम्</button></form>
   <div id="sr"></div>
   <div class="tiles"><a href="dhatu.html"><b>${D('धातुरूपाणि')}</b><small>2,229 roots · every form</small></a><a href="shabda.html"><b>${D('शब्दरूपाणि')}</b><small>any noun · three genders</small></a>
   <a href="pratyaya.html"><b>${D('प्रत्ययाः · उपसर्गाः')}</b><small>kṛt · taddhita · strī · prefixes</small></a><a href="#tools"><b>${D('साधनानि')}</b><small>sandhi · pratyāhāra · sūtra</small></a>
   <a href="krida.html"><b>${D('क्रीडाङ्गणम्')}</b><small>learn by playing</small></a><a href="sutra.html#ashtadhyayi"><b>${D('अष्टाध्यायी')}</b><small>all 3,981 sūtras</small></a></div>
   <h2 class="sec2">पाठ्यक्रमः · the course <small>${n}/${LESSONS.length} done</small></h2>
   ${UNITS.map(([u, ue], ui) => `<div class="unit"><h3>${D(u)} <small>${ue}</small></h3><div class="lessons">${LESSONS.filter(l => l.u === ui).map(l => { const i = LESSONS.indexOf(l);
     return `<a href="#l/${l.id}" class="${d[l.id] ? 'done' : ''}"><span class="no">${i + 1}</span><span><b>${D(l.t)}</b><small>${l.en}</small></span>${d[l.id] ? '<span class="ck">✓</span>' : ''}</a>` }).join('')}</div></div>`).join('')}`;
  $('#sf').onsubmit = async ev => { ev.preventDefault(); resetPK(); const q = $('#sq').value; if (!q.trim()) return; $('#sr').innerHTML = '<div class="load">…</div>'; await C.engine();
    const r = await analyse(q); $('#sr').innerHTML = r.length ? r.join('') : `<p class="mut">“${E(q)}” was not found among the 545,000 generated forms. Try the root (गम्), the stem (राम), or check the spelling.</p>`; bindPK($('#sr')) };
}
async function lesson(id) {
  const i = LESSONS.findIndex(l => l.id === id); const l = LESSONS[i]; if (!l) return hub(); resetPK();
  const prev = LESSONS[i - 1], next = LESSONS[i + 1], d = done();
  $('#app').innerHTML = `<p class="crumb"><a href="#">‹ व्याकरणम्</a> · ${D(UNITS[l.u][0])}</p><article class="lesson"><h1><span class="no">${i + 1}</span> ${D(l.t)}</h1><p class="sub">${l.en}</p>
    <div class="lb">${l.b}</div><div id="w"></div>${l.s.length ? `<h3>मुख्यसूत्राणि · key sūtras</h3><div class="sut" id="su"></div>` : ''}
    <div class="fa">${l.play ? `<a class="btn ghost" href="krida.html#${l.play}">🎮 अभ्यासः · practise</a>` : ''}<button class="btn" id="dn">${d[l.id] ? '✓ पठितम्' : 'पाठः समाप्तः · mark done'}</button></div>
    <div class="pn">${prev ? `<a href="#l/${prev.id}">‹ ${D(prev.t)}</a>` : '<span></span>'}${next ? `<a href="#l/${next.id}">${D(next.t)} ›</a>` : ''}</div></article>`;
  $('#dn').onclick = () => { const d2 = done(); if (!d2[l.id]) { d2[l.id] = 1; try { localStorage.setItem(DONE_K, JSON.stringify(d2)) } catch (e) {} C.award(2) } $('#dn').textContent = '✓ पठितम् · +2 🪙'; };
  if (l.s.length) $('#su').innerHTML = (await Promise.all(l.s.map(sutraLine))).join('');
  if (l.w.length) { await C.engine(); $('#w').innerHTML = (await Promise.all(l.w.map(widget))).join(''); bindWidgets(); bindPK($('#w')) }
}
function tools() {
  $('#app').innerHTML = `<p class="crumb"><a href="#">‹ व्याकरणम्</a></p><h1>साधनानि</h1><p class="sub">Tools · join words with sandhi, expand a pratyāhāra, read any sūtra</p>
   <h2 class="sec2">सन्धियोजकः · sandhi</h2><div class="ctl"><input id="sa" value="rAmaH"> + <input id="sb" value="gacCati"><button class="btn" id="sj">=</button><span id="so" class="big2"></span></div>
   <h2 class="sec2">प्रत्याहारः</h2><div id="pt"></div>
   <h2 class="sec2">सूत्रम् · read a sūtra</h2><div class="ctl"><input id="sn" value="1.1.1" style="width:120px"><button class="btn" id="sg">›</button></div><div id="sx"></div>`;
  const sj = () => { const a = C.toSLP($('#sa').value).trim(), b = C.toSLP($('#sb').value).trim(); if (!a || !b) return; const r = sandhiJoin(a, b), R = RULES[r.rule];
    $('#so').innerHTML = `<b>${E(sh(r.out.trim()))}</b> <small>${E(D(R[0]))} ${R[1] ? sutraLink(R[1]) : ''}</small>` };
  $('#sj').onclick = sj; sj();
  widget({ w: 'pratyahara' }).then(h => { $('#pt').innerHTML = h; bindWidgets() });
  const sg = async () => { const c = $('#sn').value.trim(); $('#sx').innerHTML = /^\d\.\d\.\d+$/.test(c) ? await sutraLine(c) : '' }; $('#sg').onclick = sg; sg();
}
export async function start() {
  await C.dhatus();
  const go = () => { const h = decodeURIComponent(location.hash.slice(1)); window.scrollTo(0, 0); if (h.startsWith('l/')) return lesson(h.slice(2)); if (h === 'tools') return tools(); hub() };
  window.addEventListener('hashchange', go); go();
}
