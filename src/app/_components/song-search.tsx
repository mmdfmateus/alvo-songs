"use client";

export function SongSearch() {
  return (
    <form action="/musicas" method="get" className="min-w-44 flex-1">
      <input
        type="search"
        name="q"
        className="w-full rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm"
        placeholder="Procure por uma música ou artista"
        aria-label="Procure por uma música ou artista"
      />
    </form>
  );
}
