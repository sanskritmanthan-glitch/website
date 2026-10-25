// अन्त्याक्षरी — verse chain against the computer, using the Śloka Index (first pādas of every verse).
import { registerCustom, C, E, D } from './games.js';
const $ = s => document.querySelector(s);
const LEVELS = [
  { n: 'अभ्यासः', e: 'Practice: choose the right verse from four · no clock', mcq: 1, rounds: 5 },
  { n: 'विकल्पाः · 45″', e: 'Choose from four, 45 seconds a turn', mcq: 1, rounds: 6, timer: 45 },
  { n: 'स्मरणम्', e: 'Type the opening words yourself · hints allowed', rounds: 5, hints: 3 },
  { n: 'स्मरणम् · 60″', e: 'Type, 60 seconds a turn, 2 hints', rounds: 6, hints: 2, timer: 60 },
  { n: 'पण्डितः · 40″', e: 'Type, 40 seconds a turn, no hints', rounds: 8, hints: 0, timer: 40 },
];
let CAT = null; const BUCK = {};
async function cat() { return CAT || (CAT = await C.getJSON('sl/catalog.json')) }
async function bucket(letter) {   // first pādas beginning with this letter
  const c = await cat(); const L = c.letters.find(x => x[1] === letter); if (!L) return [];
  if (!BUCK[L[0]]) BUCK[L[0]] = (await C.getJSON(`sl/a/${L[0]}.json`)).filter(r => r[4] === 0);
  return BUCK[L[0]];
}
const lab = slp => { if (!slp) return ''; return C.s2d('aeiouAEIOUfF'.includes(slp) ? slp : slp + 'a') };
// the letter a verse ends on: last consonant (or vowel) after dropping visarga/anusvāra
function lastLetter(pada) {
  let s = C.d2s(pada).replace(/[^a-zA-Z~']/g, '').replace(/[HM~]+$/, '');
  const cons = s.match(/[kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL](?=[aAiIuUfFxXeEoO]*$)/);
  return cons ? cons[0] : (s.slice(-1) || 'a');
}
async function verseOf(r) { const t = await C.getJSON(`sl/t/${r[1]}.json`); return t.v.find(x => String(x[0]) === String(r[2]) && x[1] === r[3]) }
async function title(tid) { const c = await cat(); const t = c.texts.find(x => x.id === tid); return t ? t.title : tid }
const key = s => C.norm(C.toSLP(s)).replace(/[^a-zA-Z]/g, '');

registerCustom('antya', { levels: LEVELS, async play(li, K) {
  const L = LEVELS[li]; const used = new Set(); let round = 0, score = 0, tokens = 0, hints = L.hints || 0, timer = null;
  K.app().innerHTML = `<p class="crumb"><a href="#antya">‹ ${E(D('अन्त्याक्षरी'))}</a></p><div class="hud"><span class="lvn">स्तरः ${li + 1} · ${E(D(L.n))}</span><span id="qn"></span>${K.walletBar()}</div>
    <div class="tbar"><i id="tb"></i></div><div class="qcard" id="qc"><div class="load">…</div></div>`;
  K.bindWallet();
  // the computer opens with a random verse
  let req = C.pick(['a', 'k', 'v', 's', 'y', 'n', 'm', 'd', 'B', 'S']);
  let comp = await computer(req);
  async function computer(letter) {
    let rows = (await bucket(lab(letter))).filter(r => !used.has(r[1] + r[2] + '.' + r[3]));
    if (!rows.length) rows = (await bucket('स')).filter(r => !used.has(r[1] + r[2] + '.' + r[3]));
    const r = C.pick(rows); used.add(r[1] + r[2] + '.' + r[3]); return { r, v: await verseOf(r) };
  }
  async function turn() {
    clearInterval(timer);
    if (round >= L.rounds) return finish();
    round++;
    const last = comp.v ? comp.v[2][comp.v[2].length - 1] : comp.r[0];
    let need = lastLetter(last); let cands = (await bucket(lab(need))).filter(r => !used.has(r[1] + r[2] + '.' + r[3]));
    if (!cands.length) { need = 'a'; cands = (await bucket('अ')).filter(r => !used.has(r[1] + r[2] + '.' + r[3])) }
    $('#qn').textContent = `${round}/${L.rounds} · ✓ ${score}`;
    const vhtml = comp.v ? comp.v[2].map(p => E(D(p))).join('<br>') : E(D(comp.r[0]));
    let body = `<div class="cpu"><small>सङ्गणकः · computer — ${E(D(await title(comp.r[1])))} ${comp.r[2]}.${comp.r[3]}</small><div class="verse">${vhtml}</div></div>
      <div class="need">अग्रिमः श्लोकः <b class="lt">${E(D(lab(need)))}</b>-कारेण आरभ्यताम् · your verse must begin with <b>${E(D(lab(need)))}</b></div>`;
    let opts = null;
    if (L.mcq) {
      const right = C.pick(cands); const wrongL = C.shuffle(['अ', 'क', 'व', 'स', 'प', 'त', 'न', 'म', 'य', 'र', 'ज', 'द'].filter(x => x !== lab(need))).slice(0, 3);
      const wrong = []; for (const l of wrongL) { const b = await bucket(l); if (b.length) wrong.push(C.pick(b)) }
      opts = C.shuffle([{ r: right, ok: true }, ...wrong.map(r => ({ r, ok: false }))]);
      body += `<div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="kb">${k + 1}</span>${E(D(o.r[0]))}</button>`).join('')}</div>`;
    } else body += `<form class="typ" id="tf"><input id="ti" autocomplete="off" placeholder="first words of your verse · श्लोकस्य आदिपदानि"><button class="btn">✓</button></form><div class="pv" id="pv"></div>
      <div class="fa">${hints ? `<button class="lnk" id="hint">💡 सूचना · hint (${hints})</button>` : ''}<button class="lnk" id="pass">त्यजामि · give up this turn</button></div>`;
    $('#qc').innerHTML = body + `<div class="fb" id="fb"></div>`;
    const t0 = Date.now(), lim = (L.timer || 0) * 1000, tb = $('#tb');
    if (lim) timer = setInterval(() => { const left = lim - (Date.now() - t0); tb.style.width = Math.max(0, 100 * left / lim) + '%'; tb.className = left < lim * .25 ? 'low' : ''; if (left <= 0) { clearInterval(timer); judge(null) } }, 100); else tb.style.width = '100%';
    let answered = false;
    async function judge(r) {
      if (answered) return; answered = true; clearInterval(timer);
      const ok = !!r; K.beep(ok);
      if (ok) { score++; const n = 2 + li; tokens += n; K.earn(n); used.add(r[1] + r[2] + '.' + r[3]) }
      const shown = r || C.pick(cands);
      const v = await verseOf(shown);
      $('#fb').innerHTML = `<div class="${ok ? 'good' : 'bad'}">${ok ? 'साधु! ✓' : 'एषः श्लोकः भवितुम् अर्हति · this verse would have done:'}</div>
        <div class="verse sm">${(v ? v[2] : [shown[0]]).map(p => E(D(p))).join('<br>')}</div><small>${E(D(await title(shown[1])))} ${shown[2]}.${shown[3]}</small>
        <div class="fa"><button class="btn" id="nx">अग्रे ›</button></div>`;
      document.querySelectorAll('.opt').forEach(b => b.disabled = true); if ($('#ti')) $('#ti').disabled = true;
      $('#nx').onclick = async () => { comp = await computer(lastLetter((v ? v[2] : [shown[0]]).slice(-1)[0])); turn() }; $('#nx').focus();
    }
    if (opts) document.querySelectorAll('.opt').forEach(b => b.onclick = () => { const o = opts[+b.dataset.k]; b.classList.add(o.ok ? 'right' : 'wrong'); if (!o.ok) document.querySelectorAll('.opt')[opts.findIndex(x => x.ok)].classList.add('right'); judge(o.ok ? o.r : null) });
    else {
      const ti = $('#ti'); ti.focus(); ti.oninput = () => { $('#pv').textContent = ti.value ? C.show(C.toSLP(ti.value)) : '' };
      $('#tf').onsubmit = e => { e.preventDefault(); const k = key(ti.value); if (k.length < 5) { K.toast('type at least the first word or two'); return }
        const hit = cands.find(r => key(r[0]).startsWith(k)); if (hit) judge(hit); else { ti.classList.add('wrong'); setTimeout(() => ti.classList.remove('wrong'), 600); K.toast('not found in the Śloka Index — try again or check spelling') } };
      if ($('#hint')) $('#hint').onclick = () => { if (!hints) return; hints--; const r = C.pick(cands); const w = r[0].split(' '); K.toast(`💡 ${E(D(w[0]))} ${w[1] ? E(D(w[1]).replace(/./g, '·')) : ''} …`); $('#hint').textContent = `💡 सूचना · hint (${hints})`; if (!hints) $('#hint').remove() };
      $('#pass').onclick = () => judge(null);
    }
  }
  function finish() {
    clearInterval(timer);
    const pct = score / L.rounds, stars = pct >= 1 ? 3 : pct >= .8 ? 2 : pct >= .6 ? 1 : 0;
    const old = K.finishLevel(li, stars); if (stars > old) K.earn(5 * (stars - old), 'level bonus');
    $('#qc').innerHTML = `<div class="res"><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2>${stars ? 'साधु साधु!' : 'पुनः प्रयतस्व'}</h2>
      <p>${score} / ${L.rounds} verses · +${tokens} 🪙</p><div class="fa"><a class="btn ghost" href="#antya">स्तराः</a>${stars && li + 1 < LEVELS.length ? `<a class="btn" href="#antya/${li + 2}">अग्रिमः स्तरः ›</a>` : `<a class="btn" href="#antya/${li + 1}" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">पुनः</a>`}</div></div>`;
  }
  turn();
} });
