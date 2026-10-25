// धातुरूपाणि — every root of the Dhātupāṭha in every lakāra, prayoga, with upasargas and sanādi suffixes, and each form's derivation.
import * as C from './core.js';
import { $, $$, E, sh, D, cell, tinTable, bindPK, resetPK, sutraLink } from './ui.js';
const SAN = [['', 'मूलधातुः · plain'], ['Ric', 'णिजन्तः · causative'], ['san', 'सन्नन्तः · desiderative'], ['yaN', 'यङन्तः · intensive'], ['yaNluk', 'यङ्लुगन्तः · intensive (luk)']];
const LAKS = [0, 6, 5, 7, 3, 1, 2, 9, 8, 10];
let ST = { di: 0, pr: 0, up: '', sn: '', tab: 'tin', gana: -1, q: '' };
function readHash() {
  const p = decodeURIComponent(location.hash.slice(1)).split('/');
  if (p[0]) { const i = C.byCode(p[0]); if (i >= 0) ST.di = i }
  for (const kv of p.slice(1)) { const [k, v] = kv.split('='); if (k === 'pr') ST.pr = +v; if (k === 'up') ST.up = v; if (k === 'sn') ST.sn = v; if (k === 't') ST.tab = v }
}
function writeHash() { const e = C.DH[ST.di]; const h = [e[0], ST.pr ? 'pr=' + ST.pr : '', ST.up ? 'up=' + ST.up : '', ST.sn ? 'sn=' + ST.sn : '', ST.tab !== 'tin' ? 't=' + ST.tab : ''].filter(Boolean).join('/'); history.replaceState(null, '', '#' + h) }
const opt = () => ({ pre: ST.up ? [ST.up] : [], san: ST.sn ? [ST.sn] : [] });
function list() {
  const q = C.toSLP(ST.q).replace(/\s/g, ''), qd = ST.q.trim();
  let rows = C.DH.map((e, i) => [e, i]);
  if (ST.gana >= 0) rows = rows.filter(([e]) => e[2] === ST.gana);
  if (q) rows = rows.filter(([e]) => C.d2s(C.dhatuPlain(e[1])).startsWith(q) || e[1].replace(/[\\^~]/g, '').startsWith(q) || e[4].includes(q) || e[0].startsWith(qd));
  let h = '', last = -1;
  for (const [e, i] of rows.slice(0, 600)) {
    if (e[2] !== last) { h += `<div class="gh">${D(C.GANAD[e[2]])}</div>`; last = e[2] }
    h += `<button data-i="${i}" ${i === ST.di ? 'aria-current="true"' : ''}><span>${E(D(C.dhatuPlain(e[1])))} <small>${E(sh(e[4]))}</small></span><small>${e[0]}</small></button>`;
  }
  $('#list').innerHTML = h + (rows.length > 600 ? `<p class="mut small">… ${rows.length - 600} more — refine the search</p>` : '') + (!rows.length ? '<p class="mut small" style="padding:10px">No root found.</p>' : '');
  $$('#list button').forEach(b => b.onclick = () => { ST.di = +b.dataset.i; ST.up = ''; ST.sn = ''; ST.pr = 0; draw(); list() });
}
function draw() {
  resetPK(); writeHash();
  const e = C.DH[ST.di], di = ST.di, o = opt();
  const lat = C.tinForms(di, 0, 0, 0, 0, o);
  let h = `<div class="dcard"><h2>${E(D(C.dhatuPlain(e[1])))}</h2><div class="meta">${E(sh(e[1].replace(/[\\^]/g, '')))} · ${D(C.GANAD[e[2]])}${e[3] ? ' (' + e[3] + ')' : ''} · ${E(sh(e[4]))} · dhātupāṭha ${e[0]}${lat.length ? ' · ' + lat.map(x => E(sh(x))).join(', ') : ''}</div></div>
   <div class="ctl"><label>प्रयोगः <select id="pr">${C.PRAD.map((p, i) => `<option value="${i}" ${i === ST.pr ? 'selected' : ''}>${D(p)}</option>`).join('')}</select></label>
   <label>उपसर्गः <select id="up"><option value="">—</option>${Object.keys(C.UPD).map(u => `<option value="${u}" ${u === ST.up ? 'selected' : ''}>${D(C.UPD[u])}</option>`).join('')}</select></label>
   <label>सनादिः <select id="sn">${SAN.map(([k, l]) => `<option value="${k}" ${k === ST.sn ? 'selected' : ''}>${D(l)}</option>`).join('')}</select></label></div>
   <div class="tabs2" role="tablist"><button data-t="tin" aria-selected="${ST.tab === 'tin'}">तिङन्तानि · all lakāras</button><button data-t="krt" aria-selected="${ST.tab === 'krt'}">कृदन्तानि · participles &amp; nouns</button></div><div id="tabs"></div>`;
  $('#main').innerHTML = h;
  $('#pr').onchange = ev => { ST.pr = +ev.target.value; draw() }; $('#up').onchange = ev => { ST.up = ev.target.value; draw() }; $('#sn').onchange = ev => { ST.sn = ev.target.value; draw() };
  $$('.tabs2 button').forEach(b => b.onclick = () => { ST.tab = b.dataset.t; draw() });
  const out = $('#tabs');
  if (ST.tab === 'tin') {
    let g = '';
    for (const la of LAKS) for (const [pada, pl] of [['Parasmaipada', 'परस्मैपदम्'], ['Atmanepada', 'आत्मनेपदम्']]) {
      if (ST.pr && pada === 'Parasmaipada') continue;           // karmaṇi/bhāve are ātmanepada
      const grid = [0, 1, 2].map(pu => [0, 1, 2].map(va => C.tinP(di, la, ST.pr, pu, va, ST.pr ? null : pada, o)));
      if (!grid.flat().some(x => x.length)) continue;
      g += tinTable((pu, va) => grid[pu][va], `${D(C.LAKD[la])} <small class="mut">${C.LAKE[la]}</small> · ${ST.pr ? D(C.PRAD[ST.pr]) : D(pl)}`);
    }
    out.innerHTML = g ? `<div class="grid2">${g}</div>` : '<p class="mut">The engine gives no forms for this combination (for example, bhāve prayoga needs an intransitive root).</p>';
  } else {
    let r = `<table class="kt"><tr><th>प्रत्ययः</th><th>रूपम्</th><th>use</th><th>sūtra</th></tr>`;
    for (const [k, kd, en, s] of C.KRTL) { const ps = C.krt(di, k, o); if (!ps.length) continue; const forms = [...new Set(ps.map(p => p.text))];
      const decl = ['kta', 'ktavatu', 'Satf', 'SAnac', 'tavya', 'anIyar', 'yat', 'Ryat', 'Rvul', 'tfc', 'lyuw', 'GaY', 'ktin', 'ac', 'kvasu', 'kAnac'].includes(k);
      r += `<tr><td>${D(kd)}</td>${cell(ps)}<td><small>${en}</small>${decl ? ` · <a href="shabda.html#${forms[0]}/${k === 'ktin' ? 'S' : k === 'lyuw' ? 'N' : 'P'}">declension ›</a>` : ''}</td><td>${sutraLink(s)}</td></tr>` }
    out.innerHTML = r + '</table><p class="mut small">With an upasarga, क्त्वा becomes ल्यप् automatically (समासेऽनञ्पूर्वे क्त्वो ल्यप् 7.1.37). Click any form for its derivation.</p>';
  }
  bindPK(out);
}
export async function start() {
  $('#app').innerHTML = `<h1>धातुरूपाणि</h1><p class="sub">Dhātu-rūpāvalī · all ${'2,229'} roots of the Pāṇinian Dhātupāṭha in every lakāra, puruṣa and vacana, active and passive, with upasargas and causative / desiderative / intensive — every form with its derivation sūtra by sūtra</p>
   <div class="ctl"><input id="q" placeholder="root, meaning or number · भू · gam · गतौ · 01.0001" autocomplete="off" style="flex:1;min-width:220px"><div class="chipset" id="gn"><button data-g="-1" aria-pressed="true">सर्वे</button>${C.GANAD.slice(0, 10).map((g, i) => `<button data-g="${i}">${D(g)}</button>`).join('')}</div></div>
   <div class="lay"><div class="list" id="list"></div><div id="main"><div class="load">…</div></div></div>`;
  await C.engine(); readHash();
  $('#q').oninput = ev => { ST.q = ev.target.value; list() };
  $$('#gn button').forEach(b => b.onclick = () => { ST.gana = +b.dataset.g; $$('#gn button').forEach(x => x.setAttribute('aria-pressed', x === b)); list() });
  list(); draw();
  window.addEventListener('hashchange', () => { readHash(); draw(); list() });
}
