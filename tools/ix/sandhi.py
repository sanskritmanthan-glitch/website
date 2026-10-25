"""External and compound sandhi for 'analytic' (pausa-form) editions, in SLP1.
GRETIL's analytic texts print every word in pausa (sas māsas, divasas bhavet) and mark compound
members with '-' or '.'; join() turns a sequence of tokens back into ordinary saṃhitā text."""
import re
V = 'aAiIuUfFxXeEoO'
VOICED = set(V + 'gGjJqQdDbBNYRnmyrlvh')
SHORT = 'aiuf'

def _vv(a, b):
    """final vowel a + initial vowel b → (left ending, right start, merged?)"""
    if a in 'aA':
        if b in 'aA': return 'A', '', True
        if b in 'iI': return 'e', '', True
        if b in 'uU': return 'o', '', True
        if b in 'fF': return 'ar', '', True
        if b in 'eE': return 'E', '', True
        if b in 'oO': return 'O', '', True
    if a in 'iI': return ('I', '', True) if b in 'iI' else ('y' + b, None, True)
    if a in 'uU': return ('U', '', True) if b in 'uU' else ('v' + b, None, True)
    if a in 'fF': return ('r' + b, None, True)
    if a == 'e': return ('e', "'", False) if b == 'a' else ('a', b, False)
    if a == 'o': return ('o', "'", False) if b == 'a' else ('a', b, False)
    if a == 'E': return ('A', b, False)
    if a == 'O': return ('Av' + b, None, True)
    return a, b, False

def pair(L, R, compound=False):
    """returns (left, right, glue) — glue '' joins the two, ' ' keeps them apart"""
    sep = '' if compound else ' '
    if not L or not R: return L, R, sep
    a, b = L[-1], R[0]
    if b == 'C' and a in V and (compound or a in SHORT or L in ('A', 'mA')): R = 'c' + R
    if a in V and b in V:
        le, rs, merged = _vv(a, b)
        if rs is None: return L[:-1] + le + R[1:], '', ''        # y/v/r + vowel: one word
        if merged: return L[:-1] + le + rs + R[1:], '', ''
        if rs == "'": return L[:-1] + le, "'" + R[1:], sep
        return L[:-1] + le, R, sep
    if a in 'sH':
        stem = L[:-1]
        if L in ('sas', 'sasH', 'saH', 'ezas', 'ezaH') and b not in V: return stem, R, sep   # sa / eṣa before consonants
        if stem.endswith('a') and not stem.endswith('A'):
            if b == 'a': return stem[:-1] + 'o', "'" + R[1:], sep
            if b in V: return stem, R, sep
            if b in VOICED: return stem[:-1] + 'o', R, sep
        elif stem.endswith('A'):
            if b in VOICED: return stem, R, sep
        elif stem and stem[-1] in V and b in VOICED:
            if b == 'r': return stem[:-1] + {'i': 'I', 'u': 'U'}.get(stem[-1], stem[-1]), R, sep
            return stem + 'r', R, ('' if b in V and compound else sep)
        if b in 'cC': return stem + 'S', R, sep
        if b in 'wW': return stem + 'z', R, sep
        if b in 'tT': return stem + 's', R, sep
        return stem + 'H', R, sep
    if a == 't':
        if b in 'nm': return L[:-1] + 'n', R, sep
        if b == 'l': return L[:-1] + 'l', R, sep
        if b in 'cC': return L[:-1] + 'c', R, sep
        if b in 'jJ': return L[:-1] + 'j', R, sep
        if b == 'S': return L[:-1] + 'c', 'C' + R[1:], sep
        if b == 'h': return L[:-1] + 'd', 'D' + R[1:], sep
        if b in VOICED: return L[:-1] + 'd', R, ('' if b in V and compound else sep)
        return L, R, sep
    if a == 'k' and b in VOICED: return L[:-1] + ('N' if b in 'nm' else 'g'), R, sep
    if a == 'w' and b in VOICED: return L[:-1] + ('R' if b in 'nm' else 'q'), R, sep
    if a == 'p' and b in VOICED: return L[:-1] + ('m' if b in 'nm' else 'b'), R, sep
    if a == 'm':
        return (L, R, sep) if b in V else (L[:-1] + 'M', R, sep)
    if a == 'n':
        if b in 'cC': return L[:-1] + 'MS', R, sep
        if b in 'tT': return L[:-1] + 'Ms', R, sep
        if b in 'jJS': return L[:-1] + 'Y', R, sep
        if b == 'l': return L[:-1] + 'Ml', R, sep
        if b in V and len(L) > 1 and L[-2] in SHORT and not compound: return L + 'n', R, sep
    return L, R, sep

def join(tokens):
    """tokens: [(word, boundary_after)] where boundary is ' ' (word), '-' (compound) or None (end).
    returns saṃhitā text in SLP1"""
    out = []
    cur = tokens[0][0] if tokens else ''
    for i in range(len(tokens) - 1):
        nxt = tokens[i + 1][0]
        L, R, glue = pair(cur, nxt, tokens[i][1] == '-')
        if glue == '' and R == '':
            cur = L; continue
        if glue == '':
            cur = L + R; continue
        out.append(L); cur = R
    out.append(cur)
    s = ' '.join(x for x in out if x)
    s = re.sub(r"(?<=[sH]) $", '', s)
    return re.sub(r'[sH]$', 'H', s.strip()) if re.search(r'[aAiIuUeEoO]s$', s.strip()) else s.strip()

def pausa_line(iast, compound_marks='-'):
    """IAST 'varṣam dvādaśa-māsās triṃśat-divasas bhavet sas māsas tu' → sandhi'd SLP"""
    from skt import iast2slp
    toks = []
    for w in iast.split():
        parts = [p for p in re.split('[' + re.escape(compound_marks) + ']', w)]
        parts = [p for p in parts if p]
        for j, p in enumerate(parts):
            toks.append([iast2slp(p), '-' if j < len(parts) - 1 else ' '])
    if not toks: return ''
    toks[-1][1] = None
    return join([tuple(t) for t in toks])

if __name__ == '__main__':
    import sys
    sys.path.insert(0, '../shloka'); from skt import iast2slp, slp2dev
    for t in ['varṣam dvādaśa-māsās triṃśat-divasas bhavet sas māsas tu', 'ṣaṣṭis nāḍyas divasas ṣaṣṭis ca vināḍikā nāḍī',
              'jānāti yas yuga-gatam kathitāt adhimāsa-śeṣakāt iṣṭāt', 'na asya asmin loke pratyāpattis vidyate',
              'adhika-agra-cheda-guṇam dvi-cheda-agram adhika-agra-yutam', 'patitas pitā parityājyas mātā tu putre na patati']:
        print(slp2dev(pausa_line(t)))
