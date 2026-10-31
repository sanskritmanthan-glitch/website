// Builds sri-learn.json — grammar lessons (from vy/lessons.js) for the Bodhinī chat helper
import { UNITS, LESSONS } from '../vy/lessons.js';
import fs from 'fs';
const S = JSON.parse(fs.readFileSync(new URL('../vy/sutras.json', import.meta.url)));
const out = { units: UNITS, lessons: LESSONS.map((l, i) => ({ id: l.id, u: l.u, t: l.t, en: l.en, b: l.b.replace(/\s+/g, ' ').trim(),
  s: (l.s || []).map(n => [n, S['ashtadhyayi:' + n] || '']), play: l.play || '' })) };
fs.writeFileSync(new URL('../sri-learn.json', import.meta.url), JSON.stringify(out));
console.log(out.lessons.length, fs.statSync(new URL('../sri-learn.json', import.meta.url)).size);
