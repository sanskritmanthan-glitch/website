// प्रत्ययाः · उपसर्गाः — every class of suffix with its anubandhas, sūtra, meaning and live examples; the 22 upasargas.
import * as C from './core.js';
import { $, $$, E, sh, D, cell, bindPK, resetPK, sutraLine, sutraLink } from './ui.js';
const IT = { kta: 'क् + त — कित्, so no guṇa (1.1.5)', ktavatu: 'क् + तवत् + उ — कित्; उ for नुम् (7.1.70)', Satf: 'श् + अत् + ऋ — शित् (sārvadhātuka); ऋ for नुम्', SAnac: 'श् + आन + च्', ktvA: 'क् + त्वा — कित्', tumun: 'तुम् + उ + न्',
  tavya: 'तव्य', anIyar: 'अनीय + र्', yat: 'य + त् — स्वरित', Ryat: 'ण् + य + त् — णित्: vṛddhi (7.2.116)', kyap: 'क् + य + प्', Rvul: 'ण् + वु + ल् — वु → अक (7.1.1)', tfc: 'तृ + च्', lyuw: 'ल् + यु + ट् — यु → अन (7.1.1)',
  GaY: 'घ् + अ + ञ् — ञित्: vṛddhi', ktin: 'क् + ति + न्', ac: 'अ + च्', ka: 'क् + अ', Rini: 'ण् + इन् + इ', kvip: 'क् + व् + इ + प् — all of it drops', kvasu: 'क् + वस् + उ', kAnac: 'क् + आन + च्', Ramul: 'ण् + अम् + उ + ल्' };
const TAD = [['aR', 'अण्', 'descendant of (apatya)', '4.1.92', 'upagu'], ['iY', 'इञ्', 'son of (a-stems)', '4.1.95', 'daSaraTa'], ['tva', 'त्व', 'abstract noun: -ness', '5.1.119', 'deva'], ['tal', 'तल्', 'abstract noun (feminine -tā)', '5.1.119', 'deva'],
  ['imanic', 'इमनिच्', 'abstract noun (-iman)', '5.1.122', 'pfTu'], ['matup', 'मतुप्', 'possessing (-mat/-vat)', '5.2.94', 'Siva'], ['ini', 'इनि', 'possessing (-in)', '5.2.115', 'daRqa'], ['tarap', 'तरप्', 'comparative (-tara)', '5.3.57', 'pawu'],
  ['tamap', 'तमप्', 'superlative (-tama)', '5.3.55', 'pawu'], ['Iyasun', 'ईयसुन्', 'comparative (-īyas)', '5.3.57', 'pawu'], ['izWan', 'इष्ठन्', 'superlative (-iṣṭha)', '5.3.55', 'pawu'], ['mayaw', 'मयट्', 'made of', '4.3.143', 'suvarRa'],
  ['vati', 'वति', 'like (-vat)', '5.1.115', 'brAhmaRa'], ['tasil', 'तसिल्', 'from (-tas)', '5.3.7', 'grAma'], ['tral', 'त्रल्', 'in, at (-tra)', '5.3.10', 'tad'], ['dA', 'दा', 'when (-dā)', '5.3.15', 'sarva'], ['kan', 'कन्', 'diminutive / pejorative (-ka)', '5.3.70', 'aSva'],
  ['Wak', 'ठक्', 'relating to (-ika)', '4.4.1', 'akza'], ['Ca', 'छ', 'relating to (-īya)', '4.2.114', 'deva'], ['yat', 'यत्', 'good for, belonging to (-ya)', '4.4.98', 'deva'], ['zyaY', 'ष्यञ्', 'quality (-ya, vṛddhi)', '5.1.124', 'brAhmaRa']];
const STRI = [['टाप्', '4.1.4', 'aja', 'अजाद्यतष्टाप् — a-stems'], ['ङीप्', '4.1.5', 'kartf', 'ऋन्नेभ्यो ङीप् — ṛ- and n-stems'], ['ङीष्', '4.1.41', 'gOra', 'षिद्गौरादिभ्यश्च'], ['ङीप् (उगित्)', '4.1.6', 'Bavat', 'उगितश्च — bhavat → bhavatī'],
  ['ति', '4.1.77', 'yuvan', 'यूनस्तिः — yuvan → yuvati'], ['ङीष् (जाति)', '4.1.63', 'brAhmaRa', 'जातेरस्त्रीविषयादयोपधात्'], ['ऊङ्', '4.1.66', 'kuru', 'ऊङुतः']];
const SANA = [['san', 'सन्', 'desire to do (desiderative)', '3.1.7'], ['Ric', 'णिच्', 'cause to do (causative)', '3.1.26'], ['yaN', 'यङ्', 'do repeatedly or intensely', '3.1.22'], ['yaNluk', 'यङ्लुक्', 'intensive with the suffix dropped', '2.4.74']];
const TIN = [['तिप्', 'तस्', 'झि'], ['सिप्', 'थस्', 'थ'], ['मिप्', 'वस्', 'मस्'], ['त', 'आताम्', 'झ'], ['थास्', 'आथाम्', 'ध्वम्'], ['इट्', 'वहि', 'महिङ्']];
const SUP = [['सु', 'औ', 'जस्'], ['अम्', 'औट्', 'शस्'], ['टा', 'भ्याम्', 'भिस्'], ['ङे', 'भ्याम्', 'भ्यस्'], ['ङसि', 'भ्याम्', 'भ्यस्'], ['ङस्', 'ओस्', 'आम्'], ['ङि', 'ओस्', 'सुप्']];
const UPM = { pra: 'forth, forward, very', parA: 'away, back', apa: 'away, off', sam: 'together, fully', anu: 'after, along', ava: 'down, off', nis: 'out, without', dus: 'badly, hard', vi: 'apart, variously', AN: 'towards, up to, reversal', ni: 'down, into', aDi: 'over, upon', api: 'on, also', ati: 'beyond, over', su: 'well, easily', ud: 'up, out', aBi: 'towards, against', prati: 'back, against, each', pari: 'around, fully', upa: 'near, sub-' };
let GD = [], TAB = 'krt';
const TABS = [['krt', 'कृत्प्रत्ययाः'], ['tad', 'तद्धिताः'], ['stri', 'स्त्रीप्रत्ययाः'], ['sana', 'सनादयः'], ['tin', 'तिङ्'], ['sup', 'सुप्'], ['upa', 'उपसर्गाः']];
async function body() {
  resetPK(); const o = $('#out'); history.replaceState(null, '', '#' + TAB);
  if (TAB === 'krt') {
    const roots = GD.slice(0, 6);
    let h = `<p>${await sutraLine('3.1.93')} — suffixes added to roots to make nouns, adjectives, participles and indeclinables. The <b>it</b> letters (anubandhas) are markers: they disappear but switch rules on or off (कित् blocks guṇa, णित्/ञित् bring vṛddhi).</p>
      <table class="kt"><tr><th>प्रत्ययः</th><th>anubandhas</th><th>use</th>${roots.map(di => `<th>${E(D(C.dhatuPlain(C.DH[di][1])))}</th>`).join('')}</tr>`;
    for (const [k, kd, en, s] of C.KRTL) h += `<tr><td><b>${D(kd)}</b><br>${sutraLink(s)}</td><td><small>${E(D(IT[k] || ''))}</small></td><td><small>${en}</small></td>${roots.map(di => cell(C.krt(di, k))).join('')}</tr>`;
    o.innerHTML = h + '</table>';
  } else if (TAB === 'tad') {
    let h = `<p>${await sutraLine('4.1.76')} — secondary suffixes added to nouns (prātipadikas): descendants, abstract nouns, possession, comparison, place and time.</p><table class="kt"><tr><th>प्रत्ययः</th><th>meaning</th><th>example</th></tr>`;
    for (const [t, d, en, s, ex] of TAD) { const ps = C.tad(ex, t); if (!ps.length) continue; h += `<tr><td><b>${D(d)}</b><br>${sutraLink(s)}</td><td><small>${en}</small></td><td><small>${E(sh(ex))} +</small> ${cell(ps).replace(/^<td[^>]*>|<\/td>$/g, '')}</td></tr>` }
    o.innerHTML = h + '</table>';
  } else if (TAB === 'stri') {
    let h = `<p>${await sutraLine('4.1.3')} — the feminine suffixes. Give a masculine stem and the feminine gender; the engine chooses the suffix.</p><table class="kt"><tr><th>प्रत्ययः</th><th>rule</th><th>example (प्रथमा एक॰)</th></tr>`;
    for (const [d, s, ex, note] of STRI) h += `<tr><td><b>${D(d)}</b><br>${sutraLink(s)}</td><td><small>${E(D(note))}</small></td><td><small>${E(sh(ex))} →</small> ${cell(C.sup(ex, 'S', 0, 0)).replace(/^<td[^>]*>|<\/td>$/g, '')} <a class="sl" href="shabda.html#${ex}/S">all forms ›</a></td></tr>`;
    o.innerHTML = h + '</table>';
  } else if (TAB === 'sana') {
    const roots = GD.slice(0, 6);
    let h = `<p>${await sutraLine('3.1.32')} — words ending in these suffixes are themselves dhātus, and take every lakāra. Open any root in <a href="dhatu.html">धातुरूपाणि</a> and choose सनादि for full tables.</p><table class="kt"><tr><th>प्रत्ययः</th><th>meaning</th>${roots.map(di => `<th>${E(D(C.dhatuPlain(C.DH[di][1])))}</th>`).join('')}</tr>`;
    for (const [k, d, en, s] of SANA) h += `<tr><td><b>${D(d)}</b><br>${sutraLink(s)}</td><td><small>${en}</small></td>${roots.map(di => cell(C.tin(di, 0, 0, 0, 0, { san: [k] }))).join('')}</tr>`;
    o.innerHTML = h + '</table><p class="mut small">Also: क्यच्, काम्यच्, क्यङ् (3.1.8–11) make verbs from nouns (nāmadhātus) — पुत्रीयति “wishes for a son”.</p>';
  } else if (TAB === 'tin') {
    o.innerHTML = `<p>${await sutraLine('3.4.78')}</p><p>${await sutraLine('1.4.99')}<br>${await sutraLine('1.4.100')}</p>
      <div class="grid2"><table class="pt"><caption>परस्मैपदम्</caption><tr><th></th>${C.VACD.map(v => `<th>${D(v)}</th>`).join('')}</tr>${[0, 1, 2].map(pu => `<tr><th>${D(C.PURD[pu])}</th>${TIN[pu].map(x => `<td class="c">${D(x)}</td>`).join('')}</tr>`).join('')}</table>
      <table class="pt"><caption>आत्मनेपदम्</caption><tr><th></th>${C.VACD.map(v => `<th>${D(v)}</th>`).join('')}</tr>${[0, 1, 2].map(pu => `<tr><th>${D(C.PURD[pu])}</th>${TIN[pu + 3].map(x => `<td class="c">${D(x)}</td>`).join('')}</tr>`).join('')}</table></div>
      <p class="mut small">These eighteen replace the lakāra (ल्) of every tense and mood. Which set a root takes: ${sutraLink('1.3.12')} anudātta-ṅit roots → ātmanepada; ${sutraLink('1.3.72')} svarita-ñit roots → both (ubhayapada); ${sutraLink('1.3.78')} the rest → parasmaipada.</p>`;
  } else if (TAB === 'sup') {
    o.innerHTML = `<p>${await sutraLine('4.1.2')}</p><table class="pt"><tr><th></th>${C.VACD.map(v => `<th>${D(v)}</th>`).join('')}</tr>${SUP.map((r, i) => `<tr><th>${D(C.VIBD[i])}</th>${r.map(x => `<td class="c">${D(x)}</td>`).join('')}</tr>`).join('')}</table>
      <p class="mut small">The twenty-one case endings. सम्बोधनम् (vocative) uses the प्रथमा endings (${sutraLink('2.3.47')}). See every noun type in <a href="shabda.html">शब्दरूपाणि</a>.</p>`;
  } else if (TAB === 'upa') {
    const cur = $('#upr')?.value || String(C.byCode('01.1046') >= 0 ? C.byCode('01.1046') : GD[0]);
    const hr = C.DH.findIndex(e => e[1] === 'hf\\Y'); const pickR = cur;
    let h = `<p class="verse">उपसर्गेण धात्वर्थो बलादन्यत्र नीयते ।<br>प्रहाराहारसंहारविहारपरिहारवत् ॥</p>
      <p>${await sutraLine('1.4.58')}<br>${await sutraLine('1.4.59')}<br>${await sutraLine('1.4.80')}</p>
      <div class="ctl">root <select id="upr">${[hr, ...GD.slice(0, 30)].filter((x, i, a) => x >= 0 && a.indexOf(x) === i).map(di => `<option value="${di}" ${String(di) === pickR ? 'selected' : ''}>${D(C.dhatuPlain(C.DH[di][1]))} · ${E(sh(C.DH[di][4]))}</option>`).join('')}</select></div>
      <table class="kt"><tr><th>उपसर्गः</th><th>sense</th><th>लट् प्र॰ एक॰</th><th>क्त्वा → ल्यप्</th></tr>`;
    const di = +pickR;
    for (const u of Object.keys(C.UPD)) h += `<tr><td><b>${D(C.UPD[u])}</b></td><td><small>${UPM[u]}</small></td>${cell(C.tin(di, 0, 0, 0, 0, { pre: [u] }))}${cell(C.krt(di, 'ktvA', { pre: [u] }))}</tr>`;
    o.innerHTML = h + '</table>';
    $('#upr').onchange = () => body();
  }
  bindPK(o);
}
export async function start() {
  $('#app').innerHTML = `<h1>प्रत्ययाः · उपसर्गाः</h1><p class="sub">Pratyayas and upasargas · kṛt, taddhita, strī and sanādi suffixes, the tiṅ and sup endings, and the twenty-two prefixes — with their anubandhas, sūtras and live examples</p>
    <div class="tabs2" id="tb">${TABS.map(([k, l]) => `<button data-t="${k}">${D(l)}</button>`).join('')}</div><div id="out"><div class="load">…</div></div>`;
  await C.engine(); GD = await C.getJSON(new URL('game_dhatus.json', import.meta.url).href);
  const h = location.hash.slice(1); if (TABS.some(t => t[0] === h)) TAB = h;
  const mark = () => $$('#tb button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === TAB));
  $$('#tb button').forEach(b => b.onclick = () => { TAB = b.dataset.t; mark(); body() }); mark(); body();
  window.addEventListener('hashchange', () => { const x = location.hash.slice(1); if (TABS.some(t => t[0] === x)) TAB = x; mark(); body() });
}
