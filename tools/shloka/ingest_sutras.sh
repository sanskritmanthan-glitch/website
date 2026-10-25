#!/bin/sh
# Rebuild the sūtra–kārikā corpus from a GRETIL mirror: sh ingest_sutras.sh <path to gretil/1_sanskr>
G=$1
grep -v '^#' sutra_texts.tsv | while IFS='	' read f id t a d k u nj; do
  python3 sutra_ingest.py "$G/$f" --id "$id" --title "$t" --author "$a" --darshana "$d" --kind "$k" --units "$u" ${nj:+--nojoin}
done
