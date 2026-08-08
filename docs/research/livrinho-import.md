# Livrinho import: Cifra JSON + initial Trechos

Research for [Livrinho import: cifra + lyric chunks](https://github.com/mmdfmateus/alvo-songs/issues/3). How the COMU *Livrinho de cifras* markdown should be turned into ChordSheetJS Cifra JSON plus initial editorial Lyric chunks (UI: Trechos). This is a spec decision, not an implementation plan.

Probe numbers below were produced by running **chordsheetjs@7.17.0** (the version Alvo Cifras depends on) against `programa-slides-builder/data/sources/livrinho-de-cifras.md`.

## Domain terms

From [`CONTEXT.md`](../../CONTEXT.md):

- **Cifra** — canonical chords-and-lyrics content of a Song. Not a second stored original.
- **Letra** — lyric-only reading **derived from Cifra** by omitting chords. Not an independently stored original.
- **Lyric chunk** (UI: **Trecho**) — one ordered, slide-sized unit. Initially derived from that Song’s Letra; thereafter independently editable.

## What already exists (neither pipeline is the full import)

### Livrinho source

The booklet text lives at `programa-slides-builder/data/sources/livrinho-de-cifras.md` (same text as Downloads *Livrinho de crifas.md*). Songs are numbered headings, mostly `**N- Title**`, with chords-over-words body (chord line above lyric line), plus booklet-specific noise (markdown bold/italic, escapes, parenthetical progressions, `Intr:`, CifraClub links, backticks).

Title split with the slides seed regexes finds **110** songs and matches `data/song-library-seed.json` titles exactly.

One heading is **not** bold and is swallowed into the previous Song: plain `25- Convite à Liberdade` sits inside **24- Conheci um Grande Amigo**; the next bold heading is `**25- Despertar**`. Song **42** is the only `## **42- Title**` variant.

### Alvo Cifras: parse Cifra, derive Letra, no Trechos

On create/edit, Alvo Cifras instantiates `ChordsOverWordsParser`, previews with `HtmlTableFormatter` / `TextFormatter`, and persists `JSON.stringify(serializer.serialize(song))` as `chords`. The tRPC `create`/`edit` mutations also copy that same JSON into Prisma `lyrics` — Letra is not a separate parse.

The public song page deserializes `chords` with `ChordSheetSerializer`, renders Cifra via `HtmlDivFormatter`, and builds the Letra tab by joining `ChordLyricsPair.lyrics` from each line. Artist is **required** on create. There is no Lyric-chunk / Trecho model.

### Programa Slides: strip chords, chunk Trechos, no Cifra

`scripts/seed-from-cifras.py` regenerates `data/song-library-seed.json`: title split, heuristic `is_chord_line` / `clean_lyric_line`, then blank-line paragraphs as chunks (if a single blob has ≥5 newlines, split every ~4 lines). Output is `{ sourceNumber, title, lyricChunks }` only — **no** ChordSheetJS JSON.

`lib/db/songs.ts` `seedSongsIfEmpty()` loads that file into Drizzle `songs` + `lyric_chunks`. The seed file itself notes chunks are heuristic and need Biblioteca review. Observed seed stats: **110** songs, **0** empty chunk lists, average **5.09** chunks, max **23**.

## ChordSheetJS (first-party)

Official docs: [ChordSheetJS README](https://github.com/martijnversluis/ChordSheetJS/blob/master/README.md) and [API](https://martijnversluis.github.io/ChordSheetJS/).

- **`ChordsOverWordsParser`** — supported parser for “regular” chords-over-words sheets. PEG-based (`parse` → AST → `ChordSheetSerializer.deserialize`). API also documents optional ChordPro-ish directives, unbracketed `title:` / `key:`, and a markdown `---` frontmatter separator. `ChordsOverWordsParser` is explicitly “the better version of `ChordSheetParser`, which is deprecated.”
- **`ChordSheetParser`** — deprecated line scanner. `CHORD_LINE_REGEX` in 7.17.0 is `/^\s*((([A-G])(#|b)?([^/\s]*)(\/([A-G])(#|b)?)?)(\s|$)+)+(\s|$)+/`; if a line matches and a next line exists, it pairs them character-wise into `ChordLyricsPair`s; otherwise the line becomes lyrics. Constructor emits a deprecation warning.
- **`ChordSheetSerializer`** — `serialize(song)` → plain object (`SerializedSong`: `{ type: 'chordSheet', lines: SerializedLine[] }`); `deserialize` round-trips. This is the JSON shape Alvo Cifras stores.
- **`Song`** — `lines`, `paragraphs` / `bodyParagraphs` (blank lines split paragraphs). Letra is not a first-class field; extract `ChordLyricsPair.lyrics` as Alvo Cifras already does.
- **`ParserWarning`** — documented as currently used by `ChordProParser`, not by the chords-over-words PEG. A failed COW parse **throws** (structured Peggy error), it does not return a partial Song plus warnings.

Alvo Cifras pins `chordsheetjs@^7.17.0`. That PEG grammar (7.17.0 `lib/index.js`) pairs a chords line with the **next non-empty lyrics line** (`ChordLyricsLines`) and does **not** require a chords line to consume the whole line before committing. Current upstream grammar is stricter (lookahead that the chords line is not followed by extra word characters). Either way, unexpected characters still throw.

## Parser options

### A. `ChordsOverWordsParser` (Alvo Cifras create path)

**Fit:** same parser the editor already uses; richest chord vocabulary; output is a real `Song` ready to serialize.

**Against the livrinho (7.17.0, observed):**

| Input | Parse OK | Throw |
| --- | ---: | ---: |
| NBSP + `\-` / `\!` / `\#` unescape only | 42 / 110 | **68** |
| Booklet cleanup (unescape, strip `*`/`**`/backticks, unwrap `[chord](url)`, `Intr:`→`Intro:`, unwrap `(G - C9)`, strip trailing `Am.`) | 41 / 110 | **69** |

Throws are hard PEG failures, e.g. `Expected "#" "-" "/" … [A-G] or end of input but "á" found.` Song **1** still fails after cleanup on `Da distância avistei…` — a Portuguese lyric line starting with **D** after a chord-only progression line; the PEG starts a chord and then hits `â`.

Cleanup does **not** make COW viable as the sole bulk parser. It remains the right parser for **interactive** Editor paste (preview + fix), which is how Alvo Cifras already uses it.

### B. `ChordSheetParser` (deprecated, lenient)

**Fit:** never threw on all 110 songs after the same booklet cleanup. Produces a `Song` + serializer JSON. C9 / G/F# / E/G# round-trip in the formatter for well-aligned songs (e.g. **1**, **2**, **105**, **110** after cleanup).

**Against the livrinho (observed):**

- **21** songs with **0** unique chord tokens after cleanup — some are genuinely lyric-only in the booklet (**8- Amor Pra Mim**, **106- Um Dia a Mais**, **107- Vaidade**); others have chords ChordSheetParser’s regex does not treat as a chord line (complex suffixes, `Intro` without colon, etc.).
- False-positive “chords”: **4- Aleluia** mixed chorus line (`…A7 **Que tão linda…**`) yields unique tokens including `Que`, `tão`, `linda`; **109** yields `Agora`.
- `Intro: C Am Dm G` is not a `CHORD_LINE_REGEX` match, so it lands in Letra (see **4**, **108** derived Letra).
- Parenthetical progressions still leak into Letra when unwrap is incomplete (**2**, **63**, **79**, **90**, **102**, **104**).
- Must pass a **fresh `Song`** into `parse(text, { song: new Song() })`; reusing one parser instance accumulates lines across songs (7.17.0 `initialize` only replaces `this.song` when `song` is passed).
- Deprecated upstream; weaker suffix coverage than COW by the authors’ own README.

### C. Custom line classifier (slides `is_chord_line` + build a `Song`)

**Fit:** already tuned to this booklet: `Intr.`/`Intro`/`Passagem`/`Solo`/`Riff`, parenthetical `(G - C9)`, `x2`/`x3`, chordish vs long Portuguese words, leading chord-token strip on lyric lines. Title split is proven (110 songs). Can emit `ChordLyricsPair`s (or Tags for intros) and still `ChordSheetSerializer.serialize`.

**Cost:** reimplements chord/lyric pairing (column alignment) instead of using a first-party parser. Must stay in sync with ChordSheetJS `Song` / serializer. Does not by itself produce Cifra JSON today — seed output is lyric chunks only.

A thin custom **pre-pass** (cleanup + `is_chord_line` to drop/normalize bad lines) feeding COW or ChordSheetParser is smaller than a full custom Song builder.

### Recommendation (parser)

Do **not** feed raw livrinho bodies to `ChordsOverWordsParser` for bulk import. Do **not** invent a parallel Cifra format.

**Bulk import:** booklet cleanup → try `ChordsOverWordsParser` → on throw, fall back to `ChordSheetParser` with a fresh `Song` → always persist `ChordSheetSerializer` JSON as Cifra. Flag fallbacks and 0-chord results for Editor review.

**Interactive Editor (after import, and for new Songs):** keep `ChordsOverWordsParser` + live preview, same as Alvo Cifras `AddSongForm`.

**Custom code** is justified for: title split (reuse `TITLE_RE` / `TITLE_RE2` + unbolded `N- Title`), booklet cleanup, `is_chord_line`-style filtering of guitar-tab / leftover markdown, and Letra/Trecho derivation — not for replacing the ChordSheetJS Song model.

## Chunking options (initial Trechos)

Glossary: Trechos are **initially derived from Letra**, then independently editable. Do not store Trechos as a live view of Letra.

### 1. Reuse `seed-from-cifras.py` chunker (recommended, on derived Letra)

Blank-line paragraphs; if only one chunk and ≥5 newlines, split every 4 lines. Already used to seed Programa Slides; average **5.09** Trechos/song.

**Do not** import `song-library-seed.json` as-is for Alvo Cifras. That file was chunked from **chord-stripped booklet text**, not from Letra-of-Cifra. Observed leftovers:

- Markdown / CifraClub URLs still inside Trechos: sourceNumbers **29, 47, 55, 56, 105, 110**.
- Chord-like lines left in Trechos: **10, 18, 31, 55, 57, 77, 93**.
- Song **24** Trechos include the swallowed heading `25- Convite à Liberdade` and `(A7M - C#m - D7+)`.
- Song **110** Trechos keep backticks and `[E11/G#](cifraclub…)` links.
- Song **5** Trechos keep stray `*` from italics.

Reuse the **algorithm**, applied to Letra extracted from the parsed Cifra (`ChordLyricsPair.lyrics`, skip tag/intro lines), after booklet cleanup.

### 2. ChordSheetJS `bodyParagraphs`

After ChordSheetParser + cleanup, average **7.12** body paragraphs vs **5.20** seed-style chunks on the same Letra. Finer split, still blank-line driven, no 4-line fallback for a single long verse. Worse default for slide-sized Trechos (COMU slides want fewer, denser chunks). Useful as a diagnostic, not as the default chunker.

### 3. Naive paragraphs only (no 4-line fallback)

The seed script’s 4-line fallback exists because some booklet songs have almost no blank lines. Dropping it would produce oversized Trechos (the seed comment already calls this heuristic).

### 4. Verse/chorus labels (`Refrão`, `Intro`)

The booklet uses free-text `Refrão` / `Intro` / `(3x)`, not ChordPro `{start_of_chorus}`. Treating those as section boundaries without also splitting verses still leaves huge blocks. Keep labels as Letra lines or comment Tags; do not key Trechos off them for v1.

### Recommendation (chunking)

1. Derive Letra from Cifra (`ChordLyricsPair.lyrics`), omitting chord-only pairs and intro/comment Tags.
2. Chunk that Letra with the seed paragraph + 4-line fallback.
3. Persist ordered Lyric chunks; Editors edit Trechos independently afterward (Biblioteca), as slides already assume.

## Failure modes in the booklet (observed)

| Mode | Example | Effect |
| --- | --- | --- |
| Unbolded title | `25- Convite à Liberdade` | Swallowed into Song 24; seed Trechos polluted |
| `##` title | `## **42- Faça Valer a Pena**` | Need `TITLE_RE2` |
| NBSP | Song **2** chord/lyric lines | Must normalize before any parser |
| Markdown escapes | `G \- C9`, `G/F\#`, `deixará\!` | Breaks chord tokens / PEG |
| Bold/italic wrapping | `**Aleluia…**`, `*A alegria…*` | COW throw on `*`; seed leftover `*` |
| Backticks around whole sheet | Song **110** | Seed Trechos are unusable; cleanup + ChordSheetParser recovers Cifra/Letra |
| CifraClub markdown links | `[E/G#](https://www.cifraclub.com.br/…)` on **29, 105, 110** | Seed keeps URLs; unwrap to `E/G#` before parse |
| Parenthetical progressions | `(G - C9)`, `(A11 - A)` | COW throw; ChordSheetParser often treats as lyrics unless unwrapped |
| `Intr:` vs `Intro:` | Songs **4, 108** | COW keyword is `intro`; ChordSheetParser leaves `Intro:` in Letra |
| Trailing dots on chords | `Am.`, `G/B.`, `C.` (Song **5**, **42**) | COW throw on `.` |
| Mixed chord + lyric on one line | Song **4** chorus + `A7 **Que tão linda…**` | False-positive chords; broken pairing |
| Lyric-only Songs | **8, 106, 107** (and others with 0 chords) | Valid Songs: Cifra may be lyrics-only; Trechos still derived from Letra |
| Guitar tab ASCII | Seed song **55** / similar | Must skip via `is_chord_line`-style / tab detect; not chords-over-words |
| Repeat markers | `(3x)`, `(2X)`, `x2` | Noise in Letra/Trechos; not chord tokens |
| Capo / performance notes | `Capotraste na 4ª casa` (Song **10**) | Store as comment Tag or drop from Letra |
| No Artist names | Entire livrinho | Import with optional Artist unset |

## Recommended import pipeline (spec)

One-shot seed from the livrinho markdown. Do **not** migrate the Alvo Cifras MySQL DB (map Notes). Artist stays optional.

```
livrinho-de-cifras.md
        │
        ▼
1. Split songs
   TITLE_RE + TITLE_RE2 + unbolded `N- Title`
        │
        ▼
2. Booklet cleanup (per body)
   NBSP → space; unescape \- \! \#;
   strip ** * `; unwrap [chord](url) → chord;
   Intr:/Passagem:/Solo:/Riff: → Intro: (or Tag);
   unwrap (G - C9) → G C9; strip trailing Am.;
   drop empty ##; skip guitar-tab blocks
        │
        ▼
3. Cifra parse → ChordSheetJS Song
   try ChordsOverWordsParser
   else ChordSheetParser({ song: new Song() })
   flag throw / 0-chord / leftover markdown
        │
        ▼
4. Persist Cifra = JSON.stringify(ChordSheetSerializer.serialize(song))
   Do not persist a separate lyrics original
   (unlike Alvo Cifras copying chords → lyrics)
        │
        ▼
5. Letra = join ChordLyricsPair.lyrics
   (same as Alvo Cifras song page; omit Tags / empty)
        │
        ▼
6. Initial Trechos = seed-from-cifras chunker(Letra)
   blank paragraphs, else ~4 lines
        │
        ▼
7. Editor review in Biblioteca
   especially flagged rows + swallowed “Convite à Liberdade”
   Trechos independently editable afterward
```

**Editor create/edit (ongoing, not import):** paste chords-over-words → `ChordsOverWordsParser` + preview → serialize Cifra. Optionally re-derive Letra for display. Whether Trechos re-sync after a later Cifra edit is a separate ticket ([How editors maintain lyric chunks with cifra](https://github.com/mmdfmateus/alvo-songs/issues/9)) and is out of scope here.

## Sources

- Livrinho: `programa-slides-builder/data/sources/livrinho-de-cifras.md` (headings **1–110**; unbolded `25- Convite à Liberdade` at line 841; `## **42-…`**; backticks + CifraClub links on **110**; `Intr:` on **4** / **108**; parentheticals on **1** / **42**).
- Slides chunker: `programa-slides-builder/scripts/seed-from-cifras.py` (title regexes, `is_chord_line`, `clean_lyric_line`, paragraph / 4-line chunking, seed note).
- Slides seed: `programa-slides-builder/data/song-library-seed.json` (`songCount` 110; leftover markdown/chords as cited).
- Slides persist: `programa-slides-builder/lib/db/songs.ts` (`seedSongsIfEmpty`), `lib/db/schema.ts` (`lyric_chunks`).
- Alvo Cifras parse/create: `alvocifras/src/components/AddSongForm.tsx` (`ChordsOverWordsParser`, `ChordSheetSerializer`, `chordsheetjs@^7.17.0` in `package.json`); `src/server/api/routers/songsRouter.ts` (`chords` + `lyrics: input.chords`); `prisma/schema.prisma` (`Song.chords Json`, `Song.lyrics Json`, required `artistId`).
- Alvo Cifras Letra tab: `alvocifras/src/pages/songs/[id].tsx` (`serializer.deserialize`, `ChordLyricsPair.lyrics`, `HtmlDivFormatter`).
- ChordSheetJS: [README](https://github.com/martijnversluis/ChordSheetJS/blob/master/README.md) (parsers, serialize); [ChordsOverWordsParser API](https://martijnversluis.github.io/ChordSheetJS/classes/ChordsOverWordsParser.html); [ChordSheetSerializer API](https://martijnversluis.github.io/ChordSheetJS/classes/ChordSheetSerializer.html); [Song API](https://martijnversluis.github.io/ChordSheetJS/classes/Song.html) (`lines`, `bodyParagraphs`); [ChordLyricsPair API](https://martijnversluis.github.io/ChordSheetJS/classes/ChordLyricsPair.html) (`lyrics`, `chords`); installed **7.17.0** `lib/index.js` (`CHORD_LINE_REGEX`, `ChordSheetParser.parse` / `initialize`, COW PEG `ChordLyricsLines` / `ChordWithSpacing`).
- Glossary: [`CONTEXT.md`](../../CONTEXT.md).
- Map constraint: [Alvo Cifras spec](https://github.com/mmdfmateus/alvo-songs/issues/1) Notes — initial catalog is the livrinho; do not migrate Alvo Cifras DB.
