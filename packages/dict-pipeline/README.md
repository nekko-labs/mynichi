# @mynichi/dict-pipeline

Builds a compact common-words Japanese-English dictionary JSON for the Expo app
from [jmdict-simplified](https://github.com/scriptin/jmdict-simplified).

## Build

```sh
cd packages/dict-pipeline
bun run build
```

This:

1. Downloads the latest `jmdict-eng-common-3.*.json.tgz` release asset via the
   GitHub API (cached in `.cache/`, so re-runs work offline).
2. Keeps entries that have at least one `common: true` kanji or kana form
   (news1/ichi1/spec1/spec2/gai1 priority in JMdict). Entries are ranked by
   the lowest `nfXX` frequency tag when present, but jmdict-simplified does
   not expose nf tags, so in practice all ~22600 common entries are kept
   (they fit the size budget); the script trims to 12000 entries or 3
   glosses only if the output would exceed 2.5 MB.
3. Maps each entry to a compact record
   `{ s: id, k?: kanji, r: kana, g: glosses (max 4), p?: partOfSpeech (max 3) }`.
4. Writes minified JSON to `apps/native/public/data/dict-common.json`
   (target size: <= 2.5 MB; the script auto-reduces entries/glosses if larger).

## Attribution (required)

The generated data is derived from **JMdict**, property of the
[Electronic Dictionary Research and Development Group (EDRDG)](https://www.edrdg.org/),
used under the group's [licence](https://www.edrdg.org/edrdg/licence.html)
(Creative Commons Attribution-ShareAlike 4.0). The JSON conversion is by the
jmdict-simplified project. Any app or site shipping this data **must**
display an acknowledgement of the EDRDG as the source of JMdict and link to
the licence, per the EDRDG licence terms.
