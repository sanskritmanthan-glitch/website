// पाठ्यक्रमः — the course. Each lesson: a short explanation, the key sūtras (text pulled live), live tables from the engine, and a game level to practise.
export const UNITS = [
  ['वर्णाः संज्ञाश्च', 'Sounds and technical terms'], ['सन्धिः', 'Sandhi'], ['सुबन्तम्', 'Nouns'], ['तिङन्तम्', 'Verbs'], ['प्रत्ययाः', 'Derivation'], ['वाक्यम्', 'The sentence'],
];
export const LESSONS = [
  // ---------- 1 varṇa
  { u: 0, id: 'varna', t: 'वर्णमाला · स्थानानि', en: 'The alphabet and where sounds are made',
    b: `<p>Sanskrit has 13 vowels (<b>अच्</b>) and 33 consonants (<b>हल्</b>), plus anusvāra (ं) and visarga (ः). Every sound has a <b>place</b> (स्थानम्) and an <b>effort</b> (प्रयत्नः). The grammar uses these to decide which sounds are "similar" (सवर्ण) — the basis of most sandhi rules.</p>
    <table class="kt"><tr><th>स्थानम्</th><th>vowels</th><th>consonants</th></tr><tr><td>कण्ठः throat</td><td>अ आ</td><td>क ख ग घ ङ ह</td></tr><tr><td>तालु palate</td><td>इ ई</td><td>च छ ज झ ञ य श</td></tr><tr><td>मूर्धा roof</td><td>ऋ ॠ</td><td>ट ठ ड ढ ण र ष</td></tr><tr><td>दन्ताः teeth</td><td>ऌ</td><td>त थ द ध न ल स</td></tr><tr><td>ओष्ठौ lips</td><td>उ ऊ</td><td>प फ ब भ म</td></tr><tr><td>कण्ठतालु</td><td>ए ऐ</td><td></td></tr><tr><td>कण्ठोष्ठम्</td><td>ओ औ</td><td>व (दन्तोष्ठम्)</td></tr></table>`,
    s: ['1.1.9', '1.1.10'], w: [], play: null },
  { u: 0, id: 'pratyahara', t: 'माहेश्वरसूत्राणि · प्रत्याहाराः', en: 'Śiva-sūtras and the short-hand names for sound groups',
    b: `<p>Pāṇini lists the sounds in fourteen <b>Māheśvara-sūtras</b>. Each ends in a marker consonant (इत्). A <b>pratyāhāra</b> — a first sound plus a later marker — names every sound in between: <b>अच्</b> = all vowels, <b>हल्</b> = all consonants, <b>इक्</b> = इ उ ऋ ऌ, <b>यण्</b> = य व र ल. Try any pratyāhāra below.</p>`,
    s: ['1.1.71', '1.3.3'], w: [{ w: 'pratyahara' }], play: null },
  { u: 0, id: 'samjna', t: 'संज्ञाः', en: 'Key terms: it, guṇa, vṛddhi, saṃyoga, pada …',
    b: `<p>The grammar works with defined terms (संज्ञा). The ones you meet in every derivation:</p>
    <ul><li><b>इत्</b> — a marker letter that is dropped (1.3.2–9); it switches rules on: कित् blocks guṇa, णित्/ञित् bring vṛddhi.</li><li><b>वृद्धिः</b> = आ ऐ औ (1.1.1); <b>गुणः</b> = अ ए ओ (1.1.2) — the two vowel grades.</li>
    <li><b>संयोगः</b> — a consonant cluster (1.1.7). <b>पदम्</b> — a word ending in sup or tiṅ (1.4.14). <b>धातुः</b> — a root (1.3.1). <b>प्रातिपदिकम्</b> — a noun stem (1.2.45–46).</li>
    <li><b>सार्वधातुकम्</b> / <b>आर्धधातुकम्</b> — the two kinds of verbal suffix (3.4.113–114) that decide vikaraṇa and iṭ.</li></ul>`,
    s: ['1.1.1', '1.1.2', '1.3.2', '1.3.9', '1.4.14', '3.4.113', '3.4.114'], w: [], play: null },
  // ---------- 2 sandhi
  { u: 1, id: 'acsandhi', t: 'अच्सन्धिः', en: 'Vowel sandhi',
    b: `<p>When a word ends in a vowel and the next begins with one, they combine. Five rules do almost all the work: <b>सवर्णदीर्घः</b> (like + like → long), <b>गुणः</b> (a + i/u/ṛ → e/o/ar), <b>वृद्धिः</b> (a + e/o → ai/au), <b>यण्</b> (i/u/ṛ + unlike vowel → y/v/r), <b>अयादिः</b> (e/o/ai/au + vowel → ay/av/āy/āv) — and <b>पूर्वरूपम्</b> (e/o + a → e/o + ऽ).</p>`,
    s: ['6.1.101', '6.1.87', '6.1.88', '6.1.77', '6.1.78', '6.1.109'], w: [{ w: 'sandhi', pairs: [['vidyA', 'Alaya'], ['rAma', 'iti'], ['mahA', 'fzi'], ['tava', 'eva'], ['iti', 'Adi'], ['su', 'Agatam'], ['ne', 'anam'], ['vane', 'atra']] }], play: 'sandhi/1' },
  { u: 1, id: 'halsandhi', t: 'हल्सन्धिः · विसर्गसन्धिः', en: 'Consonant and visarga sandhi',
    b: `<p>A final consonant takes on the voice of what follows (<b>जश्त्वम्</b>: वाक् + ईशः → वागीशः), assimilates (तत् + च → तच्च, तत् + लयः → तल्लयः), or a final म् becomes anusvāra before a consonant. Visarga becomes <b>ओ</b> after अ before soft sounds (रामः + गच्छति → रामो गच्छति), श्/स् before च/त, र् after other vowels, or drops.</p>`,
    s: ['8.2.39', '8.4.40', '8.4.60', '8.3.23', '8.2.66', '6.1.114', '8.3.34'], w: [{ w: 'sandhi', pairs: [['tat', 'ca'], ['vAk', 'ISa'], ['tat', 'lInaH'], ['jagat', 'nATaH'], ['rAmaH', 'gacCati'], ['hariH', 'vadati'], ['rAmaH', 'ca'], ['devAH', 'gacCanti'], ['saH', 'gacCati'], ['tvam', 'gacCa']] }], play: 'sandhi/7' },
  // ---------- 3 subanta
  { u: 2, id: 'subintro', t: 'सुबन्तम् · विभक्तयः', en: 'Nouns: eight cases, three numbers, three genders',
    b: `<p>A noun stem (प्रातिपदिकम्) takes one of the 21 <b>sup</b> endings (सु औ जस् …) for 7 cases × 3 numbers, plus the vocative. Each case expresses a <b>kāraka</b> role: प्रथमा the subject, द्वितीया the object, तृतीया the instrument, चतुर्थी the recipient, पञ्चमी the source, षष्ठी relation, सप्तमी location. Start with राम — the model for every a-stem masculine noun.</p>`,
    s: ['4.1.2', '1.4.21', '1.4.22'], w: [{ w: 'sup', stem: 'rAma', g: 'P' }], play: 'shabda/1' },
  { u: 2, id: 'ajanta', t: 'अजन्ताः', en: 'Vowel stems in the three genders',
    b: `<p>The ending of the stem and its gender decide the pattern. Learn one model for each: <b>राम</b> (अ पुं), <b>रमा</b> (आ स्त्री), <b>वन</b> (अ नपुं), <b>हरि</b>, <b>मति</b>, <b>वारि</b> (इ), <b>गुरु</b>, <b>धेनु</b>, <b>मधु</b> (उ), <b>नदी</b> (ई), <b>वधू</b> (ऊ), <b>पितृ</b>, <b>मातृ</b>, <b>दातृ</b> (ऋ).</p>`,
    s: ['7.1.12', '7.1.9', '6.1.102', '7.3.111'], w: [{ w: 'sup', stem: 'ramA', g: 'S' }, { w: 'sup', stem: 'vana', g: 'N' }, { w: 'sup', stem: 'hari', g: 'P' }, { w: 'sup', stem: 'nadI', g: 'S' }, { w: 'sup', stem: 'pitf', g: 'P' }], play: 'shabda/3' },
  { u: 2, id: 'halanta', t: 'हलन्ताः', en: 'Consonant stems',
    b: `<p>Consonant stems change their stem before different endings: <b>राजन्</b> → राजा, राजानम्, राज्ञा; <b>मनस्</b> → मनः, मनसा; <b>भगवत्</b> → भगवान्, भगवन्तम्; <b>वाच्</b> → वाक्, वाचा. The "strong" stem appears in the first five endings (सर्वनामस्थानम्, 1.1.43).</p>`,
    s: ['1.1.43', '6.4.8', '6.4.134', '8.2.7'], w: [{ w: 'sup', stem: 'rAjan', g: 'P' }, { w: 'sup', stem: 'manas', g: 'N' }, { w: 'sup', stem: 'Bagavat', g: 'P' }, { w: 'sup', stem: 'vAc', g: 'S' }], play: 'shabda/8' },
  { u: 2, id: 'sarvanama', t: 'सर्वनामानि · सङ्ख्याः', en: 'Pronouns and numerals',
    b: `<p>Pronouns (सर्वादि गण, 1.1.27) have their own endings — सर्वे not सर्वाः, सर्वस्मै not सर्वाय. <b>तद्</b> (स, सा, तत्), <b>यद्</b>, <b>किम्</b>, <b>इदम्</b>, <b>अदस्</b>, and the personal pronouns <b>अस्मद्</b> (अहम्) and <b>युष्मद्</b> (त्वम्), which have no gender. Numerals एक–चतुर् agree in gender; पञ्चन् onwards do not.</p>`,
    s: ['1.1.27', '7.1.14', '7.2.102', '7.2.94'], w: [{ w: 'sup', stem: 'sarva', g: 'P' }, { w: 'sup', stem: 'tad', g: 'S' }, { w: 'sup', stem: 'asmad', g: 'P' }, { w: 'sup', stem: 'yuzmad', g: 'P' }], play: 'shabda/9' },
  // ---------- 4 tiṅanta
  { u: 3, id: 'tinintro', t: 'तिङन्तम् · लट्', en: 'Verbs: person, number, the present tense',
    b: `<p>A verb = root (धातुः) + vikaraṇa + one of 18 <b>tiṅ</b> endings: 3 persons (प्रथम = he/she, मध्यम = you, उत्तम = I/we) × 3 numbers × 2 padas (परस्मैपदम्, आत्मनेपदम्). <b>लट्</b> is the present: भवति "is, becomes". Click any form to watch the rules build it: भू + लट् → तिप् → शप् → गुणः → अवादेशः → भवति.</p>`,
    s: ['3.4.78', '3.2.123', '3.1.68', '7.3.84', '6.1.78'], w: [{ w: 'tin', root: 'BU', la: [0] }], play: 'rupa/1' },
  { u: 3, id: 'pada', t: 'परस्मैपदम् · आत्मनेपदम्', en: 'The two voices of endings',
    b: `<p>Roots marked with an anudātta vowel or ङ् take ātmanepada (एधते, सेवते); those marked with svarita or ञ् take both (करोति / कुरुते, "does for others / for oneself"); the rest take parasmaipada. Upasargas can change the pada: नि + विश् → निविशते (1.3.17).</p>`,
    s: ['1.3.12', '1.3.72', '1.3.78', '1.3.17'], w: [{ w: 'tin', root: 'eDa~\\', la: [0] }, { w: 'tin', root: 'qukf\\Y', la: [0] }], play: 'rupa/2' },
  { u: 3, id: 'gana', t: 'दश गणाः · विकरणानि', en: 'The ten classes and their stem-suffixes',
    b: `<p>Before sārvadhātuka endings each class inserts its own <b>vikaraṇa</b>: भ्वादि शप् (भवति), अदादि — (अत्ति), जुहोत्यादि श्लु + reduplication (जुहोति), दिवादि श्यन् (दीव्यति), स्वादि श्नु (सुनोति), तुदादि श (तुदति), रुधादि श्नम् (रुणद्धि), तनादि उ (तनोति), क्र्यादि श्ना (क्रीणाति), चुरादि णिच् (चोरयति).</p>`,
    s: ['3.1.68', '2.4.72', '2.4.75', '3.1.69', '3.1.73', '3.1.77', '3.1.78', '3.1.79', '3.1.81', '3.1.25'], w: [{ w: 'gana' }], play: 'rupa/2' },
  { u: 3, id: 'lakara', t: 'दश लकाराः', en: 'The ten tenses and moods',
    b: `<p>लट् present · लिट् perfect (बभूव) · लुट् periphrastic future (भविता) · लृट् future (भविष्यति) · लोट् imperative (भवतु) · लङ् imperfect (अभवत्) · विधिलिङ् optative (भवेत्) · आशीर्लिङ् benedictive (भूयात्) · लुङ् aorist (अभूत्) · लृङ् conditional (अभविष्यत्). (लेट् is Vedic.) Past tenses लङ्, लुङ्, लृङ् take the augment अट् (6.4.71).</p>`,
    s: ['3.2.123', '3.2.115', '3.3.15', '3.3.13', '3.3.162', '3.2.111', '3.3.161', '3.3.173', '3.2.110', '3.3.139', '6.4.71'], w: [{ w: 'tin', root: 'BU', la: [1, 3, 5, 6, 7, 9] }], play: 'rupa/3' },
  { u: 3, id: 'karmani', t: 'कर्मणि भावे च', en: 'Passive and impersonal',
    b: `<p>In the passive the object becomes the subject and the verb takes ātmanepada with the vikaraṇa <b>यक्</b>: रामः ग्रन्थं पठति → रामेण ग्रन्थः पठ्यते. Intransitive roots form the impersonal (भावे): मया भूयते "it is been by me".</p>`,
    s: ['3.1.67', '1.3.13', '3.4.69'], w: [{ w: 'tin', root: 'paWa~', la: [0, 6], pr: 1 }], play: 'rupa/9' },
  { u: 3, id: 'sanadi', t: 'णिजन्ताः सन्नन्ताः यङन्ताः', en: 'Causative, desiderative, intensive',
    b: `<p>Some suffixes make a new root from a root: <b>णिच्</b> "cause to" (भावयति, पाठयति), <b>सन्</b> "wish to" (बुभूषति, पिपठिषति), <b>यङ्</b> "do intensely/repeatedly" (बोभूयते). These new roots take every lakāra — open them in धातुरूपाणि with the सनादि menu.</p>`,
    s: ['3.1.26', '3.1.7', '3.1.22', '3.1.32'], w: [{ w: 'tin', root: 'paWa~', la: [0], san: 'Ric' }, { w: 'tin', root: 'paWa~', la: [0], san: 'san' }], play: null },
  { u: 3, id: 'upasarga', t: 'उपसर्गाः', en: 'The twenty-two prefixes',
    b: `<p>प्र परा अप सम् अनु अव निस् दुस् वि आङ् नि अधि अपि अति सु उद् अभि प्रति परि उप. "An upasarga forcibly carries the root's meaning elsewhere": हरति takes, प्रहरति strikes, आहरति brings, संहरति destroys, विहरति roams, परिहरति avoids. See them all live on the प्रत्ययाः · उपसर्गाः page.</p>`,
    s: ['1.4.58', '1.4.59', '1.4.80'], w: [{ w: 'upa', root: 'hf\\Y' }], play: 'rupa/10' },
  // ---------- 5 derivation
  { u: 4, id: 'krt', t: 'कृदन्ताः', en: 'Primary derivatives: participles, gerunds, infinitives, agent and action nouns',
    b: `<p>Suffixes added directly to roots: गतः (क्त), गतवान् (क्तवतु), गच्छन् (शतृ), गत्वा (क्त्वा), आगम्य (ल्यप्), गन्तुम् (तुमुन्), गन्तव्यः (तव्य), गमनीयः (अनीयर्), गमनम् (ल्युट्), गन्तृ (तृच्), गामकः (ण्वुल्), गतिः (क्तिन्). Participles decline like nouns.</p>`,
    s: ['3.1.93', '3.2.102', '3.4.21', '3.3.10', '3.1.96', '7.1.37'], w: [{ w: 'krt', root: 'gamx~' }], play: 'mela/5' },
  { u: 4, id: 'taddhita', t: 'तद्धिताः', en: 'Secondary derivatives',
    b: `<p>Suffixes added to nouns: दाशरथिः "son of Daśaratha" (इञ्), औपगवः (अण्), देवत्वम् / देवता "divinity" (त्व, तल्), शिववान् "having Śiva" (मतुप्), पटुतरः / पटीयान् "cleverer", पटुतमः / पटिष्ठः "cleverest", सुवर्णमयम् "made of gold" (मयट्), तत्र "there" (त्रल्).</p>`,
    s: ['4.1.76', '4.1.92', '5.1.119', '5.2.94', '5.3.55', '5.3.57'], w: [{ w: 'tad', items: [['daSaraTa', 'iY'], ['upagu', 'aR'], ['deva', 'tva'], ['deva', 'tal'], ['Siva', 'matup'], ['pawu', 'tarap'], ['pawu', 'Iyasun'], ['pawu', 'izWan'], ['suvarRa', 'mayaw']] }], play: null },
  { u: 4, id: 'stri', t: 'स्त्रीप्रत्ययाः', en: 'Feminine suffixes',
    b: `<p>Feminines are made with टाप् (अज → अजा, बाल → बाला), ङीप् (कर्तृ → कर्त्री, भवत् → भवती), ङीष् (गौर → गौरी), ति (युवन् → युवतिः), ऊङ् (कुरु → कुरूः).</p>`,
    s: ['4.1.3', '4.1.4', '4.1.5', '4.1.41', '4.1.77'], w: [{ w: 'sup', stem: 'kartf', g: 'S' }], play: null },
  { u: 4, id: 'samasa', t: 'समासाः', en: 'Compounds',
    b: `<p>Two or more words join into one; the case endings inside drop (2.4.71) and the compound is explained by a <b>vigraha</b>:</p>
    <table class="kt"><tr><th>समासः</th><th>example</th><th>vigraha</th></tr>
    <tr><td><b>अव्ययीभावः</b> (2.1.5)</td><td>यथाशक्ति</td><td>शक्तिम् अनतिक्रम्य — first member an indeclinable; the whole is indeclinable</td></tr>
    <tr><td><b>तत्पुरुषः</b> (2.1.22)</td><td>राजपुरुषः</td><td>राज्ञः पुरुषः — the second member is the head; named by the case of the first: द्वितीया (कृष्णाश्रितः), तृतीया (शङ्कुलाखण्डः), चतुर्थी (यूपदारु), पञ्चमी (चोरभयम्), षष्ठी (राजपुरुषः), सप्तमी (अक्षशौण्डः)</td></tr>
    <tr><td><b>कर्मधारयः</b> (1.2.42)</td><td>नीलोत्पलम्</td><td>नीलं च तत् उत्पलं च — both members refer to the same thing</td></tr>
    <tr><td><b>द्विगुः</b> (2.1.52)</td><td>त्रिलोकी</td><td>त्रयाणां लोकानां समाहारः — first member a numeral</td></tr>
    <tr><td><b>नञ्तत्पुरुषः</b> (2.2.6)</td><td>अब्राह्मणः</td><td>न ब्राह्मणः</td></tr>
    <tr><td><b>बहुव्रीहिः</b> (2.2.24)</td><td>पीताम्बरः</td><td>पीतम् अम्बरं यस्य सः (विष्णुः) — the compound describes something else</td></tr>
    <tr><td><b>द्वन्द्वः</b> (2.2.29)</td><td>रामलक्ष्मणौ · पाणिपादम्</td><td>रामः च लक्ष्मणः च — "and"; इतरेतर (dual/plural) or समाहार (neuter singular)</td></tr></table>
    <p class="mut small">Compounds are analysed by meaning, so they are taught here with models rather than generated.</p>`,
    s: ['2.1.3', '2.1.5', '2.1.22', '1.2.42', '2.1.52', '2.2.24', '2.2.29', '2.4.71'], w: [], play: null },
  { u: 4, id: 'avyaya', t: 'अव्ययानि', en: 'Indeclinables',
    b: `<p>Words that never change (1.1.37): च, वा, हि, तु, एव, अपि, इति, न, यथा, तथा, यदा, तदा, कदा, अत्र, तत्र, कुत्र, सह, विना, उच्चैः, नीचैः, शनैः… Also the forms in -त्वा, -तुम्, -य (1.1.39–40) and taddhitas like -तः, -त्र, -दा (1.1.38).</p>`,
    s: ['1.1.37', '1.1.38', '1.1.39', '1.1.40', '2.4.82'], w: [], play: null },
  // ---------- 6 sentence
  { u: 5, id: 'karaka', t: 'कारकाणि · विभक्त्यर्थाः', en: 'Kārakas: how cases show roles in a sentence',
    b: `<p>Pāṇini defines six kārakas by their part in the action: <b>अपादानम्</b> fixed point of departure (1.4.24 → पञ्चमी: वृक्षात् पत्रं पतति), <b>सम्प्रदानम्</b> recipient (1.4.32 → चतुर्थी: विप्राय गां ददाति), <b>करणम्</b> chief means (1.4.42 → तृतीया: दात्रेण लुनाति), <b>अधिकरणम्</b> locus (1.4.45 → सप्तमी: स्थाल्यां पचति), <b>कर्म</b> what the agent most wants (1.4.49 → द्वितीया: कटं करोति), <b>कर्ता</b> the independent agent (1.4.54). The case appears only on the kāraka that the verb does not already express (2.3.1 अनभिहिते).</p>`,
    s: ['1.4.23', '1.4.24', '1.4.32', '1.4.42', '1.4.45', '1.4.49', '1.4.54', '2.3.1', '2.3.2', '2.3.18', '2.3.28', '2.3.36', '2.3.50'], w: [], play: null },
  { u: 5, id: 'chandas', t: 'छन्दः', en: 'Metre',
    b: `<p>Verse is measured by syllable weight: a syllable is <b>गुरु</b> if its vowel is long or it is followed by a cluster, anusvāra or visarga; otherwise <b>लघु</b>. Metres are defined by gaṇas of three syllables (य मा ता रा ज भा न स ल गम्) or by mātrās (āryā). Find the metre of any verse in the <a href="chandas.html">metre finder</a>, and practise in the game.</p>`,
    s: ['1.4.10', '1.4.11', '1.4.12'], w: [], play: 'chandas/1' },
];
