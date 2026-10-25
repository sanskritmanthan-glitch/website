// शब्दरूपाणि — decline any stem in any gender, with model paradigms grouped by ending, and each form's derivation.
import * as C from './core.js';
import { $, $$, E, sh, D, supTable, bindPK, resetPK } from './ui.js';
const MODELS = [
  ['अजन्ताः पुंलिङ्गाः · vowel stems, masculine', [['rAma', 'P'], ['hari', 'P'], ['guru', 'P'], ['pitf', 'P'], ['dAtf', 'P'], ['sKi', 'P'], ['go', 'P'], ['rE', 'P']]],
  ['अजन्ताः स्त्रीलिङ्गाः · vowel stems, feminine', [['ramA', 'S'], ['mati', 'S'], ['nadI', 'S'], ['Denu', 'S'], ['vaDU', 'S'], ['mAtf', 'S'], ['SrI', 'S'], ['strI', 'S'], ['lakzmI', 'S']]],
  ['अजन्ताः नपुंसकलिङ्गाः · vowel stems, neuter', [['vana', 'N'], ['vAri', 'N'], ['maDu', 'N'], ['jYAtf', 'N']]],
  ['हलन्ताः · consonant stems', [['rAjan', 'P'], ['Atman', 'P'], ['Bagavat', 'P'], ['mahat', 'P'], ['vidvas', 'P'], ['marut', 'P'], ['vAc', 'S'], ['sraj', 'S'], ['dik', 'S'], ['manas', 'N'], ['nAman', 'N'], ['jagat', 'N'], ['payas', 'N'], ['karman', 'N']]],
  ['सर्वनामानि · pronouns', [['sarva', 'P'], ['sarva', 'S'], ['sarva', 'N'], ['tad', 'P'], ['tad', 'S'], ['tad', 'N'], ['yad', 'P'], ['etad', 'P'], ['idam', 'P'], ['idam', 'S'], ['idam', 'N'], ['adas', 'P'], ['kim', 'P'], ['kim', 'S'], ['asmad', 'P'], ['yuzmad', 'P'], ['Bavat', 'P']]],
  ['सङ्ख्याः · numerals', [['eka', 'P'], ['dvi', 'P'], ['tri', 'P'], ['tri', 'S'], ['catur', 'P'], ['catur', 'S'], ['paYcan', 'P'], ['zaz', 'P'], ['saptan', 'P'], ['azwan', 'P'], ['navan', 'P'], ['daSan', 'P']]],
];
let ST = { stem: 'rAma', g: 'P' };
function readHash() { const [s, g] = decodeURIComponent(location.hash.slice(1)).split('/'); if (s) ST.stem = /[ऀ-ॿఀ-౿]|[āīūṛṣśṇṭḍ]/.test(s) ? C.toSLP(s) : s; if (g && 'PSN'.includes(g)) ST.g = g }
function draw() {
  resetPK(); history.replaceState(null, '', '#' + ST.stem + '/' + ST.g);
  $('#stem').value = sh(ST.stem); $$('#lg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === ST.g));
  const grid = []; for (let vi = 0; vi < 8; vi++) { grid.push([]); for (let va = 0; va < 3; va++) grid[vi].push(C.sup(ST.stem, ST.g, vi, va)) }
  const any = grid.flat().some(x => x.length);
  let h = `<div class="dcard"><h2>${E(sh(ST.stem))}</h2><div class="meta">${D(C.LIND[ST.g])} · प्रातिपदिकम्</div></div>`;
  h += any ? supTable((vi, va) => grid[vi][va], `${E(sh(ST.stem))} · ${D(C.LIND[ST.g])}`) : '<p class="mut">No forms — check the stem (give the prātipadika, e.g. राम, हरि, राजन्, मनस्) and the gender.</p>';
  h += `<p class="mut small">Click any form to see its derivation. For ā- and ī-stems in the feminine (रमा, नदी) the engine adds the strī-pratyaya (टाप्, ङीप्) itself. Adjectives: give the masculine stem and choose the gender (सुन्दर → सुन्दरी).</p>`;
  $('#main').innerHTML = h; bindPK($('#main'));
}
export async function start() {
  $('#app').innerHTML = `<h1>शब्दरूपाणि</h1><p class="sub">Śabda-rūpāvalī · decline any word in all three genders — eight vibhaktis × three numbers — with the derivation of every form</p>
   <div class="ctl"><input id="stem" placeholder="stem · राम · hari · rājan · मनस्" autocomplete="off" style="min-width:220px"><div class="chipset" id="lg">${['P', 'S', 'N'].map(g => `<button data-g="${g}">${D(C.LIND[g])}</button>`).join('')}</div><button class="btn" id="go">रूपाणि ›</button></div>
   <div class="lay"><div class="list" id="list">${MODELS.map(([t, ws]) => `<div class="gh">${D(t)}</div>` + ws.map(([s, g]) => `<button data-s="${s}" data-g="${g}"><span>${E(sh(s))}</span><small>${D(C.LIND[g])}</small></button>`).join('')).join('')}</div><div id="main"><div class="load">…</div></div></div>`;
  await C.engine(); readHash();
  $('#go').onclick = () => { ST.stem = C.toSLP($('#stem').value).replace(/\s/g, '') || ST.stem; draw() };
  $('#stem').onkeydown = e => { if (e.key === 'Enter') $('#go').click() };
  $$('#lg button').forEach(b => b.onclick = () => { ST.g = b.dataset.g; ST.stem = C.toSLP($('#stem').value).replace(/\s/g, '') || ST.stem; draw() });
  $$('#list button').forEach(b => b.onclick = () => { ST.stem = b.dataset.s; ST.g = b.dataset.g; draw(); window.scrollTo({ top: $('#main').offsetTop - 70, behavior: 'smooth' }) });
  draw();
  window.addEventListener('hashchange', () => { readHash(); draw() });
}
