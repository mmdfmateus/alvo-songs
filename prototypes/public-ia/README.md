# PROTOTYPE — Public information architecture (v2)

Throwaway UI for [Public information architecture](https://github.com/mmdfmateus/alvo-songs/issues/10).

**Question:** What is the public (and editor) route/nav outline for Alvo Cifras?

**Baseline:** previous Variant C (Biblioteca ↔ Programas mode shell).

**References:**
- [Alvo Cifras](https://cifras.alvodamocidade.com.br/) — search, Músicas/Artistas cards, song tabs + Escutar
- [CifraClub song page](https://www.cifraclub.com.br/marcos-almeida/rio-torto/) — artist/song hierarchy, dense cifra reading

## Run

```bash
cd prototypes/public-ia && python3 -m http.server 4173
# http://localhost:4173/?variant=A
```

| Variant | Idea |
| --- | --- |
| A | Alvo browse home + mode rail |
| B | CifraClub reading focus (rail hides on song) |
| C | Hybrid: Alvo sticky header + mode pills (no rail) |

Not for `master` until a verdict is captured on the issue.
