"use client";

import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function SongSearch({ className }: { className?: string }) {
  return (
    <form action="/musicas" method="get" className={className}>
      <InputGroup className="h-9 bg-muted/60">
        <InputGroupInput
          type="search"
          name="q"
          placeholder="Procure por uma música ou artista"
          aria-label="Procure por uma música ou artista"
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
