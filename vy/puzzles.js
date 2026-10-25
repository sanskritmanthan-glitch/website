// तिङ्सुडोकु · शब्दजालम् · रूपमेलनम्
import { registerCustom, C, E, D } from './games.js';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const shell = (K, back, title, li, L) => {
  K.app().innerHTML = `<p class="crumb"><a href="#${back}">‹ ${E(D(title))}</a></p><div class="hud"><span class="lvn">स्तरः ${li + 1} · ${E(D(L.n))}</span><span id="qn"></span>${K.walletBar()}</div><div class="qcard wide" id="qc"><div class="load">…</div></div>`;
  K.bindWallet();
};
const endCard = (K, back, li, n, stars, msg, tokens) => {
  const old = K.finishLevel(li, stars); if (stars > old) K.earn(5 * (stars - old), 'level bonus');
  return `<div class="res"><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2>${stars ? 'विजयी भव!' : 'पुनः प्रयतस्व'}</h2><p>${msg} · +${tokens} 🪙</p>
   <div class="fa"><a class="btn ghost" href="#${back}">स्तराः</a>${li + 1 < n ? `<a class="btn" href="#${back}/${li + 2}">अग्रिमः स्तरः ›</a>` : ''}</div></div>`;
};

/* ======================= तिङ्सुडोकु ======================= */
const PV = ['प्र॰ एक॰', 'प्र॰ द्वि॰', 'प्र॰ बहु॰', 'म॰ एक॰', 'म॰ द्वि॰', 'म॰ बहु॰', 'उ॰ एक॰', 'उ॰ द्वि॰', 'उ॰ बहु॰'];
const SU = [
  { n: 'परस्मैपदप्रत्ययाः', e: 'The nine endings of the present: ti tas anti …', s: ['ति', 'तः', 'अन्ति', 'सि', 'थः', 'थ', 'मि', 'वः', 'मः'], key: PV, giv: 46 },
  { n: 'परस्मैपदम् · कठिनम्', e: 'Same endings, fewer clues', s: ['ति', 'तः', 'अन्ति', 'सि', 'थः', 'थ', 'मि', 'वः', 'मः'], key: PV, giv: 36 },
  { n: 'भू · लट्', e: 'bhavati … bhavāmaḥ', s: ['भवति', 'भवतः', 'भवन्ति', 'भवसि', 'भवथः', 'भवथ', 'भवामि', 'भवावः', 'भवामः'], key: PV, giv: 36 },
  { n: 'आत्मनेपदप्रत्ययाः', e: 'te ete ante se ethe dhve e vahe mahe', s: ['ते', 'एते', 'अन्ते', 'से', 'एथे', 'ध्वे', 'ए', 'वहे', 'महे'], key: PV, giv: 34 },
  { n: 'भू · लोट्', e: 'Imperative: bhavatu … bhavāma', s: ['भवतु', 'भवताम्', 'भवन्तु', 'भव', 'भवतम्', 'भवत', 'भवानि', 'भवाव', 'भवाम'], key: PV, giv: 32 },
  { n: 'एध् · लट्', e: 'Ātmanepada: edhate … edhāmahe', s: ['एधते', 'एधेते', 'एधन्ते', 'एधसे', 'एधेथे', 'एधध्वे', 'एधे', 'एधावहे', 'एधामहे'], key: PV, giv: 30 },
  { n: 'कृ · लृट्', e: 'Future: kariṣyati … kariṣyāmaḥ', s: ['करिष्यति', 'करिष्यतः', 'करिष्यन्ति', 'करिष्यसि', 'करिष्यथः', 'करिष्यथ', 'करिष्यामि', 'करिष्यावः', 'करिष्यामः'], key: PV, giv: 28 },
  { n: 'भू · नव लकाराः', e: 'One form in nine lakāras', s: ['भवति', 'बभूव', 'भविता', 'भविष्यति', 'भवतु', 'अभवत्', 'भवेत्', 'भूयात्', 'अभूत्'], key: ['लट्', 'लिट्', 'लुट्', 'लृट्', 'लोट्', 'लङ्', 'विधिलिङ्', 'आशीर्लिङ्', 'लुङ्'], giv: 26 },
];
function solved() {
  const g = Array(81).fill(-1);
  const ok = (i, v) => { const r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3;
    for (let k = 0; k < 9; k++) { if (g[r * 9 + k] === v || g[k * 9 + c] === v) return false; if (g[(br + Math.floor(k / 3)) * 9 + bc + k % 3] === v) return false } return true };
  const fill = i => { if (i === 81) return true; for (const v of C.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])) if (ok(i, v)) { g[i] = v; if (fill(i + 1)) return true; g[i] = -1 } return false };
  fill(0); return g;
}
registerCustom('sudoku', { levels: SU, async play(li, K) {
  const L = SU[li]; shell(K, 'sudoku', 'तिङ्सुडोकु', li, L);
  const sol = solved(), giv = new Set(C.shuffle([...Array(81).keys()]).slice(0, L.giv)), cur = sol.map((v, i) => giv.has(i) ? v : -1);
  let sel = -1, mistakes = 0, hints = 3; const t0 = Date.now();
  const sym = v => v < 0 ? '' : E(D(L.s[v]));
  $('#qc').innerHTML = `<div class="sdk-wrap"><div class="sdk" id="sdk">${cur.map((v, i) => `<button class="cell ${giv.has(i) ? 'giv' : ''}" data-i="${i}">${sym(v)}</button>`).join('')}</div>
    <div class="side"><div class="pal" id="pal">${L.s.map((s, k) => `<button data-v="${k}"><b>${E(D(s))}</b><small>${E(D(L.key[k]))}</small></button>`).join('')}<button data-v="-1" class="er">⌫</button></div>
    <p class="mut small">Every row, column and 3×3 box must hold each of the nine once. Tap a cell, then a form. The small label under each form is its place in the paradigm — the key to remembering it.</p>
    <div class="fa"><button class="lnk" id="hint">💡 hint (3)</button><span id="mis"></span></div></div></div>`;
  const conflict = i => { const v = cur[i]; if (v < 0) return false; const r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3;
    for (let k = 0; k < 9; k++) { const a = r * 9 + k, b = k * 9 + c, d = (br + Math.floor(k / 3)) * 9 + bc + k % 3; if ((a !== i && cur[a] === v) || (b !== i && cur[b] === v) || (d !== i && cur[d] === v)) return true } return false };
  const paint = () => { $$('.cell').forEach((b, i) => { b.innerHTML = sym(cur[i]); b.classList.toggle('sel', i === sel); b.classList.toggle('bad', conflict(i));
      const r = Math.floor(i / 9), c = i % 9, sr = Math.floor(sel / 9), scc = sel % 9; b.classList.toggle('hl', sel >= 0 && (r === sr || c === scc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(scc / 3)))) });
    $('#mis').textContent = mistakes ? `✗ ${mistakes}` : ''; $('#qn').textContent = `${cur.filter(v => v >= 0).length}/81` };
  paint();
  $$('.cell').forEach(b => b.onclick = () => { sel = +b.dataset.i; paint() });
  const put = v => { if (sel < 0 || giv.has(sel)) return; cur[sel] = v; if (v >= 0 && v !== sol[sel]) { mistakes++; K.beep(false) } paint(); check() };
  $$('#pal button').forEach(b => b.onclick = () => put(+b.dataset.v));
  document.onkeydown = e => { if (/^[1-9]$/.test(e.key)) put(+e.key - 1); if (e.key === 'Backspace' || e.key === 'Delete') put(-1);
    const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 }[e.key]; if (mv && sel >= 0) { sel = Math.min(80, Math.max(0, sel + mv)); paint(); e.preventDefault() } };
  $('#hint').onclick = () => { if (!hints) return; const empty = cur.map((v, i) => v !== sol[i] ? i : -1).filter(i => i >= 0); if (!empty.length) return; const i = C.pick(empty); cur[i] = sol[i]; giv.add(i); hints--; $('#hint').textContent = `💡 hint (${hints})`; paint(); check() };
  function check() {
    if (cur.some((v, i) => v < 0 || conflict(i))) return;
    document.onkeydown = null; K.beep(true);
    const mins = Math.round((Date.now() - t0) / 60000), stars = mistakes === 0 && hints === 3 ? 3 : mistakes <= 3 ? 2 : 1, n = 5 + 2 * li; K.earn(n, 'sudoku');
    $('#qc').insertAdjacentHTML('beforeend', endCard(K, 'sudoku', li, SU.length, stars, `solved in ${mins || '<1'} min, ${mistakes} mistakes`, n));
  }
} });

/* ======================= शब्दजालम् (crossword) ======================= */
const VW = 'aAiIuUfFxXeEoO';
function aksharas(s) {          // SLP word → akṣaras (consonant cluster + vowel [+ṃ/ḥ]); a final consonant joins the last akṣara
  const out = []; let cur = '';
  for (let i = 0; i < s.length; i++) { const c = s[i]; cur += c;
    if (VW.includes(c)) { while ('MH~'.includes(s[i + 1] || '#') && s[i + 1]) { cur += s[++i] } out.push(cur); cur = '' } }
  if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur) }
  return out;
}
const JL = [
  { n: 'भू-रूपाणि', e: 'Forms of bhū — the clue gives lakāra, person and number', src: 'verb', dh: 1, words: 6 },
  { n: 'धातुरूपाणि', e: 'Forms of common roots', src: 'verb', dh: 12, words: 7 },
  { n: 'अमरकोशः · सुगमः', e: 'Find the word from its synonyms (Amarakośa)', src: 'amara', words: 6 },
  { n: 'अमरकोशः', e: 'A bigger Amarakośa crossword', src: 'amara', words: 8 },
  { n: 'मिश्रम्', e: 'Verb forms and Amarakośa words together', src: 'mix', dh: 25, words: 9 },
];
async function wordsFor(L) {
  const out = [];
  if (L.src === 'verb' || L.src === 'mix') {
    await C.engine(); const GD = await C.getJSON(new URL('game_dhatus.json', import.meta.url).href);
    for (let t = 0; t < 200 && out.length < (L.src === 'mix' ? 4 : L.words + 4); t++) {
      const di = L.dh === 1 ? GD[0] : C.pick(GD.slice(0, L.dh)), la = C.pick([0, 5, 6, 7, 3]), pu = C.rand(3), va = C.rand(3);
      const f = C.tinForms(di, la, 0, pu, va)[0]; if (!f) continue; const a = aksharas(f); if (a.length < 2 || a.length > 5 || out.some(w => w.slp === f)) continue;
      out.push({ slp: f, ak: a, clue: `${C.dhatuPlain(C.DH[di][1])} · ${C.LAKD[la]} · ${C.PURS[pu]} ${C.VACS[va]}` });
    }
  }
  if (L.src === 'amara' || L.src === 'mix') {
    const d = await C.getJSON('ko/amara.json');
    for (let t = 0; t < 400 && out.length < L.words + 5; t++) {
      const w = C.pick(d.words); if (!/^[PSN]$/.test(w[1])) continue; const s = C.d2s(w[0]); if (!/^[a-zA-Z]+$/.test(s)) continue;
      const a = aksharas(s); if (a.length < 2 || a.length > (L.src === 'amara' && L.words <= 6 ? 4 : 5) || out.some(x => x.slp === s)) continue;
      const syn = (d.sets[w[3]] || []).filter(x => x !== w[0]); if (syn.length < 2) continue;
      out.push({ slp: s, ak: a, clue: C.shuffle(syn).slice(0, 3).join(', '), g: C.LIND[w[1]] });
    }
  }
  return out;
}
function layout(words, N = 13) {
  const grid = new Map(), placed = []; const k = (r, c) => r + ',' + c;
  const can = (w, r, c, dr, dc) => {
    let cross = 0;
    for (let i = 0; i < w.ak.length; i++) { const rr = r + dr * i, cc = c + dc * i; if (rr < 0 || cc < 0 || rr >= N || cc >= N) return -1;
      const g = grid.get(k(rr, cc)); if (g) { if (g !== w.ak[i]) return -1; cross++ }
      else { if (grid.get(k(rr + dc, cc + dr)) || grid.get(k(rr - dc, cc - dr))) return -1 } }
    if (grid.get(k(r - dr, c - dc)) || grid.get(k(r + dr * w.ak.length, c + dc * w.ak.length))) return -1;
    return cross;
  };
  const put = (w, r, c, dr, dc) => { for (let i = 0; i < w.ak.length; i++) grid.set(k(r + dr * i, c + dc * i), w.ak[i]); placed.push({ ...w, r, c, dr, dc }) };
  const ws = words.slice().sort((a, b) => b.ak.length - a.ak.length);
  put(ws[0], Math.floor(N / 2), Math.floor((N - ws[0].ak.length) / 2), 0, 1);
  for (const w of ws.slice(1)) {
    let best = null;
    for (const p of placed) for (let i = 0; i < p.ak.length; i++) for (let j = 0; j < w.ak.length; j++) {
      if (p.ak[i] !== w.ak[j]) continue; const dr = p.dr ? 0 : 1, dc = p.dr ? 1 : 0;
      const r = p.r + p.dr * i - dr * j, c = p.c + p.dc * i - dc * j, x = can(w, r, c, dr, dc);
      if (x > 0 && (!best || x > best.x)) best = { r, c, dr, dc, x };
    }
    if (best) put(w, best.r, best.c, best.dr, best.dc);
  }
  return placed;
}
registerCustom('jala', { levels: JL, async play(li, K) {
  const L = JL[li]; shell(K, 'jala', 'शब्दजालम्', li, L);
  let placed = [];
  for (let t = 0; t < 6 && placed.length < Math.min(L.words, 5); t++) { const ws = await wordsFor(L); placed = layout(ws).slice(0, L.words) }
  const r0 = Math.min(...placed.map(p => p.r)), c0 = Math.min(...placed.map(p => p.c));
  placed.forEach(p => { p.r -= r0; p.c -= c0 });
  const R = Math.max(...placed.map(p => p.r + p.dr * (p.ak.length - 1))) + 1, Cn = Math.max(...placed.map(p => p.c + p.dc * (p.ak.length - 1))) + 1;
  const cells = {}; placed.forEach((p, wi) => p.ak.forEach((a, i) => { const id = (p.r + p.dr * i) + ',' + (p.c + p.dc * i); cells[id] = cells[id] || { a, words: [] }; cells[id].words.push(wi) }));
  const starts = {}; let num = 0; placed.sort((a, b) => a.r - b.r || a.c - b.c).forEach(p => { const id = p.r + ',' + p.c; if (!starts[id]) starts[id] = ++num; p.num = starts[id] });
  Object.values(cells).forEach(c => c.words = []); placed.forEach((p, wi) => p.ak.forEach((a, i) => cells[(p.r + p.dr * i) + ',' + (p.c + p.dc * i)].words.push(wi)));
  const val = {}; let sel = null, hints = 2; const t0 = Date.now();
  const cl = (dir) => placed.map((p, wi) => [p, wi]).filter(([p]) => dir ? p.dr : p.dc).map(([p, wi]) => `<li data-w="${wi}"><b>${p.num}</b> ${E(D(p.clue))}${p.g ? ` <small>${E(D(p.g))}</small>` : ''} <small>(${p.ak.length})</small></li>`).join('');
  $('#qc').innerHTML = `<div class="xw-wrap"><div class="xw" style="grid-template-columns:repeat(${Cn},minmax(30px,48px))">${[...Array(R * Cn).keys()].map(i => { const r = Math.floor(i / Cn), c = i % Cn, id = r + ',' + c;
      return cells[id] ? `<button class="xc" data-id="${id}">${starts[id] ? `<i>${starts[id]}</i>` : ''}<span></span></button>` : '<div class="xb"></div>' }).join('')}</div>
    <div class="side"><h3>→ अनुप्रस्थम्</h3><ol class="clues">${cl(0)}</ol><h3>↓ ऊर्ध्वम्</h3><ol class="clues">${cl(1)}</ol>
    <div class="pal ak" id="pal"><p class="mut small" style="grid-column:1/-1">Tap a square (or a clue) — the letters to choose from appear here.</p></div><div class="fa"><button class="lnk" id="hint">💡 hint (2)</button><button class="lnk" id="chk">परीक्षा · check</button></div></div></div>`;
  const paint = () => { $$('.xc').forEach(b => { const id = b.dataset.id; b.querySelector('span').textContent = val[id] ? D(C.s2d(val[id])) : ''; b.classList.toggle('sel', id === sel);
    b.classList.toggle('hl', !!sel && cells[sel].words.some(w => cells[id].words.includes(w))) }) };
  const palette = () => { if (!sel) return; const ws = cells[sel].words; const need = new Set(); ws.forEach(w => placed[w].ak.forEach(a => need.add(a)));
    const all = new Set(Object.values(cells).map(c => c.a)); const extra = C.shuffle([...all].filter(a => !need.has(a))).slice(0, 4);
    $('#pal').innerHTML = C.shuffle([...need, ...extra]).map(a => `<button data-a="${a}">${E(D(C.s2d(a)))}</button>`).join('') + '<button data-a="" class="er">⌫</button>';
    $$('#pal button').forEach(b => b.onclick = () => { val[sel] = b.dataset.a; const ws = cells[sel].words[0], p = placed[ws];
      // move to the next empty cell of the same word
      const ids = p.ak.map((_, i) => (p.r + p.dr * i) + ',' + (p.c + p.dc * i)); const nx = ids.find(id => !val[id]); if (nx) sel = nx; paint(); palette(); done() }) };
  $$('.xc').forEach(b => b.onclick = () => { sel = b.dataset.id; paint(); palette() });
  $$('.clues li').forEach(li2 => li2.onclick = () => { const p = placed[+li2.dataset.w]; sel = p.r + ',' + p.c; paint(); palette() });
  $('#hint').onclick = () => { if (!hints) return; const ids = Object.keys(cells).filter(id => val[id] !== cells[id].a); if (!ids.length) return; const id = C.pick(ids); val[id] = cells[id].a; hints--; $('#hint').textContent = `💡 hint (${hints})`; paint(); done() };
  $('#chk').onclick = () => $$('.xc').forEach(b => { const id = b.dataset.id; b.classList.toggle('bad', !!val[id] && val[id] !== cells[id].a) });
  paint();
  function done() {
    if (Object.keys(cells).some(id => val[id] !== cells[id].a)) return;
    K.beep(true); const stars = hints === 2 ? 3 : hints === 1 ? 2 : 1, n = 5 + 2 * li; K.earn(n, 'crossword');
    $('#qc').insertAdjacentHTML('beforeend', `<div class="ans">${placed.map(p => `<span>${p.num}. ${E(C.show(p.slp))}</span>`).join(' · ')}</div>` + endCard(K, 'jala', li, JL.length, stars, `${placed.length} words in ${Math.round((Date.now() - t0) / 1000)} s`, n));
  }
} });

/* ======================= रूपमेलनम् (memory) ======================= */
const ME = [
  { n: 'भू · लट्', e: '6 pairs: form ↔ person and number', pairs: 6, kind: 'lat' },
  { n: 'लकाराः', e: '8 pairs: a form ↔ its lakāra', pairs: 8, kind: 'lak' },
  { n: 'रामशब्दः', e: '8 pairs: a form of rāma ↔ its vibhakti', pairs: 8, kind: 'rama' },
  { n: 'धातवः', e: '10 pairs: a verb ↔ its root', pairs: 10, kind: 'root' },
  { n: 'कृदन्ताः', e: '10 pairs: gatvā ↔ gam + ktvā …', pairs: 10, kind: 'krt' },
];
async function pairsFor(L) {
  await C.engine(); const GD = await C.getJSON(new URL('game_dhatus.json', import.meta.url).href); const P = [], seen = new Set();
  const add = (a, b) => { if (!a || seen.has(a) || seen.has('#' + b)) return; seen.add(a); seen.add('#' + b); P.push([C.show(a), D(b)]) };
  if (L.kind === 'lat') for (const [pu, va] of C.shuffle([...Array(9).keys()].map(i => [Math.floor(i / 3), i % 3])).slice(0, L.pairs)) add(C.tinForms(GD[0], 0, 0, pu, va)[0], `${C.PURD[pu]} · ${C.VACD[va]}`);
  if (L.kind === 'lak') { const di = C.pick(GD.slice(0, 8)); for (const la of C.shuffle([0, 1, 2, 3, 5, 6, 7, 8, 9, 10]).slice(0, L.pairs)) add(C.tinForms(di, la, 0, 0, 0)[0], C.LAKD[la]) }
  if (L.kind === 'rama') for (let t = 0; t < 60 && P.length < L.pairs; t++) { const vi = C.rand(7), va = C.rand(3), f = C.supForms('rAma', 'P', vi, va)[0];
    let n = 0; for (let a = 0; a < 7; a++) for (let b = 0; b < 3; b++) if (C.supForms('rAma', 'P', a, b).includes(f)) n++; if (n === 1) add(f, `${C.VIBD[vi]} · ${C.VACS[va]}`) }
  if (L.kind === 'root') for (const di of C.shuffle(GD.slice(0, 40))) { if (P.length >= L.pairs) break; add(C.tinForms(di, C.pick([0, 6, 3]), 0, 0, 0)[0], C.dhatuPlain(C.DH[di][1])) }
  if (L.kind === 'krt') { const K2 = [['ktvA', 'क्त्वा'], ['tumun', 'तुमुन्'], ['kta', 'क्त'], ['tavya', 'तव्य'], ['anIyar', 'अनीयर्'], ['Satf', 'शतृ'], ['ktavatu', 'क्तवतु']];
    for (let t = 0; t < 80 && P.length < L.pairs; t++) { const di = C.pick(GD.slice(0, 30)), [k, kd] = C.pick(K2); const f = C.krt(di, k)[0]; if (f) add(f.text, `${C.dhatuPlain(C.DH[di][1])} + ${kd}`) } }
  return P;
}
registerCustom('mela', { levels: ME, async play(li, K) {
  const L = ME[li]; shell(K, 'mela', 'रूपमेलनम्', li, L);
  const P = await pairsFor(L); const cards = C.shuffle(P.flatMap((p, i) => [{ i, t: p[0], f: 1 }, { i, t: p[1], f: 0 }]));
  let open = [], moves = 0, found = 0; const t0 = Date.now();
  $('#qc').innerHTML = `<div class="mem" style="grid-template-columns:repeat(${cards.length > 16 ? 5 : 4},1fr)">${cards.map((c, k) => `<button class="mc" data-k="${k}"><span class="back">ॐ</span><span class="face ${c.f ? 'form' : ''}">${E(c.t)}</span></button>`).join('')}</div><p class="mut small center" id="mv"></p>`;
  $$('.mc').forEach(b => b.onclick = () => {
    const k = +b.dataset.k; if (b.classList.contains('up') || open.length === 2) return;
    b.classList.add('up'); open.push(k);
    if (open.length === 2) { moves++; const [a, c] = open.map(x => cards[x]);
      if (a.i === c.i && a.f !== c.f) { K.beep(true); open.forEach(x => $$('.mc')[x].classList.add('got')); open = []; found++;
        if (found === P.length) { const stars = moves <= P.length + 2 ? 3 : moves <= P.length * 1.6 ? 2 : 1, n = 3 + 2 * li; K.earn(n, 'memory');
          $('#qc').insertAdjacentHTML('beforeend', endCard(K, 'mela', li, ME.length, stars, `${moves} moves · ${Math.round((Date.now() - t0) / 1000)} s`, n)) } }
      else setTimeout(() => { open.forEach(x => $$('.mc')[x].classList.remove('up')); open = [] }, 900) }
    $('#mv').textContent = `${moves} moves · ${found}/${P.length}`;
  });
} });
