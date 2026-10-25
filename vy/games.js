// क्रीडाङ्गणम् — grammar games with levels (slow → fast), tokens and rewards.
import * as C from './core.js';
import { join as sandhiJoin, RULES } from './sandhi.js';
const $ = s => document.querySelector(s), app = () => $('#app');
const E = C.esc, sh = C.show, D = C.showD;

/* ---------------- sound (optional) ---------------- */
let AC = null, SOUND = true; try { SOUND = localStorage.getItem('sm-sound') !== '0' } catch (e) {}
function beep(ok) { if (!SOUND) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine'; o.frequency.value = ok ? 660 : 180; g.gain.setValueAtTime(.12, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + (ok ? .25 : .35));
  o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + .4); if (ok) { const o2 = AC.createOscillator(); o2.frequency.value = 990; o2.connect(g); o2.start(AC.currentTime + .09); o2.stop(AC.currentTime + .3) } } catch (e) {} }

/* ---------------- ranks and wallet bar ---------------- */
const RANKS = [[0, 'शिष्यः', 'Pupil'], [50, 'छात्रः', 'Student'], [150, 'अध्येता', 'Scholar'], [400, 'विद्वान्', 'Learned'], [1000, 'पण्डितः', 'Paṇḍita'], [2500, 'आचार्यः', 'Ācārya'], [5000, 'वैयाकरणः', 'Grammarian']];
const rank = t => RANKS.filter(r => t >= r[0]).pop();
export function walletBar() {
  const w = C.wallet(), r = rank(w.total), nx = RANKS.find(x => x[0] > w.total), toR = C.REWARD.every - (w.tokens % C.REWARD.every);
  const pct = Math.min(100, Math.round(100 * (w.tokens % C.REWARD.every) / C.REWARD.every));
  return `<div class="wallet"><div class="coin" title="tokens">🪙 <b id="tk">${w.tokens}</b></div>
   <div class="rank"><span class="rk">${D(r[1])}</span> <small>${r[2]}${nx ? ` · ${nx[0] - w.total} → ${D(nx[1])}` : ''}</small></div>
   <div class="goal"><div class="gbar"><i style="width:${pct}%"></i></div><small>${w.tokens >= C.REWARD.every ? `<button class="claim" id="claim">🎁 ${C.REWARD.value} पारितोषिकम् · claim</button>` : `${toR} more tokens → ${C.REWARD.value} book voucher`}</small></div>
   <button class="snd" id="snd" title="sound">${SOUND ? '🔊' : '🔇'}</button></div>`;
}
function bindWallet() {
  $('#snd') && ($('#snd').onclick = () => { SOUND = !SOUND; try { localStorage.setItem('sm-sound', SOUND ? '1' : '0') } catch (e) {} ; $('#snd').textContent = SOUND ? '🔊' : '🔇' });
  $('#claim') && ($('#claim').onclick = claim);
}
function claim() {
  const w = C.wallet();
  const body = C.REWARD.code
    ? `<p>नमो नमः! You have earned ${C.REWARD.every} tokens. Your voucher for ${C.REWARD.value} off a Sanskrit Manthan book on Google Play:</p><p class="code">${E(C.REWARD.code)}</p><p class="mut">Redeem it in the Google Play Store app → Menu → Redeem code. ${C.REWARD.every} tokens have been used.</p>`
    : `<p>साधु! You have earned ${C.REWARD.every} tokens. The ${C.REWARD.value} book vouchers are being set up on Google Play — your tokens are saved and you will be able to claim as soon as they are live.</p>`;
  modal(`<h2>🎁 पारितोषिकम्</h2>${body}<p><button class="btn" id="mok">ठीक · OK</button></p>`);
  if (C.REWARD.code) { w.tokens -= C.REWARD.every; w.claimed = (w.claimed || 0) + 1; C.saveWallet(w) }
  $('#mok').onclick = () => { closeModal(); route() };
}
function modal(h) { let m = $('#modal'); if (!m) { m = document.createElement('div'); m.id = 'modal'; document.body.appendChild(m) } m.innerHTML = `<div class="mbox">${h}</div>`; m.hidden = false }
function closeModal() { const m = $('#modal'); if (m) m.hidden = true }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = t; document.body.appendChild(d); setTimeout(() => d.classList.add('out'), 1400); setTimeout(() => d.remove(), 2000) }
function earn(n, why) { if (n <= 0) return; const w = C.award(n); const t = $('#tk'); if (t) { t.textContent = w.tokens; t.parentNode.classList.remove('pop'); void t.offsetWidth; t.parentNode.classList.add('pop') }
  if (why) toast(`+${n} 🪙 ${why}`); if (w.tokens >= C.REWARD.every && (w.tokens - n) < C.REWARD.every) setTimeout(() => toast('🎁 voucher unlocked!'), 900) }
function lvState(g) { const w = C.wallet(); w.levels[g] = w.levels[g] || { open: 0, stars: {} }; return w }
function finishLevel(g, li, stars, nLevels) {
  const w = lvState(g), st = w.levels[g]; const old = st.stars[li] || 0;
  if (stars > old) st.stars[li] = stars;
  if (stars >= 1 && st.open <= li && li + 1 < nLevels) st.open = li + 1;
  C.saveWallet(w); return old;
}

/* ---------------- games ---------------- */
let GD = [];             // everyday dhātus, easiest first
const citation = di => { const e = C.DH[di]; return `${C.dhatuPlain(e[1])}` };
const lat3 = {};
function lat(di) { if (!(di in lat3)) { const f = C.tinForms(di, 0, 0, 0, 0); lat3[di] = f.find(x => /ti$/.test(x)) || f[0] || '' } return lat3[di] }
const dLabel = di => `<span class="dh">${E(sh(C.d2s(citation(di))))}</span> <small>(${E(sh(lat(di)))} · ${E(sh(C.DH[di][4]))})</small>`;
const T = (la, pu, va) => `${C.LAKD[la]} · ${C.PURS[pu]} · ${C.VACS[va]}`;

const RL = [
  { n: 'लट् · प्रथमः पादः', e: 'Present tense, 10 common roots, 3 choices', dh: 10, la: [0], mcq: 3 },
  { n: 'लट्', e: 'Present tense, 25 roots, 4 choices', dh: 25, la: [0], mcq: 4 },
  { n: 'लङ् · लोट्', e: 'Imperfect and imperative', dh: 25, la: [6, 5], mcq: 4 },
  { n: 'लृट् · विधिलिङ्', e: 'Future and optative', dh: 35, la: [3, 7], mcq: 4, timer: 40 },
  { n: 'रूपपरिचयः', e: 'See a form — name its lakāra, person and number', dh: 35, la: [0, 6, 5, 3, 7], mcq: 4, id: 1, timer: 40 },
  { n: 'लिखत · लट् लङ् लोट्', e: 'Type the form yourself', dh: 30, la: [0, 6, 5], type: 1, timer: 45 },
  { n: 'लिट् · लुट्', e: 'Perfect and periphrastic future', dh: 50, la: [1, 2], mcq: 4, timer: 30 },
  { n: 'लुङ् · लृङ्', e: 'Aorist and conditional', dh: 50, la: [9, 10], mcq: 4, timer: 30 },
  { n: 'कर्मणि प्रयोगः', e: 'Passive voice', dh: 50, la: [0, 6, 5, 7], pr: [1], mcq: 4, timer: 25 },
  { n: 'उपसर्गाः', e: 'With prefixes: pra-, ā-, sam-, vi- …', dh: 50, la: [0, 6], pre: 1, mcq: 4, timer: 25 },
  { n: 'सर्वे लकाराः · लिखत', e: 'All ten lakāras, typed', dh: 97, la: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10], type: 1, timer: 30 },
  { n: 'वेगः · 60″', e: 'Blitz: as many as you can in 60 seconds', dh: 97, la: [0, 1, 2, 3, 5, 6, 7, 9], mcq: 4, blitz: 60 },
];
const UPS = [['pra'], ['AN'], ['sam'], ['vi'], ['anu'], ['upa'], ['ni'], ['pari'], ['aBi'], ['ud'], ['ava'], ['prati']];
const UPD = { pra: 'प्र', AN: 'आ', sam: 'सम्', vi: 'वि', anu: 'अनु', upa: 'उप', ni: 'नि', pari: 'परि', aBi: 'अभि', ud: 'उद्', ava: 'अव', prati: 'प्रति' };
async function qRupa(L) {
  for (let t = 0; t < 40; t++) {
    const di = C.pick(GD.slice(0, L.dh)), la = C.pick(L.la), pr = C.pick(L.pr || [0]), pu = C.rand(3), va = C.rand(3), pre = L.pre ? C.pick(UPS) : [];
    const forms = C.tinForms(di, la, pr, pu, va, { pre }); if (!forms.length) continue;
    const head = `${pre.length ? `<span class="up">${D(UPD[pre[0]])} +</span> ` : ''}${dLabel(di)}${pr ? ` · <b>${C.PRAD[pr]}</b>` : ''}`;
    const explain = async () => { const p = C.tin(di, la, pr, pu, va, { pre })[0]; return p ? await C.prakriyaHTML(p) : '' };
    if (L.id) {   // show a form, ask for its analysis
      const f = C.pick(forms), cells = [];
      for (const l2 of L.la) for (let p2 = 0; p2 < 3; p2++) for (let v2 = 0; v2 < 3; v2++) cells.push([l2, p2, v2]);
      const ok = c => C.tinForms(di, c[0], pr, c[1], c[2], { pre }).includes(f);
      const right = [la, pu, va], wrong = C.shuffle(cells.filter(c => !ok(c))).slice(0, L.mcq - 1);
      if (wrong.length < L.mcq - 1) continue;
      return { prompt: `<div class="big">${E(sh(f))}</div><div class="sub">${head}</div><div class="ask">कः लकारः, कः पुरुषः, किं वचनम्?</div>`,
        options: C.shuffle([{ h: T(...right), ok: true }, ...wrong.map(c => ({ h: T(...c), ok: false }))]), answer: T(...right), explain };
    }
    const prompt = `<div class="sub">${head}</div><div class="big">${T(la, pu, va)}</div>`;
    if (L.type) return { prompt, answers: forms, explain, answer: forms.map(sh).join(' / ') };
    const pool = new Set();
    for (let p2 = 0; p2 < 3; p2++) for (let v2 = 0; v2 < 3; v2++) C.tinForms(di, la, pr, p2, v2, { pre }).forEach(x => pool.add(x));
    for (const l2 of C.shuffle([0, 3, 5, 6, 7, 1]).slice(0, 2)) C.tinForms(di, l2, pr, pu, va, { pre }).forEach(x => pool.add(x));
    const wrong = C.shuffle([...pool].filter(x => !forms.includes(x))).slice(0, L.mcq - 1);
    if (wrong.length < L.mcq - 1) continue;
    return { prompt, options: C.shuffle([{ h: sh(forms[0]), ok: true }, ...wrong.map(x => ({ h: sh(x), ok: false }))]), answer: forms.map(sh).join(' / '), explain };
  }
}

const SL = [
  { n: 'रामशब्दः', e: 'a-stem masculine (rāma)', w: ['rAma.P'], mcq: 3 },
  { n: 'वन · रमा', e: 'a-stem neuter, ā-stem feminine', w: ['vana.N', 'ramA.S'], mcq: 4 },
  { n: 'हरि · मति · वारि', e: 'i-stems in three genders', w: ['hari.P', 'mati.S', 'vAri.N'], mcq: 4 },
  { n: 'गुरु · धेनु · मधु', e: 'u-stems in three genders', w: ['guru.P', 'Denu.S', 'maDu.N'], mcq: 4, timer: 40 },
  { n: 'नदी · वधू · पितृ · मातृ', e: 'ī, ū and ṛ stems', w: ['nadI.S', 'vaDU.S', 'pitf.P', 'mAtf.S', 'dAtf.P'], mcq: 4, timer: 40 },
  { n: 'रूपपरिचयः', e: 'See a form — name its vibhakti and number', w: ['rAma.P', 'vana.N', 'ramA.S', 'hari.P', 'mati.S', 'guru.P', 'nadI.S'], mcq: 4, id: 1, timer: 40 },
  { n: 'लिखत', e: 'Type the forms: rāma, vana, ramā, hari', w: ['rAma.P', 'vana.N', 'ramA.S', 'hari.P'], type: 1, timer: 45 },
  { n: 'हलन्ताः', e: 'Consonant stems: rājan, ātman, nāman, vāc, manas, jagat, bhagavat', w: ['rAjan.P', 'Atman.P', 'nAman.N', 'vAc.S', 'manas.N', 'jagat.N', 'Bagavat.P'], mcq: 4, timer: 35 },
  { n: 'सर्वनामानि', e: 'Pronouns: sarva, tad, yad, kim, idam — all genders', w: ['sarva.P', 'sarva.S', 'sarva.N', 'tad.P', 'tad.S', 'tad.N', 'yad.P', 'yad.S', 'kim.P', 'kim.S', 'idam.P', 'idam.S', 'idam.N'], mcq: 4, timer: 30 },
  { n: 'अस्मद् · युष्मद्', e: 'I and you', w: ['asmad.P', 'yuzmad.P'], mcq: 4, timer: 30, novoc: 1 },
  { n: 'अमरकोशः', e: 'Any word of the Amarakośa, with its gender', amara: 1, type: 1, timer: 40 },
  { n: 'वेगः · 60″', e: 'Blitz: all the model words', w: ['rAma.P', 'vana.N', 'ramA.S', 'hari.P', 'mati.S', 'guru.P', 'nadI.S', 'pitf.P', 'rAjan.P', 'tad.P', 'tad.S', 'sarva.P'], mcq: 4, blitz: 60 },
];
const VD = (vi, va) => `${C.VIBD[vi]} · ${C.VACS[va]}`;
let AMARA = null;
async function amaraWords() { if (!AMARA) { const d = await C.getJSON('ko/amara.json'); AMARA = d.words.filter(w => /^[PSN]$/.test(w[1]) && /^[ऀ-ॿ]+$/.test(w[0]) && w[0].length > 2).map(w => [C.d2s(w[0]), w[1]]) } return AMARA }
async function qShabda(L) {
  const list = L.amara ? (await amaraWords()).map(x => x.join('.')) : L.w;
  for (let t = 0; t < 40; t++) {
    const [stem, lg] = C.pick(list).split('.'), vi = C.rand(L.novoc ? 7 : 8), va = C.rand(3);
    const forms = C.supForms(stem, lg, vi, va); if (!forms.length) continue;
    const head = `<span class="dh">${E(sh(stem))}</span> <small>${C.LIND[lg]}</small>`;
    const explain = async () => { const p = C.sup(stem, lg, vi, va)[0]; return p ? await C.prakriyaHTML(p) : '' };
    if (L.id) {
      const f = C.pick(forms), cells = []; for (let a = 0; a < 8; a++) for (let b = 0; b < 3; b++) cells.push([a, b]);
      const ok = c => C.supForms(stem, lg, c[0], c[1]).includes(f);
      const wrong = C.shuffle(cells.filter(c => !ok(c))).slice(0, L.mcq - 1);
      return { prompt: `<div class="big">${E(sh(f))}</div><div class="sub">${head}</div><div class="ask">का विभक्तिः, किं वचनम्?</div>`,
        options: C.shuffle([{ h: VD(vi, va), ok: true }, ...wrong.map(c => ({ h: VD(...c), ok: false }))]), answer: VD(vi, va) + (cells.filter(ok).length > 1 ? ' (also: ' + cells.filter(ok).filter(c => c[0] !== vi || c[1] !== va).map(c => VD(...c)).join(', ') + ')' : ''), explain,
        accept: o => cells.filter(ok).some(c => VD(...c) === o) };
    }
    const prompt = `<div class="sub">${head}</div><div class="big">${VD(vi, va)}</div>`;
    if (L.type) return { prompt, answers: forms, explain, answer: forms.map(sh).join(' / ') };
    const pool = new Set(); for (let a = 0; a < 8; a++) for (let b = 0; b < 3; b++) C.supForms(stem, lg, a, b).forEach(x => pool.add(x));
    const wrong = C.shuffle([...pool].filter(x => !forms.includes(x))).slice(0, L.mcq - 1);
    if (wrong.length < L.mcq - 1) continue;
    return { prompt, options: C.shuffle([{ h: sh(forms[0]), ok: true }, ...wrong.map(x => ({ h: sh(x), ok: false }))]), answer: forms.map(sh).join(' / '), explain };
  }
}

const VF = { a: ['rAma', 'deva', 'tatra', 'na', 'ca', 'yaTA', 'vidyA', 'mahA', 'sadA', 'rAjA', 'gaNgA', 'atra', 'sUrya', 'hima'], i: ['hari', 'kavi', 'iti', 'prati', 'yadi', 'muni', 'nadI', 'devI', 'aDi'], u: ['guru', 'Banu', 'su', 'anu', 'maDu', 'vaDU', 'sADu'], f: ['pitf', 'mAtf', 'kartf'],
  e: ['vane', 'te', 'me', 'gfhe', 'hare', 'Sive'], E: ['tasmE', 'devyE', 'rAmAyE'], o: ['vizRo', 'gurO'.slice(0, 3) + 'o', 'Bo'], O: ['gurO', 'tO', 'dvO'] };
const VI = { a: ['atra', 'asti', 'api', 'aham', 'arTaH', 'Agacchati', 'AlayaH', 'Atma', 'aSvaH'], i: ['iti', 'iha', 'indraH', 'iSaH', 'Iswaraf'.slice(0, 5)], u: ['uttamaH', 'upari', 'udayaH', 'uzA', 'Urmi'], f: ['fziH', 'ftam'], e: ['eva', 'ekaH', 'eti'], E: ['EkyaH', 'EzvaryaH'], o: ['ozaDiH', 'odanaH'], O: ['OzaDam', 'OdAryam'] };
const VISW = ['rAmaH', 'devaH', 'kaH', 'bAlakaH', 'SizyaH', 'hariH', 'guruH', 'muniH', 'punaH', 'manaH', 'BAnuH', 'naraH', 'gajAH', 'devAH', 'sa'+'H', 'ezaH'];
const CONI = ['gacCati', 'vadati', 'ca', 'tu', 'eva', 'atra', 'paWati', 'asti', 'iti', 'nayati', 'yAti', 'Bavati', 'jayati', 'dadAti', 'Siva', 'tatra', 'calati', 'hasati', 'tizWati'];
const TW = ['tat', 'etat', 'jagat', 'sat', 'yat', 'tasmAt', 'asmAt', 'mahat', 'vAk', 'dik', 'samyak', 'pustakam', 'Palam', 'jalam', 'gfham', 'aham', 'tvam'];
const TI = ['ca', 'jYAnam', 'mAtA', 'nAma', 'labDvA', 'SivaH', 'hi', 'gacCati', 'idam', 'eva', 'Bavati', 'mama', 'dadAti', 'lokaH', 'Palam', 'yAti'];
const KL = [
  { n: 'सवर्णदीर्घः', e: 'a + a → ā, i + i → ī …', k: ['aa', 'ii', 'uu'], mcq: 3 },
  { n: 'गुणः', e: 'a + i → e, a + u → o, a + ṛ → ar', k: ['ai', 'au', 'af'], mcq: 3 },
  { n: 'वृद्धिः', e: 'a + e/ai → ai, a + o/au → au', k: ['ae', 'aE', 'ao', 'aO'], mcq: 4 },
  { n: 'यण् · अयादिः', e: 'i/u + vowel → y/v; e/o + vowel → ay/av', k: ['ia', 'ua', 'iu', 'ui', 'fa', 'ei', 'Ei', 'Oa'], mcq: 4 },
  { n: 'पूर्वरूपम्', e: 'e/o + a → e/o ऽ', k: ['ea', 'oa'], mcq: 4 },
  { n: 'अच्सन्धिः · मिश्रः', e: 'All vowel sandhis', k: ['aa', 'ii', 'ai', 'au', 'ae', 'ao', 'ia', 'ua', 'ea', 'ei', 'fa'], mcq: 4, timer: 30 },
  { n: 'विसर्गसन्धिः', e: 'aḥ + soft → o, ḥ + c → ś …', vis: 1, mcq: 4, timer: 30 },
  { n: 'हल्सन्धिः', e: 't + c → cc, t + n → nn, m → ṃ …', hal: 1, mcq: 4, timer: 30 },
  { n: 'सर्वे · लिखत', e: 'Any sandhi — type the result', k: ['aa', 'ii', 'ai', 'au', 'ae', 'ia', 'ua', 'ea'], vis: 1, hal: 1, type: 1, timer: 40 },
  { n: 'वेगः · 60″', e: 'Blitz', k: ['aa', 'ii', 'ai', 'au', 'ae', 'ao', 'ia', 'ua', 'ea', 'ei'], vis: 1, hal: 1, mcq: 4, blitz: 60 },
];
function sandhiPair(L) {
  const kinds = [...(L.k || []).map(k => ['v', k]), ...(L.vis ? [['s']] : []), ...(L.hal ? [['h']] : [])];
  const [kd, k] = C.pick(kinds);
  if (kd === 's') return [C.pick(VISW), C.pick(CONI)];
  if (kd === 'h') return [C.pick(TW), C.pick(TI)];
  const fin = k[0], ini = k[1];
  const ends = (VF[fin === 'a' ? 'a' : fin] || VF.a).filter(w => w.endsWith(fin) || (fin === 'a' && /[aA]$/.test(w)));
  const starts = (VI[ini] || VI.a).filter(w => w[0] === ini || (ini === 'a' && /^[aA]/.test(w)) || (ini === 'i' && /^[iI]/.test(w)) || (ini === 'u' && /^[uU]/.test(w)));
  return [C.pick(ends.length ? ends : VF.a), C.pick(starts.length ? starts : VI.a)];
}
function sandhiDistractors(L, R, right) {
  const s = new Set([L + R, L + ' ' + R]);
  const sw = { e: 'E', E: 'e', o: 'O', O: 'o', A: 'a', y: 'v', S: 's', d: 't', o_: 'a' };
  for (let i = 0; i < right.length; i++) if (sw[right[i]]) s.add(right.slice(0, i) + sw[right[i]] + right.slice(i + 1));
  s.add(right.replace(/'/g, 'a')); s.add(right.replace(/o /, 'aH ')); s.add(right.replace('M ', 'm '));
  return [...s].filter(x => x.replace(/\s/g, '') !== right.replace(/\s/g, ''));
}
async function qSandhi(L) {
  for (let t = 0; t < 30; t++) {
    const [a, b] = sandhiPair(L); const r = sandhiJoin(a, b); if (r.rule === 'none') continue;
    const R = RULES[r.rule];
    const explain = async () => `<p class="rule"><b>${E(D(R[0]))}</b> ${R[1] ? `<a href="${C.sutraHref('ashtadhyayi', R[1])}" target="_blank">${R[1]}</a>` : ''} — ${E(R[2])}</p>`;
    const prompt = `<div class="big">${E(sh(a))} + ${E(sh(b))}</div><div class="ask">सन्धिं कुरुत · join them</div>`;
    const ans = r.out.trim();
    if (L.type) return { prompt, answers: [ans], explain, answer: sh(ans) };
    const wrong = C.shuffle(sandhiDistractors(a, b, ans)).slice(0, L.mcq - 1);
    if (wrong.length < L.mcq - 1) continue;
    return { prompt, options: C.shuffle([{ h: sh(ans), ok: true }, ...wrong.map(x => ({ h: sh(x), ok: false }))]), answer: sh(ans), explain };
  }
}

const ML = [
  { n: 'अनुष्टुभ् · इन्द्रवज्रा · वसन्ततिलका', e: 'Three common metres', m: ['anustubh', 'indravajra', 'vasantatilaka'], mcq: 3 },
  { n: 'उपजातिः · वंशस्थम् · रथोद्धता', e: 'Add upajāti, vaṃśastha and rathoddhatā', m: ['anustubh', 'indravajra', 'upajati', 'vamsastha', 'rathoddhata', 'vasantatilaka'], mcq: 4 },
  { n: 'जातयः', e: 'Āryā and its family (counted by mātrās)', m: ['arya', 'giti', 'upagiti', 'udgiti', 'aryagiti'], mcq: 4, timer: 50 },
  { n: 'दीर्घवृत्तानि', e: 'Mandākrāntā, śikhariṇī, śārdūlavikrīḍita, sragdharā, mālinī, hariṇī, pṛthvī', m: ['mandakranta', 'sikharini', 'sardulavikridita', 'sragdhara', 'malini', 'harini', 'prthvi'], mcq: 4, timer: 50 },
  { n: 'मिश्रः', e: 'Any of the twenty commonest metres', m: ['anustubh', 'arya', 'upajati', 'vamsastha', 'vasantatilaka', 'rathoddhata', 'sardulavikridita', 'mandakranta', 'indravajra', 'viyogini', 'puspitagra', 'sikharini', 'drutavilanbita', 'malini', 'aupacchandasika', 'sragdhara', 'praharsini', 'svagata', 'salini', 'giti'], mcq: 4, timer: 40 },
  { n: 'वेगः · 60″', e: 'Blitz', m: ['anustubh', 'arya', 'upajati', 'vamsastha', 'vasantatilaka', 'rathoddhata', 'sardulavikridita', 'mandakranta', 'malini', 'sikharini'], mcq: 4, blitz: 60 },
];
let MET = null;
async function qChandas(L) {
  MET = MET || await C.getJSON('sl/metres.json');
  for (let t = 0; t < 20; t++) {
    const slug = C.pick(L.m), d = MET.find(x => x.slug === slug); if (!d) continue;
    const rows = await C.getJSON(`sl/m/${slug}.json`); if (!rows.length) continue;
    const r = C.pick(rows); const tx = await C.getJSON(`sl/t/${r[1]}.json`); const v = tx.v.find(x => String(x[0]) === String(r[2]) && x[1] === r[3]); if (!v) continue;
    const others = C.shuffle(L.m.filter(x => x !== slug)).slice(0, L.mcq - 1).map(s => MET.find(x => x.slug === s)).filter(Boolean);
    const name = x => x.dev.replace(/\s*\(.*\)/, '');
    return { prompt: `<div class="verse">${v[2].map(p => E(D(p))).join('<br>')}</div><div class="ask">किं छन्दः? · which metre?</div>`,
      options: C.shuffle([{ h: D(name(d)), ok: true }, ...others.map(o => ({ h: D(name(o)), ok: false }))]), answer: D(name(d)),
      explain: async () => `<p><a href="shloka.html#m/${slug}" target="_blank">${E(D(d.dev))} — lakṣaṇa and gaṇas ›</a></p>` };
  }
}

export const GAMES = [
  { id: 'rupa', icon: 'धा', t: 'धातुरूपचक्रम्', en: 'Verb-form wheel', d: 'Ten lakāras, three persons, three numbers — from bhavati to babhūva.', levels: RL, q: qRupa },
  { id: 'shabda', icon: 'श', t: 'शब्दरूपचक्रम्', en: 'Noun-form wheel', d: 'Declensions in all three genders, pronouns, and any Amarakośa word.', levels: SL, q: qShabda },
  { id: 'sandhi', icon: 'सं', t: 'सन्धिशीघ्रम्', en: 'Sandhi quick-fire', d: 'Join the words — vowel, visarga and consonant sandhi, with the sūtra.', levels: KL, q: qSandhi },
  { id: 'chandas', icon: 'छ', t: 'छन्दःपरिचयः', en: 'Name the metre', d: 'Real verses from the Śloka Index — recognise their metre.', levels: ML, q: qChandas },
  { id: 'antya', icon: 'अ', t: 'अन्त्याक्षरी', en: 'Verse chain', d: 'Answer a verse with one that begins where it ended.', custom: 'antya', n: 5 },
  { id: 'sudoku', icon: '⊞', t: 'तिङ्सुडोकु', en: 'Sudoku of endings', d: 'Sudoku with the nine verb endings and forms instead of numbers.', custom: 'sudoku', n: 8 },
  { id: 'jala', icon: '✚', t: 'शब्दजालम्', en: 'Crossword', d: 'Crosswords from the Amarakośa and from verb forms — a fresh one every time.', custom: 'jala', n: 5 },
  { id: 'mela', icon: '◫', t: 'रूपमेलनम्', en: 'Memory cards', d: 'Flip and match each form with its analysis.', custom: 'mela', n: 5 },
];
const G = id => GAMES.find(g => g.id === id);

/* ---------------- hub and level map ---------------- */
function hub() {
  const w = C.wallet();
  app().innerHTML = `<h1>क्रीडाङ्गणम्</h1><p class="sub">Play-ground · learn Sanskrit grammar by playing — every answer is checked by Pāṇini's rules. Earn tokens; every ${C.REWARD.every} tokens give a ${C.REWARD.value} voucher for a Sanskrit Manthan book.</p>
   ${walletBar()}<div class="games">${GAMES.map(g => { const st = (w.levels[g.id] || { open: 0, stars: {} }); const n = g.levels ? g.levels.length : g.n;
     const stars = Object.values(st.stars).reduce((a, b) => a + b, 0);
     return `<a class="gc" href="#${g.id}"><div class="gi">${g.icon}</div><div><h2>${E(D(g.t))}</h2><div class="en">${g.en}</div><p>${g.d}</p>
      <div class="gp"><span>स्तरः ${Math.min(st.open + 1, n)}/${n}</span><span>★ ${stars}</span></div></div></a>` }).join('')}</div>
   <p class="mut small">Tokens and levels are kept in this browser only. Type answers in Devanagari, Telugu, IAST (bhavati, bhāvati) or simple Roman (bhavati, gacchati).</p>`;
  bindWallet();
}
function levelMap(g) {
  const w = lvState(g.id), st = w.levels[g.id], L = g.levels || CUSTOM[g.custom].levels;
  app().innerHTML = `<p class="crumb"><a href="#">‹ क्रीडाङ्गणम्</a></p><h1>${E(D(g.t))}</h1><p class="sub">${g.en} · ${g.d}</p>${walletBar()}
   <div class="lv">${L.map((l, i) => { const open = i <= st.open, s = st.stars[i] || 0;
     return `<a class="lc ${open ? '' : 'lock'} ${s ? 'done' : ''}" ${open ? `href="#${g.id}/${i + 1}"` : ''}><div class="ln">${open ? i + 1 : '🔒'}</div><div><b>${E(D(l.n))}</b><small>${E(l.e)}${l.timer ? ` · ⏱ ${l.timer}″` : ''}${l.blitz ? ` · ⏱ ${l.blitz}″ total` : ''}</small></div><div class="st">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</div></a>` }).join('')}</div>`;
  bindWallet();
}

/* ---------------- quiz runner ---------------- */
let RUN = null;
async function play(g, li) {
  const L = g.levels[li]; const N = L.blitz ? 999 : 10;
  RUN = { g, li, L, i: 0, ok: 0, streak: 0, best: 0, tokens: 0, t0: Date.now(), timer: null, end: L.blitz ? Date.now() + L.blitz * 1000 : 0, N };
  app().innerHTML = `<p class="crumb"><a href="#${g.id}">‹ ${E(D(g.t))}</a></p><div class="hud"><span class="lvn">स्तरः ${li + 1} · ${E(D(L.n))}</span><span id="qn"></span><span id="stk"></span>${walletBar()}</div>
    <div class="tbar"><i id="tb"></i></div><div class="qcard" id="qc"><div class="load">…</div></div>`;
  bindWallet();
  await C.engine();
  if (!GD.length) GD = await C.getJSON(new URL('game_dhatus.json', import.meta.url).href);
  next();
}
async function next() {
  const R = RUN; if (!R) return; clearInterval(R.timer);
  if (R.end && Date.now() >= R.end) return done();
  if (!R.end && R.i >= R.N) return done();
  const q = await R.g.q(R.L); if (RUN !== R) return; if (!q) return next();
  R.q = q; R.i++; R.answered = false;
  $('#qn').textContent = R.end ? `✓ ${R.ok}` : `${R.i}/${R.N}`;
  $('#stk').innerHTML = R.streak >= 2 ? `🔥 ${R.streak}` : '';
  $('#qc').innerHTML = `<div class="prompt">${q.prompt}</div>` + (q.options
    ? `<div class="opts">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="kb">${k + 1}</span>${E(o.h)}</button>`).join('')}</div>`
    : `<form class="typ" id="tf"><input id="ti" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type here · लिखत"><button class="btn">✓</button></form><div class="pv" id="pv"></div>`) + `<div class="fb" id="fb"></div>`;
  if (q.options) document.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.k));
  else { const ti = $('#ti'); ti.focus(); ti.oninput = () => { $('#pv').textContent = ti.value ? sh(C.toSLP(ti.value)) : '' }; $('#tf').onsubmit = e => { e.preventDefault(); answer(ti.value) } }
  // per-question timer (slow levels have none) or the blitz clock
  const tb = $('#tb'), lim = R.L.timer ? R.L.timer * 1000 : 0, t0 = Date.now();
  if (R.end) { R.timer = setInterval(() => { const left = R.end - Date.now(); tb.style.width = Math.max(0, 100 * left / (R.L.blitz * 1000)) + '%'; if (left <= 0) { clearInterval(R.timer); done() } }, 100) }
  else if (lim) { R.timer = setInterval(() => { const left = lim - (Date.now() - t0); tb.style.width = Math.max(0, 100 * left / lim) + '%'; tb.className = left < lim * .25 ? 'low' : ''; if (left <= 0) { clearInterval(R.timer); answer(null) } }, 100) }
  else tb.style.width = '100%';
}
async function answer(a) {
  const R = RUN, q = R.q; if (R.answered) return; R.answered = true; clearInterval(R.timer);
  let ok = false;
  if (q.options) { if (a !== null) { const o = q.options[a]; ok = o.ok || (q.accept && q.accept(o.h)); document.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (q.options[k].ok) b.classList.add('right'); else if (k === a) b.classList.add('wrong') }) } else document.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (q.options[k].ok) b.classList.add('right') }) }
  else { const s = a ? C.toSLP(a) : ''; ok = !!s && q.answers.some(x => C.same(x, s)); $('#ti').disabled = true; $('#ti').classList.add(ok ? 'right' : 'wrong') }
  beep(ok);
  if (ok) { R.ok++; R.streak++; R.best = Math.max(R.best, R.streak); const n = (R.li >= 6 ? 2 : 1) + (R.streak % 5 === 0 ? 2 : 0); R.tokens += n; earn(n) }
  else R.streak = 0;
  const fb = $('#fb');
  fb.innerHTML = `<div class="${ok ? 'good' : 'bad'}">${ok ? C.pick(['साधु!', 'उत्तमम्!', 'शोभनम्!', 'सम्यक्!']) + ' ✓' : (a === null ? '⏱ समयः समाप्तः · ' : '✗ ') + 'उत्तरम् : <b>' + E(q.answer) + '</b>'}</div>
    <div class="fa">${q.explain ? `<button class="lnk" id="why">${ok ? 'प्रक्रिया · how?' : 'प्रक्रिया · why?'}</button>` : ''}<button class="btn" id="nx">अग्रे · next ›</button></div><div id="pk"></div>`;
  $('#nx').onclick = next; $('#nx').focus();
  if ($('#why')) $('#why').onclick = async () => { $('#pk').innerHTML = await q.explain(); $('#why').remove() };
  if (R.end && ok) setTimeout(() => { if (RUN === R && R.q === q) next() }, 500);   // blitz keeps moving
}
function done() {
  const R = RUN; clearInterval(R.timer); RUN = null;
  const n = R.end ? R.i : R.N, pct = n ? R.ok / n : 0;
  const stars = R.end ? (R.ok >= 20 ? 3 : R.ok >= 14 ? 2 : R.ok >= 8 ? 1 : 0) : (pct >= 1 ? 3 : pct >= .9 ? 2 : pct >= .7 ? 1 : 0);
  const L = R.g.levels; const old = finishLevel(R.g.id, R.li, stars, L.length);
  let bonus = 0; if (stars && stars > old) bonus = 5 * (stars - old); if (bonus) earn(bonus, 'level bonus');
  app().querySelector('.qcard').innerHTML = `<div class="res"><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <h2>${stars ? C.pick(['विजयी भव!', 'अतीव शोभनम्!', 'साधु साधु!']) : 'पुनः प्रयतस्व · try again'}</h2>
    <p>${R.end ? `${R.ok} correct in ${R.L.blitz} seconds` : `${R.ok} / ${n} correct`} · best streak ${R.best} · +${R.tokens + bonus} 🪙</p>
    <p>${stars ? (R.li + 1 < L.length ? 'Next level unlocked.' : 'You have finished every level of this game!') : 'Get 7 of 10 right to unlock the next level.'}</p>
    <div class="fa"><a class="btn ghost" href="#${R.g.id}">स्तराः · levels</a><button class="btn ghost" id="again">पुनः · again</button>${stars && R.li + 1 < L.length ? `<a class="btn" href="#${R.g.id}/${R.li + 2}">अग्रिमः स्तरः ›</a>` : ''}</div></div>`;
  $('#again').onclick = () => play(R.g, R.li);
  $('#qn').textContent = ''; $('#tb').style.width = '0';
}
document.addEventListener('keydown', e => {
  if (!RUN || !RUN.q) return;
  if (RUN.q.options && !RUN.answered && /^[1-4]$/.test(e.key)) { const k = +e.key - 1; if (k < RUN.q.options.length) answer(k) }
  else if (RUN.answered && e.key === 'Enter' && document.activeElement?.id !== 'nx') { e.preventDefault(); next() }
});

/* ---------------- custom games are loaded on demand ---------------- */
const CUSTOM = {};
export function registerCustom(name, def) { CUSTOM[name] = def }
async function custom(g, li) {
  if (!CUSTOM[g.custom]) await import(g.custom === 'antya' ? './antya.js' : './puzzles.js');
  const def = CUSTOM[g.custom];
  if (li === null) return levelMap(g);
  await def.play(li, { app, walletBar, bindWallet, earn, beep, finishLevel: (li2, s) => finishLevel(g.id, li2, s, def.levels.length), g, toast, modal, closeModal });
}

/* ---------------- routing ---------------- */
export async function route() {
  RUN && clearInterval(RUN.timer); RUN = null;
  const [id, lv] = location.hash.slice(1).split('/'); const g = G(id);
  window.scrollTo(0, 0);
  if (!g) return hub();
  if (g.custom) { if (!CUSTOM[g.custom]) await import(g.custom === 'antya' ? './antya.js' : './puzzles.js'); return custom(g, lv ? +lv - 1 : null) }
  if (!lv) return levelMap(g);
  const li = +lv - 1, st = lvState(g.id).levels[g.id];
  if (li > st.open) return levelMap(g);
  return play(g, li);
}
export { C, E, sh, D };
window.__sm = { get run() { return RUN } };
document.addEventListener('wallet', () => { const t = $('#tk'); if (t) t.textContent = C.wallet().tokens });
