# Alvo Cifras

Domain language for a public song catalog (cifras + letras) and COMU worship Program slides sharing one Song listing. Canonical terms are English (code/data); PT-BR is for user-facing copy only.

## Language

**Cifra**:
The canonical chords-and-lyrics content of a Song.
_UI_: Cifra
_Avoid_: chords, chord sheet, chord chart (as the name of this concept); treating the public Cifra tab as a separate stored original

**Letra**:
The lyric-only reading of a Song, derived from its Cifra by omitting chords.
_UI_: Letra
_Avoid_: lyrics (as an independently stored original); lyric sheet; treating Letra as the same as Lyric chunk

**Lyric chunk**:
One ordered, slide-sized unit of lyric text belonging to a Song. Initially derived from that Song’s Letra; thereafter independently editable.
_UI_: Trecho
_Avoid_: verse, estrofe (as the model name); slide (as the name of this concept); treating Lyric chunk as Letra or as Cifra; treating Trechos as a live view of Letra after they have been edited

**Artist**:
A named performer or group a Song may optionally credit.
_UI_: Artista
_Avoid_: band, author, compositor (unless a later subtype is needed); a free-text label on Song instead of its own entity

**Song**:
A reusable library entry with a title, a Cifra, an ordered list of lyric chunks, and an optional Artist.
_UI_: Música
_Avoid_: track, hymn (unless a later subtype is needed); using Cifra or Letra as the name of the library entry

**Song library**:
The curated collection of reusable Songs. Anyone can browse; only editors add or edit.
_UI_: Biblioteca
_Avoid_: catalog, repertoire, database; splitting public Catálogo from editor Biblioteca

**Program**:
A named, ordered sequence of sections prepared for one gathering, which can be saved, reused, and exported.
_UI_: Programa
_Avoid_: presentation, slideshow, deck, PDF (as the name of this concept)

**Section**:
One typed unit in a Program’s order; it expands into one or more slides when exported.
_UI_: Seção
_Avoid_: block, item, slide (as the name of this concept)

**Section type**:
The kind of Section. Current UI defaults (not frozen): Abertura, Música, Recados, Brincadeira, Momento — data values stay English (e.g. opening, song, announcements, game, moment).
_UI_: Tipo de seção
_Avoid_: block type, content type

**Song section**:
A Section of type song that references a Song and expands into a title slide followed by that Song’s lyric-chunk slides.
_UI_: Seção de música (still shown as Música in the Program)
_Avoid_: using “Song” alone for a placement in a Program

**Slide**:
One page in the exported slideshow (title, lyric, marker, or blank).
_UI_: Slide
_Avoid_: page, frame

**Blank slide**:
A Slide with no content, reserved for later fill-in outside the app (e.g. images in Canva).
_UI_: Slide em branco
_Avoid_: calling the blank Slide itself “Recados” or “Brincadeira”

**Announcements section**:
A Section of type announcements: a title Slide plus N blank Slides for later images/content.
_UI_: Recados
_Avoid_: modeling Recados as uploaded images inside the app

**Game section**:
A Section of type game: a title Slide, an optional label Slide, plus N blank Slides.
_UI_: Brincadeira
_Avoid_: game logic, timers, or a games content library

**Opening section**:
A Section of type opening: community name plus optional subtitle, rendered as title Slide(s) at the start of the Program.
_UI_: Abertura
_Avoid_: cover, intro deck

**Moment section**:
A Section of type moment: a named marker Slide for a non-song, non-skeleton beat in the service (e.g. prayer time).
_UI_: Momento
_Avoid_: treating Moment as a Song or as blank Slides by default

**Export**:
The action that expands a Program’s Sections into Slides and produces the downloadable PDF.
_UI_: Exportar
_Avoid_: generate, render, publish (unless a later meaning is introduced)

**Editor**:
A signed-in Google user whose email is on the allowlist; the only person who may create or edit Songs and Artists.
_UI_: editor / editores (copy, not a nav item)
_Avoid_: Role, admin, operator, User (as the name of this concept); storing Editor as an RBAC role
